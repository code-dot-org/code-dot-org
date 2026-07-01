import {toolboxFromCategoryBlocks} from '@code-dot-org/blockly';
import type {Toolbox, ToolboxCategory} from '@code-dot-org/blockly';
import classNames from 'classnames';

import simple2Toolbox from './simple2';
import type {ToolboxData} from './types';

import {BlockMode} from '../../constants';

import moduleStyles from './toolbox.module.scss';

type BlockModeValue = (typeof BlockMode)[keyof typeof BlockMode];

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: classNames(moduleStyles.toolboxRow, 'blocklyTreeRow'),
  label: moduleStyles.toolboxLabel,
};

// Imbed css and craft toolboxes
const map: {
  [key: string]: ToolboxCategory[];
} = {
  [BlockMode.SIMPLE2]: simple2Toolbox.map(info => ({
    ...info,
    cssconfig: baseCategoryCssConfig,
  })),
} as const;

/**
 * Builds the Music Lab toolbox for a block mode. A level-defined toolbox is an
 * override: it is built directly from its `{category: blocks}` map and `type`
 * (flyout vs. categories) via {@link toolboxFromCategoryBlocks}. When the level
 * defines no toolbox, the mode's full default toolbox is used.
 *
 * TODO: resolve level block ids against the default toolbox's pool so blocks
 * with toolbox-seeded fields (e.g. the Effects block) keep them; today each id
 * is rendered with the block's own defaults.
 */
export function getToolbox(
  blockMode: BlockModeValue,
  toolboxData?: ToolboxData,
): Toolbox {
  if (toolboxData?.blocks) {
    return toolboxFromCategoryBlocks(toolboxData.blocks, toolboxData.type);
  }
  return map[blockMode] ?? [];
}

export * from './types';
export * from './constants';

export default map;
