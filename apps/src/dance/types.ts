import {LevelProperties, ProjectSources} from '../lab2/types';

export type SongData = {
  [key: string]: {
    title: string;
    url: string;
    pg13: boolean;
  };
};

type Analysis = {
  beats: boolean[];
  centroid: number;
  energy: number[];
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

export enum AiOutput {
  AI_BLOCK = 'ai_block',
  GENERATED_BLOCKS = 'generated_blocks',
  BOTH = 'both',
}

export type LabelMaps = {
  [key in FieldKey]: {[id: string]: string};
};

export enum FieldKey {
  BACKGROUND_EFFECT = 'backgroundEffect',
  FOREGROUND_EFFECT = 'foregroundEffect',
  BACKGROUND_PALETTE = 'backgroundColor',
}

export type GeneratedEffect = {[key in FieldKey]: string};

export type GeneratedEffectScores = number[];
