import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type BaseEntity from '../BaseEntity';
import CommandQueue from '../CommandQueue';
import type GameController from '../GameController';

export type IfCodeCallback = () => void;

class IfBlockAheadCommand extends BaseCommand {
  protected ifCodeCallback: IfCodeCallback;
  protected blockType: string;
  protected queue: CommandQueue;

  constructor(
    gameController: GameController,
    highlightCallback: HighlightCallback,
    targetEntity: BaseEntity,
    onFinish: FinishCallback,
    blockType: string,
    callback: IfCodeCallback,
  ) {
    super(gameController, highlightCallback, targetEntity, onFinish);

    this.blockType = blockType;
    this.ifCodeCallback = callback;

    this.queue = new CommandQueue(gameController);
  }

  tick() {
    super.tick();

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

    // Setup the 'if' check
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

export default IfBlockAheadCommand;
