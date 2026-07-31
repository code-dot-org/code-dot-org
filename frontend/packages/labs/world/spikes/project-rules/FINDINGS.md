# project-rules/

De-risks moving the standard rule library out of the engine bundle and into the
learner's project as source, per the plan discussion (and `specs/PLAN.md:249`,
`specs/INTERFACE.md`'s `rules/gravity.js` sketch). Answers: **can a rule live in
the project — authored with `RuleBuilder`, importing `world-lab` — and still
compile and run in the preview?**

## Answer: yes, the runtime half is ready.

Method: `rules/gravity.js` (a faithful, from-scratch `RuleBuilder` port of the
built-in Gravity) + `scenes/spike.js` (a JS scene using it) were added to
`DEFAULT_PROJECT`, `ENTRY_FILE` pointed at the spike, and the preview driven
headless. Reverted after.

Result:

- esbuild resolved `rules/gravity` (project) alongside the external `world-lab`,
  and the cross-imports between them — compile ~900ms.
- The from-scratch project rule ran: the player fell and rested on the ground;
  its `startsFalling` / `stopsFalling` events fired (console `[spike]` lines).
- **Trait identity holds across files** — the load-bearing point. The player's
  `AffectedByGravityTrait` and the ground's `GroundTrait` are imported from
  `rules/gravity`, so they are the _same objects_ the project `GravityRule`'s
  steps close over. A built-in trait object would not have been seen. Any real
  migration must therefore move a rule AND repoint every consumer (world
  `useRules`, actor `useTraits`, property get/set) at the project module —
  a re-export shim (`export {…} from 'world-lab'`) preserves identity and is the
  natural first ship (`specs/PLAN.md:521`).

## What this does NOT cover (the editor half — next)

The runtime works; authoring still assumes built-ins:

1. `world_use_rule` emits `world.useRules([WorldLab.<RULE>])` and its dropdown /
   `projectModules` treat rules as `world-lab` exports — must learn to `import`
   a project `rules/*` module.
2. `domainBlocks.ts` derives every set/get/action/query/event block and the
   per-rule toolbox categories by statically importing the rule OBJECTS
   (`ALL_RULES`) at lab-build time. Project rules vary per project, so block
   generation must become project-driven — load the project's built `Rule`
   objects (whose `properties`/`actions`/`queries`/`events`/`traits` records are
   exactly what the generator already reads) and feed those in.
3. Eventually: a Blockly-authored `.rule` file. Blocked on expressing imperative
   `Step` bodies (the physics) as blocks — deferred; the metadata (traits,
   properties, actions, queries, events) is the tractable first slice.

Reference implementations kept here: `rules/gravity.js`, `scenes/spike.js`.
Both are snapshots from when this spike ran and are not maintained: `SceneBuilder`
has since been folded into `WorldBuilder` (`useWorld`/`populate` became
`getWorld`/`loadMap`), so the entry needs adapting before it will run again.
