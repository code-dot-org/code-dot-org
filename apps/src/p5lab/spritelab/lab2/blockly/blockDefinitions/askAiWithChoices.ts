import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {answerVariable} from './askAi';

export const ASK_AI_WITH_CHOICES_BLOCK_TYPE = 'spritelab2_askAIWithChoices';

const CHOICE_INPUTS = ['CHOICE1', 'CHOICE2', 'CHOICE3'];

const definition: BlockJson = {
  type: ASK_AI_WITH_CHOICES_BLOCK_TYPE,
  message0: 'ask AI %1',
  args0: [{type: 'input_value', name: 'PROMPT', check: 'String'}],
  message1: 'with answer choices %1 %2 %3',
  args1: CHOICE_INPUTS.map(name => ({
    type: 'input_value' as const,
    name,
    check: 'String',
  })),
  message2: 'for variable %1',
  args2: [{type: 'input_value', name: 'VAR'}],
  inputsInline: false,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Ask the AI a question and have it pick one of your answer choices. ' +
    'The answer arrives a moment later, so use the "when ... answered" ' +
    'block to do something with it.',
};

const generator: GeneratorFunction = (block, javascript) => {
  const answer = answerVariable(block, javascript);
  if (!answer) {
    return '';
  }
  const [prompt, ...choices] = ['PROMPT', ...CHOICE_INPUTS].map(
    name => javascript.valueToCode(block, name, Order.COMMA) || "''"
  );
  return (
    `askAIWithChoices(${prompt}, '${answer.varName}', ` +
    `${choices.join(', ')}, ${answer.setter});\n`
  );
};

export default {definition, generator};
