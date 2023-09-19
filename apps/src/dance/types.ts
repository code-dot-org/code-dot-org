import {LevelProperties, ProjectSources} from '../lab2/types';

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
  defaultSong?: string;
  useRestrictedSongs?: boolean;
}
