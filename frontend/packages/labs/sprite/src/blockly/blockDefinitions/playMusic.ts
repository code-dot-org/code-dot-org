import {BlockStyles} from '../constants';
import {MUSIC_PROJECT_DROPDOWN_FIELD} from '../musicProjectDropdown';
import {type BlockJson, type GeneratorFunction} from '../types';

export const PLAY_MUSIC_BLOCK_TYPE = 'spritelab2_playMusic';

const definition: BlockJson = {
  type: PLAY_MUSIC_BLOCK_TYPE,
  message0: 'play music %1',
  args0: [{type: MUSIC_PROJECT_DROPDOWN_FIELD, name: 'SONG'}],
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Play one of your Music Lab songs, repeating, while the game plays. ' +
    'A song that is already playing keeps playing.',
};

const generator: GeneratorFunction = block =>
  `playMusic(${JSON.stringify(block.getFieldValue('SONG'))});\n`;

export default {definition, generator};
