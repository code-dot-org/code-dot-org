import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {PLAYER_2_GROUP} from '../../playerGroups';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

import {platformControlsHelper} from './makePlatformPlayer';

/**
 * A second platform player, steered by W, A, S and D as the first is by
 * the arrow keys. Same physics and jump; its own group, so each key set
 * moves only its own player.
 */
const definition: BlockJson = {
  type: 'spritelab2_setAsPlatformPlayer2',
  message0: 'set %1 as player 2',
  args0: [{type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip: 'A second player, moved with W, A, S and D.',
};

const generator: GeneratorFunction = block =>
  `setAsPlatformPlayer2({costume: ${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}});\n`;

const helperCode = [
  ...platformControlsHelper('wirePlatformControls2', PLAYER_2_GROUP, {
    left: 'a',
    right: 'd',
    up: 'w',
    down: 's',
  }),
  'function setAsPlatformPlayer2(spriteArg) {',
  `  setPlatformPlayer(spriteArg, ${JSON.stringify(PLAYER_2_GROUP)});`,
  '  wirePlatformControls2();',
  '}',
].join('\n');

export default {definition, generator, helperCode};
