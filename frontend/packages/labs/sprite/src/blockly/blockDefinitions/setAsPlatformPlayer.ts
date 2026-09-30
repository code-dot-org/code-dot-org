import {noteImageFieldValue} from '../../imageReferences';
import {BlockStyles} from '../constants';
import {COSTUME_FIELD} from '../imagePickerFields';
import {type BlockJson, type GeneratorFunction} from '../types';

/**
 * Promote existing sprites (e.g. ones the World tab placed) to platform
 * players: they join the players group, so the platformer physics and the
 * shared arrow/jump controls apply to them.
 */
const definition: BlockJson = {
  type: 'spritelab2_setAsPlatformPlayer',
  message0: 'set %1 as player',
  args0: [{type: COSTUME_FIELD, name: 'ANIMATION_NAME'}],
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `setAsPlatformPlayer({costume: ${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME'),
  )}});\n`;

const helperCode = [
  'function setAsPlatformPlayer(spriteArg) {',
  '  setPlatformPlayer(spriteArg);',
  '  wirePlatformControls();',
  '}',
].join('\n');

export default {definition, generator, helperCode};
