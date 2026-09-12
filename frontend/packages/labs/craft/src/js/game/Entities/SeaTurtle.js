const BaseEntity = require("./BaseEntity");
const FacingDirection = require("../LevelMVC/FacingDirection");

module.exports = class SeaTurtle extends BaseEntity {
  constructor(controller, type, identifier, x, y, facing) {
    super(controller, type, identifier, x, y, facing);
    this.offset = this.controller.levelModel.isUnderwater() ? [-95,-100] : [-95, -90];
    this.prepareSprite();
    this.sprite.sortOrder = this.controller.levelView.yToIndex(this.position.y);
  }

  getFrameForDirection() {
    if (this.controller.levelModel.isUnderwater()) {
      switch (this.facing) {
        case FacingDirection.North:
          return 'Sea_Turtle00';
        case FacingDirection.South:
          return 'Sea_Turtle10';
        case FacingDirection.East:
          return 'Sea_Turtle05';
        case FacingDirection.West:
          return 'Sea_Turtle15';
      }

    } else {
      switch (this.facing) {
        case FacingDirection.East:
          return 'Sea_Turtle_Surface13';
        default:
          return 'Sea_Turtle_Surface00';
      }
    }
  }
  prepareSprite() {
    let frameRate = 12;
    const frame = this.getFrameForDirection();
    const actionGroup = this.controller.levelView.actionGroup;
    this.sprite = actionGroup.create(0, 0, 'seaTurtle', frame+'.png');
    this.sprite.scale.setTo(.75,.75);
    let frameBase = this.controller.levelModel.isUnderwater() ? 'Sea_Turtle' : 'Sea_Turtle_Surface';
    let frameListPerDirection = [[0, 12], // up
      [13, 25], // right
      [0, 12], // down
      [0, 12]]; // left
    if (this.controller.levelModel.isUnderwater()) {
      frameListPerDirection = [[0, 3], // up
      [5, 8], // right
      [10, 13], // down
      [15, 18]]; // left
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
    this.controller.levelView.createMiniBlock(this.position.x, this.position.y, "turtle", {
      collectibleDistance: 1,
      xOffsetRange: 10,
      yOffsetRange: 10
    });
    this.controller.levelEntity.destroyEntity(this.identifier);
    return true;
  }

};
