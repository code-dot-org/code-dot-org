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

export function answerVariable(
  block: Parameters<GeneratorFunction>[0],
  javascript: Parameters<GeneratorFunction>[1]
): {varName: string; setter: string} | null {
  const target = block.getInput('VAR')?.connection?.targetBlock();
  if (!target || target.type !== 'variables_get') {
    return null;
  }
  const varName = javascript.blockToCode(target)[0];
  // Ensure the parameter does not shadow the student-provided variable (if it were named 'val').
  const param = varName === 'val' ? '__val' : 'val';
  return {varName, setter: `function (${param}) {${varName} = ${param};}`};
}

const generator: GeneratorFunction = (block, javascript) => {
  const answer = answerVariable(block, javascript);
  if (!answer) {
    return '';
  }
  const prompt = javascript.valueToCode(block, 'PROMPT', Order.NONE) || "''";
  return `askAI(${prompt}, '${answer.varName}', ${answer.setter});\n`;
};

export default {definition, generator};
