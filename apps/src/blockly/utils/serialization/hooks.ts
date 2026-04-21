// We need to use any in this file to generically reference the block type.
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Defines and applies generic serialization hooks for blocks. This is of
 * particular importance for supporting "invisible" blocks, ie. blocks that
 * are moved to the hidden procedure definition workspace on load.
 *
 * These hooks serialize and deserialize block properties to and from both
 * XML mutations and JSON extra state. This allows blocks to save custom
 * properties in a way that is compatible with both Blockly's XML and JSON
 * serialization formats.
 */

import * as BlocklyCore from 'blockly/core';

import {readBooleanAttribute} from '../xml/booleanAttributes';

const mutatorProperties: string[] = [];

// For the next 4 functions, this is actually a Block.
// However we are accessing its properties generically so we type it as a Record.
function mutationToDom(block: Record<string, any>) {
  const container = Blockly.utils.xml.createElement('mutation');
  mutatorProperties.forEach(prop => {
    if (block[prop]) {
      container.setAttribute(prop, block[prop]);
    }
  });
  return container;
}
function domToMutation(block: Record<string, any>, mutationElement: Element) {
  Array.from(mutationElement.attributes).forEach(attr => {
    const attrName = attr.name;
    const attrValue = attr.value;

    const parsedInt = parseInt(attrValue);
    if (!isNaN(parsedInt)) {
      block[attrName] = parsedInt;
    } else if (
      attrValue.toLowerCase() === 'false' ||
      attrValue.toLowerCase() === 'true'
    ) {
      block[attrName] = readBooleanAttribute(mutationElement, attrName);
    } else {
      block[attrName] = attrValue;
    }
    mutatorProperties.indexOf(attrName) === -1 &&
      mutatorProperties.push(attrName);
  });
}
function saveExtraState(block: Record<string, any>) {
  const state: Record<string, any> = {};
  mutatorProperties.forEach(prop => {
    if (block[prop]) {
      state[prop] = block[prop];
    }
  });
  return state;
}
function loadExtraState(
  block: Record<string, any>,
  state: Record<string, any>
) {
  for (const prop in state) {
    block[prop] = state[prop];
    mutatorProperties.indexOf(prop) === -1 && mutatorProperties.push(prop);
  }
}
// Global function to handle serialization hooks
export function addSerializationHooksToBlock(block: BlocklyCore.Block) {
  if (!block.mutationToDom) {
    block.mutationToDom = function () {
      return mutationToDom(this);
    };
  }
  if (!block.domToMutation) {
    block.domToMutation = function (mutationElement: Element) {
      return domToMutation(this, mutationElement);
    };
  }
  if (!block.saveExtraState) {
    block.saveExtraState = function () {
      return saveExtraState(this);
    };
  }
  if (!block.loadExtraState) {
    block.loadExtraState = function (state: Record<string, any>) {
      return loadExtraState(this, state);
    };
  }
}
