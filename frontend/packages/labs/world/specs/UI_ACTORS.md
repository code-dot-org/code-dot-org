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

## How they LOOK is a separate question — PLANNED

Everything above is about what a control is and does. What it looks like is
`specs/STYLES_PLAN.md`: the kit paints with eighteen colour literals retyped
thirty-nine times across thirteen files, square corners, a hard 2px outline on
everything, no elevation and no pressed state. The plan is tokens and named
styles in a theme file the world points at, and three small additions to the
pen — a corner radius, a shadow and a text weight — without which a theme only
changes the colour of a square.

It also records why the obvious answer does not work: a `Modern Button` that
acts like a `Button` is not one of `any ⟨Button⟩`, every placement names a
kind, and a stock actor is COPIED into the project, so there is no library to
re-theme.

## The base set, and what each one still waits on

| actor        | what it is                                        | state                                       |
| ------------ | ------------------------------------------------- | ------------------------------------------- |
| Label        | words in a space                                  | DONE; wants `new line` and a list of words  |
| Button       | a Label with an edge that answers a press         | DONE, and acts like a Label                 |
| Progress Bar | a bar whose length is a number                    | DONE                                        |
| Health Bar   | a Progress Bar filled from somebody's health      | DONE (acts like)                            |
| Speech Box   | a Label that lets its line out a letter at a time | DONE                                        |
| Text Input   | one line you can type in                          | BUILT — hint, numbers only, validity, done  |
| Text Area    | several lines you can type in                     | BUILT — Enter is a line; no wrap, no scroll |
| Dropdown     | a list of words, one of them chosen               | BUILT — `choices`, `chosen`, keyboard too   |
| Panel        | a background behind a group                       | BUILT — a Label with no words, and children |
| Toggle       | a Button that is on or off                        | BUILT — `on`, `turned on`, `turned off`     |
| Slider       | a Progress Bar the pointer drags                  | BUILT — `fraction`, `changed`, arrow keys   |
| List         | a box of words you scroll and choose one of       | BUILT — drag, arrows, page keys, Enter      |
| Scroll View  | a window onto something taller than itself        | BUILT — drag, arrows, a bar; holds a MAP    |
| Image        | a picture in a box you choose the size of         | BUILT — fits or stretches; no crop          |

Six of the eleven are built, and the three that arrived after this document was
first written are the ones that changed what the rest should be. The two new
rows, and the order the unbuilt five should go in, are argued at the end
("The rest of the toolkit").

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
over an enemy's head must. So position is the project's, and a floating
bar is this actor with its `parent` set too (specs/PARENTING.md). Two
intentions, two properties.

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
merely small. The one telling that could not was a bar a WORLD defined for
itself: `acts like` names an actor file, and the single-world fixtures had
none, so that telling declared the three properties and drew the shared
picture out of them (`progressBarDrawing`). Those fixtures are gone; every
actor is a file.

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

The first two are built that way now. What a Button adds to a Label is an edge
and `Can Be Clicked`; what a Speech Box adds is a panel and the typewriter.
Each overrides the size it inherits in a row BELOW the `acts like`, which is
what reading a file downwards should mean — and each brings the Label with it,
since `acts like` names a module path and a path naming a file the project does
not hold inherits nothing at all.

**Which is what finally takes the Writing rule out.** It was a rule because a
Label and a Button and a Scoreboard all mean the same thing by `text`, and a
rule is for what is shared — but a chain shares it too, and more exactly: they
mean the same thing by `text` BECAUSE they are all Labels. The trait was
standing in for a base class the language could not express.

Two things had to be answered as it went, and both had answers already:

- **One project has no file to act like.** What the Label in the drawing
  lesson lacks is a Label to act like: it is the only text in its project. So
  it declares the four properties itself and draws from them, the way a bar
  with no Progress Bar to act like declares `PROGRESS_BAR_PROPERTIES`. The
  same shape wants the same name: a `LABEL_PROPERTIES` beside it.

  (An actor a world defined for itself could act like a file, and like another
  of the world's own, which took ordering the definitions by their `acts like`
  edges. That model is retired; every actor is a file, and `acts like` is an
  import.)

- **`text needs a drawing` lost its subject.** `blockly/extensions/
textNeedsDrawing` warned on a `use trait ⟨Shows Text⟩` row in an actor that
  paints nothing — words nobody will see. There is no such row any more: the
  common path is `acts like ⟨Label⟩`, which BRINGS a drawing, so that way the
  mistake is unmakeable. It is still makeable by declaring the four properties
  and painting nothing — so what went is a guard on a row that no longer
  exists, and the narrower case has none.

One thing was NOT foreseen, and it is the one worth remembering. An actor may
SET its own property in its own definition chain — the Label declares `text`
and sets it to "Label" three rows later, which is an ordinary thing to write.
The declarations were emitted after the whole of that chain, so the row read a
`const` in its temporal dead zone and the module would not load: "Cannot access
'TextProperty' before initialization". It was unreachable while the four were a
rule's, because an imported name is hoisted and one declared here is not. The
assembler puts them straight after `const actor = …` now, which is the order a
world's own actor already had (`assembleActorModule`).

What is genuinely lost is `for each actor where ⟨has trait ⟨Shows Text⟩⟩` —
"every label in this game". Nothing in the library asks it, and a kind is not
inherited, so there is no expression for that set afterwards. It is the same
cost `Progress` paid and it is worth naming twice.

## A size is a property, not a field — DONE

Every interface actor has a WIDTH and a HEIGHT, and they are the first thing
somebody arranging a dialog reaches for. They were two `field_number`s on
`define drawing` — typed into the block, one pair per KIND — so five Labels of
one kind were five boxes of one size, and resizing one was not a thing that
could be said.

They are SOCKETS now, with a number shadow in each, so a fixed size is the
block a learner always dragged out and an interface actor plugs in `⟨width⟩ of
⟨this actor⟩` instead. What that took:

- **The drawing's canvas is asked of the actor.** `ActorDrawing` carried a
  width and a height beside the routine and now carries `size(actor)`;
  `defineDrawing` takes a number or a question for each and normalises. A
  literal is that same function answering the same way, so a Coin pays nothing
  for the Buttons.
- **`intrinsic size` follows it, wherever the drawing runs.** It is set at
  `place` and refreshed in `renderSnapshot` when it has actually moved, because
  the two must not drift: everything that asks how big an actor is reads the
  property — the click box, the collision box, "Stays in the Map"
  (specs/DRAWING.md) — and a Button drawn wider whose click box stayed narrow
  is a button that misses.
- **One frame's lag, in one case.** `add actor ⟨Plate⟩ do set width …` places
  the actor and then runs the body, so at the instant of placement the width is
  still the declared default and that is what `place` reads. It is right from
  the first frame. A MAP placement's overrides are applied before the actor is
  placed at all and never lag even that far, which is the case the map editor
  actually uses.
- **The texture cache already coped.** A drawing is identified by what it
  DESCRIBES, so two sizes are two textures and nothing had to be invalidated.
  This was the piece that would have been hard and was not.
- **The preview reads the sockets**, resolving a property read against the
  declared defaults exactly as it already does for the colors and the words
  (`actors/preview/previewDrawing`).
- **Positions stay centres.** An interface library usually anchors at the
  top-left; every actor in this lab is placed by its middle, and one kind of
  actor measuring itself differently from the others is a worse surprise than
  the convention is. A box grows about its centre.

There was nothing to migrate: no student work exists, and every drawing in the
lab is emitted from TypeScript, so one shared `drawingRow`
(`actors/stock/workspace`) moved all of them at once.

## What a Label is, once it is the base of the chain

**Words in a SPACE**, rather than a line of text at a point — DONE. That is the
whole difference between a Label and `draw text`, and it is what the width and
height buy: `width` and `height` are the Label's own properties, the drawing is
sized from them, and the words are laid into that box with `draw paragraph`,
wrapped to its column. Two Labels of one kind are two boxes. Everything that
ACTS LIKE a Label is sized the same way, which is most of this page.

The anchor still decides how the words sit about the box's MIDDLE rather than
within its edges — `center` centres them, `right` ends them there, which is
what a score counting up wants. A block of several lines is centred as a block,
which the painter already did for any vertically-middled anchor.

**Saying a paragraph in blocks** — DONE. Concatenation was `text_join` and a
mutator: a bubble to open, two sockets to count, and a block whose shape is
edited rather than read. Every string block now carries a socket for whatever
comes next, so text is CHAINED in the order it is read; `new line` is that same
block with a break in it, and `“ ⟨any value⟩ ”` is the door into a chain for
everything that is not already words.

**The chain takes strings only, and that is the point.** A socket that took
anything and stringified it would make `"n = " + 1 + 2` say "n = 12" and
`1 + 2 + " left"` say "3 left" — the same three links, joined in the order they
are read, meaning two different things. A chain of strings cannot do that, and
the one place a value becomes words is a block somebody put there.

**The chain socket is an OUTER PIP**, not an inline one, which is what keeps a
line flat: an inline input draws the next block INSIDE this one, so three links
would be three nested boxes.

`as text` is the exception, and not by preference. `inputsInline` is a fact
about a BLOCK rather than about an input, so this one cannot have its value
sitting between the quotes AND its chain hanging off the right edge — Blockly
offers no per-input control, and `EndRowInput` breaks a row without making an
inline input external. Of the two shapes available it takes the one where the
value reads as quoted words; the cost is that a chain continuing past an
adapter nests by a level, which is only paid when one is in the middle of a
line rather than at the end of it.

`text_join` is gone from the drawer. Two ways to join two words is one more
than a drawer should hold, and every place that held one — the starter, three
fixtures, a lesson, an enhancement, a tile's unlock and the list of what each
lesson asks for — says the same thing as a chain now. It is Blockly's own
block and stays registered, so a file that somehow holds one still loads.

**A list of words joins with a space** — DONE, in the one place a value becomes
words. `“ ⟨a list⟩ ”` reads `["to","the","left"]` as "to the left", where
`String` would write it with the commas of an array — a comma nobody asked for
and nothing can remove. A list of words IS a sentence here; `the words in ⟨…⟩`
hands one back.

It is a function rather than a line in the block (`engine/core/textValue`), so
that "how is this written down" has one answer: anything that later has to say
a value out loud says it the same way. Lists nest into one sentence, and
nothing else is special — a number is its digits, and an actor is whatever
`String` makes of it, which is the honest answer to a question nobody should be
asking a picture.

## The three that need a keyboard

A Text Input, a Text Area and a Dropdown are the first actors that take input
the world did not have. What existed was `presses ⟨key⟩` and `releases ⟨key⟩`
(`rules/input`) — a KEY, named as the browser names it, which is not a
character: shift, dead keys, an IME and a paste are all invisible to it.

**The event is built.** `⟨a⟩ is typed` on the Input rule, `types ⟨a⟩` under its
trait, and `for each character typed ⟨c⟩` for a step that wants the lot — the
same three shapes the key events already have. The DOM says plainly which
keystrokes made a character (`key` is one character exactly then, and a word
like "Shift" or "Backspace" otherwise), so the driver forwards those and leaves
the rest to the key events. Neither pretends to be the other: a control scheme
wants the key, a text field wants the character, and `a` with shift held is the
key `a` and the character `A`.

What the world keeps is a QUEUE, not a set, and it is DRAINED each tick. A key
is held or it is not, so a set answers everything about one; typing is a
sequence — "aa" is two characters and "ab" is not "ba" — and a character has no
state to compare against, it simply happened. Carried forward it would be typed
again on every frame after the one it was meant for.

**The Text Input is built on it** (`actors/stock/textInput`), and two things
about it were not obvious.

**The caret is an index, and everything else about editing is arithmetic on
it.** `caret` counts the characters BEFORE the insertion point, so typing
inserts there, backspace takes the one before it, delete takes the one after
it, and the arrows walk it. It was the end of the text and nothing else, which
reads as a text field right up until somebody wants to fix a typo in the middle
of what they typed.

**Clicking into a word is what the measuring seam was built for.** Where a
click landed, in LETTERS, is a mouse handler's question asked in the frame it
is asked in — no drawing could answer it, and a proportional font has no
character width to divide by. The scan walks the prefixes, asking for the width
of the first one character, the first two, and stops at the boundary NEAREST
the click; the midpoint is said without a division, as `w(n) + w(n+1) ≤ 2x`.
Clicking the right half of a letter puts the bar after it, which is what every
text field does. One measurement per character, of a line short enough to fit a
field, once per click.

**And the words slide to keep the CARET in the box**, which is not the same as
keeping the end in it: a caret walked back to the start of a long line has to
bring the line with it. Three cases, each one comparison — the bar is off the
left, the bar is off the right, or there is slack at the right and the words
should come back. The third is what stops a field staying scrolled after its
text is deleted, which the two-case version did, because it only ever pushed
left.

**Focus was a CLEAR and then a SET, in one frame** — and that was the Text
Input deciding for itself whether it was being typed at. It worked, by leaning
on an ordering the Mouse rule already guaranteed: `presses mouse button`
reaches every actor that takes mouse input wherever the pointer is, and `is
clicked with` reaches only the ones under it, announced afterwards in the same
step (`rules/mouse`, `buttonEvents`). So every field let go on any click and
the one clicked on took over.

It does not survive a keyboard. Tabbing between fields is not a thing any one
field can work out, and neither is "which field has it" — those are facts about
the SCREEN. So focus is a rule now.

## `Tab Navigation` — one actor at a time holds the keyboard

`rules/tabNavigation` (`scripts/rules/tabNavigation.mjs`). An actor elects
**Can Be Focused** and gets:

- **`focused`**, a boolean, READ-ONLY. Nothing outside the rule writes it.
- **`tab order`**, a number, everybody's zero. `ordered by` is a stable sort,
  so leaving it alone is not a tie nobody breaks — it is placement order, which
  is the order somebody laying out a form worked in.
- **`gains focus`** and **`loses focus`**, so an actor can react rather than
  poll.

Five blocks move it, and they are the only five. **`⟨actor⟩ take the focus`**
is the one everything else is built on — a field calls it when it is clicked.
**`drop the focus`** is Escape. And three name the route: **`focus the first
control`** (what arriving at the game is, and what a game says when it opens a
form), **`focus the next control`** (Tab), and **`focus the previous
control`** (Shift+Tab). The last three are worth being blocks rather than
steps because a project says them too — a Next button on a wizard is the same
statement Tab makes.

`focus the previous control` walks FORWARDS remembering the one behind, which
looks like the long way round and is the only way that works: the ordering is
stable, so reversing the key leaves actors sharing one in the order they were
added, and a form where nobody set `tab order` would run backwards exactly as
it runs forwards. It also does not stop early, because the wrap is to the LAST
control and the only way to know which that is is to reach the end.

The property being read-only is what makes the set worth having: the events are
raised in one place, in one order, and cannot get out of step with the property
that describes the same fact. `take the focus` on an actor that already has it does
nothing at all, so a click handler firing every frame does not raise a loss and
a gain per frame.

Tab walks the ordered list to the first actor AFTER the one holding it, and
wraps. Arriving from nothing is the same branch as wrapping, because it is the
same move. It reads the keyboard's edges straight off the World rather than
through the Input rule's events, so it requires no other rule.

The Text Input is on it: it elects `Can Be Focused`, reads the rule's
`focused`, and its click handler is one `take the focus` where it used to be a
clear on every field and a set on this one, ordered against each other.
Clicking the background no longer blurs — Escape is the release, everywhere,
and a field that also blurred on any press would raise a loss and a gain every
time the focused field was clicked.

**The Button is a control too.** It elects `Can Be Focused` and
`Takes Keyboard Input`, takes the focus when it is clicked, draws a ring while
it holds it, and answers Enter — and what Enter does is RAISE THE CLICK
(`emit is clicked with ⟨left⟩ for ⟨this actor⟩`). That is what keeps a
project's one handler enough: `when ⟨Start⟩ is clicked` fires for the mouse and
for the keyboard, and nobody writes it twice. The click says the LEFT button,
which is not true and is the least wrong answer available — the event carries
which mouse button was used, a keyboard press used none, and every browser
reports the primary one for exactly this case. A handler filtering on `right`
therefore does not fire from the keyboard, which is right.

The ring is drawn INSIDE the face, with the fill cleared first. Outside is
where a focus ring usually goes and is not available: the canvas is exactly the
actor's size, so anything beyond it is clipped away. Leaving the fill on would
paint a rectangle over the word, which reads as the button going blank rather
than as it being chosen.

**Both are on the shelf now**, granted together by `story/form` — past the tile
that put a Button on the screen, because the question a game asks after "which
answer did you click" is "what did you type". Shelving them needed one piece of
machinery: a check that can TYPE. `TraceStep.type` delivers characters once at
the start of a stretch and lets its first frame drain them, which is what a
pair of hands typing and then waiting looks like; scripting a field with `hold`
would have been scripting something the browser never does.

**A rule that is not on the shelf cannot be imported by reference.**
`importStockRule` writes a `.rule` file holding a REFERENCE, and
`resolveRuleContents` looks a reference up in `STOCK_RULES` — so a rule the
shelf does not list resolved to the empty string, and the project got a file
with nothing in it. Nothing downstream noticed: an empty workspace parses to no
metadata, the generator emitted `export {}`, and the world built with an
undefined rule in its list. `ruleFileContents` now writes a reference where one
would resolve and the rule whole where it would not.

### Tab is only the game's while the game is using it

The policy, and it is an accessibility contract rather than a convenience:

- The game claims Tab (preventDefault) only while some focusable actor holds
  the focus. While nothing does, Tab is the page's and moves the reader on past
  the canvas, so the game is never a keyboard trap.
- **Escape is reserved and no game may bind it.** It drops all focus, which is
  what releases Tab again. That is the way out, and it is why Escape cannot
  also be a game's pause key.
- Tabbing ONTO the game from elsewhere on the page focuses the first focusable
  actor in it. Clicking onto it does not — a click says where it landed.
- The element announces this to a screen reader on arrival.
- **A control may say it never takes the keyboard.** `takes the keyboard` is
  true for everybody; a control that turns it off is one the pointer presses
  and the route skips, and `take the focus` refuses it. It exists for the keys
  of the on-screen keyboard (specs/KEYBOARD_PLAN.md), which must not take the
  typing away from the field they are filling — and skipping them in the route
  is right on its own terms, since somebody tabbing has a keyboard already.
  The refusal lives in `take the focus` rather than in each caller, because the
  Button that calls it is on the shelf and a map that places one cannot edit
  it. Skipping them is not optional either: a Tab that stopped on such a
  control would call `take the focus`, have it do nothing, and leave the focus
  where it was — a hole in the route that swallows it.

How it is built, in three pieces:

**The world says which keys it wants.** `capture the ⟨tab⟩ key` and `release
the ⟨tab⟩ key` (`World.captureKey`), read by the driver alongside its own
`SCROLL_KEYS` floor. That floor was the whole mechanism before — arrows and
space, hard-coded — and it could never have expressed Tab, because whether the
game should have Tab is a fact about the MOMENT rather than about the game.
`World.captureKey` refuses `escape` outright (`core/keys`, `RESERVED_KEYS`)
rather than trusting every rule that will ever be written.

**Arriving is its own moment.** `the game just got the keyboard`
(`World.gainedKeyboard`), true for one frame and drained by the tick like the
typed characters. Nothing in the pressed keys can stand for it: the Tab that
carried the player onto the canvas was pressed while the page still had the
keyboard, so a Tab edge inside the game means "move on" and an arrival means
"come in", and they are indistinguishable to `for each newly pressed key`. The
driver reports it from the element's `focus` event, and suppresses it when the
focus came from a `pointerdown`.

**The rule does not answer Tab unless something is focused.** This is the half
that is easy to forget and invisible when it is wrong: a rule that always moved
the focus on would pass every ordinary test and pull a player straight back in
the moment they pressed Escape to leave.

The game's element carries `role="application"` — honest, since it takes the
arrows and space, and a screen reader treating it as a document would eat them
— and an `aria-label` naming both halves of the contract. The label is
unconditional rather than derived from whether the world has any focusable
actors: it is read at the moment of arrival, which is before anything has
captured anything, and a game with no controls simply tabs straight back out,
which is what the sentence already implies. A page that labelled the element
itself keeps its own label.

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

**Tried, on the Interface Kit, and three things were wrong** — each a claim
this document made that turned out to be about the game and not the editor:

- **A placement was drawn as its kind.** The sandbox draws a placement by
  instantiating its kind and setting its overrides, and looked each one up in
  the actor's TRAITS. A Label's `text` belongs to no trait, so every Label on
  a map drew the kind's default words; the game had the same hole and had
  already closed it (`World.loadMap`). One lookup, shared now
  (`runtime/placementOverrides`).
- **A placement was drawn, outlined and hit at its kind's size.** The sandbox
  published a size per kind and nothing per placement, so a Label made 200
  wide in the inspector was a 200-wide Label in the game and a 96-wide one on
  the canvas — which made the width field look inert. A placement that earns
  a picture of its own earns its size with it
  (`ThumbnailsReadyMessage.placementSizes`), and the stage asks for the
  placement's before the kind's.
- **The palette drew the thumbnail.** Every other picker asks for the
  elected symbol first and the picture second; this one asked for the
  picture alone, and a Label's picture is its content. It asks in the same
  order now, reading the icons out of the files rather than the registry the
  Blockly editor fills, since a map may be the first tab opened.

**And a fourth, once those were fixed: the right picture arrived a rebuild
late.** A placement's picture is keyed by its content, so the first keystroke
in the inspector gave it a key nothing had painted, and the stage drew the
kind's picture until the sandbox answered — which it did only after a whole
compile, because the manifest it draws from imports the world, the world
imports its maps, and the compile is content-addressed. Two changes:

- The stage remembers the last picture it drew for each placement and keeps
  drawing it until the new one arrives (`stageGeometry.rememberedPicture`).
- The manifest compile sees every `.map` as an empty one
  (`thumbnailManifest.manifestFiles`). Nothing the sandbox draws from the
  manifest reads a map, so a map edit is now a cache hit and a picture costs
  the round trip and the paint. Which is cheap enough to ask for while
  typing: the stage reports the document under edit and the editor asks a
  breath after the last keystroke.

**And the picture that needs no sandbox at all — built.** The reader the
import dialog used for a stock actor's preview was widened to any project
actor and to a placement's overrides (`actors/preview/drawingReader`), and
the map editor paints with it in its own window, on the keystroke
(`mapEditor/localPictures`). It works because a `define drawing` cannot SET
anything: it reads properties and emits shapes, so reading the rows against
the placement's values is running it. The reader says whether it met a block
it did not know — the Text Input's caret reads the time — and the sandbox is
asked only for those, and for kinds that wear a picture. The inspector also
stops offering `sprite` and `animation` for a kind that draws itself, since a
drawing makes them inert.

What remains true is the coarse thing: positions snap to tile centres unless
Alt frees them, and a form is not laid out on a 32-pixel grid.

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

**No layout engine, and no anchoring to the viewport.** ANSWERED since, and
by exactly the trigger this paragraph names: specs/ANCHORS*PLAN.md. A
placement may hold on to one of nine named places, measured at load against
the window it is loaded into. The rest of the paragraph is what was true
before it. A position is a position. This is safe \_today* and only today: the viewport is a fixed window
(VIEWPORT.md's correction — nothing scales the game to the pane), so a label at
(16, 16) is sixteen pixels from the corner on every screen. The day the viewport
becomes resizable, every HUD in every project silently mislays itself, and that
is the day anchoring stops being optional. Naming the trigger now is cheaper
than discovering it then.

The window is a WORLD'S now rather than the lab's — `set size of view`
(VIEWPORT.md) — and the Interface Kit is the first to say so, ten tiles wide
by eighteen tall, the shape of a phone. That does not pull the trigger: a
world's view is fixed for that world, so its positions still hold. What would
pull it is one interface shared between two worlds of different shapes, which
is exactly what a stock interface MAP is (below, "The rest of the toolkit").

**Text over a picture is two commands.** An earlier draft made it a Phaser
Container, because the driver keeps one GameObject per actor and a button is a
picture with a word on it. In a drawing routine it is `draw image` then `draw
text`, one texture, and no Container anywhere.

A panel and its buttons are the one case that does want a Container, and
parenting gives it one (specs/PARENTING.md, PROPOSED): an actor with
children becomes a Container holding its own image and its children, so the
panel's opacity and effects apply to the group as a layer's do. Each actor
is still one image of its own inside it.

**Interface actors are ordinary actors, and that is already safe.** A Label in a
world with gravity does not fall, because gravity is elected and a Label elects
`Shows Text` and nothing else. It is not collided with for the same reason. This
is not a guarantee to build; it is what election already means, and it is the
strongest single argument for these being actors.

**One Label kind per readout, or one NAME per readout.** `set text of ⟨any
⟨Score⟩⟩ to …` works because there is exactly one, and `any ⟨kind⟩` already
exists. Two labels of one kind are told apart by the name their map gives each
placement: `set text of ⟨the actor named Score⟩ to …` (MAPS.md, "A block
naming a placement"). A readout with no map — one an `add actor` block makes —
still needs a kind of its own, and world-scoped state is still the general
answer for a value several things read.

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

**One trap, paid for once.** A block is created before it is connected, while
a SHADOW is created and never announced, so the first ask of "what am I about"
can come before there is anything to answer with: the editor refreshes them
after a load, beside the dropdown redraw it already did for thumbnails
arriving late.

## What this does not solve

The score had nowhere to live when this was written. A Label can be told what
to say, and the thing that works out what it should say is a count that
outlives the actor raising the event — which is world-scoped state, and was the
next gap. It is built (specs/WORLD_STATE.md), so nothing now stands between
`Got one!` and a game that keeps score except somebody writing the two rows;
that is the "score readout" entry below, and the reason it is a recipe rather
than an actor.

## The rest of the toolkit — PROPOSED

Nothing in this section is built. It is what a survey of the six actors on the
shelf, the three rows the table still owes, and what the engine now offers came
to, written down so the order is a decision rather than whichever one is asked
for first.

### What is already there to build on

The reason most of this is cheap. Drawing has a rectangle, a circle, a line,
text, a paragraph and an image, a size that is a property and a color that is
a type. An actor declares its own properties, events and actions, and `acts
like` hands a drawing down. Focus is a rule with Tab, Enter and a read-only
`focused`; the Mouse rule raises a press, a release and a click and answers
`mouse position` and `mouse button ⟨left⟩ is down`; typed characters arrive in
a queue. Lists exist as a drawer, without `item ⟨n⟩ of` and without a
list-typed property on an actor (specs/LISTS.md). A world keeps state of its
own, and `define choices` names a closed set of words (specs/ENUMS.md).

Two of those are the gaps the harder rows fall into, and they are named below
where they bite.

### The rows, in the order to build them

1. **Panel — BUILT** (`actors/stock/panel`). A box behind a group: a fill,
   an outline, and the Label's box and words with the words left empty; it
   ACTS LIKE a Label so a dialog's background and its title are the same
   shape of thing. What the table deferred as "grouping, which is layout"
   is answered by PARENTING (specs/PARENTING.md): the Interface Kit's form
   is a Panel with the title, the field, the button and the bar as its
   children, stored in the Panel's frame, and the map editor drags them as
   a group. Unlocked with the Button, since a question is a Panel with a
   line and two Buttons on it.

2. **Toggle — BUILT** (`actors/stock/toggle`). It acts like a Button, so
   the click, the focus and Enter come across with the Button's own
   handlers, and adds a boolean `on` that the click flips and two events,
   `turned on` and `turned off`, so a project reacts rather than polls. Its
   face is a caption and a switch whose track colours and whose knob slides
   with `on`, all read off the actor by the drawing. It is not the Switches
   rule's `Is a Switch`, which is a thing in a LEVEL that a player stands on;
   this is a control on the screen. The Interface Kit's dialog carries one.
3. **Slider — BUILT** (`actors/stock/slider`). It acts like a Progress Bar
   and elects `Can Be Clicked`: a press marks it held and jumps the fraction
   to the press, and a step follows the pointer each frame while `mouse
button ⟨left⟩ is down`, letting go when it comes up. There is no drag
   event and none was needed. `changed` is its own event, raised when the
   fraction moves; the arrow keys nudge it once it holds the focus. It has
   its own `width` and `height`, since a bar eight pixels tall is a poor
   thing to catch. The Interface Kit's dialog carries one.
4. **A score readout — ALREADY BUILT**, as a recipe: the `scoreboard`
   enhancement (`actors/enhance/scoreboard`) writes a Scoreboard kind that
   acts like a Label, elects `Watches the Score`, rewrites its words when
   the score changes, and places it on a fixed Interface layer. A kind of
   its own rather than the stock Label pointed at, because a hat names a
   kind and `any ⟨Label⟩` would rewrite every label in the project.
5. **Dropdown — BUILT** (`actors/stock/dropdown`). Of the two gaps it was
   said to need, one had already closed and the other was one block. An
   actor could already declare a `words` list (`define property` offers the
   list types), so `choices` is the Dropdown's own; what was missing was a
   way to read the third word, and `item ⟨n⟩ of ⟨list⟩` is the block that
   drawing the rows and answering a click both needed (specs/LISTS.md). The
   menu grows when it opens — the height is a property, and opening sets it
   and shifts the actor down by half the growth so the face stays put — and
   a press anywhere else closes it, since the Mouse rule announces a press
   to everything before it announces a click to what is under the pointer.
   Enter and the arrows do the same from the keyboard. The map editor edits
   a placement's `choices` a row at a time, with Add and Remove — the first
   list a placement wanted to hold, and the inspector's list editor came with
   it (`MapStage`). What it leaves open: the open menu's rows are read by the
   drawing reader as incomplete, so the editor shows the sandbox's picture
   for an open one.
6. **Text Area — BUILT** (`actors/stock/textArea`). A Text Input with
   lines, and a line is a newline in the words: Enter is the one key that
   inserts something, `draw paragraph` breaks on it in a column of zero so
   nothing else breaks, and the caret's line and column are counted from the
   newlines before it with Blockly's own `count` and `find last`. Up and
   down keep the column where the line above or below has room. Two things
   the Text Input does that it does not: a click puts the caret at the end
   rather than in the word, since which line was clicked is the prefix scan
   over one line of several and a first cut that scans the wrong line is
   worse; and nothing scrolls — long lines and long paragraphs are clipped.
   Both are the next things to add.

### The second axis: stock interface MAPS — five of them are built

The pause menu is on the shelf (`maps/stock`, `maps/importStockMap`): a
`.map` placing a Pause Menu panel and two plain Buttons named Resume and
Quit, imported whole with the two actor kinds, from the `load map`
dropdown's `(import…)` row or the Maps folder's menu. Breakout uses it — P
pauses and loads it, and what follows is below. What building it found:

- **A menu needs the game to STOP, and that is the engine's.** `pause the
game` runs the `sense` phase and nothing else, so keys and clicks still
  become events and every handler still runs, while nothing moves, falls,
  collides or animates until `resume the game` (`World.pause`). A menu is
  buttons, and buttons are events; the interface actors that do work each
  frame — a slider following the pointer — stop with the rest, which a
  pause menu does not mind.
- **The menu speaks, the world decides.** The Pause Menu is a Panel with two
  own events, `resumed` and `quit`. Its buttons are plain Buttons, told
  apart by the NAMES the map gives them. The menu's file holds a hat for
  each: when `the actor named Resume` is clicked, emit `resumed` for the
  parent of this actor (MAPS.md, "A block naming a placement"). So a
  project answers the MENU — `when ⟨any Pause Menu⟩ resumed` — rather than
  every Button in the game, and the buttons can be moved anywhere on the
  map without rewiring. What "quit" means is the project's: breakout clears
  the world and loads its level again. The first cut made Resume Button and
  Quit Button kinds of their own, because a kind was the only thing a hat
  could name; two actor files whose whole content was a caption and one
  handler were the cost of that, and the named-actor block replaced them.
- **Removing the panel removes the menu**, buttons and all
  (specs/PARENTING.md), which is the whole of what "take the menu away" costs.
- **A map has no layer of its own.** `load map` in a handler puts the menu on
  the layer the block is in, which for a handler is the default one; a game
  with a camera wants it on a fixed layer, and a `load map … into layer`
  form is the next thing this asks for. Anchoring is still deferred: the map
  places the menu at the standard window's middle, and a project with
  another view moves it in the map editor.

INTERFACE.md already says what a menu is: a map, loaded on top of the level or
into a world of its own. A title screen, a pause menu, a dialog box and a HUD
are each three or four of the actors above, arranged — and arranging them is
what the map editor does. Shipping THOSE, as stock content the way rules and
actors are, would flesh out a toolkit faster than more single actors, because
a learner reaching for "a pause menu" is not reaching for a Panel.

It is also the case that forces the two questions this document has deferred:

- **Grouping.** A dialog map moved as one thing is a Panel and its children
  (specs/PARENTING.md), tried on something real.
- **Anchoring — DONE** (specs/ANCHORS_PLAN.md), and the guess below was
  right: an anchor on the interface layer's placements, not on the actors.
  A HUD map shared between a square world and the portrait one
  is the first interface that lands on two windows of different shapes, and a
  score at (304, 16) is in the corner of one and in the middle of the other.
  That is the trigger named under "Decisions", pulled by a real case rather
  than an imagined one, and it should be answered then: probably an anchor
  property on the interface layer's placements, not on the actors.

The import for a map is built (`maps/importStockMap`): a stock map is a `.map`
file plus the actors it places, so the import walks the actors first — each
walking its own rules and pictures — and writes the map last, never over one
the project already has.

**The second stock map is the on-screen keyboard** (specs/KEYBOARD_PLAN.md):
`maps/keyboard`, a Panel holding five rows of Buttons, anchored to the bottom
of the window. It is the case that proves the axis, because it is plainly a
LAYOUT and not a control — a `Keyboard` actor would have had forty captions
and a grid inside it, and a project could not have moved one key.

What building it found, both of which are about a frame rather than about
keyboards:

- **What the world types belongs to the NEXT frame.** A key's handler runs at
  the event flush, which is after the step that reads what was typed and before
  the drain at the end of the tick — so a character added the driver's way
  would be cleared without ever being read. `type ⟨…⟩` and `press the ⟨…⟩ key`
  queue for the following frame, which is honest: a click IS a frame late.
- **A key must not take the focus.** A Button takes the focus when it is
  clicked, and here that takes the keyboard away from the field the keystroke
  was meant for. `Tab Navigation` grew `takes the keyboard`, true for
  everybody and off on each key — which also keeps forty keys out of the tab
  route, where they have no business.

**And three more that modality made possible** (`maps/confirm`, `maps/tabs`,
`maps/message`). Each is a Panel and some Buttons placed, and each speaks only
through its OWN events — a confirm does not know what it is confirming and a
tab bar does not know what screens the project has, so the same map serves
every use of it.

- **Are You Sure?** is modal, which is the whole point of a confirm: while the
  question is up, the thing it is asking about cannot be clicked again. Before
  a map could say that, this would have been a panel you could click past.
- **Tab Bar** is not, and does not unload itself — a tab bar is the one thing
  on screen that stays. It says WHICH tab by the word on it rather than
  declaring an event per tab, so adding a fourth tab is adding a Button. That
  is also the first stock map whose own event carries a value, which needed its
  workspace to hold a variable like an actor file's.
- **Message** is not modal either: a message that stopped the app being used
  would be a dialog, and the one above already is. It is dismissed BY HAND,
  and that limit is the map format's — `each frame` lives in a trait, a
  world's own `define actor` or an `.actor` file, and not in a map's script,
  so a map cannot time anything. The project loads it and takes it away.

And what the keyboard did NOT need: no field is named anywhere on that map. Every key
raises what the real keyboard raises, so a Text Input, a Text Area and a
project's own `types ⟨character⟩` handler all fill from it unchanged, and a
form of three fields needs no wiring at all — whichever one has the focus is
the one already listening.

### A screen over a screen is modal — BUILT

A dialog takes the clicks, and nothing here said so until the first app had a
key on its on-screen keyboard also pressing the button on the screen behind
it (specs/APPS.md). Now a map says whether it covers what is under it, and
input stops at the topmost one that does — clicks, the tab route and the
typing alike (specs/MODALITY_PLAN.md).

The shape worth remembering is that it is NOT "the topmost map wins", which
is wrong by exactly one case: the on-screen keyboard is loaded OVER the form
it fills, and a rule that measured from the top of the stack would lock out
the field it exists to type into. So a map declares it, and a keyboard
declares it does not.

The pause menu is a screen and always was; it got the flag for one line. That
also closed something `pause the game` never promised — a paused game still
turns clicks into events, so the level's buttons were live underneath a menu
asking whether to quit.

### Showing more than fits — BUILT

`actors/scrollView` (specs/SCROLLING_PLAN.md). The clip decided the design: a
mask is a no-op in this Phaser, so anything that clips OTHER actors is a
camera, and the thing with a camera of its own is the Viewport. A scrolling
container is a Viewport plus a way to say where it is scrolled to — `scroll`
and `content` on the trait, converted to the camera and clamped by the same
`settleSpace` that already kept a level's camera inside its map.

The clamped answer is written BACK, which is the part to remember: a project
that scrolls past the end reads where it actually stopped, so a bar drawn from
it cannot run off its track.

It is not a List and knows nothing about rows. **A list whose rows are ACTORS
is this with a map of rows in it** — which was the open question this table
has carried since the List was built, and it is answered by building nothing
further.

### Every one of them has a box, and now they share one — BUILT

Nine of the actors above are a width and a height with something drawn in
them, and they had those two numbers by ACTING LIKE a Label. A Button is not a
kind of Label; it inherited one because `width` happened to live there. The
two kinds that could not act like a Label — the Slider and the Image — each
grew a `width` of their own, so one idea had three properties.

`Has a Box` is a trait now, on a foundation rule in play in every world
(specs/BOXES_PLAN.md). The Label elects it and the eight kinds that act like a
Label inherit the election, so only the Slider and the Image had to say it
themselves. The box is in nobody's own-property ledger any more.

It exists for the map editor: a resize handle wants ONE question — does this
placement have a box — and one pair of properties to write.

### A picture in a box — BUILT

`actors/image`. Any actor could already show a sprite; what none of them was
is a picture laid out with the rest of an interface — a thumbnail in a row, an
avatar beside a name. That wants a BOX the project chooses, with the picture
made to sit in it whatever size the file happens to be.

The fitting is SCALE, because that is the only thing the engine offers: an
actor is drawn at its intrinsic size times its scale. So **fit** takes the
smaller of the two ratios on both axes and keeps the picture's shape, and
**stretch** gives each axis its own and fills the box exactly.

**And not CROP**, which is what an avatar usually wants. Cropping means drawing
outside a box and clipping it away; a mask is a no-op, and the two things that
clip cannot clip a texture — a Scroll View clips ACTORS and a drawing clips
what the drawing drew. An Image that crops is a Scroll View with one picture
in it, and is not worth a stock actor until somebody wants one.

**It is the one boxed interface actor that does NOT act like a Label**, and
the reason is worth remembering: `acts like` brings the Label's DRAWING, and a
drawing wins over a sprite when an actor has both
(`World.renderSnapshot`). An Image that acted like a Label drew a
label-shaped rectangle and never showed its picture. So its width and height
are its own — which reads better anyway: an Image is not a Label with a
picture in it, it is a picture with a box around it.

### A hit box turns with what it is on

A box test only works in the BOX's own frame. The pointer test compared screen
distances against half the actor's size, which is right for an actor square on
and wrong for every other one: a button turned forty-five degrees kept a hit
box still square to the screen, so it answered clicks outside itself and
ignored clicks on its own corners.

Rotating the OFFSET into the actor's axes is the whole fix, in the one shared
helper both pointer rules read (`rules/pointing`, `under`), so a press and a
drag were corrected together. It is the same arithmetic the map editor's
resize does in the other direction (`mapEditor/rotatedResize`) — which is what
made the bug findable: the editor grew rotation handles, somebody turned a
button, and the clicks stopped landing.

### …and so does what a gesture MEANS to it

The hit box was half of it. A rotated actor was then pressed correctly and
still behaved as though it were square on, because what a drag MEANS was
measured on the screen's axes too. A Slider stood on end — which is the
ordinary reason to turn one, a volume fader runs up and down — could only be
dragged sideways, along an axis it no longer had.

Two fixes, on one principle: **an event about an actor carries the actor's
frame.**

- `is dragged by ⟨movement⟩` now carries the movement in the subject's own
  axes (`rules/gestures`). `the screen is dragged by` keeps the screen's, and
  that is the line — it is about nobody, so there is no frame to be relative
  to.
- The Slider reads where the pointer is ALONG it rather than along x
  (`actors/stock/slider`). Upside down falls out for free: a half turn makes
  the cosine negative and the fraction runs the other way, which is what the
  thing on screen looks like it should do.

The general lesson is worth keeping: rotation is not just how a thing is
DRAWN. Every question of the form "where is the pointer relative to this" has
to be asked in that thing's frame, and there were three such questions —
what was pressed, how far a drag moved, and where along a control the pointer
is. All three were wrong in the same way and none of them was noticed until
the map editor could turn something.

### What a phone-shaped kit does not yet answer

The Interface Kit runs at a phone's shape, and nothing in the lab has met a
FINGER. Phaser reports a tap as a pointer press, so a Button works, and a
finger now has something to type on (`maps/keyboard`, above); what a touch
screen still has no answer for is hover, a right button, Tab, and Escape as
"drop the focus".

The keyboard map is also the only way to type on a phone, rather than a
convenience beside the real one: a mobile browser raises its keyboard for an
editable element, and the game is a focusable `div`, not an editable one. The
proxy that would change that — a hidden `<input>` forwarding into `addTyped` —
is deliberately punted, and the reason to build it eventually is accessibility
rather than convenience, since canvas-drawn keys are reachable by a finger and
by nothing else (specs/KEYBOARD_PLAN.md). None of the rows above adds a dependency on those, and that
is deliberate — but before any of this is claimed for mobile, the driver's
touch path wants a test that taps, the way the play test clicks.
