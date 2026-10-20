import * as Blockly from 'blockly/core';

import {BlockTypes} from '../../constants';
import {createInjectPlugin} from '../../plugins';

// Apps' BlockColors.DISABLED, HSV (0, 0, 0.5).
const GRAY = '#808080';

// Top blocks a level makes undeletable as a matter of course.
const EXEMPT_TYPES: string[] = [
  BlockTypes.whenRun,
  BlockTypes.procedureDefinition,
];

/**
 * Grays out undeletable blocks.
 */
export function grayOutUndeletableBlocks(event: Blockly.Events.Abstract) {
  const expectedEventTypes: string[] = [
    Blockly.Events.BLOCK_CREATE,
    Blockly.Events.FINISHED_LOADING,
    Blockly.Events.SELECTED,
  ];
  if (!expectedEventTypes.includes(event.type) || !event.workspaceId) {
    return;
  }

  const workspace = Blockly.Workspace.getById(event.workspaceId);
  if (!workspace || workspace.isReadOnly()) {
    return;
  }

  workspace
    .getAllBlocks(false)
    .filter(block => !block.isDeletable() && !EXEMPT_TYPES.includes(block.type))
    .forEach(block => block.setColour(GRAY));
}

/**
 * Plugin that grays out blocks that are undeletable.
 */
export const plugin = createInjectPlugin({
  onChange: grayOutUndeletableBlocks,
});

export default plugin;
