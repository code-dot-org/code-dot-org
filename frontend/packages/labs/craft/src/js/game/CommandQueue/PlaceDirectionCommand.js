const BaseCommand = require("./BaseCommand.js");

module.exports = class PlaceDirectionCommand extends BaseCommand {
  constructor(gameController, highlightCallback, blockType, targetEntity, direction) {
    super(gameController, highlightCallback, targetEntity);

    this.BlockType = blockType;
    this.Direction = direction;
  }

  tick() {
    // do stuff??
  }

  begin() {
    super.begin();
    this.GameController.placeBlockDirection(this, this.BlockType, this.Direction);
  }
};
