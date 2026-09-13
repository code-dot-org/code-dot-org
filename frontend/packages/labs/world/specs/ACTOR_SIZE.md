# How big an actor is

A picture's pixels decide how big the actor wearing it is, which stops being
reasonable the moment a picture is not 32 pixels. Not built; this is what to
change, what it breaks, and what to leave alone.

## The problem

Every sprite the library ships is 32 by 32, and `TILE_SIZE` is 32. So an actor
is a tile, `scale` is a number nobody has had to think about, and none of this
has ever been tested by anything else.

A described picture is the first thing that is anything else. A model draws at
a thousand pixels and up; kept at 256, the actor is EIGHT TILES ACROSS in the
world while the map editor still draws it as one — so it looks right where it
is placed and is wrong where it is played. The same has always been true of an
uploaded picture; drawing one just made it the common case rather than a rare
one.

The rule today is: **drawn size is the picture's pixels, times `scale`.** That
makes `scale` mean something different for every picture, which is the actual
defect. A learner who writes `scale = 2` is saying "twice as big as it would
be", and what it would be is a fact about a file they may not have made.

## The change

**At scale 1, a sprite is drawn so its LONGEST side is one tile, keeping its
aspect ratio.** A 256-square picture draws at 32 by 32; a 256-by-128 draws at
32 by 16. Scale multiplies that, so 2 is two tiles on the longest side and
means the same thing for every picture in every project.

The collision box follows the drawn shape: the same fit, the same scale, so
what is hit is what is seen.

    fit = TILE_SIZE / max(pictureWidth, pictureHeight)

    drawn  = picture × fit × scale
    box    = picture × fit × scale

**Nothing the library ships moves.** Every stock sprite is 32 square and the
tile is 32, so `fit` is exactly 1 for all of them. That is the strongest thing
that can be said for this change: the whole shipped library is a no-op under
it, and only the pictures that are currently wrong change at all.

## Two paths, and they do not meet

The thing to be careful of, because it is not visible from either end: **the
drawn size and the collision box are computed in different places from
different sources**, and they agree today only by coincidence of both being
"the picture's pixels".

- **Drawn.** `renderSnapshot` (`engine/core/World`) builds a `FrameState` of
  `{sprite, cell, offset, scale}`, and the driver calls
  `setScale(state.scaleX × frame.scale)` on a Phaser image — which multiplies
  the TEXTURE's own pixels. Nothing here reads any size property.
- **Box.** The Animation rule writes `IntrinsicSizeProperty` from what the
  project measured (`World.imageSize`), and Collision and "Stays in the Map"
  read it times `scale`.

So the fit has to be applied twice, in two files, and **a change that does one
and not the other is worse than no change at all** — an actor drawn at a tile
with a box eight tiles wide is a bug nobody can see. One exported function,
called from both.

**The drawing side has an obvious home.** `FrameState.scale` already exists —
it carries an animation frame's own author-set scale, defaulting to 1 — and it
is already multiplied into what the driver applies. Folding `fit` into it where
`renderSnapshot` builds it means the driver changes not at all. It does
redefine that field from "the frame's scale" to "the frame's scale times the
fit", which is worth saying where it is declared.

**The box side is already in one place.** `publishPictureSize` and
`publishIntrinsicSize` both write the property from a measured size; both
multiply by the same factor.

## Animations need no rule, because they already have it

A sheet whose cells differ in size would make an actor swell and shrink as it
played. The engine settled this before the question was asked:
`publishIntrinsicSize` sets the size to **the largest cell across every frame**
— "a stable, frame-independent box, so it does not pulse with the animation".

So the answer is the one worth having, and it is already the behaviour: an
animation is as big as the biggest box its frames would fit in, and every frame
is drawn inside that. Nothing to decide and nothing to write.

## What it breaks

**Nothing, as it turns out.** The case to worry about was a project with a
non-32 sprite and a hand-set scale: drawn at pixels × scale before and at a
tile × scale after, with no migration able to tell "I set 2 because the picture
was small" from "I set 2 because I wanted it big". There are no projects in the
world yet, so there is nobody to tell apart — and this is the cheapest moment
this change will ever have.

It is worth knowing that the window closes. Once a learner's project exists
with a picture that is not a tile, changing what `scale` means to it is a
migration nobody can write.

**A picture nobody measured** has no fit to compute (`World.imageSize` answers
undefined). It keeps today's behaviour, which is the only honest answer.

## What NOT to do with it

**Leave `TILE_SIZE` at 32.** Making it 64 is a different change wearing the
same coat: every position, speed, gravity, jump impulse, camera deadzone and
map extent in the library is in world pixels, so doubling the tile halves the
apparent speed of every constant anybody ever tuned. That is a re-tuning pass
across every fixture and stock rule, and it buys nothing this change does not.

If the aim is more detail on screen, **the camera already zooms**. A 256-pixel
picture drawn into a 32-unit tile at 2× zoom puts exactly as many pixels on the
display as the same picture into a 64-unit tile at 1×, and costs no re-tuning
at all. The source pictures can be as large as the storage budget allows
(`IMAGE_GENERATION.md`) — how big they are DRAWN is a separate question from
how many pixels they hold, and that separation is the whole point of the fit.

## What follows, and is not this

**Telling the map editor the real size.** It admits the gap itself: a
sprite-backed actor's size "is not measured here — a frame names a sprite and
carries no dimensions… which is exactly right for the 32-pixel sprites
everything ships with and wrong for any other"
(`runtime/messages.ThumbnailsReadyMessage`). After the fit, every actor is at
most one tile and the nominal tile stops being a guess — except for aspect
ratio, which a non-square sprite still needs sent.

**A default scale on the kind.** `scale = [1, 2]` for something twice as tall
as it is wide is a real want, and once `scale` means the same thing everywhere
it is finally a number worth defaulting. It would also give the drawing door
something to ask for — a 1:2 picture rather than a square one — so the picture
arrives the shape the actor wanted. Needs a home in the actor file and a story
for what the map editor draws.

**Backgrounds are not in any of this.** A backdrop is stretched over the
viewport and already takes whatever shape it is; nothing about fitting a tile
applies. Layering them for parallax is a later problem and a different spec.
