# Plan: a map wires into the world's events rather than minting its own

STATUS: PLANNED. Nothing here is built.

A map may declare events today, and the world hears them. This proposes the
inversion: the WORLD declares the events, a map says which of them it raises,
and a map introduces no vocabulary of its own — exactly as a map introduces no
actor kinds and places kinds declared elsewhere.

## What is true today

`define event` is legal in a `.rule`, an `.actor` and a `.map`, and not in a
`.world` (`blockly/fileKind`, ROOT_HOMES). A map's event is world-scoped and
carries no subject: the map raises it, the world hears it with a hat, and
every file that declares anything of its own gets a drawer in the toolbox
(`domainBlocks`, `ownProperties`).

Five maps in the lab use it:

| Map                 | Declares                                             |
| ------------------- | ---------------------------------------------------- |
| `maps/pauseMenu`    | `quit`                                               |
| `maps/confirm`      | `yes`, `no`                                          |
| `maps/tabs`         | `a tab is chosen ⟨which⟩` — the one with a parameter |
| `maps/message`      | `dismissed`                                          |
| Notes' `maps/write` | `save`, `cancel`                                     |

The design is stated where it is best defended, in the stock pause menu:

> Quit's says `emit quit; unload this map`: `quit` is an event the map's own
> workspace declares, because what quitting means is the project's… **No kind
> of actor knows any of this; the map does.**

That argument is right about where the KNOWLEDGE lives and wrong about where
the DECLARATION belongs, and the difference did not show until somebody
imagined a hundred maps.

## Three problems, in order of weight

**1. A hundred level maps mint a hundred different `complete` events.** This
is the one that matters, and it is not about tidiness. A world that wants to
hear "a level finished" cannot: each map declared its own event, so there are
a hundred names and a hundred handlers for one idea. Many maps raising ONE
signal is a sentence the language cannot say.

**2. A hundred maps mint a hundred drawers.** Every file with its own
declarations gets one, so the world's toolbox grows with the project's level
count. A palette that scales with content rather than with vocabulary is a
palette nobody can read.

**3. It is the wrong way round from actors, and for no reason.** A map does
not introduce actor kinds. It places kinds declared elsewhere and depends on
them existing; `importStockMap` walks that dependency and writes the actors
first, because a map naming a kind the project lacks is a placement the world
cannot make. Events are the same kind of thing and point the other way.

## The inversion

- **A world declares its events.** `define event ⟨level complete⟩` under
  `define world`, beside its properties — the vocabulary of the program.
- **A map says which it raises**, and declares nothing new. `emit ⟨level
complete⟩` in a placement's workspace or the map's own.
- **The world hears it** as it does now.

A map is then to events what it already is to actors: a thing that USES a
vocabulary declared elsewhere, and states its dependency so an importer can
satisfy it.

### A map cannot import a world, so the world registers and the map names

The world loads the map, so a map's module importing the world's is a cycle —
and a `.map` is meant to be loadable by several worlds, so it cannot name one
anyway. `emit` therefore cannot be the module reference that a map's own event
is today.

The answer is the one two other things in this lab already needed, for the
same reason: **a name that arrives as DATA needs a registry.** The world
preamble registers what it holds and the other side looks one up.

- `world.define(path, kind)` — because `bring back what was remembered` is
  handed a path that was stored in a browser (specs/RECORDS_PLAN.md).
- `world.defineTheme(path, document)` — because a map's theme and a
  placement's are strings in data, and a file's `extends` is a fourth
  (specs/STYLES_PLAN.md).
- `world.defineEvent(name)` — this.

So: the preamble emits a `defineEvent` per declared event; a map's `emit`
generates a call that names one; the dropdown is sourced from the project's
`.world` files, so the name cannot fail silently, which is the rule every
name-shaped field in this lab now follows (specs/BOXES_PLAN.md).

### The world's `define event` ban is not a policy to change; it is a leftover

`fileKind` bans `world_rule_event` from a `.world` with this reason:

> a world's own `define actor` generates into a block scope, and the
> declaration this emits is an `export const`.

**A world has not been able to hold a `define actor` for some time.** The same
file says so, two maps down, in the comment on `DEFINING_ROOTS`:

> `define actor` joined the list when every actor became a file — until then a
> world could hold one

And it is enforced rather than documented: a `define actor` in a `.world`
throws, naming the file and telling you to move the block. Every `world_actor`
in this repo is the root of an `.actor` file.

So the block scope those three entries defend against cannot be created any
more, and the restriction outlived its reason. Two of them ban something for
it — `world_rule_event`, `world_rule_block` — and a third ALLOWS something for
it: `world_acts_like` is legal in a `.world` so that it may be a row under a
`define actor` that cannot be there, which is an allowance for nothing.

Lifting the event ban is therefore not a change of policy. It is deleting a
restriction whose cause was deleted, and the other two want the same audit.

## One world per project, which settles a question this raised

A world is a whole PROGRAM. Nothing composes them: a world cannot load a
world, a Viewport holds a map, `go to screen` loads a map, and the compiler
has one entry point. A second world is a second program in the same folder,
not a part of one — which is why every case you would reach for it is already
a map. Levels are maps. Screens are maps. A title screen is a map.

So the model this plan is written against is:

|           | holds                                        |                 |
| --------- | -------------------------------------------- | --------------- |
| **World** | the app's general state, and its vocabulary  | one per project |
| **Map**   | an arrangement — a level, a screen, a dialog | many            |
| **Actor** | a thing in one                               | many            |

### `define map for ⟨world⟩`, considered and left out

The obvious way to make a map's dependency explicit is to have it name the
world it belongs to, which would also let the `emit` dropdown offer exactly
that world's events rather than a union.

It is left out for three reasons, in order:

1. **One world per project makes the union exact.** There is nothing for the
   binding to narrow.
2. **The one documented reason to have SEVERAL worlds is the one case where a
   map must belong to more than one.** "One interface shared between two
   worlds of different shapes" is the stated trigger for anchoring, in
   `ANCHORS_PLAN`, `APPS` and `UI_ACTORS`. Binding a map to a world closes off
   the scenario three specs were written about. (That case turns out not to
   need two worlds — `applyAnchors` compares the MAP's size against the
   VIEW's, which differ inside one world — but the intent is on the record.)
3. **`emits` already carries the dependency.** A map that states what it
   raises is legible to a reader and satisfiable by an importer, which is what
   the binding was for.

**The safety comes from the LOAD, not from a bind.** A world loading a map
that emits something it does not declare can say so. That catches the real
mistake at the moment it matters, and it still lets one map serve two worlds
that both declare `quit` — which is why the registry is keyed by NAME and not
by path.

Revisit if projects start routinely holding several worlds with genuinely
different vocabularies. That is a "when somebody hits it" change.

## `define map`, which this makes worth building

A map's workspace is the only Blockly surface in the lab with no root: bare
hats on a canvas, where every other file kind opens with `define world`,
`define actor` or `define rule`. That is a good part of why a map and a world
feel like the same kind of thing edited two ways.

A root fixes three things at once:

- **A map can name itself.** Today `Write` comes from the file stem via
  `parseMapOwnMeta`; every other file kind declares its own name.
- **It is where the dependency goes.** `emits ⟨quit⟩` as a row is the same
  shape a rule's `requires` is: a statement of what this file expects of its
  host, readable by the import and by whoever opens the file.
- **The hats hang under something.** An interface with an owner reads as an
  interface; floating on a canvas it reads as loose blocks.

NOT in scope: moving `size`, `tile`, `modal` and `theme` out of the `.map`
JSON into rows under the root. The map editor's panel edits those and the
generator emits the document; that is a move of where the truth lives, and it
is a separate question from this one.

## What it costs, said plainly

**A shared map becomes LESS self-contained, not more.** The pause menu carries
its own `quit` today and drops into any project working. Under this it depends
on the importing world having declared `quit` — and the import satisfies that
by EDITING THE WORLD'S FILE, which is more intrusive than writing new files
beside it.

That is the real price and it should be paid deliberately. Two things make it
bearable:

- The dependency is not new in kind. A map already depends on actor kinds, and
  the import already walks and writes them.
- The `emits` rows make it legible. An import that adds `quit` to your world
  can say so, because the map said it needed it.

## Decisions taken before building

- **A map may not keep private events as well.** Two mechanisms for one idea
  is the mistake this lab keeps making and then undoing — the `Progress` rule
  that held properties and no behaviour, the three `width` properties, the
  five `RING_INSET`s. Pick one: the world's.
- **A world's event keeps no subject.** A map's has none today and neither
  does a rule's world event. An event ABOUT something is an actor's, and that
  mechanism is untouched.
- **Parameters survive.** `a tab is chosen ⟨which⟩` carries one, so a world's
  `define event` takes the same signature editor an actor's and a rule's do
  (specs/EVENT_VALUES_PLAN.md).
- **The registry is by NAME, not by path.** A theme is a file and is named by
  its path; an event is a word the project chose. Two worlds in one project
  declaring the same name is the same event, which is what a project means.

## What gets built, in order

1. **The stale restrictions**, first and on their own, because they are what
   made this look like a policy change: correct the three `ROOT_HOMES`
   comments that justify themselves by a world's `define actor`, and audit
   `world_rule_block` and `world_acts_like` while the reason is in hand.
2. **`define event` under `define world`**. The hat and the emit are the
   blocks a world's own declarations already mint.
3. **`world.defineEvent` and the preamble**, and an `emit` that names one.
   The dropdown reads the project's `.world` files.
4. **`define map`**, with the map's name and its `emits` rows. The map's
   events move out; its hats hang under the root.
5. **The five maps, and the import.** `importStockMap` carries a map's
   `emits` into the world it is imported to, the way it carries actors.
6. **The load-time check**, which is the safety the binding would have given.
7. **The Notes fixture**, which is the only project that will notice.

## What it does not do

- **Nothing for actor events**, which are about a subject and are right.
- **No event a map can hear.** A map raises and the world hears; whether a map
  should hear one back is a question nobody has asked.
- **No namespacing.** Two worlds in one project share a vocabulary, which is
  the intent — see the decision above.
- **Nothing for the map's settings**, which stay in the document.

## A map that cares about only some actors — noted, not built

A dialog wants interface actors and not a Ghost; a level wants the Ghost and
not a Text Input. The map editor's palette offers every actor the project
holds, to every map, which is the right default while a project has eight
kinds and the wrong one when it has fifty.

Worth recording now because it is the same SHAPE as this plan and should not
be solved a different way:

- **A map already says which actors it uses** — its placements name them, and
  `mapActorTypes` reads that list to generate the loader's `define` calls. So
  scoping is a question about the PALETTE, not about the language: there is
  nothing new for a map to declare.
- **Which makes it an editor affordance**, not a `uses ⟨…⟩` row beside
  `emits ⟨…⟩`. `emits` exists because an event's declaration is genuinely
  elsewhere and must be satisfied; a kind's is already named by the placement.
- The likely shape is the palette offering what this map already places first,
  and everything else behind one more click — which needs no file format
  change and can be undone.

What would change the answer is a map wanting to REFUSE a kind rather than
merely not offer it, which is a constraint and would want saying in the file.
Nobody has asked.

## Obligations

- A `.map` naming an event no world declares is the silent-name failure this
  lab keeps meeting. The dropdown prevents the ordinary case; a guard test
  over the stock maps prevents the shipped one, as `stockActors.test` does for
  trait references (specs/BOXES_PLAN.md).
- `shelfCoverage` will want `world_define_event`'s new home granted by a tile,
  or it ships reachable by nobody.
- The toolbox loses a drawer per map and gains rows under the world's. Check
  that the world's drawer is still readable with a dozen events in it.
- A test that many maps raise ONE event and a world hears it once, which is
  the sentence the current design cannot say and the whole reason for this.
- A test that a world loading a map which emits what it does not declare says
  so, since that is the safety `for ⟨world⟩` was going to buy.
