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

import {Vector, WorldBuilder, type World} from '../../engine';

/** A compiled stock rule module, by the path it was compiled under. */
export type RuleModules = Record<string, Record<string, unknown>>;

/**
 * The frame every demo is drawn in.
 *
 * One size for the shelf, so the rows line up and a demo's positions mean the
 * same thing in every file. Roughly the proportions of the preview, small
 * enough that twenty of them are not a megabyte.
 */
export const DEMO_SIZE = {width: 192, height: 128} as const;

/**
 * The same frame in TILES, which is what a world states its size in.
 *
 * The two have to agree, and that is not tidiness. Boundaries and Screen Wrap
 * happen at the MAP's edges, and a world's map is 320 by 320 unless it says
 * otherwise — so a demo drawn in a 200-pixel frame would have wrapped somewhere
 * off to the right of the picture, and recorded a box walking calmly out of
 * shot. Six tiles by four is 192 by 128, which is why the frame is that size
 * rather than a rounder-looking one.
 */
export const DEMO_TILES = {columns: 6, rows: 4} as const;

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
  /**
   * A string drawn in place of the rectangle, centred where it would have been.
   *
   * The one thing a box cannot stand in for, and the reason Writing had no
   * demo until the strip writer learned a font (`record/font`). Upper case,
   * digits and a little punctuation; anything else draws as a gap.
   */
  text?: string;
  /** Whole-pixel scale for that text. Two is legible in a 192-wide frame. */
  textScale?: number;
}

export interface RuleDemo {
  /** Which rules to compile, in dependency order, before building. */
  rules: readonly string[];
  /** How long to run it for, in seconds — the length of the recording. */
  seconds: number;
  /**
   * How big the demo's MAP is, when it is not the frame.
   *
   * Bigger than the view is the whole point of a camera demo: a camera that
   * pans across a world no larger than the picture pans across nothing. Every
   * other demo leaves this alone and gets a map the size of its frame, so that
   * "inside the frame" and "inside the map" are one statement.
   */
  readonly tiles?: {columns: number; rows: number};
  /**
   * Which actors must stay in shot. Every actor, when it is not given.
   *
   * A camera demo needs the exception: its scenery exists to be panned PAST,
   * so a post the view has left behind is the demonstration working rather
   * than an actor that wandered off. Naming the subject keeps the check that
   * matters — that the thing the strip is about is still in the picture.
   */
  readonly filmed?: readonly string[];
  /**
   * What the player is DOING at this moment of the recording, if anything.
   *
   * Called once a frame, before the world ticks, which is exactly where a
   * driver calls `setInput` and `setPointer` — so a demo of an input rule is
   * driven the way a game is, rather than by reaching past the rule and
   * moving an actor itself.
   *
   * `seconds` is elapsed time, so a script is a function of when rather than
   * of a counter the demo keeps: the same instant produces the same input in
   * the recorder and in the test, and neither has to be run from the start to
   * ask what is held.
   */
  readonly input?: (world: World, seconds: number) => void;
  /** Build the world. Returns the actors worth naming in an assertion. */
  build(modules: RuleModules): {world: World; cast: Record<string, unknown>};
  /**
   * How to draw an actor, by its id and as it is THIS FRAME.
   *
   * The demo's business rather than the recorder's: what a box should be is a
   * fact about what the demo is showing — a wide flat ground, a small coin —
   * and a recorder guessing from an actor's collision size would draw the
   * fallback 32-by-32 box for everything that never set one.
   *
   * The actor is passed because some rules change something a fixed box cannot
   * show: health is a NUMBER, and a
   * demonstration of losing it has to be visible, so that demo reads the
   * property and shrinks the box. The WORLD is passed for the same reason one
   * step further out: an input demo has to draw what is being pressed, and
   * which keys are down is a fact about the world rather than about any actor
   * in it.
   *
   * Health is the case that forced the actor. What a fixed box cannot show at all is a
   * rule with no effect on any actor; the camera rules escape that because the
   * recorder films through `viewOrigin`, so moving the view moves every box in
   * the frame together.
   */
  look(id: string, actor: unknown, world: World): Look;
}

/**
 * A world sized to the frame it will be drawn in, with the demo's rules in it.
 *
 * ALL of the rules it declared, not just the one being demonstrated. Requires
 * are transitive, so putting Drag in play brings Physics — but Screen Wrap
 * requires only the foundation, so a wrap demo with wrap alone had a rover with
 * a velocity and nothing to integrate it, and recorded a box standing still.
 * Naming what it needs is what a demo already does in `rules`; using that list
 * is what makes the declaration mean something.
 *
 * Sized here, so "inside the frame" and "inside the map" are one statement
 * rather than two that can disagree — see `DEMO_TILES`.
 */
export function demoWorld(
  id: string,
  modules: RuleModules,
  paths: readonly string[],
  tiles: {columns: number; rows: number} = DEMO_TILES,
): World {
  const world = new WorldBuilder({id, name: id})
    .useRules(paths.map(path => modules[path].default) as never)
    .instantiate();
  world.setMapSize(tiles.columns, tiles.rows);
  // The camera at the FRAME's middle, which is what makes the recorder's
  // world-to-view transform an identity for a demo that has no camera in it.
  // A camera rests at the middle of the ENGINE's viewport, which is a
  // different and larger rectangle; left there, every box would be drawn
  // sixty-four pixels up and left of where its demo put it.
  world.setCameraPosition(
    new Vector(DEMO_SIZE.width / 2, DEMO_SIZE.height / 2),
  );
  return world;
}

/**
 * The top-left corner of what the view shows, in world coordinates.
 *
 * Subtract it from a world position to get the position in the frame. An
 * IDENTITY for a demo with no camera rule in it, because `demoWorld` puts the
 * camera at the frame's middle; a pan for one that moves its camera, which is
 * the only way a camera rule can be demonstrated at all.
 *
 * Shared by the recorder and by the test that checks a demo stays in frame,
 * because those two have to agree about what "in frame" means. They did not
 * while the recorder drew world space: the camera demos ran a 384-pixel map
 * through a 192-pixel view, and every actor past the halfway mark was both
 * correctly filmed and loudly out of bounds.
 */
export function viewOrigin(world: World): {x: number; y: number} {
  const active = world.cameraSnapshot().find(one => one.active);
  return {
    x: (active?.position.x ?? 0) - DEMO_SIZE.width / 2,
    y: (active?.position.y ?? 0) - DEMO_SIZE.height / 2,
  };
}

/**
 * One frame of a demo: the player's hands, then the shutter, then the tick.
 *
 * That ORDER is the reason this is a function rather than two loops that look
 * alike. A frame drawn before the input was applied shows a key lighting up
 * one frame after the actor it moved, which reads as the rule acting on its
 * own — the exact opposite of what an input demo is for. The recorder and the
 * behaviour tests both step through here, so neither can drift.
 */
export function stepDemo(
  world: World,
  demo: RuleDemo,
  tick: number,
  capture?: () => void,
): void {
  demo.input?.(world, tick / 60);
  capture?.();
  world.tick(1 / 60);
}
