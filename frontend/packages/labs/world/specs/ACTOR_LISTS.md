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
4. **Building one.** `push`, `clear`, `count of`, `is in`.
5. **What it was for.** Whichever of the three storage answers above collision
   turns out to want — decided there, not here.
