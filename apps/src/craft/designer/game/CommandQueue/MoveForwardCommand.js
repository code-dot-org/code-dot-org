import BaseCommand from "./BaseCommand.js";

export default class MoveForwardCommand extends BaseCommand {
  constructor(gameController, highlightCallback, targetEntity) {
    super(gameController, highlightCallback, targetEntity);
  }

  tick() {
    // do stuff
  }

  begin() {
    super.begin();
    this.GameController.moveForward(this);
  }
}

