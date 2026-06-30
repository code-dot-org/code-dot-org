import type * as Blockly from 'blockly/core';
import {z} from 'zod';

import type {AdlibType} from '@code-dot-org/lab';

import type {BlocklySerialization} from '@code-dot-org/blockly';
import type {
  ExemplarSettings,
  LevelProperties,
  LevelPropertiesInput,
} from '@code-dot-org/core/api';

import type {ToolboxData} from './blockly/toolbox/types';
import type {BlockModeType} from './constants';
import {LevelKindSchema} from './schema';
import type {Sounds} from './player/types';

export interface MusicLevelData {
  // Required to match the validation schema (`LevelDataSchema.toolbox`): a
  // validated music level always carries a toolbox (defaulting `includeAi`).
  toolbox: ToolboxData;
  sounds?: Sounds;
  library?: string;
  packId?: string;
  showSoundFilters?: boolean;
  showSoundsPanelInSoundsMode?: boolean;
  sortUnrestrictedPacksByType?: boolean;
  blockMode?: BlockModeType;
  hideAiTemperature?: boolean;
  showAiTemperatureExplanation?: boolean;
  showAiGenerateAgainHelp?: boolean;
  allowChangeStartingPlayheadPosition?: boolean;
  toolboxDefinition?: Blockly.utils.toolbox.ToolboxInfo;
  validationTimeout?: number;
  exemplarSettings?: MusicExemplarSettings;
  // Show the Guide instead of regular instructions.
  guideMode?: 'instructions' | 'aiCodeGenerate';
  // The ID of a code-defined adlib to display.
  aiCodeGenerateAdlibId?: string;
  // Alternatively, an actual adlib object to display.
  aiCodeGenerateAdlib?: AdlibType;
  // Force showing the prompt text box instead of an adlib.
  aiCodeGenerateText?: boolean;
  // Optional extra prompt text.
  aiCodeGenerateExtraPrompt?: string;
  // Dance move to show when playing music.
  danceMove?: string;
}

export interface MusicData {
  startBlocks?: BlocklySerialization;
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
  // Top-level music fields from `MusicLevelPropertiesSchema`, kept in sync with
  // the validation schema (all have schema defaults, so optional here).
  preloadAssetList?: boolean;
  containedLevelNames?: string[];
  useRestrictedSongs?: boolean;
  levelData: MusicLevelData;
}

export type MusicLevelProperties = LevelProperties<MusicData>;

/**
 * Wire-format (pre-transform) music level properties — what a fixture or raw
 * API response provides, before zod transforms and defaults run. Modeled
 * against the validation schema: the base input fields intersected with the
 * Blockly + music extension's input (`.default()` fields optional, nullable
 * fields carry `null`). Mirrors {@link MusicLevelProperties}, which intersects
 * the base output with the hand-written `MusicData`.
 */
export type MusicLevelPropertiesInput = LevelPropertiesInput<
  z.input<typeof LevelKindSchema>
>;

export type ExemplarValidationMode = 'default' | 'type';
export interface MusicExemplarSettings extends ExemplarSettings {
  validationMode?: ExemplarValidationMode;
  playerEnabled?: boolean;
  playerTitle?: string;
}
export type LoadFinishedCallback = (
  loadTimeMs: number,
  soundsLoaded: number,
) => void;

export type UpdateLoadProgressCallback = (progress: number) => void;

export type SoundLoadCallbacks = {
  onLoadFinished?: LoadFinishedCallback;
  updateLoadProgress?: UpdateLoadProgressCallback;
};

export interface Trigger {
  id: string;
  dropdownLabel: string;
  buttonLabel: string;
  keyboardKey: string;
}
