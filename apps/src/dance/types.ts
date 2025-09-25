import {BlocklyLevelProperties, ProjectSources} from '../lab2/types';

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

export interface DanceLevelProperties extends BlocklyLevelProperties {
  defaultSong?: string;
  useRestrictedSongs?: boolean;
  songSelection?: string[];
  generateDancerMode?: boolean;
  aiDancerGenerateAdlib?: string;
  aiCodeGenerate?: boolean;
}

export type DancerLayout = {
  mode: 'fit' | 'cover' | 'stretch' | 'none';
  scale?: number;
  align?: {x: 'start' | 'center' | 'end'; y: 'start' | 'center' | 'end'};
  offset?: {x: number; y: number};
  clearBeforeDraw?: boolean;
};

export interface DancerRenderer {
  init(ctx: CanvasRenderingContext2D): void;
  setSource(src: {url?: string; data?: unknown}): Promise<void>;
  renderFrame(frameIndex: number, layout?: DancerLayout): void;
  getDurationFrames(): number | null;
  dispose(): void;
}
