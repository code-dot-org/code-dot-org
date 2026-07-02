## ADDED Requirements

### Requirement: Engine runs on Phaser 4 imported as an ES module
The engine SHALL depend on `phaser@^4` and import it as an ES module. It SHALL NOT read Phaser from a global (`window.Phaser`/`window.PIXI`), set `window.PhaserGlobal`, or require a UMD script. `phaser-ce` SHALL NOT be a dependency.

#### Scenario: No global Phaser reference
- **WHEN** `grep -rn "window.Phaser\|window.PIXI\|window.PhaserGlobal" frontend/packages/labs/craft/src` is run
- **THEN** no matches are found

#### Scenario: Phaser imported as a module
- **WHEN** `frontend/packages/labs/craft/src/js/game/GameController.ts` is read
- **THEN** it contains `import Phaser from 'phaser'` and constructs `new Phaser.Game(...)` from that import

#### Scenario: phaser-ce removed
- **WHEN** `frontend/packages/labs/craft/package.json` and `frontend/yarn.lock` are read
- **THEN** `phaser-ce` is absent and `phaser@^4` is present

### Requirement: Native Phaser 4 architecture, no compatibility layer
The engine SHALL use native Phaser 4 constructs directly — `Phaser.Scene`, `Container`, sprite `anims`, `tweens`, `CanvasTexture`, camera — with no CE-shaped facade or shim module.

#### Scenario: Scene-based boot
- **WHEN** a level loads
- **THEN** the engine runs a `Phaser.Scene` (`levelRunner`) whose `create` builds the world into a root `Container`, and `controller.scene`/`controller.worldGroup` are the handles the engine draws through

#### Scenario: No compat facade
- **WHEN** the engine source tree is inspected
- **THEN** there is no `phaser2compat`/shim module translating a Phaser 2 surface onto Phaser 4

### Requirement: Removed display objects are destroyed
Whenever a block, shadow, or fog sprite is removed from its container, the engine SHALL `destroy()` it (not merely detach it) and clear any cached reference, so no stale sprite remains renderable after a rebuild or reset. Intentionally reused objects (base shading, selection indicator) are exempt and preserved.

#### Scenario: Action-plane block removal
- **WHEN** an action-plane block sprite is replaced or cleared (e.g. a chopped tree log)
- **THEN** the old sprite is removed from both the action and ground containers, destroyed, and its cached slot set to null

#### Scenario: No stale sprites after chop + reset
- **WHEN** the mc "Chop Tree" level is solved and then Reset
- **THEN** the scene contains zero stale block/shadow/fog sprites, and the tree renders with the leaf canopy covering the log (no wood-top showing through)

### Requirement: Sprite origin stable across animation frames
Sprites SHALL keep a top-left origin (0, 0) at creation and across animation frame changes, so animated atlas frames do not shift when Phaser 4 re-applies frame default origins.

#### Scenario: Animated sprite stays anchored
- **WHEN** an animated sprite (e.g. the aquatic player walk) plays and advances frames
- **THEN** its origin remains (0, 0) on every `animationstart`/`animationupdate` and the frame does not shift relative to the model position

#### Scenario: No non-top-left active sprites after reset
- **WHEN** any level is reset
- **THEN** every active sprite in the display groups has origin (0, 0)

### Requirement: Slow-motion timing parity
The engine SHALL reproduce CE's global `time.slowMotion` dilation so tweens, timers, and animations run at the same wall-clock rate as the Phaser 2 build for a given `slowMotion` value.

#### Scenario: Tween/timer/animation scale together
- **WHEN** `slowMotion` is set (default 1.5, or 0.1 in the test harness)
- **THEN** tween `timeScale`, timer delay, and animation frame rate are scaled by that value so command execution timing matches the Phaser 2 baseline

### Requirement: Aquatic wave shader ported to Phaser 4 Filters
The underwater wave/caustics effect (a CE `Phaser.Filter` applied to `game.world`) SHALL be reimplemented as a Phaser 4 camera Filter that preserves the original GLSL and per-frame uniforms (time, surface texture, tint, camera offset).

#### Scenario: Underwater levels show the wave effect
- **WHEN** an aquatic level (`isAquaticLevel`) is loaded
- **THEN** the underwater wave/caustics effect renders, with cold-ocean tint applied where the level specifies it

### Requirement: Behavioral and visual parity with the Phaser 2 build
The port SHALL produce no observable change to gameplay across the five craft variants, and SHALL match production rendering on the mc course.

#### Scenario: Integration suite parity
- **WHEN** the Playwright integration suite runs on chromium, firefox, and webkit
- **THEN** all 168 executions pass, matching the Phaser 2 baseline results

#### Scenario: Pixel parity vs production
- **WHEN** an mc level's initial render is captured and compared to production (player-animation region masked)
- **THEN** the static scene matches production within anti-aliasing tolerance

### Requirement: Package gates green under Phaser 4
The package SHALL build, typecheck, and pass unit tests with Phaser 4.

#### Scenario: Build, typecheck, vitest
- **WHEN** `yarn build`, `yarn typecheck`, and `yarn test` run in `frontend/packages/labs/craft`
- **THEN** each succeeds (Phaser's import-time canvas probes are satisfied by the jsdom setup stub)
