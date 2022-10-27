import {BlockTypes} from '../blockTypes';

export const simpleIf = {
  definition: {
    type: BlockTypes.SIMPLE_IF,
    message0: 'if %1',
    args0: [
      {
        type: 'input_value',
        name: 'value',
        check: 'Number',
        align: 'LEFT'
      }
    ],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'code',
        align: 'LEFT'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'logic_blocks',
    tooltip: 'if condition is true then do the code',
    helpUrl: ''
  },
  generator: ctx => {
    let value =
      Blockly.JavaScript.valueToCode(
        ctx,
        'value',
        Blockly.JavaScript.ORDER_ASSIGNMENT
      ) || '0';

    return (
      'if (' +
      value +
      ') {\n' +
      Blockly.JavaScript.statementToCode(ctx, 'code') +
      '\n}\n'
    );
  }
};

export const logicCompare = {
  definition: {
    type: BlockTypes.LOGIC_COMPARE,
    message0: '%1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'A'
      },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [
          ['=', 'EQ'],
          ['\u2260', 'NEQ'],
          ['\u200F<', 'LT'],
          ['\u200F\u2264', 'LTE'],
          ['\u200F>', 'GT'],
          ['\u200F\u2265', 'GTE']
        ]
      },
      {
        type: 'input_value',
        name: 'B'
      }
    ],
    inputsInline: true,
    output: 'Number',
    style: 'logic_blocks'
  },
  generator: ctx => {
    // Comparison operator.
    const OPERATORS = {
      EQ: '==',
      NEQ: '!=',
      LT: '<',
      LTE: '<=',
      GT: '>',
      GTE: '>='
    };
    const operator = OPERATORS[ctx.getFieldValue('OP')];
    const order =
      operator === '==' || operator === '!='
        ? Blockly.JavaScript.ORDER_EQUALITY
        : Blockly.JavaScript.ORDER_RELATIONAL;
    const argument0 = Blockly.JavaScript.valueToCode(ctx, 'A', order) || '0';
    const argument1 = Blockly.JavaScript.valueToCode(ctx, 'B', order) || '0';
    const code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
  }
};
