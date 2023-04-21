import {DEFAULT_BLOCK_TYPE_CHECKS} from '../../constants';

// Derived from core Blockly:
// https://github.com/google/blockly/blob/ec6e951e687953dedfb0072f0941b44ad6278994/blocks/variables.js#L37-L77
// Customized connection types to prevent connection with Sprite Lab special block types.
export default [
  // Block for variable getter.
  {
    type: 'variables_get',
    message0: '%1',
    args0: [
      {
        type: 'field_variable',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}'
      }
    ],
    // Prevents connection with Sprites, Behaviors, Locations
    output: DEFAULT_BLOCK_TYPE_CHECKS,
    style: 'variable_blocks',
    helpUrl: '%{BKY_VARIABLES_GET_HELPURL}',
    tooltip: '%{BKY_VARIABLES_GET_TOOLTIP}',
    extensions: ['contextMenu_variableSetterGetter']
  },
  // Block for variable setter.
  {
    type: 'variables_set',
    message0: '%{BKY_VARIABLES_SET}',
    args0: [
      {
        type: 'field_variable',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}'
      },
      {
        type: 'input_value',
        name: 'VALUE',
        // Prevents connection with Sprites, Behaviors, Locations
        check: DEFAULT_BLOCK_TYPE_CHECKS
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'variable_blocks',
    tooltip: '%{BKY_VARIABLES_SET_TOOLTIP}',
    helpUrl: '%{BKY_VARIABLES_SET_HELPURL}',
    extensions: ['contextMenu_variableSetterGetter']
  }
];
