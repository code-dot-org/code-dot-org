# Plan: Input and Motion onto the map (CANVAS_FIRST.md, step 4)

STATUS: BUILT, pending a look in the browser. The first two regions of
specs/CANVAS_FIRST.md's step 4, after the pilot (specs/PILOT_PLAN.md) was seen
working. The working record, as before.

## What moves, and how far

Four lessons. The rest of Input and Motion are behavior — a handler, a
condition, a tween — and stay where they are.

- **`input/two-hands`, map then blocks.** Its task is swapping one election
  for another. `Enhance Ship…` ticks "Drives like a car"; the Ship then has
  both readings of the four keys at once, which is the lesson's own
  sentence made visible; opening the Ship and deleting the `use trait ⟨Moves
Across⟩` row is what settles it. Step three adds Slows Down, a row in the
  file the learner already has open.
- **`motion/speed`, map then blocks.** The Hero is a placement. Deleting
  the per-frame handler and electing Physics are rows in the Hero's file;
  the SPEED is then a field in the placement's properties, which is the
  lesson's point said in the place the lesson is about.
- **`motion/units`, map.** One number, in the inspector. The Ball is a
  placement carrying a speed, and the whole lesson is changing it.
- **`motion/drag`, map then blocks.** The Ball's speed is a field, and
  electing Slows Down is a row in its file.

## Decisions taken before building

- **A lesson moves as far as the lab can take it, and no further.**
  CANVAS_FIRST.md's table said `input/two-hands` was "swap one ability for
  another in Enhance" and `motion/drag` "an ability and a field". Neither is
  quite true: Enhance only ADDS, so it cannot take `Moves Across` off, and
  there is no row for Drag or for plain Physics — the checklist is written
  in game-shaped abilities ("Drives like a car"), and "elects the Physics
  rule" is not one. Inventing rows to make the table true would put the
  engine's vocabulary in a list written to avoid it. The table is corrected
  instead.
- **Electing by hand is not a consolation prize.** `motion/speed` is ABOUT
  electing, and `input/two-hands` about two elections fighting. The elected
  row is the subject of both, and Enhance is the thing that hides it
  — which is why `input/arrows` opens the Hero afterwards
  (specs/PILOT_PLAN.md). These two keep the row in front.
- **A value set on ONE placement, not on the kind.** `motion/units` and
  `motion/drag` set a speed in the inspector, which writes the placement's
  own override. That is the difference the map teaches and a block in the
  world could not: this Ball, not every Ball.
- **Show me links as each lesson moves**, and the registry test holds them
  (specs/SHOW_ME_PLAN.md).

## Order of work

1. The four lessons, their tiles' words, their Show me links.
2. The tests: each solved on the map and in blocks, the toolbox table, the
   lists of which lessons open on the map.
3. Specs: CANVAS_FIRST.md's table corrected and its step marked, this
   record.

## Commits

- `98c2c8d0a0d` — this plan.
- (next) — the four lessons, their tiles' words, their Show me links and
  their tests; PROGRESSION.md and CANVAS_FIRST.md.

## Learned while building

- **A placement names a property by the TRAIT's id, not the rule's.** A
  speed is `Can_Move.velocity`, where the block that sets one is
  `world_set_Physics_VelocityProperty`. The lab was asked rather than
  guessed: a scratch test compiled a lesson and printed every
  `owner.property` the rules and traits in play declare. `positional.*` is
  the same shape, which is why a placement's position sits under a word
  that is in no rule's name.
- **No check changed, again.** All four are outcome checks, and a speed
  read off a placement is the same speed. Two of the four tests went on
  passing for a poorer reason — they edit `main.world` as text, and the
  number they replace is now in the map rather than in a block, in the same
  file. They edit the placement outright now, so that what they prove is
  what the lesson does.
- **Enhance only ever adds.** `input/two-hands` is a swap, and a checklist
  cannot take a row off. That turned out to be the better lesson: tick the
  second reading on, watch two rules read the same four keys and each do
  exactly what it says, then delete the row. A test holds both halves —
  both readings at once FAILS the tile's check, and deleting the row
  passes it.
- **An inspector field is a value on ONE thing, and the lessons say so
  now.** `motion/speed` ends by noting that a second Hero placed beside the
  first stands still; `motion/units` that nothing about what a Ball IS has
  changed. That distinction has no cheap telling in blocks, and it is the
  map's to teach.
- **A stale number, found by moving the words.** `motion/units` said the
  world was 384 across in one line and 320 in the next, and asked for the
  speed that crosses 384. The tile's check has always said 320.

## Not built, and known

- No Enhance row brings Physics or Drag, so `motion/speed` and
  `motion/drag` elect by hand. That is right for `motion/speed`, which is
  about electing, and merely unavoidable for `motion/drag`.
- The other lessons of Input and Motion are behavior — a handler, a
  condition, a tween — and stay in the workspace, as the table says.
- `motion/units` points at nothing: its one control is a field, and the
  registry has no name for a property in an inspector. Its own sentence
  says where to look.

## What to look at in the browser

`input/two-hands`: after the tick, holding left should turn the Ship AND
slide it sideways, which is step two's whole point; after the row is
deleted, only turning. `motion/speed`: the Hero's properties should gain a
**Can Move** group with a **Velocity** in it the moment the trait is
elected, without a reload. `motion/units`: typing 1.6 into that field and
running should cross the world in about two seconds. `motion/drag`: the
Ball's speed on the map should change how far it coasts.
