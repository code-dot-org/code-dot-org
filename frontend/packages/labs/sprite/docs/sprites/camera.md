# The camera

Every p5 instance the library extends has one camera, `p5inst.camera`.
The camera maps world coordinates, in which sprites live, to the canvas.
It has a position (the world point shown at the canvas centre) and a
zoom. While it is _active_ its transform is on p5's matrix stack; while
inactive, drawing is in canvas coordinates. The library turns the camera
on at the start of each frame and off at the end, so the whole draw
phase is drawn through it unless the program says otherwise.

Classic Sprite Lab never moves the camera, so its transform is the
identity. Sprite Lab 2's platform levels zoom and scroll it to follow
the player. That use is described at the end, because the library must
support it exactly.

The canvas is _W_ by _H_ logical pixels (400 by 400 in Sprite Lab). The
order of the frame phases is in `overview.md` (LIF-).

## The camera object

CAM-1. `p5inst.camera` exists from the moment the instance is created,
before setup, and is the same object for the life of the instance.
`p5inst.Camera` is a constructor bound to the instance taking
`(x, y, zoom)`; the library's own camera is made with (0, 0, 1).

CAM-2. `camera.position` is a p5 vector. `camera.x` and `camera.y` are
accessors for `position.x` and `position.y`: reading one reads the
vector, writing one writes it. Assigning components of `position`
directly is equivalent.

CAM-3. `camera.zoom` is a plain number. 1 is the natural size; 2 makes
everything drawn through the camera twice as large.

CAM-4. `camera.mouseX` and `camera.mouseY` are plain numbers, written by
the library at the moments given in CAM-9 and CAM-11 and writable by the
program. On creation they equal the instance's `mouseX` and `mouseY`
(normally 0).

CAM-5. `camera.active` is true while the camera transform is applied.
It starts false. `camera.isActive()` returns it.

CAM-6. The camera has a private _initialised_ flag, false at creation.

## Defaults and the first frame

CAM-7. Before the first frame the camera is at (0, 0) with zoom 1 and
inactive. At the first activation (CAM-9), if the camera is not yet
initialised and its position is exactly (0, 0), the position becomes
(_W_/2, _H_/2) and the camera becomes initialised. The zoom is not
touched.

CAM-8. The flag is set only by that move. A camera first activated at
some other position stays uninitialised, and will jump to the canvas
centre at the first later activation that finds it at exactly (0, 0).
Once initialised, a position of (0, 0) is honoured.

Example: zoom set to 3 before the first frame: after the first
activation the camera is at (200, 200) with zoom 3. After initialisation,
setting the position to (0, 0) keeps it at (0, 0).

## Activation

CAM-9. _Activation_ happens in the pre phase of every frame (LIF-), after
input states are read and sprites are updated, and whenever the program
calls `camera.on()` while the camera is inactive. It does, in order:

1. the first-frame centring of CAM-7;
2. `camera.mouseX` = `mouseX` + `position.x` - _W_/2, and
   `camera.mouseY` = `mouseY` + `position.y` - _H_/2 (the zoom is
   ignored; see Open questions);
3. if the camera is inactive: save p5's drawing state as `push()` does,
   scale by `zoom`, then translate by
   (-`position.x` + _W_/(2 `zoom`), -`position.y` + _H_/(2 `zoom`)), and
   mark the camera active.

Step 2 runs even when the camera is already active; step 3 does not.

CAM-10. The resulting map from world point (_x_, _y_) to canvas point is

_x'_ = `zoom` (_x_ - `position.x`) + _W_/2,
_y'_ = `zoom` (_y_ - `position.y`) + _H_/2.

The camera does not rotate. It composes with the matrix in force at
activation, which in the pre phase is the one each frame starts with
(LIF-).

Example: _W_ = _H_ = 400, zoom 2, position (250, 200): the matrix is
(a b c d e f) = (2 0 0 2 -300 -200). World (250, 200) maps to (200, 200).

CAM-11. _Deactivation_ happens in the post phase of every frame and
whenever the program calls `camera.off()` while the camera is active. It
restores the drawing state saved at activation, as `pop()` does, and
marks the camera inactive. The post-phase deactivation does nothing if
the camera is already inactive.

CAM-12. `camera.on()` while active and `camera.off()` while inactive do
nothing. Because activation and deactivation push and pop the same
state, style changes made between them (fill, stroke, tint, and so on)
are undone at deactivation, as with `push()` and `pop()`.

CAM-13. Position and zoom are read only at activation. Changing them
while the camera is active changes nothing drawn until the next
activation: the next frame, or an explicit `off()` then `on()`.

CAM-14. `camera.mouseX` and `camera.mouseY` are snapshots taken at
activation; they do not follow later mouse motion within the frame.

## Use by the mouse hit test

CAM-15. `mouseIsOver(sprite)` (COL-) tests the point
(`camera.mouseX`, `camera.mouseY`) when `camera.active` is true at the
time of the call, and (`mouseX`, `mouseY`) otherwise. `mousePressedOver`
inherits this through `mouseIsOver`. (INP- covers the button side.)

Example: sprite at (300, 200), 20 by 20; camera at (300, 200), zoom 1;
mouse at canvas (200, 200). With the camera inactive, `mouseIsOver` is
false; during the draw phase, with the camera active, `camera.mouseX` is
300 and `mouseIsOver` is true.

CAM-16. `World.mouseX` and `World.mouseY` (WLD-) are the canvas
coordinates and are never mapped through the camera.

## Sprite Lab 2's camera (engine behavior)

Platform levels in Sprite Lab 2 replace the runtime's per-frame draw
routine with one that zooms and follows the player. The helper functions
named here are Apache code already in this package (`src/camera.ts`);
_W_ = _H_ = 400.

CAM-17. The program sets a target zoom with the set-zoom block. The
target is the value as a number clamped to [1, 3]; a value that is not a
finite number gives 1. Each run starts with zoom and target both 1.

CAM-18. Each frame's draw routine does, in order:

1. Ease the zoom: _z_ <- _z_ + 0.25 (_target_ - _z_); if then
   |_target_ - _z_| < 0.001, _z_ <- _target_.
2. Overwrite `camera.mouseX` and `camera.mouseY` with
   ((`mouseX` - 200) / _z_ + `position.x`,
   (`mouseY` - 200) / _z_ + `position.y`), using the position the camera
   still holds from the previous frame. The camera is active at this
   point (from the pre phase), so the program's events that test the
   mouse against sprites use this zoom-correct point.
3. Run behaviors, events and platform physics.
4. Choose the focus: the position of the first sprite in the `players`
   group, each coordinate clamped to [200 / *z*, 400 - 200 / *z*]; with no
   player, (200, 200).
5. Draw the world: `camera.off()`; draw the background in canvas space
   into the square at (_p_(_fx_), _p_(_fy_)) of side 400 _s_, where
   _s_ = 1 + 1.5 (_z_ - 1) and _p_(_c_) = 200 - 200 _s_ - 0.5 (_c_ - 200) _z_;
   set `camera.zoom` = _z_ and `camera.position` = focus; `camera.on()`;
   `drawSprites()`; draw speech bubbles; `camera.off()`.
6. Draw the heads-up layer (variable bubbles, effects, titles) in canvas
   space.

The post phase then finds the camera inactive (CAM-11).

CAM-19. The library must therefore support, within one frame: writing
`camera.mouseX` and `camera.mouseY` from outside; `off()` undoing the
pre-phase activation; repositioning and re-zooming while inactive; `on()`
applying the new values at once; and a final `off()` leaving the post
phase nothing to undo.

CAM-20. When a first-frame capture is pending, step 5 runs once with
zoom 1 and focus (200, 200) before the real pass. The real pass then sets
the camera again; the capture leaves no lasting camera state.

CAM-21. Outside platform levels the runtime never touches the camera;
it stays at (200, 200), zoom 1, and is the identity transform.

## Test vectors

Marked _fork_ (run on the fork under apps' harness) or _hand_.

| Setup                                                           | Result                                                                  | Src  |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- | ---- |
| new instance, 400x400                                           | x 0, y 0, zoom 1, active false, mouseX 0, mouseY 0                      | fork |
| mouse (10, 20), first pre phase                                 | x 200, y 200, active true, camera.mouseX 10, mouseY 20, matrix identity | fork |
| after that frame's post phase                                   | active false, matrix identity                                           | fork |
| zoom 2, position (250, 200), mouse (10, 20), pre phase          | camera.mouseX 60, camera.mouseY 20, matrix (2 0 0 2 -300 -200)          | fork |
| then `off()`                                                    | active false, matrix identity                                           | fork |
| then `on()`                                                     | active true, matrix (2 0 0 2 -300 -200)                                 | fork |
| then `on()` again, post phase                                   | active false, matrix identity                                           | fork |
| after init, position (0, 0), zoom 1, one frame                  | position stays (0, 0)                                                   | fork |
| zoom 3 before first frame, one frame                            | position (200, 200), zoom 3                                             | fork |
| sprite (300,200) 20x20, camera (300,200), mouse (200,200)       | `mouseIsOver` false inactive, true active; camera.mouseX 300            | fork |
| first activation at (50, 50); later position (0, 0), next frame | position becomes (200, 200)                                             | hand |
| CAM-18 step 1 from 1 toward 3                                   | 1.5, 1.875, 2.15625, ...                                                | hand |
| CAM-18 step 1 at 2.9995 toward 3                                | 3                                                                       | hand |
| focus, _z_ 2, player at (50, 390)                               | (100, 300)                                                              | hand |
| step 2, _z_ 2, position (100, 300), mouse (0, 0)                | camera.mouseX 0, camera.mouseY 200                                      | hand |
| background square, _z_ 2, focus (100, 300)                      | origin (-200, -400), side 1000                                          | hand |
| background square, _z_ 1 (focus is then always (200, 200))      | origin (0, 0), side 400                                                 | hand |

## Not specified

- Constructing further cameras with `p5inst.Camera` for drawing (the
  runtime never does); only the constructor's existence is required.
- The quadtree and anything else the fork does in the post phase besides
  deactivating the camera.

## Open questions

1. CAM-9 step 2 ignores zoom. The fork's `camera.mouseX` is only correct
   at zoom 1. Sprite Lab 2 corrects it (CAM-18 step 2) but its own
   `camera.on()` in step 5 then rewrites it with the zoom-less formula,
   and after step 5 the camera is inactive, so a mouse test in the
   heads-up layer uses canvas coordinates. Nothing tests the mouse there
   today. Preserve the fork's formula; the engine owns the correction.
2. CAM-18 step 2 uses the previous frame's position with this frame's
   zoom. During a zoom ease the point is off by the change in zoom for
   one frame. On the first frame of a rerun the position is whatever the
   previous run left, since the p5 instance is reused.
3. The draggable behavior and the mouse-location block read
   `World.mouseX` (CAM-16), which is never mapped through the camera. In
   a zoomed platform scene a dragged sprite follows the canvas point, not
   the world point under the pointer. Students may depend on this in
   platform levels with dragging; preserve.
4. The CAM-8 initialisation quirk is unreachable from Sprite Lab, whose
   first activation always finds (0, 0).
