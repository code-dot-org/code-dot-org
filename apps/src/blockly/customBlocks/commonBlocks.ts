// We need to use any in this class to generically reference the block type.
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Defines blocks useful in multiple blockly apps
 */

import * as BlocklyCore from 'blockly/core';

import {readBooleanAttribute} from '@cdo/apps/blockly/utils';
const mutatorProperties: string[] = [];

export const blocks = {
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
  addSerializationHooksToBlock(block: BlocklyCore.Block) {
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
};
