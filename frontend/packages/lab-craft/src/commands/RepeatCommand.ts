import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type {LevelRunnerScene} from '../GameController';

import type {ActionCallback} from './CallbackCommand';

class RepeatCommand extends BaseCommand {
  protected actionCallback: ActionCallback;
  protected iteration: number;

  constructor(
    scene: LevelRunnerScene,
    highlightCallback: HighlightCallback,
    targetEntity: number | string,
    onFinish: FinishCallback,
    actionCallback: ActionCallback,
    iteration: number,
  ) {
    super(scene, highlightCallback, targetEntity, onFinish);

    this.actionCallback = actionCallback;
    this.iteration = iteration;
  }

  begin() {
    super.begin();
    this.succeeded();
    this.addRepeatCommand();
  }

  addRepeatCommand() {
    const entity = this.scene.levelEntity.entityMap.get(this.target);

    if (!entity) {
      this.scene.queue.addRepeatCommands(
        this.actionCallback,
        this.iteration,
      );
    } else {
      entity.queue.addRepeatCommands(this.actionCallback, this.iteration);
    }
  }
}

export default RepeatCommand;
