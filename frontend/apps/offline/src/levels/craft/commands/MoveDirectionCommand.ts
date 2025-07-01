import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type BaseEntity from '../BaseEntity';
import type {Direction} from '../FacingDirection';
import type GameController from '../GameController';

class MoveDirectionCommand extends BaseCommand {
  protected direction: Direction;

  constructor(
    gameController: GameController,
    highlightCallback: HighlightCallback,
    targetEntity: BaseEntity,
    onFinish: FinishCallback,
    direction: Direction,
  ) {
    super(gameController, highlightCallback, targetEntity, onFinish);

    this.direction = direction;
  }

  begin() {
    super.begin();
    this.GameController.moveDirection(this, this.direction);
  }
}

export default MoveDirectionCommand;
