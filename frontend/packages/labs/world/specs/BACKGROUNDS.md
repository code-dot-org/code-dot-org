# Plan: backgrounds

A world draws on `#101020`. Nothing else. Every visible thing is an actor, and
an actor is a simulated body — it has traits, properties, a place in the rules,
and a position something can collide with. A backdrop is none of that, and
asking "what does it mean for the sky to be affected by gravity?" is the sign
that it should not be one.

But a backdrop wants effects. Rippling the water without rippling the swimmer is
a thing a learner will want on the first day, and the effect machinery is already
general enough to give it to them.

This plan adds a **backdrop**: the appearance half of an actor, on its own, with
three blocks in front of it. It is written so that parallax — several backdrops
at different scroll rates — is a later addition to the same object rather than a
rewrite of it.

## 1. Why not an actor

The engine already draws the line this plan needs. From `engine/core/types.ts`,
on `AppliedEffectSpec`:

> The engine carries this from the builder to `renderSnapshot` and does nothing
> else with it: an effect declares no property, runs no step, and reads nothing
> from the world. It is appearance-of-the-drawing, which is why it lives here
> rather than as a Trait.

Appearance-of-the-drawing is exactly what a backdrop is. An actor is that plus a
simulated body; a backdrop is that alone. Making it an `Actor` would mean either
giving it traits that are meaningless on it (gravity, collision, a position the
rules can read) or teaching every rule to skip it — a special case in the
simulation to describe something that does not participate in the simulation.

The cost of a separate object is that a backdrop cannot reuse actor blocks
(`move`, `set sprite`, animations). That is the right trade today: those blocks
are about a body, and a backdrop has none. §8 revisits it.

## 2. The object

```ts
interface Backdrop {
  /** An image file name — `backgrounds/cave.png`'s `cave.png`. */
  sprite?: string;
  /** Behind the image, and all there is when there is no image. */
  color: Rgba;
  /** The same list actors and the world carry — see AppliedEffectSpec. */
  effects: AppliedEffectSpec[];
}
```

The world holds `backdrops: Backdrop[]`, and every block written today addresses
index 0. The colour is the world's, not a layer's: there is one sky behind
everything, and a per-layer colour would only ever be visible on the bottom one.

## 3. Blocks

Three new blocks, each shaped like one that exists.

```
set background to [cave.png ▾]        → world.setBackground('cave.png')
set background color to [swatch]      → world.setBackgroundColor(WorldLab.rgb('#88ccff'))
add effect [ripple ▾] to the background
                                      → world.addBackgroundEffect('effects/ripple', ripple, {...})
remove effect [ripple ▾] from the background
                                      → world.removeBackgroundEffect('effects/ripple')
```

- **The image dropdown** is the `set sprite` machinery (`blockly/moduleOptions`
  `liveDropdown`, the tolerant validator, the picker field) with the palette
  filtered to the `backgrounds/` folder. A backdrop is never a spritesheet, so
  the field takes a file name and never a `name.png#3` cell reference.
- **The colour socket** takes a value rather than owning a field, so it goes
  through `engine/core/color.ts` exactly as effect parameters do — and
  `colour_picker`, `colour_random`, `colour_blend` and the `r g b a` block all
  feed it without another line of code. This is the reason `color.ts` exists;
  see its header.
- **The effect blocks** are `world_add_world_effect` / `world_remove_world_effect`
  with the target changed. `add` is legal both under `define world` and in a rule
  step, which requires `addBackgroundEffect` to exist with the same name and
  arguments on `WorldBuilder` and on `World` — the arrangement `addEffect`
  already uses, and the reason those blocks need no builder/runtime guard.

**World effect vs backdrop effect.** A world effect filters the camera, so it
covers everything the frame drew, backdrop included. A backdrop effect filters
the backdrop's own pixels. Underwater-the-view is the first; ripple-the-water-
behind-the-player is the second. Both use the same `.effect` file.

## 4. Rendering

In `PhaserBinding`, inside `create()` and before the first `sync()`:

1. `scene.cameras.main.setBackgroundColor(color)`.
2. One `scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, sprite)` when there is
   a sprite.

Each layer's image sits at a negative depth (`BACKDROP_DEPTH = -1000`, plus the
layer index) rather than relying on being created first. Creation order would be
enough for a background set before the game starts, but not for one set during
it — an event handler's `set background to …` makes its image after the actors'
and it would cover them. This is not the general depth concept §8 describes:
actors still draw at Phaser's default 0 in snapshot order, and nothing has to
choose a depth for them.

Each frame, `sync()` reconciles it from a `backdropSnapshot()` beside
`renderSnapshot()`: texture, colour, and `effectRegistry.reconcile(scene,
backdropImage, backdrop.effects)` — the same call the actors use, pointed at a
different object. A backdrop changed mid-game therefore behaves like everything
else that changes mid-game.

**Hot reload.** What a backdrop draws is a value, so it patches the running world
like a world property (`reconcile.ts`), and the game keeps its state while the
learner tries backgrounds. Without that it would be worse than a restart: an
otherwise-unchanged rebuild compares equal, reconciles, and leaves the running
world with the old sky — the change silently lost. A backdrop's EFFECTS are
structural, in `effectIds` with everyone else's, so gaining or losing one
restarts exactly as it does on an actor.

### Scale: stretch

The backdrop is drawn to fill the 320×320 viewport exactly —
`setDisplaySize(GAME_WIDTH, GAME_HEIGHT)` — with no letterbox, no crop, and no
preservation of aspect ratio.

The stock library decides this. Its art is 400×400 (22 of 29), 800×800 (6), and
one 800×398 (§7): square, and larger than the viewport. Fitting would letterbox
a square image into a square viewport for no gain, and covering would differ
from stretching only on the one odd image. Meanwhile a learner's own 64×64
doodle should become a backdrop when they say it is one, not a stamp in the
middle of a dark field.

Consequences worth stating rather than discovering:

- A backdrop whose aspect ratio is not 1:1 is distorted. That is the policy, not
  a defect; the one stock image it affects (`continuousGrass.png`, 800×398) is a
  repeating band where it will not read as wrong.
- The game's internal resolution is 320×320 and Phaser's `FIT` scales the canvas
  from there, so an 800×800 source is downsampled to 320×320 before anything is
  scaled up. The extra pixels buy nothing today. They are kept anyway — they cost
  nothing on disk, and they are what a higher internal resolution would need.

`repeat` (tile rather than stretch) is the obvious second policy and belongs on
`Backdrop` as a field when something needs it. Not now.

## 5. The pool: a `backgrounds/` folder

Backdrops live in `backgrounds/`, beside `sprites/`, and the pool is the folder:
the image dropdown and the picker palette list what is in it, and nothing else.

It is a convention rather than a type — a learner can drag a file across, and
then it is a backdrop, which is a reasonable thing for dragging it there to mean.
The alternatives buy typing at a price: a distinct extension or a companion
marker file (as `.sheet` is) means a second set of rules to keep right, and a
size heuristic ("bigger than the viewport is a backdrop") is a rule nobody can
see.

Two consequences in the UI:

- The **sprite picker** (`animationEditor/SpritePickerDialog`) excludes
  `backgrounds/`, and the background field's picker includes only it. Neither
  pool leaks into the other, which is the point.
- The **image editor** offers no spritesheet controls for a file in
  `backgrounds/`. A backdrop is not a grid of cells, and `.sheet` should never be
  written beside one.

## 6. Importing

An imported backdrop becomes a real file in the project, bytes and all — a
`data:` URL on a `ProjectFile`, the same shape a stock sprite and an uploaded
image already have. A project draws only what it holds (`appearance/importStock`
header), and a backdrop is not an exception to that.

One difference from stock sprites, and it is the whole of §7: a stock sprite's
bytes are in the bundle (`stockImages.ts`, generated and committed), a
backdrop's are not. So the import is:

1. `fetch(`${getBackgroundBaseUrl()}${file}`)` → blob → data URL.
2. A pure transform, like `importStock`: place the file in `backgrounds/`,
   uniquify the name, return the new source and the name the block should store.

The fetch is a static same-origin asset, not an API call — `<img>`-and-`fetch`
territory, like the image editor's loads, not `DashboardApiClient`.

Cost, from the measured library (§7): a median backdrop is 59KB, so ~79KB as
base64 in the project; the largest is 265KB, so ~353KB. Against a ~430KB project
that is real but affordable for the one or two backdrops a project will hold. If
it stops being affordable, the answer is to downscale on import (to the viewport,
which is what §4 draws anyway), not to stop owning the bytes.

## 7. Getting the art: `backgrounds.txt` + `yarn setup:world`

**Done — this part is implemented.**

`backgrounds.txt` (committed, at the package root) lists 29 animation-library
URLs, one per line; blanks and `#` comments are skipped. `yarn setup:world`
fetches each into `public/backgrounds/` (git-ignored), where the demo serves it.

- **Not committed**, for the reason the vendored Phaser and esbuild builds are
  not: 2.0MB of someone else's art, in a repo where most branches never touch
  this lab.
- **Idempotent.** A file already on disk with a non-zero size is left alone; the
  second run reports `29 stock backdrops already present` and makes no requests.
- **Offline-tolerant.** A failed download is reported by name and skipped, and
  the setup still succeeds — a machine without the network gets a working lab
  minus the part of the library it could not reach. This is deliberately unlike
  the vendored binaries, which throw: without Phaser there is no preview, whereas
  without a backdrop there is a `#101020` sky.
- **Named on the way in**, by `scripts/stockBackgroundNames.mjs`: the library's
  `background_` prefix is dropped and snake_case becomes camelCase, so
  `background_cave.png` → `cave.png` and `sun_and_rainbow.png` →
  `sunAndRainbow.png`. That matches the lab's own stock names (`coinSpin.png`),
  and the name is what a learner sees on a tab and in a dropdown.

The measured library: 29 files, 2.0MB, 409 bytes to 265KB (median 59KB); 22 at
400×400, 6 at 800×800, one at 800×398.

### The shelf, and where it points

**Done — this part is implemented too.**

`scripts/write-stock-backgrounds.mjs` writes `src/appearance/stockBackgrounds.ts`
(generated, committed): the ids, and nothing else. Names derive from
`backgrounds.txt` without the bytes, so the shelf is generated from the committed
list alone and cannot list a backdrop setup will not fetch. It refuses a name
that is not a plain identifier, and refuses two URLs whose names collide — that
pair would overwrite each other in `public/backgrounds/` and leave a tile whose
image nobody downloaded.

`appearance/stock.ts` builds `StockBackground {id, name, url}` from those ids.
It is a **function**, `stockBackgrounds()`, not a constant: the base URL is
host-supplied and may be set after the module loads, and a shelf resolved once at
import time would bake in the default. Labels are derived (`sunAndRainbow` → "Sun
and rainbow") rather than authored — the picker's tiles are pictures, and a
hand-written label per backdrop is one more thing to drift.

`runtime/worldConfig.ts` gains `getBackgroundBaseUrl()` / `setBackgroundBaseUrl()`,
defaulting to `/backgrounds/` and normalising a missing trailing slash, exactly
as `assetBaseUrl` does. It is **not** forwarded to the sandbox iframes: a backdrop
is fetched by the library dialog on the lab's origin and ends up inlined in the
project, so the sandbox only ever sees the copy the project holds.

`src/__tests__/backgrounds.test.ts` is what keeps the three in step — the list,
the shelf, and the URL — and it was checked by making it fail: adding a URL to
`backgrounds.txt` without regenerating turns the first case red, naming the
missing id.

## 8. Room to grow

The shape of each extension, so today's decisions do not have to be revisited:

- **Parallax.** `world.backdrops` is already a list. The engine methods take an
  optional trailing layer index defaulting to 0 (`setBackground(sprite, layer =
0)`), so today's blocks keep meaning what they mean, no `.world` file
  migrates, and parallax adds blocks that name a layer plus a `scroll` field on
  `Backdrop`. Nothing to park it against until the camera moves, which it does
  not.
- **Depth.** When actors gain a `depth` (they will — two overlapping actors
  currently draw in an unspecified order), backdrops become depths below the
  actors' range rather than a creation-order trick.
- **Animated backdrops.** `Backdrop.sprite` becomes a frame source and an `.anim`
  can drive it. The driver already refreshes an actor's texture per frame; the
  backdrop path is the same code.
- **Backdrop-as-actor.** If backdrops ever do need to move, collide or be read by
  rules, the answer is a `Backdrop` trait on a real actor, not a body bolted onto
  this object.

## 9. Testing

- **Pure, in vitest**: the naming transform (`stockBackgroundNames`), the import
  transform, the folder filter on both picker pools, the three blocks'
  generators, and the engine's backdrop state including builder/runtime symmetry
  for `addBackgroundEffect`.
- **In the browser** (Playwright against `dev:isolated`, per the usual loop):
  set a backdrop and see the canvas change; add an effect to the backdrop and
  confirm the player is not filtered by it; confirm a world effect filters both.
- **The setup script**: run twice, and confirm the second run fetches nothing.

## 10. Order of work

1. Engine: `Backdrop`, the three methods on `World` + `WorldBuilder`, snapshot,
   reconcile. (`yarn setup:world` after — the sandbox runs a prebuilt bundle.)
2. Driver: create, stretch, per-frame reconcile, camera colour.
3. Blocks: the three, plus the `remove` counterpart.
4. Library: import flow and the `backgrounds/` folder in `DEFAULT_PROJECT`
   (the manifest generator and base URL are done — §7).
5. Pool hygiene: picker filters, no `.sheet` UI for backdrops.
