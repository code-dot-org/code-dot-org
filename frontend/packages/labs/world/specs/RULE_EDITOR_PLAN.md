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

DONE, with a trait's view (step 3) folded in, since the frame needs one to
open. `rules/editor/RuleEditor` opens every `.rule` file (`config`), as data:
a stock rule held by reference becomes the learner's, as data, on its first
edit. The side panel is headed sections: the rule's own properties under its
name, then each trait's under the trait's, whose name opens the trait, then
New trait. A property row (`RulePropertyRow`) sets its default with the
Actor Editor's `ValueField`, says whether only this rule sets it, and changes
its name or kind or is deleted, the delete saying which files use it. The
main area is the rule's view — what using it gives, what it is for, the
rules it uses, its events, blocks and steps — or the trait's: what it is for,
what takes it (an actor or a camera), the traits it needs, its events,
blocks and steps. A trait is a step on the trail (`{kind: 'trait', id}`).
Code opens the whole rule in blocks, and what it saves is folded back into
data, which is how a body is written until steps 4 and 5.

A rule the data cannot say whole opens in blocks, as every rule did.

The edits are `rules/ruleEdits`. A property's name is unique across the
whole rule, its traits included: its blocks are named by the rule and the
property alone. A rename rewrites the declaration and every block type and
qualified reference to it (`renameMemberInSource`); map placements, which
hold an override by trait and property, are not followed yet (step 6).

Three readers had to learn the data shape on the way. `parseRuleMeta`
reads a data-shaped rule through its view. A rewrite across the project
(`mapWorkspaces`) and a rename (`renameThing`) write a rule they found as
data, or as a reference, back as data; one written in blocks stays in
blocks.

In the browser: the starter's Gravity opens from Rules in Play; its trait
opens with focus on its heading and the trail says so, and back puts focus
on its name; a default changed is applied to the running game; Code shows
the rule's blocks. The vector default's two halves did not fit the panel,
which the actor's panel shares (`.pair`), and now share its width.

### 3. A trait's view

DONE in step 2. A trait's rename and delete are step 6.

### 4. Members

DONE. A rule's events and blocks, and each trait's, are listed on their
view with Edit and Delete, and New event and New block; Edit opens the
actor's member page (`MemberPage`) on the trail, after the trait when it
is a trait's ("Gravity › Affected by Gravity › is on the ground?"). Back
puts focus on its Edit; a delete says which files use it and puts focus on
the row that took its place, else New.

The page is handed the rule as an actor's data (`rules/ruleMembers`): every
member of the rule in one list, traits' included, and the rule's variables.
That list is the namespace the members share, since their blocks are named
by the rule and their words alone, so two members of different traits may
not read alike and a new id is new across the rule. What the page changes
comes back by id; a member it makes goes to the definition it was opened
from. The page takes three things it did not: the rule's palette, for an
event's picture (`rulePalette`); the file's language, for its drawers; and
what a block may report, offered as Reports in its design — a number, a
true or false, a string, a vector — which makes the block a question
(`world_query_…`) where it was a call.

A member's new words are followed across the project when the page is
left, as an actor's are (`renameMember`), its blocks named by the rule's
name (`ruleSlug`) rather than an actor's path (`pathSlug`).

A trait's block is asked of an actor, and its call takes `on ⟨actor⟩`; on
its page, as on an actor's, the head leaves that out and the body says
`this actor`. A rule's own event has nothing it happens to, so its
picture reads "when the target is reached".

In the browser: Gravity's `is on the ground?` from its trait, reporting a
boolean, its body below its head; `⟨faller⟩ is resting on ⟨ground⟩` from
the rule, its two values' getters in its head.

### 5. Steps

DONE. A rule's steps, and each trait's, are listed with Edit and Delete,
and New step; Edit opens the step's page (`StepPage`) on the trail, after
its trait when it is a trait's. A step has no id of its own, so the trail
names it by its owner and place (`ruleSteps.stepId`).

The page's bar holds the step's name and when it runs: a trait's steps
take its subject's moments and the world's `sense`; the rule's own take any,
or every tick. Below is the workspace of what it does, hung below a head
(`stepHead`) that says that moment — "each frame, during push, for each
actor with Affected by Gravity". The head is made only on the page, as a
member's is, and the workspace goes back into the step as its body.

A step is named twice in its rule's code: by its id, and by an export made
from its name (`TickStep`). So a name is refused when either would clash
with another step of the rule, its traits' included — "Tick" and "tick"
are two ids and one export. A new name is followed when the page is left:
whatever orders itself against the step (`<Rule>#<id>`) is rewritten.

In the browser: Gravity's `applyVelocity` from Affected by Gravity, its
body under its head, with focus on the step's heading.

### 6. Rename and delete

DONE. A trait is renamed and deleted from its view. A rename rewrites its
declaration; every reference to it (`<Rule>#<Export>Trait`), in an actor's
traits, a trait's needs, a rule's code and any list in a map; and every
placement's overrides of it, which are keyed by its id (`rulePlacements`).
A delete says which files name it, and takes the trait with its
properties, events, blocks and steps; what named it is left to say so in
its own editor, and focus goes back to the rule's name.

A trait's property renamed or deleted now reaches placements too: a
placement's override of it follows the new name, or goes with it, and a
trait left with nothing overridden goes from the placement.

Members and steps were renamed and deleted in steps 4 and 5.

Still not followed: an actor's own property renamed, whose placements'
overrides are the actor's (`selfProperties`), as before this plan.

In the browser: the starter's Acts as Ground renamed Holds Things Up; the
game rebuilt, and the Player still lands on the Ground.

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

- **Decided**: the side panel is headed sections, always open, and uses
  are edited on the views.
- **Read-only** reads "Only this rule sets ⟨name⟩", which says what it
  means; whether a learner reads it so is for a lesson to find.
- **Description markdown.** A rule's description is markdown, edited as
  plain text; nothing on the view draws it yet.
