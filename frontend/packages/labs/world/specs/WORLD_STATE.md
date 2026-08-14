# A world's own state

## The problem

Three scenarios end by telling the console something the player cannot see, and
all three end that way for one reason: **nothing in a world can remember a
number.**

Tapper clicks a coin and logs `Got one!` rather than a count. Its comment says
why — "the count belongs to something that outlives a mark" — and that was
written before a Label existed. Now a Label exists and can be told what to say,
and the sentence is still true, because the thing that works out what it should
say has nowhere to live.

State in this lab belongs to a declaring scope, and there are three:

| declared in           | belongs to | reached from                     |
| --------------------- | ---------- | -------------------------------- |
| a rule, at rule level | the world  | anywhere the rule is in play     |
| a rule, under a trait | each actor | anywhere the rule is in play     |
| an `.actor` file      | each actor | that file only (`ownProperties`) |

A world is not on that list. A `.world` file can place actors, wire cameras,
declare layers and handle events — and it cannot declare one number.

The workarounds are all worse than the gap. A rule holding the score makes the
score a shared mechanic, importable into other projects, named in a second file.
An actor holding it (a scoreboard's own property) works exactly until something
that is not the scoreboard wants to read it, which is the coin. And a `for each`
variable is gone at the end of the tick that made it.

## The construct

**`define property` in a `.world` file**, chained under `define world` where
`use rule` and `load map` already sit:

```
define world named ⟨Tapper⟩ with ⟨6 rules⟩
  define property ⟨number⟩ ⟨score⟩ = ⟨0⟩
  create ⟨Coin⟩ in map ⟨…⟩

when ⟨any Coin⟩ is clicked with ⟨left⟩
  set ⟨score⟩ to ⟨⟨score⟩ + ⟨1⟩⟩
  set text of ⟨any Score⟩ to ⟨join ⟨"Score: "⟩ ⟨score⟩⟩
```

**It is the same block, in a fourth home.** `world_rule_property` already takes
its meaning from where it sits — at rule level it is world-scoped, under a trait
it is actor-scoped, in an `.actor` file it is that kind's own — and `ownProperties`
records that a third site "is what it was already built for". So is a fourth. A
separate `define world variable` block would be the near-identical sibling this
codebase keeps refusing, and it would invite dragging the familiar one into a
world and finding it inert.

**It generates a property, not a variable.** The obvious cheaper answer is a
module-level `let` in the generated world: handlers are closures in the same
module, so they would see it, and nothing in the engine would have to change.
That was rejected for three reasons, in order of weight:

1. **Hot reload.** `WorldSnapshot` compares every property by `${owner}.${id}`
   and patches a running world when only values changed (PLAN §9). A `let` is
   invisible to it, so every edit to a world would restart the game and reset
   the score. A property is exactly the thing that machinery is about.
2. **One way to declare state.** The lab has `define property` and a learner who
   has met it in a rule or an actor should find it means the same thing here.
   Two spellings for one idea is a thing to learn before you can read anybody's
   project.
3. **A property is introspectable and a binding is not.** The map editor's
   inspector, `watchProperty`, and the snapshot all work on properties.

## Where it lives at run time

`WorldBuilder.defineProperty(id, type, default)` — the exact sibling of
`ActorBuilder.defineProperty`, which is what an `.actor` file's own declarations
already compile to.

**NO RULE IS INVENTED.** An earlier reading synthesized one per world to own
them, because `World`'s property store is seeded from the rules in play. It
works and it is wrong for the same reason `ownProperties` gives about traits: a rule
is something imported, shared between projects, and named by `use rule`, and
this is none of those. It would put a rule the learner never wrote into
`activeRules()`, into the rules panel, and into the count on their world block.

So the World seeds these slots directly, the way an Actor seeds a kind's own
properties from the overrides it is built with. `world.get` and `world.set`
already take any `Property`; what is new is a second source of them.

## What it is reachable from

**The declaring file, and only it.** `BlocklyFileEditor` hands the palette the
properties of the file being edited, which is what already scopes an actor's own
state to its own file. A world's own state gets the same treatment, and it is
the right answer for the same reason: a world's score is that world's, no other
file imports it, and renaming or deleting the world cannot dangle a reference
somewhere else.

Two things follow, both wanted:

- **A rule cannot read it.** A rule is shared between projects and a world's
  score is not a mechanic. A rule that wants a number takes it as a parameter or
  declares its own.
- **The handlers can**, because a `.world` file's event handlers are top-level
  blocks in that same file. That is the whole of the score's problem solved.

## Decisions

**`readonly` means a constant.** As in an `.actor` file, and for the same reason
given there: a world's declaring scope is a DECLARATION with no body to run a
`set` in, so read-only means no setter is generated at all. That is how a world
says `gravity strength = 9` once and means it.

**The block type is keyed by the world's name.** `world_get_<World>_<Prop>Property`,
which is `memberKey` doing what it does for a rule and for an actor's own
properties. It inherits that scheme's hazard: renaming the world changes its own
properties' block types, and the workspace's existing blocks become stand-ins
(`standInBlocks`) generating `null`. Actors have carried this since their own
properties landed. It is one bug with one fix — a rename sweep over own-property
keys — and inventing a second keying scheme for worlds would make that fix two.

**No per-instance overrides, because there are no instances.** An actor's
properties are edited per placement in the map editor. A world is placed
nowhere; its declaration IS its value.

## What it takes

1. **`WorldBuilder.defineProperty`** and `ownProperties`, mirroring
   `ActorBuilder.defineProperty` — and seeding `World`'s store from them.
2. **`parseWorldOwnMeta`**, `parseActorOwnMeta`'s sibling, reading the chain under
   `world_world` instead of `world_actor`.
3. **`ownPropertyDeclarations`** generalized, or a twin, emitting
   `world.defineProperty(…)` into the world's module before anything reads it.
4. **The palette** — `buildDomainPalette` already takes an own-property list;
   this is the same list with `scope: 'world'`, so the get/set blocks it mints
   need no new code, only to be passed in from a `.world` file.
5. **`ROOT_HOMES` / the toolbox** — `world_rule_property` offered in the World
   category as well as the Rule and Actor ones.
6. **`WorldSnapshot`** to include them, so the hot-reload decision sees them.
7. **Tapper with a score**, which is the whole point and the proof.

## What to check when it is built

- Clicking a coin raises a number a Label shows. That is the test; everything
  else is a way of getting there.
- Editing the world while it runs keeps the score, rather than restarting.
  That is what choosing a property over a `let` bought, and if it does not hold,
  the snapshot half (6) is missing.
- A `.rule` file's palette does not offer a world's own properties, and neither
  does a second `.world`.
- A read-only world property gets no setter anywhere.
- The world block's rule count does not change when a property is declared —
  no rule was invented.
- `yarn setup:world` after anything in `src/engine` moves.

## What the build found

**`refResolves` had been suppressing an actor's own properties since it
landed.** It asks "is the rule this member belongs to still in the project?" and
answers by looking up `ref.ruleName` — which, for a file's own property, names
the declaring ACTOR or WORLD. There is no rule of that name, so the answer was
no: the setter generated nothing and the getter generated the type's dead value.
Nothing caught it because no fixture declared one. `MemberRef.own` says what the
ref is, and `refResolves` answers yes for it — the file holding the block is the
file holding the declaration, so there is nothing that can go missing.

**Declarations are emitted by the world block, not by the module assembler.**
The first attempt appended them after the world block's code, which is wrong
because a world's BODY is part of that code: `add actor … set text to ⟨score⟩`
compiled to a use before the declaration. esbuild rewrites the `const`, so it
threw as "Cannot read properties of undefined" rather than as the
temporal-dead-zone error it was — the same disguise the module assembler already
documents for hoisted world hats.

**`WorldBuilder` needed `get`, and a `set` that does not accumulate.** `world`
in a `.world` file IS the builder, including inside the handlers written there,
so `get score` landed on it and threw. And the builder's deferred `set` logs
every call for replay: a counter incremented on every click would have grown the
log by one entry per click for the life of the game. A property has one value
and the last write wins, so its log entry is replaced in place — alone among the
deferred calls, where order is the meaning.

## What this does not solve

Saving. A world's state is a starting value and whatever the game has done to it
since; nothing here persists across a reload, and nothing should until there is
a reason to say what a saved game IS.
