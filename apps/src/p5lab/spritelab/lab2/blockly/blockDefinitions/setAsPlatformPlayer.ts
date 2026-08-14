import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

/**
 * Promote existing sprites (e.g. ones the World tab placed) to platform
 * players: they join the players group, so the platformer physics and the
 * shared arrow/jump controls apply to them.
 */
const definition: BlockJson = {
  type: 'spritelab2_setAsPlatformPlayer',
  message0: 'set %1 as platform player',
  args0: [{type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `setAsPlatformPlayer({costume: ${block.getFieldValue('ANIMATION_NAME')}});\n`;

const helperCode = [
  'function setAsPlatformPlayer(spriteArg) {',
  '  setPlatformPlayer(spriteArg);',
  '  wirePlatformControls();',
  '}',
].join('\n');

export default {definition, generator, helperCode};
