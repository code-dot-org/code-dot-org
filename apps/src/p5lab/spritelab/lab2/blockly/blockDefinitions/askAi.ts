import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const ASK_AI_BLOCK_TYPE = 'spritelab2_askAI';

const definition: BlockJson = {
  type: ASK_AI_BLOCK_TYPE,
  message0: 'ask AI %1',
  args0: [{type: 'input_value', name: 'PROMPT', check: 'String'}],
  message1: 'for variable %1',
  args1: [{type: 'input_value', name: 'VAR'}],
  inputsInline: false,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Ask the AI a question. The answer arrives a moment later, so use the ' +
    '"when ... answered" block to do something with it.',
};

const generator: GeneratorFunction = (block, javascript) => {
  const target = block.getInput('VAR')?.connection?.targetBlock();
  if (!target || target.type !== 'variables_get') {
    return '';
  }
  const varName = javascript.blockToCode(target)[0];
  const prompt = javascript.valueToCode(block, 'PROMPT', Order.NONE) || "''";
  // Ensure the parameter does not shadow the student-provided variable (if it were named 'val').
  const param = varName === 'val' ? '__val' : 'val';
  return `askAI(${prompt}, '${varName}', function (${param}) {${varName} = ${param};});\n`;
};

export default {definition, generator};
