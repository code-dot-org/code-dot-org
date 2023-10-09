import {LevelProperties, ProjectSources} from '../lab2/types';

export type SongData = {
  [key: string]: {
    title: string;
    url: string;
    pg13: boolean;
  };
};

type Analysis = {
  beats: [boolean, boolean, boolean];
  centroid: number;
  energy: [number, number, number];
  time: number;
  volume: number;
};

export type SongMetadata = {
  analysis: Analysis[];
  artist: string;
  bpm: string;
  delay: string;
  duration: number;
  file: string;
  title: string;
  peaks: {[key: number]: number};
};

export interface DanceProjectSources extends ProjectSources {
  selectedSong?: string;
}

export interface DanceLevelProperties extends LevelProperties {
  defaultSong?: string;
  useRestrictedSongs?: boolean;
}

export type AiModalItem = {
  id: string;
  name: string;
};

export type AiModalReturnedItem = {
  id: string;
  name: string;
  url: string;
};

type EmojiAssociation = {
  association: number[];
  explanation: string;
};

export type CachedMapping = {
  emojiAssociations: {[key: string]: EmojiAssociation};
  output: string[];
};
