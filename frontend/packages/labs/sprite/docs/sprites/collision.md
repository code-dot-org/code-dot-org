# Collision

This document specifies sprite colliders, the overlap test between two
sprites, the separation vector it yields, the six collision methods on
sprites and groups (`overlap`, `isTouching`, `collide`, `displace`,
`bounce`, `bounceOff`), the pointer hit test behind `mouseIsOver` and
`mousePressedOver`, and the edge sprites as collision targets.

Every collider Sprite Lab can produce is a rectangle that follows the
sprite's position, scale and rotation. Two rectangles are tested with the
separating axis method: they overlap when their projections overlap on
every candidate axis, and the axis of least overlap gives the shortest
vector that separates them. The collision methods differ only in what they
do with that vector: nothing, move this sprite, move the other sprite, or
also change velocities. A broad-phase test on a stretched "swept" box
catches fast sprites that would otherwise pass through each other in one
frame.

Coordinates are p5 canvas coordinates: x grows to the right, y grows
downward, angles are in degrees and a positive rotation turns clockwise on
screen. All arithmetic is IEEE double precision; no comparison uses a
tolerance unless one is stated.

Terms used below:

- _A_ is the sprite whose method is called ("this"), _B_ the other sprite.
- _cA_, _cB_ are the collider centres. On the Sprite Lab path a collider's
  centre is always its sprite's `position`.
- `removed`, `velocity`, `position`, `rotation`, `scale`, `width`,
  `height`, `mass`, `restitution`, `immovable` and `touching` are the
  sprite properties of those names (SPR-). `mass` defaults to 1,
  `restitution` to 1, `immovable` to false, and `touching` is an object
  with boolean members `left`, `right`, `top`, `bottom`, all initially
  false.
- The _anchor_ N of a sprite is the position it had at the end of its most
  recent per-frame update (its creation position before the first update).
  The _previous position_ P is the value N held when the most recent update
  began. Each update sets P to N, applies the velocity step, then sets N to
  the new position (SPR-). COL-19 also resets both.

## Scope: which code defines the behavior

COL-1. The Code.org wrappers `P5SpriteWrapper` and `P5GroupWrapper` are not
part of the Sprite Lab behavior. Apps installs them only when its p5
wrapper is initialised without the Sprite Lab option. The classic Sprite
Lab runtime passes that option whenever the level uses Blockly, and
`SpriteLab2Engine` always does. On the Sprite Lab path the collision
methods are therefore the base p5.play ones. The two sets agree on the
per-pair semantics in COL-17 to COL-22. What the wrappers add is a
protocol that suspends and resumes a group check across interpreter
steps, and Sprite Lab never uses it. Every collision method in this
library completes synchronously and returns its result directly. See Open
question 1.

## Colliders

COL-2. Every collider the Sprite Lab path produces is an oriented
rectangle, called a _box_ below. The runtime never calls `setCollider`, so
point, circle and axis-aligned colliders, collider offsets and custom
collider sizes are never produced (see "Not specified").

COL-3. A sprite has no collider when it is created. A collider is created
the first time one of the following needs it, and at no other time:

- a collision method (COL-17) that tests a pair involving the sprite, on
  either side of the pair;
- `mouseIsOver(sprite)`, or `mousePressedOver(sprite)` while pressed
  (COL-24, COL-25).

The per-frame update does not create a collider. It only refreshes one
that already exists (COL-7).

COL-4. No loading guard. A sprite whose current animation reports a width
of 1 and a height of 1 (ANI-) gets a collider like any other sprite
(COL-5), collides like any other, and is hit-tested like any other
(COL-27). This deliberately departs from the fork, which treats such a
sprite as still loading: it creates no collider, returns false from every
collision method for the pair, and throws a TypeError from `mouseIsOver`.
A genuine 1x1 costume therefore could never collide in apps.

COL-5. Base dimensions. When the collider is created and at every refresh,
its base width w0 and base height h0 are read as follows:

- a sprite with a current animation uses the width and height that
  animation reports for its current frame (`animation.getWidth()` and
  `animation.getHeight()`, ANI-);
- a sprite without an animation uses `sprite.width` and `sprite.height`
  (SPR-).

Base dimensions are read fresh at every refresh. A new costume, a frame of
a different size, or a changed `width` on a sprite without an animation
takes effect at the next refresh.

COL-6. Scale factors. At each refresh the collider takes horizontal factor
kx = `scale` x hs and vertical factor ky = `scale` x vs. Here hs and vs
are the sprite's horizontal and vertical stretch factors (SPR-): the
ratios by which setting `width` or `height` on a sprite that has an
animation stretches its image. Both are 1 for a sprite without an
animation, and 1 until `width` or `height` is assigned. `mirrorX` and
`mirrorY` do not affect the collider. Neither do `tint`, `depth` or
visibility.

Example: an animation whose frame is 50x80, `scale` 1, then `width = 100`
assigned. hs becomes 2, so the collider is 100 wide and 80 tall.

COL-7. World geometry. The box occupies the rectangle
[-w0/2, w0/2] x [-h0/2, h0/2] in local coordinates. It is scaled by
(kx, ky), then rotated by `rotation` degrees, then translated to
`position`. The rotation maps a local vector (x, y) to
(x cos t - y sin t, x sin t + y cos t), with t = `rotation` in radians;
on a y-down screen this is clockwise for positive t. Because scaling comes
before rotation, a non-uniform scale rotates with the sprite. A negative
factor behaves as its absolute value, since the box is symmetric. A zero
factor collapses the box along that axis; COL-13 covers the degenerate
case.

Example (by hand): a 100x20 sprite with `rotation` 30 at the origin. Its
long axis points along (0.866, 0.5). The point (34.64, 20) is inside the
box; the point (34.64, -20) is outside.

COL-8. Refresh. A collider holds a snapshot of the geometry in COL-5 to
COL-7. The snapshot is taken:

1. when the collider is created;
2. in every per-frame update of a sprite that already has a collider,
   after the velocity step and the animation step (SPR-);
3. for both sprites of a pair in stage 2 of the pairwise test (COL-15),
   and at each sub-frame sample (COL-16). The broad phase that precedes
   them uses colliders as last refreshed;
4. for A, immediately after A is moved by `collide`, `bounce` or
   `bounceOff` (COL-19).

Nothing else refreshes it. In particular `mouseIsOver` does not, and
neither does the push that `displace` gives B. A hit test after either
kind of change sees the geometry of the last refresh. See Open
questions 5 and 6.

Example (run on fork): a 100x100 sprite at (200, 200); `mouseIsOver`
with the pointer at (200, 200) is true. Set `x = 400`: still true. Call
the sprite's per-frame update: false.

## The separating-axis test

COL-9. Box axes. Each box contributes two axes, in this order:

1. its _width axis_: the local vector (w0, 0) after scale and rotation,
   which is the box's local +x direction;
2. its _height axis_: the local vector (0, h0) after scale and rotation,
   which is the box's local +y direction.

A zero-length axis (from a zero factor or a zero base dimension) is
replaced by (1, 0).

COL-10. Candidate axes for testing box A against box B. Start with the
list [A width, A height, B width, B height]. Remove every axis that is
parallel to some axis later in the list. Two vectors u and v are parallel
when |ux| and |vx| are both below 1e-14, or |uy| and |vy| are both below
1e-14, or |ux/vx - uy/vy| < 1e-14. If neither box is rotated, the
surviving list is [B width, B height]: world x, then world y.

COL-11. Projected radius. For a box and a unit direction, the radius is
the larger of the absolute projections of two adjacent half-diagonals of
the box onto that direction. This equals the half-length of the box's
shadow on that direction. For an unrotated box of scaled size W x H, it is
W/2 on x and H/2 on y.

COL-12. Overlap and separation vector. For each candidate axis u, in list
order:

- d(u) is the projection of cB - cA onto u (a vector);
- o(u) = rA(u) + rB(u) - |d(u)|, where rA and rB are the projected radii
  (COL-11).

If o(u) <= 0 on any axis, the boxes do not overlap and the separation
vector D is (0, 0). Boxes that exactly touch (o = 0) do not overlap.
Otherwise, u* is the first axis in list order with the strictly smallest
o, and D is the vector of length o(u*) that points:

- opposite to d(u*) when d(u*) is not the zero vector, which moves A
  directly away from B along u\*;
- opposite to u* itself when d(u*) is the zero vector (the centres
  coincide along u\*).

D is the shortest move of A that separates it from B. A pair overlaps
exactly when D is non-zero.

Example (run on fork): two unrotated 100x100 boxes, A at (0, 0) and B at
(50, 50). o is 50 on x and 50 on y. The tie goes to x, which comes first,
so D = (-50, 0). With B at (-50, -50) instead, D = (50, 0).

Example (run on fork): both 100x100 boxes at (0, 0). D = (-100, 0),
because B's width axis points along +x.

Example (run on fork): A 100x100 with `rotation` 45 at (0, 0), B 100x100
at (110, 0). On x, rA = 70.710678, so o = 10.710678, which is smaller than
o on A's diagonal axes. D = (-10.710678, 0).

COL-13. Degenerate boxes. A box collapsed to a point (both factors zero,
or both base dimensions zero) overlaps another box exactly when the point
lies strictly inside it. Two collapsed boxes never overlap.

Example (run on fork): A (100x100, `scale` 0) at (0, 0) against B
(100x100) at (49, 0) overlaps; at (50, 0) it does not. `collide` against
B at (10, 5) moves A to (-40, 0).

COL-14. No tolerance. Overlap is decided by exact double comparisons.
Example (run on fork): 100x100 boxes at (0, 0) and (99.99999999, 0)
overlap.

## Pairwise test with sub-frame sampling

COL-15. The pairwise test computes D for A against B. It runs in three
stages:

1. Broad phase (COL-16). If it reports a possible crossing, try sub-frame
   sampling. If a sample overlaps, the result is that sample's D, together
   with the position side effects described in COL-16.
2. Otherwise, refresh both colliders at the current positions (COL-8).
3. Return D from COL-12 for the two colliders.

COL-16. Swept boxes and sampling.

_Swept box._ Each sprite that has a collider also has a swept box, which
is used only by the broad phase. When the collider is created, the swept
box is a zero-size box at the world origin (0, 0). At the start of each
per-frame update, before the velocity step and before P is reassigned, a
sprite whose `velocity` v is non-zero recomputes its swept box:

- its length along v is |v| + 2 r(v), where r is the projected radius
  (COL-11) of the sprite's collider as last refreshed;
- its width across v is 2 r(v-perpendicular);
- its long side lies along v, at angle atan2(vy, vx);
- its centre is N + v/2, with N the anchor.

The swept box therefore covers the path the sprite is about to travel in
that update. It changes only in updates made while the velocity is
non-zero.

_Broad-phase shape._ A sprite's broad-phase shape is its swept box when
its `velocity` is non-zero at the time of the test, and its collider
otherwise.

_Broad phase._ A possible crossing is reported when A's broad-phase shape
overlaps B's broad-phase shape by COL-12.

_Sampling._ On a possible crossing:

- let R = max(m(A), m(B)), where m(S) = min(w0, h0) uses S's _unscaled_
  base dimensions (COL-5);
- let s = |vA - vB|, the relative speed;
- the step is t = max(0.015, R/s). If s = 0 then t is infinite, and if
  R/s is NaN then t is NaN. In both cases no sampling happens.

If t < 1:

1. Record the current positions QA and QB, and the previous positions PA
   and PB.
2. Place A at PA and B at PB. Let the per-step moves be
   eA = t (QA - PA) and eB = t (QB - PB).
3. Let f = t. While f < 1: add eA to A's position and eB to B's position,
   refresh both colliders, and compute D by COL-12. If D is non-zero:

   - restore A to QA if A is `immovable`, and B to QB if B is
     `immovable`, without refreshing their colliders;
   - leave every sprite that is not immovable at its sampled position;
   - end the pairwise test with this D.

   Otherwise add t to f (by repeated floating-point addition) and repeat.

4. If no sample overlapped, restore A to QA and B to QB, then continue
   with stage 2 of COL-15.

These side effects happen whatever the collision type, including
`overlap` and `isTouching`. A check that is otherwise read-only can move
both sprites back along their paths (Open question 2).

Example (run on fork): A and B are 10x10, A at (0, 0), B at (50, 0).
Both have colliders. A has `velocity` (100, 0), and one update moves it to
(100, 0). R = 10, s = 100, t = 0.1, and the sample at f = 0.5 puts A at
(50, 0), which overlaps B. `A.overlap(B)` returns true and leaves A at
(50, 0). `A.collide(B)` instead leaves A at (40, 0) with velocity (0, 0).
If A is `immovable`, `A.overlap(B)` returns true and A stays at (100, 0).

Example (run on fork): the same scene, except the colliders are first
created after that update. The swept box is still the point at the
origin, so there is no broad-phase hit, the final positions do not
overlap, and `A.overlap(B)` is false.

Example (run on fork): A is 100x100 at `scale` 0.1, B is 10x10 at
(15, 0), and A moves at (30, 0) from (0, 0). m(A) = 100 despite the
scale, so t = 3.33 and no sampling happens. A ends at (30, 0) and has
passed through B: `overlap` is false.

## Collision methods

COL-17. Methods. Each sprite has `overlap(target, callback)`,
`isTouching(target, callback)`, `collide(target, callback)`,
`displace(target, callback)`, `bounce(target, callback)` and
`bounceOff(target, callback)`. `callback` is optional. `isTouching` is
the very same function as `overlap` (`sprite.isTouching === sprite.overlap`
is true), so it also honours a callback. Each call does the following:

1. Reset A's `touching.left`, `.right`, `.top` and `.bottom` to false
   (COL-18).
2. If A is `removed`, return false.
3. Determine the list of others:
   - if `target` is a sprite, the list is [target];
   - if `target` is any array (a group, `allSprites`, `edges`, or a plain
     array of sprites), the list is that array itself;
   - otherwise throw (COL-23).
4. For index i = 0, 1, ... while i is less than the list's current length,
   run the pair procedure (COL-19) for A and the element at i.
5. Return true if any pair returned true, else false. Every pair is run;
   nothing short-circuits.

Pairs run one after another, and a pair sees the positions left by the
pairs before it.

Example (run on fork): A 100x100 at (0, 0) calls `collide` on the array
[B at (90, 0), D at (0, 95)], both 100x100. The first pair moves A to
(-10, 0) and the second to (-10, -5). The call returns true, with
`touching.right` and `touching.bottom` set.

COL-18. The `touching` flags. Every call in COL-17 first sets all four
flags false. This happens even when A is removed and even when nothing
overlaps. Each overlapping pair then sets, from its D:

- `left` if D.x > 0;
- `right` if D.x < 0;
- `bottom` if D.y < 0;
- `top` if D.y > 0.

No pair sets a flag back to false, so after a call on an array the flags
are the union over all overlapping pairs. A flag names the side of A on
which the contact lies. Example: B just to the right of A gives
D = (-x, 0), which sets `right`.

COL-19. Pair procedure for A and B with collision type T:

1. If B is A, or B is `removed`, the pair returns false.
2. Create either collider that is missing (COL-3). If either sprite still
   has none (COL-4), the pair returns false.
3. Compute D by COL-15. This may move sprites (COL-16).
4. If D is (0, 0), the pair returns false.
5. Set flags by COL-18.
6. Position response:
   - `displace`: unless B is `immovable`, subtract D from B's position,
     which pushes B away from A. B's collider, anchor and previous
     position are left as they are.
   - `collide`, `bounce`, `bounceOff`: unless A is `immovable`, add D to
     A's position; then set A's anchor and previous position to the new
     position and refresh A's collider.
   - `overlap` and `isTouching`: none.
7. Velocity response (COL-20), for `collide`, `bounce` and `bounceOff`
   only.
8. If `callback` is a function, call it synchronously, with `this` bound
   to A and the arguments (A, B), after steps 6 and 7.
9. The pair returns true.

COL-20. Velocity response. Let n be the direction of D. The response uses
effective parameters for B:

- `collide`: B counts as immovable and its restitution as 0;
- `bounceOff`: B counts as immovable, with its own restitution;
- `bounce`: B's own values.

B's actual `immovable` and `restitution` are unchanged after the call.
Then:

- uA and uB are the projections of A's and B's `velocity` onto n.
- The masses are mA = 1, mB = 0 if A is `immovable` (A's own flag; this
  takes precedence); otherwise mA = 0, mB = 1 if B effectively counts as
  immovable; otherwise mA = A.`mass` and mB = B.`mass`.
- e = A.`restitution` x (B's effective restitution); M = mA + mB.
- uA' = (mA uA + mB uB + mB e (uB - uA)) / M
- uB' = (mA uA + mB uB + mA e (uA - uB)) / M
- A's `velocity` gains uA' - uA, and B's `velocity` gains uB' - uB.

Velocity components across n are unchanged. Consequences worth stating:

- `bounce` between two movable sprites with equal mass and restitution 1
  swaps their normal velocities.
- `bounceOff` reflects A's normal velocity relative to B's:
  uA' = uB + e (uB - uA). B's velocity is unchanged.
- `collide` with A movable sets A's normal velocity to B's normal
  velocity (uA' = uB). B's velocity is unchanged.
- `collide` with A `immovable` leaves A's velocity unchanged, sets B's
  normal velocity to A's (uB' = uA), and moves neither sprite (step 6
  skips A). B is left overlapping A with its approach velocity cancelled.
- If both A and B are `immovable`, the A rule applies: mA = 1, mB = 0.

Example (run on fork): A and B are 100x100 at (0, 0) and (100, 0) with
velocities (2, 0) and (-1, 0). After one update they sit at (2, 0) and
(99, 0). `A.bounce(B)` returns true, with A at (-1, 0) moving (-1, 0) and
B at (99, 0) moving (2, 0).

COL-21. `immovable` summary. An immovable A is never moved by its own
`collide`, `bounce` or `bounceOff`. An immovable B is never pushed by
`A.displace(B)`. Such a call still returns true, still sets the flags and
still runs the callback. `immovable` also decides whether sub-frame
sampling leaves a sprite at its sampled position (COL-16).

COL-22. Group methods. Every group, including `allSprites` and `edges`,
has `overlap`, `isTouching`, `collide`, `displace`, `bounce` and
`bounceOff`, with the same arguments as the sprite methods. `isTouching`
is again the same function as `overlap`. A call runs, for i = 0, 1, ...
while i is less than the group's current size, the member at i calling
the same method with the same target and callback. It returns true if any
member returned true, without short-circuiting. Because a sprite never
pairs with itself, `g.isTouching(g)` is true exactly when two distinct
members overlap.

Each of these functions is permanently tied to the group it was created
for. Called on some other array (for example a copy of the function
stored on a filtered array), it still iterates the original group. Sprite
Lab's `groupSpritesTouched` criterion depends on this (Open question 10).

Example (run on fork): group g holds A at (0, 0) and B at (10, 0). Put
`g.isTouching` on a plain array [C at (500, 0)] and call it with target
[B]. It returns true: A overlaps B, and C is never tested.

COL-23. Bad target. If the target is neither a sprite nor an array, the
call throws an `Error` whose message is "overlap can only be checked
between sprites or groups", so that the error converts to the string
"Error: overlap can only be checked between sprites or groups". The fork
throws that string itself, not an Error object. The flags have already
been reset.

## Pointer hit test

COL-24. `mouseIsOver(sprite)`: if `sprite` is falsy, return false.
Otherwise create the collider if it is missing, but do not refresh an
existing one. The test point is (`camera.mouseX`, `camera.mouseY`) if the
camera is active, and (`mouseX`, `mouseY`) otherwise (CAM-, INP-). Return
true exactly when the point lies strictly inside the collider as last
refreshed, by COL-12 and COL-13: a point on the boundary is outside. A
`removed` sprite is still tested normally.

COL-25. `mousePressedOver(sprite)` is true when the mouse button is down
or a touch is down (INP-) and `mouseIsOver(sprite)` is true. When neither
is down it returns false without evaluating `mouseIsOver`, so it creates
no collider.

COL-26. The runtime evaluates both functions during the draw step, while
the camera is on (CAM-), so it uses the camera coordinates of COL-24.

COL-27. A 1x1 costume under the pointer. `mouseIsOver` and
`mousePressedOver` test a sprite with a 1x1 costume against its 1x1
collider, as for any other sprite (COL-4). The fork throws a TypeError
instead.

## Edge sprites

COL-28. Geometry. `createEdgeSprites()` (WLD-) makes four sprites without
an animation, each 100 thick, sized from the canvas width W and height H
at the time of the call:

| edge         | centre        | size    |
| ------------ | ------------- | ------- |
| `leftEdge`   | (-50, H/2)    | 100 x H |
| `rightEdge`  | (W + 50, H/2) | 100 x H |
| `topEdge`    | (W/2, -50)    | W x 100 |
| `bottomEdge` | (W/2, H + 50) | W x 100 |

`edges` is a group of the four, in that order. A second call returns the
existing `edges` unchanged.

COL-29. Edges are ordinary sprites for collision purposes. They are not
immovable, have default mass and restitution, and belong to `allSprites`
(GRP-). Their boxes meet only at corners and do not overlap one another.
Consequences:

- `sprite.collide(edges)` moves only the sprite, one edge after another
  in edge order.
- `edges.displace(sprite)` pushes only the sprite. Each edge pushes it
  along that edge's shortest separation, which can be sideways near a
  corner, or outward when the sprite's centre lies inside an edge's box.
- `allSprites.isTouching(allSprites)` counts a sprite that overlaps an
  edge as touching.
- A sprite flush with an edge (boundary contact) is not touching it. That
  includes a sprite `collide` has just stopped against an edge.

Example (run on fork, 400x400 canvas): a 100x100 sprite at (390, 200).
`isTouching(edges)` is true. `collide(edges)` returns true, moves it to
(350, 200) and sets `touching.right`. Afterwards `isTouching(edges)` is
false.

## Informative: what the Sprite Lab runtime calls

This section adds no requirements. It records the call sites checked
against the runtime (classic `CoreLibrary` and its commands,
`SpriteLab2Engine`, levelbuilder libraries and block pools in
`dashboard/config`):

- The when-touching and while-touching events call `sprite.overlap(other)`
  for sprite pairs, with no callback. The runtime keeps its own per-pair
  memory so that a when-touching event fires once per contact.
- `isTouchingSprite` and the Sprite Lab `bounceOff` command call
  `sprite.isTouching(other)`. That command reverses `direction` and nudges
  the sprite itself; it does not call `sprite.bounceOff`.
- The "colliding" block calls `sprite[T](other)` with T one of
  `bounceOff`, `bounce`, `collide` or `displace`. The `displace` command
  calls `sprite.displace(other)`.
- `edgesCollide` calls `sprite.collide(edges)`, `edgesDisplace` calls
  `edges.displace(sprite)`, and `isTouchingEdges` calls
  `sprite.isTouching(edges)`. Each creates the edges first if `edges` is
  unset. `SpriteLab2Engine` clears `edges` when it removes all sprites.
- The `anySpritesTouched` criterion calls
  `allSprites.isTouching(allSprites)`. `groupSpritesTouched` calls a copy
  of `allSprites.isTouching` stored on a filtered array (COL-22).
- The platform scene loop in `SpriteLab2Engine` runs the `collide`
  command with type `collide`, subject group `''` and target group
  "walls", so it calls `sprite.collide(wall)` for each such pair.
- The when-clicked event and the `anySpriteClicked` criterion call
  `mouseIsOver`. The while-clicked event and the draggable behavior call
  `mousePressedOver`.
- Levelbuilder libraries call `sprite.overlap(World.allSprites, callback)`,
  `sprite.isTouching(World.allSprites)`, `s1.isTouching(s2)` and
  `mouseIsOver(sprite)` from interpreted code.
- `isDirectlyAbove` does not use colliders. It builds unrotated bounds
  from `x`, `y`, `width`, `height` and `scale` and compares edges exactly.

In Sprite Lab, `velocity` is non-zero only when a program sets
`velocityX` or `velocityY`, or when scene physics does. For a sprite
whose velocity is zero, COL-16 never applies.

## Test vectors

Unless stated otherwise, sprites have no animation, are 100x100, have
`scale` 1 and `rotation` 0, and have velocity (0, 0). "fork" means
obtained by running `@code-dot-org/p5.play` 1.3.21-cdo under apps'
harness with the Sprite Lab option; "hand" means computed by hand.
"Primed" means both sprites had colliders before the frame's update, and
"one update" means each sprite's per-frame update ran once.

### Overlap and separation

| #   | Setup                                              | Call                                | Result                                                                           | Source |
| --- | -------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- | ------ |
| 1   | A (0,0), B (100,0)                                 | `A.overlap(B)`, `B.overlap(A)`      | false, false                                                                     | fork   |
| 2   | A (0,0), B (99.999,0)                              | `A.overlap(B)`                      | true                                                                             | fork   |
| 3   | A (0,0), B (100,100)                               | `A.overlap(B)`                      | false                                                                            | fork   |
| 4   | A (0,0), B (99,0)                                  | `A.collide(B)`                      | true; A (-1,0); B (99,0); `touching.right` only                                  | fork   |
| 5   | A (0,0), B (-99,0)                                 | `A.collide(B)`                      | true; A (1,0); `touching.left` only                                              | fork   |
| 6   | A (0,0), B (0,90)                                  | `A.collide(B)`                      | true; A (0,-10); `touching.bottom` only                                          | fork   |
| 7   | A (0,0), B (90,0)                                  | `A.displace(B)`                     | true; A (0,0); B (100,0)                                                         | fork   |
| 8   | A (0,0), B (50,50)                                 | `A.collide(B)`                      | A (-50,0)                                                                        | fork   |
| 9   | A (0,0), B (-50,-50)                               | `A.collide(B)`                      | A (50,0)                                                                         | fork   |
| 10  | A (0,0), B (60,60)                                 | `A.collide(B)`                      | A (-40,0)                                                                        | fork   |
| 11  | A, B both (0,0)                                    | `A.collide(B)`                      | A (-100,0); B (0,0)                                                              | fork   |
| 12  | A, B both (0,0)                                    | `A.displace(B)`                     | A (0,0); B (100,0)                                                               | fork   |
| 13  | A 40x60 (0,0), B (0,0)                             | `A.collide(B)`                      | A (-70,0)                                                                        | fork   |
| 14  | A 50x50 (0,0), B 100x20 (60,0)                     | `A.collide(B)`                      | A (-15,0)                                                                        | fork   |
| 15  | A 50x50 (0,0), B 100x20 (10,30)                    | `A.collide(B)`                      | A (0,-5)                                                                         | fork   |
| 16  | A 40x60 (0,0); B at (69,0), (70,0), (0,79), (0,80) | `A.overlap(B)`                      | true, false, true, false                                                         | fork   |
| 17  | A (0,0), B (90,0), C (500,0)                       | `A.overlap(B)`, then `A.overlap(C)` | true with `touching` {right} after the first; false, all false after the second  | fork   |
| 18  | A (0,0), B (50,0)                                  | `A.overlap(B)`                      | A (0,0); B (50,0)                                                                | fork   |
| 19  | A (0,0)                                            | `A.overlap(A)`                      | false                                                                            | fork   |
| 20  | A (0,0), B (10,0), B removed                       | `A.overlap(B)`                      | false                                                                            | fork   |
| 21  | A (0,0) removed, C (20,0)                          | `A.overlap(C)`, `C.overlap(A)`      | false, false                                                                     | fork   |
| 22  | A (0,0)                                            | `A.overlap({x: 1})`                 | throws the string "Error: overlap can only be checked between sprites or groups" | fork   |
| 23  | A (0,0), B (10,0)                                  | `A.overlap([B])` (plain array)      | true                                                                             | fork   |
| 24  | A (0,0), B (0,0)                                   | `A.isTouching === A.overlap`        | true                                                                             | fork   |
| 25  | A (0,0), B (99.99999999,0)                         | `A.overlap(B)`                      | true                                                                             | fork   |

### Rotation, scale, mirroring, animation

| #   | Setup                                                                             | Call                                                   | Result                                               | Source  |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | ------- |
| 26  | A rotation 45 (0,0), B (110,0)                                                    | `A.collide(B)`                                         | true; A (-10.710678,0)                               | fork    |
| 27  | A rotation 45 (0,0); B at (120,0), (121,0)                                        | `A.overlap(B)`                                         | true, false                                          | fork    |
| 28  | A, B rotation 45, at (0,0), (90,90)                                               | `A.collide(B)`                                         | false                                                | fork    |
| 29  | A rotation 30 (0,0), B (100,20)                                                   | `A.collide(B)`                                         | true; A (-18.30127,0)                                | fork    |
| 30  | A 100x20 rotation 90 (0,0); B 10x10 at (0,55), (0,54)                             | `A.overlap(B)`                                         | false, true                                          | fork    |
| 31  | A scale 0.5 (0,0); B at (74,0), (75,0)                                            | `A.overlap(B)`                                         | true, false                                          | fork    |
| 32  | A scale -0.5; otherwise as 31                                                     | `A.overlap(B)`                                         | true, false                                          | fork    |
| 33  | A scale 0 (0,0); B at (0,0), (10,0), (49,0), (50,0)                               | `A.overlap(B)`                                         | true, true, true, false                              | fork    |
| 34  | A scale 0 (0,0), B (0,0)                                                          | `B.overlap(A)`                                         | true                                                 | fork    |
| 35  | A scale 0 (0,0), B (10,5)                                                         | `A.collide(B)`                                         | A (-40,0)                                            | fork    |
| 36  | A mirrorX(-1), mirrorY(-1) (0,0); B at (99,0), (100,0)                            | `A.overlap(B)`                                         | true, false                                          | fork    |
| 37  | A with a 50x80 animation (0,0); B at (74,0), (0,89), (0,90)                       | `A.overlap(B)`                                         | true, true, false; `A.width` 50, `A.height` 80       | fork    |
| 38  | A as 37, scale 2; B at (99,0), (100,0)                                            | `A.overlap(B)`                                         | true, false                                          | fork    |
| 39  | A as 37, then `A.width = 100`; B at (75,0), (99,0), (100,0)                       | `A.overlap(B)`                                         | true, true, false; `A.width` 100                     | fork    |
| 40  | A as 37; B (63,0); `A.overlap(B)`, then `A.scale = 0.5`                           | `A.overlap(B)`                                         | false (the scale change takes effect at the refresh) | fork    |
| 41  | A with a 200x100 animation, scale 0.5 (0,0); B at (99,0), (100,0), (0,74), (0,75) | `A.overlap(B)`                                         | true, false, true, false                             | fork    |
| 42  | A with animations 50x80 "x" (current) and 20x20 "y"; B (60,0)                     | `A.overlap(B)`; `changeAnimation('y')`; `A.overlap(B)` | true, then false                                     | fork    |
| 43  | A without animation (0,0), B (71,0); `A.overlap(B)`, then `A.width = 40`          | `A.overlap(B)`                                         | true, then false                                     | fork    |
| 44  | A with a 1x1 animation (0,0), B (0,0)                                             | `A.overlap(B)`, `B.overlap(A)`                         | true, true (the fork: false, false; COL-4)           | by hand |
| 45  | as 44, pointer at (0,0)                                                           | `mouseIsOver(A)`                                       | true (the fork throws a TypeError; COL-27)           | by hand |

### Groups and callbacks

| #   | Setup                                                                         | Call                                                  | Result                                                      | Source |
| --- | ----------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- | ------ |
| 46  | A (0,0); group [B (90,0), C (500,0), D (0,95)]                                | `A.overlap(g, cb)`                                    | true; cb called twice; `touching` right and bottom; A (0,0) | fork   |
| 47  | A (0,0); group [B (90,0), D (0,95)]                                           | `A.collide(g)`                                        | true; A (-10,-5)                                            | fork   |
| 48  | A (0,0), B (10,0)                                                             | `A.overlap(B, cb)`                                    | cb called with `this` = A and arguments (A, B)              | fork   |
| 49  | A (0,0), B (90,0)                                                             | `A.collide(B, cb)`                                    | inside cb, A is already at (-10,0)                          | fork   |
| 50  | group [A (0,0), B (500,0)], T (10,0)                                          | `g.overlap(T)`, `g.isTouching(g)`                     | true, false                                                 | fork   |
| 51  | group [A (0,0), B (90,0)], T (45,90)                                          | `g.collide(T)`                                        | true; A (0,-10); B (90,-10); T (45,90)                      | fork   |
| 52  | A (0,0); group [B (10,0), C (20,0)]; B removed                                | `A.overlap(g, cb)`                                    | true; cb once; the group now has 1 member                   | fork   |
| 53  | g = [A (0,0), B (10,0)]; `sub = [C (500,0)]`; `sub.isTouching = g.isTouching` | `sub.isTouching([B])`, `sub.isTouching([D (1000,0)])` | true, false                                                 | fork   |

### immovable, velocity and sub-frame sampling

| #   | Setup                                                                                                             | Call                             | Result                                                                                                            | Source |
| --- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| 54  | A immovable (0,0), B (90,0)                                                                                       | `A.collide(B)`                   | true; A (0,0); B (90,0)                                                                                           | fork   |
| 55  | A (0,0), B immovable (90,0)                                                                                       | `A.displace(B)`                  | true; A (0,0); B (90,0)                                                                                           | fork   |
| 56  | A (0,0), B immovable (90,0)                                                                                       | `A.bounce(B)`                    | true; A (-10,0); `B.immovable` still true                                                                         | fork   |
| 57  | A, B both immovable, (0,0) and (90,0)                                                                             | `A.bounce(B)`                    | true; nothing moves; velocities (0,0)                                                                             | fork   |
| 58  | A (0,0), velocity (3,0), never updated; B (90,0)                                                                  | `A.collide(B)`                   | true; A (-10,0), velocity (0,0)                                                                                   | fork   |
| 59  | A (0,0), velocity (3,0); B (-3,0) at (90,0); never updated                                                        | `A.overlap(B)`                   | true                                                                                                              | fork   |
| 60  | A (0,0), velocity (3,0); B (-3,0) at (300,0); never updated                                                       | `A.overlap(B)`                   | false                                                                                                             | fork   |
| 61  | A (300,300), velocity (3,0), never updated; B (0,0)                                                               | `A.overlap(B)`                   | false; A (300,300)                                                                                                | fork   |
| 62  | primed; A (0,0), velocity (3,0); one update; B (90,0)                                                             | `A.collide(B)`                   | true; A (-10,0), velocity (0,0); B unchanged                                                                      | fork   |
| 63  | primed; A (0,0), velocity (3,4); one update; B (95,0)                                                             | `A.collide(B)`                   | true; A (-5,4), velocity (0,4)                                                                                    | fork   |
| 64  | primed; A (0,0) velocity (2,0), B (100,0) velocity (-1,0); one update                                             | `A.bounce(B)`                    | true; A (-1,0) v (-1,0); B (99,0) v (2,0)                                                                         | fork   |
| 65  | as 64, with `A.mass = 2`, `A.restitution = 0.5`                                                                   | `A.bounce(B)`                    | A (-1,0) v (0.5,0); B (99,0) v (2,0)                                                                              | fork   |
| 66  | as 64, with A's velocity (2,1)                                                                                    | `A.bounceOff(B)`                 | A (-1,1) v (-4,1); B (99,0) v (-1,0); `B.immovable` false                                                         | fork   |
| 67  | as 66                                                                                                             | `A.collide(B)`                   | A (-1,1) v (-1,1); B v (-1,0); `B.restitution` 1                                                                  | fork   |
| 68  | primed; A immovable (0,0); B (100,0) velocity (-4,0); one update                                                  | `A.collide(B)`                   | true; A (0,0) v (0,0); B (96,0) v (0,0)                                                                           | fork   |
| 69  | primed; A (0,0) velocity (4,0); B (100,0); one update                                                             | `A.displace(B)`                  | true; A (4,0) v (4,0); B (104,0)                                                                                  | fork   |
| 70  | primed; A (0,0), B immovable (90,0); A velocity (2,3); no update                                                  | `A.bounce(B)`                    | true; A (-10,0) v (-2,3)                                                                                          | fork   |
| 71  | as 70, with `A.restitution = 0.5`, `B.restitution = 0.8`, A velocity (2,0)                                        | `A.bounce(B)`                    | A (-10,0) v (-0.8,0)                                                                                              | fork   |
| 72  | primed; A 10x10 (0,0) velocity (100,0); B 10x10 (50,0); one update                                                | `A.overlap(B)`                   | true; A (50,0); B (50,0)                                                                                          | fork   |
| 73  | as 72                                                                                                             | `A.collide(B)`                   | true; A (40,0) v (0,0)                                                                                            | fork   |
| 74  | as 72                                                                                                             | `B.overlap(A)`                   | true; A (50,0)                                                                                                    | fork   |
| 75  | as 72, A immovable                                                                                                | `A.overlap(B)`                   | true; A (100,0)                                                                                                   | fork   |
| 76  | as 72, colliders created only after the update                                                                    | `A.overlap(B)`                   | false; A (100,0)                                                                                                  | fork   |
| 77  | as 76, but A starts at (-100,0) and a second update runs after the first check                                    | first check, then `A.overlap(B)` | false, then true with A (50,0)                                                                                    | fork   |
| 78  | primed; A 10x10 (0,0) velocity (1,0); B 10x10 (50,0); one update; then `A.x = 100`                                | `A.overlap(B)`                   | false; A (100,0)                                                                                                  | fork   |
| 79  | primed; A (0,0) velocity (150,0); B (200,0); one update                                                           | `A.collide(B)`                   | true; A (100,0) v (0,0)                                                                                           | fork   |
| 80  | primed; A 10x10 (0,0) velocity (8,0); B 10x10 (15,0); one update                                                  | `A.collide(B)`                   | true; A (5,0) v (0,0)                                                                                             | fork   |
| 81  | primed; A scale 0.1 (0,0) velocity (30,0); B 10x10 (15,0); one update                                             | `A.overlap(B)`                   | false; A (30,0)                                                                                                   | fork   |
| 82  | A (200,0) velocity (0,7); wall 400x20 (200,300); primed; each frame one update, then `A.collide(wall)`; 45 frames | A.y per frame                    | 7, 14, ..., 238 (34 frames, all false), then 240 (true), then 240 for the remaining 10 frames (false); final vy 0 | fork   |
| 83  | as 82 with velocity (0,150), not primed; 4 frames                                                                 | A.y per frame                    | 150 (false), 240 (true), 240, 240 (false); final vy 0                                                             | fork   |
| 84  | A 20x20 (200,0) velocity (0,400); wall 400x10 (200,300); primed; 2 frames                                         | A.y per frame                    | 285 (true), 285 (false); final vy 0                                                                               | fork   |

### Pointer and edges

Canvas 400x400. The pointer is set through `mouseX` and `mouseY` with the
camera inactive, except in row 91.

| #   | Setup                                                                                                                             | Call                                           | Result                                                                                                                                | Source |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 85  | S (200,200); pointer at (200,200), (249.99,200), (250,200), (250,250), (249,249), (150,150), (150.01,150.01)                      | `mouseIsOver(S)`                               | true, true, false, false, true, false, true                                                                                           | fork   |
| 86  | S rotation 45 (200,200); pointer at (260,200), (270,200), (240,240), (234,234), (235.5,235.5)                                     | `mouseIsOver(S)`                               | true, true, false, true, false                                                                                                        | fork   |
| 87  | S scale 0.5 (200,200); pointer at (224,200), (225,200)                                                                            | `mouseIsOver(S)`                               | true, false                                                                                                                           | fork   |
| 88  | none                                                                                                                              | `mouseIsOver(undefined)`, `mouseIsOver(null)`  | false, false                                                                                                                          | fork   |
| 89  | S (200,200) removed; pointer at (200,200)                                                                                         | `mouseIsOver(S)`                               | true                                                                                                                                  | fork   |
| 90  | S (200,200) with no collider; pointer at (0,0)                                                                                    | `mouseIsOver(S)`                               | false; S now has a collider                                                                                                           | fork   |
| 91  | S (200,200); camera active with `camera.mouseX`, `camera.mouseY` = (200,200) and `mouseX`, `mouseY` = (0,0); then camera inactive | `mouseIsOver(S)`                               | true, then false                                                                                                                      | fork   |
| 92  | S (200,200), pointer on S; button up and touch up / button down / touch down                                                      | `mousePressedOver(S)`                          | false / true / true                                                                                                                   | fork   |
| 93  | S (200,200), pointer (200,200); then `S.x = 400`; then S's update                                                                 | `mouseIsOver(S)` each time                     | true, true, false                                                                                                                     | fork   |
| 94  | A (0,0), B (90,0); `A.displace(B)`; pointer (45,0); then B's update                                                               | `mouseIsOver(B)`                               | B at (100,0); true before the update, false after                                                                                     | fork   |
| 95  | A (0,0), B (90,0); `A.collide(B)`; pointer (-55,0)                                                                                | `mouseIsOver(A)`                               | A at (-10,0); true                                                                                                                    | fork   |
| 96  | `createEdgeSprites()`                                                                                                             | geometry                                       | (-50,200) 100x400; (450,200) 100x400; (200,-50) 400x100; (200,450) 400x100; all in `allSprites`; a second call returns the same group | fork   |
| 97  | edges; S (390,200)                                                                                                                | `S.isTouching(edges)`, then `S.collide(edges)` | true; true, S (350,200), `touching.right`                                                                                             | fork   |
| 98  | edges; S (350,200)                                                                                                                | `S.isTouching(edges)`                          | false                                                                                                                                 | fork   |
| 99  | edges; S at (390,390), and separately at (395,385)                                                                                | `S.collide(edges)`                             | (350,350) in both cases                                                                                                               | fork   |
| 100 | edges; S (10,-20)                                                                                                                 | `edges.displace(S)`                            | true; S (-50,-50); edges unmoved                                                                                                      | fork   |
| 101 | edges; S (600,200)                                                                                                                | `S.collide(edges)`                             | S (600,200)                                                                                                                           | fork   |
| 102 | edges; S (470,200)                                                                                                                | `S.collide(edges)`                             | S (550,200)                                                                                                                           | fork   |
| 103 | edges                                                                                                                             | `edges.isTouching(edges)`                      | false                                                                                                                                 | fork   |
| 104 | edges; S primed at (340,200) velocity (20,0); one update                                                                          | `S.collide(edges)`                             | true; S (350,200) v (0,0)                                                                                                             | fork   |
| 105 | edges; S (360,200)                                                                                                                | `allSprites.isTouching(allSprites)`            | true                                                                                                                                  | fork   |

## Not specified

The fork has the following, and the Sprite Lab path never reaches them.
This library need not provide them.

- `setCollider` and its point, circle, `aabb` and `obb` forms, collider
  offsets, custom collider sizes and rotations, and `setColliderEach`.
- Public collider objects and their members (`sprite.collider`, `center`,
  `offset`, `halfDiagonals` and so on). The runtime never reads
  `sprite.collider`, so the representation is free.
- Debug drawing of colliders (`sprite.debug`, and apps'
  `drawDebugSpriteColliders` and `debugSprites`, which are Game Lab
  features).
- The quadtree (`useQuadTree`, `quadTree`). It is inactive unless turned
  on, and Sprite Lab never turns it on.
- `overlapPoint` and `overlapPixel`.
- Per-sprite mouse state: `mouseActive`, the `mouseIsOver` and
  `mouseIsPressed` properties on a sprite, and the `onMouseOver`,
  `onMouseOut`, `onMousePressed` and `onMouseReleased` callbacks.
- The resumable, interpreter-driven group iteration in `P5SpriteWrapper`
  and `P5GroupWrapper` (COL-1).
- Collision behavior when `mass` is 0 on both sides (M = 0 gives NaN), and
  the `bounciness` alias of `restitution`. The runtime never sets `mass`,
  `restitution` or `immovable`, so those values stay at their defaults in
  Sprite Lab. COL-20 and COL-21 still state them, because levelbuilder
  code may set them.

## Open questions

1. The brief says the wrapper overrides change Sprite Lab collisions. They
   do not: apps installs them only for levels that do not use Blockly
   (COL-1). They are installed on the shared p5 prototype and never
   removed. So a page that initialised a non-Sprite Lab p5 wrapper earlier
   would carry them into Sprite Lab. Nothing seen in the Lab2 host does
   this. Treat it as unreachable unless someone knows otherwise.
2. Suspected bug that students may rely on: sub-frame sampling moves
   sprites even for `overlap` and `isTouching` (COL-16, rows 72 and 74),
   and it moves B as well as A. Only sprites with non-zero velocity are
   affected: `velocityX` and `velocityY` blocks, and scene physics. The
   spec reproduces it.
3. Suspected bug: sampling measures sprite size from unscaled base
   dimensions (row 81). Sprite Lab scales costumes down so that their
   largest side is about 100 pixels. R is therefore the raw image size,
   and fast small sprites tunnel. The spec reproduces it.
4. Suspected bug: until a sprite's first update with non-zero velocity,
   its swept box is a point at the world origin. The broad phase then
   misses real crossings (row 76), and reports false ones when the other
   shape covers (0, 0) (row 61; that only triggers a harmless final
   check). The spec reproduces it.
5. `mouseIsOver` never refreshes the collider (COL-8, rows 93 and 94).
   In the classic draw order, the pre-draw update refreshes colliders,
   then behaviors move sprites, then click events run. A click is
   therefore tested against the sprite's position before this frame's
   behaviors. The exception is a sprite that some touch check refreshed
   in between. Students may rely on this without knowing it. The spec
   reproduces it.
6. `displace` does not refresh B's collider, and does not reset B's anchor
   or previous position (row 94). A later sampled check in the same frame
   interpolates B from a stale previous position. The spec reproduces it.
7. `collide` with an immovable A cancels B's normal velocity but leaves
   B overlapping A (row 68). That is consistent with the formulas, and
   probably unintended.
8. Resting contact is not touching (rows 82 and 98). A sprite that
   `collide` stops on a floor reports `isTouching` false on later frames.
   Sprite Lab's `isDirectlyAbove` works around this with an exact
   comparison of bounds. Students certainly rely on this. Keep it.
9. Resolved: the fork's loading guard is not reproduced. A 1x1 costume
   collides and is hit-tested like any other (COL-4, COL-27).
10. `groupSpritesTouched` copies `allSprites.isTouching` onto a filtered
    array. Because the function is tied to `allSprites` (COL-22, row 53),
    the criterion tests every sprite, edges included, against the object
    group, whatever the subject group. That is a bug in the criterion.
    Level validation results depend on it, so the spec keeps the binding.
11. Resolved: the bad-target error is an `Error` that converts to the
    fork's string (COL-23).
12. Iteration over the target array and over a group uses the live
    length (COL-17, COL-22). A callback that removes sprites (only
    reachable from levelbuilder code that passes a callback, such as
    `sprite.overlap(World.allSprites, callback)`) shifts the remaining
    elements, so one element can be skipped. The spec reproduces it.
