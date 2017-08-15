import BaseEntity from "./BaseEntity.js";
import CallbackCommand from "../CommandQueue/CallbackCommand.js";

export default class Player extends BaseEntity {
  constructor(controller, type, x, y, name, isOnBlock, facing) {
    super(controller, type, 'Player', x, y, facing);
    this.offset = [-18, -32];
    this.name = name;
    this.isOnBlock = isOnBlock;
    this.inventory = {};
    this.movementState = -1;

    if (controller.levelData.isEventLevel) {
      this.moveDelayMin = 0;
      this.moveDelayMax = 0;
    } else {
      this.moveDelayMin = 30;
      this.moveDelayMax = 200;
    }
  }
  updateMovement() {
    if (!this.controller.attemptRunning) {
      return;
    }
    const queueIsEmpty = this.queue.isFinished() || !this.queue.isStarted();
    const isMoving = this.movementState !== -1;
    const queueHasOne = this.queue.currentCommand && this.queue.getLength() === 0;
    const timeEllapsed = (+new Date() - this.lastMovement);
    const movementAlmostFinished = timeEllapsed > 300;

    if ((queueIsEmpty || (queueHasOne && movementAlmostFinished)) && isMoving) {
      // Arrow key
      if (this.movementState >= 0) {
        let direction = this.movementState;
        let callbackCommand = new CallbackCommand(this, () => { }, () => {
          this.lastMovement = +new Date();
          this.controller.moveDirection(callbackCommand, direction);
        }, this.identifier);
        this.addCommand(callbackCommand);
        // Spacebar
      } else {
        let callbackCommand = new CallbackCommand(this, () => { }, () => {
          this.lastMovement = +new Date();
          this.controller.use(callbackCommand);
        }, this.identifier);
        this.addCommand(callbackCommand);
      }
    }
  }

  doMoveForward(commandQueueItem) {
    var player = this,
      groundType,
      jumpOff,
      levelModel = this.controller.levelModel,
      levelView = this.controller.levelView;
    let wasOnBlock = player.isOnBlock;
    let prevPosition = this.position;
    // update position
    levelModel.moveForward();
    // TODO: check for Lava, Creeper, water => play approp animation & call commandQueueItem.failed()

    jumpOff = wasOnBlock && wasOnBlock !== player.isOnBlock;
    if (player.isOnBlock || jumpOff) {
      groundType = levelModel.actionPlane[levelModel.yToIndex(player.position[1]) + player.position[0]].blockType;
    } else {
      groundType = levelModel.groundPlane[levelModel.yToIndex(player.position[1]) + player.position[0]].blockType;
    }

    levelView.playMoveForwardAnimation(player.position, player.facing, jumpOff, player.isOnBlock, groundType, () => {
      levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);

      if (levelModel.isPlayerStandingInWater()) {
        levelView.playDrownFailureAnimation(player.position, player.facing, player.isOnBlock, () => {
          commandQueueItem.failed();
        });
      } else if (levelModel.isPlayerStandingInLava()) {
        levelView.playBurnInLavaAnimation(player.position, player.facing, player.isOnBlock, () => {
          commandQueueItem.failed();
        });
      } else {
        this.controller.delayPlayerMoveBy(this.moveDelayMin, this.moveDelayMax, () => {
          commandQueueItem.succeeded();
        });
      }
    });

    this.updateHidingTree();
    this.updateHidingBlock(prevPosition);
    this.collectItems(prevPosition);
    this.collectItems();
  }

  bump(commandQueueItem) {
    var levelView = this.controller.levelView,
      levelModel = this.controller.levelModel;
    levelView.playBumpAnimation(this.position, this.facing, false);
    let frontEntity = this.controller.levelEntity.getEntityAt(levelModel.getMoveForwardPosition(this));
    if (frontEntity !== null) {
      const isFriendlyEntity = this.controller.levelEntity.isFriendlyEntity(frontEntity.type);
      // push frienly entity 1 block
      if (isFriendlyEntity) {
        const pushDirection = this.facing;
        var moveAwayCommand = new CallbackCommand(this, () => { }, () => { frontEntity.pushBack(moveAwayCommand, pushDirection, 250); }, frontEntity.identifier);
        frontEntity.queue.startPushHighPriorityCommands();
        frontEntity.addCommand(moveAwayCommand);
        frontEntity.queue.endPushHighPriorityCommands();
      }
    }
    this.controller.delayPlayerMoveBy(200, 400, () => {
      commandQueueItem.succeeded();
    });
  }

  collectItems(targetPosition = this.position) {
    // collectible check
    var collectibles = this.controller.levelView.collectibleItems;
    var distanceBetween = function (position, position2) {
      return Math.sqrt(Math.pow(position[0] - position2[0], 2) + Math.pow(position[1] - position2[1], 2));
    };
    for (var i = 0; i < collectibles.length; i++) {
      let sprite = collectibles[i][0];
      // already collected item
      if (sprite === null) {
        collectibles.splice(i, 1);

      } else {
        let collectiblePosition = this.controller.levelModel.spritePositionToIndex(collectibles[i][1], [sprite.x, sprite.y]);
        if (distanceBetween(targetPosition, collectiblePosition) < 2) {
          this.controller.levelView.playItemAcquireAnimation(this.position, this.facing, sprite, () => { }, collectibles[i][2]);
          collectibles.splice(i, 1);
        }
      }
    }
  }

  takeDamage(callbackCommand) {
    let facingName = this.controller.levelView.getDirectionName(this.facing);
    this.healthPoint--;
    // still alive
    if (this.healthPoint > 0) {
      this.controller.levelView.playScaledSpeed(this.sprite.animations, "hurt" + facingName);
      callbackCommand.succeeded();
      // report failure since player died
    } else {
      this.sprite.animations.stop(null, true);
      this.controller.levelView.playFailureAnimation(this.position, this.facing, this.isOnBlock, () => {
        callbackCommand.failed();
        this.controller.handleEndState(false);
      });
    }
  }
}

