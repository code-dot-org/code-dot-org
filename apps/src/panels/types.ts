// The level data for a panels level that doesn't require
// reloads between levels.
export interface PanelsLevelData {
  panels: [
    {
      imageUrl: string;
      text: string;
      nextUrl?: string;
      layout?: string;
    }
  ];
}
