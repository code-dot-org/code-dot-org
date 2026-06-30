const BaseEntity = require("./BaseEntity.js");
const CallbackCommand = require("../CommandQueue/CallbackCommand.js");

module.exports = class Agent extends BaseEntity {
  constructor(controller, type, x, y, name, isOnBlock, facing) {
    super(controller, type, 'PlayerAgent', x, y, facing);
    this.offset = [-16, -15];
    this.name = name;
    this.isOnBlock = isOnBlock;
    this.inventory = {};
    this.movementState = -1;

    this.moveDelayMin = 20;
    this.moveDelayMax = 150;
  }

  /**
   * @override
   */
  canPlaceBlockOver(toPlaceBlock, onTopOfBlock) {
    let result = { canPlace: false, plane: '' };
    if (onTopOfBlock.getIsLiquid()) {
      if (toPlaceBlock.getIsPlaceableInLiquid()) {
        result.canPlace = true;
        result.plane = "groundPlane";
      }
    } else {
      if (toPlaceBlock.isWalkable) {
        result.canPlace = true;
        result.plane = "actionPlane";
      }
    }
    return result;
  }

  /**
   * @override
   */
  canPlaceBlock(block) {
    return block.isEmpty;
  }

  /**
   * @override
   */
  canMoveThrough() {
    return true;
  }

  /**
   * Give agent a higher-than-normal offset so that it will always render on top
   * of the player when on the same cell.
   * @override
   */
  getSortOrderOffset() {
    return super.getSortOrderOffset() - 1;
  }

  // "Events" levels allow the player to move around with the arrow keys, and
  // perform actions with the space bar.
  updateMovement() {
    if (!this.controller.attemptRunning || !this.controller.getIsDirectPlayerControl()) {
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

  doMove(commandQueueItem, movement) {
    let groundType;
    const levelModel = this.controller.levelModel;
    const levelView = this.controller.levelView;
    const wasOnBlock = this.isOnBlock;
    const prevPosition = this.position;

    // Update position.
    levelModel[`move${movement}`](this);

    const jumpOff = wasOnBlock && wasOnBlock !== this.isOnBlock;
    if (this.isOnBlock || jumpOff) {
      groundType = levelModel.actionPlane.getBlockAt(this.position).blockType;
    } else {
      groundType = levelModel.groundPlane.getBlockAt(this.position).blockType;
    }

    levelView[`playMove${movement}Animation`](this, prevPosition, this.facing, jumpOff, this.isOnBlock, groundType, () => {
      levelView.playIdleAnimation(this.position, this.facing, this.isOnBlock, this);

      this.controller.delayPlayerMoveBy(this.moveDelayMin, this.moveDelayMax, () => {
        commandQueueItem.succeeded();
      });
    });

    this.updateHidingTree();
    this.updateHidingBlock(prevPosition);
  }

  doMoveForward(commandQueueItem) {
    this.doMove(commandQueueItem, 'Forward');
  }

  doMoveBackward(commandQueueItem) {
    this.doMove(commandQueueItem, 'Backward');
  }

  bump(commandQueueItem) {
    var levelView = this.controller.levelView,
      levelModel = this.controller.levelModel;
    levelView.playBumpAnimation(this.position, this.facing, false, this);
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

  hasPermissionToWalk(actionBlock) {
        return (actionBlock.isWalkable);
  }

  canTriggerPressurePlates() {
    return true;
  }
};
