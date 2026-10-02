import {BlockStyles} from '../constants';
import {EXTERNAL_SCENE_DROPDOWN_FIELD} from '../externalSceneDropdown';
import {type BlockJson, type GeneratorFunction} from '../types';

export const GO_TO_EXTERNAL_SCENE_BLOCK_TYPE = 'spritelab2_goToExternalScene';

const definition: BlockJson = {
  type: GO_TO_EXTERNAL_SCENE_BLOCK_TYPE,
  message0: 'go to external scene %1',
  args0: [{type: EXTERNAL_SCENE_DROPDOWN_FIELD, name: 'SCENE'}],
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Jump into a scene from a classmate’s project (loads their scene ' +
    'and images, then fades in).',
};

const generator: GeneratorFunction = block =>
  `goToExternalScene(${JSON.stringify(block.getFieldValue('SCENE'))});\n`;

export default {definition, generator};
