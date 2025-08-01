import BaseCommand from '../BaseCommand';

class MoveBackwardCommand extends BaseCommand {
  begin() {
    super.begin();
    this.scene.moveBackward(this);
  }
}

export default MoveBackwardCommand;
