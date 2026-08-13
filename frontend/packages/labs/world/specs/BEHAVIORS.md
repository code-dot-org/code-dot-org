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
a Behavior — a function you write once and add to as many actors as you like.

## The construct

A Behavior is a file, `rules/<name>.behavior`, whose root is:

```
define behavior named ⟨Chase⟩
  state ⟨number⟩ ⟨speed⟩ = ⟨2⟩
  each frame during ⟨decide⟩ do ⟨move toward the player⟩
    …
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

The two things an actor's own file can already declare, now shareable:

- **state** — `world_rule_property`, which under a trait is actor-scoped, so
  each actor carrying the behavior gets its own copy. This is the answer to
  "where does per-actor state live without polluting the actor": inside the
  behavior that uses it, arriving and leaving with it.
- **`each frame`** — `world_trait_step`, already the block for "every tick, for
  each thing that has this".

And one thing that is about the behavior rather than in it:

- **`use rule`** — a dependency, when the behavior is written against another
  rule's traits.

Deliberately NOT in the first cut: events, `define block`, camera subjects,
world-scoped properties. Each of those is a reason to be a rule, and offering
them here would make a Behavior a rule with a different hat on.

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

**Phases stay.** A behavior's step names a moment of the frame, like every other
step. Sprite Lab orders behaviours by when they were added; this lab's steps
within a phase are deliberately unordered and must commute, and one scheduling
model is enough. Whether the dropdown is SHOWN to a beginner is a separate
question — defaulting it and hiding it until asked is the obvious next move.

## Plan

1. **`world_behavior` block** — `define behavior named %1`, `nextStatement`, no
   previous, `noGenerator`, root.
2. **`parseRuleMeta`** — `root` falls back to `world_behavior`; when it is one,
   `traitRoots` is `[root]`, and the rule's own chain loop keeps `use rule` but
   skips property/block/event, which the trait walk will take. Without that they
   are declared twice, once world-scoped and once actor-scoped.
3. **`extractRuleBodies`** — add `world_behavior` to the TRAIT-root branch
   (scope `actor`, `traitId = slug(NAME)`), not the `world_rule` branch. Same
   double-walk trap from the other side.
4. **`fileKind`** — `FileKind += 'behavior'`; `fileKindOf` reads the extension;
   `ROOT_HOMES` gets `world_behavior → ['behavior']` and widens
   `world_rule_property` / `world_trait_step`; `moduleShape` returns `'rule'`
   for a `.behavior`, since a rule module is what it compiles to.
5. **`CODE_EXT`** and `removeRule`'s `RULE_FILE` gain `behavior`.
6. **`config.ts`** — `editableFileTypes`, `languageMapping`, an
   `editorComponents` entry pointing at `BlocklyFileEditor`, a file icon.
7. **Toolbox** — a behavior file offers the behavior root, `each frame`,
   `world_rule_property`, `use rule`, and the value blocks; not `define rule`,
   `define trait`, or the world/actor roots.
8. **A demo** — two kinds of actor electing one behavior, each running it
   against itself with its own state. That is the claim an actor's own step
   cannot make, so it is the one worth showing.

## What to check when it is built

- Two actors, one behavior, separate state.
- Removing the behavior from the rules panel warns about the actors using it,
  the way removing a rule does.
- A `.behavior` file's blocks survive a drag (the orphan trap).
- `yarn setup:world` if anything in `src/engine` moves — the sandbox runs a
  prebuilt bundle, and it has caught this twice.
