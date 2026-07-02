# Tasks: Craft Phaser 2 (CE) → Phaser 4 native upgrade

A validated PoC exists on this branch (`e363046df1b`, `f4f862a0e95`).
These tasks productionize it. Boxes checked below were proven in the PoC
and carry over; unchecked boxes are remaining productionization work.

## 1. Dependency + module boundary

- [x] 1.1 Add `phaser@^4.2.0`; remove `phaser-ce`. Regenerate `frontend/yarn.lock` and commit it.
- [x] 1.2 `GameController` imports `phaser` as an ES module; delete `src/types/phaser.d.ts` and `src/phaserShim.ts`.
- [ ] 1.3 Decide Phaser packaging (Open question 1): bundled-in-dist (PoC default), externalized + apps dedupe, or lazy chunk. Implement the chosen option and note it in `vite.config.ts`.
- [x] 1.4 Remove the Vite UMD-serve middleware and `optimizeDeps` phaser-ce entry from `vite.config.ts`.

## 2. Engine port (native Phaser 4)

- [x] 2.1 Boot a real `Phaser.Game` with `earlyLoad` + `levelRunner` `Phaser.Scene`s; expose `controller.scene` and `controller.worldGroup`; queue scene ops behind the `ready` event.
- [x] 2.2 Display groups → `Container`s under `worldGroup`; per-frame `container.sort('sortOrder')`.
- [x] 2.3 Animations → sprite-local `anims.create` + keyed `animationcomplete-<key>` subscriptions; drop CE `Signal` chains.
- [x] 2.4 Tweens → native config objects and `tweens.chain`; map easings (preserve linear where CE fell back, e.g. `Cubic.EaseOut`); convert relative string values to `+=`.
- [x] 2.5 `BitmapData` effects → `CanvasTexture` (white flash, hint path, prismarine blend).
- [x] 2.6 Camera follow/bounds and free-play whole-world zoom-out → native camera/container ops.
- [x] 2.7 Reproduce CE `slowMotion` timing (tween timeScale, timer delay, animation frameRate).
- [x] 2.8 Loader → per-scene `scene.load`; `atlasJSONHash` → `atlas`; audio stays routed to the injected `audioPlayer`.
- [x] 2.9 Screenshot path (`preserveDrawingBuffer` + `canvas.toDataURL`) verified for free-play share.
- [x] 2.10 Add guards for CE-tolerated ops v4 rejects (destroyed selection indicator on redstone refresh, `camera.follow(undefined)`, play-on-destroyed-sprite).

## 3. Rendering correctness (sprite lifecycle + origin)

- [x] 3.1 `resetSpriteOrigin(sprite)` on create and on `animationstart`/`animationupdate`.
- [x] 3.2 `removeActionPlaneBlock(index)`: remove from both containers, `destroy()`, clear the cached slot; replace bare `remove()` in `createActionPlaneBlock` and `refreshActionGroup`.
- [x] 3.3 `updateShadingGroup`/`updateFowGroup` use `removeAll(true)`; preserve base-shading and selection-indicator.
- [ ] 3.4 Audit the whole engine for the invariant: every `remove`/`removeAll` has a matching `destroy`; every animation keeps a stable origin. Fix any remaining sites beyond the ones the PoC touched.
- [ ] 3.5 Set pixel-art render config (`pixelArt: true` / nearest / `roundPixels`) to match CE crispness (Open question 3).

## 4. Aquatic wave shader

- [ ] 4.1 Port the CE `Phaser.Filter` GLSL (underwater wave/caustics) to a Phaser 4 camera Filter; remove the `LevelView` TODO stubs (`waveShader`, `world.filters`, uniforms).
- [ ] 4.2 Verify aquatic levels (cold/warm ocean tint, surface scroll) against production.

## 5. apps/ + dashboard glue

- [x] 5.1 Adapt the four variant `craft.js` files: drop the `game.device.whenReady` scroll hack, change `phaserLoaded()` to probe `game` not `game.load`, fix v4 touch capture.
- [ ] 5.2 Remove `gameControllerConfig.Phaser` from the four call sites once the accepted-and-ignored transition period ends.
- [x] 5.3 Remove the dashboard phaser `<script>` tag from `_apps_dependencies.html.haml`.
- [ ] 5.4 Remove the `use_phaser` flag from `levels_helper.rb` and any now-dead references.
- [ ] 5.5 Delete `apps/lib/phaser/` and its `Gruntfile.js` copy task.

## 6. Cleanup / tech debt

- [ ] 6.1 Replace `console.debug` stubs (former `game.debug.text`) — decide whether any debug overlay stays.
- [ ] 6.2 Delete `test/helpers/RunLevel.js` (dead karma-era helper).
- [ ] 6.3 Remove `@ts-nocheck` from `GameController.ts`/`AssetLoader.ts`/`CodeOrgAPI.ts` with real Phaser types; clear `no-var`/`no-this-alias` debt so the repo-root pre-commit hook passes without `--no-verify`.
- [x] 6.4 Add `test/vitest-setup.ts` jsdom canvas stub for Phaser's import-time probes.

## 7. Verification gates

- [x] 7.1 `yarn test` (vitest), `yarn typecheck` green.
- [ ] 7.2 `yarn lint` green (blocked on 6.3).
- [x] 7.3 Playwright e2e 168/168 across chromium + firefox + webkit.
- [x] 7.4 Full mc course (levels 1–14) driven end to end in the dashboard, including minecart, day/night, free-play zoom-out, share thumbnail.
- [ ] 7.5 Add a chop→reset rendering-regression test (pixel diff + sprite-lifecycle/origin invariants) — the existing e2e harness does not drive the reset UI flow.
- [x] 7.6 Chop+reset pixel parity proven (initial vs post-reset 0px, tree + player-masked scene) with the LevelView fix.
- [ ] 7.7 Spot-check one aquatic, one agent, and one designer level vs production after the wave shader lands; before/after boot-time and FPS sanity check.
