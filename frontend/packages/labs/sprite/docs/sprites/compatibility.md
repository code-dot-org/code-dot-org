# Compatibility register

This register lists every behavior of the library that is a known or
suspected bug in the fork, or a surprise kept only for fidelity. The
library reproduces each one on purpose, so that saved student games and
level validation behave as they do in apps today. The register is the set
of behaviors a future fix must change deliberately and announce; nothing
here may change by accident.

Each entry names the requirements and test vectors that specify the
behavior, and the implementation test that pins it. A fix changes three
things together: the requirement (and its vectors), the pinning test, and
this entry, which is then moved to a "Fixed" note or deleted. A change that
touches a pinned behavior without touching this file is a regression.

Terms follow the other documents. "The fork" is `@code-dot-org/p5.play`
1.3.21-cdo over `@code-dot-org/p5` 0.5.4 as apps' `P5Wrapper` configures it
for Sprite Lab. "The runtime" is `CoreLibrary`, the Sprite Lab commands and
`SpriteLab2Engine`. "Classic" is the Sprite Lab that runs in apps; "Sprite
Lab 2" is `SpriteLab2Engine`. "Confirmed on the fork" means the
reproduction was run under apps' test harness, with the Sprite Lab option,
while this register was written. "By reasoning" means it was derived from
the specification and the runtime source, and not run.

Each entry's _Fixing it_ assumes a project version gate is available: a
number stored with a project or level that selects old or fixed behavior,
defaulting to old for everything saved before the fix. No such gate exists
today; the first fix that needs one must add it to the library's attach
options and to the engine.

## Frame and lifecycle

### CMP-1. A sprite after an expiring sprite skips its update

**Specified by:** LIF-11, LIF-12, SPR-46, GRP-14; vectors L5, L6, L7, L8.

**Behavior:** The update pass walks `allSprites` by index and re-reads its
length before each visit. A sprite whose lifetime reaches 0 leaves
`allSprites` during its own update, so the next sprite slides into the
index just visited and is not updated in that frame. Reproduction: create
A, B and C at x 0; give A lifetime 1 and B and C velocity (1, 0); run one
frame. A is removed, B is still at x 0, C is at x 1. On the next frame B
moves to 1 and C to 2. Confirmed on the fork.

**Expected:** Every sprite that was live at the start of the pass is
updated exactly once.

**Who depends on it:** Nobody knowingly. Effect sprites (burst, pop, rain,
spiral) all carry lifetimes, so a neighbour of an expiring effect sprite
lags one frame; that is visible only frame by frame. Recorded traces of
effects, if any validation compares them, would differ. Fairly sure no
criterion depends on it.

**Fixing it:** Iterate over a snapshot of `allSprites` taken at the start of
the pass, skipping members already removed. Existing games change by one
frame of motion for a few effect sprites. No runtime change is needed. Safe
to ship without a version gate unless a recorded trace is found.

**Pinned by:** `overview.test.ts`, "LIF-11, L5, L6" and "LIF-11, L7, L8".

### CMP-2. Classic preview leaves the camera on

**Specified by:** LIF-20, LIF-15, CAM-11; vector L4.

**Behavior:** Classic preview runs the pre phase and the draw program by
calling `redraw()` and never runs the post phase, so the camera stays
active with its transform pushed and never popped. Reproduction: run one
full frame, then call `redraw()` alone; `camera.active` is true afterwards.
Confirmed on the fork. On p5 0.5.4 the next frame's matrix reset hides the
unbalanced push.

**Expected:** Every pre phase is paired with a post phase, or preview turns
the camera off itself.

**Who depends on it:** Nobody. `SpriteLab2Engine` does not preview. The
behavior matters only because the library must tolerate it (LIF-20: the
next pre phase must not push a second transform).

**Fixing it:** Make the host call the post phase after preview. No project
changes. If classic preview is never ported, delete this entry.

**Pinned by:** `overview.test.ts`, "LIF-20, L4".

### CMP-3. `World.seconds` counts from attachment and never pauses

**Specified by:** WLD-7, LIF-5, LIF-19.

**Behavior:** `World.seconds` is the rounded number of seconds since the
library was attached to the instance. It keeps counting while the program
is paused and across Sprite Lab 2 reruns, which reuse the instance.
Reproduction: move the recorded start time 5000 ms into the past; read
`World.seconds`: 5. Confirmed on the fork (the start-time dependence);
pause and rerun by reasoning, since nothing in the library observes them.

**Expected:** Seconds since the current run started, excluding pauses.

**Who depends on it:** No Sprite Lab block reads `World.seconds`; the
runtime computes its own pause-adjusted clock from the start time
(`CoreLibrary.getUnpausedWorldTime`). Levelbuilder code that reads
`World.seconds` directly would see the difference. Fairly sure no shipped
level does.

**Fixing it:** Give the library a pause-aware clock that the host resets on
rerun, and make `World.seconds` read it. `getUnpausedWorldTime` must then
stop subtracting its own pause total, or keep reading the raw start time.

**Pinned by:** `world.test.ts`, "WLD-7: seconds count from attachment";
`overview.test.ts`, "LIF-5".

### CMP-4. `rgb` treats an alpha of 0 as opaque

**Specified by:** LIF-8; vector L9.

**Behavior:** `rgb(r, g, b, a)` replaces any falsy a, 0 included, by 1
before scaling it to 255. Reproduction: `rgb(1, 2, 3, 0)` has alpha 255;
`rgb(1, 2, 3, 0.5)` has alpha 128 after p5 rounds it. Confirmed on the
fork.

**Expected:** Alpha 0 is fully transparent; only an omitted alpha means
opaque.

**Who depends on it:** Likely nobody. The runtime calls `rgb` only from the
rain effect, with alpha 0.5.

**Fixing it:** Treat only `undefined` as opaque. No runtime change.

**Pinned by:** `overview.test.ts`, "LIF-8, L9".

## Sprites

### CMP-5. A costume change on a scaled sprite multiplies its size by the old scale

**Specified by:** SPR-24, SPR-27, SPR-29, ANI-19, ANI-42; vectors S22, S23,
S26, S27, and the animation.md sprite rows with `scale = 0.5` and
`width = 50`.

**Behavior:** Attaching an animation sets the sprite's natural size to the
frame size times the absolute effective scale (`scale` times stretch) at
that moment. `width` and `height` are therefore no longer the unscaled
costume size, while drawing and the collider still apply `scale` again.
The runtime's costume command attaches before it rescales, so the old
scale leaks in. Reproduction: a sprite with `scale` 3 given a 50 by 80
image reports `width` 150, `height` 240. A sprite with `scale` 0.5 given a
100 by 100 image reports `width` 50, yet its collider is 50 by 50 (a
100 by 100 sprite 74 px away overlaps it, 75 px away does not), so only
the reported size is wrong. Both confirmed on the fork.

Visible effects: speech bubbles sit at the wrong height
(`getScaledHeight()`); `isDirectlyAbove` (apps `createSpriteCollider`) and
platform physics measure the wrong box; `setProp` width or height after a
costume change sets the stretch from the wrong base (S27: "width 100%"
draws four times too wide).

**Expected:** `width` and `height` stay the unscaled frame size times the
stretch, whatever the scale at attach time.

**Who depends on it:** Students' games, certainly: any project that scales
a sprite and then changes its costume carries the wrong size into speech
bubbles, `isDirectlyAbove` and later `setProp` sizes. Sprite Lab 2 partly
undoes it (CMP-6). No validation criterion is known to read `width`.

**Fixing it:** Set the natural size to the raw frame size on attach. This
moves speech bubbles and changes `isDirectlyAbove` and width/height blocks
in existing projects, so gate it by project version.
`SpriteLab2Engine.unscaleSheetSpriteSizes_` becomes unnecessary and should
be removed with the fix (CMP-6).

**Pinned by:** `sprite.test.ts`, "SPR-24, S23" and "SPR-24, SPR-29, S26,
S27, S28"; `animation.test.ts`, "ANI-19: scale and stretch size a new
animation".

### CMP-6. The engine's size correction covers only multi-frame costumes

**Specified by:** SPR-26, ANI-41; sprite.md Open question 2.

**Behavior:** Every frame, before the draw program, `SpriteLab2Engine`
resets the natural size of each sprite whose animation has more than one
frame to that animation's current frame size, undoing CMP-5 for those
sprites one frame after a costume change. Stills are not corrected, so a
scaled sprite given a still costume keeps the CMP-5 size. The engine's
comment attributes the wrong size to frame changes; in the fixed-frame-size
mode the host always uses, frame changes never resize (SPR-25), and the
wrong size comes from the costume change. By reasoning, from the engine
source.

**Expected:** Either no correction is needed (CMP-5 fixed), or all
costumes are corrected alike.

**Who depends on it:** Sprite Lab 2 platform levels: character sheets rely
on the correction so bodies do not sink into platforms. Games with scaled
still costumes rely on the uncorrected size in the same ways as CMP-5.
Sure about the first; fairly sure about the second.

**Fixing it:** Fix together with CMP-5 and delete the correction. Fixing
this alone (correcting stills too) changes still-costume sizes in every
Sprite Lab 2 project, so it needs the same version gate.

**Pinned by:** `sprite.test.ts`, "SPR-26: setNaturalSize sets the natural
size and keeps the stretch", and `animation.test.ts`, "ANI-41", pin the
operation only. None yet pins the engine's multi-frame-only use; add an
engine test that changes a scaled sprite to a still and to a sheet costume
and checks that only the sheet sprite's `width` is reset next frame.

### CMP-7. A fractional lifetime never expires

**Specified by:** SPR-46; vector S10.

**Behavior:** Lifetime decreases by 1 while positive and the sprite is
removed only when it is exactly 0. A fractional lifetime steps over 0 and
stays negative forever. Reproduction: lifetime 2.5; after four frames it is
−0.5 and the sprite is not removed. Confirmed on the fork.

**Expected:** The sprite is removed when its lifetime first reaches 0 or
below.

**Who depends on it:** Likely nobody. Blocks set integer lifetimes; only
`setProp` on `lifetime` with a fraction reaches it. Effect behaviors test
`lifetime === 0` in the runtime and would need the same change.

**Fixing it:** Remove at lifetime ≤ 0 after a decrement from a positive
value. Change the runtime's effect behaviors to match. Low risk.

**Pinned by:** `sprite.test.ts`, "SPR-46, S10".

### CMP-8. A NaN depth poisons every later depth

**Specified by:** SPR-4, GRP-9.

**Behavior:** A new sprite's depth is one more than the largest depth in
`allSprites`, and a NaN depth anywhere makes that maximum NaN, so every new
sprite gets depth NaN and the depth sort becomes arbitrary. Reproduction:
set one sprite's `depth` to NaN; create a sprite: its depth is NaN.
Confirmed on the fork.

**Expected:** NaN depths are ignored or rejected.

**Who depends on it:** Likely nobody. Depth is set from blocks with numbers;
NaN arrives only through an arithmetic mistake in student code.

**Fixing it:** Ignore NaN members when computing the maximum. Changes draw
order only for projects already in that broken state.

**Pinned by:** `sprite.test.ts`, "SPR-4: a NaN depth among the members
makes the new depth NaN"; `group.test.ts`, "GRP-9: depth bounds, and NaN".

### CMP-9. The runtime's burst and pop effects use degrees as radians

**Specified by:** sprite.md Open question 4; no library requirement (the
library is correct: LIF-4 sets degrees, SPR-11).

**Behavior:** `burstFunc` and `popFunc` move each effect sprite by the sine
and cosine of its `direction`, which is in degrees, through `Math.sin` and
`Math.cos`, which take radians. The spread of the burst and pop effects is
therefore scrambled rather than even. By reasoning, from the runtime
source.

**Expected:** Directions converted to radians first.

**Who depends on it:** Every project that uses the burst or pop effect
looks the way it does because of this. No validation reads effect
positions.

**Fixing it:** Convert in the runtime, not the library. The effects will
look different in all existing projects; a version gate is optional since
the result is random-looking either way.

**Pinned by:** none yet. The ported runtime needs a test that runs one
burst step for a sprite with direction 90 and checks the displacement uses
sin(90 rad) and cos(90 rad).

## Groups and edges

### CMP-10. `clear()` leaves stale back-references

**Specified by:** GRP-8; vector G5.

**Behavior:** `clear()` empties the group's array but leaves the group in
each former member's `groups` list. Reproduction: add a to g; `g.clear()`:
`g.size()` 0, `a.groups.length` 2; `g.remove(a)` then returns false and
leaves `a.groups.length` at 2. Confirmed on the fork. What happens when
such a sprite is later removed is a departure (CMP-41).

**Expected:** `clear()` also removes the group from each member's `groups`.

**Who depends on it:** Nobody in Sprite Lab: the runtime never calls
`clear()`. Kept only because it is cheap and GRP-8 states it.

**Fixing it:** Clear the back-references too. No project impact.

**Pinned by:** `group.test.ts`, "GRP-8, G5".

### CMP-11. `minDepth()` of an empty group is 99999

**Specified by:** GRP-9; vector G8.

**Behavior:** An empty group reports `maxDepth()` 0 and `minDepth()` 99999,
a sentinel rather than a depth. Confirmed on the fork.

**Expected:** Both undefined, or ±Infinity, for an empty group.

**Who depends on it:** Likely nobody; the runtime does not call `minDepth`.

**Fixing it:** Return a documented empty value. No project impact known.

**Pinned by:** `group.test.ts`, "GRP-9, G8".

### CMP-12. Removing all sprites leaves `edges` pointing at an empty group

**Specified by:** WLD-20, WLD-16, LIF-19; vectors W8, W13.

**Behavior:** `allSprites.removeSprites()` removes the four edge sprites
but leaves `edges` set to their now empty group, and `createEdgeSprites()`
returns that group because `edges` is truthy. Edge collisions then do
nothing. Reproduction: `createEdgeSprites()`; `allSprites.removeSprites()`;
`createEdgeSprites()` returns the same group, of size 0. Confirmed on the
fork.

**Expected:** `createEdgeSprites()` recreates the edges when the group is
empty, or removal clears `edges`.

**Who depends on it:** Runtime workaround: `SpriteLab2Engine` sets `edges`
to undefined after `removeSprites()`. Classic creates a new instance per
run and never meets it. Sure.

**Fixing it:** Recreate when `edges` is empty. The engine's workaround then
becomes redundant but harmless. No project impact.

**Pinned by:** `world.test.ts`, "WLD-20, W8" and "WLD-20, W13".

## Collision

### CMP-13. The swept check rewinds sprites, even for `overlap` and `isTouching`

**Specified by:** COL-15, COL-16, COL-21; collision.md Open question 2;
rows 72, 73, 74, 75.

**Behavior:** When either sprite has non-zero velocity and the broad phase
reports a possible crossing, the pairwise test replays the frame's motion
in steps from both sprites' previous positions. At the first overlapping
step it stops and leaves every non-immovable sprite at that step's
position, whatever the method, so a read-only check moves sprites back
along their paths, and moves the other sprite too. Reproduction: 10 by 10
sprites A at (0, 0) and B at (50, 0), both with colliders; A velocity
(100, 0); one update each (A at (100, 0)); `A.overlap(B)` returns true and
A is now at (50, 0). `B.overlap(A)` in the same setup also leaves A at
(50, 0). Both confirmed on the fork.

**Expected:** `overlap` and `isTouching` never move anything; the other
sprite is never moved by the caller's check.

**Who depends on it:** Students' games that set `velocityX`/`velocityY` or
use scene physics, and touch events among moving sprites: those sprites
visibly snap back on contact, and games are tuned around it. Fairly sure
some rely on it without knowing.

**Fixing it:** Restore both sprites after sampling for `overlap`,
`isTouching` and for the other sprite in every method. Changes contact
positions in games with velocity; gate by project version.

**Pinned by:** `collision.test.ts`, "COL-16, Open question 2: overlap
leaves A at the sample (row 72)", "COL-16: the check from B moves A too
(row 74)" and "COL-16, COL-21: an immovable A is restored (row 75)".

### CMP-14. The swept check sizes sprites by their unscaled costume

**Specified by:** COL-16 (sampling step); collision.md Open question 3;
row 81.

**Behavior:** The sampling step length is the smaller side of the larger
sprite's unscaled base size divided by the relative speed. Sprite Lab
shrinks costumes by `scale`, so the step is too long for small sprites and
fast small sprites pass through each other. Reproduction: A 100 by 100 at
`scale` 0.1 from (0, 0) at velocity (30, 0), B 10 by 10 at (15, 0), both
with colliders; one update; `A.overlap(B)` is false and A is at (30, 0).
Confirmed on the fork.

**Expected:** The step is computed from the scaled size, so no sprite
tunnels through another one of at least its own size.

**Who depends on it:** Games with fast, small, velocity-driven sprites
(projectiles). Fixing it makes more hits register. Fairly sure nothing
depends on the misses deliberately.

**Fixing it:** Use scaled dimensions. Changes hit outcomes in fast games;
gate by project version, or ship ungated as a pure improvement if the
maintainer accepts that risk.

**Pinned by:** `collision.test.ts`, "COL-16, Open question 3: R uses
unscaled sizes, so small sprites tunnel (row 81, example)".

### CMP-15. The swept box starts as a point at the world origin

**Specified by:** COL-16 (swept box); collision.md Open question 4; rows
61, 76, 77.

**Behavior:** A collider's swept box is a zero-size box at (0, 0) until
the first update in which the sprite has non-zero velocity. A check before
then misses real crossings, and reports a false broad-phase hit when the
other shape covers (0, 0) (harmless: only the final check follows).
Reproduction: A and B 10 by 10 at (0, 0) and (50, 0), no colliders; A
velocity (100, 0); one update (A at (100, 0)); `A.overlap(B)` is false.
Confirmed on the fork.

**Expected:** A new collider's swept box is its own box at its position.

**Who depends on it:** Games where a sprite is given velocity and checked
in its first moving frame. Tunnelling there is rare and unlikely to be
relied on.

**Fixing it:** Initialize the swept box from the collider. Low risk;
may ship ungated.

**Pinned by:** `collision.test.ts`, "COL-16, Open question 4: a fresh
swept box is a point at the origin (rows 76, 77)".

### CMP-16. `mouseIsOver` tests the collider from the last update

**Specified by:** COL-8, COL-24, CAM-15, INP-26; collision.md Open
question 5; rows 93, 94.

**Behavior:** `mouseIsOver` creates a missing collider but never refreshes
an existing one. In the classic frame the update refreshes colliders, then
behaviors move sprites, then click events run, so a click is tested
against where the sprite was before this frame's behaviors (unless some
collision check refreshed it in between). Reproduction: 100 by 100 sprite
at (200, 200), pointer at (200, 200): true; set `x` to 400: still true;
run the sprite's update: false. Confirmed on the fork.

**Expected:** The hit test uses the sprite's current position, rotation
and scale.

**Who depends on it:** Click events and the draggable behavior on moving
sprites; the lag is one frame and players adapt to it. Criteria
`anySpriteClicked` inherit it. Fairly sure no level depends on it
deliberately, but validation replays with clicks could change.

**Fixing it:** Refresh the collider in `mouseIsOver`. Gate by project
version if any recorded-input validation exists.

**Pinned by:** `collision.test.ts`, "COL-8, COL-24: mouseIsOver does not
refresh; the update does".

### CMP-17. `displace` does not update the pushed sprite

**Specified by:** COL-8, COL-19 step 6; collision.md Open question 6; row 94.

**Behavior:** `A.displace(B)` moves B's position but leaves B's collider,
anchor and previous position as they were. Later checks in the same frame
see B's old collider, and a sampled check interpolates B from a stale
previous position. Reproduction: A at (0, 0), B at (90, 0);
`A.displace(B)` (B now at (100, 0)); pointer at (45, 0): `mouseIsOver(B)`
true; after B's update: false. Confirmed on the fork.

**Expected:** B's collider, anchor and previous position follow the push,
as A's do after `collide`.

**Who depends on it:** Games that displace and then test the pushed sprite
in the same frame; the effect lasts one frame. Likely nobody knowingly.

**Fixing it:** Refresh B after the push. Low risk; gate only if
frame-exact traces are validated.

**Pinned by:** `collision.test.ts`, "COL-8, COL-19: displace does not
refresh B (row 94)".

### CMP-18. `collide` with an immovable caller leaves the other sprite overlapping

**Specified by:** COL-19 step 6, COL-20, COL-21; collision.md Open
question 7; row 68.

**Behavior:** When A is immovable, `A.collide(B)` moves neither sprite but
sets B's velocity along the contact normal to A's. B stops, still
overlapping A. Reproduction: A immovable at (0, 0), B at (100, 0) with
velocity (−4, 0), both with colliders; one update; `A.collide(B)` returns
true; A at (0, 0), B at (96, 0) with velocity (0, 0), and `A.overlap(B)`
is still true. Confirmed on the fork.

**Expected:** Either B is pushed out (as `displace` would), or the call
does nothing to B.

**Who depends on it:** Only code that sets `immovable`, which blocks never
do; levelbuilder libraries might. Likely nobody.

**Fixing it:** Push B out by the separation vector. Coordinate with any
levelbuilder library that sets `immovable`.

**Pinned by:** `collision.test.ts`, "COL-20, Open question 7: collide with
an immovable A (row 68)".

### CMP-19. Flush contact is not touching

**Specified by:** COL-12, COL-29; collision.md Open question 8; rows 1,
82, 97, 98.

**Behavior:** Boxes that meet exactly along an edge do not overlap, so
`isTouching` is false for a sprite resting against another, including a
sprite `collide` has just stopped. Reproduction: 100 by 100 sprites at
(0, 0) and (100, 0): `overlap` false. With edges on a 400 by 400 canvas, a
100 by 100 sprite at (390, 200): `collide(edges)` returns true and moves it
to (350, 200); then `isTouching(edges)` is false. Confirmed on the fork.

**Expected:** Contact counts as touching, or `collide` leaves the flag
that it collided.

**Who depends on it:** Students' games and runtime workarounds, certainly:
`isDirectlyAbove` compares bounds exactly to detect resting contact
because `isTouching` cannot; when-touching events on a wall fire once and
then stop. Level criteria built on touch events depend on it.

**Fixing it:** Do not. If ever changed, `isDirectlyAbove`, the touch
events' per-pair memory and every touch-based criterion must be reviewed,
behind a version gate.

**Pinned by:** `collision.test.ts`, "COL-12, COL-14: touching boxes do not
overlap; no tolerance", "COL-29: collide stops a sprite flush with the
edge" and "COL-16, Open question 8: a slow fall onto a wall (row 82)".

### CMP-20. Sprites with the same centre separate toward −x

**Specified by:** COL-12; row 11, row 12.

**Behavior:** When the centres coincide along the chosen axis, the
separation vector points against the axis itself, and for unrotated boxes
the first axis is world x, so the caller is always pushed left.
Reproduction: two 100 by 100 sprites at (0, 0); `A.collide(B)` moves A to
(−100, 0). Confirmed on the fork.

**Expected:** Any deterministic choice is defensible; a left bias is
surprising in symmetric scenes.

**Who depends on it:** Games that spawn sprites on top of each other and
collide or displace them; the direction of the first push is visible.
Fairly sure it is relied on only incidentally.

**Fixing it:** Leave it. Any other rule changes the first frame of such
scenes.

**Pinned by:** `collision.test.ts`, "COL-12: ties go to the first axis;
coincident centres (rows 8..13)".

### CMP-21. Group collision methods are bound to their group

**Specified by:** COL-22; collision.md Open question 10; row 53.

**Behavior:** A group's collision functions always iterate the group they
were created for, whatever `this` is. The `groupSpritesTouched` criterion
filters `allSprites` into plain arrays, copies `allSprites.isTouching`
onto the subject array and calls it with the object array, so it tests
every sprite in `allSprites` (edges included) against the object group and
ignores the subject group. Reproduction: group g holds A (0, 0) and B
(10, 0); a plain array [C at (500, 0)] given `g.isTouching`; calling it
with [B] returns true (A touches B; C is never tested), and with a far
sprite returns false. Confirmed on the fork.

**Expected:** A method copied onto an array tests that array.

**Who depends on it:** Level validation, certainly: every level whose
criteria use `groupSpritesTouched` with a subject group passes or fails by
this rule.

**Fixing it:** Fix the criterion in the runtime (iterate the subject
sprites itself), not the library. Re-verify every level that uses the
criterion before shipping; gate by level if any result changes.

**Pinned by:** `collision.test.ts`, "COL-22: the functions stay bound to
their group (row 53, example)".

### CMP-22. Live-length iteration skips a member after a removal

**Specified by:** COL-17 step 4, COL-22, GRP-14 (and LIF-11 for the
update pass, CMP-1); collision.md Open question 12.

**Behavior:** Collision methods walk the target array, and group methods
walk the group, by index while the index is below the current length. A
callback that removes the current element shifts the rest down, and the
next element is skipped. Reproduction: A at (0, 0); group [T1 (10, 0), T2
(20, 0), T3 (30, 0)]; `A.overlap(group, cb)` where cb removes the other
sprite: cb sees T1 and T3, never T2, and T2 is left in the group.
Confirmed on the fork.

**Expected:** Every member present at the start of the call is visited.

**Who depends on it:** Only code that passes a removing callback, such as
levelbuilder libraries calling `sprite.overlap(World.allSprites,
callback)`. Blocks pass no callback. Likely nobody knowingly.

**Fixing it:** Iterate over a snapshot. Changes which sprites a
levelbuilder callback sees; check those libraries first.

**Pinned by:** `collision.test.ts`, "COL-17, Open question 12: a callback
that removes shifts the live length".

## Animation

### CMP-23. Tint darkens and makes soft edges more opaque

**Specified by:** ANI-34, SPR-54; animation.md Open question 5; tint
vectors.

**Behavior:** Code.org's p5 tints a costume by blending the tint into the
pixel colour and then multiplying by the pixel colour again, and it raises
partial alpha: a pixel at alpha 0.5 draws at 0.75, and a tint with alpha 0
still squares the colour ((0.8, 0.6, 0.4) becomes (0.64, 0.36, 0.16)). By
reasoning from Code.org p5's tint path and the hand vectors; the harness's
canvas mock records calls, not pixels, so it was not run.

**Expected:** Upstream p5 tint: a multiply by the tint colour, alpha scaled
by tint alpha, and alpha 0 tint leaves the image unchanged.

**Who depends on it:** Students' games, certainly: every tinted costume
with soft edges looks this way.

**Fixing it:** Use upstream tint. Visible in all tinted projects; gate by
project version.

**Pinned by:** `animation.test.ts`, the "ANI-34" tests (opaque tint,
alpha-0 tint, half-transparent pixel, 8-bit rounding).

### CMP-24. The frame clock is not reset by `stop`, `play` or a new delay

**Specified by:** ANI-12, ANI-40; animation.md Open question 3.

**Behavior:** An animation advances on updates whose running count is a
multiple of `frameDelay`. `stop()`, `play()`, `changeFrame()` and changing
`frameDelay` leave the count alone, so after `play()` the first step comes
at the next multiple, not a full delay later. Reproduction: 4 frames,
delay 4; stop before update 2, play before update 6, delay 3 before update
9; frames after updates 1..12: 0 0 0 0 0 0 0 1 2 2 2 3. Confirmed on the
fork.

**Expected:** Playback restarts its delay on `play()` and on a delay
change.

**Who depends on it:** Nobody visibly in Sprite Lab: character sheets are
driven frame by frame and never `play()`. Animation timing in any project
that pauses and resumes a costume would shift by up to one delay.

**Fixing it:** Reset the count in `play()` and on delay writes. Low risk.

**Pinned by:** `animation.test.ts`, "ANI-12: stop, play and a new delay
keep the update count".

### CMP-25. Frame-delay arithmetic accepts 0, negative and fractional delays

**Specified by:** ANI-13; advancing vectors with delays 0, 2.5 and −2.

**Behavior:** The step test is a JavaScript remainder of the update count
by `frameDelay`. A delay of 0 never advances; −2 behaves as 2; 2.5
advances at counts 5, 10, and so on. Reproduction: delay 0, six updates:
frame 0. Confirmed on the fork for 0; the other two are fork vectors in
animation.md.

**Expected:** Delays are clamped to a positive integer.

**Who depends on it:** Project metadata derives the delay from a frame
rate (ANI-39) and could yield odd values; likely nobody otherwise.

**Fixing it:** Clamp at the metadata boundary rather than in the library.
Low risk.

**Pinned by:** `animation.test.ts`, "ANI-13: delay 0 never advances",
"ANI-13: delay 2.5 advances on exact multiples", "ANI-13: delay -2
behaves as 2".

### CMP-26. `changeFrame` accepts negative and fractional indices

**Specified by:** ANI-14, ANI-9, ANI-32; animation.md Open question 4.

**Behavior:** `changeFrame(f)` clamps f only from above. A negative or
fractional index is stored; it names no image, so the frame draws nothing
(with a console warning) and `getWidth()`/`getHeight()` return 1.
Reproduction: 4-frame sheet of 100 by 100; `changeFrame(-1)`:
`getWidth()` 1; `changeFrame(2.5)`: `getFrame()` 2.5, `getWidth()` 1.
Confirmed on the fork.

**Expected:** Indices rounded and clamped to the valid range.

**Who depends on it:** Nobody known; the engine passes valid indices.

**Fixing it:** Round and clamp. Keep `getWidth()` 1 for an empty
animation. Low risk.

**Pinned by:** `animation.test.ts`, "ANI-14: changeFrame clamps above, not
below, and keeps playing".

### CMP-27. Grid sheets wrap and overrun the image

**Specified by:** ANI-3; sheet grid vectors; animation.md Open question 6.

**Behavior:** Grid frames are laid out row by row; a frame whose origin is
inside the image may extend past its right or bottom edge, and a frame
count beyond the grid wraps back to (0, 0). Reproduction: 250 by 200
image, 100 by 100 frames, 7 frames: origins (0,0) (100,0) (200,0) (0,100)
(100,100) (200,100) (0,0). Confirmed on the fork.

**Expected:** Only whole frames inside the image; excess frames rejected.

**Who depends on it:** Nobody known; the editor writes consistent
metadata.

**Fixing it:** Validate metadata when loading. No project impact expected.

**Pinned by:** `animation.test.ts`, the "ANI-1..ANI-3" sheet-grid table
(`it.each`).

### CMP-28. A cloned sheet loses its frame names

**Specified by:** ANI-4.

**Behavior:** A sheet clone copies each frame's rectangle but takes the
name from the rectangle object, which has none, so cloned records' names
are undefined. Reproduction: grid sheet frame 1 has name 1; its clone's
frame 1 has name undefined. Confirmed on the fork.

**Expected:** Names copied.

**Who depends on it:** Nobody; nothing reads frame names.

**Fixing it:** Copy the record's name. No impact.

**Pinned by:** `animation.test.ts`, "ANI-4: a clone shares the image and
copies the rectangles".

### CMP-29. Classic Sprite Lab shows a whole sheet as one frame

**Specified by:** ANI-35; animation.md Open question 2.

**Behavior:** Classic loads every project image as a still, so a library
image whose metadata records several frames is shown as the whole strip.
The loader's comment says "first frame". By reasoning, from the host
source.

**Expected:** The first frame, or the animation.

**Who depends on it:** Classic projects using multi-frame library images
show the strip today. Sure that some exist; unsure how many.

**Fixing it:** Engine change, not library. Changes sprite sizes and looks
in those projects; gate by project version.

**Pinned by:** none yet. The engine port needs a test that loads a
3-frame image in classic mode and checks the still's width equals the
whole image width.

## Camera

### CMP-30. `camera.mouseX` ignores zoom

**Specified by:** CAM-9 step 2, CAM-15; camera.md Open question 1.

**Behavior:** At activation `camera.mouseX` is the canvas mouse x plus the
camera x minus half the canvas width, without dividing by the zoom, so it
is correct only at zoom 1. Reproduction: zoom 2, camera at (250, 200),
mouse at (10, 20); one frame: `camera.mouseX` 60, `camera.mouseY` 20 (the
world point under the pointer is (155, 110)). Confirmed on the fork.

**Expected:** (mouse − canvas centre) / zoom + camera position.

**Who depends on it:** Runtime workaround: `SpriteLab2Engine` overwrites
`camera.mouseX` and `mouseY` with the zoom-correct value each frame
(CAM-18 step 2), and its own `camera.on()` later rewrites them with this
formula. Classic never zooms. Sure.

**Fixing it:** Divide by zoom in the library, then delete the engine's
overwrite. No classic impact; Sprite Lab 2 unchanged if both change
together.

**Pinned by:** `camera.test.ts`, "CAM-9, CAM-10, CAM-11, CAM-12: zoom 2 at
(250, 200), off, on, on, post".

### CMP-31. Dragging in zoomed scenes follows the canvas point

**Specified by:** WLD-3, CAM-16, INP-28; world.md Open question 1; camera.md
Open question 3.

**Behavior:** The draggable behavior hit-tests with `mousePressedOver`,
which uses the camera point, but places the dragged sprite at
`World.mouseX`/`mouseY` plus an offset, which are canvas coordinates. At
zoom 1 with the camera centred these agree; in a zoomed or scrolled
Sprite Lab 2 scene a dragged sprite does not follow the pointer.
Confirmed on the fork that `World.mouseX` stays 10 while `camera.mouseX`
is 60 in the CMP-30 setup; the drag consequence by reasoning from
`draggableFunc`.

**Expected:** The dragged sprite stays under the pointer.

**Who depends on it:** Sprite Lab 2 platform levels with draggable
sprites, if any; unsure.

**Fixing it:** Change `draggableFunc` (runtime) to use the camera's world
point. No library change. Gate by project version if platform levels
with dragging exist.

**Pinned by:** `world.test.ts`, "WLD-3, W6: World.mouseX is not corrected
for the camera", and `camera.test.ts`, "CAM-16", pin the library side.
The runtime port needs a drag test at zoom 2.

### CMP-32. Sprite Lab 2's zoom-correct mouse uses last frame's camera position

**Specified by:** CAM-18 step 2; camera.md Open question 2.

**Behavior:** The engine computes the mouse's world point with this
frame's eased zoom and the camera position left from the previous frame,
before it chooses this frame's focus. During a zoom ease or a scroll the
point is off by one frame's change; on the first frame of a rerun the
position is whatever the previous run left. By reasoning, from the
engine code in `src/camera.ts` and the engine.

**Expected:** The point uses the transform the frame will draw with.

**Who depends on it:** Nobody knowingly; the error is one frame.

**Fixing it:** Compute the focus before the mouse point, or reuse last
frame's zoom with last frame's position. Engine only.

**Pinned by:** `camera.test.ts`, "CAM-18 step 2: the zoom-correct mouse
point" and "CAM-18, CAM-19, CAM-20: one frame of the platform draw
routine".

### CMP-33. The camera centres itself whenever it first finds (0, 0)

**Specified by:** CAM-7, CAM-8; camera.md Open question 4.

**Behavior:** The camera jumps to the canvas centre at the first
activation that finds it exactly at (0, 0) while not yet initialised; a
camera first activated elsewhere stays uninitialised and jumps later if it
is ever moved to (0, 0). By reasoning; unreachable from Sprite Lab, whose
first activation always finds (0, 0).

**Expected:** Centring once, at attachment.

**Who depends on it:** Nobody.

**Fixing it:** Centre at attachment. No impact.

**Pinned by:** `camera.test.ts`, "CAM-8: a camera first activated
elsewhere centres later at (0, 0)".

## Input

### CMP-34. A press held for one pre phase never reports its release

**Specified by:** INP-15, INP-17, INP-24; input.md Open question 1.

**Behavior:** A key or button seen down in one pre phase and up in the
next goes from WENT_DOWN straight to UP; it is never DOWN and never
WENT_UP. The draggable behavior ends a drag only on `mouseWentUp()`, so a
quick click that starts a drag leaves the sprite attached to the pointer
until the next full click. Reproduction: track the left button; press;
frame: `mouseWentDown()` true; release; frame: `mouseWentUp()` false;
frame: false. Confirmed on the fork.

**Expected:** WENT_DOWN followed by up yields WENT_UP.

**Who depends on it:** Students' games with draggable sprites: the sticky
drag is observable and may be relied on. Unsure.

**Fixing it:** Add the WENT_DOWN to WENT_UP transition. Changes drag
behavior in existing games; gate by project version, or fix the draggable
behavior to end on `!mousePressedOver` instead.

**Pinned by:** `input.test.ts`, "INP-17: a key held for one pre phase is
never DOWN or WENT_UP" and "INP-17, open question 1: a one-frame click
never yields mouseWentUp".

### CMP-35. Presses within one frame are lost

**Specified by:** INP-16, INP-17; input.md Open question 2.

**Behavior:** Edge states are sampled once per pre phase from the raw
state. A press and release between two pre phases is never seen; a
release and re-press between two pre phases leaves the key DOWN, so the
second press produces no `keyWentDown`. Reproduction: track `'left'`;
keydown then keyup 37 before a frame: `keyWentDown` and `keyDown` false.
Hold `'right'` to DOWN; keyup then keydown 39 before a frame: `keyDown`
true, `keyWentDown` and `keyWentUp` false. Confirmed on the fork.

**Expected:** Every press between frames yields one `keyWentDown`.

**Who depends on it:** Runtime workaround: Sprite Lab 2's on-screen
buttons hold a synthetic press for 100 ms and two animation frames.
Players at 30 frames per second rarely notice. Sure about the
workaround.

**Fixing it:** Latch presses and releases between frames. The on-screen
button hold then becomes unnecessary; fast players would see more
presses registered. Low risk.

**Pinned by:** `input.test.ts`, "INP-17: a press and release between
frames is not seen", "INP-17: a release and re-press between frames
leaves the key DOWN", "INP-17, INP-24: a click between frames is not
seen".

### CMP-36. A key is tracked only from the first query

**Specified by:** INP-14, INP-17.

**Behavior:** A key or button is not tracked until the program first asks
about it; if it is already down then, it starts as DOWN and that press
never reports `keyWentDown`. Reproduction: keydown 65; two frames; first
query `keyWentDown('a')` false, `keyDown('a')` true; next frame the same.
Confirmed on the fork.

**Expected:** Every key's edges are tracked from attachment.

**Who depends on it:** Games whose "when key pressed" events are created
while a key is held (for example in a later scene); the held press does
not fire. Likely nobody knowingly.

**Fixing it:** Track every code seen in the down set. Low risk.

**Pinned by:** `input.test.ts`, "INP-14, INP-17: a key already down when
first queried is DOWN".

### CMP-37. `mousePressedOver` reacts to any button, from the raw flags

**Specified by:** INP-27, COL-25.

**Behavior:** `mousePressedOver` is true when the raw pressed flag or a
touch is down and the pointer is over the sprite, with no button check and
no frame sampling. Reproduction: pointer over a sprite, `mouseIsPressed`
true, `mouseButton` `'right'`: true. Confirmed on the fork. The "while
clicked" event therefore fires on a right-button press; the draggable
behavior also needs `mouseWentDown()` (left) and is unaffected.

**Expected:** Left button (or touch) only, sampled like the other edge
states.

**Who depends on it:** Likely nobody; right-button use in Sprite Lab is
rare.

**Fixing it:** Check the left button. Low risk.

**Pinned by:** `camera.test.ts`, "CAM-15, INP-27: mousePressedOver uses
the camera point and the raw flags" pins the raw flags; none yet pins the
right button. Add a test that presses button 2 over a sprite and expects
true.

### CMP-38. Sprite Lab 2 carries held keys across reruns

**Specified by:** INP-5, INP-18; input.md Open question 4.

**Behavior:** Sprite Lab 2 reuses one instance, so tracked states and the
down set survive a rerun or scene jump; a key held through it stays DOWN
and the new run's "when pressed" event does not fire for it. Classic
creates a new instance, whose creation empties the down set, so the held
key is up until its next auto-repeat. By reasoning.

**Expected:** The two hosts agree.

**Who depends on it:** Players holding arrows through a scene jump in
Sprite Lab 2. Unsure.

**Fixing it:** Host decision: clear edge state on rerun, or not. No
library change.

**Pinned by:** `input.test.ts`, "INP-18: tracked states and the down set
outlive a rerun".

## Departures from the fork

These are places where the library deliberately differs from the fork.
They are listed so that nobody "fixes" them back.

### CMP-39. Bad arguments throw an `Error`, not a string

**Specified by:** COL-23, GRP-5, GRP-6, WLD-10; rows 22 and G2, G3, W11.

**Behavior:** The fork throws a bare string, for example
`Error: overlap can only be checked between sprites or groups`.
Confirmed on the fork: the thrown value's type is `string`. The library
throws an `Error` whose message is the string without its `Error: `
prefix, so `String(e)` equals the fork's value.

**Expected:** This is the decided behavior.

**Who depends on it:** Runtime error reporting, which converts the thrown
value to a string: unchanged. Code that tests `typeof e === 'string'`
would differ; none is known.

**Fixing it:** Not applicable.

**Pinned by:** `collision.test.ts`, "COL-23: deliberate deviation from the
fork: an Error, not a bare string, after the flags are reset (row 22)"; `group.test.ts`, "GRP-5, G2" and "GRP-6, G3";
`world.test.ts`, "WLD-10, W11".

### CMP-40. A 1x1 costume collides and is hit-tested

**Specified by:** COL-4, COL-27; rows 44, 45.

**Behavior:** The fork treats a sprite whose animation reports 1 by 1 as
still loading: it creates no collider, every collision method returns
false for the pair, and `mouseIsOver` throws a `TypeError`. Confirmed on
the fork: two such sprites at the same point return false both ways, and
`mouseIsOver` throws `TypeError`. The library gives the sprite a 1 by 1
collider like any other.

**Expected:** This is the decided behavior.

**Who depends on it:** Projects with a genuine 1 by 1 costume, which could
never collide before and now can. Rare.

**Fixing it:** Not applicable.

**Pinned by:** `collision.test.ts`, "COL-4, COL-27: deliberate deviation
from the fork: a 1x1 costume collides and is hit-tested (rows 44, 45)".

### Other departures the specification makes

These follow from requirements but were not among the decided departures.
The maintainer should confirm them.

#### CMP-41. Removing a sprite after `clear()` does not hang

**Specified by:** GRP-8; vector G5.

**Behavior:** In the fork, a sprite whose `groups` list still names a
cleared group (CMP-10) can never be removed: removal repeatedly asks the
first group in the list to remove the sprite, the cleared group finds
nothing and does not drop itself from the list, and the loop never ends.
Reproduction: add a to g; `g.clear()`; `a.remove()` (or
`allSprites.removeSprites()`): the page hangs. Confirmed on the fork (the
test process spun at full CPU until killed). GRP-8 says the call returns
normally, and the library's test asserts that.

**Expected:** Removal terminates. This is a departure; reproducing a hang
is not reasonable.

**Who depends on it:** Nobody; any program that reached it froze.

**Fixing it:** Not applicable. GRP-8's text should say the fork hangs
here and that the library deliberately does not.

**Pinned by:** `group.test.ts`, "GRP-8, G5" (removal does not throw).

#### CMP-42. Each instance has its own key down set

**Specified by:** INP-5, INP-7, LIF-1.

**Behavior:** The fork keeps one down set for all p5 instances, and
creating any instance empties it. Reproduction: instance 1 receives
keydown 70; create instance 2; instance 1's `keyDown(70)` is false.
Confirmed on the fork. The library keeps a set per instance.

**Expected:** This is the specified behavior. Sprite Lab runs one instance
at a time, so no program can observe the difference.

**Who depends on it:** Nobody.

**Fixing it:** Not applicable.

**Pinned by:** `input.test.ts`, "INP-5, INP-7: each instance has its own
down set, empty at creation".

### Input departures

These follow from running over upstream p5 2.x without touching p5's
private state. They were decided by the maintainer.

#### CMP-43. Mouse positions are not rounded

**Specified by:** INP-19; the CSS-scaled row of input.md's mouse vectors.

**Behavior:** The fork rounds the pointer position to whole canvas
pixels. The library does not: a canvas shown at 800 by 800 client pixels
with a layout width of 400 gives position (200.5, 399.5) for a press at
client (401, 799), where the fork gives (201, 400). Sprite Lab 2 shows
its canvas through a CSS transform, so fractional positions are common.

**Expected:** This is the decided behavior.

**Who depends on it:** Programs that display the mouse position, which
now show a fraction, and programs that compare a position for equality.
Collisions and hit tests are unaffected in practice.

**Fixing it:** Not applicable. Rounding at the point of display, if
wanted, belongs to the runtime.

**Pinned by:** `input.test.ts`, "INP-19: positions are canvas pixels,
not rounded".

#### CMP-44. A window blur releases the mouse button

**Specified by:** INP-20; the blur row of input.md's mouse vectors.

**Behavior:** The fork keeps the pressed flag when the window loses
focus; only a `mouseup` clears it. The library clears it on `blur`, as
upstream p5 does. A button held while the student switches windows reads
as released, and a tracked button goes WENT_UP at the next pre phase.

**Expected:** This is the decided behavior.

**Who depends on it:** Nobody knowingly. A drag in progress when focus
leaves the page now ends instead of staying attached to the pointer.

**Fixing it:** Not applicable.

**Pinned by:** `input.test.ts`, "INP-20: a window blur clears the
pressed flag".

#### CMP-45. Hosts press keys through `pressKey` and `releaseKey`

**Specified by:** INP-6; the `pressKey` row of input.md's test vectors.

**Behavior:** The fork's mobile controls pressed keys by calling p5's
private key handlers with an object carrying `which`. The library does
not touch p5's handlers. A host that presses keys without a DOM event
calls the instance's `pressKey(code)` and `releaseKey(code)`, which
change the down set as `keydown` and `keyup` would. Sprite Lab 2's
on-screen buttons dispatch real keyboard events and need neither.

**Expected:** This is the decided behavior.

**Who depends on it:** Classic Sprite Lab's mobile controls, if they are
ever ported; they must call these functions.

**Fixing it:** Not applicable.

**Pinned by:** `input.test.ts`, "INP-6: pressKey and releaseKey change
the down set".

#### CMP-46. The pointer state is the library's, not p5's

**Specified by:** INP-29, INP-19..INP-22, INP-27, WLD-3, COL-24, COL-25,
CAM-4, CAM-9.

**Behavior:** The fork keeps the pointer position, pressed flag, button
and touch flag in the p5 instance's own `mouseX`, `mouseY`,
`mouseIsPressed`, `mouseButton` and `touchIsDown` fields. The library
keeps them in its own state and neither reads nor writes those fields.
Upstream p5 2.x fills them itself: it counts presses and moves anywhere
on the page and ignores CSS transforms. So the library's
`World.mouseX`, edge states, `mouseIsOver`, `mousePressedOver` and camera
mouse point follow INP-19..INP-21, while p5's fields may differ.

**Expected:** This is the decided behavior.

**Who depends on it:** Any code that reads p5's own fields expecting the
fork's values. In Sprite Lab the runtime reads the pointer through
`World.mouseX` and `World.mouseY`; the one direct read of p5's `mouseX`
is in the engine, whose port must use `World.mouseX`. The Sprite Lab
block pool reads none of these fields.

**Fixing it:** Not applicable.

**Pinned by:** `input.test.ts`, "INP-29: the pointer state is the
library's; p5's fields are neither read nor written".

## Summary

| Id     | Behavior kept                                                 | Risk to existing projects if fixed |
| ------ | ------------------------------------------------------------- | ---------------------------------- |
| CMP-1  | Sprite after an expiring sprite skips its update              | low                                |
| CMP-2  | Classic preview leaves the camera on                          | low                                |
| CMP-3  | `World.seconds` counts from attachment, ignores pauses        | low                                |
| CMP-4  | `rgb` alpha 0 is opaque                                       | low                                |
| CMP-5  | Costume change on a scaled sprite scales the reported size    | high                               |
| CMP-6  | Engine size correction only for multi-frame costumes          | high                               |
| CMP-7  | Fractional lifetime never expires                             | low                                |
| CMP-8  | NaN depth makes every new depth NaN                           | low                                |
| CMP-9  | Burst and pop use degrees as radians (runtime)                | medium                             |
| CMP-10 | `clear()` leaves stale back-references                        | low                                |
| CMP-11 | Empty group `minDepth()` is 99999                             | low                                |
| CMP-12 | `edges` survives `removeSprites()` as an empty group          | low                                |
| CMP-13 | Swept check rewinds sprites, even on `overlap`                | high                               |
| CMP-14 | Swept check uses unscaled size; small fast sprites tunnel     | medium                             |
| CMP-15 | Swept box is a point at the origin before first moving update | low                                |
| CMP-16 | `mouseIsOver` uses the last update's collider                 | medium                             |
| CMP-17 | `displace` does not update the pushed sprite                  | low                                |
| CMP-18 | Immovable `collide` leaves the other sprite overlapping       | low                                |
| CMP-19 | Flush contact is not touching                                 | high                               |
| CMP-20 | Coincident centres separate toward −x                         | medium                             |
| CMP-21 | Group methods bound to their group (`groupSpritesTouched`)    | high                               |
| CMP-22 | Live-length iteration skips after a removal                   | low                                |
| CMP-23 | Tint darkens and raises partial alpha                         | high                               |
| CMP-24 | Frame clock not reset by `stop`/`play`/delay                  | low                                |
| CMP-25 | Frame delay 0, negative and fractional accepted               | low                                |
| CMP-26 | `changeFrame` accepts negative and fractional indices         | low                                |
| CMP-27 | Grid sheets wrap and overrun the image                        | low                                |
| CMP-28 | Cloned sheet loses frame names                                | low                                |
| CMP-29 | Classic shows a multi-frame image as one still                | medium                             |
| CMP-30 | `camera.mouseX` ignores zoom                                  | low                                |
| CMP-31 | Dragging in zoomed scenes follows the canvas point            | medium                             |
| CMP-32 | Sprite Lab 2 mouse point uses last frame's camera position    | low                                |
| CMP-33 | Camera centres whenever it first finds (0, 0)                 | low                                |
| CMP-34 | One-pre-phase press never reports release; sticky drag        | medium                             |
| CMP-35 | Presses within one frame are lost                             | low                                |
| CMP-36 | Keys tracked only from first query                            | low                                |
| CMP-37 | `mousePressedOver` reacts to any button                       | low                                |
| CMP-38 | Sprite Lab 2 carries held keys across reruns                  | low                                |
| CMP-39 | Departure: bad arguments throw `Error`, not a string          | n/a                                |
| CMP-40 | Departure: 1x1 costume collides and is hit-tested             | n/a                                |
| CMP-41 | Departure: removal after `clear()` does not hang              | n/a                                |
| CMP-42 | Departure: per-instance key down set                          | n/a                                |
| CMP-43 | Departure: mouse positions not rounded                        | n/a                                |
| CMP-44 | Departure: window blur releases the mouse button              | n/a                                |
| CMP-45 | Departure: hosts press keys through `pressKey`/`releaseKey`   | n/a                                |
| CMP-46 | Departure: the pointer state is the library's, not p5's       | n/a                                |
