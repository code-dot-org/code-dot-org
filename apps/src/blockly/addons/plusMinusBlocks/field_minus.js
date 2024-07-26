/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * This file is sourced from @blockly/block-plus-minus
 */

/**
 * @fileoverview A function that creates a minus button used for mutation.
 */

import * as GoogleBlockly from 'blockly/core';

import {getExtraBlockState} from './serialization_helper';

/**
 * Creates a minus image field used for mutation.
 * @param {Object=} args Untyped args passed to block.minus when the field
 *     is clicked.
 * @returns {GoogleBlockly.FieldImage} The minus field.
 */
export function createMinusField(args = undefined) {
  const minus = new GoogleBlockly.FieldImage(
    minusImage,
    15,
    15,
    undefined,
    onClick_
  );
  /**
   * Untyped args passed to block.minus when the field is clicked.
   * @type {?(Object|undefined)}
   * @private
   */
  minus.args_ = args;
  return minus;
}

/**
 * Calls block.minus(args) when the minus field is clicked.
 * @param {GoogleBlockly.FieldImage} minusField The field being clicked.
 * @private
 */
function onClick_(minusField) {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  const block = minusField.getSourceBlock();

  if (block.isInFlyout) {
    return;
  }

  GoogleBlockly.Events.setGroup(true);
  const oldExtraState = getExtraBlockState(block);
  block.minus(minusField.args_);
  const newExtraState = getExtraBlockState(block);

  if (oldExtraState !== newExtraState) {
    GoogleBlockly.Events.fire(
      new GoogleBlockly.Events.BlockChange(
        block,
        'mutation',
        null,
        oldExtraState,
        newExtraState
      )
    );
  }
  GoogleBlockly.Events.setGroup(false);
}

const minusImage =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
  'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
  'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
  'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';
