import * as BlocklyCore from 'blockly/core';

import {labBlocks} from './blocks';
import ElementField, {ELEMENT_FIELD_TYPE} from './elementField';

let isSetUp = false;

/** Registers this lab's field and blocks with the page's Blockly, once. */
export function setUpBlocklyForMiniAppLab() {
  if (isSetUp) {
    return;
  }
  isSetUp = true;

  Blockly.fieldRegistry.register(ELEMENT_FIELD_TYPE, ElementField);
  for (const {definition, generator} of labBlocks) {
    Blockly.Blocks[definition.type] = {
      init: function (this: BlocklyCore.Block) {
        this.jsonInit(definition);
      },
    };
    Blockly.getGenerator().forBlock[definition.type] = generator;
  }
}
