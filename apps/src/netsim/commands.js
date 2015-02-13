/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

require('../utils');

var commands = module.exports;

/**
 * @enum {int}
 */
var commandState = {
  NOT_STARTED: 0,
  WORKING: 1,
  SUCCESS: 2,
  FAILURE: 3
};

/**
 *
 * @constructor
 */
var Command = commands.Command = function () {
  this.status_ = commandState.NOT_STARTED;
};

Command.prototype.isStarted = function () {
  return this.status_ !== commandState.NOT_STARTED;
};

Command.prototype.isFinished = function () {
  return this.succeeded() || this.failed();
};

Command.prototype.succeeded = function () {
  return this.status_ === commandState.SUCCESS;
};

Command.prototype.failed = function () {
  return this.status_ === commandState.FAILURE;
};

Command.prototype.begin = function () {
  this.onBegin_();
  this.status_ = commandState.WORKING;
};

Command.prototype.succeed = function () {
  this.status_ = commandState.SUCCESS;
  this.onEnd_();
};

Command.prototype.fail = function () {
  this.status_ = commandState.FAILURE;
  this.onEnd_();
};

Command.prototype.onBegin_ = function () {

};


Command.prototype.tick = function () {

};

Command.prototype.onEnd_ = function () {

};

/**
 *
 * @constructor
 */
var CommandSequence = commands.CommandSequence = function (commandList) {
  Command.call(this);
  this.commandList_ = commandList;
};
CommandSequence.inherits(Command);

CommandSequence.prototype.onBegin_ = function () {
  this.currentIndex_ = 0;

  // Empty sequence succeeds immediately
  if (this.commandList_.length === 0) {
    this.succeed();
  }
};

CommandSequence.prototype.currentCommand = function () {
  return this.commandList_[this.currentIndex_];
};

CommandSequence.prototype.tick = function (clock) {
  while (this.isStarted() && !this.isFinished() && this.currentCommand()) {
    if (!this.currentCommand().isStarted()) {
      this.currentCommand().begin();
    } else {
      this.currentCommand().tick(clock);
    }

    if (this.currentCommand().succeeded()) {
      this.currentIndex_++;
      if (this.currentCommand() === undefined) {
        this.succeed();
      }
    } else if (this.currentCommand().failed()) {
      this.fail();
    } else {
      // Let the current command work
      break;
    }
  }
};
