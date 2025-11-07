# python/hoai_2025/hoai_2025/trim_edges.py

import argparse
import os
import tempfile
from pathlib import Path
from PIL import Image

SUPPORTED_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

def crop_to_path(in_path: Path, out_path: Path, pixels: int, verbose: bool) -> bool:
    with Image.open(in_path) as im:
        w, h = im.size
        left   = min(max(pixels, 0), max(w - 1, 0))
        top    = min(max(pixels, 0), max(h - 1, 0))
        right  = max(w - pixels, left + 1)
        bottom = max(h - pixels, top + 1)
        if verbose:
            print(f"[trim_edges] {in_path} -> crop {(left, top, right, bottom)}")

        cropped = im.crop((left, top, right, bottom))
        out_path.parent.mkdir(parents=True, exist_ok=True)

        ext = in_path.suffix.lower()
        if ext == ".png":
            cropped.save(out_path, optimize=True)
        elif ext in (".jpg", ".jpeg"):
            cropped.save(out_path, quality=95, subsampling="keep")
        else:
            cropped.save(out_path)
    return True

def crop_inplace(in_path: Path, pixels: int, verbose: bool) -> bool:
    # Write to a temp file in the same directory, then replace.
    try:
        with tempfile.NamedTemporaryFile(prefix=".trim_edges_", suffix=in_path.suffix, dir=str(in_path.parent), delete=False) as tf:
            temp_path = Path(tf.name)
        ok = crop_to_path(in_path, temp_path, pixels, verbose)
        if not ok:
            temp_path.unlink(missing_ok=True)
            return False
        os.replace(temp_path, in_path)  # atomic on POSIX
        return True
    except Exception as e:
        print(f"[trim_edges][ERROR][inplace] {in_path}: {e}")
        try:
            temp_path.unlink(missing_ok=True)  # best-effort cleanup
        except Exception:
            pass
        return False

def run(input_dir: Path, output_dir: Path | None, pixels: int, verbose: bool, inplace: bool) -> int:
    count_in, count_ok = 0, 0
    for path in input_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTS:
            count_in += 1
            if inplace:
                ok = crop_inplace(path, pixels, verbose)
            else:
                rel = path.relative_to(input_dir)
                out_path = output_dir / rel  # type: ignore[arg-type]
                ok = crop_to_path(path, out_path, pixels, verbose)
            count_ok += int(ok)
    print(f"[trim_edges] Done. Processed={count_in} Succeeded={count_ok}")
    return 0 if count_in == count_ok else 1

def main():
    parser = argparse.ArgumentParser(
        description="Trim a fixed number of pixels from all image edges in a directory tree."
    )
    parser.add_argument("--input", required=True, help="Input directory")
    parser.add_argument("--output", help="Output directory (ignored if --inplace)")
    parser.add_argument("--pixels", type=int, default=4, help="Pixels to trim from each edge (default: 4)")
    parser.add_argument("--inplace", action="store_true", help="Modify files in place (atomic replace)")
    parser.add_argument("--verbose", action="store_true", help="Verbose logging")
    args = parser.parse_args()

    input_dir = Path(os.path.abspath(args.input))
    if not input_dir.exists():
        print(f"[trim_edges][ERROR] Input not found: {input_dir}")
        return 2

    output_dir = None
    if not args.inplace:
        output_dir = Path(os.path.abspath(args.output)) if args.output else input_dir.parent / (input_dir.name + "_trimmed")

    return run(input_dir, output_dir, args.pixels, args.verbose, args.inplace)

if __name__ == "__main__":
    raise SystemExit(main())
