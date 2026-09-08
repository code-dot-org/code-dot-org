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
   strings.** `describeActor` walks every trait an actor carries — AND the
   properties the kind declared for itself, which belong to no trait
   (`Actor.ownProperties`) — and reports each writable actor-scoped one;
   `MapStage`'s inspector renders a field per property and writes
   `properties[ownerId][propId]` onto the placement; `editScalar` already has a
   string branch.

   The own ones were missing at first, and missing in two places at once: the
   walk was over traits, and so was the lookup a placement's overrides are
   resolved against at `loadMap`. So a property an actor kept for itself could
   not be offered by the inspector and would have been dropped in silence if
   it had been. The stock Health Bar's `subject` is exactly that property, and
   is what found it. Tapper's `Spin: {spin_speed: 40 +
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

> **Going, and the reason is the whole of the section below.** `text`, `text
size`, `text color` and `text anchor` are the LABEL's, declared in the actor
> that draws them, and everything else that shows words ACTS LIKE a Label. The
> rest of this section is the record of why it was a rule, which is worth
> keeping because the argument was right when it was made and stopped being
> right for a reason nothing about text.

```
define rule ⟨Writing⟩  ability ⟨Shows Text⟩
  trait ⟨Shows Text⟩
    define property ⟨string⟩ ⟨text⟩      = ⟨⟩
    define property ⟨number⟩ ⟨text size⟩ = ⟨12⟩
    define property ⟨color⟩  ⟨text color⟩ = ⟨#ffffff⟩
    define property ⟨string⟩ ⟨text anchor⟩ = ⟨center⟩
```

NAMED FOR THE MECHANIC, not for the state. A rule's name is its toolbox
category, and the toolbox already has a Text one — Blockly's, holding the string
literal and the note block. Two categories sharing a name is a toolbox a learner
has to read twice, so this sits beside `Physics`, `Collection` and `Zapping`,
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

## The base set, and what each one still waits on

| actor        | what it is                                        | state                                      |
| ------------ | ------------------------------------------------- | ------------------------------------------ |
| Label        | words in a space                                  | DONE; wants `new line` and a list of words |
| Button       | a Label with an edge that answers a press         | DONE; should ACT LIKE a Label              |
| Progress Bar | a bar whose length is a number                    | DONE                                       |
| Health Bar   | a Progress Bar filled from somebody's health      | DONE (acts like)                           |
| Speech Box   | a Label that lets its line out a letter at a time | DONE                                       |
| Text Input   | one line you can type in                          | a keyboard the world does not own          |
| Text Area    | several lines you can type in                     | the same keyboard, plus a caret            |
| Dropdown     | a list of words, one of them chosen               | a list property and a menu to draw         |
| Panel        | a background behind a group                       | grouping, which is layout                  |

Five of the nine are built, and the three that arrived after this document was
first written are the ones that changed what the rest should be.

**"Meter" became "Progress Bar"**, which is what everybody calls one. Its
number and the two colors it is drawn in were a rule of its own
(`rules/progress`), because `define property` in an `.actor` file used to mint
its blocks into that file's palette and nowhere else — so a bar keeping its own
fraction would have been a bar nothing in the project could fill, and being
filled by something else is the whole of what a progress bar is.

**They are the bar's own now.** An actor's properties are exported and every
actor's are in every file's palette, so `set fraction of ⟨any ⟨Progress Bar⟩⟩`
is a sentence a world can say — the change `subject` needed first, below. What
was left was a rule with three properties and no behavior at all: no steps, no
blocks, a file and a shelf row standing between a learner and three
declarations they can read in the actor that uses them. The bars that are not
this one ACT LIKE it, and the slots come across with the picture.

It is not a HEALTH bar. What fills it is a project's own handler, and health is
one of the things that might — which is what the fourth stock actor is.

**Health Bar** carries the actor it is about and asks that actor as it paints.
One property, one picture, no rule and no trait:

```
set subject of ⟨any ⟨Health Bar⟩⟩ to ⟨this actor⟩
```

WHERE IT SITS IS A SEPARATE QUESTION, and that is the design. A bar in the
corner of the screen shows the player and must not follow the player; a bar
over an enemy's head must. So position is `rules/attachment`'s, and a floating
bar is this actor with `Attached` elected too. Two intentions, two properties.

**It took three tries, and the wrong turns are the useful part.** The first
elected `Shows Progress` and came with a rule whose only job was a step writing
`health ÷ most health` into `fraction` every frame, so that the Progress Bar's
drawing could be shared — one drawing bought with a rule, a trait, a step and a
paragraph explaining why any of it was there. The second dropped the rule and
read the health straight from the drawing, which a drawing may do now, but used
`attached to` as the subject and so could not be a HUD.

The third keeps `subject` as its OWN property, which was impossible until an
actor's own properties were exported and offered in every file's palette. That
is the change worth remembering: an actor may keep a name for something without
a rule, and a rule is for what is SHARED. `text` is Writing's because a Label
and a Button and a Score all mean the same thing by it; `subject` is the bar's
because whose health it shows is nobody else's idea.

What is duplicated is nothing, in the end. A Health Bar and the jetpack's Fuel
Bar both say `acts like ⟨Progress Bar⟩` and inherit the picture, the fraction
and the colors — which is what finally made the rule redundant rather than
merely small. The one telling that cannot is a bar a WORLD defines for itself:
`acts like` names an actor file, and a single-world project has none, so
`fixtures/platformerSingle` declares the three properties and draws the shared
picture out of them (`progressBarDrawing`).

## What changed underneath, and what it makes possible

Three things arrived after the first four actors, and none of them was built
for interfaces. Together they are why the rest of the set is now writable.

**An actor may declare state, work and events of its own.** `define property`,
`each frame`, `define block` and `define event` all sit under `define actor`,
and what they mint is exported and offered in every file's palette
(`blockly/ownProperties`). The section above still argues that `text` had to be
a rule because a `define property` was reachable from nowhere else; that
stopped being true, and rules have been becoming declarations in the actors
that use them ever since — the Speech Box's typewriter (`Reveals Text`), the
Progress Bar's fraction and colors (`Progress`), and now Writing itself.

**A kind may ACT LIKE another kind** (`ActorBuilder.actsLike`). Traits,
property slots, per-frame work, handlers and the picture all come across; the
KIND does not, so a Button that acts like a Label is not one of `any ⟨Label⟩`.
That is the right way round for an interface: what a Button and a Label have in
common is what they can DO, and `any ⟨Label⟩` should not sweep up the buttons.

**An enhancement is a patch a project can be given** (specs/ENHANCEMENTS.md).
"Types out what it says" is the interface one: it hands the Speech Box's
typewriter to any actor with words.

So the shape of the set is a chain, not a list. A Label is the base; a Button is
a Label that answers a press; a Speech Box is a Label that lets its line out
slowly; a Text Input is a Label you can type into. Each says `acts like` and
adds one idea.

**Which is what finally takes the Writing rule out.** It was a rule because a
Label and a Button and a Scoreboard all mean the same thing by `text`, and a
rule is for what is shared — but a chain shares it too, and more exactly: they
mean the same thing by `text` BECAUSE they are all Labels. The trait was
standing in for a base class the language could not express.

Two things have to be answered as it goes, and both have answers already:

- **Two projects have no file to act like.** A world-local actor CAN act like
  one — `acts like` emits a call, not the `export const` that gets `define
block` refused inside a world, and a block scope takes a call quite happily
  (`__tests__/actsLike`). What the Scoreboard in the single-world starter and
  the Label in the drawing lesson lack is the FILE: both projects are defined
  as having no actor files at all, and `fixtures.test` pins it. So they declare
  the four properties themselves and draw from them, which is what
  `fixtures/platformerSingle`'s Health Bar does since `Progress` went
  (`PROGRESS_BAR_PROPERTIES`). The same shape wants the same name: a
  `LABEL_PROPERTIES` beside it.

  **A local actor may also act like a CO-LOCATED one**, which is what a
  single-world project needs: its Scoreboard and its Health Bar are both
  Labels, and without this there is no way for them to say so — each declares
  the four properties, and the duplication this page keeps removing comes
  straight back in the one project that cannot import.

  The row emits a call on the other actor's `const` rather than an import, so
  the ORDER of the definitions becomes load-bearing: a child written above its
  parent on the canvas would read a name in its temporal dead zone.
  `assembleWorldModule` sorts a world's own actors by their `acts like` edges
  — parents first, stable for everything with no parent, and a cycle left in
  its original order so the module throws naming the actor rather than the
  generator never returning. Where a block sits on a canvas is not something a
  learner should have to think about, which is the same reason local actors
  are hoisted above the world block at all.

- **`text needs a drawing` loses its subject.** `blockly/extensions/
textNeedsDrawing` warns on a `use trait ⟨Shows Text⟩` row in an actor that
  paints nothing — words nobody will see. With the trait gone the row is `acts
like ⟨Label⟩`, which BRINGS a drawing, so the warning has nothing left to
  warn about and goes with it. That is a guard disappearing because the
  mistake it caught became unmakeable, which is the good way for one to go.

What is genuinely lost is `for each actor where ⟨has trait ⟨Shows Text⟩⟩` —
"every label in this game". Nothing in the library asks it, and a kind is not
inherited, so there is no expression for that set afterwards. It is the same
cost `Progress` paid and it is worth naming twice.

## A size is a property, not a field

Every interface actor has a WIDTH and a HEIGHT, and they are the first thing
somebody arranging a dialog reaches for. Today they are two `field_number`s on
`define drawing` — typed into the block, one pair per KIND — so five Labels of
one kind are five boxes of one size, and resizing one in the map editor is not
a thing that can be expressed.

They have to be properties, and the consequences are worth writing down before
anything is built:

- **The drawing's canvas becomes per-instance.** `ActorBuilder.defineDrawing`
  takes a width and a height today and keeps them beside the routine; it would
  take the actor instead and ask it, the way the routine already asks it for
  everything it paints.
- **`intrinsic size` follows.** `World.place` sets it from the kind's drawing,
  and everything that asks how big an actor is reads it — the click box, the
  collision box, "Stays in the Map" (specs/DRAWING.md). Per-instance sizes make
  that per-instance, which is what a Button drawn wider actually needs.
- **The texture cache already copes.** A drawing is identified by what it
  DESCRIBES, so two sizes are two textures and nothing has to be invalidated.
  This is the piece that would have been hard and is not.
- **The preview has to read the declared defaults** rather than two numbers off
  the block (`actors/preview/previewDrawing`), which it now does for every
  other property.
- **Positions stay centres.** An interface library usually anchors at the
  top-left; every actor in this lab is placed by its middle, and one kind of
  actor measuring itself differently from the others is a worse surprise than
  the convention is. A box grows about its centre.

## What a Label is, once it is the base of the chain

**Words in a SPACE**, rather than a line of text at a point. That is the whole
difference between a Label and `draw text`, and it is what the width and height
buy: the words are laid into the box, wrapped to it, and anchored within it.

**A `new line` node.** Text is built by joining, and there is no way to say
"and then a line break" — so a Label can hold a paragraph only if something
else put the newlines in. One block, reporting the character, and `draw
paragraph` already breaks on it.

**A list of words joins with a space.** `words` is already a property type, and
a `text` socket handed one should read it as a sentence rather than refusing
it. That is the rule everywhere, not a Label special case: one space between
items, no trailing one.

## The three that need a keyboard

A Text Input, a Text Area and a Dropdown are the first actors that take input
the world does not have. What exists is `presses ⟨key⟩` and `releases ⟨key⟩`
(`rules/input`) — a KEY, named as the browser names it, which is not a
character: shift, dead keys, an IME and a paste are all invisible to it.

So the gap is one event carrying a typed character, raised by whatever owns the
real keyboard, and it belongs on the Input rule beside the two that are there.
Everything above it is ordinary: a caret is a property and a rectangle, a
selection is two numbers, and `when changed` is a `define event` on the actor.

A Dropdown needs one more thing — a `words` property holding the options, and a
menu drawn from it. Both halves are the actor's own; what it emits when one is
chosen is a `define event` carrying the word.

## Interface actors are a category of their own

They are used in a different context from the actors a game is made of: placed
on a fixed layer, arranged by eye, given text rather than physics, and reached
by `any ⟨kind⟩` rather than by collision. The shelf should say so — a section
in the import dialog, and a heading in the actor drawer — because a learner
looking for a Button is not looking through the same list as one looking for a
Coin.

They are the same MECHANISM, and that is the claim this document opens with.
Being a separate category is a fact about how they are found, not about what
they are.

**They wear Font Awesome glyphs**, which is already built: `show as ⟨icon⟩` is
a row in the file and `blockly/actorIcons` inlines the glyph as an SVG data URI
(see "The icon", below). The vocabulary is `text`, `speech`, `button`, `bar`,
`health`, `panel` and `input` — the last two reserved before there was anything
wearing them, which is the set this page is about finishing.

## The map editor as an interface editor

Arranging a HUD is arranging actors on a fixed layer, which the map editor does
today. What a dialog additionally needs is a way to say that a group of them
belongs together — which is the Panel row in the table, and which is layout,
and which is deliberately not being answered yet. Until it is, a dialog is a
Panel placed behind a handful of interface actors, and moving it does not move
them.

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
2. **The four text properties.** Authored as `rules/writing.rule` and being
   moved onto the Label itself — see "What changed underneath".
3. **`Label.actor` and `Button.actor`** as stock content, written in the drawing
   language.
4. **The stock-actor import** — a dialog shaped like `ImportRuleDialog`, writing
   an `.actor` into `actors/` and pulling the rules it elects.
5. **A color type**, which turned out to be a type rather than an inspector
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

| where                | how big                     | what it should show                            |
| -------------------- | --------------------------- | ---------------------------------------------- |
| the map canvas       | the actor's real size       | this placement                                 |
| the map palette cell | 80 by 40, name below        | the kind's picture                             |
| a Blockly dropdown   | 24 by 24, no name           | a symbol                                       |
| the import dialog    | 128 by 96, beside the words | the kind's picture, before the project has one |

The fourth is the odd one, and worth saying how it is answered. A learner
choosing between a Label, a Button and a Speech Box is choosing between three
pictures, and three sentences about text are not that choice — but the actor is
not in the project yet, so there is nothing to instantiate and nothing to ask
the sandbox about. So the dialog READS the drawing out of the `.actor` file it
is offering (`actors/preview/previewDrawing`) and paints it with the DRIVER'S
OWN painter (`runtime/driver/paintDrawing`, split from the Phaser textures for
this). One painter, so a preview and the game cannot disagree about what a
drawing means; what is left to drift is the reading, over a closed vocabulary of
six commands.

An actor that WEARS a picture has no drawing to read, and the dialog shows the
image the import would copy — the first cell of the strip, for one whose picture
is an animation.

A poster, not a screenshot, in one place: a Health Bar reads the health of the
actor it is pointed at, and points at nobody until a project wires it up, so its
honest picture is an empty track. The preview answers "is anybody there?" with
yes and reads the Health rule's own defaults.

That the picture has to lie is the tell. A Health Bar is not a thing but a
RELATIONSHIP — a bar, an actor with health, and a line pointing one at the
other — which is why its description carries a recipe and why importing one
gives a project a bar about nobody. Doing the whole recipe in one act is what
an ENHANCEMENT is, and it is asked for on the actor's own row rather than from
a shelf (specs/ENHANCEMENTS.md).

### And a picture is not enough for an actor that DOES something

A Platformer Player standing still is a blue sprite. What the import actually
hands over is walking, falling and jumping — three rules, a key binding and an
animation — and none of it is in the picture. That is the same problem rules
had, and it has the same answer: a recorded strip, animated by `steps()`, whose
first cell is the still (specs/RULE_DEMOS.md).

The demo is filmed the long way round, and that is what makes it worth
watching. An ACTOR demo cannot build its world with the engine directly the way
a rule demo does, because the thing under demonstration is a FILE: the scene
imports the stock actor with `importStockActor`, compiles the project with the
generator, and presses keys with `setInput`. Nothing in between is a stand-in,
so an actor that stops jumping stops jumping in its demo — and fails the
behavior test that plays the same scene (`actors/demos`).

The frame is 256 by 192 world pixels shown at half size, and the Player's own
jump is what fixed it: it rises 134 pixels from a standing start, so a scene
with a floor under it and a jump in it is about 200 pixels tall whatever else
is in it. The still rows are drawn in that same 128 by 96 box, so a list of
both does not step in and out as it scrolls.

Eight of the nine actors have one, including the Button — a demo may drive a
POINTER, drawn as a cursor in the frame, and register the handler a project
would write for the event a press raises (specs/RULE_DEMOS.md). The ninth keeps
its still: a Health Bar shows the health of whoever it is pointed at, and
nothing on the shelf has any. A still is drawn LIFE SIZE, never enlarged,
because a demo is: a Health Bar blown up to twice a Progress Bar's scene would
read as two different sizes of the same bar.

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

This is the piece that turns the map from a grid of gray strips into the HUD.

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
that declares nothing keeps exactly today's behavior, so a learner never has to
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

## The blocks that name an actor without a dropdown

Every actor dropdown draws a picture where the project has one. The two blocks
that name an actor and have no dropdown — `this actor` and `event actor` — were
the exception, and they are the two a learner most often has to hold in their
head: "which actor is `this actor` here?" is the question a handler asks and
does not answer.

They answer it now, from where the block SITS (`blockly/actorAbout`):

| where it is                                   | what it shows |
| --------------------------------------------- | ------------- |
| anywhere in an `.actor` file                  | that actor    |
| in a world hat whose subject is `any ⟨Crate⟩` | a Crate       |
| in a world's own `define actor`               | that actor    |
| in the body of `add actor ⟨Coin⟩`             | a Coin        |
| `event actor` under a hat filtered on ⟨Mark⟩  | a Mark        |
| a rule's trait step, or the toolbox           | the word      |

**The last row is what makes the rest legible.** A block that shows a picture
sometimes is only worth having if the rule for when is plain, and this one is:
you get a picture exactly when something above the block says which kind. In a
rule, `this actor` is whatever elects the trait — a different answer per project
— and a picture there would be a guess.

It also gives the hat's kind filter a second job: pick ⟨Mark⟩ on the hat and the
`event actor` below it starts showing a Mark, which says what the filter did
better than a sentence about it can.

**The picture does not replace the name.** The word beside it stays — `this
⟨picture⟩` — and the picture's `alt` is the kind, so it is read aloud as "this
Crate". The dropdowns could not do that (an option is an image or text, never
both); a block's message has room for the pair.

**The `add actor` row is the common one**, and it was the row that was missing:
a world's opening lines are `add actor ⟨Coin⟩ do: set position of ⟨this actor⟩
…`, so most `this actor`s a learner ever sees are in one of those bodies. It
takes both of the conditions the generator takes (`extensions/addActorName`) —
the block is IN the body rather than chained after it, and the `add` did not
take a name, because `as ⟨placed⟩` exists precisely so that a body can go on
saying `this actor` and meaning the actor whose file it is.

**Two traps, both paid for once.** A world's own `define actor` and an `.actor`
file's root are the same block, and telling them apart is what decides whether
the kind is the block's stamped id or the file's module path — asked the wrong
way round in an actor file, the answer is a name no thumbnail is filed under.
And a block is created before it is connected, while a SHADOW is created and
never announced, so the first ask of "what am I about" can come before there is
anything to answer with: the editor refreshes them after a load, beside the
dropdown redraw it already did for thumbnails arriving late.

## What this does not solve

The score still has nowhere to live. A Label can be told what to say, and the
thing that works out what it should say is a count that outlives the actor
raising the event — which is world-scoped state, and remains the next gap. This
document makes that gap the ONLY one between `Got one!` and a game that keeps
score; before it there were two.
