import FacingDirection from '../LevelMVC/FacingDirection';
import {generateFrameNames} from '../LevelMVC/Utils';

import BaseEntity from './BaseEntity';

export default class Squid extends BaseEntity {
  constructor(controller, type, identifier, x, y, facing) {
    super(controller, type, identifier, x, y, facing);
    this.prepareSprite();
    this.sprite.sortOrder = this.controller.levelView.yToIndex(this.position.y);
  }

  getOffsetForDirection() {
    switch (this.facing) {
      case FacingDirection.North:
        return [0,0];
      case FacingDirection.South:
        return [0,-24];
      case FacingDirection.East:
        return [-32,-8];
      case FacingDirection.West:
        return [-12,-8];
    }
  }

  getFrameForDirection() {
    switch (this.facing) {
      case FacingDirection.North:
        return 'Squid32';
      case FacingDirection.South:
        return 'Squid00';
      case FacingDirection.East:
        return 'Squid48';
      case FacingDirection.West:
        return 'Squid17';
    }
  }
  prepareSprite() {
    this.offset = this.getOffsetForDirection();
    let frameRate = 12;
    const frame = this.getFrameForDirection();
    const actionGroup = this.controller.levelView.actionGroup;
    this.sprite = this.controller.levelView.createSprite(actionGroup, 0, 0, 'squid', frame+'.png');
    this.sprite.setScale(0.75,0.75);
    let frameListPerDirection = [[32, 39], // up
      [40, 47], // right
      [0, 7], // down
      [17, 23]]; // left
    for (var i = 0; i < 4; i++) {
      let facingName = this.controller.levelView.getDirectionName(i);
      let frameList = generateFrameNames("Squid", frameListPerDirection[i][0], frameListPerDirection[i][1], ".png", 2);
      this.addAnimation("idle"+facingName, frameList, frameRate, false, () => {
          this.controller.levelView.playScaledSpeed(this.sprite, "idle"+facingName,.25);
      });
    }
    // Initialize
    let facingName = this.controller.levelView.getDirectionName(this.facing);
    this.controller.levelView.playScaledSpeed(this.sprite, "idle" + facingName,.25);
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;
  }

  canMoveThrough() {
    this.controller.levelEntity.destroyEntity(this.identifier);
    return true;
  }

};
