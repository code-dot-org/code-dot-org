
import CommandState from "./CommandState.js";
import CommandQueue from "./CommandQueue.js";
import BaseCommand from "./BaseCommand.js";

export default class CheckSolutionCommand extends BaseCommand {
    constructor(gameController) {
        var dummyFunc = function() {
            if (gameController.DEBUG) {
                console.log("Execute solve command");
            }
        };

        super(gameController, dummyFunc);
    }

    tick() {
        // do stuff
    }

    begin() {
        super.begin();
        if (this.GameController.DEBUG) {
            console.log("Solve command: BEGIN");
        }
        var result = this.GameController.checkSolution(this);
    }

}

