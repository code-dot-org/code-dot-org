# HoAI 2025 Image Generation & Doctoring Pipeline

Below describes the HoAI 2025 image generation pipeline for Dance Party animal heads, including:

- The asynchronous OpenAI-based generator that creates and regenerates assets
- The Ruby “image doctor” wrapper that runs Python post-processing tools and uploads outputs to S3
- Recommended directory layout and environment setup
- Copy/paste command examples for common workflows

## 1. Overview

### 1.1 High-level flow

1. **Generate base animal heads** using the OpenAI Images API (`gpt-image-1`)
2. **Generate derivative variants** (attire, adjective+attire) by editing base heads:
   - Preserve shape/species/silhouette via `images.edit`.
   - Only add or adjust accessories / mood
3. **Extract a robust color palette** from each output:
   - Body, secondary, and tertiary colors
   - Uses Lab color space, background exclusion, center weighting, and stripe penalties to avoid background/edge artifacts
4. **Persist structured metadata** per image:
   - File name, variant index, prompt, palette, tags, etc., in `*-metadata.json`
5. **(Optional) Doctor/problem-fix tools** (Ruby + Python) to:
   - Regenerate heads with transparent eyes
   - Trim edges
   - Clean alpha halos and border artifacts
   - Identify images that still have internal transparent “holes” (eyes)
6. **Upload final assets to S3** under the music lab / Dance Party path:
   - `s3://cdo-curriculum[-devel]/media/musiclab/generate/dancer/...`

Steps 1-4 are initiated via the `/bin/oneoff/hoai_2025/hoai_2025_images.rb` script while step 5 is initiatiated via `the bin/oneoff/hoai_2025/hoai_image_doctor.rb `. Both will automatically default to dry-running step 6 unless otherwise provided appropriate arguments.

## 2. Image Generator (Python)

The generator is an async OpenAI client that:

- Accepts lists of adjectives, animals, and attire from CLI flags
- Builds a **plan** over:
  - animal-only
  - animal+attire
  - adjective+animal+attire
- Generates **REPEATS_PER_COMBO** variants (per combo) unless already present
- Uses separate folders for:
  - `creature-05` (animal only),
  - `creature-attire-05` (animal + attire),
  - `creature-attire-mood-05` (adjective + animal + attire)
- Extracts palettes and writes metadata JSON files alongside PNGs
- Supports targeted **re-generation** of specific assets via `--redo-only`

## 3. Generation Handler (Ruby orchestrator)

The generation handler (e.g., `bin/oneoff/hoai_2025/hoai_2025_images.rb`) is the **primary entrypoint** for running the HoAI image pipeline end to end. It is responsible for:

- Validating that an OpenAI key is available:
  - `OPENAI_API_KEY` environment variable, or
  - `CDO.openai_student_learning_api_key` from Dashboard configuration
- Reading **animals**, **attires**, and **adjectives** either from CLI flags or from local text files
- Invoking the Python generator:
  - `uv run python -m hoai_2025.combinatoric_generation ...`
- Uploading the generated PNGs and JSON metadata to S3 under:
  - `s3://cdo-curriculum[-devel]/media/musiclab/generate/dancer/` (devel)
  - `s3://cdo-curriculum/media/musiclab/generate/dancer/` (production)

### 3.1 Options

Handler-level options:

- `--[no-]dry-run`
  - When `--dry-run` (default), the script **does not** upload to S3. It still runs the generator (unless `--just-upload`) so you can inspect outputs locally
  - Use `--no-dry-run` to actually upload
- `--production`
  - When provided, uploads to `cdo-curriculum` instead of `cdo-curriculum-devel`
- `--just-upload`
  - Skips the Python generation step and only uploads whatever is already present under `python/hoai_2025/output/dance_party_animal_heads_v2`
- `-a/--attire ATTIRE` (repeatable)
  - Adds an attire string to the list used for generation
  - If **no attires** are specified on the CLI, the handler loads them from `python/hoai_2025/attires.txt`
- `-n/--animal ANIMAL` (repeatable)
  - Adds an animal string to the list used for generation
  - If **no animals** are specified on the CLI, the handler loads them from `python/hoai_2025/animals.txt`
- `-j/--adjective ADJECTIVE` (repeatable)
  - Adds an adjective string to the list used for generation
  - If **no adjectives** are specified on the CLI, the handler loads them from `python/hoai_2025/adjectives.txt`
- `--redo-only TARGETS` (repeatable or comma-separated)
  - Restricts the run to **only** re-generate specific variants (e.g., `flame_03`, `fox_hoodie_00`)
  - May be repeated or comma-separated: `--redo-only "fox_hoodie_00,bear-hat_01"`

### 3.3 Quick usage examples

#### 3.3.1 Full combinatoric generation (using default lists)

Uses `animals.txt`, `attires.txt`, and `adjectives.txt` from the Python folder. Generates all combinations and uploads to **devel**

Dry run (no upload):

```bash
ruby bin/oneoff/hoai_2025/hoai_2025_images.rb
```

Actual upload to `cdo-curriculum-devel`:

```bash
ruby bin/oneoff/hoai_2025/hoai_2025_images.rb --no-dry-run
```

#### 3.3.2 Full generation to production

```bash
ruby bin/oneoff/hoai_2025/hoai_2025_images.rb   --no-dry-run   --production
```

#### 3.3.3 Restrict to specific animals / attires / adjectives

```bash
ruby bin/oneoff/hoai_2025/hoai_2025_images.rb   --no-dry-run   -n "fox"   -n "tiger"   -a "top hat"   -a "hoodie"   -j "happy"   -j "mischievous"
```

This:

- Ignores `animals.txt`, `attires.txt`, and `adjectives.txt` (because you overrode them on the CLI)
- Runs `hoai_2025.combinatoric_generation` for the specified sets
- Uploads all generated images + JSON metadata to the devel bucket

#### 3.3.4 Redo only a set of variants

Use `--redo-only` to re-run a targeted subset and upload the refreshed outputs:

```bash
ruby bin/oneoff/hoai_2025/hoai_2025_images.rb   --no-dry-run   --redo-only fox_hoodie_00   --redo-only tiger-top_hat-happy_02
```

or:

```bash
ruby bin/oneoff/hoai_2025/hoai_2025_images.rb   --no-dry-run   --redo-only "fox_hoodie_00,tiger-top_hat-happy_02"
```

#### 3.3.5 Just upload existing outputs

If generation has already been run, you can re-upload without re-invoking the generator:

```bash
ruby bin/oneoff/hoai_2025/hoai_2025_images.rb   --no-dry-run   --just-upload
```

This is useful if you changed only metadata, fixed files manually, or want to re-sync output to S3

## 4. Image Doctor (Ruby wrapper)

The Ruby one-off script `bin/oneoff/hoai_2025/hoai_image_doctor.rb` orchestrates Python doctor tools and optional S3 upload

Supported tools (`DOCTOR_TOOLS`):

- `regen_transparent_eyes`
- `trim_edges`
- `clean_edge_artifacts`
- `identify_transparent_eyes`

It is responsible for:

- Resolving the Python root (defaults to `python/hoai_2025`).
- Building the correct `uv run python -m hoai_2025.<tool>` command.
- Passing tuning parameters (pixels, band, tolerance, feather, workers, etc.).
- Optionally uploading results to S3 using existing Code.org S3 helpers.

### 4.1 Common options

- `--tool TOOL` – one of `regen_transparent_eyes`, `trim_edges`, `clean_edge_artifacts`, `identify_transparent_eyes` (required).
- `--input PATH` – input directory containing PNGs (required).
- `--output PATH` – output directory root (varies per tool; optional).
- `--python-root PATH` – override Python project root (optional).
- `--[no-]verbose` – toggle verbose logs (default: verbose).
- `--dry-run` – print the Python command and S3 plan, then exit.

S3-specific:

- `--upload` – upload the output directory to S3
- `--production` – use `cdo-curriculum` instead of `cdo-curriculum-devel`
- Bucket key prefix is:
  - `media/musiclab/generate/dancer/`

### 4.2 Regenerate transparent eyes (OpenAI edit → HTML report)

This runs `hoai_2025.regen_transparent_eyes` in Python, which:

- Uses OpenAI **image edit** on problematic heads to restore white (non-transparent) eyes
- Evaluates results and writes an HTML report

Quick usage:

```bash
# Dry run: just show what would be executed, no edits, no upload.
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool regen_transparent_eyes   --input "python/hoai_2025/output/dance_party_animal_heads_v2"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/_openai_edit"   --model gpt-image-1   --size 1024x1024   --dry-run

# Actual run, devel upload:
OPENAI_API_KEY=... ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool regen_transparent_eyes   --input "python/hoai_2025/output/dance_party_animal_heads_v2"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/_openai_edit"   --model gpt-image-1   --size 1024x1024   --upload
```

Production upload (same command, add `--production`):

```bash
OPENAI_API_KEY=... ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool regen_transparent_eyes   --input "python/hoai_2025/output/dance_party_animal_heads_v2"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/_openai_edit"   --model gpt-image-1   --size 1024x1024   --upload   --production
```

### 4.3 Trim edges (`trim_edges`)

Trims a fixed number of pixels from all four edges using the Python `hoai_2025.trim_edges` module

Key options:

- `--pixels N` – number of pixels to trim (default: 4).
- `--inplace` – modify files in-place; otherwise output to new directory.

Examples:

```bash
# Trim 4 pixels from all edges into a new folder
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool trim_edges   --input "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05_trimmed"   --pixels 4

# In-place trim (be cautious!)
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool trim_edges   --input "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05"   --pixels 4   --inplace
```

With upload:

```bash
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool trim_edges   --input "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05_trimmed"   --pixels 4   --upload
```

### 4.4 Clean edge artifacts (`clean_edge_artifacts`)

Detects halo artifacts at the edges and makes them transparent via `hoai_2025.clean_edge_artifacts`

Key options:

- `--band N` – edge band width in pixels (default: 6).
- `--tolerance F` – RGB distance threshold (default: 18.0).
- `--feather F` – Gaussian blur radius for soft alpha (default: 1.5).
- `--keep-format` – keep original extension even if alpha is removed.
- `--workers N` – parallel workers (0 = auto).

Examples:

```bash
# Clean edge halos into a new folder
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool clean_edge_artifacts   --input "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05_trimmed"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05_edgeclean"   --band 6   --tolerance 18.0   --feather 1.5   --workers 0

# In-place clean (advanced; make sure you have backups)
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool clean_edge_artifacts   --input "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05"   --band 6   --tolerance 18.0   --feather 1.5   --workers 0   --inplace
```

### 4.5 Identify transparent eyes (`identify_transparent_eyes`)

Scans images for internal transparent “holes” (typically mis-rendered eyes) and groups matches into sweep folders

The Ruby script maps this to `hoai_2025.identify_transparent_eyes` and supports:

- `--output PATH` – treated as the **output root** for sweep folders.
  - Defaults to `python_root/output` if not provided.

Example:

```bash
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool identify_transparent_eyes   --input "python/hoai_2025/output/dance_party_animal_heads_v2"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/eyes_sweeps"
```

This will:

- Run the Python scanner.
- Create timestamped subfolders under `eyes_sweeps/` containing copies of the suspect images.

---

## 5. S3 Upload Behavior

When `--upload` is supplied, the Ruby script:

1. Collects files under the computed `output_dir`.
2. Derives the S3 key as:
   - `media/musiclab/generate/dancer/<relative_path>`
3. Chooses a bucket:
   - `cdo-curriculum-devel` (default),
   - `cdo-curriculum` if `--production` is provided.
4. Uploads with content-type based on extension:
   - `.png` → `image/png`
   - `.html` → `text/html; charset=utf-8`
   - `.json` → `application/json`
   - `.csv` → `text/csv`
   - fallback → `application/octet-stream`
5. Uses `public-read` ACL and `no_random: true` to preserve predictable naming.

Example production upload after doctoring:

```bash
ruby bin/oneoff/hoai_2025/hoai_image_doctor.rb   --tool clean_edge_artifacts   --input "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05"   --output "python/hoai_2025/output/dance_party_animal_heads_v2/creature-05_edgeclean"   --band 6   --tolerance 18.0   --feather 1.5   --workers 0   --upload   --production
```

## 6. Restore Heads from S3 (Ruby)

The **restore script** (`restore_heads_from_s3.rb`) safely restores a local sprite directory from S3.

### 6.1 Purpose

Use it when:

- You want the canonical, published heads exactly as stored on S3
- Local assets drift from S3 and need a full reset
- You want to run doctor operations on S3-accurate sources
- You need to inspect production data locally

### 6.2 Behavior Summary

- **Defaults to DRY RUN** — no files modified unless `--no-dry-run`.
- Restores only **one subdirectory** at a time (default: `creature-attire-mood-05`).
- Downloads from:

  ```
  s3://cdo-curriculum[-devel]/media/musiclab/generate/dancer/<subdir>/
  ```

- Replaces local:

  ```
  python/hoai_2025/output/<subdir>/
  ```

- Runs in parallel (default threads = CPU cores).

### 6.3 Flags

| Flag              | Description                              |
| ----------------- | ---------------------------------------- |
| `--production`    | Pull from prod bucket (`cdo-curriculum`) |
| `--[no-]dry-run`  | Actual restore only with `--no-dry-run`  |
| `--prefix PREFIX` | Override S3 prefix                       |
| `--dest PATH`     | Override local destination               |
| `--threads N`     | Parallel downloads                       |
| `--verbose`       | Show occasional per-file info            |

### 6.4 Examples

**Dry run (recommended first):**

```bash
ruby bin/oneoff/hoai_2025/restore_heads_from_s3.rb
```

**Actually restore canonical devel sprites:**

```bash
ruby bin/oneoff/hoai_2025/restore_heads_from_s3.rb --no-dry-run
```

**Restore from production:**

```bash
ruby bin/oneoff/hoai_2025/restore_heads_from_s3.rb \
  --no-dry-run \
  --production
```

**Restore a different subdirectory (e.g. creature-05):**

```bash
ruby bin/oneoff/hoai_2025/restore_heads_from_s3.rb \
  --no-dry-run \
  --prefix "media/musiclab/generate/dancer/creature-05/" \
  --dest "python/hoai_2025/output/creature-05"
```

**Higher concurrency + verbose logging:**

```bash
ruby bin/oneoff/hoai_2025/restore_heads_from_s3.rb \
  --no-dry-run \
  --threads 16 \
  --verbose
```
