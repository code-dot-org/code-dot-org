import {BlockTypes} from '../blockTypes';

/**
 * Valid toolbox categories for Music Lab.
 */
export enum Category {
  Control = 'Control',
  Effects = 'Effects',
  Events = 'Events',
  Functions = 'Functions',
  Logic = 'Logic',
  Math = 'Math',
  Play = 'Play',
  Simple = 'Simple',
  Tracks = 'Tracks',
  Variables = 'Variables',
}

/**
 * Defines which blocks should be in the toolbox for each category.
 */
export type CategoryBlocksMap = {
  [category in Category]?: (BlockTypes | string)[];
};

/**
 * Additional options for configuring the toolbox.
 */
export interface ToolboxOptions {
  includeFunctions?: boolean;
  includeVariables?: boolean;
}

/**
 * Toolbox type.
 * Category displays blocks in categories, flyout displays all blocks in a single list.
 */
export type ToolboxType = 'category' | 'flyout';

/**
 * Level-defined data for configuring the toolbox.
 */
export interface ToolboxData {
  blocks: CategoryBlocksMap;
  type?: ToolboxType;
}
