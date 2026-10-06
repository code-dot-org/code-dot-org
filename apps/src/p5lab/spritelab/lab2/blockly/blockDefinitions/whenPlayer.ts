import * as BlocklyCore from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const WHEN_PLAYER_BLOCK_TYPE = 'spritelab2_whenPlayer';
export const EVENT_HAT_EXTENSION = 'spritelab2_event_hat';

/** The generator reads this flag before it runs the block's own generator,
    so a hat sets it as it is created. */
export function eventHat(this: BlocklyCore.Block): void {
  (this as {skipNextBlockGeneration?: boolean}).skipNextBlockGeneration = true;
}

/** [label, PlayerAction] */
export const WHEN_PLAYER_OPTIONS: [string, string][] = [
  ['walks', 'walk'],
  ['jumps', 'jump'],
  ['bumps', 'bump'],
];

const definition: BlockJson = {
  type: WHEN_PLAYER_BLOCK_TYPE,
  message0: 'when player %1',
  args0: [
    {type: 'field_dropdown', name: 'ACTION', options: WHEN_PLAYER_OPTIONS},
  ],
  nextStatement: null,
  style: BlockStyles.EVENT,
  extensions: [EVENT_HAT_EXTENSION],
  tooltip:
    'Runs the blocks below each time the player does this. Walking fires ' +
    'about three times a second.',
};

// The blocks below the hat are the handler; eventHat keeps them out of the
// hat's next chain.
const generator: GeneratorFunction = (block, javascript) => {
  const next = block.nextConnection?.targetBlock() ?? null;
  const handler = next ? javascript.blockToCode(next, false) : '';
  const body = javascript.prefixLines(String(handler), '  ');
  const action = JSON.stringify(block.getFieldValue('ACTION'));
  return `whenPlayer(${action}, function () {\n${body}});\n`;
};

export default {definition, generator};
