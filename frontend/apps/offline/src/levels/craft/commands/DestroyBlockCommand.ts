import BaseCommand from '../BaseCommand';

class DestroyBlockCommand extends BaseCommand {
  begin() {
    super.begin();
    this.GameController.destroyBlock(this);
  }
}

export default DestroyBlockCommand;
