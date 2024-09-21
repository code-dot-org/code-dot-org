import {ProjectLevelData} from '../lab2/types';
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
  // This is currently only used in the levelbuilder editor to
  // determine which blocks to include.
  // TODO: Use this value to configure block mode rather than only URL param override.
  blockMode?: ValueOf<typeof BlockMode>;
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
