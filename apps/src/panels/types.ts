import {LevelProperties} from '../lab2/types';

export interface PanelsLevelProperties extends LevelProperties {
  panels: Panel[];
}

export type PanelLayout =
  | 'text-top-left'
  | 'text-top-center'
  | 'text-top-right'
  | 'text-bottom-left'
  | 'text-bottom-center'
  | 'text-bottom-right';

export interface Panel {
  imageUrl: string;
  text: string;
  key: string;
  nextUrl?: string;
  layout?: PanelLayout;

  // The following fields are exploratory and not yet exposed in levelbuilder.
  dark?: boolean;
  typing?: boolean;
  fadeInOverPrevious?: boolean;
}
