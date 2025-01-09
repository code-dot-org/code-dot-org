// We need to use any in this class to generically reference the block type.
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Defines blocks useful in multiple blockly apps
 */

import * as GoogleBlockly from 'blockly/core';
import {Order} from 'blockly/javascript';

import {
  BlocklyWrapperType,
  ExtendedJavascriptGenerator,
  JavascriptGeneratorType,
} from '@cdo/apps/blockly/types';
import i18n from '@cdo/locale';

import {BLOCK_TYPES} from '../../constants';
import {readBooleanAttribute} from '../../utils';

const mutatorProperties: string[] = [];

export const blocks = {
  installJoinBlock(blockly: BlocklyWrapperType) {
    // text_join is included with core Blockly. We register a custom text_join_mutator
    // which adds the plus/minus block UI.
    blockly.Blocks.text_join_simple = blockly.Blocks.text_join;
    blockly.JavaScript.forBlock.text_join_simple =
      blockly.JavaScript.forBlock.text_join;
  },
  // We need to use a custom block so that English users will see "random color".
  installCustomColourRandomBlock(blockly: BlocklyWrapperType) {
    delete blockly.Blocks['colour_random'];
    blockly.common.defineBlocks(
      blockly.common.createBlockDefinitionsFromJsonArray([
        {
          type: BLOCK_TYPES.colourRandom,
          message0: i18n.colourRandom(),
          output: 'Colour',
          style: 'colour_blocks',
        },
      ])
    );
  },
  copyBlockGenerator(
    generator: ExtendedJavascriptGenerator,
    type1: string,
    type2: string
  ) {
    generator.forBlock[type1] = generator.forBlock[type2];
  },
  defineNewBlockGenerator(
    generator: ExtendedJavascriptGenerator,
    type: string,
    generatorFunction: (
      block: GoogleBlockly.Block,
      generator: GoogleBlockly.CodeGenerator
    ) => [string, number] | string | null
  ) {
    generator.forBlock[type] = generatorFunction;
  },
  // For the next 4 functions, this is actually a Block.
  // However we are accessing its properties generically so we type it as a Record.
  mutationToDom(this: Record<string, any>) {
    const container = Blockly.utils.xml.createElement('mutation');
    mutatorProperties.forEach(prop => {
      if (this[prop]) {
        container.setAttribute(prop, this[prop]);
      }
    });
    return container;
  },
  domToMutation(this: Record<string, any>, mutationElement: Element) {
    Array.from(mutationElement.attributes).forEach(attr => {
      const attrName = attr.name;
      const attrValue = attr.value;

      const parsedInt = parseInt(attrValue);
      if (!isNaN(parsedInt)) {
        this[attrName] = parsedInt;
      } else if (
        attrValue.toLowerCase() === 'false' ||
        attrValue.toLowerCase() === 'true'
      ) {
        this[attrName] = readBooleanAttribute(mutationElement, attrName);
      } else {
        this[attrName] = attrValue;
      }
      mutatorProperties.indexOf(attrName) === -1 &&
        mutatorProperties.push(attrName);
    });
  },
  saveExtraState(this: Record<string, any>) {
    const state: Record<string, any> = {};
    mutatorProperties.forEach(prop => {
      if (this[prop]) {
        state[prop] = this[prop];
      }
    });
    return state;
  },
  loadExtraState(this: Record<string, any>, state: Record<string, any>) {
    for (const prop in state) {
      this[prop] = state[prop];
      mutatorProperties.indexOf(prop) === -1 && mutatorProperties.push(prop);
    }
  },
  // Global function to handle serialization hooks
  addSerializationHooksToBlock(block: GoogleBlockly.Block) {
    if (!block.mutationToDom) {
      block.mutationToDom = this.mutationToDom;
    }
    if (!block.domToMutation) {
      block.domToMutation = this.domToMutation;
    }
    if (!block.saveExtraState) {
      block.saveExtraState = this.saveExtraState;
    }
    if (!block.loadExtraState) {
      block.loadExtraState = this.loadExtraState;
    }
  },
  // Copied and modified from core Blockly:
  // https://github.com/google/blockly/blob/1ba0e55e8a61f4228dfcc4d0eb18b7e38666dc6c/generators/javascript/math.ts#L406-L429
  // We need to override this generator in order to continue using the
  // legacy function name from CDO Blockly. Other custom blocks in pools
  // depend on the original name..
  mathRandomIntGenerator(
    block: GoogleBlockly.Block,
    generator: ExtendedJavascriptGenerator
  ) {
    // Random integer between [X] and [Y].
    const argument0 = generator.valueToCode(block, 'FROM', Order.NONE) || '0';
    const argument1 = generator.valueToCode(block, 'TO', Order.NONE) || '0';
    const functionName = generator.provideFunction_(
      'math_random_int', // Core Blockly uses 'mathRandomInt'
      `
  function ${generator.FUNCTION_NAME_PLACEHOLDER_}(a, b) {
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
    const code = `${functionName}(${argument0}, ${argument1})`;
    return [code, Order.FUNCTION_CALL];
  },
  // Creates and returns a 3-column colour field with an increased height/width
  // for menu options and the field itself. Used for the K1 Artist colour picker block.
  getColourDropdownField(colours: string[]) {
    const configOptions = {
      colourOptions: colours,
      columns: 3,
    };
    const defaultColour = colours[0];
    const optionalValidator = undefined;
    const isK1 = true;
    return new Blockly.FieldColour(
      defaultColour,
      optionalValidator,
      configOptions,
      isK1
    );
  },

  overrideForLoopGenerator() {
    // A custom generator for a "for loop" in labs where variable names should be part of the
    // of the Globals namespace (e.g. Globals.counter). Used for Play Lab aka Studio
    Blockly.JavaScript.forBlock.controls_for = function (
      block: GoogleBlockly.Block,
      generator: JavascriptGeneratorType
    ) {
      // For loop. This code is copied and modified from Core Blockly:
      // https://github.com/google/blockly/blob/2c29c01b14fd9cec9f7fde82f6c80b6f4f7b7c30/generators/javascript/loops.ts#L85-L178

      // Customization: use translateVarName instead of getVariableName
      const variable0 = generator.translateVarName(block.getFieldValue('VAR'));
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
};
