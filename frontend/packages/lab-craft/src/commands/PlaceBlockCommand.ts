import BaseCommand, {HighlightCallback, FinishCallback} from '../BaseCommand';
import type {LevelRunnerScene} from '../GameController';

class PlaceBlockCommand extends BaseCommand {
  protected blockType: string;

  constructor(
    scene: LevelRunnerScene,
    highlightCallback: HighlightCallback,
    targetEntity: number | string,
    onFinish: FinishCallback,
    blockType: string,
  ) {
    super(scene, highlightCallback, targetEntity, onFinish);

    this.blockType = blockType;
  }

  begin() {
    super.begin();
    this.scene.placeBlock(this, this.blockType);
  }
}

export default PlaceBlockCommand;
