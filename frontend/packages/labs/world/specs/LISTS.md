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
  indexed two ways. That follows this decision rather than being it.

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
one colour of actor variable, one socket check, no `ActorList` beside `Actor`.
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
| `rules/history`      | eight properties written out           | one property, any depth      |
| `rules/conversation` | the project maps index → words by hand | `item ⟨line⟩ of ⟨lines⟩`     |

## What is deliberately not solved

- **A grid, or a list of lists.** `simulation/emergent` wants one. It needs
  either nesting (a list whose items are lists, which the single `List` check
  admits and nothing else supports) or a `grid` type of its own with `⟨grid⟩ at
⟨x⟩ ⟨y⟩`. The second is probably right and is its own document.
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

2. **The blocks.** The six above, in `domainBlocks`, generating plain JS arrays;
   `WorldLab` helpers only where a shape needs normalising (`item of` past the
   end, `add` to a variable holding nothing).
3. **The index.** `item ⟨n⟩ of ⟨list⟩`, one-based, with the off-by-one written
   down in the tooltip rather than left to be discovered.
4. **A lesson.** Memory's array tile, written the way every other lesson is:
   a starting project that wants a list, and a check that a list is what was
   used.
5. **The rules that were written around it.** History's tape becomes one
   property; Conversation gains nothing but its demo and its lesson get shorter.
   Both are re-recorded and re-checked, and both are optional — the point of
   steps 1–4 is that they are useful without this one.
