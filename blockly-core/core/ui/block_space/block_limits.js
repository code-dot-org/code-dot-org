/**
 * @fileoverview Block Limits helper class for managing limited
 * quantities of blocks within a flyout
 */
'use strict';

/* global Blockly, goog */

goog.provide('Blockly.BlockLimits');

goog.require('Blockly.Block');

/**
 * Class for managing block limits within a flyout
 * @constructor
 */
Blockly.BlockLimits = function () {
  this.limits_ = {};
};

/**
 * If the given block has a limit, saves it for future reference
 * @param {Blockly.Block}
 */
Blockly.BlockLimits.prototype.addBlock = function (block) {
  if (block.hasLimit()) {
    this.limits_[block.type] = {
      total: 0,
      limit: block.getLimit(),
      block: block
    };
  }
};

/**
 * Update the block counts for limited-quantity workspace blocks
 * @param {string[]} blockTypes
 */
Blockly.BlockLimits.prototype.updateBlockTotals = function (blockTypes) {
  var counts = Blockly.count(blockTypes);

  goog.object.forEach(this.limits_, function (limit, type) {
    var count = counts[type] || 0;
    if (count > limit.limit) {
      goog.asserts.fail('this toolbox block cannot create more than %s workspace blocks', limit.limit);
    }
    if (count !== limit.total) {
      limit.total = count;
      limit.block.displayCount(limit.limit - limit.total);
    }
  });
};

/**
 * Returns true iff any of the blocks in this flyout are limited in quantity
 * @return {boolean}
 */
Blockly.BlockLimits.prototype.hasBlockLimits = function () {
  return Object.keys(this.limits_).length > 0;
};

/**
 * Returns true iff all given blocks can be added to this space without
 * exceeding any block limits
 * @param {string[]} blockTypes
 * @return {boolean}
 */
Blockly.BlockLimits.prototype.canAddBlocks = function (blockTypes) {
  var counts = Blockly.count(blockTypes);

  var allWithinLimits = goog.object.every(counts, function (count, type) {
    return this.blockTypeWithinLimits(type, count);
  }, this);

  return allWithinLimits;
};

/**
 * Returns true if the specified count of the specified block type can
 * be added to this space without exceeding any block limits
 * @param {string} type
 * @param {number} count
 * @return {boolean}
 */
Blockly.BlockLimits.prototype.blockTypeWithinLimits = function (type, count) {
  if (count === undefined) {
    count = 1;
  }
  var limit = this.limits_[type];
  if (limit) {
    var remaining = limit.limit - limit.total;
    return remaining >= count;
  }
  return true;
};

