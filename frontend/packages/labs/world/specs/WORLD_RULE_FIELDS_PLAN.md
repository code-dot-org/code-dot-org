# Plan: a rule's world properties in the world inspector

STATUS: BUILT, pending a look in the browser. The one sentence of
specs/MAP_FIRST.md that was never built, found again by
specs/PLACE_MEMORY_PLAN.md when `memory/score` could not move. The working
record, as before.

## What MAP_FIRST.md asked for

> the world's own workspace, with their starting values as fields — beside
> its name, its camera, and its layers. That is where `set target score to
30` goes, and it is a field rather than a block; the `set` block remains
> for a value that changes at run time.

What was built reads the world's OWN `define property` rows and rewrites a
row's DEFAULT (`mapEditor/worldProperties`). A rule's world-scoped property
has no declaration in the world's file to carry a default: its default is
the rule's, and a world that wants another says so with a `set` row under
`define world`. So the field has to read and write that row.

## What is being built

- **The world's window lists a rule's world properties too**, under the
  world's own: the amount of gravity, the biggest reach, the grip
  strength, the target score. Each rule's are a collapsible group under
  the rule's name, as a placement's traits are in its inspector.
- **A field writes the `set` row.** Typing a value rewrites the row's
  literal, or adds the row when there is none; typing the rule's own
  default back REMOVES the row, so a world's file says only what differs
  from the rules it holds.
- **`memory/score` moves**: importing Scoring is a block, and the target
  score it then sets is a field.

## Decisions taken before building

- **The field is the front of a block, and the spec's word "rather than"
  is too strong.** There is nowhere else to put the value: a rule's
  default belongs to the rule, and the world's file says what it wants
  instead. What the field buys is that a learner setting a starting value
  need not find the block, and what it costs is that a row appears in the
  workspace. MAP_FIRST.md's sentence is corrected rather than obeyed.
- **Read-only and computed properties are left out.** Scoring's `won` is
  worked out, and a starting value for it means nothing. `readonly` is
  already on the meta.
- **The types a field may edit are the ones it already edits** — number,
  angle, string, boolean. A vector or a colour is shown and not edited, as
  the world's own are.
- **A `set` row a learner wrote by hand is what the field shows**, and
  editing the field rewrites that row rather than adding a second.
  Two rows setting one property is a thing a world may say, and the last
  one wins; the field reads the FIRST and writes it, which is what makes
  the field and the blocks agree when there is one row and honest when
  there are two.
- **Which rules' properties are offered: every rule the project holds**,
  since that is what the world runs (`world_world` emits `useRules` for
  each). Seven properties across the starter's rules, of which five are
  editable, so the list is short enough to show without folding.

## Order of work

1. `worldProperties`: read a rule's value off its `set` row, and write it.
   Tests, which are pure.
2. The inspector's fields and the map editor's wiring. Tests.
3. `memory/score` on the map; its tile's words. Tests.
4. Specs: MAP_FIRST.md's sentence, CANVAS_FIRST.md's row,
   PLACE_MEMORY_PLAN.md's gap, this record.

## Commits

- `e583d2b2f0e` — this plan.
- `67a32ba69cb` — the read and the write; the inspector's fields and the wiring;
  `memory/score`; the specs.

## Learned while building

- **The rules say which of their properties are theirs to compute.**
  `readonly` on the meta takes out Scoring's `won` AND Collisions' biggest
  reach, which is worked out from what is in the world. Five of the
  starter's seven world-scoped properties are left, which is a list short
  enough to show unfolded — the guess this plan made about the shape of
  the window turned out right for the wrong reason, since it counted seven.
- **A property is keyed by its setter, not its name.** Two rules may each
  have a `strength`, and the world's own properties may too. The field's
  name attribute and the inspector's draft state are keyed by the block
  type, and the group says which rule it came from. (The label said so
  at first, in parentheses; the groups replaced that in Sep 2026, since a
  heading that groups the fields says it once instead of on every row.)
- **Setting a value back to the rule's own takes the row away.** A world's
  file then says only what differs from the rules it holds, which is the
  same bargain a placement makes (`withPlacementLayer`, and the default
  layer said by saying nothing).
- **The row goes at the TOP of the world's rows.** It is a starting value,
  and a row below something that reads it would be too late.
- **A row holding something other than a literal is shown as the rule's
  default.** A world may set its target score to a computed value; the
  field cannot show that, and showing the last literal it happened to find
  would be a lie. What it shows is what a world with no row shows.

## Not built, and known

- A world that sets one property TWICE is read by its first row and
  written to its first row. The last row is what the engine obeys, so a
  world like that shows a value it does not use. Nothing writes two, and a
  learner who does has said something the field cannot say.
- Vectors and colours are shown and not edited, as the world's own are: the
  direction of gravity is a vector, and it is the one world-scoped property
  a learner might reasonably want and cannot have here.
- The camera and the layers that MAP_FIRST.md lists beside the world's
  properties are still the Layers panel's and nobody's.

## What to look at in the browser

Open the starter's world on the Map tab with nothing selected: under the
world's own properties there should be three collapsed groups, **Gravity**,
**Solid Bodies** and **Scoring**; opening them should show **Amount of
gravity**, **Grip strength**, and **Score** with **Target score**, and the
last should read 30, which is what the starter's block
sets. Typing 45 there should change that block; typing 9 into the amount of
gravity should add a row and typing 9 again — the rule's own value — should
take it away. `memory/score` step four should point at the list.
