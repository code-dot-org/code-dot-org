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
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDUP}', 'ROUNDUP'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUND}', 'ROUND'],
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

export const arithmetic = {
  definition: {
    type: BlockTypes.ARITHMETIC,
    message0: '%1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'A',
        check: 'Number'
      },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [
          ['%{BKY_MATH_ADDITION_SYMBOL}', 'ADD'],
          ['%{BKY_MATH_SUBTRACTION_SYMBOL}', 'MINUS'],
          ['%{BKY_MATH_MULTIPLICATION_SYMBOL}', 'MULTIPLY'],
          ['%{BKY_MATH_DIVISION_SYMBOL}', 'DIVIDE'],
          ['%', 'MODULO']
        ]
      },
      {
        type: 'input_value',
        name: 'B',
        check: 'Number'
      }
    ],
    inputsInline: true,
    output: 'Number',
    style: 'math_blocks',
    helpUrl: '%{BKY_MATH_ARITHMETIC_HELPURL}',
    extensions: ['math_op_tooltip']
  },
  generator: ctx => {
    const OPERATORS = {
      ADD: [' + ', Blockly.JavaScript.ORDER_ADDITION],
      MINUS: [' - ', Blockly.JavaScript.ORDER_SUBTRACTION],
      MULTIPLY: [' * ', Blockly.JavaScript.ORDER_MULTIPLICATION],
      DIVIDE: [' / ', Blockly.JavaScript.ORDER_DIVISION],
      MODULO: [' % ', Blockly.JavaScript.ORDER_MODULUS]
    };
    const tuple = OPERATORS[ctx.getFieldValue('OP')];
    const operator = tuple[0];
    const order = tuple[1];
    const argument0 = Blockly.JavaScript.valueToCode(ctx, 'A', order) || '0';
    const argument1 = Blockly.JavaScript.valueToCode(ctx, 'B', order) || '0';
    const code = argument0 + operator + argument1;
    return [code, order];
  }
};

export const random = {
  definition: {
    type: BlockTypes.RANDOM,
    message0: '%{BKY_MATH_RANDOM_INT_TITLE}',
    args0: [
      {
        type: 'input_value',
        name: 'FROM',
        check: 'Number'
      },
      {
        type: 'input_value',
        name: 'TO',
        check: 'Number'
      }
    ],
    inputsInline: true,
    output: 'Number',
    style: 'math_blocks',
    tooltip: '%{BKY_MATH_RANDOM_INT_TOOLTIP}',
    helpUrl: '%{BKY_MATH_RANDOM_INT_HELPURL}'
  },
  generator: ctx => {
    // Random integer between [X] and [Y].
    const argument0 =
      Blockly.JavaScript.valueToCode(
        ctx,
        'FROM',
        Blockly.JavaScript.ORDER_NONE
      ) || '0';
    const argument1 =
      Blockly.JavaScript.valueToCode(
        ctx,
        'TO',
        Blockly.JavaScript.ORDER_NONE
      ) || '0';
    const functionName = Blockly.JavaScript.provideFunction_(
      'mathRandomInt',
      `
      function ${Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_}(a, b) {
        if (a > b) {
          // Swap a and b to ensure a is smaller.
          var c = a;
          a = b;
          b = c;
        }
        return Math.floor(Math.random() * (b - a + 1) + a);
      }
      `
    );
    const code = functionName + '(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
};
