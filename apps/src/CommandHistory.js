/** @file Provide browsable command history to a textbox with limited depth. */
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
  this.alterHistory_(this.currentIndex_, currentInput);

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
  this.alterHistory_(this.currentIndex_, currentInput);

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

/**
 * Overwrites the currently viewed command entry in the history with a new
 * value.  Will do nothing if attempting overwrite an empty entry.
 * @param {!number} index - position in command history to rewrite
 * @param {!string} newValue
 * @private
 */
CommandHistory.prototype.alterHistory_ = function (index, newValue) {
  if (this.commands_[index] !== undefined) {
    this.commands_[index] = newValue;
  }
};
