import {BlockTypes} from '../blockTypes';

export const number = {
  definition: {
    type: BlockTypes.NUMBER,
    message0: '%1',
    args0: [
      {
        type: 'field_number',
        name: 'num',
        value: 1,
        min: 1
      }
    ],
    output: 'Number'
  },
  generator: ctx => {
    // Numeric value.
    const code = Number(ctx.getFieldValue('num'));
    const order =
      code >= 0
        ? Blockly.JavaScript.ORDER_ATOMIC
        : Blockly.JavaScript.ORDER_UNARY_NEGATION;
    return [code, order];
  }
};

export const round = {
  definition: {
    type: BlockTypes.ROUND,
    message0: '%1 %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [
          ['%{BKY_MATH_ROUND_OPERATOR_ROUND}', 'ROUND'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDUP}', 'ROUNDUP'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDDOWN}', 'ROUNDDOWN']
        ]
      },
      {
        type: 'input_value',
        name: 'NUM',
        check: 'Number'
      }
    ],
    output: 'Number',
    style: 'math_blocks',
    helpUrl: '%{BKY_MATH_ROUND_HELPURL}',
    tooltip: '%{BKY_MATH_ROUND_TOOLTIP}'
  },
  generator: ctx => {
    const operator = ctx.getFieldValue('OP');
    let code;
    const arg =
      Blockly.JavaScript.valueToCode(
        ctx,
        'NUM',
        Blockly.JavaScript.ORDER_NONE
      ) || '0';

    switch (operator) {
      case 'ROUND':
        code = 'Math.round(' + arg + ')';
        break;
      case 'ROUNDUP':
        code = 'Math.ceil(' + arg + ')';
        break;
      case 'ROUNDDOWN':
        code = 'Math.floor(' + arg + ')';
        break;
    }

    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
};
