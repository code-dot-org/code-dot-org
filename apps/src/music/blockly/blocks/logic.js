import {BlockTypes} from '../blockTypes';

export const simpleIf = {
  definition: {
    type: BlockTypes.SIMPLE_IF,
    message0: 'if %1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'lvalue',
        check: 'Number',
        align: 'RIGHT'
      },
      {
        type: 'field_dropdown',
        name: 'operator',
        options: [
          ['odd', 'ODD'],
          ['even', 'EVEN'],
          ['divisible by', 'DIVISIBLE_BY']
        ]
      },
      {
        type: 'input_value',
        name: 'rvalue',
        check: 'Number',
        align: 'RIGHT'
      }
    ],
    message1: '%1',
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
    tooltip: 'if condition is true then do the code',
    helpUrl: ''
  },
  generator: ctx => {
    const operator = ctx.getFieldValue('operator');
    let code;

    let lvalue =
      Blockly.JavaScript.valueToCode(
        ctx,
        'lvalue',
        Blockly.JavaScript.ORDER_ASSIGNMENT
      ) || '0';

    let rvalue =
      Blockly.JavaScript.valueToCode(
        ctx,
        'rvalue',
        Blockly.JavaScript.ORDER_ASSIGNMENT
      ) || '0';

    switch (operator) {
      case 'ODD':
        code = ctx.getFieldValue('lvalue') + '% 2 == 1';
        break;
      case 'EVEN':
        code = ctx.getFieldValue('lvalue') + '% 2 == 0';
        break;
      case 'DIVISIBLE_BY':
        code =
          lvalue +
          //ctx.getFieldValue('lvalue') +
          ' % ' +
          //ctx.getFieldValue('rvalue') +
          rvalue +
          ' == 0';
        break;
    }
    return (
      'if (' +
      code +
      ') {\n' +
      Blockly.JavaScript.statementToCode(ctx, 'code') +
      '\n}\n'
    );
  }
};
