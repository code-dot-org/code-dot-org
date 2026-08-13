# Behaviors, and the smallest thing a rule can be

## The problem

A learner who wants an actor to keep doing something has two answers, and until
recently only one of them.

The answer that was always there is a **rule**. A rule is a file: `define rule`,
a `define trait` beside it, `each frame` under that, and then the actor has to
elect the trait. That is the right shape for gravity — a mechanic several kinds
of actor share, that a world can be asked about, that other rules depend on. It
is a great deal of ceremony for "the crosshair follows the pointer".

The answer added first (see `ActorBuilder.defineStep`, and the `each frame`
block standing alone in a `.actor` file) is an actor's **own step**: work a KIND
of actor does every frame, declared in that actor's own file, shared with
nobody. That is the crosshair, exactly. It is also where it stops — a second
kind of actor that wants the same behaviour has to write it again.

So the space looks like this:

|                | state                               | behaviour                  | shared |
| -------------- | ----------------------------------- | -------------------------- | ------ |
| an actor's own | `world_rule_property` in a `.actor` | `each frame` in a `.actor` | no     |
| a rule's trait | a trait's property                  | a trait's `each frame`     | yes    |

The gap is the third row: **shared, without being a rule**. Sprite Lab calls it
a Behavior — a function you write once and add to as many actors as you like,
which is exactly the shape this lands on.

## The construct

A Behavior is a file, `rules/<name>.behavior`, and it is a HAT — a definition
root like every other `define`, with what it holds chained below it:

```
define behavior named ⟨Chase⟩
define property ⟨number⟩ ⟨speed⟩ = ⟨2⟩
set position of ⟨this actor⟩ to …
```

and an actor takes it the way it takes anything else:

```
define actor named ⟨Enemy⟩
  use trait ⟨Chase⟩
```

**A Behavior IS a rule with exactly one trait of the same name.** That is not an
implementation detail to hide; it is the whole design. Everything downstream
already works on `RuleMeta` — the module generator, the registry, the `use trait`
dropdown, `has trait`, dependency order, phases, the rules panel, the rename
machinery — so a Behavior that parses into a `RuleMeta` needs none of it
rewritten. What the `.behavior` file removes is the _vocabulary_ and the two
files' worth of ceremony, not the mechanism.

**And the Behavior IS the step.** There is no `each frame` row inside it: what
follows the hat is what runs, every frame, for each actor carrying it. That is
the same reading a rule's own step roots have (`extractRuleBodies` calls it
`chainBody` — "a step's body is the chain BELOW it… it is an event hat, so what
follows it is what runs"), and it is the reading Sprite Lab's behaviours had,
where a behaviour was a function and nothing else. A row between the definition
and the implementation would be a step inside a step, which nothing else in the
lab has.

It also means outgrowing one has an answer already: a Behavior that wants a
second trait, or a world-scoped property, or an event of its own, becomes a
`.rule`. That is the same eject story the lab already tells for Appearance
(`WorldBuilder.rulesInPlay`) and for a stock rule you import and then edit.

## Where it lives

In `rules/`, beside the `.rule` files, because a behavior IS a rule in play:

- holding the file is what runs it (`blockly/projectModules`), so it must be
  somewhere the "what does this project hold" scan already looks;
- it belongs in the rules panel, where it can be seen, counted by the world
  block, and removed;
- `removeRule`'s dependency guard should protect it for the same reason it
  protects a rule — something may require it.

One regex carries all of that: `CODE_EXT` in `blockly/projectModules.ts`.

## What is in one

Its body, and the two declarative rows that may be mixed into it.

A `define property` is **a declaration and a default, not code**. It could sit
anywhere; it is simply nicer at the top. So it is written in the same stack as
the implementation and lifted out at parse time onto the behavior's trait —
which costs nothing at generation, because `world_rule_property` already emits
nothing wherever it lands. Under a trait a property is actor-scoped, so **each
actor carrying the behavior gets its own copy**. That is the answer to "where
does per-actor state live without polluting the actor": inside the behavior that
uses it, arriving and leaving with it.

`use rule` is the other declarative row — a dependency, when the behavior is
written against another rule's traits — and is lifted the same way.

Everything else in the chain is the implementation.

Deliberately NOT in one: a second trait, an event, `define block`, a set of
choices, a camera subject, a world-scoped property, and a second `each frame`.
Each of those is a reason to BE a rule, so reaching for one is how you find out
you want a `.rule` — which the file already knows how to become.

## Decisions

**One block, two roles.** `world_behavior` is both the rule root and its single
trait root. The alternative — a JSON rewrite into `world_rule` + `world_rule_trait`
before parsing — was rejected because the live-workspace walk
(`extractRuleBodies`) reads blocks, not JSON, so the rewrite would have to exist
twice and could drift.

**Attachment stays `use trait`.** A behavior's trait carries the behavior's
name, so the row reads `use trait ⟨Chase⟩`, and the dropdown lists it with no
work at all. A separate `add behavior` block would be the near-identical sibling
this codebase keeps refusing — and it would have to explain why a trait and a
behavior are different rows for the same act. The word "trait" leaking is the
lesser cost; revisit once it has been seen.

**A root has no previous connection.** `DisableOrphansPlugin` disables a
top-level block that has one, and everything chained after it — which is what
made `each frame` in an actor file arrive greyed out and generating nothing.
`world_behavior` is a root, so it takes a `next` and no `previous`.

**One phase, and it is not on the block.** A behavior runs in `decide` — where
something works out what it is about to do, which is what a behavior IS. The
phase model stays (this lab's steps within a phase are deliberately unordered
and must commute, where Sprite Lab ordered behaviours by when they were added),
but a behavior does not expose it: a body that wants `sense` or `push` is a body
that wants to be a rule.

## What it took

1. **`world_behavior`** — `define behavior named %1`, a root with a `next` and
   no previous, `noGenerator`.
2. **`parseRuleMeta`** — the root plays both parts. Its chain is walked twice:
   once for the declarative rows (`use rule`, `define property`), once as the
   trait's, and each walk takes its own half or every member arrives twice over,
   world-scoped and actor-scoped. It contributes one step, named for itself.
3. **`extractRuleBodies`** — the behavior root's body is `chainBody`, the same
   call a rule's step roots make.
4. **`fileKind`** — a new kind, and the two functions part company:
   `fileKindOf` says what a file IS, `moduleShape` says what it BECOMES, which
   is `'rule'`.
5. **The scans** — `CODE_EXT`, `projectRuleMetas`, and `removeRule`'s regexes,
   so the rules panel lists a behavior, the world block counts it, and the
   dependency guard protects it.
6. **`config.ts`** — an editable type, a language mapping, `BlocklyFileEditor`,
   and a sticky note beside the rule's scroll.
7. **The toolbox** — the Rule category minus everything `ROOT_HOMES` now marks
   as a rule's alone.
8. **Tapper's Spin**, carried by the coins and the crosshair, each coin's speed
   written into its own placement.

Two things only a real compile found, both about a behavior's module identity:
the compiler's extension search did not know `.behavior`, and `__ruleModule`
stripped only `.rule` — so a behavior reading its own state imported the module
it was being written into, and esbuild refused the duplicate symbol.

## What to check when it is built

- Two actors, one behavior, separate state.
- Removing the behavior from the rules panel warns about the actors using it,
  the way removing a rule does.
- A `.behavior` file's blocks survive a drag — the root has no previous
  connection, or `DisableOrphansPlugin` greys it and everything below it.
- `yarn setup:world` if anything in `src/engine` moves — the sandbox runs a
  prebuilt bundle, and it has caught this twice.
