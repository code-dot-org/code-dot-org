export const DEFAULT_FOLDER_ID = '0';

export enum MiniApps {
  Neighborhood = 'neighborhood',
}

export const MAZE_FILE_NAME = 'serialized_maze.txt';

export type LayoutKey = 'horizontal' | 'vertical';

export enum FontSize {
  Tiny = 11,
  Small = 14, // Default font size
  Medium = 17,
  Large = 22,
  Huge = 27,
}

export const DEFAULT_FONT_SIZE_KEY = FontSize.Small;
