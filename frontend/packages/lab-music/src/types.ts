import type * as Blockly from 'blockly/core';

import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';
import {ExemplarSettings, ProjectLevelData} from '@code-dot-org/lab-base';

import {ToolboxData} from './blockly/toolbox/types';
import {BlockMode} from './constants';
import {Sounds} from './player/MusicLibrary';

/**
 * A type that is one of the values of an object type.
 */
export type ValueOf<T> = T[keyof T];

export interface MusicData {
  startBlocks?: BlocklySerialization;
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
}

export interface MusicLevelData extends ProjectLevelData {
  toolbox?: ToolboxData;
  sounds?: Sounds;
  library?: string;
  packId?: string;
  showSoundFilters?: boolean;
  showSoundsPanelInSoundsMode?: boolean;
  sortUnrestrictedPacksByType?: boolean;
  blockMode?: ValueOf<typeof BlockMode>;
  hideAiTemperature?: boolean;
  showAiTemperatureExplanation?: boolean;
  showAiGenerateAgainHelp?: boolean;
  allowChangeStartingPlayheadPosition?: boolean;
  toolboxDefinition?: Blockly.utils.toolbox.ToolboxInfo;
  validationTimeout?: number;
}

export type ExemplarValidationMode = 'default' | 'type';
export interface MusicExemplarSettings extends ExemplarSettings {
  validationMode?: ExemplarValidationMode;
  playerEnabled?: boolean;
  playerTitle?: string;
}
export type LoadFinishedCallback = (
  loadTimeMs: number,
  soundsLoaded: number
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
