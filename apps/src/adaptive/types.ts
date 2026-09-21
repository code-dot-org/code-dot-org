import {LevelProperties} from '../lab2/types';

export interface AdaptiveLevelProperties extends LevelProperties {
  adaptiveId?: string;
  // Parsed dashboard/config/level_content/adaptive/<adaptiveId>.json; typed
  // once the content format lands. Static content only, never per-user.
  adaptiveContent?: unknown;
}
