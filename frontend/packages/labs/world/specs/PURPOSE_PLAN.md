# Plan: game or interface, all the way through (SIMPLE_INTERFACE.md, phase five)

STATUS: IN PROGRESS.

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

### 3. The shelves offer by purpose

The rule shelf, the actor shelf and the enhancement checklist list what is
for the purpose they were opened for, with "Show everything". From the
Actor Editor, the purpose is the actor's; from a block's `(import…)`, it is
the file's actor's, and everything when the file is no actor's.

### 4. A drawing is its box

In an actor with a box, a new `define drawing` starts at `width of this
actor` by `height of this actor`, not 32 by 32 (SIMPLE_INTERFACE.md,
"Interface Actors").

### 5. Docking and placing from the keyboard

- **Dock** in the inspector of a placement on a Screen: which edge of the
  screen, or beside which docked placement and on which side. It does what
  a drop does.
- **With an actor in hand**, the stage's arrow keys move a cursor cell,
  drawn and said aloud, and Enter or Space places one there, or takes one
  away as a press does.

### 6. Documents, the browser, and the ledger

## Not in this phase

- An AI picture for an Interface Actor.
- Flags on a project's own rules, which say nothing and are offered
  everywhere.
