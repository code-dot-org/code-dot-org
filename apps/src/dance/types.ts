import {ProjectSource} from 'aws-sdk/clients/codebuild';
import {LevelProperties} from '../lab2/types';

export interface SongData {
  [songId: string]: {
    title: string;
    url: string;
    pg13: boolean;
  };
}

export interface SongMetadata {
  file: string;
  artist: string;
  title: string;
}

export interface DanceProjectSource extends ProjectSource {
  selectedSong: string;
}

export interface DanceLevelProperties extends LevelProperties {
  defaultSong?: string;
  useRestrictedSongs?: boolean;
}
