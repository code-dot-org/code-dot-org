export interface LevelData {
  library: string;
  showSoundFilters: boolean;
  toolbox: {
    includeAi: boolean;
  };
  allowChangeStartingPlayheadPosition: boolean;
}
export interface LevelProperties {
  background: string;
  isProjectLevel: string;
  encrypted: string;
  levelData: LevelData;
  hideShareAndRemix: string;
  instructionsImportant: string;
  offerBrowserTts: string;
  useSecondaryFinishButton: string;
  name: string;
  id: number;
  type: string;
  appName: string;
  useRestrictedSongs: boolean;
  usesProjects: string;
  baseAssetUrl: string;
}
export interface LevelPropertiesRequest {
  levelId: string;
}
export type LevelPropertiesResponse = Record<string, LevelProperties>;
