# Plan: an actor as data and events, and its editor (SIMPLE_INTERFACE.md, phase three)

STATUS: BUILT. The working record, as the other plans are.

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
- **Effects** (4b), each with an on switch and its settings, and Add Effect at
  the foot. The data gains `effects: [{effect, on, settings}]`, which the
  view writes as `add effect` rows for the ones that are on.
- **The preview** of the actor's look, with its animations listed under it.
- **Code**, which opens the events workspace as a step on the breadcrumb.

BUILT, but for Effects. `actors/editor/ActorEditor` (the panel, the
preview and Code), `actorEdits` (each change to the data, and the traits on
offer, read as `cameraTraitChoices` reads a camera's), and `ValueField`.
`ActorFileEditor` chooses the editor by the file's shape. The wizard's
actor from nothing is data-shaped (`seedFor`). A trait's fields are its
properties that take a literal; one that takes an actor or a list of them
is set in code. The preview is the sandbox's picture of the actor, asked
again whenever the file changes; "Looks like" offers the project's sprites
and animations.

**The code is the actor's view, for now.** Code opens the file editor over
the `define actor` workspace the data stands for, and each save there is
folded back. The definition rows are therefore in the code as well as the
panel. Giving the code rows (a drawing, an own block, an own event, an
every-frame step) forms that can stand as roots of the workspace is its own
step, 4c: each of the four is found by its type across the lab (its body's
surface, its button, the layout), so a second type for each is a change to
all of those, not to the view alone.

**Effects (4b), BUILT.** `ActorData.effects`: each is an effect's module
path, whether it is on from the start, and its `add effect` row as the
block holds it (`extraState` and the parameter sockets), since a setting
is a socket's shadow and that block is what builds them
(`effectParamsMutator`). The view writes the rows of the ones that are on.
One that is off adds no row, so a fold of a view would lose it: `asActorData`
takes the file the view came from and keeps its switched-off effects, and
every fold of a view (`throughView`, the enhancements, `mapWorkspaces`, the
code) passes it. The tab lists them with the switch and the settings (a
number, a truth value or a color per socket); Add Effect offers the
project's effects and Import…, which adds the one brought once the project
holds it (`useAfterImport`). In the browser: Ripple added from the menu and
switched off, Pulse imported from the shelf with its two settings.

In the browser: a Badge made with the wizard from nothing opened in the
editor from the palette; a property and Affected by Gravity were added, the
trait showing its two fields; Code opened the view as a step on the
breadcrumb, and the breadcrumb led back.

### 4c. The code rows as roots

The Code view opens the actor's own workspace, its handlers and its code,
and no `define actor`. The four code rows (a drawing, an own block, an own
event, an every-frame step) stand in it as roots WITHOUT A SECOND TYPE:
once loaded, and whenever one is dragged in, a top-level one has its
previous and next connections taken away. The orphan rule and the section
layout ask whether a block has those connections, not what it is, so each
is a root to both; and everything that finds these blocks by type finds
them as before. A connection is not saved, so the file holds the same
blocks either way, and the compiler reads them through the view, under
the root. The "+" offers the four beside the events. What looked for the
`define actor` in that workspace (the check for a block in the wrong kind
of file, the definition held first, the helpers that read a block's
context from its root) learns that an actor's code workspace has none.

BUILT. `blockly/codeRoots` (`rootCodeRows`, and what the "+" offers
besides the events, under "What it does"); the file editor takes
`actorCode` and roots the four after every load it makes and on every
block created or moved, never on one member's body surface. The Code view
hands it the file's workspace alone and writes what it saves back into
the file's `blocks`, the data left as it was.

Less had to change than this step expected. The check for a block in the
wrong kind of file asks only of roots without connections, and already
lets an actor hold all four; the definition held first holds nothing when
there is none; the helpers that read a block's context fell back to the
file being an actor already. What did have to change was found in the
browser: the orphan rule disables a block as it arrives, before it has
been made a root, and a disabled block generates nothing. The Label's
drawing came back from its first save disabled and the Label drew as a
square. A code row made a root is enabled again; a row a learner disabled
by hand is enabled again too when the workspace next loads, which is the
cost of the orphan rule and a learner sharing one reason.

In the browser: the Label's code shows its drawing as a root, enabled,
with a "+" above and below; the "+" offers every frame, a block of its
own, an event of its own and its drawing; an every-frame step added there
is a root, stays one through Back and Code again, and compiles with the
drawing; the drawing's pencil opens its body and Back returns.

### 5. The stock actors and the scenarios in the data shape

Through their two helpers (`actors/stock/workspace.actorFile` and the one
in `constants`). The lessons' actors stay block-shaped until the lessons
are rewritten, as their worlds do.

BUILT, at the projects rather than the helpers. Most scenario actors are
written as `define actor` workspaces inline, not through a helper, so the
default project and each scenario are folded where they are listed
(`inDataShape`); `SCENARIOS_AS_WRITTEN` keeps them as written, for the
tests that compare the two shapes. The stock library keeps its entries in
blocks: what a learner imports, from the shelf or the wizard, is written in
the data shape (`importStockActorAsData`), while an import made in building
a lesson, a map or an enhancement writes blocks as before, since the
lessons' checks read actors' rows. The tests that read a shipped actor as
blocks now read its view. "Looks like" offers the project's pictures (they
are files with a URL, which `projectFiles` leaves out) and always holds the
actor's own look. In the browser: the Player, the Bird, the Paddle, the
Pilot and the Button each open in the Actor Editor with their traits and
their look, and the games play.

### 6. A Self property renamed or deleted

A rename rewrites every block that reads or sets it, in every file: its
blocks are named after it. A delete first says where it is used.

BUILT. `actors/editor/selfProperties` (`renameProperty`, `propertyUses`,
`deleteProperty`) and `SelfProperty`, the row that offers both in place.
A rename rewrites the declaration and, through `mapWorkspaces`, every
block type made from the old name (`world_get_ActorsPlayer_LivesProperty`
and its kin), the actor's own starting value among them; it is written with
`replaceSources`, since it reaches files other editors may have open. A
delete names the files whose code uses the property (not counting the
value it starts at) and takes the property and that value away. In the
browser: lives, added to the starter's Player, renamed hearts and deleted.

### 7. Documents and the browser

BUILT. SIMPLE_INTERFACE.md names this plan; FILES.md needed nothing, since
a data-shaped actor declares its name as a key, which `authoredName`
already reads. Each step above was seen in the browser as it landed.

## Not in this phase

- The animation timeline, and animations kept on the actor rather than in
  the project.
- The Interface Actor's simpler drawing.
- Two wizards, and the import dialogs offering by purpose.
- Moving the lessons' actors, which goes with rewriting the lessons.
