import {BlockTypes} from '../blockTypes';

export const loopFromTo = {
  definition: {
    type: BlockTypes.LOOP_FROM_TO,
    message0: 'loop %1 from %2 to %3',
    args0: [
      {
        type: 'field_variable',
        name: 'measure',
        variable: 'measure'
      },
      {
        type: 'field_number',
        name: 'from',
        value: 1,
        min: 1
      },
      {
        type: 'field_number',
        name: 'to',
        value: 5,
        min: 1
      }
    ],
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'code'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'loop from a number to another number',
    helpUrl: ''
  },
  generator: ctx =>
    'for (var measure = ' +
    ctx.getFieldValue('from') +
    '; measure <= ' +
    ctx.getFieldValue('to') +
    '; measure++) {\n' +
    //ctx.getFieldValue('code') +
    Blockly.JavaScript.statementToCode(ctx, 'code') +
    '\n}\n'
};

export const ifEvenThen = {
  definition: {
    type: BlockTypes.IF_EVEN_THEN,
    message0: 'if %1 is even then %2',
    args0: [
      {
        type: 'field_variable',
        name: 'measure',
        variable: 'measure'
      },
      {
        type: 'input_statement',
        name: 'code'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'does something if the measure is even',
    helpUrl: ''
  },
  generator: ctx =>
    'if(' +
    'measure % 2 == 0' +
    ') {\n' +
    Blockly.JavaScript.statementToCode(ctx, 'code') +
    '\n}\n'
};
