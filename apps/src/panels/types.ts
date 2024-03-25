// The level data for a panels level that doesn't require
// reloads between levels.
export interface PanelsLevelData {
  panels: Panel[];
}

export type PanelLayout = 'text-bottom-left' | 'text-top-right';

export interface Panel {
  imageUrl: string;
  text: string;
  nextUrl?: string;
  layout?: PanelLayout;
  key: string;
}
