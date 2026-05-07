/**
 * @fileoverview gamelab_getPrediction — value-returning Sprite Lab block
 * with a +/- mutator for adding feature/value input pairs. Generated code
 * is `getPrediction({"name1": value1, "name2": value2})`, which routes to
 * the synchronous CoreLibrary command (see
 * apps/src/p5lab/spritelab/commands/predictCommands.js) and resolves
 * against the project's imported AI Lab model.
 */

import * as BlocklyCore from 'blockly/core';
import {javascriptGenerator, Order} from 'blockly/javascript';

import {createMinusField} from './field_minus';
import {createPlusField} from './field_plus';

const BLOCK_TYPE = 'gamelab_getPrediction';
const MIN_FEATURES = 1;
const MAX_FEATURES = 12;

const predictMixin = {
  itemCount_: 0,

  saveExtraState() {
    return {itemCount: this.itemCount_};
  },

  loadExtraState(state) {
    this.updateShape_(state?.itemCount ?? MIN_FEATURES);
  },

  // Legacy XML serialization for projects saved before saveExtraState.
  mutationToDom() {
    const container = BlocklyCore.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },

  domToMutation(xmlElement) {
    const target =
      parseInt(xmlElement.getAttribute('items'), 10) || MIN_FEATURES;
    this.updateShape_(target);
  },

  plus() {
    if (this.itemCount_ >= MAX_FEATURES) {
      return;
    }
    this.addPart_();
    this.updateMinus_();
  },

  minus() {
    if (this.itemCount_ <= MIN_FEATURES) {
      return;
    }
    this.removePart_();
    this.updateMinus_();
  },

  updateShape_(targetCount) {
    targetCount = Math.max(targetCount, MIN_FEATURES);
    targetCount = Math.min(targetCount, MAX_FEATURES);
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while (this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  addPart_() {
    const i = this.itemCount_;
    this.appendValueInput('VAL' + i)
      .appendField('feature')
      .appendField(new BlocklyCore.FieldTextInput(''), 'NAME' + i)
      .appendField('=');
    this.itemCount_++;
  },

  removePart_() {
    this.itemCount_--;
    this.removeInput('VAL' + this.itemCount_);
  },

  updateMinus_() {
    const top = this.getInput('TOP');
    if (!top) {
      return;
    }
    const hasMinus = !!this.getField('MINUS');
    if (!hasMinus && this.itemCount_ > MIN_FEATURES) {
      // Insert minus right after PLUS.
      top.insertFieldAt(2, createMinusField(), 'MINUS');
    } else if (hasMinus && this.itemCount_ <= MIN_FEATURES) {
      top.removeField('MINUS');
    }
  },
};

function defineBlock() {
  BlocklyCore.Blocks[BLOCK_TYPE] = {
    ...predictMixin,
    init() {
      this.setStyle('default');
      this.setOutput(true);
      this.setInputsInline(false);
      this.appendDummyInput('TOP')
        .appendField('predict with')
        .appendField(createPlusField(), 'PLUS');
      this.itemCount_ = 0;
      this.updateShape_(MIN_FEATURES);
    },
  };
}

function defineGenerator() {
  const generatorFn = function (block, gen) {
    const g = gen || javascriptGenerator;
    const pairs = [];
    for (let i = 0; i < block.itemCount_; i++) {
      const name = block.getFieldValue('NAME' + i) || '';
      const value = g.valueToCode(block, 'VAL' + i, Order.NONE) || 'undefined';
      pairs.push(`${JSON.stringify(name)}: ${value}`);
    }
    return [`getPrediction({${pairs.join(', ')}})`, Order.FUNCTION_CALL];
  };
  // Modern Blockly looks up generators in `forBlock`; older code paths still
  // use the direct property form. Set both for safety.
  if (javascriptGenerator.forBlock) {
    javascriptGenerator.forBlock[BLOCK_TYPE] = generatorFn;
  }
  javascriptGenerator[BLOCK_TYPE] = generatorFn;
}

export default function registerPredictBlock() {
  defineBlock();
  defineGenerator();
}
