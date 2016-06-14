/**
 * @fileoverview Block Limits helper class for managing limited
 * quantities of blocks within a flyout
 */
'use strict';

/* global Blockly, goog */

goog.provide('Blockly.BlockLimits');

goog.require('Blockly.Block');

/**
 * @typedef {Object} BlockLimit
 * @property {number} count
 * @property {number} limit
 */

/**
 * Class for managing block limits
 * @constructor
 */
Blockly.BlockLimits = function () {
  /**
   * Store of block types to block limit tracking objects.
   * {Object.<string, BlockLimit>}
   * @private
   */
  this.limits_ = {};

  /**
   * Fires event 'change' on remaining block count change.
   * @type {goog.events.EventTarget}
   */
  this.events = new goog.events.EventTarget();
};

Blockly.BlockLimits.prototype.setLimit = function (type, limit) {
  this.limits_[type] = {
    count: undefined,
    limit: limit
  };
  this.updateCount(type, 0);
};

/**
 * Update the block counts for limited-quantity workspace blocks
 * @param {string[]} blockTypes
 */
Blockly.BlockLimits.prototype.updateBlockTotals = function (blockTypes) {
  var countsByType = Blockly.aggregateCounts(blockTypes);

  goog.object.forEach(this.limits_, function (limit, type) {
    var blockCount = countsByType[type] || 0;
    if (blockCount > limit.limit) {
      goog.asserts.fail('this toolbox block cannot create more than %s workspace blocks', limit.limit);
    }
    this.updateCount(type, blockCount);
  }.bind(this));
};

Blockly.BlockLimits.prototype.updateCount = function (type, newCount) {
  var limit = this.limits_[type];
  var countChanged = newCount !== limit.count;
  limit.count = newCount;
  if (countChanged) {
    this.events.fireListeners('change', false, {
      type: type,
      remaining: limit.limit - limit.count
    });
  }
};

Blockly.BlockLimits.prototype.getLimit = function (type) {
  return this.limits_.hasOwnProperty(type) ? this.limits_[type].limit : undefined;
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
  var countsByType = Blockly.aggregateCounts(blockTypes);

  var allWithinLimits = goog.object.every(countsByType, function (count, type) {
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
    var remaining = limit.limit - limit.count;
    return remaining >= count;
  }
  return true;
};

