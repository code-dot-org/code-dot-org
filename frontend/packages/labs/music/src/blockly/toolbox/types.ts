import {BlockTypes} from '../blockTypes';

/**
 * Valid toolbox categories for Music Lab.
 */
export const Category = {
  Control: 'Control',
  Effects: 'Effects',
  Events: 'Events',
  Functions: 'Functions',
  Logic: 'Logic',
  Math: 'Math',
  Play: 'Play',
  Simple: 'Simple',
  Tracks: 'Tracks',
  Variables: 'Variables',
} as const;

/**
 * Defines which blocks should be in the toolbox for each category.
 */
export type CategoryBlocksMap = {
  [category in keyof typeof Category]?: (keyof typeof BlockTypes | string)[];
};

/**
 * Toolbox type.
 * Category displays blocks in categories, flyout displays all blocks in a single list.
 */
export type ToolboxType = 'category' | 'flyout';

/**
 * Level-defined data for configuring the toolbox.
 */
export interface ToolboxData {
  blocks?: CategoryBlocksMap;
  type?: ToolboxType;
  includeAi?: boolean;
  addFunctionDefinition?: boolean;
  addFunctionCalls?: boolean;
  addFunctionCallsSortByPosition?: boolean;
}
