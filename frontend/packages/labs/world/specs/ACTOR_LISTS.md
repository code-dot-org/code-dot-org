# Actor lists

## The problem

The language can name one actor and it can walk every actor, and there is
nothing in between. `for each actor ⟨each⟩ where …` iterates the world and
filters; an `Actor` variable holds exactly one. So a rule cannot say "the coins
this actor touched", "the three nearest enemies", or "everything in the blast" —
it can only re-derive such a set by walking the world again with a predicate,
which works while the predicate is a property of the world and not of what
already happened.

Collision is the case that forces it. Splitting detection from response
(specs/COLLISION.md, if it lands) means one step works out WHO is overlapping
and another decides what to do about it, and between them somebody has to hold a
set of actors.

## The construct

There is no new type. An ACTOR VALUE is one or more actors — `this actor` is one
of them, `any ⟨Coin⟩` is all of them, and a variable holds whichever it was
given. One colour of variable, one getter, one socket check, and no question
about what may plug into what.

The alternative was an `ActorList` type beside `Actor`, and it was rejected:
a second type is a second thing to teach, a second getter to find in the
toolbox, and a wall of sockets that reject each other for reasons a learner has
to learn before they can build anything. The cost of not having it is one rule,
below.

## The blocks

```
for each actor ⟨each⟩ in ⟨any Coin ▾⟩ where ⟨…⟩     the loop, given a source
all actors                                          every actor in the world
push ⟨this actor⟩ to ⟨these coins⟩                  appending
clear ⟨these coins⟩                                 emptying (a per-tick set)
count of ⟨these coins⟩                              how many
⟨this actor⟩ is in ⟨these coins⟩                    membership
```

Every one of these takes an ordinary actor value, so they work on `this actor`
as readily as on a variable holding twenty. `any ⟨Coin ▾⟩` is the block that
already exists, not a new one — see below.

`for each` grows a source socket. Its generated code barely changes, because it
already iterates something iterable:

```js
for (const each of world.actors) { if (where) { … } }   // today
for (const each of <source>) { if (where) { … } }       // with a source
```

`world.actors` is iterable, `world.actors.with(trait)` returns an array, and a
list variable is an array — so any of them may be the source, and only the
socket is new. The `where` socket stays: filtering a list is as useful as
filtering the world, and dropping it would break every loop that exists.

## `any ⟨Coin⟩` is already the list

Its own tooltip says so: "Every actor of this kind — the ones placed now and the
ones placed later." A second block reading `every ⟨Coin⟩` would be two blocks
for one idea, and a learner asked to tell them apart would be right to complain.

What differs is not the meaning but what the meaning COMPILES to, and that is
decided by where the block lands:

- in a hat's subject socket, it is the actor's TEMPLATE, so registering the
  handler on it reaches every coin — including the ones placed later, which is
  the half of the tooltip a list cannot honour;
- as a loop's source, it is every coin that exists at that instant.

Same words, same idea, two compilations. The block's generator asks what it was
plugged into: a hat's subject socket gets the TEMPLATE, every other actor socket
gets the actors. It reports `Actor` either way, because either way that is what
it is.

"The ones placed later" is not a loophole in the loop. A standing arrangement
can cover actors that do not exist yet; an action taken now cannot, and no
wording would make it. `for each actor in ⟨any Coin⟩` walks the coins there are.

Every actor socket keeps the one check it has, `Actor`, and every actor value
fits every actor socket. The kind block's generator asks what it was plugged
into: a hat's subject socket gets the template, everything else gets the
actors.

## One value, many actors: what an operation means

A block that acts on an actor and a block that reads one want different things
of a value holding several, so the rule has two halves:

- **A statement BROADCASTS.** `set position of ⟨any Coin⟩` sets every coin;
  `hide ⟨this actor⟩` hides the one. An empty value does nothing, which is what
  a loop over nothing does.
- **A value READS THE FIRST.** `x position of ⟨any Coin⟩` has to answer with a
  number, so it answers with the first coin's. An empty value reads as the
  type's zero.

Broadcasting is the natural reading and carries no surprise. Reading the first
is the price of one type, and it is the only place this design is quieter than
it should be: a learner who asks a question of many actors gets an answer about
one of them and is not told. Two things keep it small — `count of ⟨…⟩` exists,
so "how many is this?" is askable; and the question a learner actually means
("are ANY of them on the ground?") is a loop, which the language already reads
better than a query would.

## What the generator emits

The engine does not learn about lists. An actor value is `Actor | Actor[]`, and
the generator normalises at the two kinds of site with two helpers:

```js
WorldLab.each(actor, a => a.set(PositionProperty, v)); // a statement
WorldLab.one(actor).get(PositionProperty); // a value
```

`each` walks one or many; `one` takes the first, or undefined. The subject a
handler is called with stays a plain `Actor`, every engine signature stays as it
is, and the whole of "actors are lists" lives in two functions and the
generators that call them.

## Where a list may live

**Not in a property.** `PropertyType` is `number | boolean | string | vector |
point` — plain data, and deliberately: `World.snapshot()` puts every property's
value into the hot-reload baseline and the reconciler compares by
`JSON.stringify`. An Actor holds `actor.world` and the world holds its actors,
so a property containing actors is a circular structure and stringifying it
throws — hot reload would break on the first frame anything touched anything.
Storing ids instead of references would fix the cycle and still needs a list-of
-strings property type, which does not exist either.

So a list lives where values live now: a loop variable, a local, a parameter, a
query's result. That covers everything within ONE step.

**What it does not cover, and collision needs:** state carried from one step to
another inside the same tick. Three ways to get it, none of them this spec's:

1. **Rule-scoped state** — a `let` at the top of the generated rule module,
   declared by a block and readable by that rule's own steps. The smallest
   addition, and the natural home for per-tick scratch: the rule that fills it
   is the rule that empties it.
2. **An engine-owned buffer**, as the keyboard has one. `for each newly pressed
key` exists because "what changed this frame" is what a rule cannot work out
   for itself; contacts are the same shape of fact. Bigger, and it moves
   knowledge back into the engine that was just moved out.
3. **One step** that detects and responds together — today's arrangement, and
   the thing splitting collision is meant to end.

## Decisions

- **`push` mutates what the variable holds**, because a set built across a loop
  is the whole point, and two variables naming one value see each other's
  pushes. The exception is a value that is not a list yet: pushing onto a
  variable holding one actor makes a list of two, and leaves the actor that was
  in it alone.
- **A source is read once, at the top of the loop**, not watched: `any ⟨Coin⟩`
  as a loop's source is the coins there are when the loop starts, so a rule that
  spawns coins while iterating them terminates.
- **Order is the world's order** — the order actors were added, which is what
  `world.actors` already yields. Not sorted, not stable under removal; a rule
  that cares must sort, and there is no sort block yet.
- **An empty list is ordinary.** `for each` over it runs nothing, `count of` is
  0, `is in` is false. No block reports "nothing found" as a distinct thing.
- **No index block** (`item 3 of …`) in the first pass. Every use so far is
  "walk it" or "how many", and an index invites the off-by-one questions that a
  block language is best off not having.

## Plan

1. **The two helpers.** ✅ `WorldLab.each` and `WorldLab.one`, every generator
   that touches an actor socket routed through them, and `any ⟨Kind⟩`'s second
   compilation (`world.actors.ofType(…)`) so that something can be many at all.

   The wrapper is emitted only where the value COULD be many — which today
   means only where `any ⟨Kind⟩` is plugged in — so every existing file's
   generated code is unchanged, character for character. A VARIABLE will be
   able to hold several once `push` exists (step 4); that is the moment
   `actorTarget` has to start asking where a variable came from.

2. **The loop takes a source.** ✅ `for each ⟨var⟩ in ⟨source⟩ where ⟨…⟩`, an
   ordinary `Actor` socket seeded with `all actors`, so a loop dragged out
   today generates what one dragged out yesterday generated: the default source
   emits `world.actors` — already every actor, already iterable — and anything
   else goes through `WorldLab.all`. A real `for … of` either way, because a
   body may `return` out of the query it is in.
3. ✅ `all actors` (step 2) and `any ⟨Kind ▾⟩`'s second compilation (step 1).
4. **Building one.** ✅ `add ⟨actor⟩ to ⟨var⟩`, `empty ⟨var⟩`,
   `how many actors in ⟨…⟩`, `⟨actor⟩ is in ⟨…⟩`. The variable is a FIELD on the
   first two, because they change what a variable HOLDS and a socket hands over
   a value rather than a place to put one.

   This is where a variable stopped meaning one actor, so `actorTarget` stopped
   guessing: `blockly/manyActors` reads the workspace and answers whether a
   variable could hold several — a `add`/`empty` naming it, or an assignment
   from something already many, carried along a chain of assignments to a fixed
   point. Wrong in the cautious direction costs a wrapper nobody reads; wrong
   the other way is a broadcast that never happens.

5. **What it was for.** Whichever of the three storage answers above collision
   turns out to want — decided there, not here.

## Filtering, ordering, and taking one (the second pass)

The first pass gave the language a list and two ways to make one: walk the world
with a predicate (`for each … where`), or build one an actor at a time
(`add … to`). What it never gave was an EXPRESSION that hands a list back. "The
gold coins I am touching" was four blocks and a variable — `empty ⟨mine⟩`, a
loop, a test, `add ⟨each⟩ to ⟨mine⟩` — to say one thing.

So the filter becomes a value of its own, and the two blocks that had a
predicate welded onto them give theirs up:

```
the actors ⟨c⟩ in ⟨…⟩ where ⟨…⟩                 a list, filtered
the actors ⟨c⟩ in ⟨…⟩ ordered by ⟨…⟩ ⟨least first ▾⟩   a list, sorted
the actor  ⟨c⟩ in ⟨…⟩ with the ⟨least ▾⟩ ⟨…⟩     one, by a key
first actor in ⟨…⟩                               one, by position
take ⟨3⟩ of ⟨…⟩                                  a shorter list
all actors with trait ⟨T ▾⟩                      the common filter, said once
```

`for each actor ⟨each⟩ in ⟨…⟩` loses its `where`, and
`first actor ⟨v⟩ in ⟨…⟩ where ⟨…⟩` is deleted outright. Both were the same
construct — a variable, a source, a test — and the only thing that differed was
what came out of the end. Now the filter is the construct, and what comes out is
whatever block you wrap it in.

### Why the composite goes, having argued for it

`first actor … where` shipped with a comment defending itself: "the alternative
is a paragraph… 'The coin I am touching' is one thought and should be one
block." That was true against the alternative it was compared with, which was
five blocks and a bug. It is not true against `first actor in ⟨the actors ⟨c⟩ in
⟨…⟩ where ⟨…⟩⟩`, which is two blocks, composes with everything else here, and
does not have to be reinvented for `ordered by` and `take`.

The same argument retires the loop's `where`. A loop that walks a list is one
idea; testing each item as it goes is a second idea welded on, and it was welded
on because there was nowhere else to put it. Now there is.

### What it costs, and the block that pays for it

Nearly every loop in the stock rules filters: 18 of the 20, of which two are
`where: yes()` and simply lose a socket. The other 16 gain a nesting, and with
it a second variable field showing the same name:

```
for each actor ⟨each⟩ in ⟨the actors ⟨each⟩ in ⟨all actors⟩
                          where ⟨each has trait ⟨Affected by Gravity⟩⟩⟩
```

Legal — Blockly variables are workspace-wide, and the filter's field defaults to
the enclosing loop's variable when it is dropped into a source socket — but two
fields for one name is noise, and it lands on the files a learner opens to read
how gravity works.

`all actors with trait ⟨T⟩` is what makes the trade worth taking. Ten of those
eighteen predicates are a bare trait test, `ActorCollection.with` already
answers it in the engine, and the block has one dropdown and NO variable:

```
for each actor ⟨each⟩ in ⟨all actors with trait ⟨Affected by Gravity⟩⟩
```

which is shorter than what it replaces. The general filter is then left doing
what only it can: the four compound tests and the two set-differences in
Collisions and Solid Bodies.

### Ordering: two blocks, because "closest" is not a sort

`ordered by` sorts. `with the least ⟨…⟩` selects. The second is not sugar for
`first actor in ⟨ordered by …⟩`: it is one pass and no allocation, where the
sugar spelling sorts n actors to answer a question about one. Since "the closest
enemy" and "the biggest asteroid" are the whole of what a game usually asks, the
selector is the block that will be used and the sort is the rarer one.

The key is an expression over a bound variable, not a dropdown of built-in
orderings, so `closest`, `furthest`, `biggest`, `weakest` and `newest` are one
block with different keys rather than five blocks. `least`/`most` is a field
because reversing an order is not a different question.

Ties keep the world's order: the source is snapshotted before the sort and
`Array.prototype.sort` is stable, so two actors with equal keys come out in the
order they were added — the same order everything else here yields.

`take ⟨n⟩ of` exists because a sort without it is a list nobody wanted. "The
three nearest" is the reason to order at all.

### Laziness, and the short-circuit it keeps

`first actor … where` stopped at the match — its comment says so, and deleting a
block should not delete what it promised. So `the actors … where` does not build
an array. It hands back a sequence that filters as it is walked, and `first
actor in` pulls one item and stops.

Three constraints keep this from being a third type:

- **The SOURCE is read eagerly, the predicate lazily.** `world.actors` iterates
  the live actor list — `ofType` and `inLayer` copy, `all actors` does not — so
  deferring the read would make `for each` over a body that spawns actors fail
  to terminate. The source is materialised when the filter is built; only the
  test is deferred.
- **It is RE-ITERABLE.** Walking it twice gives the same actors both times. A
  one-shot generator that reads empty the second time is a bug nobody would
  diagnose from the blocks. The cost is that the predicate runs again, which is
  fine for tests that read properties and is the only kind this language can
  write.
- **`all` and `one` are the only doors.** Everything downstream already routes
  through them, `Traited.coerce` materialises before storing, and no other code
  learns that a value can be lazy.

`ordered by` is strict and cannot be otherwise — the first item of an ordering
is not knowable without seeing all of it — which is the second reason `with the
least` is its own block rather than sugar.

NOT generator-side fusion, which was the other way to get the short-circuit and
would have been idiomatic here: `any ⟨Coin⟩` already compiles two ways depending
on the socket it lands in. It was rejected because it only fires on the literal
nesting — a variable holding a filter would not fuse — so two programs that read
the same would perform differently, and because an optimisation that lives in
the runtime is one function rather than a peephole pass over the workspace.

### What a source socket starts as

`all actors` was the default for every list's source, and it was the default
because it was the only list there was. It is almost never the list somebody
wanted: a game asks about the coins, the enemies, the things it is touching.

So the four blocks that TAKE a source — `for each`, `the actors … where`,
`ordered by`, `with the least` — start as `any ⟨Coin ▾⟩` instead. The change is
worth making because of what it costs to correct: a wrong dropdown is one click,
a wrong block is a trip to the toolbox. `first actor in` and `take ⟨n⟩ of` keep
`all actors`, because what goes in those is almost always another list block, so
the shadow is replaced by a drag either way.

**Except in a `.rule`**, where it stays `all actors`. A rule is generic over the
actors that elect its traits — it says "everything with this trait", never
"every Coin" — and the dropdown there would offer a rule author precisely the
thing they must not name. A shadow may now be a FUNCTION of the block it is
attached to (`blockly/valueShadow`), and this one asks the workspace whether a
`world_rule` root is in it, the way `ownTraitOptions` asks about traits.

This needed one fix first, and it is worth stating because it was nearly a
silent one. `any ⟨kind⟩` with nothing chosen used to compile to `actor`, the
block's own subject. That is right on a HAT — `when ⟨any …⟩ …` with no kind is a
handler on the actor the file is about — and it is a trap in a list source: an
untouched shadow would make `for each actor ⟨each⟩ in ⟨any ⟨…⟩⟩` run its body
exactly once, on the subject, looking like a loop the whole time. Outside a
hat's subject socket it now emits no actors, which is the bargain every other
unfinished dropdown here makes.

### Plan

1. ✅ **The engine's half.** `filtered`, `ordered`, `taken`, `firstOf`,
   `extreme`, and the re-iterable `LazyActors` the first three hand back; `all`,
   `one`, `pushed` and `Traited.coerce` widened to know it. `ActorSource` is
   the wider argument type these take, for the reason `firstWhere` took an
   `Iterable`: the generator hands them exactly what a `for … of` walks.
2. ✅ **The blocks that add power**, which break nothing: `the actors … where`,
   `first actor in`, `all actors with trait`, `with the least/most`,
   `ordered by`, `take n of`. All six are in `manyActors`' MANY_BY_TYPE — the
   last three are zero-or-one rather than guaranteed-one, which needs the same
   broadcast wrapper a many-valued one does.
3. ✅ **The blocks that lose one.** `for each` drops `WHERE` and
   `first actor … where` is deleted. NO MIGRATION, because there is nothing to
   migrate from: neither block has shipped, and the only saved workspaces that
   hold one are the stock rules, which are generated (step 4). A pass to
   rewrite them was written and then removed — the two blocks are expressible
   in the new ones, so if a saved project ever needs it, it is a rewrite and
   not a loss.
4. ✅ **The stock rules**, regenerated through the DSL (`yarn build:rules`),
   which is where the readability of all this is actually decided. Seven loops
   took `all actors with trait` and came out shorter than the
   `for each … where` they replaced; two dropped a `where: yes()` that said
   nothing; the remaining nine wrap a `filter`. `forEach` THROWS on a leftover
   `where` rather than dropping it, because a silently dropped predicate is a
   body that runs over everything.

Not done, and deliberately: `last of`, an index block, and a sort key that is
not a number. The first two are ACTOR_LISTS' original "no index block" argument
still holding; the third has no use yet that `ordered by` a number cannot say.
