import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class SeaTurtle extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'seaTurtle';
    this.offset = this.scene.levelModel.isUnderwater() ? [-95, -100] : [20, 20];
    this.prepareSprite();
  }

  prepareSprite() {
    const frameRate = 6;
    this.sprite = this.scene.add.sprite(0, 0, 'seaTurtle');
    this.sprite.scale = 0.75;
    this.scene.levelView.addEntity(this);

    const animations = {
      idle: {
        offsets: {
          up: [0, 12],
          down: [0, 12],
          left: [0, 12],
          right: [13, 25],
        },
        prefix: 'Sea_Turtle_Surface',
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
        prefix: 'Sea_Turtle',
        suffix: '',
        zeroPad: 2,
        repeat: true,
      },
    };

    this.registerAnimations(animations, frameRate, 'seaTurtle');

    // Initialize
    if (this.sprite) {
      this.sprite.x = this.offset[0] + 40 * this.position.x;
      this.sprite.y = this.offset[1] + 40 * this.position.y;
      this.sprite.setDepth(this.scene.levelView.yToIndex(this.position.y));
    }
    this.play('idle');
  }

  canMoveThrough(): boolean {
    this.scene.levelView.createMiniBlock(
      this.position.x,
      this.position.y,
      'turtle',
      {
        collectibleDistance: 1,
        xOffsetRange: 10,
        yOffsetRange: 10,
      },
    );

    this.scene.levelEntity.destroyEntity(this.identifier);
    return true;
  }
}

export default SeaTurtle;
