import type BaseCommand from '../BaseCommand';
import BaseEntity from '../BaseEntity';
import CallbackCommand from '../commands/CallbackCommand';
import {EventType} from '../events';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Sheep extends BaseEntity {
  protected naked: boolean = false;

  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'sheep';
    this.offset = [23, 8];
    if (this.scene.levelView) {
      this.prepareSprite();
      this.sprite?.setDepth(this.scene.levelView.yToIndex(this.position.y));
    }
  }

  use(commandQueueItem: BaseCommand, userEntity: BaseEntity) {
    const animationName = `${this.getNakedSuffix()}lookAtCam-${this.scene.levelView.getDirectionName(this.facing)}`;
    this.sprite?.anims.play(animationName);
    this.queue.startPushHighPriorityCommands();
    this.scene.events.emit(EventType.WhenUsed, {
      targetType: this.type,
      eventSenderIdentifier: userEntity.identifier,
      targetIdentifier: this.identifier,
    })
    this.queue.endPushHighPriorityCommands();
    commandQueueItem.succeeded();
  }

  bump(commandQueueItem: BaseCommand) {
    this.play('bump');

    const forwardPosition = this.scene.levelModel.getMoveForwardPosition(this);
    const forwardEntity = this.scene.levelEntity.getEntityAt(forwardPosition);

    if (forwardEntity) {
      this.queue.startPushHighPriorityCommands();
      this.scene.events.emit(EventType.WhenTouched, {
        targetType: this.type,
        targetIdentifier: this.identifier,
        eventSenderIdentifier: forwardEntity.identifier,
      });
      this.queue.endPushHighPriorityCommands();
    }

    this.scene.delayPlayerMoveBy(400, 800, () => {
      commandQueueItem.succeeded();
    });
  }

  prepareSprite() {
    const frameRate = 10;
    const randomPauseMin = 0.2;
    const randomPauseMax = 1;

    const randomDelay: () => number = () =>
      (Math.random() * (randomPauseMax - randomPauseMin) + randomPauseMin) *
      1000;

    const actionGroup = this.scene.levelView.actionGroup;
    this.sprite = this.scene.add.sprite(0, 0, 'sheep');
    actionGroup.add(this.sprite);

    const frameName = 'ShadowSheep_2016';
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
          up: [252, 261],
          down: [36, 45],
          left: [360, 369],
          right: [144, 153],
        },
        prefix: frameName,
        zeroPad: 3,
        delay: idleDelayFrame,
        delayFrame: {
          up: 217,
          down: 1,
          left: 325,
          right: 109,
        },
        destination: randomIdle,
      },
      // look left sequence ( look left -> pause for random time -> look front -> idle)
      lookLeft: {
        offsets: {
          up: [220, 222],
          down: [3, 6],
          left: [328, 330],
          right: [112, 114],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookLeft_2',
        destinationDelay: randomDelay,
      },
      lookLeft_2: {
        offsets: {
          up: [222, 220],
          down: [6, 3],
          left: [330, 328],
          right: [114, 112],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look right sequence ( look right -> pause for random time -> look front -> idle)
      lookRight: {
        offsets: {
          up: [228, 231],
          down: [12, 15],
          left: [336, 339],
          right: [120, 123],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookRight_2',
        destinationDelay: randomDelay,
      },
      lookRight_2: {
        offsets: {
          up: [231, 228],
          down: [15, 12],
          left: [339, 336],
          right: [123, 120],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look up sequence ( look up -> pause for random time -> look front -> play random idle)
      lookAtCam: {
        offsets: {
          up: [276, 279],
          down: [60, 63],
          left: [384, 387],
          right: [168, 171],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'lookAtCam_2',
        destinationDelay: randomDelay,
      },
      lookAtCam_2: {
        offsets: {
          up: [279, 276],
          down: [63, 60],
          left: [387, 384],
          right: [171, 168],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // look down
      lookDown: {
        offsets: {
          up: [270, 275],
          down: [54, 59],
          left: [378, 383],
          right: [162, 167],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // walk
      walk: {
        offsets: {
          up: [282, 293],
          down: [66, 77],
          left: [390, 401],
          right: [174, 185],
        },
        prefix: frameName,
        zeroPad: 3,
        repeat: true,
      },
      // attack
      attack: {
        offsets: {
          up: [294, 305],
          down: [78, 89],
          left: [402, 413],
          right: [186, 197],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // take damage
      hurt: {
        offsets: {
          up: [306, 317],
          down: [90, 101],
          left: [414, 425],
          right: [198, 209],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // die
      die: {
        offsets: {
          up: [318, 323],
          down: [102, 108],
          left: [426, 431],
          right: [210, 215],
        },
        prefix: frameName,
        zeroPad: 3,
      },
      // eat
      eat: {
        offsets: {
          up: [234, 243],
          down: [18, 26],
          left: [342, 351],
          right: [126, 135],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // bump
      bump: {
        offsets: {
          up: [880, 887],
          down: [864, 871],
          left: [888, 895],
          right: [872, 879],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
      },
      // idle (naked)
      naked_idle: {
        offsets: {
          up: [684, 693],
          down: [468, 477],
          left: [792, 801],
          right: [576, 585],
        },
        prefix: frameName,
        zeroPad: 3,
        delay: idleDelayFrame,
        delayFrame: {
          up: 649,
          down: 433,
          left: 757,
          right: 541,
        },
        destination: randomIdle,
      },
      // look left sequence ( look left -> pause for random time -> look front -> idle)
      naked_lookLeft: {
        offsets: {
          up: [652, 654],
          down: [436, 438],
          left: [760, 762],
          right: [544, 546],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_lookLeft_2',
        destinationDelay: randomDelay,
      },
      naked_lookLeft_2: {
        offsets: {
          up: [654, 652],
          down: [438, 436],
          left: [762, 760],
          right: [546, 544],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_idle',
      },
      // look right sequence ( look right -> pause for random time -> look front -> idle)
      naked_lookRight: {
        offsets: {
          up: [660, 663],
          down: [447, 444],
          left: [768, 771],
          right: [552, 555],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_lookRight_2',
        destinationDelay: randomDelay,
      },
      naked_lookRight_2: {
        offsets: {
          up: [663, 660],
          down: [447, 444],
          left: [771, 768],
          right: [555, 552],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_idle',
      },
      // look up sequence ( look up -> pause for random time -> look front -> play random idle)
      naked_lookAtCam: {
        offsets: {
          up: [708, 711],
          down: [492, 495],
          left: [816, 819],
          right: [600, 603],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_lookAtCam_2',
        destinationDelay: randomDelay,
      },
      naked_lookAtCam_2: {
        offsets: {
          up: [711, 708],
          down: [495, 492],
          left: [819, 816],
          right: [603, 600],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_idle',
      },
      // look down
      naked_lookDown: {
        offsets: {
          up: [702, 707],
          down: [486, 491],
          left: [810, 815],
          right: [594, 599],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_idle',
      },
      // walk
      naked_walk: {
        offsets: {
          up: [714, 725],
          down: [498, 509],
          left: [822, 833],
          right: [606, 617],
        },
        prefix: frameName,
        zeroPad: 3,
        repeat: true,
      },
      // attack
      naked_attack: {
        offsets: {
          up: [726, 737],
          down: [510, 521],
          left: [834, 845],
          right: [618, 629],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_idle',
      },
      // take damage
      naked_hurt: {
        offsets: {
          up: [738, 749],
          down: [522, 533],
          left: [846, 857],
          right: [630, 641],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_idle',
      },
      // die
      naked_die: {
        offsets: {
          up: [750, 755],
          down: [534, 539],
          left: [858, 863],
          right: [642, 647],
        },
        prefix: frameName,
        zeroPad: 3,
      },
      // eat
      naked_eat: {
        offsets: {
          up: [666, 675],
          down: [450, 459],
          left: [774, 783],
          right: [558, 567],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'idle',
        onComplete: () => {
          this.naked = false;
        },
      },
      // bump
      naked_bump: {
        offsets: {
          up: [912, 919],
          down: [896, 903],
          left: [920, 927],
          right: [904, 911],
        },
        prefix: frameName,
        zeroPad: 3,
        destination: 'naked_idle',
      },
    };

    // initialize
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;

    this.registerAnimations(animations, frameRate, 'sheep');
    this.play('idle');
  }

  attack(commandQueueItem: BaseCommand) {
    const facingName = this.scene.levelView.getDirectionName(this.facing);
    this.sprite?.on(
      `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${this.getNakedSuffix()}attack-${facingName}`,
      () => {
        const frontEntity = this.scene.levelEntity.getEntityAt(
          this.scene.levelModel.getMoveForwardPosition(this),
        );
        if (frontEntity) {
          this.sprite?.on(
            `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${this.getNakedSuffix()}hurt-${facingName}`,
            () => {
              this.scene.events.emit(EventType.WhenAttacked, {
                targetType: this.type,
                eventSenderIdentifier: this.identifier,
                targetIdentifier: frontEntity.identifier,
              });
            },
          );
          this.sprite?.anims.play(`${this.getNakedSuffix()}hurt-${facingName}`);
        }
        commandQueueItem.succeeded();
      },
    );
    this.sprite?.anims.play(`${this.getNakedSuffix()}attack-${facingName}`);
  }

  updateAnimationDirection() {
    const facingName = this.scene.levelView.getDirectionName(this.facing);
    this.sprite?.anims.play(`${this.getNakedSuffix()}idle-${facingName}`);
  }

  drop(commandQueueItem: BaseCommand, itemType: string): boolean {
    if (this.naked) {
      return false;
    }

    if (commandQueueItem) {
      super.drop(commandQueueItem, itemType);
    }

    if (itemType === 'wool') {
      // default behavior for drop ?
      this.naked = true;
      this.play('idle');
    }

    return true;
  }

  takeDamage(callbackCommand: CallbackCommand) {
    if (this.healthPoint > 1) {
      this.play('hurt');

      setTimeout(() => {
        this.healthPoint--;
        callbackCommand.succeeded();
      }, 1500);
    } else {
      this.healthPoint--;
      this.stop();
      this.play('die');
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
      }, 1500);
    }
  }

  getNakedSuffix(): string {
    return this.naked ? 'sheep-naked_' : 'sheep-';
  }
}

export default Sheep;
