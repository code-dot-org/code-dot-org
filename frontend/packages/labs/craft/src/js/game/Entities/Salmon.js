const BaseEntity = require("./BaseEntity");
const FacingDirection = require("../LevelMVC/FacingDirection");

module.exports = class Salmon extends BaseEntity {
  constructor(controller, type, identifier, x, y, facing) {
    super(controller, type, identifier, x, y, facing);
    this.offset = [0,0];
    this.prepareSprite();
    this.sprite.sortOrder = this.controller.levelView.yToIndex(this.position.y);
  }

  getFrameForDirection() {
    if (this.controller.levelModel.isUnderwater()) {
      switch (this.facing) {
        case FacingDirection.North:
          return 'Salmon08';
        case FacingDirection.South:
          return 'Salmon24';
        case FacingDirection.East:
          return 'Salmon16';
        case FacingDirection.West:
          return 'Salmon00';
      }

    } else {
      switch (this.facing) {
        case FacingDirection.East:
          return 'Salmon_Surface00';
        default:
          return 'Salmon_Surface13';
      }
    }
  }
  prepareSprite() {
    let frameRate = 12;
    const frame = this.getFrameForDirection();
    const actionGroup = this.controller.levelView.actionGroup;
    this.sprite = actionGroup.create(0, 0, 'salmon', frame+'.png');
    let frameBase = this.controller.levelModel.isUnderwater() ? 'Salmon' : 'Salmon_Surface';
    let frameListPerDirection = [[13, 25], // up
      [0, 12], // right
      [13, 25], // down
      [13, 25]]; // left
    if (this.controller.levelModel.isUnderwater()) {
      frameListPerDirection = [[8, 14], // up
      [16, 22], // right
      [24, 30], // down
      [0, 6]]; // left
    }
    for (var i = 0; i < 4; i++) {
      let facingName = this.controller.levelView.getDirectionName(i);
      let frameList = Phaser.Animation.generateFrameNames(frameBase, frameListPerDirection[i][0], frameListPerDirection[i][1], ".png", 2);
      this.sprite.animations.add("idle"+facingName, frameList, frameRate, false).onComplete.add(() => {
          this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle"+facingName,.5);
      });
    }
    // Initialize
    let facingName = this.controller.levelView.getDirectionName(this.facing);
    this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + facingName,.5);
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;
  }

  canMoveThrough() {
    this.controller.levelEntity.destroyEntity(this.identifier);
    return true;
  }

};
