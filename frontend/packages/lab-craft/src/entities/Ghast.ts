import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';
import {randomInt} from '../utils';

class Ghast extends BaseEntity {
  protected audioDelay: number;

  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'ghast';
    this.offset = [20, -20];
    this.prepareSprite();
    this.sprite?.setDepth(Number.MAX_SAFE_INTEGER);
    this.audioDelay = 15;

    if (x < 5) {
      this.patrolA();
    } else {
      this.patrolB();
    }
  }

  prepareSprite() {
    const frameRate = 12;
    const randomPauseMin = 0.2;
    const randomPauseMax = 1;

    const randomDelay: () => number = () =>
      (Math.random() * (randomPauseMax - randomPauseMin) + randomPauseMin) *
      1000;

    const actionGroup = this.scene.levelView.airGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'ghast');
    actionGroup.add(this.sprite);

    const frameName = 'Ghast';

    const animations = {
      idle: {
        offsets: {
          up: [72, 83],
          down: [24, 35],
          left: [0, 11],
          right: [48, 59],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
        onComplete: () => {
          if (this.audioDelay > 0) {
            this.audioDelay--;
          } else {
            this.audioDelay = 5;
            const chance = Math.floor(Math.random() * 5);
            if (chance === 0) {
              const soundNum = Math.floor(Math.random() * 4);
              this.playMoan(soundNum);
            }
          }
        },
      },
      shoot: {
        offsets: {
          up: [84, 95],
          down: [36, 47],
          left: [12, 23],
          right: [60, 71],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'shoot_2',
        destinationDelay: randomDelay,
      },
      shoot_2: {
        offsets: {
          up: [95, 84],
          down: [47, 36],
          left: [23, 12],
          right: [71, 60],
        },
        prefix: frameName,
        zeroPad: 4,
        destination: 'idle',
      },
    };

    // initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;

    this.registerAnimations(animations, frameRate, 'ghast');
    this.play('idle');
  }

  canMoveThrough(): boolean {
    return true;
  }

  playMoan(index: number) {
    switch (index) {
      case 0:
        this.scene.audioPlayer.play('moan2');
        break;
      case 1:
        this.scene.audioPlayer.play('moan3');
        break;
      case 2:
        this.scene.audioPlayer.play('moan6');
        break;
      default:
        this.scene.audioPlayer.play('moan7');
        break;
    }
  }

  patrolA() {
    const tweenY = this.scene.tweens.add({
      targets: this.sprite,
      y: this.offset[1] + 40 * this.position.y + 80,
      ease: 'Sine.InOut',
      repeat: -1,
      yoyo: true,
      duration: randomInt(2500, 3500),
    });

    const tweenX = this.scene.tweens.add({
      targets: this.sprite,
      x: this.offset[0] + 40 * this.position.x + 10,
      ease: 'Sine.InOut',
      repeat: -1,
      yoyo: true,
      duration: randomInt(1500, 2000),
    });

    tweenX.play();
    tweenY.play();
  }

  patrolB() {
    const tweenY = this.scene.tweens.add({
      targets: this.sprite,
      y: this.offset[1] + 40 * this.position.y - 80,
      ease: 'Sine.InOut',
      repeat: -1,
      yoyo: true,
      duration: randomInt(2500, 3500),
    });

    const tweenX = this.scene.tweens.add({
      targets: this.sprite,
      x: this.offset[0] + 40 * this.position.x - 10,
      ease: 'Sine.InOut',
      repeat: -1,
      yoyo: true,
      duration: randomInt(1500, 2000),
    });

    tweenX.play();
    tweenY.play();
  }
}

export default Ghast;
