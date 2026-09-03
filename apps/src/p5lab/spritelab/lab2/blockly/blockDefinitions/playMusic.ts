import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_MUSIC_PROJECT_DROPDOWN_TYPE} from '../musicProjectDropdown';

export const PLAY_MUSIC_BLOCK_TYPE = 'spritelab2_playMusic';

const definition: BlockJson = {
  type: PLAY_MUSIC_BLOCK_TYPE,
  message0: 'play music %1',
  args0: [{type: FIELD_MUSIC_PROJECT_DROPDOWN_TYPE, name: 'SONG'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Play one of your Music Lab songs, repeating, while the game plays. ' +
    'A song that is already playing keeps playing.',
};

const generator: GeneratorFunction = block =>
  `playMusic(${JSON.stringify(block.getFieldValue('SONG'))});\n`;

export default {definition, generator};
