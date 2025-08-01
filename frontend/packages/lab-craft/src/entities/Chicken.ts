import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Chicken extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'chicken';
    this.offset = [22, 14];
    this.prepareSprite();
    this.sprite?.setDepth(this.position.y);
  }

  prepareSprite() {
    const frameRate = 12;
    const randomPauseMin = 0.2;
    const randomPauseMax = 1;

    const randomDelay: () => number = () =>
      (Math.random() * (randomPauseMax - randomPauseMin) + randomPauseMin) *
      1000;

    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'chicken');
    this.sprite.setScale(0.75, 0.75);
    actionGroup.add(this.sprite);

    const frameName = 'chicken';
    const idleDelayFrame = 8;
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
          up: [259, 275],
          down: [37, 53],
          left: [370, 386],
          right: [148, 164],
        },
        prefix: frameName,
        zeroPad: 4,
        delay: idleDelayFrame,
        delayFrame: {
          up: 222,
          down: 1,
          left: 333,
          right: 111,
        },
        destination: randomIdle,
      },
      // look left sequence ( look left -> pause for random time -> look front -> idle)
      lookLeft: {
        offsets: {
          up: [225, 227],
          down: [3, 5],
          left: [336, 338],
          right: [114, 116],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'lookLeft_2',
        destinationDelay: randomDelay,
      },
      lookLeft_2: {
        offsets: {
          up: [227, 225],
          down: [5, 3],
          left: [338, 336],
          right: [116, 114],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
      // look right sequence ( look right -> pause for random time -> look front -> idle)
      lookRight: {
        offsets: {
          up: [224, 226],
          down: [12, 14],
          left: [335, 337],
          right: [113, 115],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'lookRight_2',
        destinationDelay: randomDelay,
      },
      lookRight_2: {
        offsets: {
          up: [226, 224],
          down: [14, 12],
          left: [337, 335],
          right: [115, 113],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
      // look up sequence ( look up -> pause for random time -> look front -> play random idle)
      lookAtCam: {
        offsets: {
          up: [285, 287],
          down: [63, 65],
          left: [396, 398],
          right: [174, 176],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'lookAtCam_2',
        destinationDelay: randomDelay,
      },
      lookAtCam_2: {
        offsets: {
          up: [287, 285],
          down: [65, 63],
          left: [398, 396],
          right: [176, 174],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
      // look down
      lookDown: {
        offsets: {
          up: [276, 281],
          down: [54, 59],
          left: [387, 392],
          right: [165, 170],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
      // walk
      walk: {
        offsets: {
          up: [291, 302],
          down: [69, 80],
          left: [402, 413],
          right: [180, 191],
        },
        prefix: frameName,
        zeroPad: 4,
        repeat: true,
      },
      // attack
      attack: {
        offsets: {
          up: [303, 313],
          down: [81, 91],
          left: [414, 424],
          right: [192, 202],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
      // take damage
      hurt: {
        offsets: {
          up: [314, 326],
          down: [92, 104],
          left: [425, 437],
          right: [203, 215],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
      // die
      die: {
        offsets: {
          up: [327, 332],
          down: [105, 110],
          left: [438, 443],
          right: [216, 221],
        },
        prefix: frameName,
        zeroPad: 4,
      },
      // eat
      eat: {
        offsets: {
          up: [240, 249],
          down: [18, 27],
          left: [351, 360],
          right: [129, 138],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'eat_2',
        destinationDelay: randomDelay,
      },
      eat_2: {
        offsets: {
          up: [249, 240],
          down: [27, 18],
          left: [360, 351],
          right: [138, 129],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
      // bump
      bump: {
        offsets: {
          up: [460, 467],
          down: [444, 451],
          left: [468, 475],
          right: [452, 459],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
    };

    // initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;

    this.registerAnimations(animations, frameRate, 'chicken');
    this.play('idle');
  }
}

export default Chicken;
