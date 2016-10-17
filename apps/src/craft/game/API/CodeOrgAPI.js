import CommandQueue from "../CommandQueue/CommandQueue.js";
import BaseCommand from "../CommandQueue/BaseCommand.js";
import DestroyBlockCommand from "../CommandQueue/DestroyBlockCommand.js";
import PlaceBlockCommand from "../CommandQueue/PlaceBlockCommand.js";
import PlaceInFrontCommand from "../CommandQueue/PlaceInFrontCommand.js";
import MoveForwardCommand from "../CommandQueue/MoveForwardCommand.js";
import TurnCommand from "../CommandQueue/TurnCommand.js";
import WhileCommand from "../CommandQueue/WhileCommand.js";
import IfBlockAheadCommand from "../CommandQueue/IfBlockAheadCommand.js";
import CheckSolutionCommand from "../CommandQueue/CheckSolutionCommand.js";
import CallbackCommand from "../CommandQueue/CallbackCommand.js";
import RepeatCommand from "../CommandQueue/RepeatCommand.js";

export function get(controller) {
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
     */
    startAttempt: function (onAttemptComplete) {
      controller.OnCompleteCallback = onAttemptComplete;
      controller.setPlayerActionDelayByQueueLength();
      controller.queue.begin();
      controller.run();
      controller.attemptRunning = true;
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

    // not used
    /*
    isEntityMove: function (event, entityIdentifier) {
      if (event.eventType === 'entityMoved') {
        return event.entityIdentifier === entityIdentifier;
      }
      return false;
    },*/
    // helper functions for event
    isEventTriggered: function (event, eventType) {
      return (event.eventType === eventType);
    },
    // command list
    moveForward: function (highlightCallback, targetEntity) {
      controller.addCommand(new MoveForwardCommand(controller, highlightCallback, targetEntity), targetEntity);
    },

    moveRandom: function (highlightCallback, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.moveRandom(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    moveDirection: function (highlightCallback, direction, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.moveDirection(callbackCommand, direction);
      }, targetEntity);
      controller.addCommand(callbackCommand);
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

    moveTo: function (highlightCallback, targetEntity, moveTowardTo) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.moveTo(callbackCommand, moveTowardTo);
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

    playSound: function (highlightCallback, sound) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.playSound(callbackCommand, sound);
      });
      controller.addCommand(callbackCommand);
    },

    turn: function (highlightCallback, direction, targetEntity) {

      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.turn(callbackCommand, direction === 'right' ? 1 : -1);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    turnRandom: function (highlightCallback, targetEntity) {
      const callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.turnRandom(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    turnRight: function (highlightCallback, targetEntity) {
      controller.addCommand(new TurnCommand(controller, highlightCallback, 1, targetEntity));
    },

    turnLeft: function (highlightCallback, targetEntity) {
      controller.addCommand(new TurnCommand(controller, highlightCallback, -1, targetEntity));
    },

    destroyBlock: function (highlightCallback, targetEntity) {
      controller.addCommand(new DestroyBlockCommand(controller, highlightCallback, targetEntity));
    },

    placeBlock: function (highlightCallback, blockType) {
      controller.addCommand(new PlaceBlockCommand(controller, highlightCallback, blockType));
    },

    placeInFront: function (highlightCallback, blockType) {
      controller.addCommand(new PlaceInFrontCommand(controller, highlightCallback, blockType));
    },

    tillSoil: function (highlightCallback) {
      controller.addCommand(new PlaceInFrontCommand(controller, highlightCallback, 'watering'));
    },

    whilePathAhead: function (highlightCallback, blockType, codeBlock) {
      controller.addCommand(new WhileCommand(controller, highlightCallback, blockType, codeBlock));
    },

    ifBlockAhead: function (highlightCallback, blockType, codeBlock) {
      controller.addCommand(new IfBlockAheadCommand(controller, highlightCallback, blockType, codeBlock));
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
    spawnEntityAt: function (highlightCallback, type, x, y, facing) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.spawnEntityAt(callbackCommand, type, x, y, facing);
      });
      controller.addCommand(callbackCommand);
    },

    destroyEntity: function (highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.destroyEntity(callbackCommand, targetEntity);
      });
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
        controller.wait(callbackCommand, time)
      }, targetEntity);
      controller.addGlobalCommand(callbackCommand);
    },

    attack: function (highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, () => {
        controller.attack(callbackCommand)
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    setDayNightCycle: function (firstDelay, delayInSecond,  startTime) {
      if (!controller.dayNightCycle) {
        controller.dayNightCycle = true;
        controller.initiateDayNightCycle(firstDelay, delayInSecond, startTime);
      }
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
}
