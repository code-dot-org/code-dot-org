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
    blockly.JavaScript.text_join_simple = blockly.JavaScript.text_join;
  },
  mutationToDom() {
    var container = Blockly.utils.xml.createElement('mutation');
    mutatorProperties.forEach(prop => {
      container.setAttribute(prop, this[prop]);
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
      state[prop] = this[prop];
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
