# Rules as project files

The engine's rules are TypeScript. A project's rules are Blockly workspaces. The
question this document answers is whether the second can be the first — whether
a `.rule` a learner opens is a _real_ rule, or a description of one that some
other machinery has to honour.

`rules/gravity.rule` in the default project is the answer so far: it is real,
and it is incomplete. Both halves are worth writing down.

## Gravity is imported, not built in

There is no built-in gravity rule any more. `BUILTIN_RULES` is the spatial
frame, integration, collision, input and animation — what a rule cannot yet be
written in blocks. "Has Gravity" is a STOCK rule (`src/rules/stock`), and the
default project is a project that imported it.

That removes the thing the port left behind: two toolbox categories both called
"Has Gravity", holding different blocks for the same idea.

The `use rule` dropdown now ends with `(import…)`, the same affordance the
effect dropdown has, opening a picker of stock rules. Importing copies the
workspace into `rules/<id>.rule`, where it is the learner's — openable,
editable, unconnected to the library. It never overwrites: importing a second
time gives `gravity-2`, and a same-stem file of ANY extension counts as taken,
because two modules differing only by extension make `rules/gravity` ambiguous
to the compiler's extension search.

Dropping the built-in had one consequence worth recording: **no engine rule
declares a world-scoped property or action any more** — gravity was the only
one. The generators for those are therefore exercised against a project rule
fixture in the tests, which is the honest subject now.

## What the default project now ships

`rules/gravity.rule` replaces the `rules/gravity.js` shim
(`export {GravityRule as default} from 'world-lab'`). Nothing else in the
project imports the engine's gravity: `main.world` puts `rules/gravity` in play,
`player.actor` takes `rules/gravity#AffectedByGravityTrait`, and its event
handlers listen for that rule's own `starts falling` / `stops falling`.

It parses to the same shape the built-in declares:

|                        | built-in `gravity.ts`               | authored `gravity.rule`           |
| ---------------------- | ----------------------------------- | --------------------------------- |
| requires               | Motion, Collision                   | ✅ `use rule` ×2                  |
| world properties       | direction, strength                 | ✅                                |
| traits                 | Affected by Gravity, Acts as Ground | ✅ with their `requires`          |
| actor properties       | gravity scale, falling (read-only)  | ✅                                |
| events                 | startsFalling, stopsFalling         | ✅                                |
| step: applyVelocity    | before `Motion ▸ reposition`        | ✅ **body and all**               |
| step: handleCollisions | after `Collision ▸ resolve`         | ❌ see below                      |
| query: isOnGround      | reads `falling`                     | ❌ needs `not` on a property read |
| action: invert         | rotates direction 180°              | ❌ needs vector rotate            |

`applyVelocity` is the interesting row. Its body is authored in blocks —

```
for each actor `each` where `each` has trait "Affected by Gravity"
  set velocity of `each` to (velocity of `each`) + (direction × (strength × gravity scale of `each` × delta))
```

— and generates the line the built-in hand-writes. The rule really runs: the
player falls under the authored step, not the engine's.

## What it cost to get there

Four blocks, one field, and one bug, all of which were missing rather than
deferred:

- **`world_vector_scale` and `world_vector_add`.** `world_vector` built a vector
  and `world_vector_component` read an axis back out; nothing combined them. "Add
  direction × strength × delta to the velocity" is the whole of applying gravity
  and could not be written at all.
- **`world_vector_rotate`.** Inverting gravity is turning its direction vector
  180°, and there was no way to turn one.
- **`world_emit`** — `emit <event> for <actor>`. A rule could DECLARE an event
  and nothing in the language could fire it: `define event` produced a real
  `GameEvent` that only the engine's own TypeScript rules ever raised. Its
  dropdown lists every event a rule in play declares, encoded exactly as the
  trait dropdown encodes traits, so a rule emitting its OWN event resolves to
  the local `export const` rather than importing its own module.
- **`ACCESS` on `define property`** — writable or read-only. The engine has
  carried `readonly` since the built-in rules were written; a `.rule` had no way
  to say it, so `falling` (which a step owns) would have grown a `set` block
  whose value the next tick overwrites.
- **A read-only property could not be READ.** The generated `get` and `set`
  blocks were produced under one condition, so declaring `falling` read-only
  removed its getter too and the rule could not look at its own property — the
  workspace failed to load with "Invalid block definition for type
  `world_get_rules_gravity_FallingProperty`". Splitting `isGettable` from
  `isSettable` fixes that, and incidentally gives `position` a getter: a bespoke
  `set position` block had been suppressing the generated pair wholesale, so
  there was no way to read an actor's position in blocks at all.

## The landing step

`handleCollisions` is authored, and — since variables arrived — it is written
the way it would be written by hand:

- **query `rest height of (faller, ground)`** — the y the faller comes to rest
  at on that ground: its top under normal gravity, its underside when inverted.
- **query `is resting on (faller, ground, frame)`** — the per-ground test.
- **query `land on ground? (faller, frame)`** — ONE walk of the grounds that
  snaps position and velocity _and_ reports whether it landed.

The step reads flat: land-and-ask, then raise the transition if the resting
state changed.

**Both directions, one test.** The sign of gravity's direction lives in a
variable, and every comparison multiplies by it, so falling down onto a surface
and falling up onto one are the same four terms. The built-in writes its whole
landing test twice, once per direction, because it has nowhere to put the sign
that reads well. Verified in the browser both ways: the player lands on the
ground's top with gravity `(0, 1)` and on its underside with `(0, -1)`.

**Landing and reporting are one walk.** `land on ground?` used to be an action
that landed plus a query that walked the grounds again to answer — two passes
for one question, because a body could not keep the answer between them. A
query with a side effect is not pure, but "try to land it; tell me if it worked"
is a coherent thing to ask, and it beats walking twice.

**A hazard variables introduce.** A Blockly variable in a rule module is
MODULE-scoped, not local to the member using it — `var sign;` is emitted once
for the whole file, so two members using the same name share it. `land on
ground?` therefore reads `restY` only _after_ the call that would clobber it.
Nothing warns about this; it is the first real footgun in rule authoring.

Four things had to change for that to work, and each was invisible until
something reached for it:

- **An actor-scoped action or query could not see the world.** The engine
  invokes one as `(actor, …args)` — there is no world in the signature — so a
  body with `for each actor` generated a reference to an unbound `world`.
  `Actor` now carries the world it was placed in (`World.addActor` sets it), and
  an actor-scoped closure opens by binding `const world = actor.world`, so every
  block that names `world` works in one.
- **A read-only property could not be SET by its own rule.** Gravity's landing
  step is what writes `falling`; that is what read-only means — the declaring
  rule owns the value — not that nothing writes it. A rule's own read-only
  properties now get `set` blocks inside that rule's own file and nowhere else.
- **…and the headless generator needs them all.** It turns every Blockly file
  into code with ONE palette, so it cannot scope per file the way the editor
  does. Without that the project stopped compiling outright: "Invalid block
  definition for type `world_set_rules_gravity_FallingProperty`."
- **A vector could not be BUILT from computed parts.** `world_vector` holds a
  literal, so "set velocity to (its x, 0)" — zeroing one axis on landing — had
  no expression. `world_vector_of` is the counterpart to
  `world_vector_component`.

Two more things the landing step needed, both found by it failing to work:

- **`Collision ▸ collision size`, a query reporting an actor's RESOLVED box.**
  The `size` property is an override whose `(0, 0)` default is an "auto"
  sentinel; the engine resolves it through `collisionSize()` to the sprite's box
  or 32×32. Reading the property therefore answers a different question than
  "how big is this actually?", and the authored test computed every surface from
  a zero-sized box — half a tile out, so nothing ever rested. A query rather
  than a property because there is nothing to store: it derives from the
  override, the sprite, and the scale, any of which can change per tick.
- **`actors/ground.js` was still importing the ENGINE's `GroundTrait`.** After
  gravity moved into the project, the ground tile kept taking the built-in
  trait, so the rule's `for each ground` matched nothing. The player fell, was
  held up by Collision, and never landed — with no error anywhere. This is the
  "renaming a member silently unhooks the project" hazard, in its other form:
  the reference was still valid, and pointed at a different object.

## Traits are definitions, not nested blocks

A `define trait` is a TOP BLOCK now, beside `define rule` rather than chained
inside it, and its members chain below it the way the rule's do. It is styled
like the rule for the same reason: both are definitions.

The old shape put every trait in a `do` mouth nested in the rule's stack, and
every member of every trait inside that — a rule with three traits was one tower
indented three deep. Now each trait is a stack a learner can move, collapse and
read on its own, which is what it is: a separate thing an actor may take,
belonging to one rule.

The rule it belongs to is the one defined in the same file. A `.rule` declares
exactly one rule, so there is nothing to disambiguate and nothing to wire up.

`parseRuleMeta` and `extractRuleBodies` both changed to match: the first looks
for trait roots among the workspace's top blocks, the second takes the top
blocks rather than the rule root. Scope-by-nesting became scope-by-which-root.

The change also surfaced a warning on correct programs: `worldContext` knew that
a step's body binds `world` but not that an action's or a query's does, so
`get world direction` inside `rest height of` carried a warning bubble. Every
rule-member body binds `world` — a world-scoped member is invoked as
`(world, …)`, an actor-scoped one binds it from `actor.world` — and the guard
now says so.

## Steps are per-tick events

`define step` became three event hats, styled like the `when …` blocks in an
actor file, because that is what a step is — behaviour the rule runs when
something happens, and the something is a tick:

```
when tick do <name>
before <Rule ▸ step> do <name>
after  <Rule ▸ step> do <name>
```

Each is a top block with its body chained below, like the rule and its traits.

**Three blocks rather than one with an order dropdown.** Ordering is not a
setting on a step, it is what KIND of step it is: "run before Motion moves
things" and "run every tick, whenever" are different statements about when
behaviour happens. The old single block needed a `stepOrder` extension purely to
HIDE the anchor dropdown when the order dropdown made it meaningless — a shape
that was two blocks wearing one coat. That extension is deleted.

`before Has Physics ▸ reposition do applyVelocity` reads as the sentence it is.

**A step's body is the chain below the hat**, not a `DO` input, so
`extractRuleBodies` grew a `chainBody` alongside `body`: an action's and a
query's body is still a statement input, a step's is what follows it.

This surfaced the same warning bug the trait change did, one layer down:
`worldContext` had been taught `world_rule_step`, and the types are now
`world_rule_step_tick` / `_before` / `_after`, so every `for each actor` in a
step body carried a warning bubble again. It matches on the prefix now.

**Root placement is hand-set and measured.** The rule's stack renders 4028×1622
workspace units — wide enough that side-by-side columns land _inside_ it — so
the five roots are stacked in one column at measured offsets, with a test-free
but checked guarantee that none overlap. Worth revisiting if the stock rule
grows; Blockly's own "clean up blocks" is the durable answer.

## Variables

A typed variable could be BOUND — by a `for each` loop, by a parameter row — and
never assigned. There was no `set`, so a body could not keep a value across two
statements, which is the whole reason the landing step was decomposed into three
members that each recompute what the last one knew.

`createTypedVariable` now returns a `setterBlock` beside its `getterBlock`: `set
<var> to <value>`, with the value socket checked to the same tag the getter
reports, so what a `Vector` variable accepts is exactly what reading one can be
plugged into. Every flavour gets one (Number, Boolean, String, Vector, Actor)
and they are in the Rule toolbox category next to the getters.

The landing step uses one already: it asks `is on a ground?` once and holds the
answer, where before it walked the grounds twice — once per branch.

**Color has no flavour yet.** Adding one is not just another
`createTypedVariable` call: `PARAM_FLAVOURS` also drives the parameter type
dropdown, and a `color` parameter would need `ArgType` and `typedValueInputs` to
know the type. Worth doing, but it is its own piece of work.

## What is still missing

**The inverted-gravity branch is omitted.** Now unblocked — a variable can hold
the sign of gravity's direction — but not yet written. The built-in mirrors its whole
landing test for upward gravity, keyed on the sign of the direction. Without a
local to hold that sign the test would have to be written out twice.

**`handleCollisions` used to be unauthorable for these reasons**, all now
resolved and kept here for the record: It is the rule's other step: land
affected actors on the surfaces of "Acts as Ground" actors, and raise the
falling transitions. It needs, and the block set does not have:

- Local variables in a body — sidestepped by the decomposition above, not
  solved. A body still cannot hold one, and the inverted-gravity branch is the
  first thing that wants one.

The consequence in the shipped project is precise and visible: **the player
falls and rests on the ground — Collision's resolve step stops it — but its
velocity is never zeroed, and `starts falling` / `stops falling` never fire, so
the tutorial's two console messages are silent.** The handlers are still there
and still valid, and `emit` now exists to raise them; what is missing is the
step that works out _when_.

## Smaller things the port turned up

- **Ids are slugged from names.** "Has Gravity" → `Has_Gravity`, "gravity scale"
  → `gravity_scale`, where the built-in uses `gravity` and `scale`. Harmless
  today because every reference is generated from the same slug, but it means a
  `.rule` cannot reproduce a built-in's ids, so the two cannot be swapped for
  each other in a saved project.
- **Events are declared inside a trait**, while the engine declares them on the
  rule. `ruleMetaToModule` emits `rule.addEvent` either way, so this works; it is
  a wording mismatch, not a defect.
- **Renaming a rule member silently unhooks the project.** `player.actor` holds
  `rules/gravity#AffectedByGravityTrait` as a string. There is no rename
  refactor, and nothing reports a reference that no longer resolves.
- **Blockly's variable declarations land above the module's imports** (`var
each;` on line 1). Legal, and esbuild accepts it, but it reads as a mistake.
