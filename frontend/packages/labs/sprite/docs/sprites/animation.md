# Animations and sprite sheets

An animation is an ordered list of frames, a current frame index, and a
small amount of playback state. A sprite owns a set of labelled
animations and shows one of them at a time. Sprite Lab never loads frame
files itself: the engine decodes a project's images, turns each into
either a still image or a sprite-sheet animation, and installs them in a
table of predefined animations keyed by image name. Blocks then name an
image, and the sprite takes a private copy of that table entry.

This document covers the `Animation` and `SpriteSheet` objects, the
per-sprite animation set (`addAnimation`, `changeAnimation`,
`setAnimation`, `getAnimationLabel`), when frames advance within the
frame lifecycle, and how a frame is drawn. Sprite size and the sprite
transform are in `sprite.md` (SPR-); the order of the pre, draw and post
phases is in `overview.md` (LIF-).

Terms. _Frame size_ is the width and height of one frame in pixels. The
_update count_ of an animation is the number of times its per-frame
update has run since the animation object was created. A _still_ is a
plain p5 image used where an animation is expected.

## Sprite sheets

ANI-1. `p5.SpriteSheet` is a constructor bound to the p5 instance
(`new p5inst.SpriteSheet(...)`); `p5inst.loadSpriteSheet(...)` constructs
one with the same arguments. Two forms are reached:

- grid form: `(image, frameWidth, frameHeight, frameCount)`, where
  `image` is an already-loaded p5 image and the other three are numbers;
- list form: `(image, frames)`, where `frames` is an array of frame
  records `{name, frame: {x, y, width, height}}`.

ANI-2. A sheet exposes `image` (the source image), `frames` (the frame
records, in order), `frame_width`, `frame_height` and `num_frames`. In
the list form `num_frames` is the length of `frames`, and `frame_width`
and `frame_height` are 0. In the grid form they are the three numeric
arguments.

ANI-3. The grid form generates `frameCount` frame records immediately.
Record _i_ has `name` _i_ and a rectangle of `frameWidth` by
`frameHeight`. Rectangles are laid out row-major, left to right and top
to bottom, starting at (0, 0). After a rectangle is placed at column
offset _x_, the next is at _x_ + `frameWidth`; if that offset is at or
beyond the image width, the next rectangle starts a new row at _x_ = 0,
_y_ + `frameHeight`; if that row offset is at or beyond the image height,
it wraps to _y_ = 0. Frame counts that exceed the grid therefore repeat
the sheet from its top-left frame.

Example: a 250 by 200 image, 100 by 100 frames, 7 frames gives origins
(0,0) (100,0) (200,0) (0,100) (100,100) (200,100) (0,0). The third
rectangle in each row extends 50 pixels past the image's right edge.

ANI-4. `sheet.clone()` returns a new sheet with the same `image` object,
the same `frame_width`, `frame_height` and `num_frames`, and new frame
records whose rectangles copy the originals' x, y, width and height. A
cloned record's `name` is copied from the rectangle object, not from the
record, and is therefore normally `undefined`.

## Animation objects

ANI-5. `p5.Animation` is a constructor bound to the p5 instance;
`p5inst.loadAnimation(...)` constructs one with the same arguments. Two
forms are reached:

- sheet form: a single `SpriteSheet` argument. The animation keeps the
  sheet as `spriteSheet`, and its `images` array holds the sheet's frame
  rectangles, in order (the same objects as the sheet's records'
  `frame` members).
- image-list form: one or more p5 images. `images` holds them in
  argument order.

ANI-6. A new animation has: current frame 0, `frameDelay` 4, `playing`
true, `looping` true, `visible` true, `frameChanged` false, `offX` 0,
`offY` 0, update count 0.

ANI-7. `images` is a public array; its length is the frame count. The
runtime reads `animation.images.length` to tell a multi-frame animation
from a still.

ANI-8. `getFrame()` returns the current frame index. `getLastFrame()`
returns `images.length - 1`. `getFrameImage()` returns
`images[currentFrame]`.

ANI-9. `getWidth()` and `getHeight()` return the width and height of the
current frame: for a sheet frame, its rectangle's width and height; for
an image frame, the image's width and height. If the current index does
not name an element of `images` (see ANI-14), both return 1.

ANI-10. `clone()` returns a new animation with a shallow copy of
`images` (the same frame objects), a clone of `spriteSheet` if there is
one (ANI-4), and the same `offX`, `offY`, `frameDelay`, `playing` and
`looping`. The clone's current frame is 0, its update count is 0, and its
`visible` is true regardless of the source.

## Advancing frames

ANI-11. An animation's per-frame update (`update()`) does the following,
in order:

1. Increment the update count _n_.
2. Remember the current frame _f0_ and set `frameChanged` to false.
3. If `images.length` is exactly 1, set `playing` to false and the
   current frame to 0.
4. If `playing` is true and _n_ modulo `frameDelay` is 0, step the frame:
   - if a target frame is set (see ANI-17), move one frame toward it,
     or, if already on it, set `playing` to false;
   - otherwise, if `looping`, advance by one, or to 0 from the last frame
     (any index at or beyond `images.length - 1` counts as last);
   - otherwise (not looping), advance by one unless on the last frame, in
     which case set `playing` to false and stay.
5. Set `frameChanged` to true if the current frame differs from _f0_.

ANI-12. The update count is never reset except by creating a new
animation (including by `clone()`). `stop()`, `play()`, `changeFrame()`
and changes to `frameDelay` do not reset it. A frame therefore advances
on updates where the running count _n_ is a multiple of the `frameDelay`
current at that update, not _k_ updates after `play()`.

Example: 4 frames, `frameDelay` 4, stopped before update 2, `play()`
before update 6, `frameDelay` set to 3 before update 9. Current frame
after updates 1..12: 0 0 0 0 0 0 0 1 2 2 2 3.

ANI-13. The modulo test uses the numeric value of `frameDelay` as is,
with JavaScript `%` semantics: a `frameDelay` of 0 never advances
(the remainder is NaN); a negative delay behaves as its absolute value;
a fractional delay advances when _n_ is an exact multiple (2.5 advances
at _n_ = 5, 10, ...).

ANI-14. `changeFrame(f)` sets the current frame to _f_ if _f_ is less
than `images.length`, and to `images.length - 1` otherwise. _f_ is not
rounded or checked for being negative: `changeFrame(-1)` sets the index
to -1, and `changeFrame(2.5)` to 2.5; such an index names no image
(ANI-9, ANI-23). It clears any target frame. It does not change
`playing`.

ANI-15. `nextFrame()` advances by one; on the last frame it goes to 0 if
`looping` and stays otherwise. `previousFrame()` moves back by one; on
frame 0 it goes to the last frame if `looping` and stays otherwise. Both
clear any target frame and set `playing` to false.

ANI-16. `play()` sets `playing` to true and clears any target frame.
`stop()` sets `playing` to false. `rewind()` sets the current frame to 0.

ANI-17. `goToFrame(t)` does nothing if _t_ is outside
[0, `images.length` - 1]. Otherwise it sets the target frame to _t_ and,
if _t_ differs from the current frame, sets `playing` to true. Subsequent
updates step toward _t_ by one frame per `frameDelay` updates and set
`playing` to false on the first stepping update that finds the frame
already at _t_. The target stays set after that.

## A sprite's animations

ANI-18. A sprite holds a map from label (string) to animation, the label
of the current animation, and `animation`, a reference to the current
animation. A new sprite has no animations: `getAnimationLabel()` returns
the empty string, `animation` is `undefined`, and `frameDelay` is
`undefined`.

ANI-19. `sprite.addAnimation(label, source)`:

- if `label` is not a string, prints an error and returns -1;
- if `source` is an `Animation`, stores `source.clone()` under `label`;
- otherwise treats the second and later arguments as the image-list form
  (ANI-5) and stores a new animation built from them;
- if the sprite had no current animation, makes the stored animation
  current;
- sets the sprite's base width and height (SPR-: the size before the
  width and height stretch factors) to the stored animation's
  `getWidth()` and `getHeight()` multiplied by the absolute value of the
  sprite's effective x and y scale (SPR-: `scale` times the width or
  height stretch), whether or not the new animation became current;
- returns the stored animation.

Storing under an existing label replaces that animation.

Example: a sprite with `scale` 0.5 and no stretch gets a 100 by 100
animation: `width` and `height` become 50. A sprite whose `width` was set
to 50 over a 100 by 100 animation (stretch 0.5) then gets an 80 by 80
animation: `width` becomes 20 (80 x 0.5 x 0.5) and `height` 80.

ANI-20. `sprite.changeAnimation(label)`: if no animation is stored under
`label`, prints `changeAnimation error: no animation labeled <label>` and
changes nothing. Otherwise makes that animation current. It does not
clone, rewind or resize.

ANI-21. `sprite.setAnimation(name)` is the Code.org entry point the
runtime uses:

1. If `name` equals `getAnimationLabel()`, do nothing. The current
   animation keeps its frame, update count and `playing` state.
2. Look `name` up in the predefined animation table (ANI-27). If absent,
   throw an `Error` whose message is
   `Unable to find an animation named "<name>".  Please make sure the animation exists.`
   (two spaces after the full stop). The sprite is unchanged.
3. Otherwise `addAnimation(name, entry)` then `changeAnimation(name)`.

Because every call with a new name builds a fresh animation, switching
costume A to B to A shows A from frame 0 with a fresh update count, and
a paused A comes back playing if the table's entry is playing.

ANI-22. `sprite.frameDelay` reads `animation.frameDelay`, or `undefined`
with no current animation; writing it sets `animation.frameDelay` on the
current animation only, and is ignored with no current animation. It
does not affect the table entry or other stored animations.

ANI-23. The sprite update (SPR-) calls the current animation's `update()`
once, after moving the sprite and before refreshing its collider, and
only while the sprite is not removed. Stored animations that are not
current are not updated. Visibility does not matter: an invisible sprite's
animation still advances.

ANI-24. Code.org fixes sprite sizes against frame changes: a frame
change never alters a sprite's `width`, `height` or collider size. Only
`addAnimation` (ANI-19) and explicit size writes (SPR-) do.

ANI-25. `sprite.pause()` calls `stop()` on the current animation.
`sprite.play()` rewinds the current animation first if it is not
looping, not playing, and on its last frame; it then calls `play()`.
Both do nothing without a current animation.

ANI-26. The public member `delay` on a sprite is not related to
animation. The runtime owns it as plain data (a countdown its behaviors
read and decrement); the library must not interpret it.

## Timing within the frame lifecycle

ANI-27. The _predefined animation table_ is a map from image name to
either a still (a p5 image) or an `Animation`. The engine replaces its
entries between runs and, in Sprite Lab 2, adds entries mid-run. The
mechanism by which the engine installs it is the library's to define;
`setAnimation` reads it at call time.

ANI-28. Frames advance only in the pre phase of a frame (LIF-), when the
library updates every sprite in `allSprites` in order (ANI-23). They
never advance during the draw phase or when a sprite is drawn.

Example: during frame _k_'s draw phase a block gives a sprite a 4-frame
animation with `frameDelay` 4. The frame shown by `drawSprites` in
frames _k_ through _k_+3 is 0; in _k_+4 through _k_+7 it is 1; in _k_+8
it is 2.
Equivalently, frame index = floor(_m_ / `frameDelay`) mod frame count,
where _m_ is the number of pre phases since the call, for a looping
animation that no one stops or seeks.

ANI-29. A still in the table becomes a one-frame animation. Its first
update sets `playing` to false (ANI-11 step 3); it never advances.

## Drawing a frame

ANI-30. The sprite draws its current animation with the sprite transform
already applied (SPR-): origin at the sprite position, rotated by the
sprite rotation, scaled by the effective x and y scale times the
mirror signs (`mirrorX()`, `mirrorY()`, each 1 or -1).

ANI-31. In that space the frame is drawn at its own frame size, centred
on (`offX`, `offY`), which is (0, 0) for every animation Sprite Lab
makes. The frame centre is therefore the sprite's anchor. On screen,
before the camera, the frame spans `getWidth()` x |scale x stretchX|
by `getHeight()` x |scale x stretchY|.

Example: a sprite at (200, 150), `scale` 0.5, `mirrorX(-1)`, showing
frame 2 of a 400 by 100 sheet cut into 100 by 50 frames, draws source
rectangle (200, 0, 100, 50) into destination (-50, -25, 100, 50) under
the transform x' = -0.5x + 200, y' = 0.5y + 150.

ANI-32. A sheet frame draws the rectangle of the sheet image named by its
record. An image frame draws the whole image. A frame whose index names
no element of `images` draws nothing and prints
`Warning undefined frame <index>`.

ANI-33. An animation whose `visible` is false draws nothing. Drawing
through a sprite does not update the animation (ANI-28).

ANI-34. Tint. When the sprite's `tint` is truthy, the frame is drawn
with that colour applied, and the tint does not persist past the frame.
`tint` is any value p5's colour parser accepts (Sprite Lab stores CSS
colour strings, and `null` to remove). Code.org's p5 tints differently
from upstream p5, and the library must reproduce Code.org's result. With
source pixel colour _C_ and alpha _a_ (components in [0, 1]) and tint
colour _T_ with alpha _t_:

- let _I_ = (1 - _t_) _C_ + _t_ _T_;
- the drawn pixel has alpha _a_ (2 - _a_) and premultiplied colour
  _a_ ((1 - _a_) _C_ + _a_ _I_ _C_) + _a_ _I_ (1 - _a_),
  products taken per component.

For an opaque pixel (_a_ = 1) this is _C_ x ((1 - _t_) _C_ + _t_ _T_); for
an opaque tint (_t_ = 1) that is the multiply _C_ x _T_. The whole sheet
image is tinted, then the frame rectangle is drawn from it, which is the
same per pixel. Values are rounded to 8 bits as a 2D canvas would.

Example (by hand): tint `'#ff0000'` over an opaque pixel (0.8, 0.6, 0.4)
gives (0.8, 0, 0). A tint with alpha 0 over the same pixel gives
(0.64, 0.36, 0.16).

## How the engine builds the table (Code.org wrapper behavior)

These requirements describe the engine side of the contract, so that the
library supports it; the engine code, not the library, carries them out.

ANI-35. Classic Sprite Lab loads every project image as a still: the
whole image file, however many frames the project metadata records, is
one frame.

ANI-36. Sprite Lab 2 loads an image whose metadata has a frame count
above 1 and a frame size as an animation: a grid-form sheet
(`frameSize.x`, `frameSize.y`, `frameCount`) over the whole image, then
an animation over that sheet, whose `looping` and `frameDelay` are set
from the metadata. Every other image is a still.

ANI-37. Before loading, Sprite Lab 2 crops transparent borders from each
still costume: the kept rectangle is the tight bounding box of pixels
whose alpha exceeds 32 (of 255). Fully transparent images, images with no
border, backgrounds and multi-frame sheets are not cropped. The crop
changes the still's width and height and so the sprite's size.

ANI-38. An entry is loaded again only when its name is new or its image
data changed; an unchanged entry keeps the same table object across
reruns.

ANI-39. Project metadata that lacks `frameDelay` gets one when the
project loads: round(30 / `frameRate`) if `frameRate` is a nonzero
number, else 2. Metadata that lacks `looping` gets true.

ANI-40. Sprite Lab 2 character sets. For a sprite whose image is a
character sheet, the engine, once per frame and just before the sprites
are drawn, calls `stop()` on the sprite's current animation, sets its
frame with `changeFrame()`, and sets `mirrorX()`. Such animations never
advance by themselves after the first draw; the library's only duty is
that `stop()` holds the frame (ANI-11) and that `changeFrame()` takes
effect in the same frame's draw.

ANI-41. Sprite Lab 2, at the start of every draw phase before any
behavior or event runs, sets the base width and height (ANI-19) of every
sprite whose current animation has more than one frame to that
animation's `getWidth()` and `getHeight()`, leaving the stretch factors
unchanged. The library must provide a public way to do this, since the
fork's field is private.

ANI-42. The runtime's own `setAnimation` command wraps the sprite
method: it divides `scale` by the sprite's `baseScale`, recomputes
`baseScale` as 100 / max(100, `animation.getHeight()`,
`animation.getWidth()`), and multiplies `scale` by the new value. It
calls the sprite method before rescaling, so ANI-19's size rule sees the
old scale. Sprite Lab 2 further wraps it: a name missing from the table
is decoded on demand and applied when the decode finishes, one or more
frames later.

## Test vectors

Each row is marked _fork_ (obtained by running the fork under apps'
harness) or _hand_ (computed from this document).

Sheet grids (`loadSpriteSheet(image, fw, fh, n)`):

| Image   | fw x fh | n   | Frame origins                                           | Src  |
| ------- | ------- | --- | ------------------------------------------------------- | ---- |
| 400x100 | 100x100 | 4   | (0,0) (100,0) (200,0) (300,0)                           | fork |
| 250x200 | 100x100 | 7   | (0,0) (100,0) (200,0) (0,100) (100,100) (200,100) (0,0) | fork |
| 200x100 | 100x100 | 5   | (0,0) (100,0) (0,0) (100,0) (0,0)                       | fork |
| 300x300 | 100x150 | 2   | (0,0) (100,0), each 100 wide, 150 high                  | fork |

New animation over the 400x100 sheet: `images.length` 4, `getWidth()`
100, `getHeight()` 100, `frameDelay` 4, `playing` true, `looping` true,
`getFrame()` 0, `getLastFrame()` 3, `offX` 0, `visible` true,
`frameChanged` false. (fork)

Advancing: `update()` called repeatedly on a fresh animation; each entry
is (frame, playing, frameChanged) after that update.

| Frames | Delay | Loop | After updates 1, 2, 3, ...                                            | Src  |
| ------ | ----- | ---- | --------------------------------------------------------------------- | ---- |
| 4      | 4     | yes  | (0,t,f) (0,t,f) (0,t,f) (1,t,t) (1,t,f) x3 (2,t,t) (2,t,f) x3 (3,t,t) | fork |
| 3      | 1     | no   | (1,t,t) (2,t,t) (2,f,f) (2,f,f) (2,f,f)                               | fork |
| 3      | 2     | no   | (0,t,f) (1,t,t) (1,t,f) (2,t,t) (2,t,f) (2,f,f) (2,f,f) (2,f,f)       | fork |
| 4      | 0     | yes  | frame 0 and playing for 6 updates                                     | fork |
| 4      | 2.5   | yes  | frame 0 for updates 1-4, 1 for 5-9, 2 at 10                           | fork |
| 4      | -2    | yes  | 0 1 1 2 2 3                                                           | fork |

Other animation vectors:

| Setup                                                                    | Result                                                                                                     | Src  |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---- |
| stop before 2, play before 6, delay 3 before 9 (4 fr, d 4)               | frames 0 0 0 0 0 0 0 1 2 2 2 3                                                                             | fork |
| one 30x40 image, one update                                              | playing false, frame 0, 30 x 40                                                                            | fork |
| looping, `changeFrame(3)`, `nextFrame()`                                 | frame 0, playing false                                                                                     | fork |
| not looping, `changeFrame(3)`, `nextFrame()`                             | frame 3, playing false                                                                                     | fork |
| looping, at 0, `previousFrame()`                                         | frame 3, playing false                                                                                     | fork |
| `changeFrame(10)` on 4 frames                                            | frame 3, playing unchanged (true)                                                                          | fork |
| `changeFrame(-1)`                                                        | frame -1, `getWidth()` 1, no image                                                                         | fork |
| `changeFrame(2.5)`                                                       | frame 2.5, `getWidth()` 1                                                                                  | fork |
| `stop()`, `changeFrame(1)`                                               | frame 1, playing false                                                                                     | fork |
| `goToFrame(2)` from 0, delay 4, 14 updates                               | frame 0 x3, 1 x4, 2 x4 playing, then 2 stopped from update 12                                              | fork |
| clone of (delay 7, frame 2, stopped, not looping, offX 5, visible false) | frame 0, delay 7, playing false, looping false, offX 5, visible true, same image objects, same sheet image | fork |

Sprites (table: `walk` = 4 frames of 100x100, `jump` = 2 frames of
80x80, `rock` = a 50x70 still):

| Setup                                                        | Result                                                        | Src  |
| ------------------------------------------------------------ | ------------------------------------------------------------- | ---- |
| new sprite                                                   | label `""`, `animation` undefined, `frameDelay` undefined     | fork |
| `setAnimation('walk')`                                       | label `walk`, animation is a clone, 100 x 100, `frameDelay` 4 | fork |
| then 10 full frames                                          | frame after each: 0 0 0 1 1 1 1 2 2 2                         | fork |
| `sprite.frameDelay = 2`                                      | table entry keeps 4; sprite's animation 2                     | fork |
| then `setAnimation('jump')`                                  | 80 x 80, frame 0                                              | fork |
| then `setAnimation('walk')`                                  | frame 0, `frameDelay` 4                                       | fork |
| then `setAnimation('rock')`                                  | 1 frame, 50 x 70, same image object, delay 4                  | fork |
| then `setAnimation('nope')`                                  | throws ANI-21 message; label stays `rock`                     | fork |
| `scale = 0.5`, then `setAnimation('walk')`                   | `width` 50, `height` 50                                       | fork |
| `setAnimation('walk')`, `width = 50`, `setAnimation('jump')` | `width` 20, `height` 80                                       | fork |
| `addAnimation('m', a)`, `addAnimation('n', b)`               | label `m`                                                     | fork |
| `changeAnimation('zzz')`                                     | label unchanged, message printed                              | fork |
| removed sprite, delay 1, two frames                          | frame stays 0                                                 | fork |
| not looping, frame 3, `pause()`, `play()`                    | frame 0, playing true                                         | fork |

Drawing (drawImage calls recorded by the canvas mock):

| Sprite                                                    | Source rect  | Dest rect      | Transform (a b c d e f) | Src  |
| --------------------------------------------------------- | ------------ | -------------- | ----------------------- | ---- |
| (200,150), scale 0.5, mirrorX -1, frame 2 of 100x50 sheet | 200,0,100,50 | -50,-25,100,50 | -0.5 0 0 0.5 200 150    | fork |
| (100,100), still 60x40, rotation 90                       | 0,0,60,40    | -30,-20,60,40  | 0 1 -1 0 100 100        | fork |
| (100,100), still 60x40, `width = 120`                     | 0,0,60,40    | -30,-20,60,40  | 2 0 0 1 100 100         | fork |

Tint (hand): opaque pixel (0.8, 0.6, 0.4) with tint `#ff0000` gives
(0.8, 0, 0); with tint alpha 0 gives (0.64, 0.36, 0.16); pixel alpha 0.5
comes out alpha 0.75.

## Not specified

- Loading frames from file names or URLs (sequence mode, image lists of
  paths, sheets from a URL, `loadImageElement`, HTML image elements).
- Texture-packed sheets (frame records with `spriteSourceSize` and
  `sourceSize`), `sheet.drawFrame`.
- Drawing an animation on its own with `p5inst.animation(anim, x, y)` or
  `anim.draw`, and the self-update that path performs.
- `getImageAt`, `sprite.addImage`, `changeImage`, `setFrame`,
  `sprite.nextFrame`, `sprite.previousFrame`, `frameDidChange`.
- Game Lab's "pause animations by default" flag and its "all animations
  single frame" page constant; the Game Lab preload path.
- `sprite.alpha` (Sprite Lab never sets it) and `overlapPixel`.
- `offX`, `offY` other than 0, and `visible` false: specified above but
  never reached.

## Open questions

1. ANI-19 multiplies the new animation's size by the sprite's current
   scale and stretch. The size getter then applies the stretch again, and
   drawing applies the scale again. Classic Sprite Lab's costume command
   (ANI-42) runs the sprite method while `scale` is still the old one, so
   a scaled sprite that changes costume reports a `width` and `height`
   that are off by its old scale. Its collider is not affected: the
   collider is sized from the animation (COL-5). Preserve it (CMP-5).
   Sprite Lab 2 undoes it for multi-frame animations one frame later
   (ANI-41), not for stills.
2. ANI-35: the metadata comment in the engine calls a classic still "its
   first frame", but the whole image is loaded. For a multi-frame library
   image classic Sprite Lab shows the whole strip. Preserve.
3. ANI-40 relies on `stop()`. The update count still increments while
   stopped (ANI-12), so if the engine ever calls `play()` on a character
   sheet the next step will not wait a full `frameDelay`.
4. ANI-14 leaves the index unchecked for negative and fractional values;
   no Sprite Lab path passes one. An implementation may keep this, and
   must at least keep `getWidth()` and `getHeight()` returning 1 there.
5. ANI-34's tint formula makes semi-transparent pixels more opaque
   (alpha 0.5 draws at 0.75) and darkens a tint with alpha below 1. This
   is a Code.org p5 change, not p5.play; students see it on every tinted
   costume with soft edges. Preserve.
6. A grid frame that runs past the image edge (ANI-3) draws whatever the
   2D canvas draws for a source rectangle partly outside the image.
   Chrome clips source and destination together. Not reached by project
   metadata that the editor produces.
