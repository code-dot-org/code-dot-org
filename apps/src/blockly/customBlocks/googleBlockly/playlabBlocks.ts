/**
 * Defines block generators useful in Play Lab
 */

import * as GoogleBlockly from 'blockly/core';
import {Order} from 'blockly/javascript';

import {
  ExtendedCodeGenerator,
  JavascriptGeneratorType,
} from '@cdo/apps/blockly/types';

export const blocks = {
  overrideForLoopGenerator() {
    // For loop. This code is copied and modified from Core Blockly:
    // https://github.com/google/blockly/blob/2c29c01b14fd9cec9f7fde82f6c80b6f4f7b7c30/generators/javascript/loops.ts#L85-L178
    // A custom generator for a "for loop" where variable names should be part
    // of the Globals namespace (e.g. Globals.counter).
    Blockly.JavaScript.forBlock.controls_for = function (
      block: GoogleBlockly.Block,
      generator: JavascriptGeneratorType
    ) {
      // Customization: use translateVarName instead of getVariableName
      const variable0 = (
        generator as unknown as ExtendedCodeGenerator
      ).translateVarName(block.getFieldValue('VAR') || '');
      // End customation.

      const argument0 =
        generator.valueToCode(block, 'FROM', Order.ASSIGNMENT) || '0';
      const argument1 =
        generator.valueToCode(block, 'TO', Order.ASSIGNMENT) || '0';
      const increment =
        generator.valueToCode(block, 'BY', Order.ASSIGNMENT) || '1';
      let branch = generator.statementToCode(block, 'DO');
      branch = generator.addLoopTrap(branch, block);
      let code;
      if (
        Blockly.utils.string.isNumber(argument0) &&
        Blockly.utils.string.isNumber(argument1) &&
        Blockly.utils.string.isNumber(increment)
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
        const step = Math.abs(Number(increment));
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
          startVar = generator.nameDB_!.getDistinctName(
            variable0 + '_start',
            Blockly.Names.NameType.VARIABLE
          );
          code += 'var ' + startVar + ' = ' + argument0 + ';\n';
        }
        let endVar = argument1;
        if (
          !argument1.match(/^\w+$/) &&
          !Blockly.utils.string.isNumber(argument1)
        ) {
          endVar = generator.nameDB_!.getDistinctName(
            variable0 + '_end',
            Blockly.Names.NameType.VARIABLE
          );
          code += 'var ' + endVar + ' = ' + argument1 + ';\n';
        }
        // Determine loop direction at start, in case one of the bounds
        // changes during loop execution.
        const incVar = generator.nameDB_!.getDistinctName(
          variable0 + '_inc',
          Blockly.Names.NameType.VARIABLE
        );
        code += 'var ' + incVar + ' = ';
        if (Blockly.utils.string.isNumber(increment)) {
          code += Math.abs(Number(increment)) + ';\n';
        } else {
          code += 'Math.abs(' + increment + ');\n';
        }
        code += 'if (' + startVar + ' > ' + endVar + ') {\n';
        code += generator.INDENT + incVar + ' = -' + incVar + ';\n';
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
    };
  },
  overrideProceduresGenerators() {
    // Function definition. This code is copied and modified Core Blockly:
    // https://github.com/google/blockly/blob/a42c2d15082d3261a643f205bae1c7860ba48416/generators/javascript/procedures.ts#L104-L116
    // A custom generator for function call where function names should be part
    // of the Globals namespace (e.g. Globals.jump()).
    Blockly.JavaScript.forBlock.procedures_callnoreturn = function (
      block: GoogleBlockly.Block,
      generator: JavascriptGeneratorType
    ) {
      // Call a procedure with no return value.
      // Generated code is for a function call as a statement is the same as a
      // function call as a value, with the addition of line ending.
      const tuple = generator.forBlock['procedures_callreturn'](
        block,
        generator
      ) as [string, Order];
      // Customization: Add Globals namespace if needed.
      const code = (Blockly.varsInGlobals ? 'Globals.' : '') + tuple[0];
      // End customization
      return code + ';\n';
    };

    // Function definition. This code is copied and modified from Core Blockly:
    // https://github.com/google/blockly/blob/a42c2d15082d3261a643f205bae1c7860ba48416/generators/javascript/procedures.ts#L18-L83
    // Code Blockly uses the same generator for procedures_defreturn and procedures_defnoreturn.
    // We never used returns, so we are just directly modifying the former generator.
    // A custom generator for function call where function names should be part
    // of the Globals namespace (e.g. Globals.jump = function()).
    Blockly.JavaScript.forBlock.procedures_defnoreturn = function (
      block: GoogleBlockly.Block,
      generator: JavascriptGeneratorType
    ) {
      // Define a procedure with a return value.
      const funcName = generator.getProcedureName(block.getFieldValue('NAME'));
      let xfix1 = '';
      if (generator.STATEMENT_PREFIX) {
        xfix1 += generator.injectId(generator.STATEMENT_PREFIX, block);
      }
      if (generator.STATEMENT_SUFFIX) {
        xfix1 += generator.injectId(generator.STATEMENT_SUFFIX, block);
      }
      if (xfix1) {
        xfix1 = generator.prefixLines(xfix1, generator.INDENT);
      }
      let loopTrap = '';
      if (generator.INFINITE_LOOP_TRAP) {
        loopTrap = generator.prefixLines(
          generator.injectId(generator.INFINITE_LOOP_TRAP, block),
          generator.INDENT
        );
      }
      let branch = '';
      if (block.getInput('STACK')) {
        // The 'procedures_defreturn' block might not have a STACK input.
        branch = generator.statementToCode(block, 'STACK');
      }
      let returnValue = '';
      if (block.getInput('RETURN')) {
        // The 'procedures_defnoreturn' block (which shares this code)
        // does not have a RETURN input.
        returnValue = generator.valueToCode(block, 'RETURN', Order.NONE) || '';
      }
      let xfix2 = '';
      if (branch && returnValue) {
        // After executing the function body, revisit this block for the return.
        xfix2 = xfix1;
      }
      if (returnValue) {
        returnValue = generator.INDENT + 'return ' + returnValue + ';\n';
      }
      const args = [];
      const variables = block.getVars();
      for (let i = 0; i < variables.length; i++) {
        args[i] = generator.getVariableName(variables[i]);
      }
      let code =
        // Customization: Add Globals namespace if needed.
        (Blockly.varsInGlobals
          ? 'Globals.' + funcName + ' = function'
          : 'function ' + funcName) +
        // End customization
        '(' +
        args.join(', ') +
        ') {\n' +
        xfix1 +
        loopTrap +
        branch +
        xfix2 +
        returnValue +
        '}';
      code = generator.scrub_(block, code);
      // Add % so as not to collide with helper functions in definitions list.
      // TODO(#7600): find better approach than casting to any to override
      // CodeGenerator declaring .definitions protected.

      // Code.org Note: The above TODO is copied from the Blockly source code.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (generator as any).definitions_[
        // Customization: Add Globals namespace if needed.
        (Blockly.varsInGlobals ? 'Globals.' : '%') + funcName
        // End customization
      ] = code;
      return null;
    };
  },
};
