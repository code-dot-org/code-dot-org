import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {ELEMENT_FIELD_TYPE, ElementKind} from './elementField';

export const WHEN_BUTTON_PRESSED_BLOCK_TYPE = 'miniapp_whenButtonPressed';
export const SET_TEXT_BLOCK_TYPE = 'miniapp_setText';
export const GET_TEXT_BLOCK_TYPE = 'miniapp_getText';
export const JOIN_BLOCK_TYPE = 'miniapp_join';
export const ASK_AI_BLOCK_TYPE = 'miniapp_askAi';
export const AI_ANSWER_BLOCK_TYPE = 'miniapp_aiAnswer';

interface LabBlock {
  definition: BlockJson;
  generator: GeneratorFunction;
}

const quote = (value: string | null) => JSON.stringify(value ?? '');

// BlockJson does not know the lab's own field, hence the cast.
const elementField = (name: string, kind: ElementKind) =>
  ({
    type: ELEMENT_FIELD_TYPE,
    name,
    kind,
  } as unknown as BlockJson['args0'][number]);

// Handlers are async so an "ask AI" block can wait for its answer before the
// blocks inside it run.  `aiAnswer` is the handler's own, so an "AI answer"
// block outside any ask reads '' rather than throwing.
const whenButtonPressed: LabBlock = {
  definition: {
    type: WHEN_BUTTON_PRESSED_BLOCK_TYPE,
    message0: 'when %1 pressed %2 %3',
    args0: [
      elementField('BUTTON', 'button'),
      {type: 'input_dummy', name: 'HEAD'},
      {type: 'input_statement', name: 'DO'},
    ],
    style: BlockStyles.EVENT,
    tooltip: 'Runs the blocks inside when the button is pressed.',
  },
  generator: (block, generator) => {
    const id = block.getFieldValue('BUTTON');
    const body = generator.statementToCode(block, 'DO');
    return (
      `MiniApp.onButtonPressed(${quote(id)}, async function () {\n` +
      `  let aiAnswer = '';\n${body}});\n`
    );
  },
};

const setText: LabBlock = {
  definition: {
    type: SET_TEXT_BLOCK_TYPE,
    message0: 'set text of %1 to %2',
    args0: [elementField('FIELD', 'text'), {type: 'input_value', name: 'TEXT'}],
    previousStatement: null,
    nextStatement: null,
    style: BlockStyles.DEFAULT,
    tooltip: 'Shows the text in the chosen field.',
  },
  generator: (block, generator) => {
    const id = block.getFieldValue('FIELD');
    const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return `MiniApp.setText(${quote(id)}, ${text});\n`;
  },
};

const getText: LabBlock = {
  definition: {
    type: GET_TEXT_BLOCK_TYPE,
    message0: 'text of %1',
    args0: [elementField('FIELD', 'text')],
    output: null,
    style: BlockStyles.DEFAULT,
    tooltip: 'The text the chosen field shows right now.',
  },
  generator: block => [
    `MiniApp.getText(${quote(block.getFieldValue('FIELD'))})`,
    Order.FUNCTION_CALL,
  ],
};

const join: LabBlock = {
  definition: {
    type: JOIN_BLOCK_TYPE,
    message0: 'join %1 %2',
    args0: [
      {type: 'input_value', name: 'A'},
      {type: 'input_value', name: 'B'},
    ],
    inputsInline: true,
    output: null,
    style: BlockStyles.TEXT,
    tooltip: 'Puts two pieces of text together.',
  },
  generator: (block, generator) => {
    const a = generator.valueToCode(block, 'A', Order.NONE) || "''";
    const b = generator.valueToCode(block, 'B', Order.NONE) || "''";
    return [`String(${a}) + String(${b})`, Order.ADDITION];
  },
};

const askAi: LabBlock = {
  definition: {
    type: ASK_AI_BLOCK_TYPE,
    message0: 'ask AI %1 then do %2 %3',
    args0: [
      {type: 'input_value', name: 'PROMPT'},
      {type: 'input_dummy', name: 'HEAD'},
      {type: 'input_statement', name: 'DO'},
    ],
    previousStatement: null,
    nextStatement: null,
    style: BlockStyles.LAB_BLOCKS,
    tooltip:
      'Sends the prompt to the AI and waits.  The blocks inside run once the answer is back.',
  },
  generator: (block, generator) => {
    const prompt = generator.valueToCode(block, 'PROMPT', Order.NONE) || "''";
    const body = generator.statementToCode(block, 'DO');
    return `aiAnswer = await MiniApp.askAi(${prompt});\n${body}`;
  },
};

const aiAnswer: LabBlock = {
  definition: {
    type: AI_ANSWER_BLOCK_TYPE,
    message0: 'AI answer',
    output: null,
    style: BlockStyles.LAB_BLOCKS,
    tooltip: 'What the AI answered, inside an "ask AI" block.',
  },
  generator: () => ['aiAnswer', Order.ATOMIC],
};

export const labBlocks: LabBlock[] = [
  whenButtonPressed,
  setText,
  getText,
  join,
  askAi,
  aiAnswer,
];
