import {z} from 'zod';

import type {Environment} from '@code-dot-org/blockly-workspace';
import type {LevelProperties} from '@code-dot-org/core/api';

import type {MazeData} from './MazeController';
import {LevelKindSchema, AuthoredHintSchema} from './schema';
import type {SkinData} from './skin';

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
