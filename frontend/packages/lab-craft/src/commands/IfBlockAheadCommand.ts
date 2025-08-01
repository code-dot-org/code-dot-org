import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import CommandQueue from '../CommandQueue';
import CommandState from '../CommandState';
import type {LevelRunnerScene} from '../GameController';

export type IfCodeCallback = () => void;

class IfBlockAheadCommand extends BaseCommand {
  protected ifCodeCallback: IfCodeCallback;
  protected blockType: string;
  protected queue: CommandQueue;

  constructor(
    scene: LevelRunnerScene,
    highlightCallback: HighlightCallback,
    targetEntity: number | string,
    onFinish: FinishCallback,
    blockType: string,
    callback: IfCodeCallback,
  ) {
    super(scene, highlightCallback, targetEntity, onFinish);

    this.blockType = blockType;
    this.ifCodeCallback = callback;

    this.queue = new CommandQueue(scene);
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
    if (this.scene.isPathAhead(this.blockType)) {
      const targetQueue = this.scene.getEntity(this.target)?.queue;
      this.queue.reset();
      targetQueue?.setWhileCommandInsertState(this.queue);
      this.ifCodeCallback(); // inserts commands via CodeOrgAPI
      targetQueue?.setWhileCommandInsertState();
      this.queue.begin();
    } else {
      this.state = CommandState.SUCCESS;
    }
  }
}

export default IfBlockAheadCommand;
