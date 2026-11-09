const BaseCommand = require("./BaseCommand.js");

module.exports = class MoveForwardCommand extends BaseCommand {
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
