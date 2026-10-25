# Plan: an actor as data and events, and its editor (SIMPLE_INTERFACE.md, phase three)

STATUS: IN PROGRESS.

The third phase of the simple interface. Phase one made Screens and Maps
files (SCREEN_MAP_PLAN.md); phase two put the editors in a shell
(SHELL_PLAN.md). This phase makes an actor's file what SIMPLE_INTERFACE.md
says it is, data and an event workspace, and gives it the Actor Editor.
The animation timeline, the two wizards, and the simpler drawing for an
Interface Actor are later phases.

## What exists

- **An actor is a Blockly workspace.** A `define actor` root (`world_actor`)
  has its rows chained under it; its handlers are roots beside it
  (`actors/stock/workspace.actorFile`).
- **The rows, across every stock actor, scenario and lesson**, are of two
  sorts. Twelve kinds in all:

  | Row                                 | Sort                  |
  | ----------------------------------- | --------------------- |
  | `use trait`                         | definition            |
  | `acts like`                         | definition            |
  | `is data`                           | definition            |
  | `show as` (its icon)                | definition            |
  | `set sprite`, `play animation`      | definition (its look) |
  | `define property`                   | definition (its Self) |
  | `set ⟨member⟩ of this actor to ⟨v⟩` | definition (a value)  |
  | `define drawing`                    | code                  |
  | `define block`                      | code                  |
  | `define event`                      | code                  |
  | `every frame` (`world_trait_step`)  | code                  |

  Every `set` row's value is a literal: a number, a word, a color, a truth
  value, a list of words, or an x and a y (scale, size). None is computed.

- **Compiling one is small.** The root's generator starts an `ActorBuilder`
  and each row adds its line; `assembleActorModule` puts the declarations
  and handlers around it.
- **Reading one is not.** The rows are walked by the own-properties parser
  and the project's module list, the icon reader, `actorLook` (look and
  scale), about twenty enhancement patches (`actors/enhance`), and a dozen
  helpers on a live workspace.
- **There is a precedent for data that becomes rows only the compiler
  sees**: a placement's stored cameras (`withCameraDeclarations`) and the
  Main Screen's values and rule settings (`screenData`).
- **The "+" events workspace** is built (`useSectionWorkspace`), and both
  the file editor and a placement's workspace use it.

## The shape

A data-shaped actor file is a document, as a map is:

```json
{
  "type": "actor",
  "name": "Player",
  "for": "game",
  "actsLike": "actors/progressBar",
  "isData": true,
  "icon": "heart",
  "look": {"animation": "playerBob"},
  "traits": ["Gravity#AffectedByGravityTrait", "Jumping#JumpsTrait"],
  "properties": [
    {"name": "lives", "type": "number", "access": "writable", "value": "3"}
  ],
  "values": [
    {
      "setter": "world_set_Space_ScaleProperty",
      "type": "vector",
      "value": {"x": 2, "y": 1}
    }
  ],
  "blocks": {
    "blocks": {"languageVersion": 0, "blocks": ["…handlers and code…"]}
  }
}
```

Every key but `type`, `name` and `blocks` is optional. The definition rows
are data; the code rows are roots of their own in `blocks`, beside the
handlers, where the "+" offers them. A `look` is a sprite or an animation.

**The view.** `actorView` turns the data back into the `define actor`
workspace it stands for: a root whose chain is the definition rows, in a
fixed order, then the code rows; the handlers beside it. It is never saved.
`foldActor` is the inverse, from any `define actor` workspace to the data:
a row that is not a definition, or a `set` whose value is not a literal or
not on `this actor`, is code. Both are pure.

This is what keeps the readers: anything that walks rows reads the view,
and anything that writes rows edits the view and folds it back. The
block-shaped file is its own view, so both shapes compile and read the same
way while the files move over.

## What is being built

One commit each.

### 1. The shape and its view

`actors/actorData.ts`: the type, `isActorData`, `actorView`, `foldActor`,
and `viewOf(contents)`, which is the contents as a `define actor` workspace
whatever their shape. A test folds every stock actor, scenario actor and
lesson actor, views it again, and compiles both: the two modules hold the
same lines.

BUILT. `actors/actorData.ts`. Every shipped and taught actor folds with
nothing left over as `setup`, and views and folds again to the same data.
The two modules hold the same lines once the ids Blockly gives a block
saved without one are masked, since those are random on every load. The
view puts the definition rows in its own order (acts like, is data, icon,
look, traits, properties, values, then the code), so the lines are
compared in no order; that no actor's behavior hangs on the order of its
rows is shown when the scenarios play in the data shape (step 5).

### 2. The compiler and the readers through the view

The generator, `parseActorOwnMeta` and the project's module list, the icon
reader, and the other readers of a file's rows read `viewOf`. A
data-shaped actor plays as its block-shaped self. (The helpers that read a
LIVE workspace come with the editor in step 4: they see the workspace it
loads, not the file.)

BUILT. The generator views an `.actor` before loading it; so do
`parseActorOwnMeta`, `projectActorIcons`, `defineActorIn` (the drawing
preview), the kind facts behind the "+" (`eventChoices`), and
`standInBlocks`, which has to see a data-shaped actor's setters as blocks
to stand in for a deleted rule's. `lookOf` reads rows to write them, and
goes with the writers. A test builds every scenario twice, as it ships and
with every actor folded into data, and runs a second of each with the same
random numbers: the two put every actor in the same place.

### 3. The writers through the view

The enhancements, `withLook`, `withScale` and the wizard edit the view of a
data-shaped file and fold the result. Each enhancement's test is run
against both shapes.

So do the project-wide rewrites. A rename finds a reference by a block's
`type` and its fields, and the data keeps a setter and a trait under keys
of its own, so `mapWorkspaces` rewrites a data-shaped actor's view and
folds it back: renaming an actor, a rule or an animation, and asking where
an actor is used, then reach the data without knowing its shape.

BUILT. `throughView` (in `actorData`) makes a change written for rows to
contents of either shape. `withLook`, `withScale` and `lookOf` go through
it; the wizard writes with those, a clone renames the data's own `name`,
and an import writes its stock file, so the wizard needed nothing more.
The enhancements are wrapped once, where their groups are listed
(`enhance/throughTheView`): each is asked and applied with the project's
data-shaped actors in their view, and an actor it wrote to is folded back.
`mapWorkspaces` views and folds a data-shaped actor; `animationPlayedIn`
and `actorUses` read its view. A test gives every actor enhancement to
each of the starter's actors in both shapes and finds the same change
(with the wrapper taken away, 329 of its 330 cases fail); another renames
a data-shaped actor and finds its own setters renamed inside the data.

### 4. The Actor Editor

A data-shaped actor opens in it; a block-shaped one opens in the block
editor as now. New actors from the wizard are data-shaped.

- **The side panel**, as wide as the Actor Palette, with a Traits tab and
  an Effects tab. Under Traits, Self comes first: the actor's own
  properties, each a name, a type and a value, with Add. Then each trait,
  which opens to its properties and can be removed. Enhance Actor at the
  foot lists the known traits and opens the enhancement checklist.
- **Effects**, each with an on switch and its settings, and Add Effect at
  the foot. The data gains `effects: [{effect, on, settings}]`, which the
  view writes as `add effect` rows for the ones that are on.
- **The preview** of the actor's look, with its animations listed under it.
- **Code**, which opens the events workspace as a step on the breadcrumb.

### 5. The stock actors and the scenarios in the data shape

Through their two helpers (`actors/stock/workspace.actorFile` and the one
in `constants`). The lessons' actors stay block-shaped until the lessons
are rewritten, as their worlds do.

### 6. A Self property renamed or deleted

A rename rewrites every block that reads or sets it, in every file: its
blocks are named after it. A delete first says where it is used.

### 7. Documents and the browser

## Not in this phase

- The animation timeline, and animations kept on the actor rather than in
  the project.
- The Interface Actor's simpler drawing.
- Two wizards, and the import dialogs offering by purpose.
- Moving the lessons' actors, which goes with rewriting the lessons.
