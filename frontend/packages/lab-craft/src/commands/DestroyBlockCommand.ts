import BaseCommand from '../BaseCommand';

class DestroyBlockCommand extends BaseCommand {
  begin() {
    super.begin();
    this.scene.destroyBlock(this);
  }
}

export default DestroyBlockCommand;
