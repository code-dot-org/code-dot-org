# Plan: spec-aligned animations

This is the _how_ for `INTERFACE.md` §Animations (the _what_). It replaces the
interim animation implementation — hardcoded built-in spritesheets, Phaser-owned
timing, an `AnimationProperty` string on the spatial trait (PLAN §16 milestone 7,
"third slice") — with the serialized, engine-driven model the interface
specifies. Read `INTERFACE.md` §Animations first.

## 1. The gap, precisely

The interim code produces the right pixels on the wrong architecture:

- Animations are **driver built-ins** baked into `generate-sprites.mjs` +
  `src/sprites.ts`, referenced by a closed name set. The spec makes them
  **project assets** — `.anim` JSON files referencing project PNGs, importable
  and authorable, with stock sets imported rather than compiled in.
- Frame timing is **Phaser's** (`anims.create` + `sprite.play`, one uniform
  `frameRate`). The spec puts frame stepping in an **engine Animation Rule** that
  advances frames on `tick` by a **per-frame `delay`** and **emits events** when a
  frame changes or the animation ends — deterministic, snapshot-visible, and
  reactable in learner code.
- The frame model is a uniform horizontal strip. The spec's frame is
  `{sprite, position?, offset?, scale?, delay}` — arbitrary spritesheet cell,
  per-frame offset/scale, per-frame delay.
- Appearance is split across `SpriteProperty` and `AnimationProperty` on the
  spatial trait. The spec unifies appearance under the Animation Rule: a static
  sprite is a one-frame animation ("assign an animation _or_ a sprite directly").

## 2. Target architecture

```
  PROJECT (Codebridge, TEXT only)     LAB (transform)          COMPILE (esbuild)     PREVIEW (engine + driver)
  animations/player.anim  ─┐                                                         ┌─ AnimationRule advances
  worlds/main.world        ├─▶ .anim JSON → JS module     ─▶  bundle (text only) ─▶  │   frames on tick, emits
  (frames name stock       ─┘   exporting the AnimationDef                           │   Frame/End events
   sprites, e.g. "coin")                                                             └─ renderSnapshot exposes the
                                                                                        CURRENT frame; binding blits
  public/vendor/sprites/*.png ───────────────────────────────────────────────────▶    it, loading the vendor PNG
   (self-hosted; served on the sandbox origin, img-src 'self')                          by name from the sandbox origin
```

Four moving parts, three of them reusing seams that already exist. Crucially,
**no binary ever enters the project file map** (§7 records why): `.anim` files are
_text_, and the image bytes come from self-hosted assets on the sandbox origin,
not from project `contents`.

> **Superseded — see §9.** The bottom half of that diagram is gone. There are no
> vendor sprites at render time: an image is a file the project holds (bytes on
> the file's `url`), forwarded to the preview as a `data:` URL. `frame.sprite` is
> a project file name (`coinSpin.png`), never a stock id (`"coin"`).

1. **Serialization + loader (lab-side transform).** `.anim` / spritesheet JSON is
   text, so Codebridge stores and round-trips it like any source file. It is
   transformed — the same seam that turns `.rule`/`.actor` Blockly JSON into JS
   (`WorldRuntimeContext.generateBlocklyFiles`, `virtualFsPlugin` `EXT_ORDER`) —
   into a JS module that exports the animation definition. A frame's `sprite`
   names a **stock asset** (e.g. `"coin"`), which the driver resolves to
   `${assetBase}sprites/coin.png` on the sandbox origin — the exact mechanism
   already serving the vendor sprites. No PNG bytes travel through the compiler,
   so the string-typed file map and text-only Codebridge are untouched.
   Learner-supplied images are a separate, framework-gated concern (§7).
   _(Superseded: `frame.sprite` is a project file name, resolved against the
   assets the lab forwards — §9.)_

2. **Engine Animation Rule (`engine/rules/animation.ts`).** A new rule owning the
   appearance vocabulary:

   - an `AnimationTrait` an actor elects, requiring `PositionalTrait`;
   - an `animation` property (the id of an animation known to the world);
   - a per-world **animation registry** (`id → AnimationDef`) the builder
     populates from the imported `.anim` modules;
   - per-actor runtime state (current frame index, elapsed-in-frame);
   - an `AdvanceAnimationStep` that adds `delta` to the elapsed time and crosses
     frame boundaries by each frame's `delay`, wrapping (loop) or clamping (end);
   - `AnimationEndedEvent` (no payload) and `FrameChangedEvent` (payload: the new
     frame index — gated on per-actor event payloads, §7).

   The engine treats a frame's `sprite` as an **opaque string** — it never
   interprets pixels; it does timing, events, and surfaces the current frame's
   visual descriptor. Stays DOM-free.

3. **Render descriptor (World.renderSnapshot).** The per-actor `RenderState`
   gains the resolved current frame:

   ```ts
   frame?: {
     sprite: string;                 // stock asset ref, resolved to a self-origin URL
     cell?: {x; y; width; height};   // spritesheet source rect; absent = whole image
     offset: {x; y};                 // from the actor position (center-drawn)
     scale: number;                  // relative render scale
   };
   ```

   Absent `frame` ⇒ the fallback rectangle (an actor with no appearance).

4. **Driver (`PhaserBinding`).** Stops owning animation timing. Each render it
   reads `frame`, ensures a texture for `frame.sprite` (loaded once from
   `${assetBase}sprites/<sprite>.png` on the sandbox origin — `img-src 'self'`
   covers it, `SANDBOX.md`; _superseded: from the project's own assets, as
   `data:` URLs_ — §9), draws it cropped to `cell` at
   `(x + offset.x, y + offset.y)`, scaled by `scale * actorScale`, centered.
   Phaser becomes a blitter; `anims.create`/`play` and the built-in registry are
   removed.

## 3. Data model

Shared types (a new `engine/core/animationTypes.ts`, exported from `world-lab`),
mirroring `INTERFACE.md` exactly:

```ts
interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnimationFrame {
  sprite: string; // a project image's file name ("coinSpin.png"); the driver keys its texture by it
  position?: Cell; // spritesheet cell; omitted = the whole image
  offset?: {x: number; y: number}; // default (0, 0)
  scale?: number; // default 1
  delay?: number; // ms to hold this frame — an exception to the animation's rate
}

interface AnimationDef {
  frameRate?: number; // frames per second, for frames with no delay of their own
  frames: AnimationFrame[];
  loop?: boolean; // default true; false emits AnimationEndedEvent
}

// The `.anim` file body:  { type: 'animation', animations: {id: AnimationDef} }
// The `.sheet` file body: { type: 'sheet', cell: {width, height} }  // beside the image, same stem
// The tileset file body:  { type: 'tileset', tiles: {...} }         // §8, deferred
```

Three things moved after this was written, and the shapes above are the current
ones (`INTERFACE.md` §Animations is the reference):

- **`delay` is optional, and timing lives on the animation** as `frameRate`. A
  walk cycle has one rate; a copy of it on every frame was a set of numbers to
  keep in step by hand. `frameDelay(def, frame)` in
  `engine/core/animationTypes.ts` is the one place that resolves it — the frame's
  own delay, else the rate, else 100ms.
- **`AnimationDef.name` is gone.** An animation is named by the key it is filed
  under, which is what a `play animation` block holds; the friendly name was
  never displayed anywhere.
- **The spritesheet file is `.sheet`**, holding one cell size rather than a map
  of named cells. Nothing needed the names: a frame stores its own rectangle.
  Only the editor reads it.

A **static sprite** is still the degenerate case, but it is a property rather
than a synthesized animation: `SpriteProperty` on the appearance trait draws one
image, and `AnimationProperty` takes precedence when both are set.

## 4. Phase plan

Each phase is independently shippable and verified (unit + browser), matching how
milestones 1–7 were staged.

- **B — Engine Animation Rule.** DONE. `engine/rules/animation.ts`: the
  `AppearanceTrait` (requires `PositionalTrait`), `SpriteProperty` +
  `AnimationProperty` + internal frame state, a per-world animation registry
  (`World.animation(id)`, seeded from rules' stock + `WorldBuilder.useAnimations`),
  `AdvanceAnimationStep`, and `AnimationEndedEvent`. Appearance moved off the
  spatial trait (new `APPEARANCE` key table); `renderSnapshot` emits the `frame`
  descriptor. Stock `coinSpin`/`playerWalk` ship on the rule via
  `RuleBuilder.addAnimation`. Unit-tested (`engine/__tests__/animation.test.ts`:
  per-frame stepping, loop wrap, end-event-once + hold-last-frame, reset on
  switch, the render descriptor).

- **C — Driver renders frames.** DONE. `PhaserBinding` no longer owns timing — it
  blits the `frame` descriptor (texture per sprite, cell → strip frame index,
  offset, scale). `anims.create`/`play` gone. Browser-verified: the coin spins
  (engine-driven, same gold-oscillation signature) with the sprite/movement/
  gravity demo intact.

- **A — Learner-authored animation files.** DONE. An animation file is plain
  `.json` (no bespoke extension, no compiler change — the compiler already
  bundles `.json`), discriminated by `type: "animation"`, matching INTERFACE.md's
  `animations/player.json` example. _(Since: the extension is `.anim`, which is
  what routes the file to the visual animation editor; the body is unchanged
  JSON.)_ Frame `sprite`s are stock names the driver
  resolves, so no transform is needed. `parseAnimationFile`
  (`engine/core/animationFile.ts`) validates the imported JSON into an
  `AnimationDef` map (clear errors on malformed input); the learner `import`s the
  file and passes it to `WorldBuilder.useAnimations`. The default project ships
  `animations/pulse.json` (a per-frame `scale` pulse on the "ball" sprite), and
  the ball actor plays it. Unit-tested (`parseAnimationFile`, a compile
  round-trip inlining an animation `.json`) and browser-verified (the ball's
  red-pixel area oscillates as it pulses).

- **D — Blockly + project integration.** DONE — and later undone in its stock
  half (§9): there are no animations on the rule any more, and the dropdown
  offers the project's own ids plus `(import…)`. As shipped at the time: stock
  coin/player were spec-model `AnimationDef`s on the rule; `world_set_sprite`/`world_play_animation` elect the
  appearance trait; `src/sprites.ts` is now just the driver's load manifest. The
  `world_play_animation` dropdown is **dynamic**: an extension
  (`animationOptions.ts`, the Music-Lab `menuGenerator_` pattern) points it at a
  registry the lab refreshes from the project's animation files
  (`projectAnimationIds` in `WorldRuntimeContext`), so a learner picks stock _or_
  authored animations. `world_on_event` gained an "animation ends" option
  (`AnimationEndedEvent`). Unit-tested (`projectAnimationIds`, `animationOptions`,
  the event generator). Browser-verified end to end: the Blockly player plays the
  learner-authored `playerBob` from `animations/game.json` — its blue area
  oscillates (the bob), which only round-trips because the dropdown carried the
  authored id.

- **E — Frame events (payloads).** DONE. Per-actor event payloads already flowed
  at the engine level (`EventQueue.flush` passes `detail` to handlers); the gap
  was Blockly exposure. The Animation rule now emits `FrameChangedEvent` with the
  new frame index each advance; `world_on_event` gained an "animation frame
  changes" option and now binds the handler args
  (`(_world, _actor, eventValue) => …`, non-shadowing) so a body block can read
  the payload; a `world_log_event_value` block logs it. Unit-tested (the
  `FrameChangedEvent` index sequence; the handler + value-log generators) and
  browser-verified (a Blockly `frame changes → log event value` handler on the
  player logged the cycling frame indices 0..3). Reacting to a _specific_ frame
  (`if frame === 3`) is now possible: the Blockly vocabulary gained a
  `world_event_value` expression + `world_print`, and the toolbox offers the
  standard `controls_if` / `logic_compare` / `math_number` / … blocks (registered
  natively by `@code-dot-org/blockly`, referenced by the toolbox — not
  re-registered through the design-system Driver, which drops their connections).
  Browser-verified: a `when frame changes → if (event value = 2) → print` handler
  fires filtered to frame 2.

## 5. Migration of the interim built-ins

`coinSpin` / `playerWalk` are repurposed, not discarded. Their PNGs keep coming
from `generate-sprites.mjs` (self-hosted vendor sprites/spritesheets); what
changes is their _description_ — from a hardcoded `{frames, frameRate}` in
`src/sprites.ts` played by Phaser, to a spec-model `AnimationDef` (per-frame
`delay`, cells, offset) held by the engine's stock library and stepped by the
Animation Rule. The visual demo is preserved; its architecture moves onto the
spec's model. A future animation editor + asset uploads (§7) let learners author
their own, replacing the stock library with project `.anim` files.

That last sentence is what happened, and it finished the migration: the engine's
stock library is gone, `src/sprites.ts` with it, and `generate-sprites.mjs` now
feeds `appearance/stockImages.ts` — the same drawings, as `data:` URLs on a shelf
the import dialog copies from (§9).

## 6. Files

- New: `engine/core/animationTypes.ts`, `engine/rules/animation.ts`,
  `runtime/transform/animationAsset.ts` (the `.anim` → JS transform),
  `src/blockly/…` dropdown sourcing.
- Changed: `engine/core/World.ts` (`renderSnapshot` frame descriptor),
  `engine/core/spatialKeys.ts` + `engine/rules/spatial.ts` (drop `sprite`/
  `animation`), `engine/index.ts` (export the rule + types + stock library),
  `runtime/WorldRuntimeContext.tsx` (generalize the transform beyond Blockly),
  `runtime/driver/PhaserBinding.ts` (blit the frame descriptor from vendor URLs),
  `src/constants.ts` (default project references stock animations),
  `scripts/generate-sprites.mjs` (still emits the vendor PNGs/spritesheets),
  `src/sprites.ts` (the `ANIMATIONS` map retires; `SPRITE_NAMES` stays as the
  vendor manifest). No `virtualFsPlugin` binary change — the map stays text.

## 7. Prerequisites and risks

- **Binary project files — RESOLVED, and it is why sprites come from vendor
  assets, not project bytes.** Codebridge's project source is **text-only** and
  cannot round-trip binary today: `ProjectFile.contents` is `z.string()`
  (`core/.../sources.schemata.ts`), there is no `mimeType`/`isBinary`/`url`/
  `encoding` field, no upload/import/`FileReader` path in the Codebridge UI (the
  only add-file path writes a text placeholder), and the whole source is
  persisted as a JSON string (`sources.api.ts`, `main.json`) with no base64
  convention anywhere. Web Lab scaffolds the shape of a future feature — a mime
  table, image extensions in `supportedFileTypes`, an optional `PreviewFile.url`,
  and a service-worker `if (url) fetch(url)` branch — but nothing populates it,
  and its `new Response(stringContents)` would corrupt real image bytes. The
  repo's own comments label uploads "deferred" and point at a **`url` field +
  asset-upload endpoint** as the intended direction, not base64-in-`contents`.

  **Decision:** World Lab does not widen the file map to binary and does not
  invent a base64-in-`contents` hack that diverges from that direction. Stock
  sprite bytes stay in `public/vendor/sprites/` and are referenced by name,
  resolved to self-origin URLs at render time (§2). _(Superseded once the upload
  port landed: the decision held — the file MAP is still text — but stock bytes
  no longer live in vendor. An image is a project file with a `url`, forwarded to
  the preview as a `data:` URL, exactly as an uploaded one is. §9.)_ `.anim`/spritesheet
  definitions are text and flow through the existing text pipeline untouched.
  Everything in Phases A–D is unblocked by this. **Learner-supplied custom
  images** are handled by porting the legacy Codebridge uploader — see
  `UPLOADS.md`. That port (a `ProjectFile.url` field, a core assets client, the
  upload hook/UI, and forwarding uploaded bytes to the sandbox SW so they load
  under `img-src 'self'`) replaces the earlier "gated leaf": uploaded and stock
  sprites converge on the same self-origin render path (this plan's §2), so the
  render/rule model here is unchanged whether a sprite is stock or uploaded.

- **Per-actor event payloads.** `FrameChangedEvent` needs a payload (the frame);
  the event system currently emits per-actor with no learner-visible detail.
  Phase E depends on that work; `AnimationEndedEvent` (no payload) does not.
- **CSP.** No change — `img-src 'self'` covers the self-origin vendor textures
  (`SANDBOX.md`); no `data:` needed. _(Since: images arrive as `data:` URLs,
  which the preview policy already permits — `img-src 'self' blob: data:`. Still
  no CSP change, for a different reason; `UPLOADS.md` §3 records it.)_
- **Hot reload.** Animation _definitions_ changing ⇒ restart (structural);
  animation _selection_ (the property) changing ⇒ a live value patch, like other
  per-actor values — folds into the existing `reconcile` snapshot diff. Runtime
  frame state (index, elapsed) is not serialized; a restart resets it, a live
  patch keeps it.

## 8. Deferred (named so the loader leaves room)

- **Tilesets** (`type: 'tileset'`, Wang/blob coordinates, `mirror`) and the
  neighbor-aware Map editor painting. The loader recognizes the `type` and skips
  it for now; the render/rule model above is the substrate they build on.
- **Slope tiles / platformer angles** — advanced, per `INTERFACE.md`.

## 9. Since: the stock library became a shelf

Phases A–E shipped the model above, and then one decision changed what a sprite
IS. **There are no built-in animations or sprites.** A project draws only what it
holds; `INTERFACE.md` §Animations is the reference, and this section only records
what moved from the plan.

- **The library is import-only.** `appearance/stock.ts` holds drawings as `data:`
  URLs (drawn by `scripts/generate-sprites.mjs`, written into
  `appearance/stockImages.ts` by `scripts/write-stock-assets.mjs`) and `.anim`
  documents. Importing one **writes files into the project** — the image, its
  `.sheet` if it is a grid, and the animation that reads it. From that moment it
  is the learner's: repaintable, renamable, deletable, and nothing outside the
  project refers to it. No rule ships animations any more: `RuleBuilder`'s
  `addAnimation` seam remains, with nothing calling it.
- **`frame.sprite` is a project file name.** `coinSpin.png`, not `"coin"`. The
  driver preloads the assets the lab forwards (`runtime/projectAssets.ts` →
  `data:` URLs in the `LOAD` message) and keys textures by file name; `assetBase`
  left `PhaserBinding` with the vendor sprites. A frame's cell becomes a Phaser
  texture frame at load (`texture.add(name, 0, x, y, w, h)`), so an arbitrary
  rectangle costs nothing at draw time.
- **Every `.anim` is registered.** There is no `use animations` block: the world
  generator emits `world.useAnimations(WorldLab.parseAnimationFile(…))` for every
  animation file the project holds. Holding a file is what makes it playable.
- **Timing moved onto the animation** (`frameRate`, §3), and a spritesheet is
  declared by a `.sheet` beside the image (§3).
- **The `.anim` editor is visual.** `animationEditor/` routes `.anim` to a
  filmstrip of frames with one inspector, a looping preview with transport and
  onion skin, whole-strip operations (reverse, ping-pong), a picture picker that
  reaches the import library, and — for a sheet-backed image — one frame per cell
  in a click. Renaming an animation rewrites every `play animation` that names it
  (`blockly/renameAnimation.ts`), because the id is the only handle a block has.

**Still open:** nothing writes a `.sheet` for an image the learner uploaded, so
an uploaded strip is a picture with no cells to choose (`UPLOADS.md` §9).
