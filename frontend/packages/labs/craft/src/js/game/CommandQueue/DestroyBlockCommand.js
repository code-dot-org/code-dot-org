import BaseCommand from './BaseCommand';

export default class DestroyBlockCommand extends BaseCommand {
  constructor(gameController, highlightCallback, targetEntity) {

    super(gameController, highlightCallback, targetEntity);
  }

  tick() {
    // do stuff
  }

  begin() {
    super.begin();
    this.GameController.destroyBlock(this);
  }
};
