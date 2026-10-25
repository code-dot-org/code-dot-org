# Plan: animations on the actor (SIMPLE_INTERFACE.md, phase seven)

STATUS: IN PROGRESS.

The seventh phase of the simple interface: "Animations", under the Actor
Editor. An actor is a set of animations with a Main one; each is a timeline
of keyframes over the actor's look; a flipbook and a tween are the same
thing, made on the same timeline in the Actor Editor. Three plans left this
for here (ACTOR_EDITOR_PLAN.md, SHELL_FINISH_PLAN.md, and the spec's own
"Not in this phase" lists).

## What exists

- **An animation is a flipbook in a project file.** A `.anim` file under
  `animations/` holds named animations, each a list of frames: a sprite or
  one cell of a sheet, with an optional delay, scale and offset, and a
  frame rate and a loop flag for the whole (`animationEditor/animDocument`,
  `engine/core/animationFile`). Ids are global: `playerBob`, `coinSpin`.
- **Every `.anim` is registered with the world** by the generated code,
  whether anything plays it (`domainBlocks`, `world.useAnimations`).
- **The engine plays one animation per actor** (`engine/rules/animation`,
  the Appearance rule): `AnimationProperty` names it, a per-tick step
  advances the frame by its delay, and `AnimationEnded` fires when one that
  does not loop finishes. `World.renderSnapshot` draws the frame, with the
  frame's offset and scale.
- **An actor names one by id.** A data-shaped actor's look is
  `{sprite}` or `{animation}` (`actors/actorData`, `ActorLook`), written
  as a `set sprite` or `play animation` row in its code view. `play
animation ⟨id⟩ on ⟨actor⟩` offers every id the project's files define.
- **They are edited apart from the actor**, in the animation editor
  (`animationEditor/AnimationEditor`, about 1,450 lines), opened from the
  look's Edit animation since phase six.
- **Nine stock animations** ship as `.anim` data with the sprites they
  read (`appearance/stock`, `STOCK_ANIMATIONS`), two of them brought by
  stock actors (the Coin's spin, the Player's bob); `pulse` and
  `playerBob` are already tweens made of frames, one picture scaled or
  moved frame by frame. The animation shelf imports the others.
- **Effects are data on the actor**, each with whether it starts on, and
  the engine adds and removes them by path (`Actor.addEffect`,
  `removeEffect`).

## Decisions

Taken from the review of the phase; the spec's own words are in
SIMPLE_INTERFACE.md, "Animations".

- **Animations are data on the actor**, as its effects are:
  `animations: {Main: {...}, Walk: {...}}` in the actor's file. They are
  reached from the actor and named within it; `play animation ⟨Walk⟩` on
  a Coin means the Coin's Walk.
- **`.anim` files and the separate animation editor are retired**, not
  kept beside the timeline. Nothing has shipped (no migrations). A
  flipbook is a timeline whose only track is the sprite, so the timeline
  replaces the frame list rather than standing next to it. The stock
  animations become animation data that the actor bringing them carries,
  and the lessons that teach "an animation is a file" are rewritten.
- **A curated set of properties is animated**, not every property a trait
  declares: the sprite (and its cell), where the picture is drawn relative
  to the actor, its scale, its turn, its opacity, and each effect's on
  and off. Effect settings that are numbers come after, in the same
  shape. Physics is not animated.
- **What moves is the DRAWING, not the actor.** Position, scale and turn
  tracks are a drawn offset, a drawn scale and a drawn turn on top of the
  actor's own, which is what a frame's offset and scale already are. So a
  bob plays wherever the actor stands and while it walks, and an
  animation never fights the rule moving the actor.
- **Each animation has a Loop box.** Main loops by default, as the
  flipbooks do now; a new one does not. One that does not loop ends at its
  last key and raises `AnimationEnded`.
- **Linear only.** Numbers and vectors are interpolated linearly between
  keys; a sprite, a cell and an effect's on and off hold until the next
  key. A key has room for an `ease` that is not written yet.
- **Main is the look.** An actor with a still picture has a Main of one
  sprite key at 0. The Actor Editor's "Looks like" becomes Main's sprite.

## The shape

```json
"animations": {
  "Main": {
    "loop": true,
    "length": 0.6,
    "tracks": {
      "sprite": [
        {"at": 0, "value": "coinSpin.png#0"},
        {"at": 0.1, "value": "coinSpin.png#1"}
      ],
      "drawnOffset": [
        {"at": 0, "value": {"x": 0, "y": 0}},
        {"at": 0.3, "value": {"x": 0, "y": -4}}
      ],
      "effect:effects/ripple": [{"at": 0.2, "value": true}]
    }
  }
}
```

- A track per property; a key is a time in seconds and a value.
- `length` is the timeline's, 5 seconds by default; the animation ends at
  its last key, and a loop wraps there.
- A track the animation does not have leaves that property alone, so an
  animation of only a turn leaves the sprite to Main or to code.

## What is being built

One commit each, or a few where a step is large.

### 1. The animation as data, and its arithmetic

`engine/core/keyframes.ts`: the types, `valueAt(track, t)` (linear for
numbers and vectors, held for the rest), `endOf(animation)`, and the
edits the editor makes — set a value at a time (adding or replacing a
key), remove a key, move one. Pure, with tests.

BUILT. `engine/core/keyframes`: `Key`, `Track`, `Timeline`;
`valueAt`, which says nothing before a track's first key (an effect
switched on at 0.2 leaves the actor's own until then) and holds the last
value after its last; `endOf`; `timeIn`, which wraps a loop at its end and
stops one that does not, so that one whose every key is at 0 — a still
picture — has ended at once; and `withKey`, `withoutKey`, `withKeyMoved`.
Times are kept to the millisecond, so a key is found where it was put.

Found while building: an animation ends at its LAST KEY, so a flipbook's
last picture, keyed when it starts, would be shown for no time at all
before a loop wrapped. A flipbook therefore carries a closing key, its last
picture again, one frame after it; the conversion in step 4 and Add frames
in step 8 write it.

### 2. The engine plays it

The actor's kind registers its animations with the world under its own
name (`actors/coin#Main`), and `play animation` resolves a name against
the actor's kind before anything else. The Appearance rule's step plays a
timeline animation: it advances the time, wraps or ends it, and sets each
track's property at that time. The drawn offset, scale and turn are new
Appearance properties, which `renderSnapshot` applies; an effect track
adds and removes the effect. `AnimationEnded` and `FrameChanged` keep
their meaning, a frame being a key of the sprite track. Engine tests.

BUILT. `ActorBuilder.useAnimations(timelines, effects)` keeps a kind's
animations by name, with the documents of any effect they switch on (an
animation may turn on an effect the actor does not start with, and that
needs its graph); a kind that acts like another takes its animations
where it has none of the same name. The World holds them by the actor's
type, as it holds a kind's drawing (`useActorKind`, `timelineOf`).

The Appearance step resolves the playing name against the actor's kind
first and plays a timeline (`rules/animation.playTimeline`): it keeps
where it is in the elapsed slot, so a loop does not count up for ever,
sets each track's value at that moment, and emits `animation frame
changes` when the sprite track reaches a new key and `animation ends`
once. A sprite key is a file or `{sprite, cell}` — a rectangle, as the
engine is only ever told; the generator resolves a sheet's cell, as it
does for `set sprite`. The drawn offset, scale and turn are new
Appearance properties, `readonly` as the frame is, so the map editor does
not offer them as fields; `renderSnapshot` reports them as `drawn`, and
the driver moves, scales and turns the actor's own image by them and not
its children. A project-wide flipbook still plays where the kind has no
timeline of that name, until step 4 retires them. Their getter blocks
join the Appearance drawer's ledger.

In the browser, nothing plays a timeline yet (step 3 writes them); the
starter, Interface Kit and Asteroids draw as before with no page errors.

### 3. The actor's data and its code

`ActorData.animations`; the code view registers them and plays Main when
the actor is created; the fold reads them back. `ActorLook` folds into
Main. `play animation`'s dropdown offers the target's kind's animations,
this actor's when the target is `this actor`. The readers that draw an
actor from its file — the palette, the stage's local pictures, the Actor
Creator's picture step — read Main's first sprite.

BUILT. `ActorData.animations`, by name; a still picture is a Main of one
sprite key at 0 (`stillAnimation`), and `look` now holds only a project
flipbook the actor plays, until step 4. Looks like reads and writes
through `lookOf` and `withLookOf`: a picture replaces Main with a still
one, a flipbook takes Main's place.

The view writes a still Main as the `set sprite` row it always was, so
every reader that looks in a view for a picture still finds one, and
anything more as `world_actor_animations`, a row in no toolbox whose extra
state is the timelines (`blockly/extensions/actorAnimations`). Its
generator declares them on the kind (`actor.useAnimations`), resolving a
sheet cell (`coin.png#3`) to its rectangle and importing each effect a
track switches on, and plays Main. The fold reads the row back, and a
`set sprite` row as a still Main.

`play animation` offers the actor's own animations first when the block is
in an actor's file (`animationOptions`, by `editingActorModule`), then the
project's flipbooks. Not done: a block in another file, playing on `any
Coin`, is not offered the Coin's names; the engine still resolves one
typed there by the target's kind. The wizard's copy step reads a
data-shaped actor's look from its data rather than its view.

A test compiles a project that places an actor written as data and finds
Main playing from the start, looping at its last key, and Hop played by
name moving the picture. In the browser: Ground's Looks like set to
`coin.png` drew coins where the ground was, and the Player's flipbook
played as before.

### 4. The stock, and `.anim` retired

The stock animations become timelines (`appearance/stock`), carried by the
stock actors that use them; the animation shelf adds one to the actor in
the Actor Editor rather than writing a file. Then `.anim` goes: the file
kind, `animations/` in the list of kinds, `world.useAnimations` of files,
the animation editor, its picker and dialogs, the Pictures menu's New
animation, and the look's Edit animation. The fixtures and the stock
actors are converted, not migrated. Likely two commits.

BUILT, as one commit: the conversion and the retirement could not be
separated without fixing the same tests twice.

The library's nine animations are timelines (`appearance/stock`): a strip
is a sprite track of cells with its closing key; a pulse is a drawn-scale
tween that returns to where it began, so it loops without a seam where the
frames used to step. An actor that looks like one keeps it as its Main
(`stock/workspace.looksLike`, `animationsRow`): the stock Coin and Player,
the starter's Ball, Jetpack's Coin, and Jetpack's Pilot, which keeps Fly
and Climb and plays them by name. Taking one brings only the pictures it
reads (`importStockAnimation`). The Actor Creator's picture step offers the
library's animations, chosen as Main; Looks like says "(its own
animation)" when Main moves, and offers "(an animation from the
library…)", as does the Pictures menu; `play animation` has no import row.
`TimelineThumb` plays an animation on a canvas, from `paintTimeline`, which
paints one moment of one, and serves the shelf and the Creator.

Then `.anim` went: the engine's flipbooks (`AnimationDef`, the world's
registry, rules shipping animations, `parseAnimationFile`), the file kind,
its folder, its icon and its seed, the generator's registration of every
`.anim`, the dropdown registries and the rename that carried an id, and the
animation editor with what only it used. The look is a picture only.

Found on the way:

- `set sprite` now stops whatever is playing; an animation still playing
  would put its own picture back on the next frame. Jetpack's Pilot is
  the case: it goes back to its picture when it stops flying.
- An actor playing an animation is drawn from the animation's first
  picture before the first step has run, as a flipbook's first frame was;
  otherwise the first snapshot of a world has nothing to draw.
- The frame is which picture, counted as they change, so a closing key is
  not a frame and raises no `animation frame changes`.
- A still Main beside other animations is written as its `set sprite` and
  the others' row, and the fold reads them back as one set in either
  order.
- A timeline is sampled each tick, where a flipbook stepped through every
  frame it crossed; a tick longer than a picture's time steps over it,
  which a game's sixty a second never does.

In the browser: the starter's coins spin and Ball pulses, Jetpack and
Asteroids play, with no page errors; Ground given the library's Asteroid
Tumble in the Actor Editor tumbled in the game. Not right yet: the Actor
Editor's own preview of an actor just given a library animation showed a
plain square, though the game drew it; it looks like the sandbox's
thumbnail was asked for before the newly imported picture had reached it.
The stock actors' previews, whose pictures were there from the start,
show their animations.

### 5. The animations in the Actor Editor

Under the preview, the actor's animations as a row (a menu when they do
not fit), Main first and marked; Add New Animation; rename, delete, and
Loop. Choosing one shows its first moment in the preview.

BUILT. `AnimationRow`, under Looks like: the actor's animations as
buttons, Main first and said to be the one it plays "when made"; the
chosen one's Loop box, and its Rename and Delete; Add New Animation, which
asks a name and makes one that does nothing yet (no tracks, not looping).
Main is not renamed or deleted here: it is the look, and goes by Looks
like's "(drawn by its code)". The row wraps rather than giving way to a
dropdown and a modal, as the spec has it: an actor with more animations
than a row holds is rare, and a second line reads as well as the first.
The edits are `actorEdits` (`addAnimation`, `renameAnimation`,
`removeAnimation`, `setAnimationLoop`, `animationNameProblem`); a rename
carries every `play animation` in the actor's own code, and not one in
another file playing it on this kind. Names are asked through the lab's
prompt, which refuses an empty name or one the actor has.

The preview shows the chosen animation at its start, painted from the
project's pictures (`TimelineThumb`, held still); one with no picture to
paint — a fade, a hop — shows the actor's own picture, as the game will.
In the browser: Jetpack's Pilot listed Main, Fly and Climb; Fly showed
its flame; Add New Animation made Wave.

### 6. The timeline

Below the row: a strip the animation's length, ticks along it, each key as
a mark on its track's row, and a playhead. Pressing the strip moves the
playhead and previews that moment; Play runs it. The preview is painted
here from the actor's pictures (`mapEditor/localPictures`), since the
sandbox's thumbnail cannot be asked for a moment; effects are not drawn in
it, and the preview says so when an effect track is on. Keyboard: the
arrows move the playhead a tick, Home and End go to the ends.

### 7. Editing at the playhead

The side panel shows each animated property at the playhead: a key's own
value plainly, an interpolated one in italics. Changing one writes a key
there. A key is selected by pressing its mark, moved by dragging it (or
Alt and an arrow), and removed with Delete. An effect's on and off at the
playhead is its checkbox on the Effects tab, which writes an effect key.

### 8. A flipbook from a sheet

"Add frames" puts a sheet's cells on the sprite track at a frame rate, one
key per cell, which is the frame list's one job that the timeline does
not do by hand; the cell picker comes from the animation editor
(`CellPicker`, `AddFramesDialog`), moved to the Actor Editor.

### 9. The lessons and the scenarios

The lessons and scenario instructions that name `animations/`, `.anim`
or the animation editor are rewritten for the actor's animations; the
catalogue's checks that read `.anim` files read the actor's instead.

### 10. Documents, the browser, and the ledger

## Not in this phase

- Easing. The key has room for it.
- Animating a trait's own properties, or effect settings that are not
  numbers.
- An animation shared between two kinds. One kind may act like another
  (`actsLike`), and what that means for animations is decided when it
  comes up.
- Importing a Screen or Map from another project; effects on a whole
  Screen or Map; the All maps and This map switch.
