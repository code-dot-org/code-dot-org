# Hour of AI 2026 Image Generation Scripts

These scripts generate images for the Hour of AI 2026 Sprite Lab image
levels (the `hoai2026-dev` progression).

## Quick overview

The image levels let a student describe an image with an "Adlib"-style
prompt: a sentence template with a dropdown per slot, drawn from a small set
of choices. The templates and choices live in
`apps/static/spritelab_lab2/imageAdlibManifest.json`, one entry per
`<kind>-<set>`:

- the kind is `background`, `sprite`, `block`, or `object` (an object sprite)
- `simple` is used by the image levels, `expanded` by freeplay, and
  `treasure` by the jewel level (`level_mode.adlibs`)

The script generates an image for every combination of choices, in each
style, so the variety can be reviewed and the results cached for playtests
and for when the AI service is down or costly.

The general flow is to:

1. Check the size of what you are about to generate with `--list-adlibs`.
2. Generate the content, narrowed with `--adlib`, `--filter`, `--style`, and `--variants`.
3. Check the output in the `image_output` path relative to the script.
4. Upload it via the `--no-dry-run` flag and then carefully, with appropriate AWS credentials, the `--production` flag.

## Prompts

The prompts are not written here. `dump_prompts.ts` imports the prompt
builders the lab itself uses (`imagePrompts.ts` and `characterSetPrompts.ts`
in `apps/src/p5lab/spritelab/lab2/ai/images/`) and prints one job per line.
`generate_images` runs it through `npx tsx` and caches its output as
`prompts.jsonl`. This needs Node 18 or newer (`nvm use 22`).

A job is one image, or, for a character sprite, one animated set: a base
image, then four poses (idling, walking, jumping, landing) that each send
the base image back as a reference, just as the lab's "Generate animation"
does. A set costs five requests.

Those modules must stay free of `@cdo/...` imports and browser APIs, or
`dump_prompts.ts` stops working.

## Usage

The `generate_images` script calls the OpenAI image API using the
`openai_student_learning_api_key` config key. The model defaults to the
`MODEL` constant in `constants.rb`; override it with `--model`.

To see how many jobs and images each adlib would produce:

```
./bin/oneoff/hoai_2026/imagegen/generate_images --list-adlibs
./bin/oneoff/hoai_2026/imagegen/generate_images --list-adlibs --produce-animations
```

The full set, at three variants each, is about 27,000 single images, or about
95,000 with animations. Start with the adlibs the non-freeplay levels use:

```
./bin/oneoff/hoai_2026/imagegen/generate_images -a sprite-simple -a background-simple -a block-simple -a object-treasure
```

To try the pipeline on a handful of jobs first:

```
./bin/oneoff/hoai_2026/imagegen/generate_images -a sprite-simple -s pixel -v 1 --limit 5
```

To write each job's metadata file, prompts included, without sending
anything to the AI service:

```
./bin/oneoff/hoai_2026/imagegen/generate_images -a sprite-simple --just-save-prompt
```

Unlike the music script, a saved prompt does not block a later run from
generating: a job is skipped only when all of its images exist. Remove
images from `image_output` to regenerate them.

Failed requests (a moderation refusal, say) are listed at the end of the
run and left ungenerated; running the script again retries them. Timeouts,
rate limits, and server errors are retried in place.

### Filtering

- `-a`/`--adlib ID` restricts to the given adlib ids (repeatable).
- `-f`/`--filter TEXT` keeps adlibs whose id contains the text, e.g. `--filter=-simple`.
- `-s`/`--style STYLE` restricts to `pixel` or `smooth` (repeatable).
- `--produce-animations` adds animated character sets; `--no-produce-singles` leaves only those.
- `-v`/`--variants N` sets how many images to make per combo. Each live generation is a fresh roll, so one per combo understates the variety.

## Output

Files are the raw model output, before the lab's background removal,
cropping, and pixel-grid normalization. The lab is meant to fetch a cached
image and run that same pipeline on it, so a cached image ends up like a
live one.

Paths are built from the choice ids in template slot order, which never
contain dots:

```
<adlibId>/<style>/<choice ids>.<variant>.png
<adlibId>/<style>/<choice ids>.<variant>.json
<adlibId>/<style>/animated/<choice ids>.<variant>.<pose>.png
<adlibId>/<style>/animated/<choice ids>.<variant>.json
```

For example, `sprite-simple/pixel/brave.robot.00.png`. The `.json` file
records the prompts, model, and frame files. The OpenAI image API takes no
seed, so none is recorded, and a cached image cannot be replayed by seed as
a live one can.

### Uploading to S3

The `--dry-run` option is on by default. This means, it looks at uploading
but does not actually try to copy to S3. Specify `--no-dry-run` to enable
the uploading to S3, under `media/spritelab/generate/images/`.

By default it will go to the non-production bucket `cdo-curriculum-devel`.
Specify `--production` to ensure it goes to the live `cdo-curriculum`
bucket. There's no warning and this **WILL** overwrite live content.

A job uploads whole or not at all: an animated set missing a pose is not
uploaded.

If you only want to upload certain files:

1. Ensure only those files exist in the `image_output` directory.
2. Run with `--just-upload` to not generate anything new.
3. Run with `--no-dry-run` and see if the proper content gets to the devel bucket.
4. Run with `--no-dry-run --production` when you are certain.

### Validating

You can run the `validate_images` script to check that every image in
`image_output` is a square PNG. The same check runs before uploading.

To automatically delete the offending files, specify the `--delete` flag.
After doing this, the `generate_images` script can be invoked another time
to generate any missing content.
