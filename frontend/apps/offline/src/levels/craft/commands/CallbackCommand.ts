import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type BaseEntity from '../BaseEntity';
import type GameController from '../GameController';

export type ActionCallback = () => void;

class CallbackCommand extends BaseCommand {
  protected actionCallback: ActionCallback;

  constructor(
    gameController: GameController,
    highlightCallback: HighlightCallback,
    targetEntity: BaseEntity,
    onFinish: FinishCallback,
    actionCallback: ActionCallback,
  ) {
    super(gameController, highlightCallback, targetEntity, onFinish);

    this.actionCallback = actionCallback;
  }

  begin() {
    super.begin();
    this.actionCallback();
  }
}

export default CallbackCommand;
