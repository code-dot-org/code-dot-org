# Cached images for Sprite Lab in Lab2

The image levels of a progression offer word combos (an adlib) in place of
a typed prompt. For a level that names `imageSource: cached` or
`cached-then-live` in its `level_mode`, the lab first looks for the combo's
picture in a tree on S3 and asks the model only when the tree has none
(`apps/src/p5lab/spritelab/lab2/ai/images/imageCache.ts`). The tree holds
the model's raw output, not finished assets: the lab's own pipeline runs on
a cached picture exactly as on a live one.

The scripts here draw that tree and describe it.

## Layout

```
media/spritelab2/generate/            bucket cdo-curriculum, public-read
  v1/
    manifest.json
    sprite-hero/
      brave-dragon/
        pixel/
          00-base.png  00-idling.png  00-walking.png  00-jumping.png  00-landing.png  00.json
          01-base.png  ...
    background-story/
      spooky-castle/
        pixel/
          00.png  00.json
```

One folder per combo, one per style inside it. Choice ids join in the
order the sentence reads them. Sprites are five-frame character sets; the
base frame also serves a student who asks for a single picture. The
sidecar records what was sent: prompts per frame, seed, temperature, grid,
key colour, model.

## Flow

```
cd apps
./script/spritelabCachedImages/run.sh generate --out ../cache_output --dry-run
GOOGLE_GENERATIVE_AI_API_KEY=... ./script/spritelabCachedImages/run.sh generate --out ../cache_output --variants 3
./script/spritelabCachedImages/run.sh manifest --out ../cache_output [--blocklist rejected.json]
aws s3 sync ../cache_output/v1 s3://cdo-curriculum-devel/media/spritelab2/generate/v1 --acl public-read
aws s3 sync ../cache_output/v1 s3://cdo-curriculum/media/spritelab2/generate/v1 --acl public-read
```

`generate` is resumable: a variant whose sidecar exists is skipped. `--set`
and `--style` narrow a run; `--limit` caps it for a trial; `--stub` draws
placeholders with no model calls, for exercising the tree and the lab.

`manifest` records the variants every combo has in every style, so the
lab never asks for a file the tree lacks and a partly drawn tree serves
what it has. The block list is a JSON array of variant keys,
`<adlibId>/<choice-ids>/<style>/<NN>`, for pictures review rejected.

## Versions

A tree is drawn from one manifest of words and one set of prompts. Change
either and draw a new version: `IMAGE_CACHE_VERSION` in imageCache.ts
names the one the lab reads, and old files stay where a cached browser
manifest may still point.

## Trying a tree

`?image-source=cached-then-live&image-cache-url=https://host/path/` on a
level overrides its source and reads another tree, a local one or a version
under review. `?image-source=live` turns the cache off.
