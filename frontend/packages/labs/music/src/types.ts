import type * as Blockly from 'blockly/core';

import type {AdlibType} from '@code-dot-org/lab';

import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';
import type {
  ExemplarSettings,
  LevelProperties,
  BaseLabProperties,
} from '@code-dot-org/lab';

import type {ToolboxData} from './blockly/toolbox/types';
import type {BlockModeType} from './constants';
import type {Sounds} from './player/MusicLibrary';

export interface MusicData extends BaseLabProperties {
  startBlocks?: BlocklySerialization;
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
}

export interface MusicLevelData {
  toolbox?: ToolboxData;
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

export type MusicLevelProperties = LevelProperties<MusicData, MusicLevelData>;

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
