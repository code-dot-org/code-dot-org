# Plan: game or interface, all the way through (SIMPLE_INTERFACE.md, phase five)

STATUS: BUILT. The working record, as the other plans are.

The fifth phase of the simple interface. SIMPLE_INTERFACE.md, "Interface,
game, or both", decided that every stock actor, rule and enhancement says
which it is for, and that the flag decides which tab of the Actor Palette
an actor is under, which of the two wizards makes it, and what each import
dialog offers. Phase two (SHELL_PLAN.md) built the first of those three.
This builds the other two, the spec's simpler drawing for an Interface
Actor ("Interface Actors"), and two keyboard gaps the ledger records
(ACCESSIBILITY.md).

## What exists

- **Actors carry the flag** (`actors/actorPurpose`): every stock actor says
  game, interface or both, an import writes it into the file, and the
  palette's tabs read it.
- **Nothing else does.** The wizard (`actors/create/ActorCreator`) is one
  wizard: its templates are every stock actor, it does not know which tab
  it was opened from, and an actor made from nothing says nothing. The
  rule shelf, the actor shelf and the enhancement checklist offer
  everything. The 46 stock rules and 29 enhancements carry no flag.
- **An Interface Actor's drawing starts at 32 by 32**, and a learner swaps
  in `width of this actor` by hand.
- **Nothing can be placed, and nothing docked, from the keyboard**
  (ACCESSIBILITY.md).

## Decisions

- **"Both" is offered in either context.** Anything for both is under both
  tabs and on both shelves.
- **The shelves filter and do not forbid.** Each lists what fits where it
  was opened from, with "Show everything" to list the rest; a game rule on
  an interface actor is one press away, and never refused.

## What is being built

One commit each.

### 1. Flags on the stock rules and enhancements

`StockRule.for` and `Enhancement.for`, each judged: Gravity is a game's,
Tab Navigation an interface's, Health both. A test finds none left
unflagged, and the stock actors, rules and enhancements a stock actor
`requires` agree with it (a game actor requiring an interface-only rule is
a mistake in one of the two).

BUILT. `StockRule.for` on all 46: two are an interface's (Screens, Tab
Navigation), eight are both (Health, Time, Conversation, Scoring, Input,
Mouse, Gestures, History), the rest a game's. The enhancements' are given
in one table beside their groups (`PURPOSES` in `enhance/enhancements`):
all a game's but Types Out Text (an interface's) and the Scoreboard
(both); a test lists every one, so a new enhancement is placed by a
decision. The agreement test found the Viewport, flagged an interface's,
needing the two camera rules a game's view is steered by; the flag was
the mistake, and the Viewport is for both: the window a Screen shows its
game through, and a minimap inside a level.

What a flag means, said once: it decides what is OFFERED first — the
palette's tab, the wizard's templates, a shelf's list — and never what can
be used. The engine and the compiler do not read it.

### 2. Two wizards

The palette's Add New Actor tells the wizard its tab
(`requestActorCreate({purpose})`).

- Its templates are those for that purpose.
- An actor made from nothing is for that purpose.
- An Interface Actor made from nothing has a box (the Boxed rule, 96 by 32)
  and a drawing the size of its box, and the wizard skips its picture step:
  an Interface Actor is drawn, not given a sprite.

BUILT. `requestActorCreate(purpose)` from the palette's Add New Actor;
the file menus keep it (`creatingFor`), narrow the templates with
`isUnder`, and hand it to the wizard, which drops its picture step for an
interface. An actor made from nothing is `create/newActor`'s: a game's is
data saying so; an interface's has Has a Box at 96 by 32 and a drawing of
a bordered panel sized `width of this actor` by `height of this actor`.
From a folder's menu the wizard is as it was. In the browser: on the
starter's Main Screen the Interface tab's Add New Actor offered fifteen
templates, none a game's, in two steps; a Badge made from nothing came
under the Interface tab and, placed, drew as a panel in the game.

### 3. The shelves offer by purpose

The rule shelf, the actor shelf and the enhancement checklist list what is
for the purpose they were opened for, with "Show everything". From the
Actor Editor, the purpose is the actor's; from a block's `(import…)`, it is
the file's actor's, and everything when the file is no actor's.

BUILT. `actors/PurposeFilter`: `usePurposeFilter(purpose)` answers whether
a row shows and draws the "Show everything" box, which is absent when
there is no purpose to narrow by; an actor for both narrows nothing. The
rule shelf and the actor shelf take the purpose of the file the block is
in (`purposeHere`): an actor's own, a Screen's an interface's, a level's
or a world's a game's — a small widening of the above, since a Screen is
plainly an interface's — and nothing for anything else. Enhance takes the
actor's (`purposeOfTarget`); the wizard's abilities step takes the tab it
was opened from. A ticked row stays whatever the filter says, or it could
not be unticked. The camera's rule shelf is not narrowed.

What it showed, in the browser: an Interface Actor made from nothing is
offered NOTHING until "Show everything" is ticked. Of the 29 enhancements
only Types Out Text and the Scoreboard fit an interface, and neither is on
offer for a bare actor. That is the flags being honest, not the filter
being wrong; the shelf wants interface enhancements (a hover look, a press
sound, focus on Tab), which is a phase of its own. And the fold is decided
when the list first draws, so ticking the box shows all 29 rows unfolded.

### 4. A drawing is its box

In an actor with a box, a new `define drawing` starts at `width of this
actor` by `height of this actor`, not 32 by 32 (SIMPLE_INTERFACE.md,
"Interface Actors").

BUILT. The Code view's "+" is how a data-shaped actor gains a drawing, and
in an actor with Has a Box its "its drawing" adds the block with `width of
this actor` and `height of this actor` in its sockets, each over the 32 a
socket keeps for when the block is pulled out (`codeRoots.actorCodeChoices`,
read from the actor's traits by the Actor Editor). A "+" choice may now say
what its block holds as well as its type (`EventChoice.state`). In the
browser: on the interface kit's Label, the new drawing compiled to
`actor.get(WidthProperty)` by `actor.get(HeightProperty)`.

Not changed: the toolbox's own `define drawing`, which a learner editing a
plain `.actor` file drags out, is still 32 by 32. A toolbox entry is one
block for every file, and a plain file is the older shape.

### 5. Docking and placing from the keyboard

- **Dock** in the inspector of a placement on a Screen: which edge of the
  screen, or beside which docked placement and on which side. It does what
  a drop does.
- **With an actor in hand**, the stage's arrow keys move a cursor cell,
  drawn and said aloud, and Enter or Space places one there, or takes one
  away as a press does.

BUILT. **Dock…** in the inspector of a placement on a Screen opens a menu
of the zones a drag offers, without the drag: the screen's four edges,
then the four sides of each other docked placement, grouped by which.
A choice does what a drop there does (`docking.dockedAt`, which the drop
now calls too) and is said aloud. A docked placement's reads "Dock
somewhere else…", beside Undock and its size field.

**With an actor in hand** the stage's arrows move the ghost a cell at a
time, starting in the middle of the map, never off it, and a box by its
edges (`stageGeometry.cursorStep`). Each move says the cell and whether
one of the kind in hand is there ("column 5, row 9, a Scoreboard is
here"). Enter or Space is the brush's press at the cursor, and says what
it did. The canvas's name says which keys it takes, placing or not. In
the browser, keyboard only: a Scoreboard taken from its tile with Enter,
placed at column 5, row 9, selected by the arrows and docked along the
bottom from the menu; the game drew it there.

### 6. Documents, the browser, and the ledger

BUILT. SIMPLE_INTERFACE.md lists this phase with the others, says what a
flag decides and does not, and gives the palette's keyboard placement and
the Dock menu a sentence each; DOCKING_PLAN.md points here for docking
from the keyboard. ACCESSIBILITY.md marks the two keyboard gaps closed and
records what steps 3 and 5 opened. In the browser, every scenario opens
and its switcher and breadcrumb walk as before, with no page errors.

## What it left

- **Interface enhancements.** An Interface Actor made from nothing is
  offered no enhancement until "Show everything" is ticked (step 3): the
  shelf has two for an interface and neither fits a bare actor. A hover
  look, a press sound and focus on Tab are the obvious first ones.
- **The checklist's fold is decided once**, when it first draws, so
  "Show everything" opens every row.
- **The toolbox's `define drawing`** in a plain `.actor` file is still 32
  by 32 (step 4).

## Not in this phase

- An AI picture for an Interface Actor.
- Flags on a project's own rules, which say nothing and are offered
  everywhere.
