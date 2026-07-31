# Rules as project files

The engine's rules are TypeScript. A project's rules are Blockly workspaces. The
question this document answers is whether the second can be the first — whether
a `.rule` a learner opens is a _real_ rule, or a description of one that some
other machinery has to honour.

`rules/gravity.rule` in the default project is the answer so far: it is real,
and it is incomplete. Both halves are worth writing down.

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

## The landing step, and what the query decomposition cost

`handleCollisions` IS authored now. The trick was to stop trying to hold state
across a nested loop and move the loop into members the step calls:

- **query `is resting on (faller, ground, frame)`** — the whole per-ground test,
  for one pair.
- **query `is on a ground? (faller, frame)`** — folds that over every ground,
  `return true` on the first match.
- **action `land on grounds (faller, frame)`** — the same walk, snapping
  position and velocity.

The step then reads flat: land, then raise the transition if the resting state
changed. No local variables anywhere.

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

## What is still missing

**The landing does not complete.** `starts falling` fires; `stops falling` does
not, because the resting test never matches. The cause is worth recording: a
collidable actor's `size` property defaults to `(0, 0)`, an "auto" SENTINEL that
the engine resolves through `collisionSize()` — the sprite's box, or 32×32.
Blocks read the raw property, so the authored test computes its surface from a
zero-sized box and puts it half a tile off. **The effective collision size is
not readable from blocks at all**, and no amount of restructuring gets around
it: it needs either a query that reports the resolved size, or a size property
that reports it.

**The inverted-gravity branch is omitted.** The built-in mirrors its whole
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
