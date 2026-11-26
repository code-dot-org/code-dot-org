import {Block} from 'blockly/core';
import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';
import {BLOCK_LABELS} from '@cdo/apps/blockly/utils/localization/blockDefinitions';
import {translateFilled} from '@cdo/apps/localization/templates';

export const TOUCHED_SPRITE_BLOCK_TYPE = 'spritelab2_touchedSprite';
export const CLICKED_SPRITE_BLOCK_TYPE = 'spritelab2_clickedSprite';
export const EVENT_SPRITE_EXTENSION = 'spritelab2_event_sprite';

interface EventSprite {
  message: string;
  tooltip: string;
  eventType: string;
  eventName: string;
  extraArg: string;
}

const EVENT_SPRITES: Record<string, EventSprite> = {
  [TOUCHED_SPRITE_BLOCK_TYPE]: {
    message: 'the touched sprite',
    tooltip:
      'Under "when touching", the second sprite: in "when player touches ' +
      'coin", the coin.',
    eventType: 'gamelab_checkTouching',
    eventName: 'when touching',
    extraArg: 'objectSprite',
  },
  [CLICKED_SPRITE_BLOCK_TYPE]: {
    message: 'the clicked sprite',
    tooltip: 'Under "when clicked", the sprite that was just clicked.',
    eventType: 'gamelab_spriteClicked',
    eventName: 'when clicked',
    extraArg: 'clickedSprite',
  },
};

// The event's own sprite inputs run outside its handler, where extraArgs is
// undefined.
function isInItsHandler(block: Block): boolean {
  const root = block.getRootBlock();
  return (
    root.type === EVENT_SPRITES[block.type].eventType &&
    !!root.getNextBlock()?.getDescendants(false).includes(block)
  );
}

export function eventSpriteWarning(this: Block): void {
  this.setOnChange(() => {
    if (this.isInFlyout) {
      return;
    }
    const picksNothing =
      this.getRootBlock().isEnabled() && !isInItsHandler(this);
    this.setWarningText(
      picksNothing
        ? translateFilled(
            'This block picks a sprite only in the blocks below "{{event}}".',
            {
              event: translateFilled(
                EVENT_SPRITES[this.type].eventName,
                {},
                BLOCK_LABELS
              ),
            },
            BLOCK_LABELS
          )
        : null
    );
  });
}

function eventSprite(type: string): {
  definition: BlockJson;
  generator: GeneratorFunction;
} {
  const {message, tooltip, extraArg} = EVENT_SPRITES[type];
  return {
    definition: {
      type,
      message0: message,
      output: 'Sprite',
      style: BlockStyles.SPRITE,
      tooltip,
      extensions: [EVENT_SPRITE_EXTENSION],
    },
    generator: block => [
      isInItsHandler(block) ? `{id: extraArgs.${extraArg}}` : '{}',
      Order.ATOMIC,
    ],
  };
}

export const touchedSprite = eventSprite(TOUCHED_SPRITE_BLOCK_TYPE);
export const clickedSprite = eventSprite(CLICKED_SPRITE_BLOCK_TYPE);
