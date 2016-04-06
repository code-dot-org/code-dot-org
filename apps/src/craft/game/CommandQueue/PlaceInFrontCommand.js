
import CommandState from "./CommandState.js";
import BaseCommand from "./BaseCommand.js";

export default class PlaceInFrontCommand extends BaseCommand {
    constructor(gameController, highlightCallback, blockType) {
        super(gameController, highlightCallback);

        this.BlockType = blockType;
    }

    tick() {
        // do stuff??
    }

    begin() {
        super.begin();
        this.GameController.placeBlockForward(this, this.BlockType);
    }
}

