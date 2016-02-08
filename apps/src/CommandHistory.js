/** @file Provide browsable command history to a textbox with limited depth. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

var CommandHistory = module.exports = function () {
  /**
   * Ordered collection of command entries.
   * @private {string[]}
   */
  this.commands_ = [];

  /**
   * Current index into commands_, where 0 is the oldest command stored
   * @private {number}
   */
  this.currentIndex_ = 0;

  /**
   * The maximum number of entries to store in the command history, to
   * prevent ever-increasing memory for this feature.
   * @private {number}
   */
  this.maxEntries_ = 64;
};

/**
 * Add the given command to the current command history.  If the command
 * history has already reached its maximum depth, the oldest command will
 * drop off so that the newest command can be added.
 * @param {string} command
 */
CommandHistory.prototype.push = function (command) {
  if (this.commands_.length >= this.maxEntries_) {
    this.commands_.shift();
    this.currentIndex_ -= 1;
  }
  this.commands_.push(command);
  this.currentIndex_ = this.commands_.length;
};

/**
 * Move back in time by one entry, returning the command at the new
 * command index.
 * @param {string} currentInput
 * @returns {string}
 */
CommandHistory.prototype.goBack = function (currentInput) {
  if (typeof this.commands_[this.currentIndex_]!== 'undefined') {
    this.commands_[this.currentIndex_] = currentInput;
  }

  if (this.currentIndex_ > 0) {
    this.currentIndex_ -= 1;
  }
  if (typeof this.commands_[this.currentIndex_] !== 'undefined') {
    return this.commands_[this.currentIndex_];
  }
  return currentInput;
};

/**
 * Move forward in time by one entry, returning the command at the new
 * command index.
 * @param {string} currentInput
 * @returns {string}
 */
CommandHistory.prototype.goForward = function (currentInput) {
  if (typeof this.commands_[this.currentIndex_]!== 'undefined') {
    this.commands_[this.currentIndex_] = currentInput;
  }

  if (this.currentIndex_ < this.commands_.length) {
    this.currentIndex_ += 1;
  }
  if (this.currentIndex_ === this.commands_.length &&
      currentInput === this.commands_[this.currentIndex_ - 1]) {
    return '';
  }
  if (typeof this.commands_[this.currentIndex_] !== 'undefined') {
    return this.commands_[this.currentIndex_];
  }
  return currentInput;
};
