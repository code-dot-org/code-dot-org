import {ProjectLevelData} from '../lab2/types';

import {ToolboxData} from './blockly/toolbox/types';
import {Sounds} from './player/MusicLibrary';

// TODO: Use this interface when converting MusicView to TypeScript
export interface MusicLevelData extends ProjectLevelData {
  toolbox?: ToolboxData;
  sounds?: Sounds;
  library?: string;
  packId?: string;
  showSoundFilters?: boolean;
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
