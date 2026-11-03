// The rows a rule's view is written in, which no workspace loads
// (specs/COMPILE_FROM_DATA_PLAN.md, step 5c).
//
// A rule is data. Its view (`ruleView`) says it as `define rule` rows so that
// a walk over a project's blocks — a rename, a search for a block's uses —
// reads it as it reads any workspace, and the fold reads a rule written in
// those rows, by hand or by the tutor. The rows below have no definition:
// they are names in that JSON and nothing a palette offers or a workspace
// draws.

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
  'world_rule_property',
  // …and the root a lesson, a fixture or a test writes its world under,
  // which the converter reads (`lessons/asScreen`).
  'world_world',
]);
