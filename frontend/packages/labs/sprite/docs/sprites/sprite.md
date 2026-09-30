# Sprites

A sprite is an object with a position, a velocity, a rotation, a scale, a
size, an optional animation and a draw order. The library creates it,
moves it once per frame by its velocity, counts down its lifetime, and
draws it. The runtime also stores its own fields on it (an id, a name, a
group label, a speed and direction of its own, and so on); the library
must let it, and must not give those names meaning.

This document covers creation and defaults, each property the runtime
reads or writes, the per-frame update step, and how a sprite is drawn.
Collisions and colliders are COL-, animations ANI-, the camera CAM-, the
mouse and keys INP-, the frame order LIF-. "Natural size" and "stretch"
(SPR-20) are this document's terms for the fork's sizing state, which has
no public name.

## Creation

SPR-1. `createSprite(x, y, w, h)` creates a sprite, sets its depth
(SPR-4), adds it to `allSprites` (GRP-10), and returns it. It is the only
way the runtime creates sprites.

SPR-2. The position is (x, y). An omitted or undefined coordinate is 0.
The previous position (SPR-41) starts equal to the position.

SPR-3. The natural width is w if w is not undefined, else 100; the
natural height is h if h is not undefined, else 100. The runtime calls
`createSprite(x, y)`, so its sprites start 100 by 100; the edge sprites
pass all four arguments (WLD-16).

SPR-4. The depth of a new sprite is one more than the largest depth among
the sprites in `allSprites` at the moment of creation, or 1 if
`allSprites` is empty. Removed sprites are not in `allSprites` and do not
count.

Example: create A, B, C (depths 1, 2, 3); remove B; create D: D's depth
is 4. Remove everything; the next sprite's depth is 1. (Run on the fork.)

If any member's depth is NaN the new depth is NaN. (Run on the fork.)

## Initial state

SPR-5. A new sprite has these values:

| Property                                                     | Initial value                             |
| ------------------------------------------------------------ | ----------------------------------------- |
| `position`                                                   | (x, y) per SPR-2                          |
| `velocity`                                                   | (0, 0)                                    |
| `rotation`                                                   | 0                                         |
| `scale`                                                      | 1                                         |
| `width`, `height`                                            | natural size per SPR-3 (no animation yet) |
| `depth`                                                      | per SPR-4                                 |
| `visible`                                                    | true                                      |
| `lifetime` (alias `life`)                                    | −1                                        |
| `removed`                                                    | false                                     |
| `debug`                                                      | false                                     |
| `tint`                                                       | undefined                                 |
| `mirrorX()`, `mirrorY()`                                     | 1, 1                                      |
| `animation`                                                  | undefined                                 |
| `getAnimationLabel()`                                        | `''` (empty string)                       |
| `groups`                                                     | [`allSprites`]                            |
| `collider`                                                   | undefined (COL-)                          |
| `touching`                                                   | left, right, top, bottom all false (COL-) |
| `mass`, `restitution` (alias `bounciness`), `immovable`      | 1, 1, false (COL-)                        |
| `friction`, `maxSpeed`, `rotationSpeed`, `rotateToDirection` | 0, −1, 0, false                           |
| stretch (SPR-20)                                             | 1 horizontally and vertically             |

The placeholder color is opaque grey (127, 127, 127) (SPR-55).

SPR-6. A sprite has no own property named `id`, `name`, `group`, `speed`,
`direction`, `delay`, `dragging`, `baseScale`, `getScale`, `setScale`,
`glideTargets`, `targetSet`, `initialAngle`, `xOffset`, `yOffset`,
`startFacing` or `characterState` until the runtime assigns one
(`'group' in sprite` is false on a new sprite). See SPR-35.

SPR-7. A sprite is an ordinary extensible object. Assigning any property
not given meaning in this document stores the value and has no effect on
the library. The runtime stores the fields in SPR-35 this way, and
student programs store more through `setProp` (`energy`, `sick`,
`mask`, `recovery`, `isManipulative`, `patrollingDirection`, and others).

## Position and velocity

SPR-8. `position` is a `p5.Vector` the sprite owns for its whole life. The
library and the runtime change it in place; it is never replaced by
another object. The runtime calls `position.dist(other)` on it.

SPR-9. `x` and `y` are read-write aliases of `position.x` and
`position.y`.

SPR-10. `velocity` is a `p5.Vector` the sprite owns for its whole life,
changed in place. `velocityX` and `velocityY` are read-write aliases of
`velocity.x` and `velocity.y`. Velocity is in pixels per frame; SPR-43
adds it to the position once per frame. The runtime writes `velocity.y`
(platform physics, `setProp(…, 'velocityY', …)`) and reads `velocity.x`
and `velocity.y`.

## Rotation, speed and direction

SPR-11. `rotation` is a number in degrees, clockwise on screen (the y axis
points down). It is stored as given, with no wrapping. It affects drawing
(SPR-52) and the collider (COL-). While `rotateToDirection` is false,
which it always is in Sprite Lab, assigning `rotation` has no other
effect.

SPR-12. `speed` and `direction` are the runtime's fields, not the
library's (SPR-35). The library never reads them and they do not move the
sprite. Motion in Sprite Lab comes from the runtime changing `x` and `y`
directly in behaviors, and from `velocity` (SPR-43).

SPR-13. `getSpeed()` is the length of `velocity`. `getDirection()` is the
angle of `velocity` in degrees, atan2(velocity.y, velocity.x), in
[−180, 180], and 0 when the velocity is (0, 0). The runtime does not call
them; COL- may.

Example: velocity (0, −5): `getSpeed()` 5, `getDirection()` −90. (Run on
the fork.)

## Mirroring

SPR-14. `mirrorX(d)`: if d is 1 or −1, the horizontal mirror becomes d and
the call returns undefined. Otherwise, including when d is omitted, 0 or
2, the mirror is unchanged and the call returns its current value (1 or
−1). `mirrorY(d)` is the same for the vertical mirror. Both start at 1.

SPR-15. Mirroring affects only drawing (SPR-52). It does not change
`width`, `height`, `scale`, or the collider.

## Depth, visibility, debug

SPR-16. `depth` is a number, freely assignable, possibly fractional. It
orders drawing (WLD-11) and therefore the next frame's update order
(LIF-12). The runtime reads it to find the top sprite under the mouse
(`draggableFunc`).

SPR-17. `visible` false stops the sprite from being drawn (SPR-50). An
invisible sprite is still updated, still collides, and still counts for
depth.

SPR-18. `debug` true adds the overlay of SPR-57 when the sprite is drawn.
The runtime sets it through `setProp(…, 'debug', true)` in validation
helpers.

## Size and scale

SPR-20. Each sprite has a natural width Wn and natural height Hn, and a
horizontal stretch Sx and vertical stretch Sy, both initially 1. With
`s` = `scale`:

- Without an animation, `width` is Wn and `height` is Hn.
- With an animation, `width` is Wn × Sx and `height` is Hn × Sy.

SPR-21. Assigning `width = v`:

- without an animation, sets Wn to v;
- with an animation, sets Sx to v / Wn (Wn unchanged).

`height` likewise with Hn and Sy.

SPR-22. `getScaledWidth()` is `width` × `scale`; `getScaledHeight()` is
`height` × `scale`. The runtime places speech bubbles at
y − round(`getScaledHeight()` / 2).

SPR-23. `scale` is a plain number, default 1, freely assignable, possibly
0 or negative. It multiplies the drawn size (SPR-52) and the collider
(COL-). It does not change `width` or `height`.

SPR-24. When an animation is attached (SPR-30), the natural size becomes
the size of the new animation's first frame times the absolute value of
the current effective scale:

    Wn := frameWidth  × |scale × Sx|
    Hn := frameHeight × |scale × Sy|

Sx and Sy are not reset. The frame size is the frame's source size where
a sheet records one (ANI-).

Example: a new sprite (scale 1) given a 200 × 100 image: `width` 200,
`height` 100. A sprite with scale 3 given a 50 × 80 image: `width` 150,
`height` 240. (Run on the fork.)

SPR-25. Nothing else changes Wn or Hn once an animation is attached. In
particular an animation advancing to a frame of a different size does
not.

SPR-26. The host may set Wn and Hn directly. `SpriteLab2Engine`
(`unscaleSheetSpriteSizes_`) does so every frame, before the draw
program, for each sprite whose animation has more than one frame,
setting them to that animation's current frame size. An implementation
shall provide this as a public operation (for example
`setNaturalSize(w, h)`); the engine port will call it.

SPR-27. Readers of `width` and `height` in the runtime treat them as the
unscaled size: `createSpriteCollider` in apps `utils.js` (used by
`isDirectlyAbove`), `platformPhysics.ts`, and `setProp(…, 'width' |
'height', …)`. SPR-24 makes that false after a costume change on a
scaled sprite; SPR-26 undoes it for multi-frame costumes only. Reproduce
SPR-24 as stated (see Open questions).

## Code.org scale: baseScale, setScale, getScale

The runtime (`CoreLibrary.addSprite` and the `setAnimation` command)
installs these on each sprite it creates. They are specified here because
the runtime's sprites always carry them and the contract lists them.

SPR-28. `baseScale` is a number. The runtime sets it to 1 when creating a
sprite, and then to a costume-dependent value (SPR-29).
`setScale(k)` sets `scale` to k × `baseScale`. `getScale()` returns
`scale` / `baseScale`. The runtime assigns `setScale` and `getScale` as
own properties of each sprite; if the library also provides them, it
shall compute the same values and must not prevent the assignment.

SPR-29. Costume normalization, done by the runtime, not the library:

- On creation with a costume: `setAnimation(name)`; then `scale` :=
  `scale` / `baseScale`; `baseScale` := 100 / max(m, frameHeight,
  frameWidth), where m is the creation option `minimumScale` or 100;
  `scale` := `scale` × `baseScale`. Then `setScale(size / 100)`, where
  size is the creation option `scale` or the runtime's default sprite
  size (100 unless `setDefaultSpriteSize` or the engine changed it).
- On a costume change (`setAnimation` command): the same, with m fixed at
  100 and no final `setScale`.

Example: creation with a 200 × 100 costume and default size 100:
`baseScale` 0.5, `scale` 0.5, `getScale()` 1, `width` 200, `height` 100,
`getScaledHeight()` 50. Then `setScale(0.5)`: `scale` 0.25. Then a costume
change to a 50 × 80 image: `baseScale` 1, `scale` 0.5, `getScale()` 0.5,
`width` 12.5, `height` 20, `getScaledHeight()` 10. (Run on the fork. The
12.5 and 20 come from SPR-24 applied at scale 0.25.)

## Animation attachment

Playback, frames, sheets and cloning are ANI-. This section fixes only
what the sprite does.

SPR-30. `setAnimation(name)`:

1. If `name` equals `getAnimationLabel()`, does nothing.
2. Looks `name` up in the instance's predefined-animation table (LIF-2).
   If the table is absent or has no entry, throws an `Error` whose message
   is `Unable to find an animation named "NAME".  Please make sure the
animation exists.` (two spaces after the first period), NAME replaced.
3. Makes a new animation for the sprite from the entry: from an image, a
   one-frame animation; from an animation, a clone (ANI-). The sprite
   keeps it under the label `name`, replacing any animation previously
   kept under that label, so returning to an earlier costume starts a
   fresh animation.
4. Applies SPR-24.
5. Makes it the current animation: `animation` is it and
   `getAnimationLabel()` returns `name`.
6. If the paused-by-default flag (LIF-2) is set, stops its playback
   (ANI-).

SPR-31. `animation` is the current animation object or undefined. The
runtime calls `getWidth()`, `getHeight()`, `stop()`, `changeFrame(i)` and
reads `images.length` on it (ANI-).

SPR-32. `getAnimationLabel()` is the current label, `''` before any
animation. The runtime uses it as the sprite's costume name.

## Code.org fields

SPR-35. The runtime stores these on sprites as plain properties. The
library gives them no meaning; they are listed so that an implementation
does not collide with them.

| Field                            | Written by                         | Meaning to the runtime                                                             |
| -------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `id`                             | `addSprite`                        | integer, key into the runtime's sprite map, from 0                                 |
| `name`                           | `addSprite`                        | string or undefined; unique among live sprites                                     |
| `group`                          | `addSprite`, `setPlatformPlayer`   | string label (`'effects'`, `'walls'`, `'players'`, …), unrelated to Group (GRP-15) |
| `speed`                          | `addSprite` (default 5), behaviors | number, pixels per step in runtime motion                                          |
| `direction`                      | `addSprite` (default 0), commands  | number, degrees                                                                    |
| `delay`                          | `addSprite`, effect behaviors      | number of frames                                                                   |
| `initialAngle`                   | `addSprite`                        | spiral effect start angle                                                          |
| `dragging`, `xOffset`, `yOffset` | `draggableFunc`                    | drag state                                                                         |
| `glideTargets`                   | `glideTo`                          | array of {x, y}                                                                    |
| `targetSet`                      | `addTarget`                        | {follow: [], avoid: []} of costume names                                           |
| `startFacing`, `characterState`  | `SpriteLab2Engine`                 | character-set pose state                                                           |
| a one-frame body mark            | `SpriteLab2Engine`                 | platform physics mark                                                              |

`addSprite` also assigns `rotation` (option or 0) and `lifetime` (option
or −1), which are the library's (SPR-11, SPR-46).

## Removal

SPR-36. `remove()` sets `removed` to true and removes the sprite from
every group that contains it (GRP-7), `allSprites` included, taking the
groups in the order the sprite joined them. `destroy` is the same
function as `remove` (`sprite.destroy === sprite.remove`). Removing a
removed sprite again has no further effect.

SPR-37. A removed sprite is not updated (SPR-40) and not drawn (SPR-50).
Its properties stay readable and writable. It never returns to
`allSprites` by itself.

SPR-38. A sprite taken out of `allSprites` by `allSprites.remove(sprite)`
(GRP-6) is neither removed nor updated nor drawn by `drawSprites()`; its
`removed` stays false. (Run on the fork.) The runtime never does this.

## The update step

LIF-11 runs this step for each sprite in `allSprites`, once per frame,
before the draw program.

SPR-40. If `removed` is true, the step does nothing.

SPR-41. The previous position becomes the position this sprite had at
the end of its last update, or its creation position if it has never
been updated. A direct assignment to `position` between updates does not
change the previous position. After SPR-43, `deltaX` and `deltaY` are the
position minus the previous position.

Example: velocity (1, 0) from x 50: after one update x is 51. The
program then sets x to 70. After the next update x is 71, the previous
position's x is 51, and `deltaX` is 20. (Run on the fork.)

SPR-42. `friction`, `maxSpeed`, `rotateToDirection` and `rotationSpeed`
are not reached in Sprite Lab and are at their inert defaults (SPR-5); in
the fork they act here, between SPR-41 and SPR-43. See Not specified.

SPR-43. The position gains the velocity: x += velocity.x, y +=
velocity.y.

SPR-44. If the sprite has an animation, the animation advances one tick
(ANI-).

SPR-45. If the sprite has a collider, the collider is brought up to date
with the sprite's position, rotation, scale and size (COL-). The
collider's swept companion is refreshed at the start of the step, before
SPR-41, when the velocity is not zero (COL-).

SPR-46. Lifetime. If `lifetime` > 0 it decreases by 1. Then, if
`lifetime` is exactly 0, the sprite is removed (SPR-36), within the
step. Consequences:

- Lifetime n, a positive integer: the sprite is removed during the n-th
  update after it is set, and is not drawn in that frame.
- Lifetime 0 set by the program: removed during the next update.
- Negative lifetime, the default −1: never removed.
- A positive non-integer never reaches exactly 0 and is never removed;
  2.5 becomes 1.5, 0.5, −0.5 and then stays −0.5.

The runtime's effect behaviors run after the update and test `lifetime
=== 0` to delete the sprite from the runtime's own map; the library has
already removed it by then.

SPR-47. The step has no other effect in Sprite Lab. Invisibility does not
skip it. The fork's per-sprite mouse callbacks are never set in Sprite
Lab and are not specified.

## Drawing

The sprite draws itself in whatever transform is current, which in
Sprite Lab includes the camera (LIF-14, CAM-). `drawSprites` (WLD-9)
draws each member this way.

SPR-50. A sprite draws only if `visible` is true and `removed` is false;
otherwise drawing it has no effect at all, the debug overlay included.

SPR-51. Drawing leaves no p5 state changed: the body is drawn between a
push and a pop. Inside it, before the transform, color mode is RGB, stroke
is off, and rectangle, ellipse and image modes are CENTER.

SPR-52. The body's transform is applied in this order: translate to
(x, y); rotate by `rotation` degrees; scale by

    (scale × Sx × mirrorX(), scale × Sy × mirrorY())

where Sx, Sy are the stretches of SPR-20. Mirroring therefore flips the
sprite about its own rotated axes, after rotation.

Example: position (10, 20), rotation 30, scale 2, mirrorX −1, no
animation: translate(10, 20), rotate(30), scale(−2, 2). Position (50,
60), scale 0.5, mirrorY −1, with an animation: translate(50, 60),
rotate(0), scale(0.5, −0.5). The same sprite after `width` is set to twice
its frame width: scale(1, −0.5). (Run on the fork.)

SPR-53. With an animation, the body is the animation's current frame
drawn with its center at the local origin, at the frame's own pixel size,
with no further rotation (ANI- for frame choice and sheet trim offsets).
So on screen the frame measures frameWidth × |scale × Sx| by
frameHeight × |scale × Sy|.

SPR-54. With an animation and a truthy `tint`, the frame is drawn with
p5's image tint set to `tint`, inside its own push and pop.

SPR-55. Without an animation, the body is a rectangle centered on the
local origin, Wn wide and Hn high, with no stroke, filled with opaque
grey (127, 127, 127).

SPR-56. Without an animation and with a truthy `tint`, the rectangle's
fill is the linear interpolation, at one half, from the grey to
`color(tint)`, as p5's `lerpColor` computes it.

Example: tint `'#ff0000'`: fill (191, 64, 64, 255). (Run on the fork.)

SPR-57. If `debug` is true, after the body's pop, in the untransformed
(camera-only) space, and inside its own push and pop:

1. a green (0, 255, 0) line, weight 1, from (x − 10, y) to (x + 10, y),
   and another from (x, y − 10) to (x, y + 10);
2. the depth as text, `String(depth)`, green fill, no stroke, size 16,
   aligned left and bottom, at (x + 4, y − 2);
3. if the sprite has no collider, the default collider is created
   (COL-), and then the collider's outline is drawn in green, no fill
   (COL-).

Example: sprite at (10, 20), depth 3.5, rotation 90: lines (0, 20)–(20, 20) and (10, 10)–(10, 30); text `3.5` at (14, 18). (Run on the fork.)

SPR-58. `tint` holds whatever the program assigned: a CSS color string
from the tint block (`'#rrggbb'`), or null after "remove tint". Falsy
means no tint. The library passes it to p5 unchanged.

## Apps' sprite wrapper

SPR-59. `P5SpriteWrapper.createSprite` is not installed in Sprite Lab:
`P5Wrapper.init` installs it only when not running Sprite Lab, and both
`SpriteLab` and `SpriteLab2Engine` run with Sprite Lab set. Its depth and
`allSprites` handling equals SPR-1 and SPR-4. Its other changes (a
debug-on-create switch, interpreter-stateful collision methods, and
changed `collide` and `bounceOff` semantics) are Game Lab's and are not
part of this library; COL- decides whether any collision change applies.

## Test vectors

| #   | Setup                                                                                                      | Expected                                                                                                                                                                                                                                                  | Source      |
| --- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| S1  | `createSprite()`                                                                                           | x 0, y 0, width 100, height 100, depth 1, scale 1, rotation 0, visible true, velocity (0, 0), lifetime −1, removed false, mirrorX() 1, mirrorY() 1, tint undefined, getScaledHeight() 100, groups.length 1, label `''`, debug false, `'group' in s` false | run on fork |
| S2  | then `createSprite(10, 20, 30, 40)`                                                                        | x 10, y 20, width 30, height 40, depth 2, getScaledHeight() 40                                                                                                                                                                                            | run on fork |
| S3  | then `createSprite(1, 2)`                                                                                  | width 100, height 100, depth 3; `allSprites.length` 3                                                                                                                                                                                                     | run on fork |
| S4  | S1 sprite: `mirrorX(-1)`, `mirrorX()`, `mirrorX(2)`, `mirrorX()`, `mirrorX(0)`, `mirrorY(-1)`, `mirrorY()` | undefined, −1, −1, −1, −1, undefined, −1                                                                                                                                                                                                                  | run on fork |
| S5  | depths 1, 2, 3; remove the second; create one                                                              | new depth 4; maxDepth 4, minDepth 1                                                                                                                                                                                                                       | run on fork |
| S6  | (100, 100), velocity (3, 4); 3 frames                                                                      | (103, 104), (106, 108), (109, 112); after frame 3 deltaX 3, deltaY 4, previous position (106, 108)                                                                                                                                                        | run on fork |
| S7  | velocity (1, 0) at x 50; frame; set x 70; frame                                                            | x 71, previous x 51, deltaX 20                                                                                                                                                                                                                            | run on fork |
| S8  | lifetime 3; 4 frames, reading (lifetime, removed, in allSprites)                                           | (2, F, T), (1, F, T), (0, T, F), (0, T, F)                                                                                                                                                                                                                | run on fork |
| S9  | lifetime 0; 1 frame                                                                                        | lifetime 0, removed true                                                                                                                                                                                                                                  | run on fork |
| S10 | lifetime 2.5; 4 frames                                                                                     | 1.5, 0.5, −0.5, −0.5; never removed                                                                                                                                                                                                                       | run on fork |
| S11 | removed sprite with velocity (1, 0); 1 frame                                                               | x unchanged                                                                                                                                                                                                                                               | run on fork |
| S12 | invisible sprite, velocity (2, 0); 1 frame                                                                 | x 2                                                                                                                                                                                                                                                       | run on fork |
| S13 | `allSprites.remove(s)` on a sprite with velocity (1, 0) at x 5; 1 frame                                    | x 5, removed false, groups.length 0                                                                                                                                                                                                                       | run on fork |
| S14 | velocity (0, −5)                                                                                           | getSpeed() 5, getDirection() −90; zero velocity getDirection() 0                                                                                                                                                                                          | run on fork |
| S15 | 40 × 20 image costume, scale 0.5, mirrorY −1, at (50, 60); draw                                            | push; RGB; noStroke; CENTER modes; translate(50, 60); rotate(0); scale(0.5, −0.5); image at (0, 0) 40 × 20; pop                                                                                                                                           | run on fork |
| S16 | S15 with `tint = 'blue'`                                                                                   | as S15 with push, tint('blue') before the image and pop after it                                                                                                                                                                                          | run on fork |
| S17 | S15 then `width = 80`                                                                                      | width 80, height 20, getScaledWidth() 40; draw scale(1, −0.5)                                                                                                                                                                                             | run on fork |
| S18 | no costume, (10, 20), rotation 30, scale 2, mirrorX −1; draw                                               | translate(10, 20); rotate(30); scale(−2, 2); fill (127, 127, 127, 255); rect(0, 0, 100, 100)                                                                                                                                                              | run on fork |
| S19 | S18 with tint `'#ff0000'`                                                                                  | fill (191, 64, 64, 255)                                                                                                                                                                                                                                   | run on fork |
| S20 | invisible sprite; draw                                                                                     | no p5 calls                                                                                                                                                                                                                                               | run on fork |
| S21 | 50 × 80 costume at scale 1; scale := 0.5; width := 100                                                     | width 100, height 80, getScaledWidth() 50                                                                                                                                                                                                                 | run on fork |
| S22 | S21 then `setAnimation` of a 200 × 100 image                                                               | width 400, height 50, getScaledWidth() 200, getScaledHeight() 25; draw scale(1, 0.5)                                                                                                                                                                      | run on fork |
| S23 | scale 3, then `setAnimation` of a 50 × 80 image                                                            | width 150, height 240                                                                                                                                                                                                                                     | run on fork |
| S24 | `setAnimation('nope')` with no such entry                                                                  | throws Error, message `Unable to find an animation named "nope".  Please make sure the animation exists.`                                                                                                                                                 | run on fork |
| S25 | runtime `addSprite({animation: 'big', location: {x: 30, y: 40}})`, big 200 × 100                           | x 30, y 40, id 0, speed 5, direction 0, rotation 0, lifetime −1, baseScale 0.5, scale 0.5, width 200, height 100, getScale() 1, getScaledHeight() 50, depth 1, group undefined, name undefined                                                            | run on fork |
| S26 | S25; `setScale(0.5)`; costume change to 50 × 80                                                            | scale 0.25 then: baseScale 1, scale 0.5, width 12.5, height 20, getScale() 0.5, getScaledHeight() 10                                                                                                                                                      | run on fork |
| S27 | S26; `setProp` width 100                                                                                   | width 50, height 20 (stretch 4; drawn 100 px wide)                                                                                                                                                                                                        | run on fork |
| S28 | S27; costume change to the same costume                                                                    | no change: width 50, scale 0.5                                                                                                                                                                                                                            | run on fork |
| S29 | runtime `addSprite({animation: 'tiny'})`, 20 × 20                                                          | x 200, y 200, baseScale 1, scale 1, width 20                                                                                                                                                                                                              | run on fork |
| S30 | runtime `addSprite({})`                                                                                    | baseScale 1, scale 1, width 100, label `''`                                                                                                                                                                                                               | run on fork |
| S31 | runtime `changePropBy` scale −300 on S30                                                                   | scale 0 (the command clamps)                                                                                                                                                                                                                              | run on fork |
| S32 | runtime sprite, lifetime 2; 2 frames                                                                       | lifetime 0, removed true, still in the runtime's map                                                                                                                                                                                                      | run on fork |
| S33 | debug sprite at (10, 20), depth 3.5, rotation 90; draw                                                     | after the body's pop: lines (0, 20)–(20, 20), (10, 10)–(10, 30); text `3.5` at (14, 18); a collider now exists                                                                                                                                            | run on fork |

## Not specified

- `friction`, `maxSpeed`, `rotationSpeed`, `rotateToDirection`, and the
  rotation setter's velocity re-aiming; none is set in Sprite Lab. For
  reference only, and not required: the fork damps velocity by
  (1 − friction), then clamps its length to `maxSpeed`, then turns
  `rotation` toward the velocity, then adds `rotationSpeed`, all between
  SPR-41 and SPR-43.
- `setSpeed`, `setSpeedAndDirection`, `addSpeed`, `setVelocity`,
  `limitSpeed`, `pointTo`, `attractionPoint`.
- `alpha` and its drawing path; `shapeColor` as a writable property
  (the placeholder is always grey in Sprite Lab).
- `addImage`, `addAnimation`, `changeAnimation`, `changeImage`, and the
  frame helpers `setFrame`, `nextFrame`, `previousFrame`, `pause`,
  `play`, `frameDidChange`, `frameDelay` (ANI- for what Sprite Lab uses).
- `mouseActive`, `mouseIsOver` and `mouseIsPressed` as sprite
  properties, and the `onMouseOver`, `onMouseOut`, `onMousePressed`,
  `onMouseReleased` callbacks.
- `overlapPixel`, `overlapPoint`, `setCollider` arguments (COL- for what
  is used), `getBroadPhaseCollider`-style internals.
- `originalWidth`, `originalHeight`, `isTagged`.
- `display`'s argument: `P5Wrapper.drawDebugSpriteColliders` passes
  true, which the fork ignores.

## Open questions

1. SPR-24 is a fork bug that students' projects already carry: after a
   costume change on a scaled sprite, `width`, `height` and
   `getScaledHeight()` are multiplied by the old scale, and a later
   `setProp` width or height sets the stretch from that wrong base
   (S26, S27: "width 100%" draws the costume at four times its intended
   width). Visible consequences: speech bubbles sit at the wrong height;
   `isDirectlyAbove` measures the wrong box; `setProp` width and height
   misbehave after a costume change. Colliders are not affected (they
   take their size from the animation, COL-). Recommendation: reproduce
   it, since saved projects play with it.
2. `SpriteLab2Engine.unscaleSheetSpriteSizes_` says frame changes on a
   multi-frame sheet re-sync the size pre-scaled. In the fixed-frame-size
   mode the host always uses (LIF-3), frame changes do not touch the size
   (SPR-25); the pre-scaled size it corrects comes from SPR-24 at costume
   time. The correction is still needed, but the comment's cause is
   wrong and single-frame costumes are not corrected.
3. SPR-46: a non-integer lifetime never expires. Sprite Lab sets only
   integer lifetimes, so this is unreachable from blocks, but `setProp`
   on `lifetime` with a fraction would reach it.
4. The runtime's `burstFunc` and `popFunc` pass `direction`, which is in
   degrees, to `Math.sin` and `Math.cos`, which take radians. This is a
   runtime bug, not the library's; effects play as they do because of
   it. Recorded here so the runtime port keeps it.
