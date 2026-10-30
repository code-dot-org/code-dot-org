import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'spritelab2_movingLeft',
  message0: 'moving left',
  output: 'Behavior',
  style: BlockStyles.BEHAVIOR,
};

const generator: GeneratorFunction = () => [
  'movingLeft()',
  Order.FUNCTION_CALL,
];

const helperCode = [
  'function movingLeft() {',
  '  return {',
  '    func: function (spriteId) {',
  '      moveInDirection(spriteId, 2, "West");',
  '    },',
  "    name: 'moving left',",
  '  };',
  '}',
].join('\n');

export default {definition, generator, helperCode};
