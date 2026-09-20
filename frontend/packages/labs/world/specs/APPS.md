# Assessment: apps in this engine, and a progression for them

STATUS: PROPOSED. Nothing here is built. What it would take for World Lab
to build a mobile APP rather than a game, what the lab already has, what is
missing in the order it blocks, and what a separate progression for app
design would cost. Written when the curriculum work was put aside in favour
of the engine.

## Why this is a fair question and not a new lab

The lab's interface half is further along than a game engine's usually is,
because of one decision made early: **an interface element is an actor**
(specs/UI_ACTORS.md). There is no widget layer, no DOM, no second scene
graph. What follows from it is most of an app builder already:

- **Eleven interface kinds are built**: Label, Button, Panel, Text Input,
  Text Area, Dropdown, Toggle, Slider, Progress Bar, Speech Box, Viewport
  (`src/actors/stock/`). Each is an `.actor` a learner can open and change.
- **A screen is a map.** `load map` puts one over what is there, `load map
⟨…⟩ into ⟨…⟩` replaces what a Viewport holds, `unload this map` takes one
  away. The stock pause menu (`src/maps/stock/pauseMenu.ts`) is a panel, a
  title and two buttons, each button carrying its own script — which is
  exactly the shape of a screen in an app.
- **A control carries its own behavior.** A placement's script is per-
  instance blocks (specs/MAP_SCRIPTS_PLAN.md): "this button, this one, does
  this". An app is mostly that.
- **The map editor is a layout canvas.** Place, drag, and a field for every
  property of every trait a kind elects — which is how a control is
  configured.
- **A phone shape already runs.** `set size of view to x ⟨10⟩ y ⟨18⟩ tiles`
  is a block, and `src/fixtures/interfaceKit.ts` is that shape.
- **Focus and tab order are a rule** (`tabNavigation`), with Escape
  reserved, so keyboard access was designed in rather than bolted on.

So "build an app here" is not a new engine. It is a different set of
defaults and about six missing ideas.

## What an app wants that a game does not

1. **A shape it did not choose.** A game picks its view and the canvas is
   letterboxed to it. An app meets whatever phone it is on.
2. **Screens, and a way back.** Not "a menu over the level" but a stack
   with a history.
3. **Lists.** Most app screens are a repeated row over data.
4. **Data that outlives the run.** A note-taking app that forgets is a
   drawing of a note-taking app.
5. **A finger.** Tap, drag, swipe, long press, scroll.
6. **Text entry that behaves.** A hint, a kind, a "done", something that
   says a value is wrong.

## What is missing, in the order it blocks

### 1. A finger

BUILT, for one finger — specs/GESTURES_PLAN.md. The paragraph below is
what was true before it, and one sentence of it was wrong: the smallest
honest step turned out to need no pointer change at all, because a rule
can already read the button edges, the pointer's place and the clock. The
`Gestures` rule raises drag, swipe and hold, and the Slider stopped
faking. Multi-touch and telling a finger from a mouse are still absent.

`src/engine/core/pointer.ts` knows three MOUSE BUTTONS and nothing else.
The driver reads `this.input.activePointer` once a frame: one pointer, no
ids, no `addPointer`. The Mouse rule offers pressed, released and clicked;
there is no drag, swipe, long press, double tap or hover, and the Slider
fakes dragging by asking every frame whether the button is down.
specs/UI_ACTORS.md says it plainly: "nothing in the lab has met a FINGER".

This blocks everything else, because a control that cannot be dragged
cannot be a list that scrolls. The smallest honest step is a pointer that
reports where it came from and a rule that raises drag and swipe; multi-
touch can wait, since one finger is what an app's controls use.

### 2. Anchoring

BUILT — specs/ANCHORS_PLAN.md, and its own proposed answer is what was
built: an anchor on the interface layer's placements rather than on the
actors.

specs/UI_ACTORS.md defers layout on purpose — "No layout engine, and no
anchoring to the viewport" — and names the exact trigger for building it:
one interface shared between two worlds of different shapes. **An app is
that trigger.** Its own proposed answer is worth keeping: an anchor on the
interface layer's PLACEMENTS rather than on the actors, so a kind stays a
kind and an arrangement says where it sits.

Without it, an app authored on one phone is wrong on the next, and the
canvas will not help: the view is fixed-aspect per world, so a narrow
window scales the whole thing down rather than reflowing.

### 3. A list that scrolls

BUILT, for a list of WORDS — specs/LIST_PLAN.md. What made it possible was
not the finger alone but the finding underneath it: a clip comes from a
camera or from an actor's own canvas, so a control that draws its own rows
scrolls and a container that holds children does not. A list whose rows are
actors still wants the Viewport's camera.

The only many-of-a-thing control is the Dropdown. There is no list view,
no scroll view, no table. Value lists exist (`numbers`, `words`, `vectors`
— specs/LISTS.md), so the data half is there; what is missing is a control
that draws a row per item and scrolls. This is the single biggest gap in
what an app can SHOW, and it needs the finger first.

### 4. Data that survives

BUILT — specs/SAVING_PLAN.md, and on the condition the world-state spec
set: what a saved thing IS was said before one was built. It is the
world's own properties and value lists, under a name the project chooses,
written when a block says so.

There is none. specs/WORLD_STATE.md ends by saying so: "nothing here
persists across a reload". Nothing in the engine, the blocks or the rules
touches storage. The smallest step that makes apps honest is a world's own
properties and value lists saved per project, and a block that says when to
save.

### 5. Navigation as an idea

BUILT — specs/SCREENS_PLAN.md. And the assessment below was right that it
is a rule over what already works, with one correction: it needed two
small language additions first, because a rule could neither load a map by
a path it worked out nor take a map as an argument at all.

Screens exist as maps; "which screen is showing" is whatever maps are
loaded, and there is no back. A stack — go to, go back, replace — is a
rule over what already works, not new machinery.

### 6. Text entry

BUILT, keyboard and all — specs/FIELDS_PLAN.md and
specs/KEYBOARD_PLAN.md. A hint, a number kind, a "looks wrong" a project
sets, and Enter saying the answer is finished; and `maps/keyboard`, five
rows of Buttons that type.

The guess below was half right. The keyboard IS a stock map, and no
new kind of actor was wanted — but it took two engine additions after
all, neither of them the one anybody would have guessed. `type ⟨…⟩` and
`press the ⟨…⟩ key` exist because a click handler runs after the step
that reads what was typed, so what the world types has to belong to the
NEXT frame; and `takes the keyboard` exists because a Button takes the
focus when it is clicked, which would have taken the keyboard away from
the field on the first keystroke.

The old note read: no placeholder, no input kind, no validity, no "done"
or "next", no on-screen keyboard — and the last one is not optional on a
phone.

## What would NOT have to change

Worth saying, because it is most of the lab: the file model, the actor
model, rules and traits, the map editor, placement scripts, drawing,
effects, sound, the sandbox, the generator. An app is a world with
interface actors in it.

## A progression for app design

A separate catalogue, not more regions on this one: the audience arrives
wanting a different thing, and the first lesson of a game ("a world with
something in it") is not the first lesson of an app.

Six regions, five or so tiles each, by the same shape the game tree has —
foundations first, then what is built out of them:

| Region         | What it is about                                        |
| -------------- | ------------------------------------------------------- |
| **Screen**     | a phone-shaped world; placing controls; anchoring       |
| **Controls**   | label, button, field, toggle, slider, dropdown          |
| **Navigation** | a screen is a map; going to one; coming back; a tab bar |
| **Data**       | state; a list; a list view; saving it                   |
| **Feel**       | touch, feedback, transitions, sound                     |
| **Making**     | a control of one's own — an actor file, then a rule     |

Every one of those depends on something in the missing list, except
Controls, which could be written today.

## What "separate" costs in the lab

The progression module assumes ONE catalogue: `TILES` is imported by
`progression/index.ts`, and `TILES_BY_ID`, `GRANTED_BY` and the shelf are
module-level constants built from it; `progressStore` has one localStorage
key; a level says whether it gates the shelf but never WHICH tree it is on.

So a second progression means: the catalogue passed in rather than
imported, the store keyed by which catalogue, and `levelData` naming one.
Bounded, and touching most of the progression module's public surface. It
is a day's work that should be done once, not twice.

## Recommendation

**Build the engine first, in this order**, and write the progression after:

1. **The finger** — DONE for one finger (specs/GESTURES_PLAN.md), and it
   needed no pointer change: drag, swipe and hold are a rule over what the
   world already answers.
2. **Anchoring** — DONE (specs/ANCHORS_PLAN.md): a placement holds on to
   one of nine named places, resolved against the window at load.
3. **A list view** — DONE for words (specs/LIST_PLAN.md); a row per item
   of a value list, scrolling. Rows made of ACTORS are still open.
4. **Saving** — DONE (specs/SAVING_PLAN.md): the world's own memory under
   a name the project chooses. Per NAME rather than per project, which is
   the one thing that came out differently.
5. **Navigation** — DONE (specs/SCREENS_PLAN.md): go to, go back,
   replace, and which screen is showing.
6. **Text entry** — DONE (specs/FIELDS_PLAN.md, specs/KEYBOARD_PLAN.md):
   a hint, a number kind, a validity a project sets, a done key, and a
   keyboard to type it all on. The keyboard is a stock map, and what it
   needed from the engine was a frame's worth of ordering rather than a
   new control.

Then the progression, and the parameterising that a second one needs.

**One cheap thing worth doing first, whatever the order:** an APP template
and a phone-shaped starter (`{kind: 'template', id: 'app'}` — every
template today is a game genre). It costs a fixture, it makes the question
concrete, and every item above can then be judged against a real app that
somebody has tried to build.
