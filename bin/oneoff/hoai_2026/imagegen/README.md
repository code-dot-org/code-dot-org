# Hour of AI 2026 Image Generation Scripts

These scripts pre-generate the images for the Hour of AI 2026 Sprite Lab
image levels, for the lab's image cache (`imageCache.ts` in
`apps/src/p5lab/spritelab/lab2/ai/images/`).

A student describes an image by filling a sentence with words: "A
[adjective] [creature] wearing a [clothing]". A level can draw its picture
live, or read it from a tree of pictures drawn in advance. These scripts
draw that tree: every way each sentence can be filled, three variants each,
each one moderated, reviewed by a person, and published to the
`cdo-curriculum` bucket.

The flow is:

1. `generate_images` draws and moderates everything not yet drawn.
2. `review_images` serves a page for approving or rejecting each variant.
3. `generate_images` again draws a fresh variant for each one review rejected.
4. `generate_images --no-dry-run` publishes to the devel bucket, where the review page can also read it.
5. `generate_images --no-dry-run --production` publishes the approved variants for live use.

## The words

The words come from `sentences.json` beside these scripts, a pinned copy of
the lab's `apps/static/spritelab_lab2/sentences.json`. A cached picture's
path is its word ids, so the words the tree was drawn from must not change
under it. The copy here is taken from code-dot-org PR 75426, whose word ids
the published paths must match. While it differs from the lab's file,
every run says so.

To change the words, edit `sentences.json` here and the lab's copy
together. Then bump `CACHE_VERSION` in `constants.rb` and
`IMAGE_CACHE_VERSION` in `imageCache.ts`, so no browser mixes pictures of
the old words with the new.

Only four sentences are reachable: the lab picks one by what it is making
(`sentenceFor` in `sentences.ts`), so `character`, `object`, `place` and
`block` are drawn, and any other sentence in the file is ignored. Every
picture is pixel art. A character is a five-picture set: a base image, then
four poses (idling, walking, jumping, landing), each drawn with the base as
a reference, in the stance the creature's `bodyPlan` names.

To see the words, and the size of a run:

```
./bin/oneoff/hoai_2026/imagegen/generate_images --list-words
./bin/oneoff/hoai_2026/imagegen/generate_images --list-sentences
```

All of it is 568 fillings, 1,704 variants and 7,080 images. The character
sentence is 6,720 of those images.

## Prompts

The prompts are not written here. `dump_prompts.ts` imports the lab's prompt
builders (`imagePrompts.ts` and `characterSetPrompts.ts`) and prints one job
per filled sentence; the scripts run it through `npx tsx`, which needs Node
18 or newer (`nvm use 22`). Its mirrors of `promptText` and
`sentenceWordIds` were checked against the lab's own on every filling.

Those modules, and aichat's `safetyPrompts.ts`, must stay free of `@cdo/...`
imports and browser APIs, or `dump_prompts.ts` stops working.

## Drawing

```
./bin/oneoff/hoai_2026/imagegen/generate_images
```

draws and moderates every variant not yet drawn. Narrow it with
`-i/--id SENTENCE`, `-f/--filter TEXT`, `-v/--variants N` and `--limit N`.
`-c/--choice SLOT=WORD` pins a slot (`_` for an empty optional slot), so a
small batch can sweep one slot and hold the rest. One character per
creature is 8 sets of 5 pictures:

```
./bin/oneoff/hoai_2026/imagegen/generate_images -i character -v 1 \
  -c adjective=brave -c clothing=_
```

A run skips what is already drawn and checked, so it can be stopped and run
again. Failed requests are listed at the end and drawn on the next run.

The images are Gemini's, `gemini-3.1-flash-image` through
`google_gemini_ai_tutor_api_key`, as the lab draws a live picture.
`--provider openai` draws with `gpt-image-1` instead, and `--model` and
`--key` override either. The lab keys a cached set on the colour its prompt
names, so the tree is drawn on that colour; OpenAI's `--transparent` is for
experiments only.

## Moderation

The lab runs no safety check on a cached picture, so these are the only ones
it gets. They mirror the lab's live checks (`imageSafety.ts`):

- **Azure AI Content Safety** checks every frame, always. A frame is flagged
  at severity 2 or above in any category, the lab's thresholds for a
  generated image. It needs the `azure_ai_content_safety_key` and
  `azure_ai_content_safety_endpoint` config.
- **`--judge`** adds aichat's LLM judges on `gemini-2.5-flash`, with the
  lab's own instructions: one on every frame, and one on each distinct
  prompt before anything is drawn. A prompt it refuses is never drawn or
  published, on any later run too; verdicts are kept in
  `prompt_verdicts.json`.

A flagged variant is redrawn with a new seed, up to `MAX_REDRAWS` times, then
left out; `--redraw-abandoned` tries it again. A check whose service fails
is retried on the next run. Nothing without a passing verdict is published.
`--no-moderation` skips Azure for an experiment, and a later run without it
checks what was skipped.

## Review

```
./bin/oneoff/hoai_2026/imagegen/review_images
```

serves a page at http://localhost:4567 (localhost only) listing every
filling with its variants side by side, its moderation verdicts, and
Approve and Reject buttons. It reads pictures from the local tree, from the
devel bucket (`cdo-curriculum-devel.s3.amazonaws.com`), from production
(`curriculum.code.org`, CloudFront in front of `cdo-curriculum`), or any
other copy of the tree. Keys: `j`/`k` move, `a` approve, `r` reject, `u`
clear, `n`/`p` page.

Verdicts are written to each variant's record. A rejected variant is drawn
again on the next run, and its old frames move to the attic. An approval
belongs to the drawing it was given to: a redrawn variant needs reviewing
again, and the page says when a verdict is of an earlier drawing.

## Publishing

`--dry-run` is the default: a run reports what it would publish, and why
anything is held back, and uploads nothing. `--no-dry-run` uploads to
`cdo-curriculum-devel`; adding `--production` uploads to `cdo-curriculum`
and publishes only variants approved in review (`--unreviewed` overrides).
`--just-upload` skips drawing.

A variant is published whole or not at all: the lab finds a variant by its
first frame, and a set missing a pose after that is an error to it. A
filling with no publishable variant is an error to the lab too, so a
production upload with such gaps is refused unless `--allow-gaps`.

Two things an upload does not do: it never deletes a published file, so a
variant rejected after publishing stays published until it is redrawn and
uploaded again; and CloudFront may serve a replaced production file for a
while after the upload.

## Files

```
image_output/v1/<sentence>/<word>/<word>/pixel/NN.png        the published tree, PNG only
image_output/v1/<sentence>/<word>/<word>/pixel/NN-base.png   a set's frames: base, idling, ...
image_records/v1/<sentence>/<word>/<word>/pixel/NN.json      prompts, seed, verdicts, review
image_attic/...                                              every image a redraw replaced
```

Words are in the order the sentence reads them, and `_` is an optional slot
left empty: `character/brave/dragon/_/pixel/00-base.png`. The published tree
holds nothing else; the lab derives everything a record holds from the level
and the prompt. Gemini returns a JPEG as readily as a PNG, and it is
converted on arrival: the lab's live path decodes it onto a canvas that
encodes PNG, so the pixels are the same.

Nothing here deletes an image. `validate_images` checks that every frame is
a square PNG with a record, and `--attic` moves an invalid one aside, so the
next run draws it again.
