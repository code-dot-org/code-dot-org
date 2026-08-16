# Interface actors, and the map editor as an interface editor

Depends on `specs/DRAWING.md`, which is where the hard part went.

## The problem

A world can tell the console `Got one!` and can tell the player nothing.

Nothing this lab draws is text. `PhaserBinding` has two cases and no third: an
actor whose appearance resolves to a frame becomes a textured Image, an actor
without becomes a green rectangle. There is no font anywhere in the tree.

So a score, a title, a countdown, "press space to start", the word written on a
button — none of them can be said. Tapper ends a click with `log ⟨Got one!⟩` for
exactly this reason, and it is the second scenario to end that way. The note
left in it, that a count belongs to something outliving the actor that raised
the event, is only half the problem: with the count in hand there is still
nowhere to put it.

## The claim

**An interface element is an actor.** Not a widget, not a second kind of object,
not a document beside the world.

Four things already in the tree say so, and none of them was built for this:

1. **The interface layer is finished.** `define layer ⟨Interface⟩` with `this
layer ⟨fixed to the screen⟩` (`blockly/layers`, `world_layer_fixed`) compiles
   to `world.setLayerFit(true, …)`, and a fit layer ignores the camera
   altogether — screen space, 1:1, never scrolls (`core/Layer`, VIEWPORT.md,
   which writes this exact worked example). A HUD is a layer. A layer's contents
   are actors.
2. **The map editor already edits an actor's per-instance properties, including
   strings.** `describeActor` walks every trait an actor carries and reports
   each writable actor-scoped property; `MapStage`'s inspector renders a field
   per property and writes `properties[ownerId][propId]` onto the placement;
   `editScalar` already has a string branch. Tapper's `Spin: {spin_speed: 40 +
index * 35}` is that mechanism in the tree today, on nine coins.
3. **Placement is placement.** Dragging a score into the top-left corner is the
   gesture that drags a coin onto a platform, on a canvas that already draws the
   dashed rectangle of what the player will actually see.
4. **Everything downstream is free.** Traits, events, `any ⟨Score⟩`, effects,
   behaviors — and `Can Be Clicked`, which is the whole of what makes a button a
   button.

The alternative is a widget tree: a second scene graph, a second serialization,
a second editor, a second set of blocks, and a second answer to every question
the first one already answers. What it would buy is layout, which this is not
offering, and for the reason given under Decisions.

## What an interface actor is made of

Three ordinary things, none of them privileged.

### `rules/writing.rule` — a stock rule with one trait and no steps

```
define rule ⟨Writing⟩  ability ⟨Shows Text⟩
  trait ⟨Shows Text⟩
    define property ⟨string⟩ ⟨text⟩      = ⟨⟩
    define property ⟨number⟩ ⟨text size⟩ = ⟨12⟩
    define property ⟨color⟩  ⟨text color⟩ = ⟨#ffffff⟩
    define property ⟨string⟩ ⟨text anchor⟩ = ⟨centre⟩
```

NAMED FOR THE MECHANIC, not for the state. A rule's name is its toolbox
category, and the toolbox already has a Text one — Blockly's, holding the string
literal and the note block. Two categories sharing a name is a toolbox a learner
has to read twice, so this sits beside `Physics`, `Collection` and `Shooting`,
which are named the same way.

No steps: nothing about text happens over time. This is a rule that exists
entirely to declare state and to be elected, which is a shape the lab permits
and has not yet used.

**Why a trait rather than the actor's own `define property`, which would be
shorter.** An actor-own property is not reachable from outside the actor's file:
`BlocklyFileEditor` passes `ownActorProperties ? [ownActorProperties] : []`, so
the generated getter and setter are in that file's palette and nowhere else. A
world's handler could never say `set text of ⟨any ⟨Score⟩⟩`, which is the entire
point of having a score.

A rule's property has no such limit — `generateRulePalette` emits
`world_set_<Rule>_<Prop>Property` wherever the rule is in play, which is why
Tapper's Mark sets `Expiry lifetime` inside a `define actor` body and its world
sets `Spin`'s speed per placement. Same class of mechanical reason as the one
that used to force text into the foundation; opposite conclusion, because
drawing removed the constraint that produced it.

Electing it also makes labels findable: `for each actor where ⟨has trait ⟨Shows
Text⟩⟩` is a sentence, with no new machinery.

### `Label.actor` — a stock actor with a drawing

```
define actor named ⟨Label⟩
  use trait ⟨Shows Text⟩

define drawing ⟨96⟩ by ⟨16⟩
  draw text ⟨text of this actor⟩ at ⟨48, 8⟩
       size ⟨text size of this actor⟩ anchored ⟨text anchor of this actor⟩
```

That is the whole file, and a learner can read it. A Label is an actor that
elects one trait and draws one thing.

### `Button.actor` — the same, plus two rows

```
define actor named ⟨Button⟩
  use trait ⟨Shows Text⟩
  use trait ⟨Can Be Clicked⟩

define drawing ⟨96⟩ by ⟨32⟩
  set fill ⟨#3050a0⟩
  draw rectangle at ⟨0, 0⟩ size ⟨96, 32⟩
  draw text ⟨text of this actor⟩ at ⟨48, 16⟩ …
```

Nothing here is new. The click, the appearance, and the handler that answers it
are three things that already exist, and a button is what happens when they are
put in one file. It is the demonstration that an interface actor is an actor.

## What is missing

**The drawing library, and effectively nothing else.** With `specs/DRAWING.md`
built, the list above is written in blocks that exist, the map editor edits it
with no editor work, the palette thumbnail is the routine's own output, and the
interface layer is already compiled.

What remains beyond it is one thing:

**A stock actor, and a way to get one.** The lab ships stock rules
(`rules/stock/`, generated from `scripts/rules/*.mjs`, imported by
`ImportRuleDialog`, which writes a `.rule` into the project), stock images, and
stock backgrounds. It ships no actors and has no way to import one. Stock UI
actors are ordinary `.actor` files, so what is needed is the dialog, shaped like
`ImportRuleDialog` and answering the same question: what does the project hold,
and what may it still take. Importing `Label` pulls `Writing` the way importing
a rule pulls its dependencies.

The other five interface elements wait on nameable things:

| actor      | what it is                     | waits on                          |
| ---------- | ------------------------------ | --------------------------------- |
| Label      | text, no picture               | DRAWING.md                        |
| Button     | a box, text, `Can Be Clicked`  | DRAWING.md                        |
| Meter      | a bar whose length is a number | DRAWING.md                        |
| Panel      | a background behind a group    | grouping, which is layout         |
| Text field | typed input                    | a keyboard the world does not own |

Three of the five arrive together, because they are the same feature seen from
three angles.

## The interface layer, restated rather than re-derived

```
define world named ⟨Tapper⟩ with ⟨6 rules⟩
  define layer ⟨Game⟩ do
    create ⟨Coin⟩ in map ⟨…⟩
  define layer ⟨Interface⟩ do
    this layer ⟨fixed to the screen⟩
    create ⟨Label⟩ in map ⟨…⟩
```

Declaration order is depth, so the interface is last and therefore on top. The
map on the second `create in map` is edited with the same editor, on the same
canvas, against the same dashed viewport rectangle — which is the whole of what
"the map editor doubles as an interface editor" means. There is nothing to build
for it beyond the Label itself.

## Decisions

**An actor, not a widget.** Stated above. The cost is that there is no layout;
the benefit is that there is no second everything.

**A stock rule, not the foundation — and the record of why this inverted.** The
first draft of this document put `text` on the Appearance trait in
`engine/rules/animation.ts`, and the argument was sound: `renderSnapshot`
resolves the appearance trait through a built-in id and cannot name a stock
rule's trait, and foundation traits are deliberately filtered out of `use trait`
(`blockly/foundation`), so a text trait an actor must elect could not be
foundational while a text trait the engine reads must be. That is a correct
reading of the code and it produced the wrong shape: every other mechanic added
here became a rule, and this one could not, for a reason with nothing to do with
text.

A drawing routine reads the actor's own properties and emits commands, so the
engine names nothing. The contradiction does not arise, the foundation does not
change, and text is a rule like gravity is.

**No layout engine, and no anchoring to the viewport.** A position is a
position. This is safe _today_ and only today: the viewport is a fixed window
(VIEWPORT.md's correction — nothing scales the game to the pane), so a label at
(16, 16) is sixteen pixels from the corner on every screen. The day the viewport
becomes resizable, every HUD in every project silently mislays itself, and that
is the day anchoring stops being optional. Naming the trigger now is cheaper
than discovering it then.

**Text over a picture is two commands.** An earlier draft made it a Phaser
Container, because the driver keeps one GameObject per actor and a button is a
picture with a word on it. In a drawing routine it is `draw image` then `draw
text`, one texture, and no Container anywhere.

**Interface actors are ordinary actors, and that is already safe.** A Label in a
world with gravity does not fall, because gravity is elected and a Label elects
`Shows Text` and nothing else. It is not collided with for the same reason. This
is not a guarantee to build; it is what election already means, and it is the
strongest single argument for these being actors.

**One Label kind per readout, until world state lands.** `set text of ⟨any
⟨Score⟩⟩ to …` works because there is exactly one, and `any ⟨kind⟩` already
exists. Two labels of one kind cannot be told apart, because a placement's id is
not something a block can name. That is a real limit, and the general answer
belongs with world-scoped state rather than here.

## What it takes

1. **`specs/DRAWING.md`**, in full. Everything below assumes it.
2. **`rules/writing.rule`** — a stock rule authored in `scripts/rules/writing.mjs`
   like every other, with one trait, four properties and no steps.
3. **`Label.actor` and `Button.actor`** as stock content, written in the drawing
   language.
4. **The stock-actor import** — a dialog shaped like `ImportRuleDialog`, writing
   an `.actor` into `actors/` and pulling the rules it elects.
5. **A colour type**, which turned out to be a type rather than an inspector
   tweak. `color` is a `PropertyType` of its own — held as `#rrggbb`, as a
   string always was — and the two places that ask what a property IS both give
   it a different answer: a block's socket takes a swatch and the getter reports
   `Colour`, so `text color` plugs straight into `set fill`; and the map
   editor draws a picker beside a hex field rather than six characters to type.
6. **A scenario** — the smallest honest one is Tapper with a score, which is
   also the first time `Got one!` becomes something the player can see.
7. **`show as`**, and per-placement thumbnails — see "Showing one, and where".
   Neither is needed to make an interface actor work; both are needed before a
   HUD of five of them can be arranged by looking at it.

## What to check when it is built

- A rule with no steps compiles, loads and can be elected. Nothing forbids it;
  nothing has done it either.
- A Label placed in a `fixed to the screen` layer does not move when the camera
  does, and a Label placed in the game layer does. Both should be possible: an
  interface and a sign nailed to a wall are different things.
- The map editor's inspector shows `text` as a free text field, and typing in it
  changes the running game. No editor work was needed, so if it does not, the
  property is not writable, actor-scoped, or non-deferred.
- A score anchored right does not walk off the screen as it grows past 9.
- A Label in the starter, which has gravity, stays where it was put.
- A Button's click box matches its drawn box at scale 1 and at scale 3.
- Two Labels of different kinds are separately addressable; two of the same kind
  are not, which is the documented limit rather than a bug.

## Showing one, and where

A thumbnail has been answering two questions at once, and nothing noticed
because they had the same answer: **what does this look like**, and **which kind
is this**. For a coin they coincide. An interface actor is the first actor whose
appearance is CONTENT-DEPENDENT, so they come apart — and they come apart
differently in each of the three places a thumbnail is drawn.

**A picker needs the KIND. The canvas needs the INSTANCE.** One image serving
both is why each is wrong in its own way.

| where                | how big               | what it should show |
| -------------------- | --------------------- | ------------------- |
| the map canvas       | the actor's real size | this placement      |
| the map palette cell | 80 by 40, name below  | the kind's picture  |
| a Blockly dropdown   | 24 by 24, no name     | a symbol            |

### The canvas wants the instance, and does not have it

`MapStage` calls `drawSprite(actor.type, …)`, so every placement of a kind is
drawn from that KIND's one thumbnail. Five Labels with five different texts are
five identical strips — in the editor whose whole claim is that arranging a HUD
is arranging actors. The inspector beside it edits each one's text; the canvas
cannot show what it just changed.

The fix is to render per PLACEMENT. `sendThumbnails` already instantiates an
actor to draw one; applying that placement's property overrides first is a
change to what it is asked for rather than to how it works, and the result keys
on the override values — the same content-keyed cache the texture cache is
(specs/DRAWING.md). A placement with no overrides shares the kind's picture,
which is most of them.

This is the piece that turns the map from a grid of grey strips into the HUD.

### The palette cell wants the picture, and has it

80 by 40 with the name printed underneath is enough room for a Label to read as
a Label. Nothing more is wanted here.

### The dropdown wants a symbol, because it can hold nothing else

`pictured` returns an image OR a name — Blockly's dropdown takes one or the
other, never both — so there is no name under a picture to save it, and the
image is 24 by 24. We own that number, and Blockly takes a width and a height,
so a 48 by 12 strip is available; the arithmetic still loses, because a 96 by 24
canvas shrunk to a menu row puts its 12px text at 6px.

So this is the surface that forces the icon, and it is the only one.

## The icon

**Elective, and the third of three tiers.** The picture where there is room; the
icon where there is not; the name when there is no picture at all, which is the
fallback `pictured` already has for a thumbnail that has not arrived. An actor
that declares nothing keeps exactly today's behaviour, so a learner never has to
meet the idea.

```
define actor named ⟨Label⟩
  use trait ⟨Shows Text⟩
  show as ⟨text icon⟩
```

**It lives in the FILE**, which is forced rather than chosen: importing a stock
actor copies the workspace into the learner's project and leaves the catalogue
entry behind, so an `icon` field on `StockActor` would vanish at exactly the
moment it was wanted. The same constraint that put `Shows Text` on a rule.

A ROW rather than a field on `define actor`, for the reason VIEWPORT.md rejected
a layer dropdown on every placement block: a field puts an authoring decision on
the first block a learner ever touches. Generating nothing, read by the walk that
already reads a file's own declarations (`ownProperties`).

**An SVG data URI, not an icon component.** Blockly's dropdown option is
`{src, width, height, alt}`, so on the surface that needs this most an icon has
to BE an image. A glyph inlined as SVG is crisp at any size and needs no font
loaded, where a component would have to be rasterized anyway. The vocabulary is
the one the lab already speaks — `config.ts` maps file kinds to Font Awesome
names, and `freeIconShims` is what happens when one of them is missing.

### Two answers rejected, and why

**"Show the name instead of the picture when the thumbnail is not square."**
Attractive because it needs no declaration and no threshold. It is a proxy for
"content-dependent" wearing a structural costume, and it mispredicts in both
directions: a Health Bar is 64 by 8 and its bar IS its identity, while a square
Button would keep a picture whose content varies. It also throws away real
information — a Label and a Button have distinct and useful appearances, and a
row of words is a worse picker than a row of pictures, which is the argument
`pictured` opens with.

**"Bake the world's backdrop into the thumbnail."** There is no world to ask. An
`.actor` belongs to none, a project may hold several with different backgrounds,
and a thumbnail is made per kind. What the palette cell paints today is
`DEFAULT_BACKDROP_COLOR` — the default, not the project's, and the code calls it
the world's backdrop, which is a guess dressed as a fact. It should say the
PICKER's ground, because that is what it is.

And any fixed ground is a guess that fails for some drawing: white text needs a
dark one, black text needs a light one. That is a further argument for the icon
being the author's choice rather than something derived — the author is the one
who knows what they drew.

## What this does not solve

The score still has nowhere to live. A Label can be told what to say, and the
thing that works out what it should say is a count that outlives the actor
raising the event — which is world-scoped state, and remains the next gap. This
document makes that gap the ONLY one between `Got one!` and a game that keeps
score; before it there were two.
