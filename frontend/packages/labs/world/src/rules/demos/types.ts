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

/**
 * The frame every demo is drawn in.
 *
 * One size for the shelf, so the rows line up and a demo's positions mean the
 * same thing in every file. Roughly the proportions of the preview, small
 * enough that twenty of them are not a megabyte.
 */
export const DEMO_SIZE = {width: 200, height: 140} as const;

/** What a demo is drawn on — the engine's own default backdrop colour. */
export const DEMO_BACKGROUND = '#101020';

/**
 * Frames a second in a RECORDING — not in the simulation.
 *
 * The world still ticks sixty times a second, because that is what the rules
 * were written against and a rule stepped at twelve would fall differently.
 * Only the keeping is at twelve, which turns a two-second demo into
 * twenty-four cells rather than a hundred and twenty.
 *
 * In the bundle rather than in a manifest beside the images, because the
 * dialog has to know how many cells a strip has to animate it — and
 * `seconds × DEMO_FPS` is that number, from a demo the bundle already holds.
 * A manifest would be a second thing to fetch, and a second thing to be stale.
 */
export const DEMO_FPS = 12;

/** How one actor is drawn, in pixels and a CSS colour. */
export interface Look {
  width: number;
  height: number;
  colour: string;
}

export interface RuleDemo {
  /** Which rules to compile, in dependency order, before building. */
  rules: readonly string[];
  /** How long to run it for, in seconds — the length of the recording. */
  seconds: number;
  /** Build the world. Returns the actors worth naming in an assertion. */
  build(modules: RuleModules): {world: World; cast: Record<string, unknown>};
  /**
   * How to draw an actor, by its id.
   *
   * The demo's business rather than the recorder's: what a box should be is a
   * fact about what the demo is showing — a wide flat ground, a small coin —
   * and a recorder guessing from an actor's collision size would draw the
   * fallback 32-by-32 box for everything that never set one.
   */
  look(id: string): Look;
}
