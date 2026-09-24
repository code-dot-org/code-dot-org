import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {CHOSEN_IMAGE} from '../../runtimeImages';

export const CHOSEN_SPRITE_BLOCK_TYPE = 'spritelab2_chosenSprite';

// Whichever costume the last "when any sprite clicked" chose, in every
// scene until another click; the first costume before any click.
const definition: BlockJson = {
  type: CHOSEN_SPRITE_BLOCK_TYPE,
  message0: 'the chosen sprite',
  output: 'Sprite',
  style: BlockStyles.SPRITE,
  tooltip:
    'The sprite a "when any sprite clicked" block chose. It stays chosen ' +
    'in every scene until another one is clicked.',
};

// Registering the marker widens the scene preload to the chosen costume.
const generator: GeneratorFunction = () => [
  `{costume: ${noteImageFieldValue(JSON.stringify(CHOSEN_IMAGE))}}`,
  Order.ATOMIC,
];

export default {definition, generator};
