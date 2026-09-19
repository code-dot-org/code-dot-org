# Plan: a rule's world properties in the world inspector

STATUS: IN PROGRESS. The one sentence of specs/MAP_FIRST.md that was never
built, found again by specs/PLACE_MEMORY_PLAN.md when `memory/score` could
not move. The working record, as before.

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
  strength, the target score. Each says which rule it came from.
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

(recorded as they land)

## Learned while building

(recorded as it happens)
