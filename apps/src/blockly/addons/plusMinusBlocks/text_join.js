/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * This file is based on code originally part of @blockly/block-plus-minus
 * Modifications:
 * - Supports a minimum number of possible inputs (2)
 * - Label text changed from "create text with" to "join" (using CDO localizations)
 * - Image fields are moved to the second input row, if it exists.
 */

/**
 * @fileoverview Changes the text_join block to use a +/- mutator UI.
 */

import GoogleBlockly from 'blockly/core';

import {createMinusField} from './field_minus';
import {createPlusField} from './field_plus';

var msg = require('@cdo/locale');

const MINIMUM_INPUTS = 2;
const textJoinMutator = {
  /**
   * Number of text inputs on this block.
   * @type {number}
   */
  itemCount_: 0,

  /**
   * Creates XML to represent number of inputs.
   * @returns {!Element} XML storage element.
   * @this {GoogleBlockly.Block}
   */
  mutationToDom: function () {
    const container = GoogleBlockly.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },

  /**
   * Parses XML to restore the inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {GoogleBlockly.Block}
   */
  domToMutation: function (xmlElement) {
    const targetCount = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_(targetCount);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns {{itemCount: number}} The state of this block, ie the item count.
   */
  saveExtraState: function () {
    return {
      itemCount: this.itemCount_,
    };
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state) {
    this.updateShape_(state['itemCount']);
  },

  /**
   * Adds inputs to the block until the block reaches the target input count.
   * @param {number} targetCount The number of inputs the block should have.
   * @this {GoogleBlockly.Block}
   * @private
   */
  updateShape_: function (targetCount) {
    targetCount = Math.max(targetCount, 1);
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while (this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  /**
   * Callback for the plus image. Adds an input to the block and updates the
   * state of the minus.
   * @this {GoogleBlockly.Block}
   */
  plus: function () {
    this.addPart_();
    this.updateMinus_();
  },

  /**
   * Callback for the minus image. Removes the input at the end of the block and
   * updates the state of the minus.
   * @this {GoogleBlockly.Block}
   */
  minus: function () {
    if (this.itemCount_ <= MINIMUM_INPUTS) {
      return;
    }
    this.removePart_();
    this.updateMinus_();
  },

  /**
   * Adds an input to the end of the block. If the block currently has no
   * inputs it updates the top 'EMPTY' input to receive a block.
   * @this {GoogleBlockly.Block}
   * @private
   */
  addPart_: function () {
    if (this.itemCount_ === 0) {
      if (this.getInput('EMPTY')) {
        this.removeInput('EMPTY');
      }
      this.topInput_ = this.appendValueInput('ADD' + this.itemCount_)
        // Use @cdo/locale to get localized 'join' string
        .appendField(msg.joinText());
    } else {
      this.appendValueInput('ADD' + this.itemCount_);
    }
    if (this.itemCount_ === MINIMUM_INPUTS - 1) {
      this.iconInput_ = this.getIconInput();
      this.iconInput_.insertFieldAt(0, createPlusField(), 'PLUS');
    }
    // Because item inputs are 0-index we decrement first, increment last.
    this.itemCount_++;
  },

  /**
   * Removes an input from the end of the block. If we are removing the last
   * input this updates the block to have an 'EMPTY' top input.
   * @this {GoogleBlockly.Block}
   * @private
   */
  removePart_: function () {
    this.itemCount_--;
    this.removeInput('ADD' + this.itemCount_);
    if (this.itemCount_ === 0) {
      // This is unreachable as long as MINIMUM_INPUT > 0. This functionality is being
      // left in place in case we want to make the minimum settable per-block or per-level
      // at some point in the future.
      this.topInput_ = this.appendDummyInput('EMPTY')
        .appendField(this.newQuote_(true))
        .appendField(this.newQuote_(false));
    }
    if (this.itemCount_ === MINIMUM_INPUTS) {
      this.iconInput_ = this.getInput(this.getIconInput());
      if (!this.getField('PLUS')) {
        this.iconInput_.insertFieldAt(0, createPlusField(), 'PLUS');
      }
    }
  },

  /**
   * Makes it so the minus is visible if there is an input available to remove.
   * @private
   */
  updateMinus_: function () {
    const minusField = this.getField('MINUS');
    this.iconInput_ = this.getIconInput();
    if (!minusField && this.itemCount_ > MINIMUM_INPUTS) {
      this.iconInput_.insertFieldAt(1, createMinusField(), 'MINUS');
    } else if (minusField && this.itemCount_ <= MINIMUM_INPUTS) {
      this.iconInput_.removeField('MINUS');
    }
  },

  getIconInput: function () {
    return (
      this.getInput('EMPTY') || this.getInput('ADD' + (MINIMUM_INPUTS - 1))
    );
  },
};

/**
 * Adds the quotes mixin to the block. Also updates the shape so that if no
 * mutator is provided the minimum number of inputs are added.
 * @this {GoogleBlockly.Block}
 */
const textJoinHelper = function () {
  if (MINIMUM_INPUTS === 0) {
    GoogleBlockly.Extensions.apply('text_quotes', this, false);
  }
  this.updateShape_(MINIMUM_INPUTS);
};
export default function registerMutator() {
  if (GoogleBlockly.Extensions.isRegistered('text_join_mutator')) {
    GoogleBlockly.Extensions.unregister('text_join_mutator');
  }
  GoogleBlockly.Extensions.registerMutator(
    'text_join_mutator',
    textJoinMutator,
    textJoinHelper
  );
}
