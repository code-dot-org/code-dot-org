import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class TropicalFish extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'tropicalFish';
    this.offset = [20, 20];
    this.prepareSprite();
    this.sprite?.setDepth(this.scene.levelView.yToIndex(this.position.y));
  }

  prepareSprite() {
    const frameRate = 6;
    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'tropicalFish');
    actionGroup.add(this.sprite);

    const animations = {
      idle: {
        offsets: {
          up: [7, 13],
          down: [7, 13],
          left: [7, 13],
          right: [0, 6],
        },
        prefix: 'Tropical_Fish_Surface',
        suffix: '.png',
        zeroPad: 2,
        repeat: true,
      },
      'underwater-idle': {
        offsets: {
          up: [0, 3],
          down: [10, 13],
          left: [15, 18],
          right: [5, 8],
        },
        prefix: 'Tropical_Fish',
        suffix: '.png',
        zeroPad: 2,
        repeat: true,
      },
    };

    this.registerAnimations(animations, frameRate, 'tropicalFish');

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

export default TropicalFish;
