import CommandState from './CommandState';
import type {LevelRunnerScene} from './GameController';

export type FinishCallback = () => void;
export type HighlightCallback = () => void;

/**
 * The base class for all game commands.
 */
class BaseCommand {
  protected onFinish: FinishCallback;
  protected HighlightCallback: HighlightCallback;
  protected state: CommandState;
  protected scene: LevelRunnerScene;
  target: number | string;
  repeat: boolean;
  waitForOtherQueue: boolean = false;

  constructor(
    scene: LevelRunnerScene,
    highlightCallback: HighlightCallback,
    targetEntity: number | string,
    onFinish: FinishCallback,
  ) {
    this.scene = scene;
    this.onFinish = onFinish;
    this.target = targetEntity;
    this.HighlightCallback = highlightCallback;
    this.state = CommandState.NOT_STARTED;
    this.repeat = false;
  }

  tick() {}

  begin() {}

  isStarted(): boolean {
    return this.state !== CommandState.NOT_STARTED;
  }

  isFinished(): boolean {
    return this.isSucceeded() || this.isFailed();
  }

  isSucceeded(): boolean {
    return this.state === CommandState.SUCCESS;
  }

  isFailed(): boolean {
    return this.state === CommandState.FAILURE;
  }

  succeeded() {
    this.state = CommandState.SUCCESS;
  }

  failed() {
    this.state = CommandState.FAILURE;
  }

  finish() {
    this.onFinish?.();
  }
}

export default BaseCommand;
