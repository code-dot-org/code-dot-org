import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const TOUCHED_SPRITE_BLOCK_TYPE = 'spritelab2_touchedSprite';
export const CLICKED_SPRITE_BLOCK_TYPE = 'spritelab2_clickedSprite';

/**
 * Sprite Lab 1's event pointer blocks, offered in the toolbox rather than in
 * the event's "+" drawer: the one sprite an event fired for, read from the
 * extraArgs its handler receives.
 */
function eventSprite(
  type: string,
  message: string,
  tooltip: string,
  eventType: string,
  extraArg: string
): {definition: BlockJson; generator: GeneratorFunction} {
  const definition: BlockJson = {
    type,
    message0: message,
    output: 'Sprite',
    style: BlockStyles.SPRITE,
    tooltip,
  };
  // Nothing in the toolbox keeps the block under its event, and anywhere
  // else extraArgs is undefined; {} names no sprite.
  const generator: GeneratorFunction = block => [
    block.getRootBlock().type === eventType
      ? `{id: extraArgs.${extraArg}}`
      : '{}',
    Order.ATOMIC,
  ];
  return {definition, generator};
}

export const touchedSprite = eventSprite(
  TOUCHED_SPRITE_BLOCK_TYPE,
  'the touched sprite',
  'Under "when touching", the sprite that was just touched.',
  'gamelab_checkTouching',
  'objectSprite'
);

export const clickedSprite = eventSprite(
  CLICKED_SPRITE_BLOCK_TYPE,
  'the clicked sprite',
  'Under "when clicked", the sprite that was just clicked.',
  'gamelab_spriteClicked',
  'clickedSprite'
);
