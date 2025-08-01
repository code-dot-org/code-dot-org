import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class IronGolem extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'ironGolem';
    this.offset = [22, 6];
    this.prepareSprite();
    this.sprite?.setDepth(this.position.y);
  }

  prepareSprite() {
    const frameRate = 8;
    const randomPauseMin = 0.2;
    const randomPauseMax = 1;

    const randomDelay: () => number = () =>
      (Math.random() * (randomPauseMax - randomPauseMin) + randomPauseMin) *
      1000;

    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'ironGolem');
    actionGroup.add(this.sprite);

    const frameName = 'Iron_Golem_Anims';
    const idleDelayFrame = 12;
    const randomIdle: string[] = [
      'idle',
      'lookLeft',
      'lookRight',
      'lookDown',
      'lookAtCam',
      'eat',
    ];

    const animations = {
      idle: {
        offsets: {
          up: [45, 45],
          down: [1, 1],
          left: [89, 89],
          right: [133, 133],
        },
        prefix: frameName,
        zeroPad: 3,
        delay: idleDelayFrame,
        destination: randomIdle,
      },
      // look left sequence ( look left -> pause for random time -> look front -> idle)
      lookLeft: {
        offsets: {
          up: [46, 48],
          down: [2, 4],
          left: [90, 92],
          right: [134, 136],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookLeft_2',
        destinationDelay: randomDelay,
      },
      lookLeft_2: {
        offsets: {
          up: [48, 46],
          down: [4, 2],
          left: [92, 90],
          right: [136, 134],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look right sequence ( look right -> pause for random time -> look front -> idle)
      lookRight: {
        offsets: {
          up: [50, 52],
          down: [6, 8],
          left: [94, 96],
          right: [138, 140],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookRight_2',
        destinationDelay: randomDelay,
      },
      lookRight_2: {
        offsets: {
          up: [52, 50],
          down: [8, 6],
          left: [96, 94],
          right: [140, 138],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look up sequence ( look up -> pause for random time -> look front -> play random idle)
      lookAtCam: {
        offsets: {
          up: [58, 60],
          down: [14, 16],
          left: [102, 104],
          right: [146, 148],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookAtCam_2',
        destinationDelay: randomDelay,
      },
      lookAtCam_2: {
        offsets: {
          up: [60, 58],
          down: [16, 14],
          left: [104, 102],
          right: [148, 146],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look down
      lookDown: {
        offsets: {
          up: [54, 56],
          down: [10, 12],
          left: [98, 100],
          right: [142, 144],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookDown_2',
        destinationDelay: randomDelay,
      },
      lookDown_2: {
        offsets: {
          up: [56, 54],
          down: [12, 10],
          left: [100, 98],
          right: [144, 142],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // walk
      walk: {
        offsets: {
          up: [62, 70],
          down: [18, 26],
          left: [106, 114],
          right: [150, 158],
        },
        prefix: frameName,
        zeroPad: 3,
        repeat: true,
      },
      // attack
      attack: {
        offsets: {
          up: [71, 74],
          down: [27, 30],
          left: [115, 118],
          right: [159, 162],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // take damage
      hurt: {
        offsets: {
          up: [77, 81],
          down: [33, 37],
          left: [121, 125],
          right: [165, 169],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // die
      die: {
        offsets: {
          up: [82, 88],
          down: [38, 44],
          left: [126, 132],
          right: [170, 176],
        },
        prefix: frameName,
        fps: (frameRate * 2) / 3,
        zeroPad: 3,
      },
      // bump
      bump: {
        offsets: {
          up: [185, 192],
          down: [177, 184],
          left: [193, 200],
          right: [201, 207],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
    };

    // initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;

    this.registerAnimations(animations, frameRate, 'ironGolem');
    this.play('idle');
  }
}

export default IronGolem;
