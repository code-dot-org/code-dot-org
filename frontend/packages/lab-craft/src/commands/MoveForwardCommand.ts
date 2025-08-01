import BaseCommand from '../BaseCommand';

class MoveForwardCommand extends BaseCommand {
  begin() {
    super.begin();
    this.scene.moveForward(this);
  }
}

export default MoveForwardCommand;
