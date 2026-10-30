import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const THE_PLAYER_BLOCK_TYPE = 'spritelab2_thePlayer';

/**
 * The platform player, selected by its group rather than its costume. A level
 * can hand this to a block before the student has named anything, and it keeps
 * pointing at the player after a costume change — which the costume selectors
 * cannot.
 */
const definition: BlockJson = {
  type: THE_PLAYER_BLOCK_TYPE,
  message0: 'the player',
  output: 'Sprite',
  style: BlockStyles.SPRITE,
  tooltip:
    'Whichever sprite is the platform player, whatever it looks like and ' +
    'whatever it is called.',
};

const generator: GeneratorFunction = () => ["{group: 'players'}", Order.ATOMIC];

export default {definition, generator};
