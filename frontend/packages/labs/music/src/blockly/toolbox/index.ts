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
 * override: it is built from its `{category: blocks}` map and `type` (flyout
 * vs. categories) via {@link toolboxFromCategoryBlocks}, resolving each block id
 * against the mode's default toolbox (the pool) so blocks with toolbox-seeded
 * fields (e.g. the Effects block's effect/value) keep them. When the level
 * defines no toolbox, the mode's full default toolbox is used.
 */
export function getToolbox(
  blockMode: BlockModeValue,
  toolboxData?: ToolboxData,
): Toolbox {
  const defaultToolbox = map[blockMode] ?? [];
  if (toolboxData?.blocks) {
    return toolboxFromCategoryBlocks(
      toolboxData.blocks,
      toolboxData.type,
      defaultToolbox,
    );
  }
  return defaultToolbox;
}

export * from './types';
export * from './constants';

export default map;
