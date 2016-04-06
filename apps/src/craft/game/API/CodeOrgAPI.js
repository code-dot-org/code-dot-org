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
        controller.queue.addCommand(new CheckSolutionCommand(controller));

        controller.setPlayerActionDelayByQueueLength();

        controller.queue.begin();
    },

    resetAttempt: function () {
        controller.reset();
        controller.queue.reset();
        controller.OnCompleteCallback = null;
    },

    moveForward: function (highlightCallback) {
        controller.queue.addCommand(new MoveForwardCommand(controller, highlightCallback));
    },

    turn: function (highlightCallback, direction) {
        controller.queue.addCommand(new TurnCommand(controller, highlightCallback, direction === 'right' ? 1 : -1));
    },

    turnRight: function (highlightCallback) {
        controller.queue.addCommand(new TurnCommand(controller, highlightCallback, 1));
    },

    turnLeft: function (highlightCallback) {
        controller.queue.addCommand(new TurnCommand(controller, highlightCallback, -1));
    },

    destroyBlock: function (highlightCallback) {
        controller.queue.addCommand(new DestroyBlockCommand(controller, highlightCallback));
    },

    placeBlock: function (highlightCallback, blockType) {
        controller.queue.addCommand(new PlaceBlockCommand(controller, highlightCallback, blockType));
    },

    placeInFront: function (highlightCallback, blockType) {
        controller.queue.addCommand(new PlaceInFrontCommand(controller, highlightCallback, blockType));
    },

    tillSoil: function (highlightCallback) {
        controller.queue.addCommand(new PlaceInFrontCommand(controller, highlightCallback, 'watering'));
    },

    whilePathAhead: function (highlightCallback, blockType, codeBlock) {
        controller.queue.addCommand(new WhileCommand(controller, highlightCallback, blockType, codeBlock));
    },

    ifBlockAhead: function (highlightCallback, blockType, codeBlock) {
        controller.queue.addCommand(new IfBlockAheadCommand(controller, highlightCallback, blockType, codeBlock));
    },

    getScreenshot: function () {
        return controller.getScreenshot();
    }
  };
}
