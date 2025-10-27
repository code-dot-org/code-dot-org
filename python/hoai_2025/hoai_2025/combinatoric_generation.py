# FINAL PARALLEL GENERATOR (Colab, with robust body/secondary/tertiary colors)

import os
import io
import base64
import uuid
import json
import random
import asyncio
import argparse
from pathlib import Path
from slugify import slugify
from PIL import Image
import numpy as np
from tqdm import tqdm
from openai import AsyncOpenAI

parser = argparse.ArgumentParser(
        prog='HoAI 2025 Image Generation Script',
        description='Generates dancer images')

parser.add_argument('-a', '--attire', action='append', default=[])
parser.add_argument('-n', '--animal', action='append', default=[])
parser.add_argument('-j', '--adjective', action='append', default=[])
parser.add_argument('-k', '--key', action='store', default=None)

args = parser.parse_args()

# ---------------- CONFIG ----------------
# Lists
adjectives = args.adjective
animals    = args.animal
attire     = args.attire

# Per-combo duplicate count -> 00, 01, ... (n variants per combo)
REPEATS_PER_COMBO = 5

# Image settings
IMG_W, IMG_H = 1024, 1024
MODEL = "gpt-image-1"
BACKGROUND = "transparent"

# Throughput knobs
CONCURRENCY = 4
RETRIES = 5
BASE_BACKOFF = 1.0  # seconds

# -------- Robust color picker (v2) TUNABLES --------
ALPHA_WEIGHT_FOR_PALETTE   = True
QUANTIZE_FOR_PALETTE       = 12      # or None
EDGE_BAND_PX               = 64      # outer band thickness to sample background
BG_DELTAE_EXCLUDE          = 10.0    # ΔE cutoff to treat color as background-like
BG_EDGE_DOMINANCE_MIN_PCT  = 6.0     # only accept edge colors that dominate the band
L_MIN, L_MAX               = 25.0, 97.5
CENTER_WEIGHT              = 1.25    # >1 biases toward center
STRIPE_PENALTY_WEIGHT      = 0.45    # penalize elongated (stripe-like) colors
DELTAE_UNIQUENESS_FLOOR    = 6.0     # min ΔE difference between chosen colors

# thresholds for secondary/tertiary selection
SECONDARY_MIN_DELTAE       = 18.0
MIN_PERCENT_FOR_SECONDARY  = 0.5
MIN_PERCENT_FOR_TERTIARY   = 0.2

# Fallback if no visible pixels
OFF_WHITE_HEX  = "#E6E6E6"

# Output folder in ../output
DRIVE_SUBDIR = "dance_party_animal_heads_v2"
OUTDIR = Path(os.path.dirname(__file__)) / ".." / "output" / DRIVE_SUBDIR

# Subfolders by name shape
ANIMAL_DIR            = OUTDIR / "animal"
ANIMAL_ATTIRE_DIR     = OUTDIR / "animal-attire"
ADJ_ANIMAL_ATTIRE_DIR = OUTDIR / "adjective-animal-attire"
# ---------------------------------------

# API client
key = args.key or os.getenv("OPENAI_API_KEY")
aclient = AsyncOpenAI(api_key=key)

def ensure_dirs():
    OUTDIR.mkdir(parents=True, exist_ok=True)
    ANIMAL_DIR.mkdir(parents=True, exist_ok=True)
    ANIMAL_ATTIRE_DIR.mkdir(parents=True, exist_ok=True)
    ADJ_ANIMAL_ATTIRE_DIR.mkdir(parents=True, exist_ok=True)

# ---------- sRGB -> Lab utilities (ΔE76) ----------
def srgb_to_linear(c):
    c = np.clip(c, 0.0, 1.0)
    a = c <= 0.04045
    out = np.empty_like(c)
    out[a] = c[a] / 12.92
    out[~a] = ((c[~a] + 0.055) / 1.055) ** 2.4
    return out

def rgb_to_xyz(rgb):  # rgb in 0..1, shape (N,3)
    r, g, b = rgb[:,0], rgb[:,1], rgb[:,2]
    r_lin, g_lin, b_lin = srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b)
    X = 0.4124564*r_lin + 0.3575761*g_lin + 0.1804375*b_lin
    Y = 0.2126729*r_lin + 0.7151522*g_lin + 0.0721750*b_lin
    Z = 0.0193339*r_lin + 0.1191920*g_lin + 0.9503041*b_lin
    return np.stack([X, Y, Z], axis=1)

def xyz_to_lab(xyz):
    Xn, Yn, Zn = 0.95047, 1.00000, 1.08883  # D65 reference white
    x = xyz[:,0] / Xn
    y = xyz[:,1] / Yn
    z = xyz[:,2] / Zn
    eps = (6/29)**3
    k = (29/6)**2 / 3
    def f(t):
        out = np.empty_like(t)
        mask = t > eps
        out[mask] = np.cbrt(t[mask])
        out[~mask] = k*t[~mask] + 4/29
        return out
    fx, fy, fz = f(x), f(y), f(z)
    L = 116*fy - 16
    a = 500*(fx - fy)
    b = 200*(fy - fz)
    return np.stack([L, a, b], axis=1)

def rgb_to_lab(rgb_u8):
    rgb = rgb_u8.astype(np.float32) / 255.0
    return xyz_to_lab(rgb_to_xyz(rgb))

def delta_e76(lab1, lab2):
    diff = lab2 - lab1[None, :]
    return np.sqrt(np.sum(diff*diff, axis=1))

# ---------- Prompt & naming ----------
def build_prompt(theme_desc: str) -> str:
    return (
        "Create one non-human character head for Code.org’s Dance Party.\n"
        f"Canvas & Size: exactly {IMG_W} px wide × {IMG_H} px tall.\n"
        "Focus: Show only the head and face, no body, no neck, no shoulders, no background. The head should be centered and fill most of the image.\n"
        "Head Shapes: Use simple geometric/playful shapes matching the theme.\n"
        "Eyes & Mouths: Bold and expressive; varied shapes. If eyes are white, must be colored white and not transparent. \n"
        "Extras: Animal ears, antlers, hair/feather tufts, hats, bows — keep simple, flat, 1–4 colors.\n"
        "Proportions: Eyes and mouth oversized and expressive.\n"
        "Background: transparent PNG only. Entire head visible and centered, nothing cropped.\n"
        f"Theme: {theme_desc}.\n"
        "Art style: Flat vector color fills, no outlines, no shading/gradients, crisp edges, bold simple shapes, perfect left-right symmetry. Head must be completely colored in, no transparent pixels within head. \n"
        "Framing: small uniform margin; head fills most of the canvas."
    )

def base_name(animal: str, adj: str | None, att: str | None, v: int) -> str:
    parts = [slugify(animal, separator="-")]
    if att:
        parts.append(slugify(att, separator="-"))               # animal-attire
    if adj:
        parts.insert(0, slugify(adj, separator="-"))            # adjective-animal-attire
    parts.append(f"{v:02d}")
    return "-".join(parts)

def destination_dir(adj: str | None, animal: str, att: str | None) -> Path:
    if adj is None and att is None:
        return ANIMAL_DIR
    if adj is None and att is not None:
        return ANIMAL_ATTIRE_DIR
    return ADJ_ANIMAL_ATTIRE_DIR  # adj and att present

# ---------- Plan builder in required order ----------
def build_plan():
    """
    Yields tuples (adj_or_None, animal, att_or_None, desc, title) in this order per animal:
      1) animal
      2) animal + attire
      3) adjective + animal + attire
    """
    for animal in animals:
        yield (None, animal, None, f"{animal}", f"{animal.title()}")
        for att in attire:
            yield (None, animal, att, f"{animal} in {att}", f"{animal.title()} In {att.title()}")
            for adj in adjectives:
                yield (adj, animal, att, f"{adj} {animal} in {att}", f"{adj.title()} {animal.title()} In {att.title()}")

# ---------- Resume (scan all folders) ----------
def _norm(x):
    if x is None:
        return None
    if isinstance(x, str):
        s = x.strip()
        if s == "" or s.lower() in {"none", "null"}:
            return None
        return s
    return x

def scan_completed_variants():
    """
    Look for *-metadata.json in OUTDIR and the three subfolders.
    Return { (adj, animal, att): set(variant_int) }.
    """
    completed = {}
    for folder in [OUTDIR, ANIMAL_DIR, ANIMAL_ATTIRE_DIR, ADJ_ANIMAL_ATTIRE_DIR]:
        if not folder.exists():
            continue
        for meta_path in folder.glob("*-metadata.json"):
            try:
                meta = json.loads(meta_path.read_text())
            except Exception:
                continue
            adj = _norm(meta.get("adjective"))
            animal = _norm(meta.get("animal"))
            att = _norm(meta.get("attire"))
            var = meta.get("variant")
            try:
                var = int(var)
            except Exception:
                continue
            key = (adj, animal, att)
            completed.setdefault(key, set()).add(var)
    return completed

def unique_plan(plan_iterable):
    """Deduplicate (adj, animal, att) while preserving order."""
    seen = set()
    unique = []
    for adj, animal, att, desc, title in plan_iterable:
        key = (_norm(adj), _norm(animal), _norm(att))
        if key in seen:
            continue
        seen.add(key)
        unique.append((adj, animal, att, desc, title))
    return unique

# ---------- Robust palette extraction (v2) ----------
def _extract_palette_robust_v2_from_image(img: Image.Image):
    """Return (dominant/body, secondary, tertiary) with:
       - smaller outer-band background exclusion (dominance-checked)
       - Lab lightness gating
       - center weighting
       - stripe penalty (penalize elongated color footprints)
       - uniqueness floor for secondary/tertiary
    """
    im = img.convert("RGBA")

    # Optional quantization to reduce edge noise
    if QUANTIZE_FOR_PALETTE and QUANTIZE_FOR_PALETTE > 0:
        rgb_q = im.convert("RGB").quantize(colors=QUANTIZE_FOR_PALETTE, method=Image.MEDIANCUT).convert("RGB")
        a = im.getchannel("A")
        im = Image.merge("RGBA", (*rgb_q.split(), a))

    arr = np.array(im)
    H, W = arr.shape[:2]
    RGB, A = arr[..., :3], arr[..., 3]
    V = A > 0
    if not V.any():
        return (OFF_WHITE_HEX, OFF_WHITE_HEX, OFF_WHITE_HEX)

    # ----- Background candidates (edge band) -----
    band = max(32, min(EDGE_BAND_PX, min(H, W)//4))
    band_mask = np.zeros((H, W), dtype=bool)
    band_mask[:band,:]=True
    band_mask[-band:,:]=True
    band_mask[:,:band]=True
    band_mask[:,-band:]=True
    edge_vis = band_mask & V

    bg_labs = np.zeros((0,3), dtype=np.float32)
    if edge_vis.any():
        edge_rgb = RGB[edge_vis].reshape(-1,3)
        edge_a   = A[edge_vis].astype(np.float32) / 255.0
        packed = (edge_rgb[:,0].astype(np.uint32)<<16) | (edge_rgb[:,1].astype(np.uint32)<<8) | edge_rgb[:,2].astype(np.uint32)
        uniq, inv = np.unique(packed, return_inverse=True)
        counts = np.zeros(len(uniq), dtype=np.float64)
        np.add.at(counts, inv, edge_a)
        total = counts.sum() if counts.sum() > 0 else 1.0
        pct   = (counts / total) * 100.0
        keep_bg = pct >= BG_EDGE_DOMINANCE_MIN_PCT
        rs = ((uniq >> 16) & 0xFF).astype(np.uint8)
        gs = ((uniq >> 8)  & 0xFF).astype(np.uint8)
        bs = ( uniq        & 0xFF).astype(np.uint8)
        bg_colors = np.stack([rs, gs, bs], axis=1)[keep_bg]
        if bg_colors.size:
            bg_labs = rgb_to_lab(bg_colors)

    # ----- Unique visible colors -----
    rgb_all = RGB[V]
    a_all   = A[V].astype(np.float32) / 255.0
    uniq_rgb, inv_all = np.unique(rgb_all, axis=0, return_inverse=True)
    labs_all = rgb_to_lab(uniq_rgb)
    L = labs_all[:,0]

    keep = (L >= L_MIN) & (L <= L_MAX)
    if bg_labs.shape[0] > 0:
        min_de = np.full((len(uniq_rgb),), np.inf, dtype=np.float32)
        for bg in bg_labs:
            d = delta_e76(bg, labs_all)
            min_de = np.minimum(min_de, d)
        keep &= (min_de >= BG_DELTAE_EXCLUDE)
    if not keep.any():
        keep = (L >= L_MIN) & (L <= 100.0)
    if not keep.any():
        keep = np.ones_like(keep, dtype=bool)

    # ----- Center weighting + counts -----
    Y, X = np.mgrid[0:H, 0:W]
    cy, cx = (H-1)/2.0, (W-1)/2.0
    dist = np.sqrt(((Y-cy)/H)**2 + ((X-cx)/W)**2)
    center_w = (1.0 + CENTER_WEIGHT * (1.0 - dist))[V]
    weights = (a_all if ALPHA_WEIGHT_FOR_PALETTE else np.ones_like(a_all)) * center_w

    counts2 = np.zeros(len(uniq_rgb), dtype=np.float64)
    add_mask = keep[inv_all]
    np.add.at(counts2, inv_all[add_mask], weights[add_mask])
    if counts2.sum() == 0:
        np.add.at(counts2, inv_all, weights)

    # ----- Stripe penalty -----
    vis_idx = np.where(V.ravel())[0]
    step = max(1, (len(vis_idx)//200000))
    sel = vis_idx[::step]
    yy = sel // W
    xx = sel % W
    ci = inv_all[::step]
    max_idx = len(uniq_rgb)
    cnt = np.bincount(ci, minlength=max_idx).astype(np.float64)
    sx  = np.bincount(ci, weights=xx, minlength=max_idx)
    sy  = np.bincount(ci, weights=yy, minlength=max_idx)
    sxx = np.bincount(ci, weights=xx*xx, minlength=max_idx)
    syy = np.bincount(ci, weights=yy*yy, minlength=max_idx)
    with np.errstate(divide='ignore', invalid='ignore'):
        varx = np.maximum(0.0, (sxx/cnt) - (sx/cnt)**2)
        vary = np.maximum(0.0, (syy/cnt) - (sy/cnt)**2)
    stdx = np.sqrt(varx)
    stdy = np.sqrt(vary)
    ratio = np.minimum(stdx, stdy) / np.maximum(stdx, stdy + 1e-9)
    ratio[np.isnan(ratio)] = 0.0
    penalty = STRIPE_PENALTY_WEIGHT * (1.0 - ratio)
    score = counts2 * (1.0 - penalty)

    # ----- Pick body / secondary / tertiary -----
    dom_idx = int(np.argmax(score))
    dom_rgb = uniq_rgb[dom_idx]
    dom_hex = f"#{dom_rgb[0]:02X}{dom_rgb[1]:02X}{dom_rgb[2]:02X}"

    total_kept = counts2.sum() if counts2.sum() > 0 else 1.0
    perc = (counts2 / total_kept) * 100.0
    chosen = [dom_idx]
    chosen_lab = [labs_all[dom_idx]]

    def pick_next(min_pct, min_de_vs_dom):
        mask = np.ones(len(uniq_rgb), dtype=bool)
        mask[chosen] = False
        mask &= keep & (perc >= min_pct)
        for lab in chosen_lab:
            mask &= (delta_e76(lab, labs_all) >= min_de_vs_dom)
        cands = np.where(mask)[0]
        if cands.size == 0:
            remaining = [i for i in np.argsort(-score) if i not in chosen]
            return int(remaining[0] if remaining else chosen[-1])
        return int(cands[np.argmax(score[cands])])

    sec_idx = pick_next(MIN_PERCENT_FOR_SECONDARY, SECONDARY_MIN_DELTAE)
    chosen.append(sec_idx)
    chosen_lab.append(labs_all[sec_idx])

    ter_idx = pick_next(MIN_PERCENT_FOR_TERTIARY, DELTAE_UNIQUENESS_FLOOR)
    for _ in range(3):
        if len({dom_idx, sec_idx, ter_idx}) == 3:
            break
        remaining = [i for i in np.argsort(-score) if i not in {dom_idx, sec_idx}]
        ter_idx = remaining[0] if remaining else ter_idx

    sec_rgb = uniq_rgb[sec_idx]
    ter_rgb = uniq_rgb[ter_idx]
    sec_hex = f"#{sec_rgb[0]:02X}{sec_rgb[1]:02X}{sec_rgb[2]:02X}"
    ter_hex = f"#{ter_rgb[0]:02X}{ter_rgb[1]:02X}{ter_rgb[2]:02X}"
    return (dom_hex, sec_hex, ter_hex)

def extract_palette(image_path: Path):
    """Wrapper used by the generator to compute body/secondary/tertiary."""
    with Image.open(image_path).convert("RGBA") as im:
        return _extract_palette_robust_v2_from_image(im)

# ---------- I/O helpers ----------
def save_png(b64: str, out_path: Path):
    raw = base64.b64decode(b64)
    with Image.open(io.BytesIO(raw)) as im:
        im = im.convert("RGBA")
        if im.size != (IMG_W, IMG_H):
            im = im.resize((IMG_W, IMG_H), Image.LANCZOS)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        im.save(out_path, format="PNG")

def metadata_record(adj, animal, att, v, img_path: Path, prompt: str,
                    body_hex: str, secondary_hex: str, tertiary_hex: str, title: str, desc: str):
    tags = [animal] + ([adj] if adj else []) + ([att] if att else [])
    return {
        "id": str(uuid.uuid4()),
        "file_name": img_path.name,
        "title": title,
        "description": desc,
        "tags": tags,
        "width": IMG_W,
        "height": IMG_H,
        "orientation": "portrait",
        "color_palette": [],
        "people_count": 0,
        "copy_space": False,
        "background": "transparent",
        "adjective": adj,   # null in JSON if None
        "animal": animal,
        "attire": att,      # null in JSON if None
        "variant": v,
        "prompt_used": prompt,
        "body_color": body_hex,
        "secondary_color": secondary_hex,
        "tertiary_color": tertiary_hex,
    }

# ---------- Parallel worker ----------
async def generate_for_combo(adj, animal, att, title, desc, missing_variants, sem: asyncio.Semaphore):
    if not missing_variants:
        return 0

    prompt = build_prompt(desc)
    n = len(missing_variants)

    async with sem:
        delay = BASE_BACKOFF
        for attempt in range(1, RETRIES + 1):
            try:
                resp = await aclient.images.generate(
                    model=MODEL,
                    prompt=prompt,
                    size=f"{IMG_W}x{IMG_H}",
                    n=n,
                    background=BACKGROUND,
                )
                break
            except Exception as e:
                if attempt == RETRIES:
                    print(f"[ERROR] {animal}-{adj or 'none'}-{att or 'none'}: {e}")
                    return 0
                await asyncio.sleep(delay + random.uniform(0, 0.5))
                delay = min(delay * 2, 20)

    created = 0
    dest_dir = destination_dir(adj, animal, att)

    for b64, v in zip((d.b64_json for d in resp.data), missing_variants):
        base = base_name(animal, adj, att, v)  # (animal, adj, att, v)
        img_path  = dest_dir / f"{base}.png"
        meta_path = dest_dir / f"{base}-metadata.json"

        if img_path.exists() and meta_path.exists():
            continue

        save_png(b64, img_path)
        body_hex, secondary_hex, tertiary_hex = extract_palette(img_path)
        meta = metadata_record(adj, animal, att, v, img_path, prompt,
                               body_hex, secondary_hex, tertiary_hex, title, desc)
        meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False))
        created += 1

    return created

# ---------- Main orchestration ----------
async def main_async():
    ensure_dirs()

    # 1) Build full plan in the required order and deduplicate
    full_plan = list(build_plan())                               # (adj, animal, att, desc, title)
    plan = unique_plan(full_plan)                                # remove duplicates, keep order

    # 2) Scan all folders for existing variants and compute missing work
    completed = scan_completed_variants()
    work = []
    total_missing = 0
    for adj, animal, att, desc, title in plan:
        have = completed.get((_norm(adj), _norm(animal), _norm(att)), set())
        missing = [v for v in range(REPEATS_PER_COMBO) if v not in have]
        if missing:
            work.append((adj, animal, att, title, desc, missing))
            total_missing += len(missing)

    if not work:
        print("Nothing to do — all combos complete.")
        return

    sem = asyncio.Semaphore(CONCURRENCY)
    tasks = [generate_for_combo(adj, animal, att, title, desc, missing, sem)
             for (adj, animal, att, title, desc, missing) in work]

    print(f"Planned unique combos: {len(plan)}")
    print(f"Images to generate (missing variants): {total_missing}")

    created_total = 0
    pbar = tqdm(total=total_missing, desc="Generating", unit="img")
    for coro in asyncio.as_completed(tasks):
        c = await coro
        created_total += c
        pbar.update(c)
    pbar.close()

    print(f"Done. Created {created_total} new image(s).")
    print(f"Output root: {OUTDIR}")
    print("Folders used:")
    print(f" - {ANIMAL_DIR}")
    print(f" - {ANIMAL_ATTIRE_DIR}")
    print(f" - {ADJ_ANIMAL_ATTIRE_DIR}")

# Run
asyncio.run(main_async())
