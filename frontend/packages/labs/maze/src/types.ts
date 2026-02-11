import type {MazeData} from './MazeController';
import type {SkinData} from './skin';

/**
 * Represents a set of skins for a particular level set.
 */
export interface SkinsData {
  /** Each possible skin in our level collection */
  [key: string]: SkinData;
}

/**
 * Describes the API for the maze commands.
 */
export interface API {
  /** An api call handles getting a block id as an argument */
  [key: string]: (id: string) => void;
}

export type {MazeData};
