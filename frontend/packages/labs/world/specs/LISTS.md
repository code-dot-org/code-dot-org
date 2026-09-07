# Lists of values

## The problem

The language can hold one number, one word, one vector, and any number of
ACTORS. It cannot hold two numbers.

That is the biggest single gap in the progression (`specs/PROGRESSION.md`), and
it is not a gap in the abstract: it is four lessons that cannot be written and
one rule that was written around it.

- **A list of high scores.** Memory teaches a variable and cannot teach an
  array, so "remember the best three" is not sayable.
- **A script.** `story/script` writes its lines as a chain of
  `if ⟨line⟩ = ⟨2⟩ → say ⟨…⟩`, one `if` per line, because the lines cannot be
  the data they obviously are.
- **`random from a list`** — a taunt, a spawn point, a card. There is
  `random integer` and `random place`, and nothing that picks one of a set the
  learner wrote down.
- **A grid.** `simulation/emergent` and every tile-state puzzle wants a store
  addressed two ways. A SEPARATE question, not a later part of this one — see
  "what is deliberately not solved" below for why it is not waiting on the
  index.

And the rule: **History's tape is eight properties called `one move ago` …
`eight moves ago`**, written out because a rule's state is a fixed set of named
slots and there is no list of places in the vocabulary. It works, the depth is a
documented limit, and it is the clearest evidence in the repo of what is
missing — a stack, spelled as eight variables.

## What exists, and why it does not answer this

`specs/ACTOR_LISTS.md` gave the language lists of ACTORS, and did it without a
new type: an actor value is one actor or several, every actor socket takes
either, and the rule for what an operation means over several is two functions
(`WorldLab.each`, `WorldLab.one`). That design is why `for each`, `filter`,
`take`, `count of` and the rest exist and read well.

It does not extend to values, and the reason is the socket. Every actor socket
accepts an actor value because there is one kind of actor thing; a Number socket
cannot accept a list of numbers, because `⟨x⟩ + ⟨the high scores⟩` means
nothing. **A list of values has to be its own type**, and that is the decision
this document is about: it is the second value type the actor design was written
to avoid, and the argument that avoided it there does not carry here.

## Three ways, and the one to take

**A. Register Blockly's `lists_*` category.** They exist, they generate, and
they are free. They are also a vocabulary in somebody else's voice — `in list
⟨…⟩ get ⟨#⟩ ⟨1⟩`, `list ⟨…⟩ set ⟨#⟩ ⟨1⟩ to`, sublists, `lists_repeat` — with
eleven blocks where this lab would want six, and index phrasing on every one of
them. Beside `for each actor ⟨each⟩ in ⟨any Coin⟩`, they read as a different
product bolted on. Cheapest, and the shape is wrong.

**B. A list value in the lab's own voice.** One new socket check (`List`), one
variable flavour, one property type, and blocks shaped like the actor ones:
`add to`, `how many in`, `for each`, `is in`, `empty`, `item of`,
`random from`. Most of the machinery has been built twice already — typed
variables (`blockly/typedVariables`), a property type (`engine/core/types`), a
loop over a source (`world_for_each`) — so the work is composition rather than
invention.

**C. Neither; answer each lesson narrowly.** A `words` property for a script, a
`random of` block over actors, and the gap stays. It is a real option and it is
the one being taken by default today.

**Take B.** The cost is a second type in a language that has been proud of
having one, and the honest reading of that pride is that it was about ACTORS —
one color of actor variable, one socket check, no `ActorList` beside `Actor`.
A list of values is not a second way to say the same thing; it is a thing the
language cannot say at all.

## Where a list may live

**In a variable**, like every value: a loop's binding, a rule's local, a
parameter. That covers everything within one step.

**And in a PROPERTY** — as actors already can. That is worth saying plainly
because `ACTOR_LISTS.md` says the opposite and has been wrong since the day
`PropertyType` grew `actors`: Collection keeps `collected`, Inventory keeps
`things`, Collisions keeps `contacts`, and Camera Follow keeps one actor. What
an actor property cannot be is SNAPSHOTTED, and that is the difference a list of
values makes.

`World.snapshot()` skips a property holding actors, because an actor holds the
world that holds it and the snapshot is compared by stringifying — a cycle that
throws. Three things follow, and they are all about a rebuild rather than about
storage:

- a hot reload cannot PATCH one, so a value a learner edits in a bag is not a
  value they can turn while the game runs;
- a restart does not carry one, which is right for scratch (`contacts` is
  recomputed every tick) and merely accepted for a bag;
- the map editor cannot author a list of them — a single `actor` property can be
  a placement's reference to another entry by id (`WorldBuilder.loadMap`), and a
  list has no such spelling.

A list of numbers, words or vectors is plain data with no cycle in it. It
stringifies, so it is in the snapshot; it compares, so a reload patches it live;
and it is authorable as data. That is what makes a high-score table survive a
rebuild and History's tape one property instead of eight.

## The blocks

Six, plus the one the actor lists deliberately did without:

```
make a list of ⟨…⟩ ⟨…⟩            a literal, growable like `create with`
add ⟨5⟩ to ⟨scores⟩               the builder, mutating what the variable holds
how many in ⟨scores⟩              the count, reading like `how many actors in`
for each ⟨score⟩ in ⟨scores⟩      the loop, the shape a learner already knows
⟨scores⟩ has ⟨5⟩                  membership, like `⟨actor⟩ is in ⟨…⟩`
empty ⟨scores⟩                    emptying, like `empty ⟨these coins⟩`
item ⟨2⟩ of ⟨lines⟩               ...and the index
```

**The index is the difference from the actor design, and it is forced.** Actor
lists have no `item ⟨3⟩ of` because every use of one is "walk it" or "how many",
and an index invites off-by-one questions a block language is better without.
The motivating use here is a SCRIPT, where "line three" is the whole point: a
conversation's cursor is already a number counting from one (`rules/conversation`
— "1 is the first line, 0 is nobody talking"), and `item ⟨line⟩ of ⟨lines⟩` is
the block that turns nine `if`s into one. Counting from ONE, to agree with the
cursor that will index it and with Blockly's own convention.

## Decisions

- **One check, `List`, and no element type.** A socket cannot say "list of
  numbers" without generics, and a lab that tried would spend its complexity on
  a promise it could not keep. A list holds plain values; what a learner puts in
  is what they get out.
- **A property says what it holds** — `numbers`, `words`, `vectors` — because a
  stored list has a default and a shape the map editor's inspector has to draw.
  The socket still says `List`.
- **An empty list is ordinary**, as an empty actor value is: the loop runs
  nothing, the count is zero, `has` is false, `item` of nothing is the type's
  zero rather than an error.
- **`add` mutates what the variable holds**, matching `push ⟨actor⟩ to ⟨…⟩`.
- **No sort, no sublist, no reverse in the first pass.** Each is a block nobody
  has needed yet, and the actor lists earned `ordered by` only when `take ⟨3⟩
of` gave it a reason.
- **Not a list of lists.** A grid is a second question (below), and answering
  half of it here would fix the wrong shape.

## What this unblocks

| lesson               | today                                  | with lists                   |
| -------------------- | -------------------------------------- | ---------------------------- |
| `memory/*`           | a variable, and no array               | a list lesson worth its tile |
| `story/script`       | one `if` per line                      | the script as data           |
| `adventure/errand`   | a count                                | the things still to find     |
| `rules/history`      | eight properties written out (now one) | one property, any depth      |
| `rules/conversation` | the project maps index → words by hand | `item ⟨line⟩ of ⟨lines⟩`     |

## What is deliberately not solved

- **A grid, or a list of lists.** `simulation/emergent` wants one. It needs
  either nesting (a list whose items are lists, which the single `List` check
  admits and nothing else supports) or a `grid` type of its own with `⟨grid⟩ at
⟨x⟩ ⟨y⟩`. The second is probably right and is its own document.

  **AND IT IS NOT WAITING ON THE INDEX**, which is what both this document and
  the catalogue used to imply. The index is held back because a position in a
  sequence invites an off-by-one and leaves "past the end" to answer (item 3
  above). A grid has neither: `at ⟨3⟩ ⟨7⟩` is a pair of coordinates, the same
  shape as `set position of`, and off the edge of a declared rectangle is a
  question the grid can answer for itself because it knows how big it is. So
  the flat-list-plus-index spelling is the one with the open question in it,
  and it also asks a learner to write `row × width + column` — the arithmetic
  this lab removes elsewhere, which is why `within` exists.

  **What wants it is cells that are VALUES, not cells that are THINGS.** A tile
  puzzle does not: an actor per cell is idiomatic here and brings drawing,
  collisions and the map editor with it, which is why Sokoban is written that
  way and is better for it. A distance field for a search, a heat map,
  minesweeper's neighbor counts, a cellular automaton — those are numbers in a
  rectangle, and there is nowhere to keep them.

  So the thing that forces it is a lesson whose cells are numbers, the way the
  index's is a lesson that addresses a script by its cursor. Neither exists
  yet, and both are teaching decisions before they are code ones.

- **Element types.** See above; a list of anything is the honest promise.
- **Sorting.** A high-score table wants it the moment there are more than three
  scores. It arrives when a lesson asks, the way `ordered by` did.

## Plan

1. ✅ **The type.** `List` as a socket check, a `list` variable flavour
   (`typedVariables`), and the engine's `PropertyType` gaining `numbers`,
   `words` and `vectors`. Snapshot and reconcile fall out — they are plain data,
   and a test says so rather than the sentence alone.

   **A list is copied on the way in** (`core/lists`), which is the one thing
   this step had to get right. A property's default is one value held by the
   trait that declared it, so a list stored by reference is one array behind
   every actor that elected the trait: two players, one bag, and every coin
   either of them picked up in both. `Traited` and `World` coerce through the
   same door, and a `vectors` list holds Vectors however its items were written
   — a `.map` file has `{x, y}` in it and a block hands over the real thing.

2. ✅ **The blocks.** Nine in a `Lists` drawer, and three of them are Blockly's
   own: `lists_create_with` for its MUTATOR — the thing that makes a literal
   growable, and a hundred lines to write twice — with `lists_create_empty` and
   `lists_length` beside it, all three reworded into this lab's voice through
   the one file that writes to `Blockly.Msg` (`colorMessages`). The check they
   report, `Array`, is what everything here agrees on for the same reason: it is
   a string two sockets share and nothing a learner reads.

   The rest is written: `add … to`, `empty`, `has`, and a `for each` per kind of
   thing. **Three loops rather than one with a dropdown**, because what a
   dropdown would choose is the TYPE of the variable it binds, and a variable's
   type is fixed once it is made — switching it would need the find-rename-or-
   replace machinery `define block`'s designer has and nothing else here does.
   They read as a family with `for each actor`, which was the first of them.

   **A drawer nobody has earned is shown to everybody**, which is how the shelf
   gating works and why this step ends with a TILE as well as blocks: without
   one, a learner in the first lesson meets a Lists drawer. `memory/lists`
   grants the category — eleven blocks that are one idea, where the Actor drawer
   is forty-two that are not — and its lesson is the next step.

3. **The index.** `item ⟨n⟩ of ⟨list⟩`, one-based — STILL held back, and now
   for a better reason than caution. It was expected to be forced by step 5, and
   step 5 came and went: History wanted a stack, which is `add … to` and `take
the last off` and `last of`, and Conversation wants no list at all.

   So nothing in the library indexes a list, and the discipline the actor lists
   kept applies — `ordered by` arrived only when `take ⟨3⟩ of` gave it a reason.
   What would give this one a reason is a LESSON: a script addressed by its
   cursor (`say ⟨item ⟨line⟩ of ⟨lines⟩⟩` in place of an `if` per line) would
   force it, and that is a teaching decision rather than a code one — `story/
script` is about the cursor today, and Story does not pass through the tile
   that grants the Lists drawer.

   When it is built, the question to answer first is what "past the end" is.
   The candidates are nothing (an empty word: quiet, and quietly odd in a
   number socket), the nearest one there is (never wrong-looking, silently
   wrong), and a zero of a type the block cannot know. The motivating use will
   decide it, which is why it has not been decided here.

4. ✅ **A lesson.** `memory/lists` — three notes made by three stacks of blocks
   that know nothing about each other, and one list and one loop that make the
   same three. Step three adds a fourth thing and nothing else changes, which is
   the whole of what a list buys.

   Its check has both halves, and needs them: the starter's notes already say
   the right words in the right order, so the run half alone would pass the
   project the lesson starts from. The shape half is what asks for the literal
   and the loop — and a test plays the starter directly to show that the run
   half would have been fooled.

   **The notes are scattered rather than placed**, because a list has no
   numbering in it yet: nothing in the loop can work out where the third note
   goes. That is the first place the missing index is felt, and it is left felt
   rather than answered.

5. ✅ **The rules that were written around it.** One, and it was History.

   **History's eight slots are one list**, and three things went with them: the
   depth, the paragraph explaining why the depth was eight, and the shifting —
   `remember this move` was eight assignments per actor per move to slide the
   tape along, and is now one `add … to`. Undo goes back to the first move of
   the level, which is the forgiving thing `puzzle/undo` asked for and could not
   have.

   It also asked for the vocabulary a stack needs, which is what step 2 had left
   out: `add ⟨v⟩ to ⟨tape⟩ of ⟨actor⟩` and `take the last off ⟨tape⟩ of
⟨actor⟩` — a property's push and pop, generated per list property the way
   the actor list's are — and `last of ⟨list⟩`, the end a stack is read from.
   **Popping is the LAST one, never one by value**: a tape of places holds
   duplicates the moment anything stands still, and "take the one I just put
   on" is what a stack means.

   **What was lost is that the slots were readable.** `three moves ago of
⟨Crate⟩` was a question a project could ask — to draw the ghost of a move, or
   to tell a player they are going in circles — and asking into a list wants an
   index, which is still step 3. The rule's header says so rather than pretending
   the feature moved.
