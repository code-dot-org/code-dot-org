const BaseEntity = require("./BaseEntity.js");
const CallbackCommand = require("../CommandQueue/CallbackCommand.js");
const Position = require("../LevelMVC/Position");

module.exports = class Player extends BaseEntity {
  constructor(controller, type, x, y, name, isOnBlock, facing) {
    super(controller, type, 'Player', x, y, facing);
    this.offset = [-18, -32];
    this.name = name;
    this.isOnBlock = isOnBlock;
    this.inventory = {};
    this.movementState = -1;
    this.onTracks = false;
    this.getOffTrack = false;

    if (controller.getIsDirectPlayerControl()) {
      this.moveDelayMin = 0;
      this.moveDelayMax = 0;
    } else {
      this.moveDelayMin = 30;
      this.moveDelayMax = 200;
    }

    if (controller.levelData.ocean) {
      this.offset = [-26, -26];
    }

    if (controller.levelData.boat) {
      this.offset = [-27, -30];
    }
  }

  /**
   * @override
   */
  canPlaceBlockOver(toPlaceBlock, onTopOfBlock) {
    let result = { canPlace: false, plane: '' };
    if (onTopOfBlock.getIsLiquid()) {
      result.canPlace = true;
      result.plane = "groundPlane";
    } else {
      result.canPlace = true;
      result.plane = "actionPlane";
    }
    if (toPlaceBlock.blockType === "cropWheat") {
      result.canPlace = onTopOfBlock.blockType === "farmlandWet";
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
  shouldUpdateSelectionIndicator() {
    return true;
  }

  /**
   * @override
   */
  setMovePosition(position) {
    super.setMovePosition(position);
    this.collectItems(this.position);
  }

  /**
   * player walkable stuff
   */
  walkableCheck(block) {
    this.isOnBlock = !block.isWalkable;
  }

  // "Events" levels allow the player to move around with the arrow keys, and
  // perform actions with the space bar.
  updateMovement() {
    if (!this.controller.attemptRunning || !this.controller.getIsDirectPlayerControl()) {
      return;
    }

    if (this.onTracks) {
      this.collectItems(this.position);
    }

    if (this.canUpdateMovement()) {
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

  canUpdateMovement() {
    const queueIsEmpty = this.queue.isFinished() || !this.queue.isStarted();
    const isMoving = this.movementState !== -1;
    const queueHasOne = this.queue.currentCommand && this.queue.getLength() === 0;
    const timeEllapsed = (+new Date() - this.lastMovement);
    const movementAlmostFinished = timeEllapsed > 300;
    if (isMoving && timeEllapsed > 800) {
      // Delay of 800 ms so that the first move onto a rail completes the moveDirection command.
      // Without the delay, the moveDirection conflicts with the onRails check and cancels rail riding as soon as it starts.
      this.getOffTrack = true;
    }
    return !this.onTracks && ((queueIsEmpty || (queueHasOne && movementAlmostFinished)) && isMoving);
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
      groundType = levelModel.actionPlane.getBlockAt(player.position).blockType;
    } else {
      groundType = levelModel.groundPlane.getBlockAt(player.position).blockType;
    }

    levelView.playMoveForwardAnimation(player, prevPosition, player.facing, jumpOff, player.isOnBlock, groundType, () => this.afterMove(commandQueueItem));

    this.updateHidingTree();
    this.updateHidingBlock(prevPosition);
  }

  doMoveBackward(commandQueueItem) {
    var player = this,
      groundType,
      jumpOff,
      levelModel = this.controller.levelModel,
      levelView = this.controller.levelView;
    let wasOnBlock = player.isOnBlock;
    let prevPosition = this.position;
    // update position
    levelModel.moveBackward(this);
    // TODO: check for Lava, Creeper, water => play approp animation & call commandQueueItem.failed()

    jumpOff = wasOnBlock && wasOnBlock !== player.isOnBlock;
    if (player.isOnBlock || jumpOff) {
      groundType = levelModel.actionPlane.getBlockAt(player.position).blockType;
    } else {
      groundType = levelModel.actionPlane.getBlockAt(player.position).blockType;
    }

    levelView.playMoveBackwardAnimation(player, prevPosition, player.facing, jumpOff, player.isOnBlock, groundType, () => this.afterMove(commandQueueItem));

    this.updateHidingTree();
    this.updateHidingBlock(prevPosition);
  }

  afterMove(commandQueueItem) {
    const levelModel = this.controller.levelModel;
    const levelView = this.controller.levelView;
    levelView.playIdleAnimation(this.position, this.facing, this.isOnBlock);

    if (levelModel.isPlayerStandingInWater() && !levelModel.isInBoat()) {
      levelView.playDrownFailureAnimation(this.position, this.facing, this.isOnBlock, () => {
        this.controller.handleEndState(false);
      });
    } else if (levelModel.isPlayerStandingInLava()) {
      levelView.playBurnInLavaAnimation(this.position, this.facing, this.isOnBlock, () => {
        this.controller.handleEndState(false);
      });
    } else {
      Position.getOrthogonalPositions(this.position).forEach(ortho => {
        const block = levelModel.actionPlane.getBlockAt(ortho);
        if (block && block.blockType.endsWith("Chest") && !block.isOpen) {
          block.isOpen = true;
          levelView.playOpenChestAnimation(ortho);
        }
      });
      this.controller.delayPlayerMoveBy(this.moveDelayMin, this.moveDelayMax, () => {
        commandQueueItem.succeeded();
      });
    }
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
    for (var i = 0; i < collectibles.length; i++) {
      const [sprite, offset, blockType, collectibleDistance] = collectibles[i];
      // already collected item
      if (sprite === null) {
        collectibles.splice(i, 1);
      } else {
        let collectiblePosition = this.controller.levelModel.spritePositionToIndex(offset, new Position(sprite.x, sprite.y));
        if (Position.absoluteDistanceSquare(targetPosition, collectiblePosition) < collectibleDistance) {
          this.controller.levelView.playItemAcquireAnimation(this.position, this.facing, sprite, () => { }, blockType);
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
      this.controller.levelView.playScaledSpeed(this.getAnimationManager(), "hurt" + facingName);
      callbackCommand.succeeded();
      // report failure since player died
    } else {
      this.getAnimationManager().stop(null, true);
      this.controller.levelView.playFailureAnimation(this.position, this.facing, this.isOnBlock, () => {
        callbackCommand.failed();
        this.controller.handleEndState(false);
      });
    }
  }

  canTriggerPressurePlates() {
    return true;
  }

};
