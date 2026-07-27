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
  scenes/main.js           ├─▶ .anim JSON → JS module     ─▶  bundle (text only) ─▶  │   frames on tick, emits
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
   covers it, `SANDBOX.md`), draws it cropped to `cell` at
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
  sprite: string; // stock asset ref (e.g. "coin"); driver resolves to a self-origin URL
  position?: Cell; // spritesheet cell; omitted = the whole image
  offset?: {x: number; y: number}; // default (0, 0)
  scale?: number; // default 1
  delay: number; // ms until the next frame
}

interface AnimationDef {
  name?: string; // friendly, localizable
  frames: AnimationFrame[];
  loop?: boolean; // default true; false emits AnimationEndedEvent
}

// The `.anim` file body: { type: 'animation', animations: {id: AnimationDef} }
// The spritesheet file body: { type: 'spritesheet', sprite, cells: {id: {position}} }
// The tileset file body:     { type: 'tileset', tiles: {...} }   // §8, deferred
```

A **static sprite** is the degenerate case: `frames: [{sprite, offset?, scale?,
delay: Infinity}], loop: false`. `SpriteProperty` folds into the rule as sugar
that registers such a one-frame animation, preserving the current API.

## 4. Phase plan

Each phase is independently shippable and verified (unit + browser), matching how
milestones 1–7 were staged.

- **A — Serialization + asset transform.** Add the `.anim`/spritesheet types and
  the lab-side transform (`.anim` JSON → JS module exporting the definition;
  frame `sprite`s stay stock-asset names). Register the transform on the
  existing seam (`WorldRuntimeContext`, `virtualFsPlugin` `EXT_ORDER`). All text
  — no compiler FS or binary changes. Unit-test the transform and a compile
  round-trip importing a `.anim`. No runtime behavior yet.

- **B — Engine Animation Rule.** `engine/rules/animation.ts`: trait, `animation`
  property, world registry, `AdvanceAnimationStep`, `AnimationEndedEvent`. Fold
  `SpriteProperty` in. `renderSnapshot` emits the `frame` descriptor. Delete the
  `sprite`/`animation` string fields from the spatial trait and `SPATIAL` keys.
  Unit-test frame stepping deterministically (elapsed → index across `delay`
  boundaries; loop wrap vs. clamp + `AnimationEndedEvent`); test static-sprite
  sugar and the render descriptor.

- **C — Driver renders frames.** Rework `PhaserBinding` to blit the `frame`
  descriptor (texture-per-sprite cache, cell crop, offset, scale, center). Remove
  the anims registration and the built-in preload. Browser-verify parity — the
  demo coin still spins, now driven by the engine.

- **D — Blockly + project integration.** `world_play_animation`'s dropdown is
  sourced from the project's `.anim` ids (dynamic, not a fixed list);
  `world_on_event` gains `AnimationEnded`. Repackage the stock coin/player as a
  spec-model `AnimationDef` **stock library** whose frames name the vendor PNGs
  (still emitted by `generate-sprites.mjs`); the default project references them
  by id. `src/sprites.ts`'s uniform-strip `ANIMATIONS` map retires. Browser-
  verify the authored path end to end.

- **E — Frame events (payloads).** Once per-actor event payloads land (§7), add
  `FrameChangedEvent` with the frame index and a `world_on_event` option, so a
  learner can react to a specific frame (footstep sounds, hit frames).

## 5. Migration of the interim built-ins

`coinSpin` / `playerWalk` are repurposed, not discarded. Their PNGs keep coming
from `generate-sprites.mjs` (self-hosted vendor sprites/spritesheets); what
changes is their _description_ — from a hardcoded `{frames, frameRate}` in
`src/sprites.ts` played by Phaser, to a spec-model `AnimationDef` (per-frame
`delay`, cells, offset) held by the engine's stock library and stepped by the
Animation Rule. The visual demo is preserved; its architecture moves onto the
spec's model. A future animation editor + asset uploads (§7) let learners author
their own, replacing the stock library with project `.anim` files.

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
  resolved to self-origin URLs at render time (§2). `.anim`/spritesheet
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
  (`SANDBOX.md`); no `data:` needed.
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
