import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type BaseEntity from '../BaseEntity';
import type GameController from '../GameController';

class PlaceBlockCommand extends BaseCommand {
  protected blockType: string;

  constructor(
    gameController: GameController,
    highlightCallback: HighlightCallback,
    targetEntity: BaseEntity,
    onFinish: FinishCallback,
    blockType: string,
  ) {
    super(gameController, highlightCallback, targetEntity, onFinish);

    this.blockType = blockType;
  }

  begin() {
    super.begin();
    this.GameController.placeBlock(this, this.BlockType);
  }
}

export default PlaceBlockCommand;
