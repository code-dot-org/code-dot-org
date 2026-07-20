import {BlockTypes} from '../blockTypes';

import {Categories} from './constants';

export type Category = (typeof Categories)[keyof typeof Categories];

/**
 * Defines which blocks should be in the toolbox for each category.
 */
export type CategoryBlocksMap = {
  [category in keyof typeof Categories]?: (keyof typeof BlockTypes | string)[];
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
