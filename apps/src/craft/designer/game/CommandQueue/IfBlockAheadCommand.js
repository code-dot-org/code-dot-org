import CommandState from "./CommandState.js";
import CommandQueue from "./CommandQueue.js";
import BaseCommand from "./BaseCommand.js";

export default class IfBlockAheadCommand extends BaseCommand {
  constructor(gameController, highlightCallback, blockType, targetEntity, callback) {
    super(gameController, highlightCallback, targetEntity);

    this.blockType = blockType;
    this.ifCodeCallback = callback;

    this.queue = new CommandQueue(gameController);
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
      this.state = CommandState.SUCCESS;
    }
  }

  begin() {
    super.begin();
    if (this.GameController.DEBUG) {
      console.log("WHILE command: BEGIN");
    }

    // setup the "if" check
    this.handleIfCheck();
  }

  handleIfCheck() {
    if (this.GameController.isPathAhead(this.blockType)) {
      const targetQueue = this.GameController.getEntity(this.target).queue;
      this.queue.reset();
      targetQueue.setWhileCommandInsertState(this.queue);
      this.ifCodeCallback(); // inserts commands via CodeOrgAPI
      targetQueue.setWhileCommandInsertState(null);
      this.queue.begin();
    } else {
      this.state = CommandState.SUCCESS;
    }
  }
}

