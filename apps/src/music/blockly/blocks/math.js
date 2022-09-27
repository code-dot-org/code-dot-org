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
