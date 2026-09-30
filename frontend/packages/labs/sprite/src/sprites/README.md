# sprites

A p5 2.x extension that gives one instance, in instance mode, the part of
p5.play 1.x that Sprite Lab uses. It is written clean-room from
`docs/sprites/`; each test names the requirement it checks. Exported as
`@code-dot-org/sprite-lab/sprites`.

## Use

```ts
import p5 from 'p5';
import {
  attachSprites,
  withSpriteLifecycle,
} from '@code-dot-org/sprite-lab/sprites';

new p5(sketch => {
  const p = attachSprites(sketch); // before setup: 400x400, 30 fps, degrees
  sketch.setup = () => {};
  sketch.draw = withSpriteLifecycle(sketch, () => p.drawSprites());
});
```

A host whose draw program finishes later than `draw` returns calls
`preDraw(p)` from `draw` and `postDraw(p)` when the program finishes
(LIF-15, LIF-21). p5 2.x's own `predraw` and `postdraw` hooks are
registered for the whole class, so the library does not use them.

## Public names for host-chosen members (overview.md Open question 1)

| Member                      | Name                          |
| --------------------------- | ----------------------------- |
| predefined-animation table  | `p.predefinedAnimations`      |
| animations-paused flag      | `p.pauseAnimationsByDefault`  |
| start time (ms since epoch) | `p.worldStartTime`            |
| natural size (SPR-26)       | `sprite.setNaturalSize(w, h)` |

## Modules

| File                    | Specification        | Notes                                            |
| ----------------------- | -------------------- | ------------------------------------------------ |
| `attach.ts`             | LIF-1..LIF-8, LIF-23 | instance members, attach-time defaults           |
| `lifecycle.ts`          | LIF-9..LIF-21        | `preDraw`, `postDraw`, `withSpriteLifecycle`     |
| `context.ts`            | LIF-1                | per-instance state, in a WeakMap                 |
| `Sprite.ts`             | SPR-, ANI-18..ANI-26 | state, update step, drawing                      |
| `Group.ts`              | GRP-, WLD-11         | groups; `draw()` sorts and draws                 |
| `World.ts`              | WLD-1..WLD-8         |                                                  |
| `attach.ts`, `edges.ts` | WLD-9..WLD-21        | `drawSprites`, `drawSprite`, `createEdgeSprites` |
| `animation/`            | ANI-                 | `Animation`, `SpriteSheet`, frame drawing, tint  |
| `camera.ts`             | CAM-1..CAM-14        | see below                                        |
| `input.ts`              | INP-1..INP-25        | see below                                        |
| `collision/`            | COL-                 | see below                                        |

## Input

- Key and button edge states live in `InputState`, one per instance
  (INP-7). `updateInputStates` is LIF-10 item 1.
- The instance's `mouseX`, `mouseY`, `mouseIsPressed`, `mouseButton` (a
  string, as in p5 1.x) and `touchIsDown` are accessors over that state,
  fed by the library's `mousedown`, `mouseup`, `mousemove`, `touchstart`
  and `touchend` listeners (INP-19..INP-21). p5 2.x's own pointer handlers
  still run, for `touches`, `winMouseX` and user callbacks, but their
  writes to those five fields are dropped, as is p5's clearing of
  `mouseIsPressed` on window blur. p5's `_setMouseButton` is a no-op.
  Assignments from anywhere else are kept, so tests and hosts may set them.
- `p._onkeydown(e)` and `p._onkeyup(e)` accept a plain `{which}` object,
  as Code.org's mobile controls pass (INP-6); real events reach the down
  set through the library's own `keydown` and `keyup` listeners.
- A `which` of 0 falls back to `keyCode` (input.md Open question 3).
- `mouseButton` starts as `'left'`; input.md gives no initial value.

## Camera

- `Camera`, `cameraPreDraw` and `cameraPostDraw` implement CAM-1..CAM-14;
  CAM-15 is `mouseIsOver` in `collision/`. `p.Camera` is bound per
  instance by `cameraConstructor(p)`. CAM-17..CAM-21 are the engine's, in
  `../camera.ts`; `__tests__/camera.test.ts` checks both.

## Collision

| File                    | Specification              |
| ----------------------- | -------------------------- |
| `collision/box.ts`      | COL-7, COL-9..COL-13       |
| `collision/collider.ts` | COL-3..COL-8, COL-16 swept |
| `collision/pair.ts`     | COL-15..COL-21, COL-23     |
| `collision/index.ts`    | COL-22, COL-24..COL-27     |

- `sprite.collider` holds `{box, swept}`; a box is a centre and its full
  width and height edge vectors. The runtime never reads it.
- Group methods are own, non-enumerable properties bound to their group
  at construction (COL-22); `isTouching` is `overlap` on sprites and
  groups alike.
- Sprite exposes `getStretch()`, `getAnchor()` and `resetAnchor()` for
  COL-6, COL-16 and COL-19.
- Deliberate departures from the fork: no loading guard for 1x1 costumes
  (COL-4, COL-27), and the bad-target error is an `Error` (COL-23).
- `mousePressedOver` reads p5's raw `mouseIsPressed`, `touchIsDown` or a
  non-empty `touches`, not the input module's edge state (COL-25, INP-27).

## Hosts

- Set `p5.disableFriendlyErrors = true` where no page script exists (as in
  tests): p5 2.x's sketch checker fetches the page's last `<script>`.
- `createVector` with a missing or non-finite component returns a vector
  with no components, whose `x` and `y` cannot be assigned. The library
  builds its vectors with `makeVector`; runtime code must not rely on
  0.5.4's behavior (LIF-24).
