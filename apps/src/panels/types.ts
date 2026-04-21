import {LevelProperties} from '../lab2/types';

export interface PanelsLevelProperties extends LevelProperties {
  panels?: Panel[];
  // Rails serializes boolean properties as the string "true" or "false", so
  // callers must coerce before passing to PanelsView.
  useLinks?: boolean | string;
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
  // Only honored when the level is in links mode. When true, the Continue
  // button is shown on this panel.
  showContinueButton?: boolean;

  // The following fields are exploratory and not yet exposed in levelbuilder.
  dark?: boolean;
  typing?: boolean;
  fadeInOverPrevious?: boolean;
}

// A clickable box rendered inside a panel that navigates to another panel.
// x and y are percentages (0-100) of the panel, describing the link's center.
// width is the link box width as a percentage (0-100) of the panel, defaulting
// to DEFAULT_PANEL_LINK_WIDTH when not specified.
// key is the target panel's key.
export interface PanelLink {
  text: string;
  x: number;
  y: number;
  width?: number;
  key: string;
}

export const DEFAULT_PANEL_LINK_WIDTH = 40;
