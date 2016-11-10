import BaseCommand from "./BaseCommand.js";

export default class CheckSolutionCommand extends BaseCommand {
    constructor(gameController) {
        var dummyFunc = function () {
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
        this.GameController.checkSolution(this);
    }

}
