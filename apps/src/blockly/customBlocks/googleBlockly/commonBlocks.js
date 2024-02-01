/**
 * Defines blocks useful in multiple blockly apps
 */

import {readBooleanAttribute} from '../../utils';

const mutatorProperties = [];

export const blocks = {
  installJoinBlock(blockly) {
    // text_join is included with core Blockly. We register a custom text_join_mutator
    // which adds the plus/minus block UI.
    blockly.Blocks.text_join_simple = blockly.Blocks.text_join;
    blockly.JavaScript.forBlock.text_join_simple =
      blockly.JavaScript.forBlock.text_join;
  },
  copyBlockGenerator(generator, type1, type2) {
    generator.forBlock[type1] = generator.forBlock[type2];
  },
  defineNewBlockGenerator(generator, type, generatorFunction) {
    generator.forBlock[type] = generatorFunction;
  },
  mutationToDom() {
    var container = Blockly.utils.xml.createElement('mutation');
    mutatorProperties.forEach(prop => {
      if (this[prop]) {
        container.setAttribute(prop, this[prop]);
      }
    });
    return container;
  },
  domToMutation(mutationElement) {
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
  saveExtraState() {
    let state = {};
    mutatorProperties.forEach(prop => {
      if (this[prop]) {
        state[prop] = this[prop];
      }
    });
    return state;
  },
  loadExtraState(state) {
    for (var prop in state) {
      this[prop] = state[prop];
      mutatorProperties.indexOf(prop) === -1 && mutatorProperties.push(prop);
    }
  },
  // Global function to handle serialization hooks
  addSerializationHooksToBlock(block) {
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
  mathRandomIntGenerator(block, generator) {
    // Random integer between [X] and [Y].
    const argument0 =
      generator.valueToCode(block, 'FROM', generator.ORDER_NONE) || '0';
    const argument1 =
      generator.valueToCode(block, 'TO', generator.ORDER_NONE) || '0';
    const functionName = generator.provideFunction_(
      'math_random_int',
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
    return [code, generator.ORDER_FUNCTION_CALL];
  },
};
