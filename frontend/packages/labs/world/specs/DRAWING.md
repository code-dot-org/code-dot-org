# Drawing: an actor that makes its own picture

## The problem

An actor's appearance is a reference to an asset it did not make. `frameFor`
resolves two kinds and both answer the same question — a playing animation's
frame, then a static sprite, then nothing — and the question is always _which
picture_, never _what does it look like_.

So everything that cannot be reduced to a file cannot be drawn: a bar whose
length is a number, a box the right size for the word inside it, a shape, a
word. The proof is sitting in the driver already. An actor with no frame falls
back to `scene.add.rectangle(x, y, 32, 32, 0x33cc66)` — the engine can draw a
green rectangle, and nothing in the language can ask for one.

The second proof is `specs/UI_ACTORS.md` before this document existed. Wanting
one string on screen forced `text` into the Appearance foundation, because
`renderSnapshot` resolves the appearance trait through a built-in id and cannot
name a stock rule's trait. That was a correct reading of the code and the wrong
shape for the lab: every other mechanic added here became a rule, and this one
could not, for a reason that had nothing to do with text.

## The construct

**`define drawing`** — a routine a KIND of actor owns, and the sibling of `each
frame`:

```
define actor named ⟨Health Bar⟩
  define property ⟨number⟩ ⟨fraction⟩ = ⟨1⟩

define drawing ⟨64⟩ by ⟨8⟩
  set fill ⟨#301820⟩
  draw rectangle at ⟨0, 0⟩ size ⟨64, 8⟩
  set fill ⟨#e04040⟩
  draw rectangle at ⟨0, 0⟩ size ⟨64 × ⟨fraction of this actor⟩, 8⟩
```

It is the sibling of `each frame` in shape as well as in job: TWO SHAPES, one
block. Standing on its own in an `.actor` file it is a definition root, since
`DisableOrphansPlugin` greys out a top-level block that has a previous
connection along with everything chained after it. Chained inside a world's own
`define actor` it is one of that actor's rows, which is what lets a
world-defined actor have a picture — and it needed no field to say WHOSE, since
a local actor's body already generates inside a block where `actor` is that
builder.

It was root-only at first, and that made a whole class of actor unsayable in a
world: one with a picture. It presented as a scoreboard drawn as a plain green
box, which is what the driver paints for an actor nothing knows how to draw.

**An actor with words and no drawing is warned about, not fixed.** `Shows Text`
paints nothing on its own, so electing it and stopping there is a file in which
everything a learner can see is correct and the screen shows a coloured
rectangle. The engine cannot guess a picture and should not, so the `use trait`
row says so on its own face instead (`extensions/textNeedsDrawing`) — the
answer `missingRule` gives to its own silent case. What counts as drawing them
is `draw text` and only that: a sprite is a picture and not these words, and
`draw text` reads the text off the actor running the drawing, so another
actor's cannot stand in.

`each frame` proved the mechanism. `ActorBuilder.defineStep` folds a per-kind
routine into the tick order the first time one of the kind is placed
(`World.useActorKind`), declared in the actor's own file and shared with
nobody — and BEHAVIORS.md records why it is not a synthesized trait: a trait is
elected, shareable and askable, and this is none of them.

A drawing is that same thing with a different signature and one constraint:

```
a step     (actor, world, delta) => void        may change the world
a drawing  (actor)               => commands    may not
```

The purity is not decoration. It is what makes the caching below sound, and it
is what a drawing routine is: a description of how the actor looks, evaluated
whenever somebody wants to know.

## What it emits

Commands, not pixels. `RenderState` is documented as needing "no engine
internals, only these numbers", and a routine that rasterized would put a canvas
inside the engine. So the routine returns a display list, `RenderState` grows
`drawing?: DrawCommand[]`, and the driver turns commands into a texture. The
engine never learns what a canvas is, and the split that lets the same world run
under a different renderer survives intact.

## The vocabulary

Two that set, two that unset, five that draw:

```
set fill ⟨#e04040⟩
set outline ⟨#201018⟩ width ⟨1⟩
no fill
no outline

draw rectangle at ⟨0, 0⟩ size ⟨64, 8⟩
draw circle at ⟨16, 16⟩ radius ⟨12⟩
draw line from ⟨0, 0⟩ to ⟨32, 32⟩
draw text ⟨"Score"⟩ at ⟨32, 8⟩ size ⟨12⟩ anchored ⟨centre⟩
draw image ⟨button.png⟩ at ⟨0, 0⟩
```

`draw image` earns its place by deleting a problem. UI_ACTORS.md had text drawn
over a picture becoming a Phaser Container, because the driver keeps one
GameObject per actor and a button is a picture with a word on it. In a routine
that is two commands and one texture, and the Container is not needed at all.

## Decisions

**Paint is ambient within the routine, and this is the one place that is
right.** This project is consistently wary of ambient context and guards it
rather than trusting it — `worldContext`, `runtimeWorld`, `world_actor_kind`
compiling to two different things depending on its parent, and layers choosing
containment over `within layer` precisely to avoid it (VIEWPORT.md). Ambient
paint is the same shape of thing and is taken anyway, for two reasons that do
not apply to those cases: a routine is ONE sequence read top to bottom in one
file, not a context spanning scopes; and every drawing language a learner will
ever meet — Processing, Canvas2D, Scratch's pen, Logo — works exactly this way,
so the convention is not ours to invent or to withhold.

The guard is that there is no undefined state. A routine begins with an opaque
white fill and no outline, so a shape drawn before any `set fill` draws
something, and `no fill` / `no outline` exist so that absence is a thing you say
rather than a socket you empty.

A LINE IS STROKED WITH THE OUTLINE, FALLING BACK TO THE FILL. Found while
building: a line has no interior, so with the pen untouched the first drawing
anybody writes — `draw line` — produced nothing at all and no way to find out
why. "The colour" is the only paint a line can mean, so it takes whichever one
is set.

The alternative was paint on every shape block: `draw rectangle at ⟨⟩ size ⟨⟩
fill ⟨⟩ outline ⟨⟩ width ⟨⟩`. Self-contained, no order to trip over, and a block
so wide that the shape is the smallest thing on it.

**The canvas is declared, not measured.** `define drawing ⟨64⟩ by ⟨8⟩` says how
big the picture is, in pixels, and the routine draws inside it with the origin
at its top-left corner. The actor's position is the canvas's CENTRE, which is
where an actor's position already is.

The payoff is that `intrinsic size` — read-only today and set by measuring the
image — becomes the declared size, with nothing measured. `Can Be Clicked` and
`collisions` both work out an actor's extent from `intrinsic size` × `scale`, so
a drawn button's click box is right for free. A bounding box computed from what
was drawn would be the alternative, and it would move when the text got longer,
which is a click target that changes size for reasons the author did not state.

**Drawing wins the appearance chain.** `frameFor` resolves animation, then
sprite, then nothing; a drawing goes in front of all three. An actor with both a
drawing and a sprite has had two things said about it, and the more specific one
is the routine written in its own file. An actor whose picture should change is
not thereby shut out: the routine reads a property, a step changes the property,
and the hash below notices.

**No clock inside a routine.** A drawing may read the actor's properties and
nothing else — not `time`, not `frame time`, not the world. This is a palette
decision rather than a type: nothing stops a routine reading a clock except that
the blocks are not offered there. The reason is the cache. A routine that reads
the clock produces a different command list every frame, rasterizes every frame,
and turns the cheapest actor in the game into the most expensive one, invisibly.
Motion is a step's job and cycling pictures is an animation's; a drawing says
what the actor looks like given what it currently is.

**Not a phase.** The fourteen named moments of a frame (`core/phases`) are
moments of the SIMULATION, and drawing is a pure function of the result of all
of them. `renderSnapshot` calls the routine where it calls `frameFor` today. A
fifteenth phase called `draw` would put a thing that changes nothing into a list
whose entire purpose is ordering things that do.

## When it is rasterized: hash the commands

Run the routine every frame, hash the command list, rasterize only when the hash
changes.

Running it is cheap — a few array pushes — and hashing is what this codebase
already reaches for when something is too big to compare directly:
`core/hash.ts` is FNV-1a, chosen for being short and dependency-free, and its
own header says a collision means one edit does not restart the game.

The three alternatives all lose, and it is worth recording why:

- **An explicit `redraw` block.** A learner forgets it, the label never updates,
  and nothing anywhere reports a problem. Imperative invalidation is a bug
  factory in a language whose audience is being taught what a variable is.
- **Dirty-tracking the properties a routine read.** Correct and cheapest at run
  time, and it needs dependency analysis the lab has no machinery for. It is
  also the thing that goes subtly wrong when a routine reads a property through
  a helper.
- **Rasterizing every frame.** The cliff: correct, invisible, and about two
  orders of magnitude too slow for a screen of drawn actors.

Two consequences fall out of hashing that are worth stating as features:

**Identical command lists share one texture.** Nine coins drawn by one routine
hash identically and rasterize once. The cache is keyed by the hash, not by the
actor, so this is not an optimization to add later — it is what keying by
content means.

**A constant drawing rasterizes exactly once, ever.** A label whose text never
changes costs one rasterization for the life of the game, and a health bar costs
one per distinct value it takes.

The honest ceiling: the routine still RUNS every frame, so a thousand commands
is a thousand pushes and a few KB hashed per actor per frame. That is the
budget, it is a real number, and a routine large enough to matter is a routine
that wants to be an image file.

## Text measurement, which is not in this

`draw text … anchored ⟨centre⟩` covers what anchoring covers: text that grows
from its middle, or its right edge, without anybody working out how wide it is.
That is most of what measurement is wanted for and it is resolved where the text
is drawn, so the routine never asks.

What it does not cover is sizing a box to the word inside it. That genuinely
needs a number, and the number lives in the rasterizer — which is in the driver,
behind a postMessage boundary the engine does not cross synchronously. The
answer, when it is wanted, is a metrics oracle the driver pushes into the engine
at boot, and it is the one place this design gives the renderer-agnostic engine
a renderer-shaped dependency. That is a decision worth making deliberately and
on its own.

An estimate is worse than nothing. A button sized to a wrong measurement is
visibly wrong in a way a missing feature never is.

## What comes free

**Effects.** `AppliedEffectSpec` filters an actor's image, and a drawn texture
is an image. A drawn actor takes a Tint or a Ripple with no work in either the
engine or the effect registry.

**The map editor.** A drawing reads the actor's own properties, and
`describeActor` walks every trait an actor carries and reports each writable
actor-scoped property to the inspector — which is how Tapper's `Spin:
{spin_speed: 40 + index * 35}` is edited per placement today. So a Health Bar's
`fraction` and a Label's `label text` are per-placement fields with no editor
work, and the nine coins each drawing themselves differently is the same
mechanism as the nine coins each spinning differently.

**Thumbnails.** `sendThumbnails` renders an actor's initial frame and produces
nothing for an actor without one. A drawn actor has a routine to run, so the
palette entry is the picture rather than a blank — which is the missing piece
UI_ACTORS.md listed and could not solve for a Label.

## What it takes

1. **`DrawCommand`** — a discriminated union in `engine/core`, and
   `RenderState.drawing?: DrawCommand[]` beside `frame`.
2. **`ActorBuilder.defineDrawing(width, height, run)`** and `ownDrawing`, the
   siblings of `defineStep` / `ownSteps`.
3. **`renderSnapshot`** resolves the drawing first in the appearance chain and
   hashes the command list (`core/hash`).
4. **`intrinsic size`** from the declared canvas rather than from a measured
   image, when there is a drawing.
5. **The driver** — a texture cache keyed by hash: `Phaser.GameObjects.Graphics`
   plus `generateTexture` on a miss, an Image pointing at it, and a release when
   the last actor using a hash stops using it.
6. **The blocks** — `world_define_drawing` as a root with a `do` mouth, the two
   paint setters and their two absences, five draw commands, a toolbox category,
   `ROOT_HOMES` marking it `.actor`-only, and a palette inside it that offers no
   clock and nothing that mutates.
7. **`sendThumbnails`** runs the routine when there is no frame.

Found while building, and not in the list above: `colour_picker` and its
siblings come from `@blockly/field-colour` and were registered only as a side
effect of the field plugin initializing, which happens after `standInBlocks`
asks what is registered. A type nothing defines gets a stand-in whose generator
returns `null` — so every swatch in every project file generated the literal
`null`, and `set background color` and an effect's color parameter drew nothing
along with `set fill`. Registering them at the top of `buildDomainPalette`, where
`installColorMessages` already sits, is the fix.

## What to check when it is built

- Nine actors, one routine, one texture. Count the rasterizations, not the
  actors.
- A bar whose number changes rasterizes when the number changes and not
  otherwise; a bar whose number is constant rasterizes once for the whole game.
- A drawn actor takes an effect, and the effect filters the drawing.
- A drawn actor's click box (`Can Be Clicked`) matches its declared canvas, at
  scale 1 and at scale 3.
- A routine with a `set fill` and no shapes draws nothing rather than a white
  square — the canvas is transparent until something is drawn on it.
- The palette inside `define drawing` offers no `remove actor`, no `time`, and
  no `raise`.
- `yarn setup:world` after anything in `src/engine` moves — the sandbox runs a
  prebuilt bundle, and it has caught this twice.

## What this does not solve

Text measurement, above. Layout — nothing here arranges anything relative to
anything, and a routine that wants to is doing arithmetic on numbers it declared
itself. And a drawing that genuinely wants the clock, which is the case this
deliberately refuses; if one turns up that is not better served by an animation,
it is evidence to reopen the cache decision rather than to add a block.
