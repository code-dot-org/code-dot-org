import {LevelProperties, ProjectSources, ProjectLevelData} from '../lab2/types';

export type SongData = {
  [key: string]: {
    title: string;
    url: string;
    pg13: boolean;
  };
};

export interface DanceProjectSources extends ProjectSources {
  selectedSong?: string;
}

export interface DanceLevelProperties extends LevelProperties {
  customBlocks?: string;
  defaultSong?: string;
  edit_blocks?: string;
  hideCustomBlocks?: boolean;
  isK1?: boolean;
  sharedBlocks: any[];
  skin: string;
  toolbox?: string;
  useRestrictedSongs?: boolean;
}
