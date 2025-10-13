import * as GoogleBlockly from 'blockly/core';

import {AdlibType} from '@cdo/apps/lab2/views/components/guide/Adlib';

import {ExemplarSettings, LabConfig, ProjectLevelData} from '../lab2/types';
import {ValueOf} from '../types/utils';

import {ToolboxData} from './blockly/toolbox/types';
import {BlockMode} from './constants';
import {Sounds} from './player/MusicLibrary';

// TODO: Use this interface when converting MusicView to TypeScript
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
  toolboxDefinition?: GoogleBlockly.utils.toolbox.ToolboxInfo;
  validationTimeout?: number;
  aiCodeGenerate?: boolean;
  // The ID of a code-defined adlib to display.
  aiCodeGenerateAdlibId?: string;
  // Alternatively, an actual adlib object to display.
  aiCodeGenerateAdlib?: AdlibType;
  danceMove?: string;
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

export interface MusicLabConfig extends LabConfig {
  music: {
    blockMode: ValueOf<typeof BlockMode>;
    packId?: string;
    library?: string;
  };
}
