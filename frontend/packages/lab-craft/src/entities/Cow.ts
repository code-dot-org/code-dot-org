import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Cow extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'cow';
    this.offset = [22, 6];
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
    this.sprite = this.scene.add.sprite(0, 0, 'cow');
    actionGroup.add(this.sprite);

    const frameName = 'Cow';
    const idleDelayFrame = 20;
    const randomIdle: string[] = [
      'idle',
      'lookLeft',
      'lookRight',
      'lookDown',
      'lookAtCam',
    ];

    const animations = {
      idle: {
        offsets: {
          up: [222, 222],
          down: [1, 1],
          left: [333, 333],
          right: [111, 111],
        },
        prefix: frameName,
        zeroPad: 4,
        delay: idleDelayFrame,
        destination: 'idle_2',
      },
      idle_2: {
        offsets: {
          up: [276, 282],
          down: [51, 54],
          left: [387, 393],
          right: [165, 171],
        },
        prefix: frameName,
        zeroPad: 4,
        fps: {
          up: frameRate,
          down: frameRate / 2,
          left: frameRate,
          right: frameRate,
        },
        destination: 'idle_2_reverse',
      },
      idle_2_reverse: {
        offsets: {
          up: [282, 276],
          down: [54, 51],
          left: [393, 387],
          right: [171, 165],
        },
        prefix: frameName,
        zeroPad: 4,
        fps: {
          up: frameRate,
          down: frameRate / 2,
          left: frameRate,
          right: frameRate,
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
          right: [129, 130],
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
          right: [130, 129],
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
          up: [240, 241],
          down: [18, 19],
          left: [351, 352],
          right: [129, 130],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'lookDown_2',
        destinationDelay: randomDelay,
      },
      lookDown_2: {
        offsets: {
          up: [241, 240],
          down: [19, 18],
          left: [352, 351],
          right: [130, 129],
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
    };

    // initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;

    this.registerAnimations(animations, frameRate, 'cow');
    this.play('idle');
  }
}

export default Cow;
