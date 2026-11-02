// The rows a rule's or an actor's view is written in, which no workspace
// loads (specs/COMPILE_FROM_DATA_PLAN.md, step 5c).
//
// A rule and an actor are data. Their view (`ruleView`, `actorView`) says
// them as `define rule` and `define actor` rows so that a walk over a
// project's blocks — a rename, a search for a block's uses — reads them as
// it reads any workspace, and the folds read a file written in those rows,
// by hand or by the tutor. The rows below have no definition: they are
// names in that JSON and nothing a palette offers or a workspace draws.

/** Row types only a view or a fold names. */
export const VIEW_ROWS: ReadonlySet<string> = new Set([
  'world_rule',
  'world_rule_trait',
  'world_use_rule',
  'world_use_trait',
  'world_rule_step_in',
  'world_rule_step_tick',
  'world_rule_block',
  'world_rule_event',
  // …and the rows of an actor's view that the data says (`actorView`).
  'world_acts_like',
  'world_actor_is_data',
  'world_actor_animations',
  'world_show_as',
  'world_rule_property',
  // …and the root a lesson, a fixture or a test writes its world under,
  // which the converter reads (`lessons/asScreen`).
  'world_world',
]);
