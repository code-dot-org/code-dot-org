import type BaseCommand from '../BaseCommand';
import BaseEntity from '../BaseEntity';
import CallbackCommand from '../commands/CallbackCommand';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';
import type Position from '../Position';

class Zombie extends BaseEntity {
  burningSprite: [
    Phaser.GameObjects.Sprite | undefined,
    Phaser.GameObjects.Sprite | undefined
  ];
  burningSpriteGhost: [
    Phaser.GameObjects.Sprite | undefined,
    Phaser.GameObjects.Sprite | undefined
  ];
  burningSpriteOffset: [number, number];

  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'zombie';
    this.offset = [22, 6];

    this.burningSprite = [undefined, undefined];
    this.burningSpriteGhost = [undefined, undefined];
    this.burningSpriteOffset = [47, 40];
    this.prepareSprite();
    this.sprite?.setDepth(this.position.y);
  }

  reset() {
    for (const sprite of this.burningSprite) {
      sprite?.destroy();
    }
  }

  playMoveForwardAnimation(
    position: Position,
    facing: Direction,
    commandQueueItem: BaseCommand,
    groundType: string,
  ) {
    super.playMoveForwardAnimation(
      position,
      facing,
      commandQueueItem,
      groundType,
    );

    this.burningSprite[0]?.setDepth(this.position.y + 1);
    this.burningSprite[1]?.setDepth(this.position.y - 1);

    // smooth movement using tween
    setTimeout(() => {
      // tween for burning animation
      for (let i = 0; i < 2; i++) {
        const tween = this.scene.tweens.add({
          targets: this.burningSprite[i],
          x: this.offset[0] + this.burningSpriteOffset[0] + (40 * position.x),
          y: this.offset[1] + this.burningSpriteOffset[1] + (40 * position.y),
          duration: 300,
          easing: 'Linear',
        });
        this.scene.levelView.addResettableTween(tween);
        tween.play();
      }
    }, 50 / this.scene.tweenTimeScale);
  }

  setBurn(burn: boolean) {
    for (const sprite of this.burningSprite) {
      sprite?.setVisible(burn);
    }
  }

  prepareSprite() {
    const frameRate = 10;
    const randomPauseMin = 0.2;
    const randomPauseMax = 1;

    const randomDelay: () => number = () =>
      (Math.random() * (randomPauseMax - randomPauseMin) + randomPauseMin) *
      1000;

    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'cow');
    actionGroup.add(this.sprite);

    const frameName = 'Zombie_';
    const idleDelayFrame = 8;
    const randomIdle: string[] = [
      'idle',
      'lookLeft',
      'lookRight',
      'lookDown',
      'lookAtCam',
    ];

    // Add burning sprite
    this.burningSprite = [
      this.scene.add.sprite(0, 0, 'burningInSun'),
      this.scene.add.sprite(0, 0, 'burningInSun'),
    ];

    const animations = {
      burnFront: {
        offsets: {
          up: [1, 15],
          down: [1, 15],
          left: [1, 15],
          right: [1, 15],
        },
        atlas: 'burningInSun',
        prefix: 'BurningFront_',
        zeroPad: 3,
        fps: frameRate,
        repeat: true,
      },
      burnBehind: {
        offsets: {
          up: [1, 15],
          down: [1, 15],
          left: [1, 15],
          right: [1, 15],
        },
        atlas: 'burningInSun',
        prefix: 'BurningBehind_',
        zeroPad: 3,
        fps: frameRate,
        repeat: true,
      },
      idle: {
        offsets: {
          up: [73, 79],
          down: [18, 24],
          left: [128, 134],
          right: [183, 189],
        },
        prefix: frameName,
        zeroPad: 3,
        delay: idleDelayFrame,
        delayFrame: {
          up: 56,
          down: 1,
          left: 111,
          right: 166,
        },
        destination: randomIdle,
      },
      // look left sequence ( look left -> pause for random time -> look front -> idle)
      lookLeft: {
        offsets: {
          up: [57, 59],
          down: [2, 4],
          left: [112, 114],
          right: [167, 169],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookLeft_2',
        destinationDelay: randomDelay,
      },
      lookLeft_2: {
        offsets: {
          up: [59, 57],
          down: [4, 2],
          left: [114, 112],
          right: [169, 167],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look right sequence ( look right -> pause for random time -> look front -> idle)
      lookRight: {
        offsets: {
          up: [61, 63],
          down: [6, 8],
          left: [116, 118],
          right: [171, 173],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookRight_2',
        destinationDelay: randomDelay,
      },
      lookRight_2: {
        offsets: {
          up: [63, 61],
          down: [8, 6],
          left: [118, 116],
          right: [171, 173],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look up sequence ( look up -> pause for random time -> look front -> play random idle)
      lookAtCam: {
        offsets: {
          up: [69, 71],
          down: [14, 16],
          left: [124, 126],
          right: [179, 181],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookAtCam_2',
        destinationDelay: randomDelay,
      },
      lookAtCam_2: {
        offsets: {
          up: [71, 69],
          down: [16, 14],
          left: [126, 124],
          right: [181, 179],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look down
      lookDown: {
        offsets: {
          up: [65, 67],
          down: [10, 12],
          left: [120, 122],
          right: [175, 177],
        },
        prefix: frameName,
        zeroPad: 3,
        fps: frameRate / 3,
        destination: 'idle',
      },
      // walk
      walk: {
        offsets: {
          up: [80, 88],
          down: [25, 33],
          left: [135, 143],
          right: [190, 198],
        },
        prefix: frameName,
        zeroPad: 3,
        repeat: true,
      },
      // attack
      attack: {
        offsets: {
          up: [89, 91],
          down: [34, 36],
          left: [144, 146],
          right: [199, 201],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // take damage
      hurt: {
        offsets: {
          up: [93, 101],
          down: [38, 46],
          left: [148, 156],
          right: [203, 211],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // die
      die: {
        offsets: {
          up: [102, 110],
          down: [47, 55],
          left: [158, 165],
          right: [212, 220],
        },
        prefix: frameName,
        zeroPad: 3,
      },
      // bump
      bump: {
        offsets: {
          up: [229, 236],
          down: [221, 228],
          left: [237, 244],
          right: [245, 252],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
    };

    // initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;

    this.registerAnimations(animations, frameRate, 'zombie');
    this.play('idle');

    // Add burning animations
    this.burningSprite[0]?.anims.play('zombie-burnFront-up');
    this.burningSprite[1]?.anims.play('zombie-burnBehind-up');

    // Set burn
    this.setBurn(this.scene.levelModel.isDaytime);
  }

  takeDamage(callbackCommand: CallbackCommand) {
    const levelView = this.scene.levelView;
    const facingName = levelView.getDirectionName(this.facing);
    if (this.healthPoint > 1) {
      this.sprite?.anims.play(`hurt-${facingName}`);
      setTimeout(() => {
        this.healthPoint--;
        callbackCommand.succeeded();
      }, 1500 / this.scene.tweenTimeScale);
    } else {
      this.healthPoint--;
      this.sprite?.anims.play(`die-${facingName}`);
      setTimeout(() => {
        const tween = this.scene.tweens.add({
          targets: this.sprite,
          alpha: 0,
          duration: 500,
          easing: 'Linear',
          onComplete: () => {
            this.scene.levelEntity.destroyEntity(this.identifier);
          },
        });
        this.scene.levelView.addResettableTween(tween);
        tween.play();

        for (let i = 0; i < 2; i++) {
          const tween = this.scene.tweens.add({
            targets: this.burningSprite[i],
            alpha: 0,
            duration: 500,
            easing: 'Linear',
          });
          this.scene.levelView.addResettableTween(tween);
          tween.play();
        }
      }, 1500 / this.scene.tweenTimeScale);
    }
  }
}

export default Zombie;
