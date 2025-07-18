import type * as Blockly from 'blockly/core';

import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';

/** Describes a single level hint. */
export interface HintData {
  class: string;
  id: string;
  type: string;
  markdown: string;
  video?: string;
  path?: [number, number][];
}

/** Describes a multiple-choice question. */
export interface MultipleChoiceData {
  question: string;
  choices: {
    text: string;
    feedback: string;
    correct: boolean;
  }[];
}

/** Generic description for Blockly data. */
export interface BlocklyData {
  startBlocks?: BlocklySerialization;
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
  solutionBlocks?: BlocklySerialization;
  idealBlockCount?: number;
}

/** Describes a level */
export interface LevelData<T = object> {
  /** Unique key for this level */
  key: string;
  /** The type of level (Maze, etc) */
  type: string;
  /** Potentially long description of what to do in the level or what the goal is. */
  longInstructions?: string;
  /** Shorter description of what to do or what the level covers. */
  shortInstructions?: string;
  /** Whether or not we should highlight the instructions before the student can continue */
  instructionsImportant?: boolean;
  /** Hints to help folks progress within levels. */
  hints?: HintData[];
  /** The shared level template defining a potential 'workspace' */
  template?: LevelData;
  /** Blockly level data. */
  blocklyData?: BlocklyData;
  /** Multiple choice question data. */
  multipleChoice?: MultipleChoiceData;
  /** Specific level data. */
  subData?: T;
}
