import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const RESTART_SCENE_BLOCK_TYPE = 'spritelab2_restartScene';

const definition: BlockJson = {
  type: RESTART_SCENE_BLOCK_TYPE,
  message0: 'restart scene',
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Start this scene over: everything returns to where it began, after a ' +
    'quick fade from black.',
};

const generator: GeneratorFunction = () => 'restartScene();\n';

export default {definition, generator};
