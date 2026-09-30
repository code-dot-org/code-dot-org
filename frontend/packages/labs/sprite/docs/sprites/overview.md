# Overview and frame lifecycle

The sprite library is an extension of one p5 instance, used in instance
mode. It gives that instance sprites, groups, a `World` object, edge
sprites, a camera and keyboard and mouse edge state, and it runs a fixed
sequence of work before and after the sketch's `draw` on every frame. This
document says what the library adds to the instance, what it does when it
is attached, and the exact order of that per-frame work. The other
documents cite the order by the identifiers here.

"The fork" below means `@code-dot-org/p5.play` 1.3.21-cdo over
`@code-dot-org/p5` 0.5.4-cdo, as apps' `P5Wrapper` configures it for
Sprite Lab. "The runtime" means `CoreLibrary`, the Sprite Lab commands,
`drawUtils`, `locationUtils` and `SpriteLab2Engine`. "The host" means the
code that owns the p5 instance and its draw loop: `P5Wrapper` and `P5Lab`
in apps, the engine in this package.

## Scope and attachment

LIF-1. The library attaches to exactly one p5 instance. All of its state
(sprites, groups, the `World` object, the camera, key and mouse edge
state, the start time) belongs to that instance. Two instances on one page
share no library state. The library adds nothing to `p5.prototype` and
nothing to the global object.

LIF-2. Each member below exists on an attached instance. Members marked
lazy may be created on first read, but every later read returns the same
object.

| Member                                                                                        | Kind                                | Specified in   |
| --------------------------------------------------------------------------------------------- | ----------------------------------- | -------------- |
| `createSprite(x, y, w, h)`                                                                    | function                            | SPR-1..SPR-4   |
| `allSprites`                                                                                  | Group, lazy                         | GRP-10..GRP-13 |
| `Group`                                                                                       | constructor, used with `new`        | GRP-1          |
| `createGroup()`                                                                               | function                            | GRP-2          |
| `World`                                                                                       | object, lazy                        | WLD-1..WLD-8   |
| `drawSprites(group)`                                                                          | function                            | WLD-9..WLD-13  |
| `drawSprite(sprite)`                                                                          | function                            | WLD-14         |
| `createEdgeSprites()`                                                                         | function                            | WLD-15..WLD-21 |
| `edges`                                                                                       | Group or undefined, writable        | WLD-15, WLD-20 |
| `leftEdge`, `rightEdge`, `topEdge`, `bottomEdge`                                              | sprites, set by `createEdgeSprites` | WLD-16         |
| `camera`                                                                                      | Camera                              | CAM-           |
| `keyDown`, `keyWentDown`, `keyWentUp`, `mouseDown`, `mouseUp`, `mouseWentDown`, `mouseWentUp` | functions                           | INP-           |
| `mouseIsOver(sprite)`, `mousePressedOver(sprite)`                                             | functions                           | COL-, INP-     |
| `loadAnimation`, `loadSpriteSheet`                                                            | functions                           | ANI-           |
| `rgb(r, g, b, a)`                                                                             | function                            | LIF-8          |
| predefined-animation table                                                                    | object, writable, initially absent  | SPR-30         |
| animations-paused-by-default flag                                                             | boolean, writable                   | ANI-           |
| start time                                                                                    | number (ms since epoch)             | LIF-5, WLD-7   |

The runtime reaches three of these through names the host code chooses
rather than p5.play's public API: the predefined-animation table (filled
by `P5Wrapper.preloadSpriteImages`, read by `Sprite.setAnimation` and by
`SpriteLab2Engine`'s costume check), the start time (read by
`CoreLibrary.getUnpausedWorldTime`), and the paused-by-default flag (set
only by `P5Wrapper.preloadAnimations`, which Sprite Lab does not call). An
implementation shall offer each under a public name and the ported
runtime shall use that name; see Open questions.

LIF-3. The fork has a "fixed animation frame size" mode that
`P5Wrapper.startExecution` turns on for every instance, Sprite Lab
included, before any sprite exists. The library implements only the
behavior of that mode; the sizing rules in SPR-20..SPR-27 are that mode's.
There is no switch.

## At attachment

LIF-4. When the library is attached, before the sketch's setup runs, it:

1. sets the instance's angle mode to degrees;
2. sets the target frame rate to 30;
3. makes 400 by 400 the size of the default canvas;
4. records the start time (LIF-5);
5. creates the camera at position (0, 0), zoom 1, inactive and not yet
   centered (CAM-).

`allSprites` is empty and `edges` is undefined.

Degrees are part of the contract, not a default the host may change: the
runtime passes degrees to `p5.sin`, `p5.cos` and `p5.rotate` (the
foreground effects in `effectCommands.js`), and sprite rotation is in
degrees (SPR-11).

LIF-5. The start time is the wall-clock time, in milliseconds since the
epoch, at attachment. It is never reset while the instance lives, and a
rerun inside the same instance (LIF-19) keeps it.

LIF-6. Whenever a canvas is created on the instance (the default canvas
included), the current fill color is afterwards (127, 127, 127), opaque.

LIF-7. The host then sets the target frame rate: 30, or the rate that was
in effect before slow-step mode, or 1 while the step-speed control is
below full speed (`P5Wrapper.setP5FrameRate`). This is host behavior;
the library only provides the frame-rate setter through `World`
(WLD-6).

LIF-8. `rgb(r, g, b, a)` returns the p5 color with channels r, g, b and
alpha a × 255, where a is first replaced by 1 if it is falsy. So
`rgb(92, 101, 180, 0.5)` has alpha 127.5, and `rgb(10, 20, 30, 0)` is
opaque. The runtime calls it from the "rain" foreground effect.

## The frame

A frame has six steps. Steps 2 and 5 are the library's; the others are
the host's and are stated so that the library's steps have a fixed place
among them.

LIF-9. Step 1, frame start. The host decides to draw (LIF-16), records
the frame start time, increments the instance's `frameCount` by one, and
resets the transformation matrix to the identity.

LIF-10. Step 2, pre-draw. The library runs, in this order:

1. input edge-state bookkeeping: each tracked key and mouse button moves
   from "went down" to "down", from "went up" to "up", and so on, from the
   raw state p5 holds at this moment (INP-);
2. the sprite update pass (LIF-11);
3. camera on (CAM-): on the first frame that finds the camera at (0, 0)
   and not yet centered, it is moved to (canvas width / 2, canvas height / 2) and marked centered; `camera.mouseX` and `camera.mouseY` are
   computed from the current mouse position; if the camera is not active,
   the camera transform is pushed and the camera becomes active.

LIF-11. The sprite update pass visits `allSprites` by index, starting at
0, and stops when the index reaches the group's size, reading the size
afresh before each visit. Each visited sprite runs its update step
(SPR-40..SPR-49). A sprite that removes itself during its update (its
lifetime reaching 0, SPR-46) leaves `allSprites` at once, so the sprite
that followed it moves into its index and is not visited in this pass.

Example: `allSprites` is [A, B, C], all with lifetime 1. In the pass, A
is removed at index 0; C is now at index 1 and is visited and removed; B
was never visited. After the frame only B remains, with lifetime 1. On
the next frame B is removed. (Run on the fork.)

LIF-12. The order of `allSprites` at the start of step 2 is the order the
last `drawSprites()` call left it in (WLD-11), with sprites created since
then appended in creation order. In Sprite Lab `drawSprites()` runs every
frame, so the update order is ascending depth, ties in their previous
order.

LIF-13. Step 3, draw. The host calls the sketch's draw. Immediately after
that call returns the host copies the current mouse position into the
previous-mouse position (`pmouseX`, `pmouseY`) and the touch position
likewise (INP-). In Sprite Lab the call only schedules the interpreted
draw program, so this copy happens before the program runs.

LIF-14. Step 4, the draw program. In Sprite Lab this is
`executeDrawLoopAndCallbacks`: background, behaviors, events,
`drawSprites()`, variable bubbles, speech bubbles, foreground effects,
title, story text; `SpriteLab2Engine` replaces it in platform scenes with
a loop that turns the camera off and on around its passes (CAM-). The
program may finish synchronously or on a later host tick. Throughout it
the camera is active unless the program turned it off (LIF-10 item 3), so
everything it draws goes through the camera transform.

LIF-15. Step 5, post-draw. When, and only when, the draw program has
finished, the library runs, in this order:

1. spatial index maintenance. The fork keeps a quadtree that Sprite Lab
   never activates; this item has no observable effect and need not
   exist;
2. camera off (CAM-): if the camera is active, the camera transform is
   popped and the camera becomes inactive.

LIF-16. Step 6, frame end. The host sets the measured frame rate to
1000 / (this frame's start time − the previous frame's start time),
stores this frame's start time as the previous one, and, while looping,
asks the browser for the next animation frame. On each animation frame
the host draws (step 1) only if looping is off or at least 1000 / target
rate − 5 milliseconds have passed since the previous frame start;
otherwise it waits for the next animation frame. No frame starts before
the previous frame's draw program has finished.

LIF-17. Consequences that the other documents rely on:

- The update pass precedes everything the program does in a frame. A
  sprite created during the draw program, or during setup, is first
  updated at the start of the next frame, and is drawn this frame at the
  position it was given.
- Input edge states are computed before the update pass and are constant
  for the rest of the frame.
- `camera.mouseX` and `camera.mouseY` are computed once, in step 2, from
  the mouse position at that moment.
- If the draw program never finishes (it raised an error, or the program
  was stopped), step 5 does not run and no further frame starts.

Example: a sprite created during setup at (0, 0) with velocity (1, 0) is
at (1, 0) when the program draws it in frame 1. (Run on the fork.)

## Setup, preview and rerun

LIF-18. The library does nothing at setup beyond LIF-4. Sprites created
while the program's global code runs exist before frame 1 and are updated
in frame 1's step 2. In the host, setup finishes when the global code
finishes; the host then unhides the canvas and marks setup done.

LIF-19. `SpriteLab2Engine` reruns a program inside the same instance. It
calls `allSprites.removeSprites()`, sets `edges` to undefined, and
starts a new program. Nothing else in the library is reset: `frameCount`
keeps counting, the start time and `World.seconds` keep running, and the
camera keeps its position, zoom and centered mark. Depths restart at 1
because `allSprites` is empty (SPR-4).

LIF-20. Classic Sprite Lab's preview (not used by `SpriteLab2Engine`,
whose `preview` does nothing) runs step 2 and the draw program by calling
`redraw()` and never runs step 5. The camera is therefore left active.
Because camera-on does nothing when the camera is already active, the
next frame's step 2 pushes no second transform. The library shall not
depend on step 5 having run after every step 2.

## Upstream p5 2.x

The fork's base is p5 0.5.4. The library runs over upstream p5 2.x. These
are the places the runtime depends on 0.5.4 or fork behavior that 2.x may
not reproduce; each needs either the library, the host, or the ported
runtime to supply it.

LIF-21. Hooks. The fork registers its pre-draw and post-draw work with
p5's per-draw hook lists, and its attach-time work with p5's init hook,
all on `p5.prototype`. p5 2.x replaces these with addon lifecycle hooks
registered for the whole p5 class. Since LIF-1 forbids class-wide state,
the library shall expose the pre-draw phase (LIF-10) and the post-draw
phase (LIF-15) as calls the host makes, or register class-wide hooks that
act only on attached instances. Either way the order in LIF-9..LIF-16
holds. The host's split of p5's draw into a pre part and a post part
(`P5Wrapper` replaces p5's private draw routines to do it) must be
rebuilt on 2.x's loop.

LIF-22. Preload. The fork's host holds p5 in its preload phase with a
registered preload method until images load. p5 2.x has no preload
phase; its loaders return promises and setup may be asynchronous. This
is host behavior.

LIF-23. Degrees (LIF-4 item 1), the target rate of 30 (item 2), the 400
by 400 default canvas (item 3) and the grey fill after canvas creation
(LIF-6) are fork additions; stock p5 of either version uses radians, 60
frames per second, a 100 by 100 canvas and a white fill.

LIF-24. `createVector(undefined, undefined)` yields (0, 0) in 0.5.4, and
`createSprite()` with no arguments relies on it (SPR-2). The library
shall produce (0, 0) regardless of what 2.x's `createVector` does with
missing arguments.

LIF-25. `ellipse(x, y, w)` with the height omitted draws a circle of
diameter w in the fork (think-bubble tails in `drawUtils`). The fork also
makes `rect` and `ellipse` default to a 50-pixel width when it is
omitted; the runtime never omits it.

LIF-26. Measured frame rate before the first frame is 0 in 0.5.4
(WLD-6).

LIF-27. The runtime also relies on these p5 behaviors, which are the
host's and the runtime's concern, not the library's, and are listed so
that they are checked: tinting an image with a CSS color string
(SPR-58); parsing `'hsb(h, s%, b%)'` color strings (`utils.randomColor`);
the internal channel arrays of `p5.Color` that `CoreLibrary.getP5Color`
reads and writes; and the private pixel-density field
`SpriteLab2Engine` reads.

## Test vectors

| #   | Setup                                                                                                       | Expected                                                                                                     | Source      |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------- |
| L1  | Fresh instance                                                                                              | angle mode degrees; target rate 30; canvas 400 × 400; `frameCount` 0; `allSprites.length` 0; measured rate 0 | run on fork |
| L2  | Fresh instance, count of pre-draw and post-draw hooks the fork registers                                    | 3 pre (input, update, camera on), 2 post (spatial index, camera off)                                         | run on fork |
| L3  | Sprite at (0, 0), velocity (1, 0); run one frame; inside the draw read camera state, sprite x, `frameCount` | camera active, camera x 200, sprite x 1, `frameCount` 1; after step 5 camera inactive                        | run on fork |
| L4  | After L3, call `redraw()` only (preview)                                                                    | sprite x 2; camera left active                                                                               | run on fork |
| L5  | `allSprites` = [A, B, C], each lifetime 1; one frame                                                        | A and C removed, B not; `allSprites.length` 1                                                                | run on fork |
| L6  | L5, second frame                                                                                            | B removed; `allSprites.length` 0                                                                             | run on fork |
| L7  | [A lifetime 1, B velocity (1, 0), C velocity (1, 0)], all at x 0; one frame                                 | A removed, B x 0 (skipped), C x 1                                                                            | run on fork |
| L8  | L7, second frame                                                                                            | B x 1, C x 2                                                                                                 | run on fork |
| L9  | `rgb(92, 101, 180, 0.5)`; `rgb(1, 2, 3)`; `rgb(1, 2, 3, 0)`                                                 | alpha 127.5; 255; 255                                                                                        | by hand     |

## Not specified

- The quadtree and `useQuadTree`; Sprite Lab never activates it and the
  fork does not insert sprites into it.
- `updateSprites(flag)` and the global sprite-update switch; nothing in
  Sprite Lab pauses the update pass.
- `removeSprite`, `getSprites`, `animation(anim, x, y)`,
  `loadImageElement`, `imageElement`, `regularPolygon`, `shape`,
  `mouseDidMove`, `p5.Vector.isParallel`.
- `fullscreen()`, which `P5Wrapper` disables; `loadImage` path rewriting,
  which is host behavior.
- The fork's touch and mouse coordinate handling for scaled canvases
  (INP- owns what Sprite Lab needs of it).
- The interpreter marshalling lists in `P5Wrapper` (global property
  lists, custom-marshal object lists); they concern the interpreter, not
  the library.

## Open questions

1. Public names for the three host-chosen members in LIF-2 (predefined
   animations, start time, paused-by-default flag). The ported
   `CoreLibrary`, `P5Wrapper` replacement and `SpriteLab2Engine` must be
   changed to use them; this is a coordination item, not a behavior
   question.
2. LIF-11's skipped sprite is a fork bug. It changes behavior only in the
   frame a sprite expires, and only for the sprite after it: that sprite
   does not move for one frame. Burst, pop, rain and spiral effects give
   every sprite a lifetime, so effect sprites that expire in the same
   frame can leave a neighbour a frame behind. Students are unlikely to
   rely on it knowingly, but a recorded trace of an effect would differ
   without it. Recommendation: reproduce it.
3. LIF-20: classic preview leaves the camera active with its transform
   pushed and never popped. On 0.5.4 the next frame's matrix reset hides
   this. On 2.x, if a push without a pop leaks renderer state, preview
   paths must pop. `SpriteLab2Engine` does not preview, so this matters
   only if classic preview is ported.
4. LIF-21, settled: the p5 installed in `frontend/node_modules` is 2.3.4.
   Its distribution defines no `registerMethod`; addons use the `presetup`,
   `predraw` and `postdraw` lifecycle hooks, which are registered for the
   whole p5 class. LIF-21 holds as written.
