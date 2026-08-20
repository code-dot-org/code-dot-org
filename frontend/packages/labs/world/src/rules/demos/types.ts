// What a demo world IS.
//
// A function from the compiled rule modules to a running world, and nothing
// else — no project, no `.world` file, no compile. A demo is OUR code rather
// than a learner's, so it needs none of the machinery that exists to run theirs
// safely, and building one with the engine directly is a great deal less to
// carry than authoring a project in block JSON.
//
// ONE DEFINITION, TWO READERS (specs/RULE_DEMOS.md). The behaviour test builds
// it and asserts what the rule did; the recorder builds it and films it. That
// sharing is what keeps a recording honest: a rule that stops doing what its
// demo shows fails a test on the commit that caused it, rather than going on
// showing a thing it no longer does.

import type {World} from '../../engine';

/** A compiled stock rule module, by the path it was compiled under. */
export type RuleModules = Record<string, Record<string, unknown>>;

export interface RuleDemo {
  /** Which rules to compile, in dependency order, before building. */
  rules: readonly string[];
  /** How long to run it for, in seconds — the length of the recording. */
  seconds: number;
  /** Build the world. Returns the actors worth naming in an assertion. */
  build(modules: RuleModules): {world: World; cast: Record<string, unknown>};
}
