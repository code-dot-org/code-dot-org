import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class TurnCommand extends BaseCommand {
  protected direction: Direction;

  constructor(
    scene: LevelRunnerScene,
    highlightCallback: HighlightCallback,
    targetEntity: number | string,
    onFinish: FinishCallback,
    direction: Direction,
  ) {
    super(scene, highlightCallback, targetEntity, onFinish);

    this.direction = direction;
  }

  begin() {
    super.begin();
    this.scene.turn(this, this.direction);
  }
}

export default TurnCommand;
