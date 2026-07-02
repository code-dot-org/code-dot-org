import FacingDirection from '../LevelMVC/FacingDirection';
import {generateFrameNames} from '../LevelMVC/Utils';

import BaseEntity from './BaseEntity';

export default class TropicalFish extends BaseEntity {
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
    this.sprite = this.controller.levelView.createSprite(actionGroup, 0, 0, 'tropicalFish', frame+'.png');
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
      let frameList = generateFrameNames(frameBase, frameListPerDirection[i][0], frameListPerDirection[i][1], ".png", 2);
      this.addAnimation("idle"+facingName, frameList, frameRate, false, () => {
          this.controller.levelView.playScaledSpeed(this.sprite, "idle"+facingName,.5);
      });
    }
    // Initialize
    let facingName = this.controller.levelView.getDirectionName(this.facing);
    this.controller.levelView.playScaledSpeed(this.sprite, "idle" + facingName,.5);
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;
  }

  canMoveThrough() {
    this.controller.levelEntity.destroyEntity(this.identifier);
    return true;
  }

};
