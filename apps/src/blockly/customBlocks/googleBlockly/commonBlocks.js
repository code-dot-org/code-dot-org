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
};
