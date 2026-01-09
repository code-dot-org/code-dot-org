import {Order} from 'blockly/javascript';

import * as Blockly from 'blockly/core';
import {defineBlock} from '@code-dot-org/blockly-workspace';

import {BlockTypes} from '../blockTypes';

const forLoop = defineBlock({
  type: BlockTypes.FOR_LOOP,
  message0: '%{BKY_CONTROLS_FOR_TITLE}',
  args0: [
    {
      type: 'field_variable',
      name: 'VAR',
      variable: 'i',
    },
    {
      type: 'input_value',
      name: 'FROM',
      check: 'Number',
      align: 'RIGHT',
    },
    {
      type: 'input_value',
      name: 'TO',
      check: 'Number',
      align: 'RIGHT',
    },
    {
      type: 'input_value',
      name: 'BY',
      check: 'Number',
      align: 'RIGHT',
    },
  ],
  message1: '%{BKY_CONTROLS_REPEAT_INPUT_DO} %1',
  args1: [
    {
      type: 'input_statement',
      name: 'DO',
    },
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'loop_blocks',
  helpUrl: '%{BKY_CONTROLS_FOR_HELPURL}',
  tooltip: '',
  extensions: ['contextMenu_newGetVariableBlock', 'controls_for_tooltip'],
  generator: {
    javascript(block, javascriptGenerator) {
      // For loop.
      const variable0 = javascriptGenerator.nameDB_?.getName(
        block.getFieldValue('VAR'),
        Blockly.Names.NameType.VARIABLE,
      );
      const argument0 =
        javascriptGenerator.valueToCode(block, 'FROM', Order.ASSIGNMENT) || '0';
      const argument1 =
        javascriptGenerator.valueToCode(block, 'TO', Order.ASSIGNMENT) || '0';

      // + is used to convert this value to a number.
      // Useful if the field is blank, because '0' will
      // be returned, and in that case we need the fallback
      // to '1' to occur.
      const increment = +(
        javascriptGenerator.valueToCode(block, 'BY', Order.ASSIGNMENT) || '1'
      );

      let branch = javascriptGenerator.statementToCode(block, 'DO');
      branch = javascriptGenerator.addLoopTrap(branch, block);
      let code;
      if (
        Blockly.utils.string.isNumber(argument0) &&
        Blockly.utils.string.isNumber(argument1)
      ) {
        // All arguments are simple numbers.
        const up = Number(argument0) <= Number(argument1);
        code =
          'for (' +
          variable0 +
          ' = ' +
          argument0 +
          '; ' +
          variable0 +
          (up ? ' <= ' : ' >= ') +
          argument1 +
          '; ' +
          variable0;
        const step = Math.abs(increment);
        if (step === 1) {
          code += up ? '++' : '--';
        } else {
          code += (up ? ' += ' : ' -= ') + step;
        }
        code += ') {\n' + branch + '}\n';
      } else {
        code = '';
        // Cache non-trivial values to variables to prevent repeated look-ups.
        let startVar = argument0;
        if (
          !argument0.match(/^\w+$/) &&
          !Blockly.utils.string.isNumber(argument0)
        ) {
          startVar =
            javascriptGenerator.nameDB_?.getDistinctName(
              variable0 + '_start',
              Blockly.Names.NameType.VARIABLE,
            ) || 'unknown';
          code += 'var ' + startVar + ' = ' + argument0 + ';\n';
        }
        let endVar = argument1;
        if (
          !argument1.match(/^\w+$/) &&
          !Blockly.utils.string.isNumber(argument1)
        ) {
          endVar =
            javascriptGenerator.nameDB_?.getDistinctName(
              variable0 + '_end',
              Blockly.Names.NameType.VARIABLE,
            ) || 'unknown';
          code += 'var ' + endVar + ' = ' + argument1 + ';\n';
        }
        // Determine loop direction at start, in case one of the bounds
        // changes during loop execution.
        const incVar =
          javascriptGenerator.nameDB_?.getDistinctName(
            variable0 + '_inc',
            Blockly.Names.NameType.VARIABLE,
          ) || 'unknown';
        code += 'var ' + incVar + ' = ';
        code += Math.abs(increment) + ';\n';
        code += 'if (' + startVar + ' > ' + endVar + ') {\n';
        code += javascriptGenerator.INDENT + incVar + ' = -' + incVar + ';\n';
        code += '}\n';
        code +=
          'for (' +
          variable0 +
          ' = ' +
          startVar +
          '; ' +
          incVar +
          ' >= 0 ? ' +
          variable0 +
          ' <= ' +
          endVar +
          ' : ' +
          variable0 +
          ' >= ' +
          endVar +
          '; ' +
          variable0 +
          ' += ' +
          incVar +
          ') {\n' +
          branch +
          '}\n';
      }
      return code;
    },
  },
});

const blocks = [forLoop];

export default blocks;
