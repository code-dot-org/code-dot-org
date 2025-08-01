import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Cod extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.offset = [0, 10];
    this.entityName = 'cod';
    this.prepareSprite();
    this.sprite?.setDepth(this.scene.levelView.yToIndex(this.position.y));
  }

  prepareSprite() {
    const frameRate = 6;
    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'cod');
    actionGroup.add(this.sprite);

    const animations = {
      idle: {
        offsets: {
          up: [6, 12],
          down: [6, 12],
          left: [6, 12],
          right: [0, 5],
        },
        prefix: 'Cod_Surface',
        suffix: '',
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
        prefix: 'Cod',
        suffix: '',
        zeroPad: 2,
        repeat: true,
      },
    };

    this.registerAnimations(animations, frameRate, 'cod');

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

export default Cod;
