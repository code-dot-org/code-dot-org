import {LevelProperties} from '../lab2/types';

// The level data for a panels level that doesn't require
// reloads between levels.
export interface PanelsLevelData {
  panels: Panel[];
}

export interface PanelsLevelProperties extends LevelProperties {
  panels: Panel[];
}

export type PanelLayout =
  | 'text-top-left'
  | 'text-top-right'
  | 'text-bottom-left'
  | 'text-bottom-right';

export interface Panel {
  imageUrl: string;
  text: string;
  nextUrl?: string;
  layout?: PanelLayout;
  key: string;
}
