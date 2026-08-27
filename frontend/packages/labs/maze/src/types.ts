import {z} from 'zod';

import type {Environment} from '@code-dot-org/blockly';
import type {LevelProperties} from '@code-dot-org/core/api';

import type {MazeData} from './MazeController';
import {LevelKindSchema, AuthoredHintSchema} from './schema';
import type {SkinData} from './skin';
import type {Status} from './TestResults';

/**
 * Represents a set of skins for a particular level set.
 */
export interface SkinsData {
  /** Each possible skin in our level collection */
  [key: string]: SkinData;
}

/**
 * Describes the API for the maze commands.
 */
export interface API {
  /** An api call handles getting a block id as an argument */
  [key: string]: (id: string) => void;
}

export type MazeLevelSubProperties = z.infer<typeof LevelKindSchema>;

export type MazeLevelProperties = LevelProperties<MazeLevelSubProperties>;

/**
 * Specific environmental information for our blockly environment.
 */
export interface MazeEnvironment extends Environment {
  /** The current block count, if known. */
  usedBlockCount?: number;
  /** The ideal block count, if provided. */
  idealBlockCount?: number;
}

export type AuthoredHint = z.infer<typeof AuthoredHintSchema>;

/**
 * Author-mode section selection, threaded in from the host (studio's
 * ExperienceStage — see its `editing` object and
 * `LabEditingProps`/`getLabEntrypointByAppName.ts`). Declared independently
 * here rather than imported: this package can't depend on apps/studio, and
 * the two types only need to stay structurally compatible, the same way
 * `MazeDoneEventDetail` and the host's `LevelResultDetail` already do for
 * `onLevelResult`.
 */
export interface MazeLabEditingProps {
  authorMode: boolean;
  /** True while the properties panel is pinned open on the 'instructions'
   * section — drives the selected outline on the instructions bubble. */
  instructionsSelected: boolean;
  /** Opens (pins) the panel on the 'instructions' section. */
  onInstructionsClick: () => void;
  /** True while the properties panel is pinned open on the 'level' section
   * — offers the map painter on the stage. The tool palette itself lives
   * in the panel (see editing.ts's getPaintTools, exported from App.tsx);
   * this is only "is the surface open", not a tool selection. */
  mapEditingActive: boolean;
  /** The palette entry id (from getPaintTools) the panel currently has
   * selected — undefined means no tool, so a stage click is a no-op. */
  selectedPaintToolId?: string;
  /** Fires after every paint with the freshly updated wire-format patch —
   * the panel accumulates these into its Save draft. Never called except
   * as a direct result of a stage click. */
  onMapDraftChange: (patch: {serialized_maze: string; maze: string}) => void;
}

export type {MazeData};

/**
 * Enumeration of user program execution outcomes. Mirrors
 * apps/src/constants.js's `ResultType` — kept as a standalone copy here
 * rather than a shared import, since porting constants.js wholesale is out
 * of scope for this lab.
 */
export const ResultType = {
  UNSET: 0, // The result has not yet been computed.
  SUCCESS: 1, // The program completed successfully, achieving the goal.
  FAILURE: -1, // The program ran without error but did not achieve goal.
  TIMEOUT: 2, // The program did not complete (likely infinite loop).
  ERROR: -2, // The program generated an error.
} as const;

export type ResultTypeValue = (typeof ResultType)[keyof typeof ResultType];

/** Detail payload of Maze's `'done'` CustomEvent — the run's verdict. */
export interface MazeDoneEventDetail {
  result: ResultTypeValue;
  testStatus?: Status;
  /** Blocks the learner used, when the workspace has been tracking it. */
  blocksUsed?: number;
  /** The level's ideal block count, when authored. */
  idealBlocks?: number;
}
