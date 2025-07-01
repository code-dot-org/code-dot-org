import BaseCommand from '../BaseCommand';

class MoveForewardCommand extends BaseCommand {
  begin() {
    super.begin();
    this.GameController.moveForeward(this);
  }
}

export default MoveForewardCommand;
