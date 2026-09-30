# Sprite Lab engine

The engine runs a student's Sprite Lab program: it interprets the code the
blocks generate, keeps the sprites, runs their behaviors and events each
frame, and draws the scene. This describes how it is built in this package,
in place of apps' `SpriteLab2Engine` and the stack under it.

## Decision

The engine is a slim p5 runtime extracted from apps (option 2 of the three
weighed): apps' sprite runtime library and its commands, ported, over
upstream p5, with a new engine class in place of `P5Lab`. It lives in this
package under `src/engine/` and is exported on its own, as
`@code-dot-org/sprite-lab/engine`, so another lab can use it without Sprite
Lab's UI.

It does not use Code.org's forks, `@code-dot-org/p5.play` 1.3.21-cdo and
`@code-dot-org/p5` 0.5.4-cdo.10. Upstream p5.play 1.x was never published
to npm; the fork is its only npm release, and the package now named p5play
(version 3) is a different library under a different licence. So p5 comes
from upstream, 2.x, as a dependency, and the part of p5.play the runtime
uses is a library of our own: `src/sprites/`, exported as
`@code-dot-org/sprite-lab/sprites`, written clean-room from behavioral
specifications (`docs/sprites/`). p5 is LGPL-2.1 and is used as a separate,
unmodified library; the sprite library is Apache 2.0 like the rest of this
package, because none of it derives from p5.play's code.

## What apps' stack is made of

`SpriteLab2Engine` extends `SpriteLab`, which extends `P5Lab`.

- `P5Lab` (1,580 lines) is the legacy StudioApp shell: jQuery, the project
  and submit helpers, Droplet config, the JavaScript debugger, mobile
  controls, its own Redux reducers. `SpriteLab2Engine` already stubs
  `StudioApp` and the mobile controls; the shell does not come.
- The runtime is `spritelab/CoreLibrary.js` (1,035 lines) and
  `spritelab/commands/` (2,631), with `drawUtils.js` and `locationUtils.js`.
  These come, as they are, apart from their apps imports.
- `P5Wrapper.js` (724 lines) makes a p5 instance with p5.play installed and
  patches both; what Sprite Lab needs of it is in `docs/sprites/`.
  `P5SpriteWrapper.js` (337) and `P5GroupWrapper.js` (76) override
  p5.play's collision methods, but `P5Wrapper` installs them only outside
  Sprite Lab: both classic Sprite Lab and `SpriteLab2Engine` run the fork's
  own collisions (COL-1). They do not come.
- `SpriteLab2Engine.js` (1,373) is the Lab2 part: scenes, platform physics,
  the camera, image preloading, frame capture. It becomes the engine class.

## Layers

```
src/sprites/   the p5.play replacement, clean-room: Sprite, Group,
               animations, sprite sheets, colliders, collisions, camera,
               input edges; exported as @code-dot-org/sprite-lab/sprites
src/engine/
  runtime/     CoreLibrary, commands, their p5lab helpers and effect
               shapes (ported), RuntimeHost
  animations/  fetching a project's images and building the
               predefined animation table
  interpreter/ ProgramRunner: the part of apps' JSInterpreter Sprite
               Lab runs on
  globals.ts   the p5 functions and constants a program sees
  sceneLibrary.ts  the commands Sprite Lab 2 adds to each run
  platform.ts  platform physics, the set-zoom camera, character poses
  Engine.ts    the engine class, SpriteLabEngine
  index.ts     the export, @code-dot-org/sprite-lab/engine
```

- **p5.** Upstream p5 2.x in instance mode, one instance per engine. It
  provides the canvas, the draw loop, drawing, images, text, and raw
  keyboard and mouse state. Nothing is added to `p5.prototype`; the sprite
  core attaches to the instance, so two engines on a page do not share
  state.
- **Sprite library.** A TypeScript implementation of the p5.play members
  the runtime uses (below), as `P5Wrapper` configures p5.play for Sprite
  Lab. It is implemented from
  `docs/sprites/`, whose writers read the fork and whose implementers do
  not; apps' `GameLabSpriteTest`, `GameLabGroupTest` and `GameLabP5Test`
  run against it as further checks, where they test Sprite Lab's
  configuration rather than Game Lab's.
- **Runtime.** `CoreLibrary` and the commands, taking the sprite core's p5
  instance where they took `P5Wrapper`'s. Their apps tests run unchanged
  apart from the test harness. What apps reached through its Redux store,
  `audioApi` and the Blockly globals goes through a `RuntimeHost` the
  engine passes to `CoreLibrary`: workspace alerts, text and choice
  prompts, console lines, speech, and the workspace's variable names.
  Commands are typed by `defineCommands`, which makes `this` the
  `CoreLibrary` the host applies them to, as apps did. Changes from apps
  beyond typing:
  - `drawBackground` calls `image(bg, 0, 0)`; p5 2.x has no one-argument
    form.
  - `setBackgroundImageAs` takes only an image from
    `predefinedAnimations`; `drawBackground` cannot draw an `Animation`.
  - `getP5Color` sets alpha with `setAlpha`, not p5 0.5.4's `_array`.
  - Sounds play through the package's own `audio/sounds`, which sends an
    absolute URL through the media proxy (`src/assetPaths.ts`) as apps'
    `assetPrefix.fixPath` did.
  - The runtime's own kept bugs are in the compatibility register with the
    library's (CMP-9, CMP-21, CMP-47).
- **Animations.** What apps split between its `animationList` Redux
  module, `SpriteLab2Engine`'s preload and `P5Wrapper`:
  - `normalizeAnimationList` readies a saved list: ANI-39's defaults,
    duplicate names renamed, malformed lists rejected.
  - `loadAnimationSources` fetches each image (`animationSourceUrl`) and
    holds it as an object URL in `dataURI`, as Sprite Lab 2 did; the
    caller revokes them with `revokeAnimationSources`. Failures go to an
    `onError` callback where apps opened an error dialog.
  - `AnimationTable` builds `p.predefinedAnimations` from loaded images,
    clean-room from ANI-27 and ANI-35..ANI-38: stills, or grid animations
    for multi-frame images when `multiFrame` is set; unchanged entries keep
    their objects, and a load overtaken by newer data is dropped.
  - `preloadSceneImages` and `loadImageOnDemand` are `SpriteLab2Engine`'s
    scene preload and on-demand decode: crop costumes (ANI-37), load, prune
    what the scene cannot reference.
  - Apps' v3-to-v1 default-sprite migration is not carried: it needs the
    classic project API, and Sprite Lab 2 projects postdate it.
- **Interpreter.** `ProgramRunner` (`src/engine/interpreter/`) is the part
  of apps' `JSInterpreter` Sprite Lab runs on, over
  `CustomMarshalingInterpreter` from `@code-dot-org/lab/interpreter`:
  parsing helper and user code together, stepping in per-tick budgets, the
  event loop appended to the program, and error reports with apps'
  wording. An interpreted function that reaches native code becomes a
  native one that queues itself and, when the program is idle, runs at
  once and returns its value; apps did this through a static hook on the
  class, the runner does it per instance. The debugger, breakpoints and
  code highlighting are not carried. Watch expressions take a variable or
  a dotted path, which is all `getVariableValue` asks.
- **Globals.** Besides the commands, a program sees the p5 functions
  listed in `globals.ts` (math, color, drawing, text, time), p5's
  constants, the sprite library's input queries, and apps' droplet
  globals `randomNumber` and `getTime`. `P5Lab` gave the list
  `P5Wrapper.getGlobalPropertyList` returned, which is not read here; the
  list is ours. Of the p5 globals, the Sprite Lab pool
  (`dashboard/config/blocks/GamelabJr`) calls only `random` and, in its
  line-drawing block, `push`, `stroke`, `strokeWeight`, `line` and `pop`;
  `NativeSpriteLab` calls `color` and `randomNumber`. Sprites, groups and
  `World` are not exposed: blocks reach sprites through the commands, by
  id. `p5.Color`, `p5.Vector` and `p5.Image` are marshalled by reference.
- **Engine.** `SpriteLabEngine` replaces the parts of `P5Lab` and
  `SpriteLab` that `SpriteLab2Engine` used, and carries `SpriteLab2Engine`
  itself, with its public members kept for the views: `initForLevel`,
  `runProgram`, `rerun`, `setDrawPaused`, `captureFirstFrame`,
  `cancelSceneJump`, `setPlayerObserver`, `destroy`, and the `on…`
  callbacks.
  - One p5 instance lives as long as the engine; each run builds a fresh
    `CoreLibrary` and `ProgramRunner` over it. Runs are serialized, and a
    request made while one waits is folded into it.
  - p5 2.x awaits an async `setup` and an async `draw` before scheduling
    the next frame. The first frame waits for the program's global code;
    a frame whose `draw` callback outruns its tick budget returns a
    promise the tick loop resolves, and calls `postDraw` then (LIF-15).
    Between frames a 1ms interval steps the program, as `P5Lab`'s tick
    timer did.
  - The images come from the host (`images`), already fetched; waiting for
    them and rerunning when late ones arrive is the view's.
  - Scene jumps, story lanes, platform commands, the dimmed platform
    background and the zoomed draw loop are `sceneLibrary.ts` and
    `platform.ts`, from `SpriteLab2Engine.createLibrary` and its per-frame
    methods.
  - p5's friendly errors are off: in 2.x they fetch and lint the page's
    scripts.
- **Changes from `SpriteLab2Engine`.**
  - The missing-costume guard runs before the on-demand decode and reads
    `p.predefinedAnimations`, which here holds only what the scene
    decoded; it checks the project's image list instead, so a costume the
    preload skipped still decodes on demand.
  - During a scene jump no frame runs the program or updates sprites, so
    the last frame stays up under the fade, as its comment intended.
  - Validation code, the speed slider, mobile controls and the classic
    `preview` path are not carried; Sprite Lab 2 used none of them.
  - A fix in `@code-dot-org/lab`: `CustomMarshalingInterpreter` declared
    `customMarshaler` and `asyncFunctionList` as class fields, which reset
    them to `undefined` after the base constructor set them, so custom
    marshalling never ran in any frontend lab. They are now `declare`d.

## The contract

What the runtime (`CoreLibrary`, the commands, `drawUtils`,
`locationUtils`, `SpriteLab2Engine`) uses, found by reading those files.

p5.play, on the p5 instance: `createSprite`, `createEdgeSprites`,
`drawSprites`, `allSprites`, `edges`, `World`, `camera`, `keyDown`,
`keyWentDown`, `mouseIsOver`, `mousePressedOver`, `mouseWentDown`,
`mouseWentUp`.

On a sprite, p5.play's and Code.org's: `animation`, `baseScale`, `collide`,
`delay`, `depth`, `destroy`, `direction`, `displace`, `dragging`,
`getAnimationLabel`, `getScale`, `getScaledHeight`, `glideTargets`,
`group`, `height`, `id`, `isTouching`, `lifetime`, `mirrorX`, `mirrorY`,
`name`, `overlap`, `position`, `removed`, `rotation`, `scale`,
`setAnimation`, `setScale`, `speed`, `targetSet`, `tint`, `velocity`,
`width`, `x`, `y`, and a few Lab2 fields (`characterState`,
`initialAngle`, `startFacing`, `xOffset`, `yOffset`).

The rest of the 64 p5 members used are standard p5 drawing and math, which
upstream p5 provides.

## Order of work

1. Done. Behavioral specifications for the sprite library
   (`docs/sprites/`), with the compatibility register of kept fork bugs
   (`docs/sprites/compatibility.md`).
2. Done. The sprite library, implemented to them clean-room, with p5 2.x
   as a dependency and the `./sprites` export. Every requirement and test
   vector is a test, and every register entry is pinned by a test that
   names it.
3. Done. The runtime, with `CoreLibraryTest` and the command tests
   ported (`src/engine/runtime/__tests__/`); all pass unchanged in intent.
4. Done. Animation loading (`src/engine/animations/`). jsdom decodes no
   images, so p5 2.x's `loadImage` on object and data URLs is first
   exercised by step 5's browser demo.
5. Done. The engine class (`src/engine/Engine.ts`), with a demo page,
   `engine-demo.html` (`?scene=platform` for the platform scene), which
   `e2e/engine.spec.ts` drives: keys, a touch event, dragging, and a
   player landing under a zoom.
6. Wiring the engine into the views (layer 5).
