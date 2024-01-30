import {ProjectLevelData} from '../lab2/types';
import {Sounds} from './player/MusicLibrary';

// TODO: Use this interface when converting MusicView to TypeScript
export interface MusicLevelData extends ProjectLevelData {
  toolbox?: {
    [key: string]: string[];
  };
  sounds?: Sounds;
  library?: string;
}

export type LoadFinishedCallback = (
  loadTimeMs: number,
  soundsLoaded: number
) => void;
