const BaseCommand = require("./BaseCommand.js");

module.exports = class PlaceInFrontCommand extends BaseCommand {
  constructor(gameController, highlightCallback, blockType, targetEntity) {
    super(gameController, highlightCallback, targetEntity);

    this.BlockType = blockType;
  }

  tick() {
    // do stuff??
  }

  begin() {
    super.begin();
    this.GameController.placeBlockForward(this, this.BlockType);
  }
};
