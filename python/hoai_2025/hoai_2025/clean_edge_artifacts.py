# python/hoai_2025/hoai_2025/clean_edge_artifacts.py
from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image, ImageFilter

SUPPORTED_EXTS = {".png", ".webp", ".jpg", ".jpeg"}

def _ensure_rgba(im: Image.Image) -> Image.Image:
    return im.convert("RGBA")

def _median_color(arr: np.ndarray) -> Tuple[int, int, int]:
    # arr: (N, 4) RGBA or (N, 3) RGB; we use RGB channels only
    rgb = arr[..., :3]
    # median per channel, cast back to uint8
    return tuple(np.median(rgb, axis=0).astype(np.uint8).tolist())  # type: ignore[return-value]

def _color_distance_rgb(a: np.ndarray, color: Tuple[int, int, int]) -> np.ndarray:
    # Euclidean distance in sRGB (fast + simple)
    # a is (..., 3) array, color is (3,)
    return np.sqrt(np.sum((a.astype(np.int16) - np.array(color, dtype=np.int16)) ** 2, axis=-1))

def clean_edges(
    im: Image.Image,
    band: int = 6,
    tolerance: float = 18.0,
    feather: float = 0,
    verbose: bool = False,
) -> Image.Image:
    """
    Make edge artifacts transparent by sampling a band on each side, estimating edge bg color,
    and zeroing (with feather) pixels near that color.

    - band:     width (pixels) sampled on each edge (also the region we try to clean).
    - tolerance:RGB Euclidean distance threshold (0-441). Start ~15–25.
    - feather:  Gaussian blur radius applied to the binary mask for soft edges. 0 = hard cut.
    """
    if band <= 0:
        return im

    im_rgba = _ensure_rgba(im)
    w, h = im_rgba.size
    if w < 2 or h < 2:
        return im_rgba

    arr = np.array(im_rgba, dtype=np.uint8)  # (H, W, 4)
    mask = np.zeros((h, w), dtype=np.float32)  # 0..1 before blur

    # Helper to build mask for a given rectangular band
    def process_band(x0, y0, x1, y1, side_name: str):
        sub = arr[y0:y1, x0:x1, :]  # (bh, bw, 4)
        if sub.size == 0:
            return
        # Estimate the edge "bg" color via median over the band
        col = _median_color(sub.reshape(-1, sub.shape[-1]))
        if verbose:
            print(f"[edge_clean] {side_name} median color = {col}")
        # compute distance-to-bg in that band
        dist = _color_distance_rgb(sub[..., :3], col)
        # mark within tolerance
        band_mask = (dist <= tolerance).astype(np.float32)  # 0/1
        # OR it into the global mask at the same region
        mask[y0:y1, x0:x1] = np.maximum(mask[y0:y1, x0:x1], band_mask)

    b = min(band, max(1, min(w, h)//2))
    # Top
    process_band(0, 0, w, b, "top")
    # Bottom
    process_band(0, h - b, w, h, "bottom")
    # Left
    process_band(0, 0, b, h, "left")
    # Right
    process_band(w - b, 0, w, h, "right")

    # Convert to PIL mask (L), apply optional feather via Gaussian blur
    mask_img = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
    if feather and feather > 0:
        mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=float(feather)))

    # Invert mask to get "keep alpha" factor: where mask=255 => alpha->0
    inv = Image.eval(mask_img, lambda v: 255 - v)

    # Combine: new_alpha = min(original_alpha, inv_mask)
    orig_alpha = Image.fromarray(arr[..., 3], mode="L")
    new_alpha = Image.eval(Image.composite(orig_alpha, inv, inv), lambda v: v)  # already min via composite logic

    # Repack and return
    out = Image.merge("RGBA", (
        Image.fromarray(arr[..., 0], "L"),
        Image.fromarray(arr[..., 1], "L"),
        Image.fromarray(arr[..., 2], "L"),
        new_alpha
    ))
    return out

def _save_image(out: Image.Image, out_path: Path, src_ext: str, force_transparent_format: bool) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # If we created transparency and the original is JPEG, switch to PNG unless told not to.
    has_alpha = out.mode == "RGBA" and (np.array(out.split()[-1]) != 255).any()
    if has_alpha and (src_ext in {".jpg", ".jpeg"}) and force_transparent_format:
        out_path = out_path.with_suffix(".png")

    ext = out_path.suffix.lower()
    if ext == ".png":
        out.save(out_path, optimize=True)
    elif ext in {".jpg", ".jpeg"}:
        # If caller forces JPEG keep, we’ll drop alpha onto white
        if has_alpha:
            bg = Image.new("RGB", out.size, (255, 255, 255))
            bg.paste(out, mask=out.split()[-1])
            bg.save(out_path, quality=95, subsampling="keep")
        else:
            out.convert("RGB").save(out_path, quality=95, subsampling="keep")
    elif ext == ".webp":
        out.save(out_path, method=6)  # good quality, keeps alpha
    else:
        out.save(out_path)

def process_path(
    in_path: Path,
    out_path: Path | None,
    band: int,
    tolerance: float,
    feather: float,
    inplace: bool,
    keep_format: bool,
    verbose: bool,
) -> bool:
    try:
        with Image.open(in_path) as im:
            cleaned = clean_edges(im, band=band, tolerance=tolerance, feather=feather, verbose=verbose)

        if inplace:
            # Save atomically: write temp + replace
            tmp = in_path.with_name(f".edge_clean_{in_path.name}")
            _save_image(cleaned, tmp, in_path.suffix.lower(), force_transparent_format=not keep_format)
            os.replace(tmp, in_path)
        else:
            assert out_path is not None
            _save_image(cleaned, out_path, in_path.suffix.lower(), force_transparent_format=not keep_format)

        return True
    except Exception as e:
        print(f"[edge_clean][ERROR] {in_path}: {e}")
        return False

def run(
    input_dir: Path,
    output_dir: Path | None,
    band: int,
    tolerance: float,
    feather: float,
    inplace: bool,
    keep_format: bool,
    verbose: bool,
) -> int:
    total = ok = 0
    for p in input_dir.rglob("*"):
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS:
            total += 1
            out_path = None
            if not inplace:
                rel = p.relative_to(input_dir)
                out_path = (output_dir / rel)  # type: ignore[operator]
            ok += int(process_path(p, out_path, band, tolerance, feather, inplace, keep_format, verbose))
    print(f"[edge_clean] Done. Processed={total} Succeeded={ok}")
    return 0 if ok == total else 1

def main():
    ap = argparse.ArgumentParser(description="Detect edge artifacts and make them transparent.")
    ap.add_argument("--input", required=True, help="Input directory")
    ap.add_argument("--output", help="Output root (ignored with --inplace)")
    ap.add_argument("--band", type=int, default=6, help="Edge band width to analyze/clean (px). Default: 6")
    ap.add_argument("--tolerance", type=float, default=18.0, help="RGB distance threshold (0–441). Default: 18.0")
    ap.add_argument("--feather", type=float, default=1.5, help="Gaussian blur radius for soft alpha. Default: 1.5")
    ap.add_argument("--inplace", action="store_true", help="Modify files in-place (atomic replace)")
    ap.add_argument("--keep-format", action="store_true", help="Keep original extension even if it drops alpha (JPEG becomes opaque)")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    input_dir = Path(os.path.abspath(args.input))
    if not input_dir.exists():
        print(f"[edge_clean][ERROR] Input not found: {input_dir}")
        return 2

    output_dir = None
    if not args.inplace:
        output_dir = Path(os.path.abspath(args.output)) if args.output else input_dir.parent / (input_dir.name + "_edgeclean")

    return run(input_dir, output_dir, args.band, args.tolerance, args.feather, args.inplace, args.keep_format, args.verbose)

if __name__ == "__main__":
    raise SystemExit(main())
