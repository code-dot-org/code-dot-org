import type {LevelProperties} from '@code-dot-org/core/api';

import {
  ConsoleSignalTypes,
  NeighborhoodSignalTypes,
  NeighborhoodExceptionTypes,
} from './constants';

export type ConsoleSignalType =
  (typeof ConsoleSignalTypes)[keyof typeof ConsoleSignalTypes];
export type NeighborhoodExceptionType =
  (typeof NeighborhoodExceptionTypes)[keyof typeof NeighborhoodExceptionTypes];
export type NeighborhoodSignalType =
  (typeof NeighborhoodSignalTypes)[keyof typeof NeighborhoodSignalTypes];

export interface NeighborhoodSignal {
  value: NeighborhoodSignalType;
  detail?: {
    id: number;
    color?: string;
    direction?: string;
    x?: string;
    y?: string;
    paint?: number;
  };
}

export interface ConsoleSignal {
  value: ConsoleSignalType;
  detail: string;
}

// Old maze skin assets are untyped; the package only forwards them
// into MazeController.
export type SkinType = Record<string, unknown>;

// Extra level data the package layers on top of the base
// `LevelProperties` before calling into the inner `Neighborhood`.
export interface NeighborhoodData {
  serializedMaze: number[];
}

export type NeighborhoodLevelProperties = LevelProperties<NeighborhoodData>;

// Config object MazeController expects alongside level + skin.
export interface NeighborhoodConfig {
  skinId: string;
  level: LevelProperties;
  skin: SkinType;
}

// Audio + test-result callbacks MazeController consumes. Python lab
// supplies no-ops because audio isn't wired there; Java lab (legacy)
// supplied real handlers. The package types them so callers can't
// accidentally pass the wrong shape.
export type PlayAudio = (
  name: string,
  options: Record<string, unknown>,
) => void;
export type PlayAudioOnFailure = () => void;
export type LoadAudio = (filenames: string[], name: string[]) => void;
export type GetTestResults = (
  levelComplete: boolean,
  options: {
    executionError: {error: Error; lineNumber: number};
    allowTopBlocks: boolean;
  },
) => void;
