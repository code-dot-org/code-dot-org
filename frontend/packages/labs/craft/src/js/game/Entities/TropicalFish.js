const BaseEntity = require("./BaseEntity");
const FacingDirection = require("../LevelMVC/FacingDirection");

module.exports = class TropicalFish extends BaseEntity {
  constructor(controller, type, identifier, x, y, facing) {
    super(controller, type, identifier, x, y, facing);
    this.offset = [0, 16];
    this.prepareSprite();
    this.sprite.sortOrder = this.controller.levelView.yToIndex(this.position.y);
  }

  getFrameForDirection() {
    if (this.controller.levelModel.isUnderwater()) {
      switch (this.facing) {
        case FacingDirection.North:
          return 'Tropical_Fish00';
        case FacingDirection.South:
          return 'Tropical_Fish10';
        case FacingDirection.East:
          return 'Tropical_Fish15';
        case FacingDirection.West:
          return 'Tropical_Fish05';
      }

    } else {
      switch (this.facing) {
        case FacingDirection.East:
          return 'Tropical_Fish_Surface00';
        default:
          return 'Tropical_Fish_Surface07';
      }
    }
  }
  prepareSprite() {
    let frameRate = 12;
    const frame = this.getFrameForDirection();
    const actionGroup = this.controller.levelView.actionGroup;
    this.sprite = actionGroup.create(0, 0, 'tropicalFish', frame+'.png');
    let frameBase = this.controller.levelModel.isUnderwater() ? 'Tropical_Fish' : 'Tropical_Fish_Surface';
    let frameListPerDirection = [[7, 13], // up
      [0, 6], // right
      [7, 13], // down
      [7, 13]]; // left
    if (this.controller.levelModel.isUnderwater()) {
      frameListPerDirection = [[0, 3], // up
      [15, 18], // right
      [10, 13], // down
      [5, 8]]; // left
    }
    for (let i = 0; i < 4; i++) {
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
