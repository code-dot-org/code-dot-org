import BaseCommand from './BaseCommand';

export default class MoveForwardCommand extends BaseCommand {
  constructor(gameController, highlightCallback, targetEntity, onFinish) {
    super(gameController, highlightCallback, targetEntity, onFinish);
  }

  tick() {
    // do stuff
  }

  begin() {
    super.begin();
    this.GameController.moveForward(this);
  }
};
