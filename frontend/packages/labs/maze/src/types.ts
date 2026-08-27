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
