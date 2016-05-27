
import CommandState from "./CommandState.js";
import BaseCommand from "./BaseCommand.js";

export default class DestroyBlockCommand extends BaseCommand {
    constructor(gameController, highlightCallback) {

        super(gameController, highlightCallback);
    }

    tick() {
        // do stuff
    }

    begin() {
        super.begin();
        this.GameController.destroyBlock(this);
    }

}

