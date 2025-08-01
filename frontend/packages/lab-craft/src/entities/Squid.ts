import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Squid extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'squid';
    this.prepareSprite();
    this.sprite?.setDepth(this.position.y);
  }

  getOffsetForDirection(): [number, number] {
    switch (this.facing) {
      case Direction.North:
        return [40, 20];
      case Direction.South:
        return [40, -4];
      case Direction.East:
        return [8, 12];
      case Direction.West:
      default:
        return [28, 12];
    }

    return [8, 12];
  }

  prepareSprite() {
    const frameRate = 3;

    this.offset = this.getOffsetForDirection();
    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'squid');
    actionGroup.add(this.sprite);
    this.sprite.scale = 0.75;

    const animations = {
      idle: {
        offsets: {
          up: [32, 39],
          down: [0, 8],
          left: [17, 23],
          right: [40, 47],
        },
        prefix: 'Squid',
        zeroPad: 2,
        repeat: true,
      },
    };

    this.registerAnimations(animations, frameRate, 'squid');

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

export default Squid;
