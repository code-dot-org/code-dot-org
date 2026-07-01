import BaseCommand from './BaseCommand';

export default class MoveDirectionCommand extends BaseCommand {
  constructor(gameController, highlightCallback, targetEntity, direction) {
    super(gameController, highlightCallback, targetEntity);
    this.Direciton = direction;
  }

  tick() {
    // do stuff
  }

  begin() {
    super.begin();
    this.GameController.moveDirection(this, this.Direciton);
  }
};
