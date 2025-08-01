import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Salmon extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'salmon';
    this.offset = [0, 0];
    this.prepareSprite();
    this.sprite?.setDepth(this.scene.levelView.yToIndex(this.position.y));
  }

  prepareSprite() {
    const frameRate = 12;
    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'salmon');
    actionGroup.add(this.sprite);

    const animations = {
      idle: {
        offsets: {
          up: [13, 25],
          down: [13, 25],
          left: [13, 25],
          right: [0, 12],
        },
        prefix: 'Salmon',
        zeroPad: 2,
        repeat: true,
      },
      'underwater-idle': {
        offsets: {
          up: [8, 14],
          down: [24, 30],
          left: [0, 6],
          right: [16, 22],
        },
        prefix: 'Salmon_Surface',
        zeroPad: 2,
        repeat: true,
      },
    };

    this.registerAnimations(animations, frameRate, 'salmon');

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

export default Salmon;
