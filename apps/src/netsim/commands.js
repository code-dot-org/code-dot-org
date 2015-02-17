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
 * A command is an operation that can be constructed with parameters now,
 * triggered later, and completed even later than that.
 *
 * Similar to a promise or a deferred, commands are useful for non-blocking
 * operations that need to take place with a particular relationship to time
 * or to one another - asynchronous calls that should happen in order, events
 * that should be triggered on a timeline, etc.  Instead of nesting callbacks
 * N-layers-deep, create a queue of commands to run.
 *
 * You'll usually want to define commands for your own unique needs.  A child
 * command should always call the Command constructor from its own constructor,
 * it will almost always need to override onBegin_, and it may want to override
 * tick and onEnd_.  Commands can call success() or fail() on themselves, or
 * wait for others to do so; usage is up to you.
 *
 * @constructor
 */
var Command = commands.Command = function () {
  /**
   * @type {commandState}
   * @private
   */
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
  this.status_ = commandState.WORKING;
  this.onBegin_();
};

Command.prototype.succeed = function () {
  if (!this.isStarted()) {
    throw new Error("Command cannot succeed before it begins.");
  }
  this.status_ = commandState.SUCCESS;
  this.onEnd_();
};

Command.prototype.fail = function () {
  if (!this.isStarted()) {
    throw new Error("Command cannot fail before it begins.");
  }
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
 * A CommandSequence is constructed with a list of commands to be executed
 * in order, either until a command fails or the end of the list is reached.
 * Each command will be executed after the previous command succeeds.
 *
 * The CommandSequence is itself a command which succeeds after all of the
 * commands it contains have succeeded, or fails if any of the commands it
 * contains have failed.  CommandSequences may thus be nested, and it is
 * often useful for a custom command to inherit from CommandSequence or to
 * contain a CommandSequence.
 *
 * @param {Array.<Command>} commandList - List of commands to be executed
 *        in order, provided each command succeeds.
 * @constructor
 */
var CommandSequence = commands.CommandSequence = function (commandList) {
  Command.call(this);

  /**
   * @type {Array.<Command>}
   * @private
   */
  this.commandList_ = commandList;

  /**
   * @type {number}
   * @private
   */
  this.currentCommandIndex_ = 0;
};
CommandSequence.inherits(Command);

/**
 * @private
 */
CommandSequence.prototype.onBegin_ = function () {
  this.currentCommandIndex_ = 0;

  // Empty sequence succeeds immediately
  if (this.commandList_.length === 0) {
    this.succeed();
  }
};

/**
 * @returns {Command}
 */
CommandSequence.prototype.currentCommand = function () {
  return this.commandList_[this.currentCommandIndex_];
};

/**
 * @param {RunLoop.Clock} clock
 */
CommandSequence.prototype.tick = function (clock) {
  while (this.isStarted() && !this.isFinished() && this.currentCommand()) {
    if (!this.currentCommand().isStarted()) {
      this.currentCommand().begin();
    } else {
      this.currentCommand().tick(clock);
    }

    if (this.currentCommand().succeeded()) {
      this.currentCommandIndex_++;
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
