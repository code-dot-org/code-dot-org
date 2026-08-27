// What a tile, a region and an unlock are.
//
// The catalogue (./catalogue) is data in these shapes, and specs/PROGRESSION.md
// is the design they encode. Everything here is plain data: no React, no
// Blockly, nothing that knows the map is drawn.

import type {MultiFileSource} from '@code-dot-org/core/api';

// What a lesson says about the editor is the same thing a demo scenario says.
// Type-only: the catalogue is data ABOUT tiles, and the projects themselves live
// in `./lessons`, so that the map does not drag a megabyte of rule workspaces
// behind it.
import type {WorldScenario} from '../fixtures/scenarios';

import type {Axial} from './hex';

/** A tile's name, `<region>/<slug>`. Permanent: see specs/PROGRESSION.md. */
export type TileId = string;

export type RegionId =
  | 'origin'
  | 'input'
  | 'motion'
  | 'logic'
  | 'memory'
  | 'look'
  | 'place'
  | 'platformer'
  | 'arcade'
  | 'puzzle'
  | 'story'
  | 'adventure'
  | 'simulation'
  | 'making';

/** What kind of thing a region is, which is also where it sits on the map. */
export type RegionKind = 'origin' | 'foundation' | 'genre' | 'making';

export interface Region {
  id: RegionId;
  /** What it is called on the map. */
  name: string;
  kind: RegionKind;
  /** One line, for the list view and the region's header. */
  summary: string;
  /**
   * The region's colour, as a hue in degrees. The renderer decides saturation
   * and lightness, which are a theme's business and not the catalogue's.
   *
   * A genre has no hue of its own: it takes the blend of the two foundations it
   * sits between, so the colour says where the region came from (`regionHue`).
   */
  hue?: number;
  /** For a genre: the two foundations it is entered from, clockwise. */
  between?: readonly [RegionId, RegionId];
  /**
   * Whether this region's tiles need not touch each other.
   *
   * True for exactly one region, Making, and the reason is geometric rather
   * than editorial: its tiles sit one beyond each genre's capstone, six places
   * around the outside of the map, and no six-tile shape touches all six of
   * those. See specs/PROGRESSION.md.
   */
  scattered?: boolean;
}

/**
 * Something a tile adds to the learner's shelf.
 *
 * The shelf is what a NEW, BLANK project is built from — never what a lesson's
 * own starting project may contain (specs/PROGRESSION.md).
 */
export type UnlockTarget =
  /** A stock rule, by the id `rules/stock/index.ts` gives it. */
  | {kind: 'rule'; id: string}
  /** A stock actor, by the id `actors/stock/index.ts` gives it. */
  | {kind: 'actor'; id: string}
  /** One block, by its Blockly type. */
  | {kind: 'block'; type: string}
  /** A whole toolbox drawer, by the name it shows. */
  | {kind: 'category'; name: string}
  /** A sprite, animation or backdrop from the appearance library. */
  | {kind: 'asset'; id: string}
  /** One of the editors a file type opens in. */
  | {kind: 'editor'; id: 'map' | 'animation' | 'effect' | 'image'}
  /** A starting point offered by New Project. */
  | {kind: 'template'; id: string};

export type Unlock = UnlockTarget & {
  /**
   * Named by the catalogue, and not built yet.
   *
   * The catalogue was written from what the lessons NEED rather than from what
   * the library has, which is how specs/PROGRESSION.md found the holes in it.
   * A tile may therefore promise a rule nobody has written. The flag says so,
   * and the layout test asserts both halves — that nothing unflagged is
   * missing, and that nothing flagged has quietly arrived — so the day the rule
   * lands, the test is what tells you to delete the flag.
   */
  proposed?: true;
};

/**
 * How a tile is known to have happened.
 *
 * Three kinds, worth what specs/PROGRESSION.md says they are worth: an
 * `outcome` survives a learner solving the lesson their own way, a `trace`
 * says an event happened, and a `shape` only says the workspace contains
 * something — which passes for a program that has never run.
 */
export interface Check {
  kind: 'outcome' | 'trace' | 'shape';
  /** What is asserted, in a sentence. The check itself is built from this. */
  says: string;
  /**
   * The program that satisfies this check without learning anything.
   *
   * Required, and it is the point: a check whose false pass is embarrassing is
   * a check that has to become an `outcome`. Writing it down is what stops a
   * `shape` check being chosen because it was easy.
   */
  falsePass: string;
}

export interface Tile {
  id: TileId;
  region: RegionId;
  /** Where it sits. Authored, and checked against `requires` by the layout test. */
  at: Axial;
  /** What the tile is called. */
  title: string;
  /** The concept, in a line — not the feature. */
  teaches: string;
  /** What the learner is handed and what they are asked to do. */
  task: string;
  /**
   * The tiles that must be done first. ALL of them — see specs/PROGRESSION.md
   * — and every one must be a neighbour on the map.
   */
  requires: readonly TileId[];
  /** What completing it adds to the shelf. */
  unlocks: readonly Unlock[];
  check: Check;
  /** The studio level, once one exists (specs/PROGRESSION_UI.md). */
  level?: {name: string; url: string};
}

/** Whether a learner may open a tile, in the three states the map draws. */
export type TileState = 'done' | 'open' | 'shut';

/**
 * The fields a lesson's level properties differ in.
 *
 * Everything else a World level carries is the same for every lesson and is
 * written once where the properties are assembled (`fixtures/index.ts`), which
 * is why this is the varying part rather than a whole `LevelProperties`.
 */
export interface LessonProperties {
  longInstructions: string;
  levelData?: WorldScenario['levelData'];
  source: MultiFileSource;
}
