import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_EXTERNAL_SCENE_DROPDOWN_TYPE} from '../externalSceneDropdown';

export const GO_TO_EXTERNAL_SCENE_BLOCK_TYPE = 'spritelab2_goToExternalScene';

const definition: BlockJson = {
  type: GO_TO_EXTERNAL_SCENE_BLOCK_TYPE,
  message0: 'go to external scene %1',
  args0: [{type: FIELD_EXTERNAL_SCENE_DROPDOWN_TYPE, name: 'SCENE'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Jump into a scene from a classmate’s project (loads their scene ' +
    'and images, then fades in).',
};

const generator: GeneratorFunction = block =>
  `goToExternalScene(${JSON.stringify(block.getFieldValue('SCENE'))});\n`;

export default {definition, generator};
