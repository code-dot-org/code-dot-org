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
  runtime/     CoreLibrary, commands, drawUtils, locationUtils (ported)
  animations/  loading a project's images into animations
  Engine.ts    the engine class
  index.ts     the export
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
  apart from the test harness.
- **Interpreter.** `CustomMarshalingInterpreter` from
  `@code-dot-org/lab/interpreter`, as `P5Lab` used apps' copy. `P5Lab`
  gives the interpreter every command as a global, and also every global
  `P5Wrapper.getGlobalPropertyList` names: p5's drawing and math functions
  and p5.play's. Blocks reach sprites through the commands, by sprite id;
  of the p5 globals, the Sprite Lab pool (`dashboard/config/blocks/
GamelabJr`) calls only `random` and, in its line-drawing block, `push`,
  `stroke`, `strokeWeight`, `line` and `pop`. The engine exposes p5's
  drawing and math functions as `P5Lab` did, and not p5.play's objects.
- **Engine.** Loads a level's images, compiles the program, runs and reruns
  it, pauses drawing, captures frames, and reports scene jumps, music,
  controls and the player to the view. It replaces the parts of `P5Lab` and
  `SpriteLab` that `SpriteLab2Engine` uses, and carries `SpriteLab2Engine`
  itself.

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
3. The runtime, with `CoreLibraryTest` and the command tests ported.
4. Animation loading.
5. The engine class, with a demo scene run in a browser.
6. Wiring the engine into the views (layer 5).
