import {LevelProperties} from '../lab2/types';

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
