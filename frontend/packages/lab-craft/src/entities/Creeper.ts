import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Creeper extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'creeper';
    this.offset = [-23, -35];
    this.prepareSprite();
    this.sprite?.setDepth(this.scene.levelView.yToIndex(this.position.y));
  }

  prepareSprite() {
    const frameRate = 10;
    const randomPauseMin = 0.2;
    const randomPauseMax = 1;

    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'creeper');
    actionGroup.add(this.sprite);

    const randomIdle: string[] = ['idle', 'lookLeft', 'lookRight', 'lookAtCam'];
    const randomDelay: () => number = () =>
      (Math.random() * (randomPauseMax - randomPauseMin) + randomPauseMin) *
      1000;

    const animations = {
      idle: {
        offsets: {
          up: [128, 128],
          down: [0, 0],
          left: [192, 192],
          right: [64, 64],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: randomIdle,
      },
      // look left sequence ( look left -> pause for random time -> look front -> idle)
      lookLeft: {
        offsets: {
          up: [128, 131],
          down: [0, 3],
          left: [192, 195],
          right: [64, 67],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'lookLeft_2',
        destinationDelay: randomDelay,
      },
      lookLeft_2: {
        offsets: {
          up: [131, 128],
          down: [3, 0],
          left: [195, 192],
          right: [67, 64],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
      // look right sequence ( look right -> pause for random time -> look front -> idle)
      lookRight: {
        offsets: {
          up: [134, 137],
          down: [6, 10],
          left: [198, 201],
          right: [70, 73],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'lookRight_2',
        destinationDelay: randomDelay,
      },
      lookRight_2: {
        offsets: {
          up: [137, 134],
          down: [10, 6],
          left: [201, 198],
          right: [73, 70],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
      // look up sequence ( look up -> pause for random time -> look front -> play random idle)
      lookAtCam: {
        offsets: {
          up: [140, 143],
          down: [12, 16],
          left: [204, 207],
          right: [76, 89],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'lookAtCam_2',
        destinationDelay: randomDelay,
      },
      lookAtCam_2: {
        offsets: {
          up: [143, 140],
          down: [16, 12],
          left: [207, 204],
          right: [89, 76],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
      // look down
      lookDown: {
        offsets: {
          up: [146, 149],
          down: [18, 21],
          left: [210, 213],
          right: [82, 85],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'lookAtCam_2',
      },
      lookDown_2: {
        offsets: {
          up: [149, 146],
          down: [18, 21],
          left: [213, 210],
          right: [85, 82],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
      // walk
      walk: {
        offsets: {
          up: [152, 163],
          down: [24, 35],
          left: [216, 227],
          right: [88, 99],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        repeat: true,
      },
      // attack
      attack: {
        offsets: {
          up: [164, 167],
          down: [36, 39],
          left: [228, 231],
          right: [100, 103],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
      // explode
      explode: {
        offsets: {
          up: [164, 178],
          down: [36, 50],
          left: [228, 242],
          right: [100, 114],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
      // take damage
      hurt: {
        offsets: {
          up: [179, 184],
          down: [51, 56],
          left: [243, 248],
          right: [115, 120],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
      // die
      die: {
        offsets: {
          up: [185, 191],
          down: [57, 63],
          left: [249, 255],
          right: [121, 127],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
      },
      // bump
      bump: {
        offsets: {
          up: [272, 279],
          down: [256, 263],
          left: [280, 287],
          right: [264, 271],
        },
        prefix: 'ShadowCreeper_2016_',
        zeroPad: 3,
        destination: 'idle',
      },
    };

    this.registerAnimations(animations, frameRate, 'creeper');

    // initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;
    console.log('creating player', this.facing);
    this.play('idle');
  }
}

export default Creeper;
