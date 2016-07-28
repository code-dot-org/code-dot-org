import CommandState from "./CommandState.js";
import CommandQueue from "./CommandQueue.js";
import BaseCommand from "./BaseCommand.js";

export default class WhileCommand extends BaseCommand {
  constructor(gameController, highlightCallback, blockType, callback) {
    super(gameController, highlightCallback);

    this.iterationsLeft = 15;
    this.BlockType = blockType;
    this.WhileCode = callback;
    this.queue = new CommandQueue(this);
  }

  tick() {
    if (this.state === CommandState.WORKING) {
      // tick our command queue
      this.queue.tick();
    }

    if (this.queue.isFailed()) {
      this.state = CommandState.FAILURE;
    }

    if (this.queue.isSucceeded()) {
      this.handleWhileCheck();
    }
  }

  begin() {
    super.begin();
    if (this.gameController.DEBUG) {
      console.log("WHILE command: BEGIN");
    }

    // setup the while check the first time
    this.handleWhileCheck();
  }

  handleWhileCheck() {
    if (this.iterationsLeft <= 0) {
      this.state = CommandState.FAILURE;
    }

    if (this.gameController.isPathAhead(this.BlockType)) {
      this.queue.reset();
      this.gameController.queue.setWhileCommandInsertState(this.queue);
      this.WhileCode();
      this.gameController.queue.setWhileCommandInsertState(null);
      this.queue.begin();
    } else {
      this.state = CommandState.SUCCESS;
    }

    this.iterationsLeft--;
    if (this.gameController.DEBUG) {
      console.log(`While command: Iterationsleft   ${this.iterationsLeft} `);
    }
  }
}

