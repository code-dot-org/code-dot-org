import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type BaseEntity from '../BaseEntity';
import type {Direction} from '../FacingDirection';
import type GameController from '../GameController';

class PlaceDirectionCommand extends BaseCommand {
  protected blockType: string;
  protected direction: Direction;

  constructor(
    gameController: GameController,
    highlightCallback: HighlightCallback,
    targetEntity: BaseEntity,
    onFinish: FinishCallback,
    blockType: string,
    direction: Direction,
  ) {
    super(gameController, highlightCallback, targetEntity, onFinish);

    this.blockType = blockType;
    this.direction = direction;
  }

  begin() {
    super.begin();
    this.GameController.placeBlockDirection(
      this,
      this.BlockType,
      this.direction,
    );
  }
}

export default PlaceDirectionCommand;
