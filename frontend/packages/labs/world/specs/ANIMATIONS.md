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
  PROJECT (Codebridge)                LAB (transform)            COMPILE (esbuild)         PREVIEW (engine + driver)
  animations/player.anim  ─┐                                                               ┌─ AnimationRule advances
  sprites/Player.png       ├─▶ .anim JSON → JS module   ─▶  bundle; .png → dataurl,  ─▶    │   frames on tick, emits
  scenes/main.js           ─┘   that imports its PNGs        .json → json (already)         │   Frame/End events
                                                                                            └─ renderSnapshot exposes
                                                                                               the CURRENT frame; the
                                                                                               binding just blits it
```

Four moving parts, three of them reusing seams that already exist:

1. **Serialization + loader (lab-side transform).** `.anim` / spritesheet JSON is
   transformed — the same seam that turns `.rule`/`.actor` Blockly JSON into JS
   (`WorldRuntimeContext.generateBlocklyFiles`, `virtualFsPlugin` `EXT_ORDER`) —
   into a JS module that `import`s each referenced PNG and exports the animation
   definition with sprite paths replaced by the imported values. The compiler
   already loads `.png` as `dataurl` and `.json` as `json` (`virtualFsPlugin.
loaderFor`), so a transformed `.anim` module resolves to a self-contained
   object whose sprite fields are `data:` URLs — no network, no new transport.

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
     sprite: string;                 // opaque image ref (a data: URL post-compile)
     cell?: {x; y; width; height};   // spritesheet source rect; absent = whole image
     offset: {x; y};                 // from the actor position (center-drawn)
     scale: number;                  // relative render scale
   };
   ```

   Absent `frame` ⇒ the fallback rectangle (an actor with no appearance).

4. **Driver (`PhaserBinding`).** Stops owning animation timing. Each render it
   reads `frame`, ensures a texture for `frame.sprite` (keyed by a hash of the
   ref; loaded once from the `data:` URL — `img-src 'self' blob: data:` already
   permits it, `SANDBOX.md`), draws it cropped to `cell` at
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
  sprite: string; // image ref; a project path pre-compile, a data: URL after
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
  the lab-side transform (`.anim` JSON → JS module importing its PNGs). Extend
  the compiler FS to carry PNG **bytes** (§7) and confirm the existing `dataurl`
  loader inlines them. Unit-test the transform; add a compile round-trip that
  imports a `.anim` and asserts its frames' sprites are `data:` URLs. No runtime
  behavior yet.

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
  `world_on_event` gains `AnimationEnded`. Repackage the stock coin/player as
  importable `.anim` + spritesheet + PNG assets in the default project; drop the
  driver built-ins (`src/sprites.ts`, the animation half of
  `generate-sprites.mjs` becomes a stock-asset emitter). Browser-verify the
  authored path end to end.

- **E — Frame events (payloads).** Once per-actor event payloads land (§7), add
  `FrameChangedEvent` with the frame index and a `world_on_event` option, so a
  learner can react to a specific frame (footstep sounds, hit frames).

## 5. Migration of the interim built-ins

`coinSpin` / `playerWalk` are repurposed, not discarded: the generator emits them
as **stock project assets** (a `.anim` + a spritesheet PNG + its `.json`) that the
default project imports, rather than as compiled-in driver constants. The visual
demo is preserved; only its provenance changes from built-in to imported asset.

## 6. Files

- New: `engine/core/animationTypes.ts`, `engine/rules/animation.ts`,
  `runtime/transform/animationAsset.ts` (the `.anim` → JS transform),
  `src/blockly/…` dropdown sourcing.
- Changed: `engine/core/World.ts` (`renderSnapshot` frame descriptor),
  `engine/core/spatialKeys.ts` + `engine/rules/spatial.ts` (drop `sprite`/
  `animation`), `engine/index.ts` (export the rule + types),
  `runtime/WorldRuntimeContext.tsx` (generalize the transform beyond Blockly),
  `runtime/compile/virtualFsPlugin.ts` (PNG bytes), `runtime/driver/PhaserBinding.
ts`, `src/constants.ts` (default project assets), `scripts/generate-sprites.
mjs` (emit stock `.anim`/spritesheet assets), `src/sprites.ts` (retire).

## 7. Prerequisites and risks

- **Binary project files.** The compiler's file map is `Record<string, string>`;
  PNGs are bytes. The lab must convey PNG bytes (base64 in the map, decoded to a
  `Uint8Array` for esbuild's `dataurl` loader), which in turn requires Codebridge
  to store/round-trip binary project files. If it cannot yet, stock assets ship as
  base64 embedded directly in the transformed `.anim` module as an interim, and
  learner-supplied PNGs wait on the Codebridge capability. **This is the gating
  unknown.**
- **Per-actor event payloads.** `FrameChangedEvent` needs a payload (the frame);
  the event system currently emits per-actor with no learner-visible detail.
  Phase E depends on that work; `AnimationEndedEvent` (no payload) does not.
- **CSP.** No change — `img-src 'self' blob: data:` already covers `data:`-URL and
  self-origin textures (`SANDBOX.md`).
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
