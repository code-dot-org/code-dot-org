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

export enum AiOutput {
  AI_BLOCK = 'ai_block',
  GENERATED_BLOCKS = 'generated_blocks',
  BOTH = 'both',
}

// first item is user readable / translated string (eg, "Blooming Petals"),
// second item is english-only key (eg, "blooming_petals")
// ['Blooming Petals', 'blooming_petals']
export type TranslationTuple = [string, string];

export type DropdownTranslations = TranslationTuple[];

export type Translations = {
  [key in FieldKey]: DropdownTranslations;
};

export enum FieldKey {
  BACKGROUND_EFFECT = 'backgroundEffect',
  FOREGROUND_EFFECT = 'foregroundEffect',
  BACKGROUND_PALETTE = 'backgroundColor',
}
