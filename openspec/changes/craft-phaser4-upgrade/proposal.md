# Craft: Phaser 2 (CE) to Phaser 4 native upgrade

## Why

The `@code-dot-org/craft-lab` engine runs on `phaser-ce` 2.20 — a
community fork of a framework frozen in 2016, shipped only as a UMD
script. The engine reads Phaser off the `window` global
(`window.Phaser` + `window.PIXI`), loaded via a dashboard `<script>` tag
from a copy vendored in `apps/lib/phaser/`. That global blocks a
complete ESM module graph, tree shaking, and any modern bundling of the
lab. The craft-lab-migration change (2026-07) deliberately deferred the
engine upgrade until behavioral test coverage existed; that coverage now
exists (56 Playwright integration tests × 3 browsers = 168 executions),
and an experimental dry run has taken the whole engine to Phaser 4.2
natively and driven the entire Minecraft Adventurer course end to end.

This proposal turns that validated PoC into a production change. The PoC
lives on branch `phaser4`:

- `e363046df1b` — native Phaser 4 port, full ESM, no UMD
- `f4f862a0e95` — Phaser 4 sprite-lifecycle + origin render fix

## What Changes

- Replace `phaser-ce` with `phaser@^4.2.0`, imported as an ES module by
  the engine. Exactly one module boundary knows Phaser is a dependency;
  no globals, no UMD, no `window.PhaserGlobal`.
- Port the engine to native Phaser 4 idioms with no compatibility layer:
  - `GameController` boots a real `Phaser.Game` with two `Phaser.Scene`s
    (`earlyLoad`, `levelRunner`); `controller.scene` and
    `controller.worldGroup` (root container) replace the CE `game.*`
    facade. Scene ops queue behind the async `ready` event.
  - Display groups become `Container`s inside `worldGroup`; per-frame
    z-ordering keeps the `sortOrder` custom property via
    `container.sort('sortOrder')`.
  - Sprite animations become sprite-local `anims.create` entries with
    keyed `animationcomplete-<key>` subscriptions; CE `Signal` chains go
    away.
  - Tweens become native config objects and `tweens.chain` sequences.
  - CE `BitmapData` effects become `CanvasTexture`s (white-flash
    silhouette, dashed hint path, prismarine frame blend).
  - Camera follow/bounds and the free-play whole-world zoom-out are
    native camera/container operations.
  - CE timing semantics (`time.slowMotion`) are reproduced explicitly
    (see Timing model).
- Remove the UMD supply chain: the dashboard `<script>` tag
  (`_apps_dependencies.html.haml`), the `use_phaser` helper flag, the
  vendored `apps/lib/phaser/`, and its Gruntfile copy step.
- Adapt the small apps/ glue that touched CE APIs: the obsolete
  `game.device.whenReady` scroll hack, the `phaserLoaded()` probe
  (`game.load` → `game`), and designer touch capture.
- Port the aquatic underwater wave shader (CE `Phaser.Filter` GLSL on
  `game.world`) to a Phaser 4 camera Filter. This is the one visual the
  PoC stubbed; the GLSL is preserved and maps onto v4's Filters system.
- Decide the packaging strategy for Phaser (see Open questions).

## Capabilities

### Modified capabilities

- `craft-engine-package`: engine internals move from CE idioms to native
  Phaser 4; the public API (`GameController`, `codeOrgAPI`,
  `FacingDirection`, `EventType`, `utils`) is unchanged.
- `craft-apps-integration`: apps/ no longer supplies a Phaser global; the
  `Phaser` constructor-config key is dropped; the dashboard stops
  emitting the phaser script tag.

(Neither capability has a written spec under `openspec/specs/`; both were
named by the archived `craft-lab-migration` change. Specs to be authored
with the design phase.)

## PoC findings

These are the behavioral deltas the port must own. Each was found by
making the 56-test suite pass and driving all 14 mc levels in the
dashboard.

### Rendering: Phaser 4 does not free detached objects, and resets origins

This was the single hardest defect and the one the real change most
needs to internalize. In Phaser CE, removing a display object from its
parent effectively took it out of rendering. In Phaser 4 a GameObject
that is `remove()`d from a Container but not `destroy()`ed can remain
renderable through scene/display-list state. The craft engine removes
and rebuilds sprites constantly (every block edit, every reset), and the
CE-shaped "detach and forget" left stale sprites alive:

- After chopping the tree and pressing Reset, the log's wood-top drew
  *through* the leaf canopy, and shadow/fog layers were stale. Fresh page
  loads and production rendered correctly, so it read as reset-only.

A second, related defect: Phaser 4 re-applies a frame's default origin on
animation frame changes, dropping craft's CE-era top-left anchor
mid-animation (the aquatic "walk" frames shifted left even with a correct
model position).

The fix (`f4f862a0e95`, `LevelView.js` only) is the template the port
follows everywhere sprites are removed or animated:

- `resetSpriteOrigin(sprite)` re-asserts top-left origin on create and on
  every `animationstart`/`animationupdate`.
- `removeActionPlaneBlock(index)` removes the sprite from both containers,
  `destroy()`s it, and clears the cached slot — replacing bare
  `container.remove()`.
- `updateShadingGroup`/`updateFowGroup` use `removeAll(true)` (destroy),
  preserving only the intentionally reused base-shading and
  selection-indicator objects.

Note: an earlier candidate fix restarted the whole Phaser scene on reset.
It worked but was rejected — it rebuilds the entire scene on every reset
(needless cost) and only masked the symptom. The scene-graph dumps that
motivated it were misleading: they enumerated the intended Craft
containers, not the stale renderables left alive by non-destroying
removal. **Lesson for the port: audit every `remove`/`removeAll` for a
matching `destroy`, and every animation for origin stability.**

### Timing model

CE advances all logic (tweens, timers, animations) on a clock dilated by
`game.time.slowMotion` (`updateLogic(delta / slowMotion)` in CE
`core/Game.js`; timers/animations tick on `time.deltaTotal`). Craft sets
`slowMotion = 1.5` by default and the test harness sets `0.1` to run 15×
fast, so the dilation is load-bearing both directions. Phaser 4 has no
global equivalent; the port reproduces it exactly:

- tween: `timeScale = tweenTimeScale / slowMotion`
- timer: `delayedCall(originalMsToScaled(ms) * slowMotion)`
- animation: `frameRate = originalFpsToScaled(fps) / slowMotion`

### Coordinate and display defaults

- CE anchors sprites top-left; Phaser 4 origins default to center. Every
  sprite gets `setOrigin(0, 0)` at create (one helper) and — per the
  rendering finding above — re-asserted on animation frame changes.
- CE display-tree parenting (`sprite.addChild`) does not exist for v4
  sprites. Three replacements: the player/agent rig is a child sprite in
  a moving `Container`; static block attachments (corner shadows,
  redstone sparkles) are absolutely-positioned siblings at
  `sortOrder + 0.5` with a `destroy`-follow hook; the miniblock
  shadow+item pair is a `Container`.
- CE `group.sort('z')` on the fluff group relied on CE auto-assigned
  z = insertion order; containers already render in insertion order, so
  the call is dropped.
- Guards for CE-tolerated operations v4 rejects: re-adding a destroyed
  selection indicator during `resetGroups` redstone refresh,
  `camera.follow(undefined)` on event levels that set `gridDimensions`
  without a player, and playing animations on destroyed sprites.

### API mappings that need care (not mechanical)

- Easing: CE constants map to v4 ease strings; craft references
  `Phaser.Easing.Cubic.EaseOut`, which never existed in CE — CE fell back
  to linear, and the port preserves linear on those sites.
- CE string tween values are relative (`{y: '3'}` means +=3); v4 needs
  explicit `'+=3'`.
- Only `animationcomplete` has a keyed per-animation event; `start` and
  `repeat` handlers filter on `anim.key`.
- The CE loader was global and guarded by `resetLocked`; v4 loaders are
  per-scene. Harmless today because `levelRunner` re-queues its packs,
  but the earlyLoad warm-start value should be re-examined.
- `preserveDrawingBuffer: true` + `canvas.toDataURL` still powers the
  free-play share screenshot (verified); it also lets the test/verify
  harness read exact WebGL pixels.
- `fps: {forceSetTimeOut: true}` is honored by v4 and remains necessary
  for the deterministic test harness.

### Environment findings

- Importing `phaser` runs module-scope canvas probes; jsdom (vitest)
  needs a minimal `getContext` stub (`test/vitest-setup.ts`).
- Phaser 4's ESM artifact is a single webpack-built ~8.8 MB file with
  named exports and no `sideEffects` flag: the import is clean ESM, but
  intra-Phaser tree shaking is nil. The win is removing the UMD global
  and making the lab's own graph tree-shakable. A trimmed custom build
  from `phaser/src` is possible future work, out of scope here.
- Package dist with phaser bundled: ~1.6 MB min / ~418 KB gzip (CJS). The
  CE UMD script alone was ~3.4 MB raw, served as a separate request.
- apps webpack compiles the phaser-bundled package with no config change;
  dashboard levels boot and hot-reload normally. (Webpack does pick up a
  rebuilt `dist`; comments are stripped, so verify a served bundle by
  grepping a code signature, not a comment.)

### PoC shortcuts the real change must redo properly

- `game.debug.text` sites became `console.debug`; decide whether to keep
  any debug overlay.
- Corner-shadow/sparkle lifecycle follows block `destroy` but not CE
  kill-visibility; acceptable visually, worth a second look.
- The aquatic wave-shader port is stubbed with TODO markers in
  `LevelView` (`waveShader`, `world.filters`, uniforms plumbing).
- Legacy lint debt in the engine files (`no-var`, `@ts-nocheck`,
  `no-this-alias`) predates the port and fails the repo-root pre-commit
  hook even though the package's own gates pass; PoC commits used
  `--no-verify`. The real change should clear the debt or align the hook,
  not bypass it.
- `test/helpers/RunLevel.js` (dead karma-era helper referencing sinon)
  should be deleted.
- With real Phaser types available, the `@ts-nocheck` headers in
  `GameController.ts`/`AssetLoader.ts`/`CodeOrgAPI.ts` are removable with
  modest typing work.

## Verification

The gates that validated the PoC become the acceptance gates:

- Package: `yarn test` (vitest), `yarn typecheck`, `yarn lint`, and the
  Playwright suite green on chromium, firefox, and webkit (168
  executions; the suite is behavior-parity ported from the original
  tape/karma tests, and `resetAttempt` exercises the reset path in every
  test).
- Dashboard: full Minecraft Adventurer (`/courses/mc`) progression,
  levels 1–14, driven end to end, including the minecart ride, day/night
  cycle, free-play zoom-out, and the share-dialog canvas thumbnail.
- Rendering regression gate (new; catches the class of bug above):
  1. **Pixel diff vs production.** WebGL `toDataURL` yields exact
     backing-store pixels (both have `preserveDrawingBuffer`);
     `pixelmatch` and ImageMagick `compare` are installed. Initial render
     vs prod on mc level 2 was ~403/160,000 px (~0.25%), essentially the
     player idle-animation frame; mask the player to compare the static
     scene.
  2. **Chop + reset invariants.** After running the tree-chop solution
     and pressing Reset, initial-vs-post-reset must be 0 differing pixels
     over the tree region and the player-masked scene, and the scene must
     hold 0 non-top-left active sprite origins and 0 stale
     block/shadow/fog sprites. The existing e2e harness destroys the game
     per level and does not drive this UI flow, so add an explicit
     chop→reset visual + invariant assertion.
- Beyond the PoC: spot-check one level each from aquatic (`/s/aquatic`),
  agent, and designer (`/s/minecraft`) in the dashboard once the wave
  shader is ported, plus a before/after boot-time and FPS sanity check.

## Impact

- `frontend/packages/labs/craft/`: all engine files (~18 game files,
  net line count roughly unchanged); `package.json` (phaser dep),
  `vite.config.ts` (UMD middleware removed), `vitest.config.ts` (+setup
  file); `src/types/phaser.d.ts` and `src/phaserShim.ts` deleted.
- `apps/src/craft/{simple,aquatic,agent,designer}/craft.js`: three small
  glue adaptations each; `apps/lib/phaser/` deleted; `apps/Gruntfile.js`
  phaser copy step deleted.
- `dashboard/app/views/levels/_apps_dependencies.html.haml`: phaser
  script tag removed; `dashboard/app/helpers/levels_helper.rb`
  `use_phaser` flag removed.
- `frontend/yarn.lock`: phaser@4.2.0 added, phaser-ce removed.
- No Rails model, level config, or curriculum changes. Public engine API
  unchanged; `gameControllerConfig.Phaser` is accepted-and-ignored during
  transition, then removed from the four call sites.

## Open questions

1. **Phaser packaging.** The PoC ships phaser as a devDependency so vite
   bundles it into `dist/` and apps needs no dependency change (~1.6 MB
   min). Alternatives: declare phaser a real dependency and externalize
   it so apps' webpack dedupes it, or split it into a lazily-loaded
   chunk. Recommend deciding in design; bundled-in-dist is the simplest
   correct option and matches how the lab is consumed today.
2. **earlyLoad scene value.** CE's `resetLocked` warm-start is gone; the
   earlyLoad scene still preloads asset packs but its in-flight loads are
   discarded if `loadLevel` arrives first. Keep, simplify, or drop the
   two-phase boot?
3. **Renderer type.** The PoC uses `Phaser.AUTO` (WebGL, as CE
   effectively did). v4's Canvas renderer is deprecated; accept
   WebGL-only, or keep AUTO for its fallback while it lasts? Related: the
   port currently runs `antialias:true, roundPixels:false`; CE was
   effectively pixel-art (nearest). Moving to `pixelArt: true` is the
   correct end state for crisp sprites and should be decided here.
