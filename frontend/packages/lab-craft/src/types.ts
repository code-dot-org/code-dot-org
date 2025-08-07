import {BlocklyData} from '@code-dot-org/lab-blockly';

import type LevelModel from './level/LevelModel';
import type Position from './Position';

/** The methods available to verification engines */
export interface VerificationAPI {
  countOfTypeOnMap: (blockType: string) => number;
  getEntityCount: (entityType: string) => number;
  isEntityAt: (entityType: string, position: Position) => boolean;
  isEntityTypeRunning: (entityType: string) => boolean;
  isEntityDied: (entityType: string, count?: number) => boolean;
  isEntityOnBlocktype: (entityType: string, blockType: string) => boolean;
  isPlayerAt: (position: Position) => boolean;
  isPlayerNextTo: (entityType: string) => boolean;
  solutionMapMatchesResultMap: (map: string[]) => boolean;
  getCommandExecutedCount: (command: string, targetType?: string) => number;
  getRepeatCommandExecutedCount: (command: string, targetType?: string) => number;
  getInventoryAmount: (itemType: string) => number;
}

/**
 * Craft level data.
 */
export interface CraftData extends BlocklyData {
  /** Instructions for this level */
  instructions?: string;
  /** The size of the map */
  gridDimensions?: [number, number];
  /** The blocks that define the base ground */
  groundPlane: string[];
  /** The blocks that define 'decorations' on the ground level */
  groundDecorationPlane?: string[];
  /** The blocks that define actionable items and objects above the ground */
  actionPlane?: string[];
  /** The blocks that are defined within the 'fluff' plane */
  fluffPlane?: string[];
  /** Game entities to spawn on level load */
  entities?: (
    | [string, number, number, number]
    | [string, number, number, number, string]
  )[];
  /** The starting position for the player entity, if any */
  playerStartPosition?: [number, number];
  /** The starting direction for the player entity, if any */
  playerStartDirection?: number;
  /** The name of the player */
  playerName?: string;
  /** Asset packs to 'early load' */
  earlyLoadAssetPacks?: string[];
  /** Asset packs that would be nice to 'early load' */
  earlyLoadNiceToHaveAssetPacks?: string[];
  /** The asset sets to load for this level */
  assetPacks?: {
    /** Asset packs to load before the level starts */
    beforeLoad: string[];
    /** Asset packs to load after the level starts */
    afterLoad: string[];
  };
  /** Whether or not the level should display and track a score */
  useScore?: boolean;
  /** Whether or not to spawn a playet */
  usePlayer?: boolean;
  /** Whether or not this is an 'agent' type of level */
  isAgentLevel?: boolean;
  /** Whether or not to spawn an agent entity */
  useAgent?: boolean;
  /** The agent starting position, if any */
  agentStartPosition?: [number, number];
  /** The agent starting direction */
  agentStartDirection?: number;
  /** Whether or not it is daytime */
  isDaytime?: boolean;
  /** Whether or not it is an aquatic (underwater) level */
  isAquaticLevel?: boolean;
  /** The ocean biome type (warm or cold) */
  ocean?: 'warm' | 'cold';
  /** Whether or not this level contains a boat */
  boat?: boolean;
  /** Whether or not this is an events level */
  isEventLevel?: boolean;
  /** The special level type designation */
  specialLevelType?: string;
  /** The verification routine */
  verificationFunction?: ((api: VerificationAPI) => boolean) | (() => boolean);
  /** Time to wait for the level to run before failing verification */
  levelVerificationTimeout?: number;
  /** A validation that ends the level */
  timeoutResult?: ((api: LevelModel) => boolean) | (() => boolean);
  /** A validation that checks for failure */
  failureCheckFunction?: ((api: LevelModel) => boolean) | (() => boolean);
  /** The bottom right position of the house, if there is one. */
  houseBottomRight?: [number, number];
  /** A callback when the world transitions to daytime */
  onDayCallback?: () => void;
  /** A callback when the world transitions to nighttime */
  onNightCallback?: () => void;
}
