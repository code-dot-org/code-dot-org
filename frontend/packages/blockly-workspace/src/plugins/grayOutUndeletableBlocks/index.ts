import * as Blockly from 'blockly/core';

import {createInjectPlugin} from '../../plugins';

type State = Blockly.serialization.blocks.State;

/**
 * Grays out undeletable blocks.
 */
export function grayOutUndeletableBlocks(event: Blockly.Events.Abstract) {
  const expectedEventTypes: string[] = [
    Blockly.Events.BLOCK_CHANGE,
    Blockly.Events.BLOCK_CREATE,
  ];

  // Mask out only certain event types
  if (!expectedEventTypes.includes(event.type)) {
    return;
  }

  const blockEvent = event as
    | Blockly.Events.BlockCreate
    | Blockly.Events.BlockChange;

  if (!blockEvent.blockId || !blockEvent.workspaceId) {
    return;
  }

  const eventWorkspace = Blockly.Workspace.getById(blockEvent.workspaceId);

  const grayOut: (state: State) => void = state => {
    if (!state.id) {
      return;
    }

    const block = eventWorkspace?.getBlockById(state.id);
    if (
      block &&
      eventWorkspace &&
      !block.isDeletable() &&
      block.isMovable() &&
      !eventWorkspace.options.readOnly
    ) {
      block.setColour('#888');
    }

    // Go through the connected blocks that were created with this block
    if (state.next?.block) {
      grayOut(state.next.block);
    }

    // Ditto for inputs
    for (const input of Object.values(state.inputs || {})) {
      if (input.block) {
        grayOut(input.block);
      }
    }
  };

  const blockState: State = (blockEvent.type === Blockly.Events.BLOCK_CREATE &&
    (blockEvent as Blockly.Events.BlockCreate).json) || {
    id: blockEvent.blockId,
    type: '',
  };

  grayOut(blockState);
}

/**
 * Plugin that grays out blocks that are undeletable.
 */
export const plugin = createInjectPlugin({
  onChange: grayOutUndeletableBlocks,
});

export default plugin;
