export interface LevelConfiguration {
  game_id: number;
  created_at: string;
  level_num: number | 'custom';
  user_id: number;
  published: boolean;
  notes: string;
  properties: LevelProperties;
}

export interface BaseLevelProps {
  short_instructions: string;
  long_instructions: string;
  video_key?: string;
}
