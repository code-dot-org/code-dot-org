import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Dolphin extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'dolphin';
    this.offset = this.scene.levelModel.isUnderwater() ? [-8, -8] : [4, 10];
    this.prepareSprite();
    this.sprite?.setDepth(this.position.y);
  }

  prepareSprite() {
    const frameRate = 6;
    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'dolphin');
    actionGroup.add(this.sprite);

    const animations = {
      idle: {
        offsets: {
          up: [0, 14],
          down: [0, 14],
          left: [0, 14],
          right: [15, 29],
        },
        prefix: 'Dolphin_Surface',
        zeroPad: 2,
        repeat: true,
      },
      'underwater-idle': {
        offsets: {
          up: [9, 16],
          down: [27, 34],
          left: [0, 7],
          right: [18, 25],
        },
        prefix: 'Dolphin',
        zeroPad: 2,
        repeat: true,
      },
    };

    this.registerAnimations(animations, frameRate, 'dolphin');

    // Initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;
    this.play('idle');
  }

  canMoveThrough(): boolean {
    this.scene.levelEntity.destroyEntity(this.identifier);
    return true;
  }
}

export default Dolphin;
