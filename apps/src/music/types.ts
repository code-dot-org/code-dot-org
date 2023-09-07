import {ProjectLevelData} from '../lab2/types';

// TODO: Use this interface when converting MusicView to TypeScript
export interface MusicLevelData extends ProjectLevelData {
  toolbox?: {
    [key: string]: string[];
  };
  sounds?: {
    [key: string]: string[];
  };
  library?: string;
}
