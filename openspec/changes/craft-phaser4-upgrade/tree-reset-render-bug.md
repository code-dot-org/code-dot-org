# Handoff: tree canopy renders wrong after chop + reset (Phaser 4 port)

Status: **fixed in the Craft port working tree; verified against prod.**
The original report below is kept as investigation history. This section
records the final conclusion and verification state as of 2026-07-02.

Context: this is the native Phaser 2 (CE) → Phaser 4 port of the craft
engine. PoC lives in `frontend/packages/labs/craft/`, committed as
`poc(craft): native Phaser 4 port, full ESM, no UMD` (`e363046df1b`).
The engine is consumed by `apps/src/craft/*` and served in the dashboard.

## Final conclusion

The render bugs were a class of Phaser 4 porting issues in
`frontend/packages/labs/craft/src/js/game/LevelMVC/LevelView.js`. They
were not caused by Rails, level data, or a need to restart the Phaser
scene on reset.

Two defects mattered:

1. Removed block, shadow, and fog sprites were being detached from Craft
   containers without being destroyed. In Phaser 4, those objects can
   still remain renderable through scene/display-list state, so reset and
   block-refresh paths could leave old visual sprites behind. This
   explained the level 2 completion/reset symptom: the chopped wood block
   could remain visible over Steve, and shadow/fog layers could appear
   wrong after the tree was destroyed.
2. Animated sprites could lose the Craft engine's Phaser CE-era
   top-left anchor assumption when Phaser 4 animation frame changes
   applied frame defaults. This explained the level 7 water mismatch:
   the animated water frame shifted left even though the model position
   was correct.

The implemented Craft-only fix does the following:

- Adds a `resetSpriteOrigin(sprite)` helper and applies it when sprites
  are created.
- Re-applies top-left origin on `animationstart` and `animationupdate`,
  keeping animated atlas frames stable.
- Replaces action-plane block removal with `removeActionPlaneBlock`,
  which removes the old sprite from both relevant containers, destroys
  it, and clears the cached slot.
- Changes shading and fog refreshes to destroy removed children
  (`removeAll(true)`), while preserving the base shading and selection
  indicator objects that are intentionally reused.

The earlier lead about restarting the whole Phaser scene is no longer
the preferred fix. It was broader than needed and would make every reset
path pay for a full scene rebuild. The observed scene graph dumps were
misleading because they covered the intended Craft containers, not all
stale renderable Phaser objects left alive by non-destroying removal.

## Verification conclusion

Local checks passed after the Craft-only fix:

- `yarn workspace @code-dot-org/craft-lab build`
- `yarn workspace @code-dot-org/craft-lab typecheck`
- `yarn workspace @code-dot-org/craft-lab test`
- `yarn test:ui --project=chromium --grep 'Craft: Adventurer'` from
  `frontend/packages/labs/craft` (`17/17` passed)
- `./tools/hooks/pre-commit`

Browser verification was run muted with `agent-browser`, comparing live
prod and live localhost:

- Prod: `https://studio.code.org/courses/mc/units/1/lessons/1/levels/<n>`
- Local: `http://localhost-studio.code.org:9000/courses/mc/units/1/lessons/1/levels/<n>`
- Captures and `summary.json`: `/tmp/mc-after7-live-sweep`

Levels 8-14 were loaded in initial state and solved successfully on both
prod and local. Level 10 was also run through an incorrect-answer path.
Behavior matched prod in every run.

Local Phaser 4 invariants were clean in all tested states:

| Level | States checked | Animated-origin offenders | Stale direct sprites |
| --- | --- | ---: | ---: |
| 8 | initial, success | 0 | 0 |
| 9 | initial, success | 0 | 0 |
| 10 | initial, incorrect answer, success | 0 | 0 |
| 11 | initial, success | 0 | 0 |
| 12 | initial, success | 0 | 0 |
| 13 | initial, success | 0 | 0 |
| 14 | initial, success | 0 | 0 |

Whole-canvas pixel AE is not expected to be zero on animated levels
unless prod and local animation clocks are frame-locked. The important
post-fix checks are behavioral parity, zero non-top-left active sprite
origins, and zero stale block/shadow/fog-like direct scene sprites. Those
all passed for the after-level-7 sweep.

## Symptom

On the Minecraft course "Chop Tree" level (level 2), after the player
runs a program that chops the tree **and then presses Reset**, the
spruce log's wood-top face renders **through** the leaf canopy: a brown
wood-ring block appears in the lower-center of the leaves, where solid
leaves should be.

- **Fresh page load of the same level: correct** (leaves fully cover the
  log; only the trunk peeks out the bottom).
- **Production (studio.code.org, Phaser 2/CE): correct** in the same
  chop-then-reset sequence.
- So this is a **port + reset-path-only regression.**

It is not limited to the exact solution — any chop of the tree followed
by a reset reproduces it. The functional model is fine (level completes,
inventory correct); this is purely a render defect.

## Environment / how to run

Servers (from repo root `/.../.claude/worktrees/craft`):
- Rails: `bin/dashboard-server` (health: `curl localhost:3000/health_check`)
- apps webpack: `cd apps && yarn start` (serves `http://localhost-studio.code.org:9000`)
- Level URL: `http://localhost-studio.code.org:9000/courses/mc/units/1/lessons/1/levels/2`
- **:9000 hot-reload takes ~30s.** First navigation after a cold start can 504 for ~60s while webpack compiles.

How the dashboard gets the engine:
- apps imports `@code-dot-org/craft-lab` and resolves the package's built
  `dist/` (per its `exports` map), **not** `src/`. After editing engine
  source you must `cd frontend/packages/labs/craft && yarn build`, then
  webpack picks up the new `dist`. Verified the served bundle updates:
  `curl -s .../assets/js/craft.js | grep <code-marker>` (comments are
  stripped by vite, so grep for a code signature, not a comment).
- The package's own vite dev harness (`yarn dev`, port 5173/5199) and the
  Playwright e2e suite use `src/` directly — good for fast iteration, but
  the e2e harness destroys the game after each level and does **not**
  exercise the chop→reset UI flow, so it does not currently catch this.

## Steps to reproduce (automated, via Playwright)

The dashboard exposes `window.__TestInterface.loadBlocks(xml)` and the
level's solution as `window.appOptions.level.solutionBlocks`. Drive it:

```js
// 1. navigate, wait for boot, pick a character, dismiss instruction dialog
await page.goto('http://localhost-studio.code.org:9000/courses/mc/units/1/lessons/1/levels/2',
  {waitUntil: 'commit', timeout: 120000});
await page.waitForFunction(() => window.Craft?.gameController && window.__TestInterface);
await page.waitForFunction(() => document.querySelectorAll('#phaser-game canvas').length > 0);
await page.waitForTimeout(4000);
for (let i = 0; i < 8; i++) {
  const sel = page.getByText('Select', {exact: true}).first();
  if (await sel.isVisible().catch(() => false)) { await sel.click(); await page.waitForTimeout(700); continue; }
  const ok = page.getByRole('button', {name: 'OK'});
  if (await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(700); continue; }
  break;
}
// 2. run the solution (chops the tree), wait for the success dialog
await page.evaluate(() => window.__TestInterface.loadBlocks(window.appOptions.level.solutionBlocks));
await page.click('#runButton');
await page.waitForSelector('#continue-button', {state: 'visible', timeout: 120000});
// 3. RESET — this is the trigger
await page.evaluate(() => document.getElementById('resetButton').click());
await page.waitForTimeout(2500);
// 4. capture the canvas (WebGL toDataURL works: preserveDrawingBuffer is on)
const png = await page.evaluate(() => document.querySelector('#phaser-game canvas').toDataURL('image/png'));
```

Manual: play the level, drag the solution (2× move forward → tree, then a
`use`/chop), Run, then click Reset. Watch the tree.

## Production baseline

Prod renders the post-reset tree correctly. Capture it the same way for
diffing (prod also has `__TestInterface` and `preserveDrawingBuffer`):

```
URL: https://studio.code.org/s/mc/lessons/1/levels/2
```

Gotchas capturing prod: an autoplay video modal covers the page — close
it (`#x-close` / `.video-modal .x-close`) before the character-select
loop, and use `{timeout}`-guarded clicks. Prod canvas is also 400×400.

### Pixel-diff harness (already validated; use as the regression gate)

WebGL `toDataURL` gives exact backing-store pixels (both prod and port
have `preserveDrawingBuffer: true`). `pixelmatch` (in
`apps/node_modules`) and ImageMagick (`compare`, `convert`) are both
installed.

```bash
# decode a captured dataURL to PNG
python3 -c "import re,base64; s=open('cap.txt').read().strip().strip('\"'); \
  open('cap.png','wb').write(base64.b64decode(re.sub(r'^data:image/png;base64,','',s)))"
# count differing pixels
compare -metric AE -fuzz 8% a.png b.png diff.png
# heatmap (red = differ) + side-by-side
compare -fuzz 8% a.png b.png -compose src heat.png
convert +append a.png b.png sidebyside.png
# crop the tree region (400x400 space) and zoom
convert x.png -crop 200x210+80+20 +repage -scale 300% tree.png
```

Baseline numbers already measured on this build:
- **Initial port render vs production: ~403 / 160,000 px differ (~0.25%)**,
  essentially all the player idle-animation frame. Masking the player box
  (x148–218, y240–340) drops it to ~150 px (tall-grass sway + AA). The
  initial static scene is effectively pixel-perfect — do not chase it.
- **Initial vs post-reset (same build): ~10,500 px differ**, concentrated
  on the tree, plus a faint 1-px mesh along every block edge.

Note the idle-animating player and swaying tall grass make a naive
whole-frame diff noisy; mask the player and compare the tree region.

## Key diagnostic data (what makes this hard)

The post-reset scene graph is **byte-identical** to the correct
fresh-load render. Verified via `page.evaluate` dumps of the leaf and log
sprites in both states — all of the following match exactly:

- sprites present at the tree cell: exactly one `Log_Spruce` (action
  group, x=147 y=138 sortOrder=40) and one `Leaves_Spruce0.png` (fluff
  group, x=60 y=0 sortOrder=0). No third/extra sprite (checked every
  group with a bounds-contains-point test at the wood-top pixel ~168,158).
- leaf frame: texture `leavesSpruce`, frame `Leaves_Spruce0.png`,
  **trimmed** atlas frame (real 240×240, trimmed to 155×150), cut
  {x:155,y:152,w:155,h:150}, origin (0,0), no custom pivot.
- world-group child order: `[ground, shading, hint, action, fluff, fow]`
  in both — the fluff (leaves) container is **above** the action (log)
  container, so the leaves should composite over the log.
- alpha=1, tint identical, scale 1, depth 0, blendMode 0, getBounds
  identical, camera scroll (0,0), worldGroup transform (0,0,1,1) — all
  identical, full precision (not rounded).

So nothing observable at the game-code layer differs, yet the pixels
differ. A **freshly created** `leavesSpruce/Leaves_Spruce0.png` sprite
placed over the log also lets the log show through — i.e., that leaf
frame genuinely has no opaque pixels at ~(168,158). Therefore the
*fresh-load* render's coverage is coming from renderer state that a fresh
Phaser scene has and the in-place reset rebuild does not.

### Fixes that were tried and did NOT work (in the buggy reset state)

- `worldGroup.bringToTop(fluffGroup)` (leaves already on top anyway)
- `leaves.setFrame('Leaves_Spruce0.png')` / `setTexture(...)`
- nearest-filtering every texture (`textures.each(t => t.setFilter(1))`)
- forcing a GPU re-upload (`texture.source[0].update()`)
- a fresh leaves sprite in a brand-new container on top
- **recreating all six group containers on every reset** (destroy the
  containers and re-run `createGroups()` in `resetGroups`) — implemented,
  confirmed live in the served bundle, still reproduced. Reverted.

Camera `roundPixels` was already true and scroll was integer (0,0), so
the all-edges mesh in the heatmap is not a simple camera sub-pixel shift.
Config note: the port currently runs `antialias:true, pixelArt:false,
roundPixels:false, scaleMode LINEAR` — CE was effectively pixel-art
(nearest). Switching to pixel-art is the correct end state regardless,
but nearest filtering alone did not fix this bug.

## Historical leads / hypotheses (superseded)

These were the best leads before the final fix above. They are kept here
to show what was ruled out or narrowed, not as current next steps.

1. **Phaser 4 Beam renderer state on in-place scene rebuild.** The one
   thing that differs between the correct render (fresh page load →
   `create()` → new containers) and the buggy render (Reset → in-place
   `resetGroups`) is that fresh load builds the scene into brand-new
   objects while Reset clears/refills existing ones. Recreating the group
   *containers* did not help, but the whole scene (scene systems, render
   nodes, SpriteGPULayer batches, texture bindings) is still the
   long-lived one. **Strongest candidate fix: make Reset restart the
   Phaser scene** (`this.game.scene.stop('levelRunner')` +
   `start('levelRunner')`, or `scene.restart`) so everything is rebuilt
   from scratch — matching the fresh-load path. Must re-verify across all
   14 mc levels (Reset fires on every level) and the 168-exec e2e suite.
   See reset flow: `CodeOrgAPI.ts:49` `resetAttempt` → `GameController.ts:201`
   `reset()` → `LevelView.js:561` `reset()` → `LevelView.js:1778` `resetGroups()`.
2. **Trimmed-atlas-frame compositing in Beam.** The leaf frame is trimmed
   (240→155). Beam handles trimmed-frame geometry via render nodes; a
   stale/misbuilt vertex or UV batch for the trimmed frame after a rebuild
   could drop the opaque region. Diagnose by capturing the WebGL draw
   calls / render-node list for the fluff sprite on a fresh scene vs after
   reset (Spector.js or Beam debug), and diff them. If they differ with
   identical scene state, that pins it to Beam.
3. **Whole-scene 1-px composite shift.** The heatmap shows a 1-px red
   mesh on *every* block edge init-vs-reset, not just the tree — evidence
   the entire frame composites ~1 px differently after reset. Camera
   scroll/worldGroup transform were identical, so if this is real it is a
   renderer-internal rounding that flips on the rebuild. Worth confirming
   whether the edge mesh is a true shift or just AA noise (compare with
   `pixelArt/roundPixels` forced on in the game config and rebuilt).

## Reference file:line pointers (`frontend/packages/labs/craft/src/js/game/`)

- Tree build (log in action group, leaves in fluff group, despawn anim):
  `LevelMVC/LevelView.js:2333` `buildTree` (inside `createBlock` at :2322)
- Display groups (containers under `worldGroup`, fluff after action):
  `LevelMVC/LevelView.js:1769` `createGroups` / `:1762` `createGroup`
- Reset rebuild path: `LevelMVC/LevelView.js:561` `reset` → `:1778` `resetGroups`
- Group draw order sort per frame: `LevelMVC/LevelView.js:618` `render`
- Sprite/anim helpers: `:526` `createSprite`, `:510` `createAnim`
- Scene + worldGroup setup: `game/GameController.ts:136` `LevelRunnerScene`,
  `:248` `create` (worldGroup at :249), `:201` `reset`
- Reset entry from UI: `apps/src/craft/simple/craft.js` resetButton →
  `Craft.gameController.codeOrgAPI.resetAttempt()` (`CodeOrgAPI.ts:49`)

## Historical suggested next steps (superseded)

1. Do not pursue `scene.restart` as the first fix. The narrower
   sprite-lifecycle and origin fix above resolved the observed bugs.
2. Beam render-node debugging is no longer needed for this issue unless a
   new trimmed-atlas compositing regression appears with destroyed stale
   sprites and stable top-left origins.
3. A future regression test should cover the chop→reset visual path and
   the animated-origin invariant, because the existing e2e suite does not
   exercise this exact reset UI flow.

The historical investigation above was produced with the servers running
and the PoC build at `e363046df1b`; the experimental
container-recreation change was reverted. The current working tree has
the Craft-only `LevelView.js` fix described in the final conclusion.
