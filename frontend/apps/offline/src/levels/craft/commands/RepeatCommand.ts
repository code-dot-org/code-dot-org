import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type BaseEntity from '../BaseEntity';
import type GameController from '../GameController';

class RepeatCommand extends BaseCommand {
  protected iteration: number;

  constructor(
    gameController: GameController,
    highlightCallback: HighlightCallback,
    targetEntity: BaseEntity,
    onFinish: FinishCallback,
    iteration: number,
  ) {
    super(gameController, highlightCallback, targetEntity, onFinish);

    this.iteration = iteration;
  }

  begin() {
    super.begin();
    this.succeeded();
    this.addRepeatCommand();
  }

  addRepeatCommand() {
    const entity = this.GameController.levelEntity.entityMap.get(this.target);

    if (entity) {
      this.GameController.queue.addRepeatCommands(
        this.actionCallback,
        this.iteration,
      );
    } else {
      entity.queue.addRepeatCommands(this.actionCallback, this.iteration);
    }
  }
}

export default RepeatCommand;
