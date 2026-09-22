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

### The world's `define event` ban has to go, and it was always coarse

`fileKind` bans `world_rule_event` from a `.world` with this reason:

> a world's own `define actor` generates into a block scope, and the
> declaration this emits is an `export const`.

That is a ban on the whole FILE because of one POSITION inside it. A `define
event` at a world file's top level has the same shape as one at an actor
file's top level, which is allowed. What must stay banned is one nested inside
a world's own `define actor`, which is a narrower rule than the one written.

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

1. **`define event` under `define world`**, and the narrower ban: not inside a
   world's own `define actor`. The hat and the emit are the blocks a world's
   own declarations already mint.
2. **`world.defineEvent` and the preamble**, and an `emit` that names one.
   The dropdown reads the project's `.world` files.
3. **`define map`**, with the map's name and its `emits` rows. The map's
   events move out; its hats hang under the root.
4. **The five maps, and the import.** `importStockMap` carries a map's
   `emits` into the world it is imported to, the way it carries actors.
5. **The Notes fixture**, which is the only project that will notice.

## What it does not do

- **Nothing for actor events**, which are about a subject and are right.
- **No event a map can hear.** A map raises and the world hears; whether a map
  should hear one back is a question nobody has asked.
- **No namespacing.** Two worlds in one project share a vocabulary, which is
  the intent — see the decision above.
- **Nothing for the map's settings**, which stay in the document.

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
