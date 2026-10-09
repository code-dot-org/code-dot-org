# Hour of AI 2026 Image Generation Scripts

These scripts generate images for the Hour of AI 2026 Sprite Lab image
levels (the `hoai2026-dev` progression).

## Quick overview

An image level lets a student describe an image by choosing words, never by
typing a prompt. The lab has two UIs for that, and this script covers both:

- **explore** (`source` `explore`) is the word-chip sentence of the
  hoai2026-dev image levels, the ones with `level_mode.imageUi` set to
  `explore`. Its sentences and words live in
  `apps/static/spritelab_lab2/exploreSentences.json`, and a level picks one
  by id with `level_mode.sentence`. A slot that is not `required` can be
  left empty, and the phrase around it then drops out of the prompt, so an
  empty choice is one of its combinations.
- **adlib** (`source` `adlib`) is the image dialog's sentence with a
  dropdown per slot, from
  `apps/static/spritelab_lab2/imageAdlibManifest.json`, one entry per
  `<kind>-<set>`. Free play uses the `expanded` sets; any level whose
  `imageUi` is not `explore` uses the rest. Every slot is filled.

The script generates an image for every combination of choices, in each
style, so the variety can be reviewed and the results cached for playtests
and for when the AI service is down or costly.

The general flow is to:

1. Check the size of what you are about to generate with `--list-ids`.
2. Generate the content, narrowed with `--source`, `--id`, `--filter`, `--style`, and `--variants`.
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
the base image back as a reference, just as the lab does. A set costs five
requests. The explore layout animates every character, so an explore
character job is always a set; the image dialog offers it as a checkbox, so
an adlib character is dumped both ways. The stance and poses follow the
creature choice's `bodyPlan` in the manifest (upright, quadruped or bird;
upright when absent), as the lab's do.

Those modules must stay free of `@cdo/...` imports and browser APIs, or
`dump_prompts.ts` stops working.

## Transparency

The lab generates with Gemini, which cannot emit an alpha channel, so its
prompts ask sprites and blocks for a flat key color that the lab erases
afterwards. OpenAI's image models can return a transparent background
directly (`background: "transparent"`), so by default this script sends
sprites, objects, blocks and animated sets that parameter, with prompts
asking for a transparent background in place of the key color. Each job
line from `dump_prompts.ts` carries both versions of each prompt
(`prompt` and `transparentPrompt`). Backgrounds fill their frame and are
always opaque.

`--no-transparent` sends the lab's key-color prompts instead. A job made
with the other setting, per its metadata file, is regenerated rather than
skipped.

## Usage

The `generate_images` script calls the OpenAI image API using the
`openai_student_learning_api_key` config key. The model defaults to the
`MODEL` constant in `constants.rb`; override it with `--model`.

To see how many jobs and images each sentence would produce:

```
./bin/oneoff/hoai_2026/imagegen/generate_images --list-ids
./bin/oneoff/hoai_2026/imagegen/generate_images --list-ids --produce-animations
```

One image per combination of everything is 42,488 images, animated sets
included; at the default of three variants, three times that. Start with
what the hoai2026-dev levels actually show, which is 3,148 jobs and 10,316
images at one variant:

```
./bin/oneoff/hoai_2026/imagegen/generate_images -v 1 -S explore --produce-animations \
  -i character -i friend -i place-time -i place-detail -i block -i treasure
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

- `-S`/`--source SOURCE` restricts to one UI's choices, `explore` or `adlib` (repeatable).
- `-i`/`--id ID` restricts to the given sentence or adlib ids (repeatable).
- `-f`/`--filter TEXT` keeps ids containing the text, e.g. `--filter=-simple`.
- `-s`/`--style STYLE` restricts to `pixel` or `smooth` (repeatable).
- `--produce-animations` adds animated character sets; `--no-produce-singles` leaves only those. An explore character is animated only, so it needs this flag; the script says so when it skips one.
- `-v`/`--variants N` sets how many images to make per combo. Each live generation is a fresh roll, so one per combo understates the variety.

## Output

Files are the raw model output, before the lab's background removal,
cropping, and pixel-grid normalization. The lab is meant to fetch a cached
image and run that same pipeline on it, so a cached image ends up like a
live one.

Paths are built from the choice ids in sentence slot order, which never
contain dots; an empty optional slot is `none`:

```
<source>/<id>/<style>/<choice ids>.<variant>.png
<source>/<id>/<style>/<choice ids>.<variant>.json
<source>/<id>/<style>/animated/<choice ids>.<variant>.<pose>.png
<source>/<id>/<style>/animated/<choice ids>.<variant>.json
```

For example, `adlib/sprite-simple/pixel/brave.robot.00.png` and
`explore/character/pixel/animated/none.blob.cape.00.base.png`. The `.json` file
records the prompts sent, the model, whether the images are transparent,
and the frame files. The OpenAI image API takes no
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
`image_output` is a square PNG and, where its metadata file says it was
made transparent, has an alpha channel. A transparent sprite must also have
four transparent corners; a block may fill its frame, so it is not held to
that. The same check runs before uploading.

To automatically delete the offending files, specify the `--delete` flag.
After doing this, the `generate_images` script can be invoked another time
to generate any missing content.
