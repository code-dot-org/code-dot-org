import BaseCommand from '../BaseCommand';

class MoveBackwardCommand extends BaseCommand {
  begin() {
    super.begin();
    this.GameController.moveBackward(this);
  }
}

export default MoveBackwardCommand;
