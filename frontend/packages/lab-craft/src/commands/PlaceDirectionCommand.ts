import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class PlaceDirectionCommand extends BaseCommand {
  protected blockType: string;
  protected direction: Direction;

  constructor(
    scene: LevelRunnerScene,
    highlightCallback: HighlightCallback,
    targetEntity: number | string,
    onFinish: FinishCallback,
    blockType: string,
    direction: Direction,
  ) {
    super(scene, highlightCallback, targetEntity, onFinish);

    this.blockType = blockType;
    this.direction = direction;
  }

  begin() {
    super.begin();
    this.scene.placeBlockDirection(
      this,
      this.blockType,
      this.direction,
    );
  }
}

export default PlaceDirectionCommand;
