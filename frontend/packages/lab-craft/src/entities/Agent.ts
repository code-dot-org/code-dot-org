import type BaseCommand from '../BaseCommand';
import BaseEntity, {Animations, CanPlace} from '../BaseEntity';
import CallbackCommand from '../commands/CallbackCommand';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';
import type LevelBlock from '../level/LevelBlock';
import Position from '../Position';

class Agent extends BaseEntity {
  inventory: {
    // Every item has a name and then a count
    [key: string]: number;
  } = {};
  playerName: string = 'Steve';
  name: string;
  moveDelayMin: number;
  moveDelayMax: number;
  lastMovement: number = 0;
  movementState: number = -1;

  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
    isOnBlock: boolean,
    name: string,
  ) {
    super(scene, type, 'PlayerAgent', x, y, facing);

    this.name = name;
    this.entityName = 'playerAgent';
    this.offset = [20, 14];
    this.isOnBlock = isOnBlock;
    this.inventory = {};
    this.movementState = -1;

    this.moveDelayMin = 20;
    this.moveDelayMax = 150;

    if (scene.levelView) {
      this.prepareSprite();
      this.sprite?.setDepth(this.position.y);
    }
  }

  prepareSprite() {
    this.sprite = this.scene.add.sprite(0, 0, `player${this.playerName}`);
    const actionGroup = this.scene.levelView.actionGroup;
    actionGroup.add(this.sprite);

    const frameRate = 20;

    const atlas = 'playerAgent';
    const idleFrameRate = 10;
    const randomIdle: string[] = ['idle', 'lookLeft', 'lookRight', 'lookAtCam'];

    const animations: Animations = {
      idle: {
        offsets: {
          upFrames: [121, 123, 121, 127, 129, 127],
          downFrames: [1, 3, 1, 7, 9, 7],
          leftFrames: [181, 183, 181, 187, 189, 187],
          rightFrames: [61, 63, 61, 67, 69, 67],
        },
        prefix: 'Player_',
        fps: frameRate / 3,
        delay: 5,
        destination: randomIdle,
      },
      lookLeft: {
        offsets: {
          up: [126, 125],
          down: [6, 5],
          left: [186, 185],
          right: [66, 65],
        },
        prefix: 'Player_',
        delay: 5,
        fps: idleFrameRate,
        destination: 'idlePause',
      },
      lookRight: {
        offsets: {
          up: [132, 131],
          down: [12, 11],
          left: [192, 191],
          right: [72, 71],
        },
        prefix: 'Player_',
        delay: 5,
        fps: idleFrameRate,
        destination: 'idlePause',
      },
      idlePause: {
        offsets: {
          up: [121, 121],
          down: [1, 1],
          left: [181, 181],
          right: [61, 61],
        },
        prefix: 'Player_',
        delay: 12,
        fps: frameRate / 3,
        destination: randomIdle,
      },
      walk: {
        offsets: {
          up: [133, 140],
          down: [13, 20],
          left: [193, 200],
          right: [73, 80],
        },
        prefix: 'Player_',
        repeat: true,
      },
      punch: {
        offsets: {
          up: [141, 144],
          down: [21, 24],
          left: [201, 204],
          right: [81, 84],
        },
        prefix: 'Player_',
        completeSound: 'punch',
      },
      punchDestroy: {
        offsets: {
          up: [141, 144],
          down: [21, 24],
          left: [201, 204],
          right: [81, 84],
        },
        prefix: 'Player_',
        repeat: 2,
      },
      hurt: {
        offsets: {
          up: [145, 148],
          down: [25, 28],
          left: [205, 208],
          right: [85, 88],
        },
        prefix: 'Player_',
        destination: 'idlePause',
      },
      crouch: {
        offsets: {
          up: [149, 152],
          down: [29, 32],
          left: [209, 212],
          right: [89, 92],
        },
        prefix: 'Player_',
        repeat: true,
      },
      jumpUp: {
        offsets: {
          up: [153, 156],
          down: [33, 36],
          left: [213, 216],
          right: [93, 96],
        },
        prefix: 'Player_',
        repeat: true,
      },
      fail: {
        offsets: {
          up: [165, 168],
          down: [45, 48],
          left: [225, 228],
          right: [105, 108],
        },
        prefix: 'Player_',
      },
      celebrate: {
        // Just explicit frames for every direction
        frames: [
          1,
          1,
          1,
          1,
          1,
          1, // Face down
          259,
          260, // Crouch left
          261,
          297,
          298,
          297,
          261, // Jump
          261,
          297,
          298,
          297,
          261, // Jump
          1,
          1,
          1,
          1,
          1, // Pause
          261,
          297,
          298,
          297,
          261, // Jump
          261,
          297,
          298,
          297,
          261, // Jump
        ],
        prefix: 'Player_',
        fps: frameRate / 2,
      },
      bump: {
        offsets: {
          up: [169, 174],
          down: [49, 54],
          left: [229, 234],
          right: [109, 114],
        },
        prefix: 'Player_',
        sound: 'bump',
      },
      jumpDown: {
        offsets: {
          up: [175, 180],
          down: [55, 60],
          left: [235, 240],
          right: [115, 120],
        },
        prefix: 'Player_',
        repeat: true,
      },
      lookAtCam: {
        offsets: {
          up: [277, 276],
          down: [263, 262],
          left: [284, 283],
          right: [270, 269],
        },
        prefix: 'Player_',
        fps: idleFrameRate,
        delay: 5,
        destination: 'idlePause',
      },
      mine: {
        offsets: {
          up: [249, 252],
          down: [241, 244],
          left: [253, 256],
          right: [245, 248],
        },
        prefix: 'Player_',
        repeat: true,
      },
      mineCart: {
        offsets: {
          up: [9, 9],
          down: [5, 5],
          left: [11, 11],
          right: [7, 7],
        },
        prefix: 'Minecart_',
        zeroPad: 2,
      },
      mineCart_turnleft: {
        offsets: {
          up: [10, 10],
          down: [6, 6],
        },
        prefix: 'Minecart_',
        zeroPad: 2,
      },
      mineCart_turnright: {
        offsets: {
          up: [8, 8],
          down: [12, 12],
        },
        prefix: 'Minecart_',
        zeroPad: 2,
      },
      'underwater-walk': {
        offsets: {
          up: [314, 317],
          down: [300, 303],
          left: [307, 310],
          right: [321, 324],
        },
        prefix: 'Player_',
        fps: frameRate / 2,
        repeat: true,
      },
      'underwater-bump': {
        offsets: {
          up: [345, 350],
          down: [327, 332],
          left: [333, 338],
          right: [339, 344],
        },
        prefix: 'Player_',
        sound: 'bump',
      },
      'underwater-punch': {
        offsets: {
          up: [360, 362],
          down: [351, 353],
          left: [354, 356],
          right: [357, 359],
        },
        prefix: 'Player_',
        sound: 'punch',
      },
      'boat-idle': {
        offsets: {
          up: [21, 21],
          down: [9, 9],
          left: [15, 15],
          right: [27, 27],
        },
        prefix: 'Boat_',
        zeroPad: 2,
        repeat: true,
      },
      'boat-walk': {
        offsets: {
          up: [21, 25],
          down: [9, 13],
          left: [15, 19],
          right: [27, 31],
        },
        prefix: 'Boat_',
        zeroPad: 2,
        repeat: true,
      },
      'boat-celebrate': {
        // Just explicit frames for every direction
        frames: [49, 50, 49, 50, 49],
        prefix: 'Boat_',
        zeroPad: 2,
        fps: frameRate / 2,
      },
      'boat-bump': {
        offsets: {
          up: [69, 74],
          down: [51, 56],
          left: [63, 68],
          right: [57, 62],
        },
        prefix: 'Boat_',
        zeroPad: 2,
      },
    };

    this.registerAnimations(animations, frameRate, atlas);
  }

  canPlaceBlockOver(
    toPlaceBlock: LevelBlock,
    onTopOfBlock: LevelBlock,
  ): CanPlace {
    const result: CanPlace = {
      canPlace: false,
      plane: '',
    };

    if (onTopOfBlock.getIsLiquid()) {
      if (toPlaceBlock.getIsPlaceableInLiquid()) {
        result.canPlace = true;
        result.plane = 'groundPlane';
      }
    } else {
      if (toPlaceBlock.isWalkable) {
        result.canPlace = true;
        result.plane = 'actionPlane';
      }
    }

    return result;
  }

  canPlaceBlock(block: LevelBlock): boolean {
    return block.isEmpty;
  }

  canMoveThrough(): boolean {
    return true;
  }

  /**
   * Give agent a higher-than-normal offset so that it will always render on top
   * of the player when on the same cell.
   */
  getSortOrderOffset(): number {
    return super.getSortOrderOffset() - 1;
  }

  // "Events" levels allow the player to move around with the arrow keys, and
  // perform actions with the space bar.
  updateMovement() {
    if (!this.scene.attemptRunning || !this.scene.getIsDirectPlayerControl()) {
      return;
    }

    const queueIsEmpty = this.queue.isFinished() || !this.queue.isStarted();
    const isMoving = this.movementState !== -1;
    const queueHasOne = this.queue.currentCommand && this.queue.getLength() === 0;
    const timeEllapsed = +new Date() - this.lastMovement;
    const movementAlmostFinished = timeEllapsed > 300;

    if ((queueIsEmpty || (queueHasOne && movementAlmostFinished)) && isMoving) {
      // Arrow key
      if (this.movementState >= 0) {
        const direction = this.movementState;
        const callbackCommand = new CallbackCommand(
          this.scene,
          () => {},
          this.identifier,
          () => {},
          () => {
            this.lastMovement = (new Date()).getTime();
            this.scene.moveDirection(callbackCommand, direction);
          },
        );
        this.addCommand(callbackCommand);
        // Spacebar
      } else {
        const callbackCommand = new CallbackCommand(
          this.scene,
          () => {},
          this.identifier,
          () => {},
          () => {
            this.lastMovement = (new Date()).getTime();
            this.scene.use(callbackCommand);
          }
        );
        this.addCommand(callbackCommand);
      }
    }
  }

  doMove(commandQueueItem: BaseCommand, action: (entity?: BaseEntity) => void, animationAction: (entity: BaseEntity, oldPosition: Position, shouldJumpDown: boolean, groundType: string, completionHandler: () => void) => void) {
    const levelModel = this.scene.levelModel;
    const wasOnBlock = this.isOnBlock;
    const prevPosition = this.position;

    // Update position
    action(this);

    // TODO: check for Lava, Creeper, water => play approp animation & call commandQueueItem.failed()

    const jumpOff = wasOnBlock && wasOnBlock !== this.isOnBlock;
    const groundType =
      this.isOnBlock || jumpOff
        ? levelModel.actionPlane.getBlockAt(this.position)?.blockType || ''
        : levelModel.groundPlane.getBlockAt(this.position)?.blockType || '';

    animationAction(
      this,
      prevPosition,
      jumpOff,
      groundType,
      () => {
        this.play('idle');
        this.scene.delayPlayerMoveBy(this.moveDelayMin, this.moveDelayMax, () => {
          commandQueueItem.succeeded();
        });
      }
    );

    this.updateHidingTree();
    this.updateHidingBlock(prevPosition);
  }

  doMoveForward(commandQueueItem: BaseCommand) {
    this.doMove(commandQueueItem, this.scene.levelModel.moveForward, this.scene.levelView.playMoveForwardAnimation);
  }

  doMoveBackward(commandQueueItem: BaseCommand) {
    this.doMove(commandQueueItem, this.scene.levelModel.moveBackward, this.scene.levelView.playMoveBackwardAnimation);
  }

  bump(commandQueueItem: BaseCommand) {
    this.play('bump');

    const levelModel = this.scene.levelModel;
    const frontEntity = this.scene.levelEntity.getEntityAt(
      levelModel.getMoveForwardPosition(this),
    );

    if (frontEntity) {
      const isFriendlyEntity = this.scene.levelEntity.isFriendlyEntity(
        frontEntity.type,
      );

      // Push friendly entity 1 block
      if (isFriendlyEntity) {
        const pushDirection = this.facing;
        const moveAwayCommand = new CallbackCommand(
          this.scene,
          () => {},
          this.identifier,
          () => {
            frontEntity.pushBack(moveAwayCommand, pushDirection, 250);
          },
          () => {}
        );
        frontEntity.queue.startPushHighPriorityCommands();
        frontEntity.addCommand(moveAwayCommand);
        frontEntity.queue.endPushHighPriorityCommands();
      }
    }

    this.scene.delayPlayerMoveBy(200, 400, () => {
      commandQueueItem.succeeded();
    });
  }

  takeDamage(callbackCommand: CallbackCommand) {
    this.healthPoint--;
    if (this.healthPoint > 0) {
      // Still alive
      this.play('hurt');
      callbackCommand.succeeded();
    } else {
      // Report failure since player died
      this.stop();
      this.scene.levelView.playFailureAnimation(
        () => {
          callbackCommand.failed();
          this.scene.handleEndState(false);
        },
        this
      );
    }
  }

  hasPermissionToWalk(actionBlock: LevelBlock): boolean {
    return actionBlock.isWalkable;
  }

  canTriggerPressurePlates(): boolean {
    return true;
  }
}

export default Agent;
