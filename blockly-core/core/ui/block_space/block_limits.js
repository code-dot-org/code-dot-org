/* global Blockly, goog */

'use strict';

goog.provide('Blockly.BlockLimits');

goog.require('Blockly.Block');

/**
 * Class for a flyout.
 * @param {!Blockly.BlockSpaceEditor} blockSpaceEditor Parent editor.
 * @param {boolean} opt_static Is the flyout a static (always open) toolbox?
 * @constructor
 */
Blockly.BlockLimits = function () {
  this.limits_ = {};
};

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
 */
Blockly.BlockLimits.prototype.updateBlockTotals = function (blockTypes) {
  var counts = Blockly.count(blockTypes);

  goog.object.forEach(this.limits_, function (limit, type) {
    var count = counts[type] || 0;
    if (count > limit.limit) {
      goog.asserts.fail('this toolbox block cannot create more than %s workspace blocks', limit.limit);
    }
    limit.total = count;
    limit.block.displayCount(limit.limit - limit.total);
  });
};

/**
 * Returns true iff any of the blocks in this flyout are limited in quantity
 * @return {boolean}
 */
Blockly.BlockLimits.prototype.hasBlockLimits = function () {
  return Object.keys(this.limits_).length > 0;
};

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

