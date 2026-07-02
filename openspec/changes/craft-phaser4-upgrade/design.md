# Design: Craft Phaser 2 (CE) → Phaser 4 native upgrade

## Context

`@code-dot-org/craft-lab` runs on `phaser-ce` 2.20, loaded as a UMD
global (`window.Phaser` + `window.PIXI`) from a copy vendored in
`apps/lib/phaser/` and injected by a dashboard `<script>` tag. The
craft-lab-migration change deliberately kept Phaser 2 as a Vite external
and deferred the engine upgrade until behavioral coverage existed. That
coverage now exists (56 Playwright tests × 3 browsers), and a validated
PoC on this branch (`e363046df1b`, `f4f862a0e95`) has taken the engine to
Phaser 4.2 natively and driven the whole Minecraft Adventurer course.

This design records the decisions that PoC settled. It is grounded in
what actually broke and what fixed it, not in speculation.

## Goals / Non-Goals

Goals:
- Engine runs on `phaser@4` imported as an ES module; no `window.Phaser`,
  no UMD, no vendored Phaser copy, no dashboard phaser `<script>` tag.
- Native Phaser 4 idioms at every call site; no compatibility shim.
- Byte-for-byte behavioral parity across all five craft variants and
  pixel parity vs production on the mc course.
- The lab's own module graph becomes tree-shakable ESM.

Non-Goals:
- No Lab2 migration, no gameplay/curriculum changes, no Rails changes.
- No trimmed custom Phaser build (Phaser's own bundle stays whole).
- No change to level config, the Craft model, or asset-serving paths.

## Decisions

### 1. Native port, no compatibility layer

A CE-shaped facade over Phaser 4 was prototyped and rejected: it hid the
real API deltas (which is where the bugs live) and left dead surface. The
port rewrites each call site in native v4 — Scenes, Containers,
`anims`, `tweens`, `CanvasTexture`, camera — so the code says what it
does and the type surface is real.

### 2. Phaser 4 as an ES module; UMD global removed

`GameController` `import`s `phaser` directly. The dashboard `<script>`
tag, the `use_phaser` helper flag, `apps/lib/phaser/`, and its Gruntfile
copy step are removed. `gameControllerConfig.Phaser` is
accepted-and-ignored during the transition, then dropped from the four
apps call sites. Rationale: the UMD global is the sole reason the lab
cannot be a clean ESM module; removing it is the point of the change.

### 3. Reproduce CE `slowMotion` timing explicitly

CE dilated all logic time by `game.time.slowMotion`
(`updateLogic(delta / slowMotion)`); tweens, timers, and animations all
scaled with it. Craft depends on this in both directions (default 1.5;
test harness 0.1 to run 15× fast). Phaser 4 has no global equivalent, so
the port bakes the factor into each subsystem: tween
`timeScale = tweenTimeScale / slowMotion`, timer delay `× slowMotion`,
animation `frameRate ÷ slowMotion`. Verified against the CE source.

### 4. Sprite lifecycle: destroy on remove; re-assert origin on animation

This is the load-bearing rendering decision. In Phaser 4 a GameObject
`remove()`d from a Container but not `destroy()`ed can stay renderable
via scene/display-list state; CE effectively dropped it. The craft engine
removes and rebuilds sprites on every block edit and every reset, so the
CE-shaped "detach and forget" left stale sprites alive (log wood-top
through the leaf canopy, stale shadow/fog after a chop+reset). Separately,
Phaser 4 re-applies a frame's default origin on animation frame changes,
dropping craft's top-left anchor mid-animation (the aquatic water shift).

Decision, applied everywhere sprites are removed or animated:
- re-assert top-left origin on create and on every
  `animationstart`/`animationupdate` (`resetSpriteOrigin`);
- destroy-and-clear on removal (`removeActionPlaneBlock`), not bare
  `remove()`;
- `removeAll(true)` on shading/fog groups, preserving only the
  intentionally reused base-shading and selection-indicator objects.

Invariant for the whole port: **every `remove`/`removeAll` has a matching
`destroy`; every animation keeps a stable origin.**

### 5. Rejected: restart the Phaser scene on reset

An alternative fix restarted the `levelRunner` scene on every reset. It
worked but was rejected: it pays a full scene rebuild on every reset and
only masks the symptom. The scene-graph dumps that motivated it were
misleading — they enumerated the intended Craft containers, not the
stale renderables left alive by non-destroying removal. Decision #4 fixes
the cause at a fraction of the cost. (History on branch `craft`,
`c70014cafa5`.)

### 6. CanvasTexture for BitmapData; camera Filter for the wave shader

CE `BitmapData` effects (white-flash silhouette, dashed hint path,
prismarine frame blend) become `CanvasTexture`s drawn with the 2D
context. The aquatic underwater wave shader (CE `Phaser.Filter` GLSL on
`game.world`) maps onto the Phaser 4 Filters system as a camera filter
(`WaveFilter.js`): a `BaseFilterShader` render node carries the CE GLSL
adapted to the v4 contract (scene arrives as `uMainSampler` via
`boundedSampler`, varying `outTexCoord`, caustics atlas bound as a second
sampler), and a `Filters.Controller` holds the per-frame uniforms (time,
surface texture, camera offset, tint). `attachWaveFilter(camera)`
registers the node once per renderer and attaches a controller to the
main camera's internal filter list. One fix beyond a literal transcription:
the displaced sample is clamped into `[0,1]` to match CE's clamp-to-edge
wrap — without it the wave pushes the top/bottom rows off-frame where
`boundedSampler` returns transparent, producing a black bar that pulses
with the wave. Ported and verified equivalent to prod on all six
underwater levels, including the cold-ocean tint.

### 7. Phaser packaging: bundled in dist (revisit)

The PoC ships `phaser` as a devDependency so Vite bundles it into `dist`
(~1.6 MB min / ~418 KB gzip); apps needs no new dependency and webpack
compiles unchanged. Alternatives (externalize + apps-level dedupe, or a
lazy chunk) are viable but heavier to wire; bundled-in-dist matches how
the lab is consumed today. Open for the design review (see proposal).

## Risks / Trade-offs

- **Rendering regressions are invisible to the current e2e suite.** The
  harness destroys the game per level and never drives the chop→reset UI
  flow, so it missed the sprite-lifecycle bug entirely. Mitigation: a new
  pixel + invariant gate (below) and the sprite-lifecycle invariant.
- **Phaser 4 has no intra-library tree shaking** (single webpack bundle,
  no `sideEffects`). The ESM win is the lab's own graph and removing the
  global, not shrinking Phaser.
- **Canvas renderer is deprecated in v4.** The port uses `Phaser.AUTO`
  (WebGL, as CE effectively did). Pixel-art config (`pixelArt: true`,
  nearest, `roundPixels`) is the correct end state for crisp sprites and
  should be set as part of this change.
- **FPS could not be measured above 60 Hz in the sandbox.** The verifier
  runs Firefox under Xvfb, whose software timer caps at 60 Hz, so any
  headroom above 60 fps is invisible; no regression was observed within
  that ceiling. Two candidate trims were evaluated and rejected: the
  per-frame worldGroup depth sort is sub-millisecond and production does
  the same sort (not a dev-vs-prod delta), and `preserveDrawingBuffer` is
  prod-shared and required for `toDataURL` (share thumbnail + pixel-diff
  verifier). A real gap, if any, needs a Performance-tab trace on the
  user's actual display. Note also the renderer split seen in
  verification — prod runs the CE Canvas renderer, dev the v4 Beam WebGL
  renderer — which is partly a sandbox artifact (chromium SIGTRAPs on
  WebGL under the sandbox; firefox-headless falls back to Canvas2D), so
  raw-throughput comparison is not apples-to-apples.

## Rendering regression gate (new)

WebGL `toDataURL` yields exact backing-store pixels (both port and prod
run `preserveDrawingBuffer`); `pixelmatch` and ImageMagick `compare` are
installed. Two checks, added because the class of bug above is otherwise
undetected:
1. Initial render vs production per representative level (mask the
   idle-animating player region before diffing).
2. After chop+reset: initial-vs-post-reset must be 0 differing pixels
   over the tree region and player-masked scene, with 0 non-top-left
   active sprite origins and 0 stale block/shadow/fog sprites.

## Migration / rollout

Behavioral parity means no flag is needed; the swap is internal to the
package plus the apps/dashboard glue that supplied the global. Ship
behind the existing test gates. The wave-shader port (done in the PoC)
and the pixel gate land in the same change so aquatic levels are covered
before release.

## Open questions

Tracked in `proposal.md` (packaging, earlyLoad two-phase boot, renderer
type / pixel-art config).
