import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_BLOCK_IMAGE_TYPE} from '../imagePickerFields';

import {EVENT_HAT_EXTENSION, eventHandlerCode} from './whenPlayer';

export const WHEN_PLAYER_STEPS_ON_BLOCK_TYPE = 'spritelab2_whenPlayerStepsOn';

const definition: BlockJson = {
  type: WHEN_PLAYER_STEPS_ON_BLOCK_TYPE,
  message0: 'when player steps on %1',
  // Platform pieces come from the 'blocks' image category.
  args0: [{type: FIELD_BLOCK_IMAGE_TYPE, name: 'ANIMATION_NAME'}],
  nextStatement: null,
  style: BlockStyles.EVENT,
  extensions: [EVENT_HAT_EXTENSION],
  tooltip:
    'Runs the blocks below each time the player steps onto a platform ' +
    'block of this kind: landing on it, or walking onto it.',
};

const generator: GeneratorFunction = (block, javascript) =>
  `whenPlayerStepsOn(${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}, function () {\n${eventHandlerCode(block, javascript)}});\n`;

export default {definition, generator};
