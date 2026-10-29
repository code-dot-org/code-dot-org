# World, drawing, and edge sprites

This document covers three instance members: `World`, a read-mostly view
of the instance's clock, canvas size, mouse and sprites; `drawSprites`,
which draws a group in depth order; and `createEdgeSprites`, which makes
four sprites just outside the canvas for sprites to collide with. How
sprites collide with the edges is COL-; how one sprite is drawn is
SPR-50..SPR-58.

## World

WLD-1. `World` is an object belonging to the instance. Every read of
`p.World` returns the same object.

WLD-2. `World.width` and `World.height` read the instance's current
canvas `width` and `height` at the time of the read.

WLD-3. `World.mouseX` and `World.mouseY` read the pointer position
(INP-29, INP-19) at the time of the read. They are screen coordinates on the
canvas: they are not corrected for the camera. `camera.mouseX` and
`camera.mouseY` are the camera-corrected values (CAM-).

Example: mouse at (123, 45), camera at x 300, zoom 2, after a frame:
`World.mouseX` 123, `camera.mouseX` 223. (Run on the fork.)

WLD-4. `World.frameCount` reads the instance's `frameCount`: 0 before the
first frame, then incremented at the start of each frame (LIF-9). The
runtime treats `World.frameCount === 1` as the preview frame and reads it
for frame timers and events.

WLD-5. `World.allSprites` is the instance's `allSprites` (GRP-10).

WLD-6. Reading `World.frameRate` returns the measured frame rate (LIF-16),
which is 0 before a frame has been measured. Assigning `World.frameRate =
n` sets the instance's target frame rate to n, as p5's `frameRate(n)`
does (a non-number or n ≤ 0 is ignored by p5).

WLD-7. `World.seconds` is round((now − start time) / 1000), where now is
the current wall-clock time in milliseconds and the start time is LIF-5.
It counts from attachment, not from the start of the program or of a
rerun, and does not stop while drawing is paused. (The runtime computes
its own pause-adjusted time from the start time instead.)

WLD-8. `width`, `height`, `mouseX`, `mouseY`, `allSprites`,
`frameCount` and `seconds` have no setter. Assigning one does not change
what it reads; in strict-mode code the assignment throws a `TypeError`.
The runtime assigns none of them.

## drawSprites and drawSprite

WLD-9. `drawSprites(group)` draws `group`, or `allSprites` if `group` is
omitted or falsy.

WLD-10. If the group to draw has no `draw` method, `drawSprites` throws
an `Error` whose message is `with drawSprites you can only draw all
sprites or a group`. The fork throws that text, with an `Error: ` prefix,
as a string (group.md Open question 1).

WLD-11. Drawing a group first sorts that group, in place, by ascending
`depth`, with a stable sort: sprites of equal depth keep their current
relative order. It then draws each element in the new order, from index
0, reading the size before each element, by SPR-50..SPR-58. Invisible and
removed sprites are skipped by SPR-50 but stay in the sort.

WLD-12. `drawSprites` neither turns the camera on or off nor changes any
transform itself. Sprites are drawn in the transform current at the call:
in Sprite Lab that is the camera transform (LIF-14); `SpriteLab2Engine`
sets the camera's zoom and position and turns it on just before its
call, and off just after its speech bubbles (CAM-).

WLD-13. `drawSprites` does not update sprites and does not advance
animations; both happen in the update pass (LIF-11). It changes only the
order of the group it draws and the canvas.

WLD-14. `drawSprite(sprite)` draws one sprite by SPR-50..SPR-58 if
`sprite` is truthy, and does nothing otherwise. The runtime does not call
it.

Example: sprites a (depth 5, invisible), b (2), c (2), created a, b, c:
`drawSprites()` leaves `allSprites` as b, c, a and draws b then c. (Run
on the fork.)

## Edge sprites

WLD-15. `edges` is an instance member, initially undefined, readable and
writable. The runtime reads it (`if (!p5.edges) p5.createEdgeSprites()`)
and `SpriteLab2Engine` sets it to undefined on rerun (LIF-19).

WLD-16. `createEdgeSprites()`: if `edges` is truthy, returns it and does
nothing else. Otherwise, with W and H the canvas width and height at the
time of the call and T = 100, it creates four sprites with `createSprite`
(so each gets the next depth and joins `allSprites`, SPR-1, SPR-4), in
this order, and stores each as an instance member:

| Member       | Position       | Width × height |
| ------------ | -------------- | -------------- |
| `leftEdge`   | (−T/2, H/2)    | T × H          |
| `rightEdge`  | (W + T/2, H/2) | T × H          |
| `topEdge`    | (W/2, −T/2)    | W × T          |
| `bottomEdge` | (W/2, H + T/2) | W × T          |

Each edge's inner side lies on a canvas border: the left edge spans x from
−100 to 0, the right edge W to W + 100, the top edge y from −100 to 0,
the bottom edge H to H + 100.

WLD-17. It then creates a group with `createGroup()`, adds the four
sprites in the order left, right, top, bottom, stores the group as
`edges`, and returns it.

WLD-18. Edge sprites are ordinary sprites with every default of SPR-5
apart from position and size: visible, not immovable, no animation,
drawn as grey rectangles (outside the canvas, so not seen unless the
camera shows beyond it), updated every frame, and counted in
`allSprites.maxDepth()`. A sprite created after the edges gets a depth
above theirs.

Example: a sprite at depth 7, then `createEdgeSprites()`: the edges get
depths 8, 9, 10, 11; `allSprites.size()` 5. (Run on the fork.)

WLD-19. The edges are not tied to the canvas size after creation.
Resizing the canvas does not move or resize them.

WLD-20. `allSprites.removeSprites()` removes the edge sprites like any
other and leaves `edges` pointing at the now empty group, so a later
`createEdgeSprites()` returns that empty group. The engine therefore sets
`edges` to undefined after `removeSprites()` (LIF-19); the next
`createEdgeSprites()` then makes four new sprites and a new group.

WLD-21. The runtime reaches the edges only through `edges`:
`edges.displace(sprite)` (`edgesDisplace`), `sprite.collide(edges)`
(`edgesCollide`) and `sprite.isTouching(edges)` (`isTouchingEdges`).
Their collision behavior is COL-.

## Test vectors

| #   | Setup                                                   | Expected                                                                                                                                                                                                                                                                            | Source      |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| W1  | fresh instance                                          | width 400, height 400, frameCount 0, mouseX 0, mouseY 0, frameRate 0, seconds 0                                                                                                                                                                                                     | run on fork |
| W2  | two frames                                              | `World.frameCount` 2                                                                                                                                                                                                                                                                | run on fork |
| W3  | `World.frameRate = 12`                                  | target frame rate 12                                                                                                                                                                                                                                                                | run on fork |
| W4  | `World.width = 5` in strict code                        | throws TypeError; width still 400                                                                                                                                                                                                                                                   | run on fork |
| W5  | mouse (123, 45)                                         | `World.mouseX` 123, `World.mouseY` 45                                                                                                                                                                                                                                               | run on fork |
| W6  | W5, camera x 300, zoom 2, one frame                     | `World.mouseX` 123, `camera.mouseX` 223, `camera.mouseY` 45                                                                                                                                                                                                                         | run on fork |
| W7  | 400 × 400, one sprite at depth 7, `createEdgeSprites()` | left (−50, 200) 100 × 400 depth 8; right (450, 200) 100 × 400 depth 9; top (200, −50) 400 × 100 depth 10; bottom (200, 450) 400 × 100 depth 11; `edges` order L, R, T, B; `edges.size()` 4; `allSprites.size()` 5; second call returns the same group; edges visible, not immovable | run on fork |
| W8  | W7 then `allSprites.removeSprites()`                    | `edges.size()` 0; `createEdgeSprites()` returns the same (empty) group                                                                                                                                                                                                              | run on fork |
| W9  | canvas 300 × 200, `createEdgeSprites()`                 | (−50, 100) 100 × 200; (350, 100) 100 × 200; (150, −50) 300 × 100; (150, 250) 300 × 100                                                                                                                                                                                              | run on fork |
| W10 | a (5), b (2), c (2), a invisible; `drawSprites()`       | draws b, c; `allSprites` b, c, a                                                                                                                                                                                                                                                    | run on fork |
| W11 | `drawSprites({})`                                       | throws `Error: with drawSprites you can only draw all sprites or a group`                                                                                                                                                                                                           | run on fork |
| W12 | `drawSprite(undefined)`                                 | no p5 calls                                                                                                                                                                                                                                                                         | run on fork |
| W13 | W8 then `edges = undefined`; `createEdgeSprites()`      | a new group of four new sprites, depths from 1                                                                                                                                                                                                                                      | by hand     |

## Not specified

- `World.pInst`, the instance back-reference; the runtime does not read
  it.
- The `Game` alias for `World` that `P5Wrapper` gives Game Lab's
  interpreter.

## Open questions

1. WLD-3 against `camera.mouseX`: `draggableFunc` places a dragged sprite
   at `World.mouseX` plus an offset, while `mousePressedOver` hit-tests
   with `camera.mouseX` (COL-, CAM-). With the camera at its default,
   they agree. In a zoomed platform scene they differ, so a dragged
   sprite does not follow the pointer. This is how the fork and engine
   behave today; whether the port should keep it is a product question.
2. WLD-7: `World.seconds` runs from attachment and ignores pauses and
   reruns. The runtime uses its own pause-adjusted clock, so the value
   is visible only to code that reads `World.seconds` directly, which
   no Sprite Lab block does.
