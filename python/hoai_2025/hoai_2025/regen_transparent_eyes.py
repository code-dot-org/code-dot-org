import argparse
import asyncio
import base64
import io
import os
import sys
from pathlib import Path
from typing import Dict, List

import numpy as np
from openai import AsyncOpenAI
from PIL import Image, ImageOps

PROMPT = "Fill in the transparent eyes with an opaque white while keeping the pupil intact. Make sure that the background remains transparent."

# ---------------------- Detector thresholds ----------------------
ALPHA_HOLE_THRESH = 48
MIN_AREA_RATIO = 0.0005
MAX_AREA_RATIO = 0.12

# ---------------------- Concurrency defaults --------------------
# Scan = cheap (I/O + small CPU), allow more parallelism
MAX_SCAN_CONCURRENCY = min(32, max(8, (os.cpu_count() or 1) * 4))
# Edit = API-bound; modest to avoid rate limits
MAX_EDIT_CONCURRENCY = 4


# ---------------------- Tiny progress bars ----------------------
def _bar(stage: str, done: int, total: int, width: int = 28):
    if total <= 0:
        total = 1
    filled = int(width * done / total)
    pct = (100.0 * done) / total
    sys.stdout.write(
        f"\r[{stage:<5}] |{'█'*filled}{'.'*(width-filled)}| {done}/{total}  {pct:5.1f}%"
    )
    sys.stdout.flush()
    if done >= total:
        sys.stdout.write("\n")
        sys.stdout.flush()


# ---------------------- Detection helpers -----------------------
def _flood_fill_from_edges(transparent_like: np.ndarray) -> np.ndarray:
    h, w = transparent_like.shape
    reachable = np.zeros((h, w), dtype=bool)
    stack = []
    for x in range(w):
        if transparent_like[0, x]:
            stack.append((0, x))
            reachable[0, x] = True
        if transparent_like[h - 1, x]:
            stack.append((h - 1, x))
            reachable[h - 1, x] = True
    for y in range(h):
        if transparent_like[y, 0]:
            stack.append((y, 0))
            reachable[y, 0] = True
        if transparent_like[y, w - 1]:
            stack.append((y, w - 1))
            reachable[y, w - 1] = True
    while stack:
        cy, cx = stack.pop()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if (
                0 <= ny < h
                and 0 <= nx < w
                and not reachable[ny, nx]
                and transparent_like[ny, nx]
            ):
                reachable[ny, nx] = True
                stack.append((ny, nx))
    return reachable


def _connected_components_bool(mask: np.ndarray) -> List[np.ndarray]:
    h, w = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    comps = []
    ys, xs = np.nonzero(mask)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if visited[y, x] or not mask[y, x]:
            continue
        stack = [(y, x)]
        visited[y, x] = True
        coords = []
        while stack:
            cy, cx = stack.pop()
            coords.append((cy, cx))
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and mask[ny, nx]:
                    visited[ny, nx] = True
                    stack.append((ny, nx))
        comp = np.zeros_like(mask, dtype=bool)
        ys_c, xs_c = zip(*coords)
        comp[list(ys_c), list(xs_c)] = True
        comps.append(comp)
    return comps


def evaluate_image(im: Image.Image):
    """
    Return (passed: bool, score: dict)
    passed=True when no eligible internal transparent components remain.
    """
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    arr = np.array(im)
    alpha = arr[..., 3].astype(np.uint8)
    transparent_like = alpha <= ALPHA_HOLE_THRESH
    if not transparent_like.any():
        return True, {"filled_components": 0}

    edge_reach = _flood_fill_from_edges(transparent_like)
    internal = transparent_like & (~edge_reach)
    if not internal.any():
        return True, {"filled_components": 0}

    nz = np.nonzero(alpha > 0)
    if nz[0].size == 0:
        bbox_area = alpha.shape[0] * alpha.shape[1]
    else:
        miny, minx = int(np.min(nz[0])), int(np.min(nz[1]))
        maxy, maxx = int(np.max(nz[0])) + 1, int(np.max(nz[1])) + 1
        bbox_area = (maxy - miny) * (maxx - minx)

    comps = _connected_components_bool(internal)
    eligible = 0
    for c in comps:
        area = int(c.sum())
        r = area / max(1, bbox_area)
        if MIN_AREA_RATIO <= r <= MAX_AREA_RATIO:
            eligible += 1
    return (eligible == 0), {"filled_components": eligible}


# ---------------------- Async utilities -------------------------
async def _to_thread(fn, *args, **kwargs):
    return await asyncio.to_thread(fn, *args, **kwargs)


def _make_thumb(before: Image.Image, after: Image.Image, max_dim=256) -> Image.Image:
    if before.mode != "RGBA":
        before = before.convert("RGBA")
    if after.mode != "RGBA":
        after = after.convert("RGBA")
    b = ImageOps.contain(before, (max_dim, max_dim), Image.LANCZOS)
    a = ImageOps.contain(after, (max_dim, max_dim), Image.LANCZOS)
    canvas = Image.new(
        "RGBA", (b.width + a.width + 6, max(b.height, a.height)), (255, 255, 255, 0)
    )
    canvas.paste(b, (0, (canvas.height - b.height) // 2))
    canvas.paste(a, (b.width + 6, (canvas.height - a.height) // 2))
    return canvas


# ---------------------- OpenAI (async) --------------------------
async def edit_with_openai_async(
    client: AsyncOpenAI, png_bytes: bytes, model: str, size: str
) -> bytes:
    result = await client.images.edit(
        model=model,
        image=[("image.png", png_bytes)],
        prompt=PROMPT,
        size=size,
        n=1,
    )
    b64 = result.data[0].b64_json
    return base64.b64decode(b64)


# ---------------------- Pipelines -------------------------------
async def scan_one_async(sem_scan: asyncio.Semaphore, path: Path):
    async with sem_scan:
        im = await _to_thread(Image.open, path)
        try:
            im_rgba = im.convert("RGBA")
            passed, score = evaluate_image(im_rgba)
            return (path, passed, score.get("filled_components", 0))
        finally:
            im.close()


async def edit_one_async(
    sem_edit: asyncio.Semaphore,
    client: AsyncOpenAI,
    path_in: Path,
    input_root: Path,
    output_root: Path,
    size: str,
    model: str,
    thumbs_dir: Path,
    verbose: bool = False,
):
    rel = path_in.relative_to(input_root)
    outp = output_root / rel
    outp.parent.mkdir(parents=True, exist_ok=True)

    # Load original
    im_before = await _to_thread(Image.open, path_in)
    try:
        im_before_rgba = im_before.convert("RGBA")
        buf = io.BytesIO()
        im_before_rgba.save(buf, format="PNG")
        png_bytes = buf.getvalue()
    finally:
        im_before.close()

    # Throttled OpenAI request
    async with sem_edit:
        try:
            edited_bytes = await edit_with_openai_async(
                client, png_bytes, model=model, size=size
            )
        except Exception as e:
            if verbose:
                print(f"[error] OpenAI edit failed for {path_in}: {e}")
            # Treat edit errors as failing post-edit (conservative)
            return (str(rel), "", "error", 1, "")

    # Save edited
    await _to_thread(outp.write_bytes, edited_bytes)

    # Evaluate result
    im_after = Image.open(io.BytesIO(edited_bytes)).convert("RGBA")
    passed, score = evaluate_image(im_after)

    # Thumbnail
    thumbs_dir.mkdir(parents=True, exist_ok=True)
    thumb_name = rel.as_posix().replace("/", "_")
    thumb_path = (thumbs_dir / thumb_name).with_suffix(".png")
    try:
        thumb = _make_thumb(im_before_rgba, im_after)
        await _to_thread(thumb.save, thumb_path)
        thumb_rel = str(thumb_path)
    except Exception as e:
        if verbose:
            print(f"[warn] thumbnail failed for {path_in}: {e}")
        thumb_rel = ""

    status = "pass" if passed else "fail"
    return (str(rel), str(outp), status, score.get("filled_components", 0), thumb_rel)


# ---------------------- Main (async) ----------------------------
async def amain(args):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("Missing OPENAI_API_KEY in environment.")

    input_root = Path(args.input).resolve()
    if not input_root.is_dir():
        raise SystemExit(f"Input directory not found: {input_root}")

    output_root = Path(args.output).resolve()
    output_root.mkdir(parents=True, exist_ok=True)

    thumbs_dir = output_root / "_previews"
    report_html = output_root / "report.html"

    # Gather PNGs
    files = sorted([p for p in input_root.rglob("*.png")])
    if not files:
        print("No PNGs found.")
        return

    # Track per-subdir stats
    # key = top-level subdir under input_root (first path segment)
    def subkey(p: Path) -> str:
        rel = p.relative_to(input_root).parts
        return rel[0] if len(rel) >= 1 else "."

    perdir_total: Dict[str, int] = {}
    perdir_initial_fail: Dict[str, int] = {}
    perdir_post_fail: Dict[str, int] = {}

    for p in files:
        k = subkey(p)
        perdir_total[k] = perdir_total.get(k, 0) + 1

    # --------- SCAN PHASE ----------
    print(f"Scanning {len(files)} image(s) …")
    sem_scan = asyncio.Semaphore(MAX_SCAN_CONCURRENCY)
    scan_tasks = [asyncio.create_task(scan_one_async(sem_scan, p)) for p in files]

    failing: List[Path] = []
    scanned = 0
    _bar("scan", scanned, len(files))
    for coro in asyncio.as_completed(scan_tasks):
        path, passed, remain = await coro
        scanned += 1
        if not passed:
            failing.append(path)
            perdir_initial_fail[subkey(path)] = (
                perdir_initial_fail.get(subkey(path), 0) + 1
            )
        _bar("scan", scanned, len(files))

    if not failing:
        print(f"All {len(files)} images already pass. Nothing to edit.")
        with open(report_html, "w") as f:
            f.write(
                "<html><head><meta charset='utf-8'><title>OpenAI Eye Edit Report</title></head><body>"
            )
            f.write("<h2>No edits required</h2></body></html>")
        return

    print(f"Editing {len(failing)} image(s) that failed initial scan …")

    # --------- EDIT PHASE ----------
    client = AsyncOpenAI(api_key=api_key)
    sem_edit = asyncio.Semaphore(MAX_EDIT_CONCURRENCY)

    edit_tasks = [
        asyncio.create_task(
            edit_one_async(
                sem_edit,
                client,
                p,
                input_root,
                output_root,
                size=args.size,
                model=args.model,
                thumbs_dir=thumbs_dir,
                verbose=args.verbose,
            )
        )
        for p in failing
    ]

    rows = []
    edited = 0
    _bar("edit", edited, len(edit_tasks))
    for coro in asyncio.as_completed(edit_tasks):
        rel, outp, status, remain, thumb = await coro
        rows.append((rel, outp, status, remain, thumb))
        # per-subdir post-fail (count remaining>0 OR error as failing)
        k = rel.split("/", 1)[0] if "/" in rel else rel.split("\\", 1)[0]
        if status != "pass":  # 'fail' or 'error'
            perdir_post_fail[k] = perdir_post_fail.get(k, 0) + 1
        edited += 1
        _bar("edit", edited, len(edit_tasks))

    # --------- REPORTING ----------
    # HTML with per-subdir percentages
    def pct(num, den):
        den = max(1, den)
        return f"{(100.0 * num) / den:.1f}%"

    # Compute overall
    total_all = sum(perdir_total.values())
    initial_fail_all = sum(perdir_initial_fail.get(k, 0) for k in perdir_total.keys())
    post_fail_all = sum(perdir_post_fail.get(k, 0) for k in perdir_total.keys())

    with open(report_html, "w") as f:
        f.write(
            "<html><head><meta charset='utf-8'><title>OpenAI Eye Edit Report</title></head><body>"
        )
        f.write("<h2>OpenAI Eye Edit Report</h2>")

        # Summary block
        f.write("<h3>Summary by subdirectory</h3>")
        f.write("<table border='1' cellspacing='0' cellpadding='6'>")
        f.write(
            "<tr><th>Subdirectory</th><th>Total</th>"
            "<th>Initially flagged</th><th>% initially flagged</th>"
            "<th>Still flagged after edit</th><th>% still flagged after edit</th></tr>"
        )
        for k in sorted(perdir_total.keys()):
            total = perdir_total[k]
            initf = perdir_initial_fail.get(k, 0)
            postf = perdir_post_fail.get(k, 0)
            f.write("<tr>")
            f.write(
                f"<td>{k}</td><td>{total}</td>"
                f"<td>{initf}</td><td>{pct(initf, total)}</td>"
                f"<td>{postf}</td><td>{pct(postf, total)}</td>"
            )
            f.write("</tr>")
        # overall row
        f.write("<tr style='font-weight:bold;background:#f3f3f3'>")
        f.write(
            f"<td>ALL</td><td>{total_all}</td>"
            f"<td>{initial_fail_all}</td><td>{pct(initial_fail_all, total_all)}</td>"
            f"<td>{post_fail_all}</td><td>{pct(post_fail_all, total_all)}</td>"
        )
        f.write("</tr>")
        f.write("</table>")

        # Edited items table
        f.write("<h3>Edited Files</h3>")
        f.write("<table border='1' cellspacing='0' cellpadding='6'>")
        f.write(
            "<tr><th>Status</th><th>Remaining</th><th>Original</th><th>Regenerated</th><th>Preview</th></tr>"
        )
        for rel, outp, status, remain, thumb in rows:
            f.write(
                f"<tr><td>{status}</td><td>{remain}</td><td>{rel}</td><td>{outp}</td>"
            )
            if thumb and Path(thumb).exists():
                f.write(
                    f"<td><img src='{Path(thumb).name}' style='max-width:360px'></td></tr>"
                )
            else:
                f.write("<td>(no preview)</td></tr>")
        f.write("</table></body></html>")

    print(f"\nWrote:\n  {report_html}")


def main():
    ap = argparse.ArgumentParser(
        description="Scan images, edit failing ones with OpenAI, evaluate, and report."
    )
    ap.add_argument("--input", required=True)
    ap.add_argument("--output", required=True)
    ap.add_argument("--model", default="gpt-image-1")
    ap.add_argument("--size", default="1024x1024")
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument(
        "-k",
        "--openai-key",
        dest="openai_key",
        default=None,
        help="OpenAI API key (overrides env)",
    )

    args = ap.parse_args()

    # Prefer explicit key; otherwise env must be set
    if args.openai_key:
        os.environ["OPENAI_API_KEY"] = args.openai_key

    # then call your asyncio entrypoint, e.g.:
    import asyncio

    asyncio.run(amain(args))


if __name__ == "__main__":
    main()
