# python/hoai_2025/hoai_2025/identify_transparent_eyes.py
# Identifies images that contain *internal* transparent holes (e.g., eye whites)
# and copies them to a timestamped sweep folder while preserving the folder
# structure relative to the input root.
#
# Usage:
#   uv run python -m hoai_2025.identify_transparent_eyes \
#       --input ./output/dance_party_animal_heads_v2
#
#   uv run python -m hoai_2025.identify_transparent_eyes \
#       --input ./output/dance_party_animal_heads_v2 \
#       --output-root ./output
#
# This will create:
#   ./output/eyes_sweep_YYYYmmdd_HHMMSS/...
# mirroring the subfolder paths of images that contain internal transparent holes.

from pathlib import Path
from typing import Tuple, List
import numpy as np
from PIL import Image
import argparse
import os
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime

ALPHA_HOLE_THRESH = 48

# argparse compatibility for --verbose / --no-verbose
try:
    BooleanOptionalAction = argparse.BooleanOptionalAction  # Py 3.9+
except AttributeError:
    BooleanOptionalAction = None


def _connected_components_bool(mask: np.ndarray) -> List[np.ndarray]:
    """Tiny 4-connected components on a boolean mask; returns list of masks."""
    h, w = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    components = []

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
        components.append(comp)
    return components


def _flood_fill_from_edges(transparent: np.ndarray) -> np.ndarray:
    """Flood-fill transparency from edges to mark true background."""
    h, w = transparent.shape
    reachable = np.zeros((h, w), dtype=bool)
    stack = []

    for x in range(w):
        if transparent[0, x]:
            stack.append((0, x))
            reachable[0, x] = True
        if transparent[h - 1, x]:
            stack.append((h - 1, x))
            reachable[h - 1, x] = True

    for y in range(h):
        if transparent[y, 0]:
            stack.append((y, 0))
            reachable[y, 0] = True
        if transparent[y, w - 1]:
            stack.append((y, w - 1))
            reachable[y, w - 1] = True

    while stack:
        cy, cx = stack.pop()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < h and 0 <= nx < w and not reachable[ny, nx] and transparent[ny, nx]:
                reachable[ny, nx] = True
                stack.append((ny, nx))
    return reachable


def _nontransparent_bbox(alpha: np.ndarray) -> Tuple[int, int, int, int]:
    """Return bbox of non-transparent (>0 alpha) region; fall back to full image if empty."""
    nz = np.nonzero(alpha > 0)
    if nz[0].size == 0:
        h, w = alpha.shape
        return (0, 0, h, w)
    miny, minx = int(np.min(nz[0])), int(np.min(nz[1]))
    maxy, maxx = int(np.max(nz[0])) + 1, int(np.max(nz[1])) + 1
    return (miny, minx, maxy, maxx)


def detect_internal_transparent_holes(
    im: Image.Image,
    min_area_ratio: float = 0.0005,
    max_area_ratio: float = 0.12,
) -> int:
    """
    Detect internal transparent components (holes) that would be eligible
    to be filled in the fixer script, and return the number of such components.
    This **does not** modify the image.
    """
    if im.mode != "RGBA":
        im = im.convert("RGBA")

    arr = np.array(im)
    alpha = arr[..., 3].astype(np.uint8)
    transparent_like = alpha <= ALPHA_HOLE_THRESH
    if not transparent_like.any():
        return 0

    by0, bx0, by1, bx1 = _nontransparent_bbox(alpha)
    bbox_h = max(1, by1 - by0)
    bbox_w = max(1, bx1 - bx0)
    bbox_area = bbox_h * bbox_w

    edge_reachable = _flood_fill_from_edges(transparent_like)
    internal_holes = transparent_like & (~edge_reachable)
    if not internal_holes.any():
        return 0

    comps = _connected_components_bool(internal_holes)

    # Count components we would consider "eye-like" by area ratio
    eligible = 0
    for comp in comps:
        area = int(comp.sum())
        ratio = area / bbox_area
        if min_area_ratio <= ratio <= max_area_ratio:
            eligible += 1
    return eligible


def process_png_for_detection(
    path_in: Path,
    sweep_root: Path,
    input_root: Path,
    min_area_ratio: float,
    max_area_ratio: float,
    verbose: bool = False,
) -> Tuple[bool, int]:
    """
    For one PNG, detect internal transparent holes.
    If at least one eligible component is found, copy the original image
    into the sweep_root, preserving the relative path.
    Returns (copied, num_components).
    """
    try:
        with Image.open(path_in) as im:
            n = detect_internal_transparent_holes(
                im,
                min_area_ratio=min_area_ratio,
                max_area_ratio=max_area_ratio,
            )

        if n > 0:
            rel = path_in.relative_to(input_root)
            dest = sweep_root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)

            # Copy image bits; re-open to avoid using the closed context manager image
            with Image.open(path_in) as src_im:
                src_im.save(dest)

            if verbose:
                print(f"[match] {path_in} -> {dest} (found {n} hole(s))")
            return True, n
        else:
            if verbose:
                print(f"[skip ] {path_in} (no eligible holes)")
            return False, 0
    except Exception as e:
        if verbose:
            print(f"[error] {path_in}: {e}")
        return False, 0


def _process_path_worker(args):
    """Top-level worker for ProcessPoolExecutor (must be picklable)."""
    (
        path_in_str,
        sweep_root_str,
        input_root_str,
        min_area_ratio,
        max_area_ratio,
        verbose,
    ) = args
    path_in = Path(path_in_str)
    sweep_root = Path(sweep_root_str)
    input_root = Path(input_root_str)
    return process_png_for_detection(
        path_in,
        sweep_root,
        input_root,
        min_area_ratio=min_area_ratio,
        max_area_ratio=max_area_ratio,
        verbose=verbose,
    )


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Identify RGBA PNGs with internal transparent holes (eye whites) and "
            "copy them into a timestamped sweep folder, preserving folder structure."
        )
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Input directory to scan recursively (e.g., ./output/dance_party_animal_heads_v2)",
    )
    parser.add_argument(
        "--output-root",
        default="output",
        help=(
            "Root directory under which the eyes_sweep_YYYYmmdd_HHMMSS folder "
            "will be created (default: ./output)."
        ),
    )
    parser.add_argument(
        "--min-area-ratio",
        type=float,
        default=0.0005,
        help="Minimum area ratio for a hole to be considered (default: 0.0005).",
    )
    parser.add_argument(
        "--max-area-ratio",
        type=float,
        default=0.12,
        help="Maximum area ratio for a hole to be considered (default: 0.12).",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=None,
        help="Number of worker processes (default: use os.cpu_count()).",
    )
    if BooleanOptionalAction is not None:
        parser.add_argument(
            "--verbose",
            action=BooleanOptionalAction,
            default=True,
            help="Print per-file logs (default: True).",
        )
    else:
        parser.add_argument(
            "--verbose",
            dest="verbose",
            action="store_true",
            default=True,
            help="Enable per-file logs (default: True).",
        )
        parser.add_argument(
            "--no-verbose",
            dest="verbose",
            action="store_false",
            help="Disable per-file logs.",
        )

    args = parser.parse_args()

    input_root = Path(args.input).resolve()
    if not input_root.is_dir():
        raise SystemExit(f"Input directory not found: {input_root}")

    output_root = Path(args.output_root).resolve()
    output_root.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sweep_root = output_root / f"eyes_sweep_{timestamp}"
    sweep_root.mkdir(parents=True, exist_ok=True)

    files = list(input_root.rglob("*.png"))
    total = len(files)
    if total == 0:
        print("No PNGs found.")
        return

    if args.verbose:
        print(f"Scanning {total} PNG(s) under {input_root}")
        print(f"Matching files will be copied under: {sweep_root}")

    workers = args.workers or (os.cpu_count() or 1)
    workers = max(1, workers)

    copied = 0
    total_components = 0

    if workers == 1:
        # Serial processing
        for p in files:
            did_copy, n = process_png_for_detection(
                p,
                sweep_root,
                input_root,
                min_area_ratio=args.min_area_ratio,
                max_area_ratio=args.max_area_ratio,
                verbose=args.verbose,
            )
            copied += int(did_copy)
            total_components += n
    else:
        # Parallel processing
        job_args = [
            (
                str(p),
                str(sweep_root),
                str(input_root),
                args.min_area_ratio,
                args.max_area_ratio,
                args.verbose,
            )
            for p in files
        ]

        with ProcessPoolExecutor(max_workers=workers) as ex:
            futures = []
            for args_tuple in job_args:
                futures.append(ex.submit(_process_path_worker, args_tuple))

            done_count = 0
            for fut in as_completed(futures):
                try:
                    did_copy, n = fut.result()
                    copied += int(did_copy)
                    total_components += n
                except Exception as e:
                    if args.verbose:
                        print(f"[error] Worker exception: {e}")
                done_count += 1
                if not args.verbose and (done_count % 50 == 0 or done_count == total):
                    print(f"[progress] {done_count}/{total} processed")

    print()
    print(f"Scanned PNGs: {total}")
    print(f"Matched files (with internal holes): {copied}")
    print(f"Total eligible hole components: {total_components}")
    print(f"Sweep folder: {sweep_root}")


if __name__ == "__main__":
    main()
