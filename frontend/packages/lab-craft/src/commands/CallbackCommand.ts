import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type {LevelRunnerScene} from '../GameController';

export type ActionCallback = () => void;

class CallbackCommand extends BaseCommand {
  protected actionCallback: ActionCallback;

  constructor(
    scene: LevelRunnerScene,
    highlightCallback: HighlightCallback,
    targetEntity: number | string,
    onFinish: FinishCallback,
    actionCallback: ActionCallback,
  ) {
    super(scene, highlightCallback, targetEntity, onFinish);

    this.actionCallback = actionCallback;
  }

  begin() {
    super.begin();
    this.actionCallback();
  }
}

export default CallbackCommand;
