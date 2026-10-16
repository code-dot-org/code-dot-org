const PlaceBlockCommand = require("../CommandQueue/PlaceBlockCommand.js");
const PlaceInFrontCommand = require("../CommandQueue/PlaceInFrontCommand.js");
const PlaceDirectionCommand = require("../CommandQueue/PlaceDirectionCommand.js");
const MoveForwardCommand = require("../CommandQueue/MoveForwardCommand.js");
const MoveBackwardCommand = require("../CommandQueue/MoveBackwardCommand.js");
const MoveDirectionCommand = require("../CommandQueue/MoveDirectionCommand.js");
const IfBlockAheadCommand = require("../CommandQueue/IfBlockAheadCommand.js");
const CallbackCommand = require("../CommandQueue/CallbackCommand.js");
const RepeatCommand = require("../CommandQueue/RepeatCommand.js");

module.exports.get = function (controller) {
  return {
    /**
     * Called before a list of user commands will be issued.
     */
    startCommandCollection: function () {
      if (controller.DEBUG) {
        console.log("Collecting commands.");
      }
    },

    /**
     * Called when an attempt should be started, and the entire set of
     * command-queue API calls have been issued.
     *
     * @param {Function} onAttemptComplete - callback with two parameters,
     * "success", i.e., true if attempt was successful (level completed),
     * false if unsuccessful (level not completed), and the current level model.
     * @return {Promise.<boolean>} a promise for a success value when
     *   attempt is complete.
     */
    startAttempt: function (onAttemptComplete) {
      return new Promise(resolve => {
        controller.OnCompleteCallback = (...args) => {
          // Note: onAttemptComplete is unused in this repo, but it's
          // part of a public API - it'll be a breaking change to remove it.
          onAttemptComplete && onAttemptComplete(...args);
          resolve(args[0]);
        };
        controller.setPlayerActionDelayByQueueLength();
        controller.queue.begin();
        controller.run();
        controller.attemptRunning = true;
        controller.resultReported = false;
      });
    },

    resetAttempt: function () {
      controller.reset();
      controller.queue.reset();
      controller.OnCompleteCallback = null;
      controller.attemptRunning = false;
    },

    /**
     * @param highlightCallback
     * @param codeBlockCallback - for example:
     *  (e) => {
     *    if (e.type !== 'blockDestroyed') {
     *      return;
     *    }
     *
     *    if (e.blockType !== '[dropdown value, e.g. logOak') {
     *      return;
     *    }
     *
     *    evalUserCode(e.block);
     *  }
     */
    registerEventCallback(highlightCallback, codeBlockCallback) {
      // TODO(bjordan): maybe need to also handle top-level event block highlighting
      controller.events.push(codeBlockCallback);

      // in controller:
      // this.events.forEach((e) => e({ type: EventType.BLOCK_DESTROYED, blockType: 'logOak' });
      // (and clear out on reset)
    },

    onEventTriggered: function (highlightCallback, type, eventType, callback) {
      this.registerEventCallback(highlightCallback,
        function (event) {
          if (event.eventType === eventType && event.targetType === type) {
            callback(event);
          }
        }
      );
    },

    // helper functions for event
    isEventTriggered: function (event, eventType) {
      return (event.eventType === eventType);
    },

    // command list
    moveDirection: function (highlightCallback, targetEntity, direction) {
      controller.addCommand(new MoveDirectionCommand(controller, highlightCallback, targetEntity, direction), targetEntity);
    },

    moveForward: function (highlightCallback, targetEntity, onFinish) {
      controller.addCommand(new MoveForwardCommand(controller, highlightCallback, targetEntity, onFinish), targetEntity);
    },

    moveBackward: function (highlightCallback, targetEntity) {
      controller.addCommand(new MoveBackwardCommand(controller, highlightCallback, targetEntity), targetEntity);
    },

    moveAway: function (highlightCallback, targetEntity, moveAwayFrom) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.moveAway(callbackCommand, moveAwayFrom);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    moveToward: function (highlightCallback, targetEntity, moveTowardTo) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.moveToward(callbackCommand, moveTowardTo);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    flashEntity: function (highlightCallback, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.flashEntity(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    explodeEntity: function (highlightCallback, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.explodeEntity(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    use: function (highlightCallback, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.use(callbackCommand, targetEntity);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    playSound: function (highlightCallback, sound, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.playSound(callbackCommand, sound);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    turn: function (highlightCallback, direction, targetEntity, onFinish) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.turn(callbackCommand, direction === 'right' ? 1 : -1);
      }, targetEntity, onFinish);
      controller.addCommand(callbackCommand);
    },

    turnRandom: function (highlightCallback, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.turnRandom(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    turnRight: function (highlightCallback, targetEntity, onFinish) {
      this.turn(highlightCallback, 'right', targetEntity, onFinish);
    },

    turnLeft: function (highlightCallback, targetEntity, onFinish) {
      this.turn(highlightCallback, 'left', targetEntity, onFinish);
    },

    destroyBlock: function (highlightCallback, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.destroyBlock(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    placeBlock: function (highlightCallback, blockType, targetEntity) {
      controller.addCommand(new PlaceBlockCommand(controller, highlightCallback, blockType, targetEntity), targetEntity);
    },

    placeDirection: function (highlightCallback, blockType, targetEntity, direction) {
      controller.addCommand(new PlaceDirectionCommand(controller, highlightCallback, blockType, targetEntity, direction), targetEntity, direction);
    },

    placeInFront: function (highlightCallback, blockType, targetEntity) {
      controller.addCommand(new PlaceInFrontCommand(controller, highlightCallback, blockType, targetEntity), targetEntity);
    },

    tillSoil: function (highlightCallback, targetEntity) {
      controller.addCommand(new PlaceInFrontCommand(controller, highlightCallback, 'watering', targetEntity));
    },

    ifBlockAhead: function (highlightCallback, blockType, targetEntity, codeBlock) {
      controller.addCommand(new IfBlockAheadCommand(controller, highlightCallback, blockType, targetEntity, codeBlock), targetEntity);
    },
    // -1 for infinite repeat
    repeat: function (highlightCallback, codeBlock, iteration, targetEntity) {
      controller.addCommand(new RepeatCommand(controller, highlightCallback, codeBlock, iteration, targetEntity));
    },
    // -1 for infinite repeat
    repeatRandom: function (highlightCallback, codeBlock, targetEntity) {
      var maxIteration = 10;
      var randomIteration = Math.floor(Math.random() * maxIteration) + 1;
      controller.addCommand(new RepeatCommand(controller, highlightCallback, codeBlock, randomIteration, targetEntity));
    },

    getScreenshot: function () {
      return controller.getScreenshot();
    },

    spawnEntity: function (highlightCallback, type, spawnDirection) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.spawnEntity(callbackCommand, type, spawnDirection);
      });
      controller.addCommand(callbackCommand);
    },
    spawnEntityAt: function (highlightCallback, type, spawnX, spawnY, spawnDirection) {
      var callbackCommand=new CallbackCommand(controller,highlightCallback,() => {
        controller.spawnEntityAt(callbackCommand,type,spawnX,spawnY, spawnDirection);
      });
      controller.addCommand(callbackCommand);
    },
    destroyEntity: function (highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.destroyEntity(callbackCommand, targetEntity);
      }, targetEntity);
      controller.addGlobalCommand(callbackCommand);
    },

    drop: function (highlightCallback, itemType, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.drop(callbackCommand, itemType);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    startDay: function (highlightCallback) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.startDay(callbackCommand);
      });
      controller.addGlobalCommand(callbackCommand);
    },

    startNight: function (highlightCallback) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.startNight(callbackCommand);
      });
      controller.addGlobalCommand(callbackCommand);
    },

    wait: function (highlightCallback, time, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.wait(callbackCommand, time);
      }, targetEntity);
      controller.addGlobalCommand(callbackCommand);
    },

    attack: function (highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.attack(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    setDayNightCycle: function (firstDelay, delayInSecond,  startTime) {
      if (!controller.dayNightCycle) {
        controller.dayNightCycle = true;
        controller.initiateDayNightCycle(firstDelay, delayInSecond, startTime);
      }
    },

    addScore: function (highlightCallback, score, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.addScore(callbackCommand, score);
      }, targetEntity);
      controller.addGlobalCommand(callbackCommand);
    },

    arrowDown: function (direction) {
      controller.arrowDown(direction);
    },

    arrowUp: function (direction) {
      controller.arrowUp(direction);
    },

    clickDown: function () {
      controller.clickDown();
    },

    clickUp: function () {
      controller.clickUp();
    }
  };
};
