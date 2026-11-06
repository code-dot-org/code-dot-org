import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {PLAYER_2_GROUP} from '../../playerGroups';

export const THE_PLAYER_2_BLOCK_TYPE = 'spritelab2_thePlayer2';

/** The second platform player, selected by its group as "the player" is. */
const definition: BlockJson = {
  type: THE_PLAYER_2_BLOCK_TYPE,
  message0: 'player 2',
  output: 'Sprite',
  style: BlockStyles.SPRITE,
  tooltip:
    'Whichever sprite is player 2, whatever it looks like and whatever it ' +
    'is called.',
};

const generator: GeneratorFunction = () => [
  `{group: ${JSON.stringify(PLAYER_2_GROUP)}}`,
  Order.ATOMIC,
];

export default {definition, generator};
