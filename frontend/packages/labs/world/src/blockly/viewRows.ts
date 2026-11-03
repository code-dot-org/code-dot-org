// Row types a file may name that no workspace loads.
//
// A lesson, a fixture or a test writes its world under `define world`, and
// the converter turns it into a screen and a map (`lessons/asScreen`). The
// row has no definition: it is a name in that JSON and nothing a palette
// offers or a workspace draws. The rows an actor's or a rule's keys are
// walked as (`keyRows`, `ruleKeyRows`) are in no file at all.

/** Row types only the world converter names. */
export const VIEW_ROWS: ReadonlySet<string> = new Set(['world_world']);
