# Plan: a rule as data, and its editor

STATUS: PLANNED, October 2026. Nothing here is built.

An actor is data, made in the Actor Editor, and its code is only what its
events and blocks do (ACTORS_AS_DATA_PLAN.md, ACTOR_BLOCKS_PLAN.md). A
rule is still a Blockly workspace of `define` blocks. This plan does for a
rule what those two did for an actor: the declarations become data, edited
in a Rule Editor, and a code workspace is only ever the implementation of
one thing, under a head that is that thing.

## What exists

A `.rule` file is one workspace. `define rule` (`world_rule`) is a root
whose chain holds the rule's own declarations; each `define trait`
(`world_rule_trait`) is a root of its own whose chain holds the trait's.
Nothing else stands in either chain: no stray block, and no stock rule
declares choices of its own (`define choices`).

Across the 46 stock rules and their 67 traits:

|             | The rule's own        | Its traits'             |
| ----------- | --------------------- | ----------------------- |
| Description | 46 (`world_doc`)      | 67, every trait has one |
| Uses        | 41 `use rule`         | 56 `use trait`          |
| Properties  | 22, 13 read-only      | 156, 60 read-only       |
| Events      | 18                    | 60                      |
| Blocks      | 57, 22 report a value | 30, 11 report a value   |
| Steps       | 17 `define step`      | 37 `each frame during`  |

- **A property is data already**: a type, a name, read-only or not, and a
  default (161 of 178 have one; a vector's is two fields).
- **Five traits are a camera's** (`SUBJECT`), not an actor's.
- **33 blocks report a value.** The actor member page does not do that
  yet (ACTOR_BLOCKS_PLAN.md, "Not in this phase").
- **Event values take the engine's choices** (Key, MouseButton,
  Direction) as well as plain types; the chips offer both.

### Steps

A trait step runs once for each holder of the trait, with it as `this
actor` (`StepMeta.scope`). A rule step runs once a frame for the world.
Ten of the seventeen rule steps are trait steps written by hand: the whole
body is `for each actor with trait ⟨one of the rule's own⟩` around the
work.

| Rule           | Step                                    | Trait it walks      |
| -------------- | --------------------------------------- | ------------------- |
| Physics        | note where each body starts, reposition | Can Move            |
| Gravity        | applyVelocity, handleCollisions         | Affected by Gravity |
| Path           | think, walk                             | Finds a Way         |
| Time           | tick                                    | Has a Timer         |
| Spawner        | tick                                    | Sends Things        |
| Tab Navigation | coveredLosesFocus                       | Can Be Focused      |
| Digging        | fill the holes back in                  | Can Be Dug          |

The other seven are the world's: Collisions' `find` and Solid Bodies'
`resolve` look at actors against one another, and Input's `keyEvents`,
Mouse's `wheelEvents` and `buttonEvents`, Gestures' `gestures` and Tab
Navigation's `focusKeys` turn the world's input into events.

Within a phase, steps run in the order they are declared, a rule's own
before its traits' (`Scheduler`, ties by insertion). Moving a step onto
its trait moves it later only among its own rule's steps in the same
phase, and of the ten that is one: Tab Navigation's `coveredLosesFocus`
ran before `focusKeys`, both in `sense`. Nothing within a phase is
promised (`engine/core/phases`), and read from the code, the two differ
only when Tab is pressed on the very frame a dialog covers the focused
field: focus should then land on the dialog's first control rather than
its second. Not checked by running it.

Five of the ten were in `sense`, which a trait's step was not offered.
`sense` is the one phase a paused game runs. So a trait's step may name it
now, for work that has to go on through a pause; work a pause should stop
goes in a later phase, or asks whether the game is paused. Event handlers
run after every step of a frame (`World.tick`), so a step moved from
`sense` to `decide` is heard in the same frame.

## Decisions

- **A trait's step is written on the trait's page**, and walks the
  trait's holders by itself: nobody writes the loop.
- **The side panel lists the rule's properties and its traits**, each
  trait with its own properties under it. A property is edited there:
  name, type, read-only, and its default, by a control for the type.
- **Selecting a trait opens it in the main view**: its description, what
  holds it (an actor or a camera), the traits it needs, and its events,
  blocks and steps.
- **The rule's own view** is its description, the rules it uses, and its
  own events, blocks and steps.
- **Events, blocks and steps open on a page of their own**, as an actor's
  members do: a step's page is its workspace under a head that is the
  step, its name and phase in the design above.
- **The file is data; the compiler reads a view.** As `actorView` writes
  the `define actor` workspace an actor's data stands for, `ruleView`
  writes the `define rule` one, and nothing downstream changes.
- **No migration.** World Lab has not shipped
  (`world-lab-no-migrations`); the stock rules are rewritten in place.

## What is being built

### 0. Trait steps for the ten

DONE. Each of the ten is an `each frame during` under its trait, its loop
taken off and the loop's variable read as `this actor`. Physics'
`reposition`, Gravity's two and Path's two kept their phases. Physics'
note of where each body starts, Time's and Spawner's ticks and Digging's
filling of holes moved from `sense` to `decide`: a timer is game time,
which a pause stops, and nothing moves a body or reads its starting place
before `push`. Tab Navigation's `coveredLosesFocus` stays in `sense`, which
a pause menu needs. The pipeline's order is pinned (`stockPipeline`), and
every moved rule is played by `stockRulesRun`. The speed lesson's check
read every file for a hand-written move, and Physics now makes one, so it
reads the learner's files only.

### 1. A rule as data

DONE. `rules/ruleData`: `RuleData` holds the name, ability, description,
the rules it uses, its properties, its members (events and blocks, as an
actor's `ActorMember`, which now carries what a block `returns`), its steps
(a `when tick` is one with no phase), its traits with the same and their
subject, and the workspace's variables. `foldRule` turns a `define rule`
workspace into data, and refuses one it cannot say whole: a note anywhere
but first under the rule, a loose root, a row it does not know. `ruleView`
turns data back, listing each definition's uses, properties, members and
steps in that order. `resolveRuleContents`, which every reader of a project
goes through, serves a data-shaped rule as its view.

The safety net: every stock rule folds, its view is the rule again (where
its roots stand, and a member's id and open eye, aside), the view folds to
the same data, `parseRuleMeta` reads the two alike, and the generator writes
the same code for both, byte for byte (`ruleData`, `ruleDataCompiles`).

Four stock chains interleaved their kinds and three carried a second note,
so their scripts were put in that order and the notes folded into the
description beside them: Gestures' tuning numbers and Screens' `screens`
into the rule's, Tab Navigation's sentence into Can Be Focused's.

No file is stored as data yet: the Rule Editor that would write one is
step 2, and until then a rule opened in blocks would be saved as blocks.

### 2. The editor's frame

The Rule Editor in the shell, as the Actor Editor is: the side panel of
properties and traits, and the rule's own view in the main area.
Properties added, renamed, retyped, made read-only and given defaults
there; a rename followed across the project, as an actor property's is.

### 3. A trait's view

Description, subject, the traits it needs, and its events, blocks and
steps listed as an actor's are, each with Edit and Delete.

### 4. Members

The member page, for a rule's and a trait's events and blocks. Two things
it does not do yet: a block that reports a value, and the actor a trait's
block is asked of (the `on ⟨actor⟩` a call takes, and `this actor`
within it).

### 5. Steps

A step's page: the step at the head, what it does below, its name and
phase in the design. The rule's view and a trait's list theirs.

### 6. Rename and delete

A trait, a property, a member and a step renamed or deleted, its uses
found and followed or named, as the Actor Editor does.

### 7. The define blocks go

Out of every drawer first. Then, once nothing writes them, `define
block`'s designer (`blockDesigner`), its drawing (`FieldBlockPreview`) and
the body surfaces (`bodySurfaces`, the editor's `editing` mode) are
deleted.

## Accessibility

As in ACTOR_BLOCKS_PLAN.md, built in as each step goes and noted in the
ledger. Particular to this one: the side panel is a tree (a trait and its
properties), so it needs a tree's keys or a flat list of headed sections;
a default is a typed control and is labelled with its property; selecting
a trait moves focus to its view's heading, and back puts it on the trait.

## Open

- **The side panel's shape**: a tree with expanding traits, or headed
  sections always open. Sections are simpler and every property is one
  Tab away; a rule with many traits (Collisions, Physics) is long.
- **Where uses are edited**: the rule's `use rule` and a trait's `use
trait` on their views, or in the side panel beside the properties.
- **Read-only**: what a learner sees it mean. Today it is "only this
  rule's code may set it", which a checkbox label has to say in words.
