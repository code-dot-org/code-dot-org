import {LevelProperties} from '../lab2/types';

export interface PanelsLevelProperties extends LevelProperties {
  panels?: Panel[];
  useLinks?: boolean;
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
  links?: PanelLink[];
  // Honored only when useLinks is set on the level.
  showContinueButton?: boolean;

  // The following fields are exploratory and not yet exposed in levelbuilder.
  dark?: boolean;
  typing?: boolean;
  fadeInOverPrevious?: boolean;
}

// Clickable box inside a panel that jumps to the panel with matching key.
// x, y, width are percentages of the containing panel; (x, y) is the center.
export interface PanelLink {
  text: string;
  x: number;
  y: number;
  width?: number;
  targetKey: string;
}

export const DEFAULT_PANEL_LINK_WIDTH = 40;
export const DEFAULT_PANEL_LINK_X = 50;
export const DEFAULT_PANEL_LINK_Y = 50;
