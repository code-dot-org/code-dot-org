const CommandQueue = require("../CommandQueue/CommandQueue.js");
const FacingDirection = require("../LevelMVC/FacingDirection.js");
const Position = require("../LevelMVC/Position.js");
const EventType = require("../Event/EventType.js");
const CallbackCommand = require("../CommandQueue/CallbackCommand.js");
const LevelBlock = require("../LevelMVC/LevelBlock.js");

module.exports = class BaseEntity {
  constructor(controller, type, identifier, x, y, facing) {
    this.queue = new CommandQueue(controller);
    this.controller = controller;
    this.game = controller.game;
    this.position = new Position(x, y);
    this.type = type;
    // temp
    this.facing = facing;
    // offset for sprite position in grid
    this.offset = [-22, -12];
    this.identifier = identifier;
    this.healthPoint = 3;
    this.underTree = { state: false, treeIndex: -1 };
  }

  tick() {
      this.queue.tick();
  }

  reset() {
  }

  canMoveThrough() {
    return false;
  }

  canPlaceBlock() {
    return false;
  }

  canTriggerPressurePlates() {
    return false;
  }

  /**
   * Whether or not the white "selection indicator" highlight square should
   * update to follow this entity around as it moves and interacts with the
   * world
   *
   * @return {boolean}
   */
  shouldUpdateSelectionIndicator() {
    return false;
  }

  setMovePosition(position) {
    this.position = position;
  }

  /**
   * For entities which need to be able to accomodate rendering in the same
   * cell as other entities, provide a way to define a rendering offset.
   *
   * @see LevelView.playPlayerAnimation
   * @see LevelView.playMoveForwardAnimation
   * @return Number
   */
  getSortOrderOffset() {
    return 5;
  }

  addCommand(commandQueueItem, repeat = false) {
    this.queue.addCommand(commandQueueItem, repeat);
    // execute the command
    this.queue.begin();
  }

  addAnimation(...args) {
    return this.getAnimationManager().add(...args);
  }

  getAnimationManager() {
    return this.animationRig ? this.animationRig.animations : this.sprite.animations;
  }

  getWalkAnimation() {
    return "walk" + this.controller.levelView.getDirectionName(this.facing);
  }

  getIdleAnimation() {
    return "idle" + this.controller.levelView.getDirectionName(this.facing);
  }

  playMoveForwardAnimation(position, facing, commandQueueItem, groundType) {
    var levelView = this.controller.levelView;
    var tween;
    // update z order
    var zOrderYIndex = position[1] + (facing === FacingDirection.North ? 1 : 0);
    this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex) + 1;
    // stepping sound
    levelView.playBlockSound(groundType);
    // play walk animation
    levelView.playScaledSpeed(this.getAnimationManager(), this.getWalkAnimation());
    setTimeout(() => {
      tween = this.controller.levelView.addResettableTween(this.sprite).to({
        x: (this.offset[0] + 40 * position[0]), y: (this.offset[1] + 40 * position[1])
      }, 300, Phaser.Easing.Linear.None);
      tween.onComplete.add(() => {
        levelView.playScaledSpeed(this.getAnimationManager(), this.getIdleAnimation());
        commandQueueItem.succeeded();
      });

      tween.start();
    }, 50 / this.controller.tweenTimeScale);
    // smooth movement using tween
  }

  /**
   * player walkable stuff
   */
  walkableCheck() {
    //do nothing
  }

    updateHidingTree() {
        var levelView = this.controller.levelView;
        // this is not under tree
        if (!this.underTree.state) {
            var treeList = levelView.trees;
            for (var i = 0; i < treeList.length; i++) {
                if (levelView.isUnderTree(i, this.position)) {
                    levelView.changeTreeAlpha(i, 0.8);
                    this.underTree = { state: true, treeIndex: i };
                    break;
                }
            }
            // this is under tree
        } else {
            var currentTreeIndex = this.underTree.treeIndex;
            var entities = this.controller.levelEntity.entityMap;
            var isOtherEntityUnderTree = function (currentEntity, entities, currentTreeIndex) {
                for (var value of entities) {
                    let entity = value[1];
                    const sameEntity = entity === currentEntity;
                    if (!sameEntity && entity.underTree.treeIndex === currentTreeIndex) {
                        return true;
                    }
                }
                return false;
            };
            if (!levelView.isUnderTree(currentTreeIndex, this.position)) {
                if (!isOtherEntityUnderTree(this, entities, currentTreeIndex)) {
                    levelView.changeTreeAlpha(currentTreeIndex, 1);
                }
                this.underTree = { state: false, treeIndex: -1 };
            }
        }
    }

    updateHidingBlock(prevPosition) {
        const levelView = this.controller.levelView;
        const actionPlane = this.controller.levelModel.actionPlane;

        let frontBlockCheck = function (entity, position) {
            let frontPosition = Position.south(position);
            const frontBlock = actionPlane.getBlockAt(frontPosition);
            if (frontBlock && !frontBlock.isTransparent) {
                var sprite = levelView.actionPlaneBlocks[levelView.coordinatesToIndex(frontPosition)];
                if (sprite !== null) {
                    var tween = entity.controller.levelView.addResettableTween(sprite).to({
                        alpha: 0.8
                    }, 300, Phaser.Easing.Linear.None);

                    tween.start();
                }
            }
        };

        let prevBlockCheck = function (entity, position) {
            let frontPosition = Position.south(position);
            if (frontPosition.y < 10) {
                var sprite = levelView.actionPlaneBlocks[levelView.coordinatesToIndex(frontPosition)];
                if (sprite !== null) {
                    var tween = entity.controller.levelView.addResettableTween(sprite).to({
                        alpha: 1
                    }, 300, Phaser.Easing.Linear.None);

                    tween.start();
                }
            }
        };

        if (!this.isOnBlock) {
            frontBlockCheck(this, this.position);
        }
        if (prevPosition !== undefined) {
            prevBlockCheck(this, prevPosition);
        }
    }

    doMoveForward(commandQueueItem, forwardPosition) {
        var levelModel = this.controller.levelModel;
        var prevPosition = this.position;
        this.position = forwardPosition;
        // play sound effect
        let groundType = levelModel.groundPlane.getBlockAt(this.position).blockType;
        // play move forward animation and play idle after that
        this.playMoveForwardAnimation(forwardPosition, this.facing, commandQueueItem, groundType, () => {
        });
        this.updateHidingTree();
        this.updateHidingBlock(prevPosition);
    }

    bump(commandQueueItem) {
        var animName = "bump";
        var facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.getAnimationManager(), animName + facingName);
        let forwardPosition = this.controller.levelModel.getMoveForwardPosition(this);
        let forwardEntity = this.controller.levelEntity.getEntityAt(forwardPosition);
        if (forwardEntity !== null) {
            this.queue.startPushHighPriorityCommands();
            this.controller.events.forEach(e => e({ eventType: EventType.WhenTouched, targetType: this.type, targetIdentifier: this.identifier, eventSenderIdentifier: forwardEntity.identifier }));
            this.queue.endPushHighPriorityCommands();
        }
        this.controller.delayPlayerMoveBy(400, 800, () => {
            commandQueueItem.succeeded();
        });
    }

    callBumpEvents(forwardPositionInformation) {
        for (var i = 1; i < forwardPositionInformation.length; i++) {
            if (forwardPositionInformation[i] === 'frontEntity') {
                this.controller.events.forEach(e => e({ eventType: EventType.WhenTouched, targetType: forwardPositionInformation[i + 1].type, eventSenderIdentifier: this.identifier, targetIdentifier: forwardPositionInformation[i + 1].identifier }));
                i++;
            }
        }
    }

    moveDirection(commandQueueItem, direction) {
        // update entity's direction
        this.controller.levelModel.turnToDirection(this, direction);
        this.moveForward(commandQueueItem, false);
    }

    moveForward(commandQueueItem, record = true) {
        if (record) {
            this.controller.addCommandRecord("moveForward", this.type, commandQueueItem.repeat);
        }
        let forwardPosition = this.controller.levelModel.getMoveForwardPosition(this);
        var forwardPositionInformation = this.controller.levelModel.canMoveForward(this);
        if (forwardPositionInformation[0]) {
            let offset = Position.directionToOffsetPosition(this.facing);
            let reverseOffset = Position.directionToOffsetPosition(FacingDirection.opposite(this.facing));
            let weMovedOnTo = this.handleMoveOnPressurePlate(offset);
            this.doMoveForward(commandQueueItem, forwardPosition);
            if (!weMovedOnTo) {
              this.handleMoveOffPressurePlate(reverseOffset);
            }
            this.handleMoveOffIronDoor(reverseOffset);
            this.handleMoveAwayFromPiston(reverseOffset);
        } else {
            this.bump(commandQueueItem);
            this.callBumpEvents(forwardPositionInformation);
        }
    }

    moveBackward(commandQueueItem, record = true) {
        if (record) {
            this.controller.addCommandRecord("moveBackward", this.type, commandQueueItem.repeat);
        }
        let backwardPosition = this.controller.levelModel.getMoveDirectionPosition(this, 2);
        var backwardPositionInformation = this.controller.levelModel.canMoveBackward(this);
        if (backwardPositionInformation[0]) {
            let offset = Position.directionToOffsetPosition(FacingDirection.opposite(this.facing));
            let reverseOffset = Position.directionToOffsetPosition(this.facing);
            let weMovedOnTo = this.handleMoveOnPressurePlate(offset);
            this.doMoveBackward(commandQueueItem, backwardPosition);
            if (!weMovedOnTo) {
              this.handleMoveOffPressurePlate(reverseOffset);
            }
            this.handleMoveOffIronDoor(reverseOffset);
            this.handleMoveAwayFromPiston(reverseOffset);
        } else {
            this.bump(commandQueueItem);
            this.callBumpEvents(backwardPositionInformation);
        }
    }

    /**
     * @typedef {Object} CanPlace
     * @property {boolean} canPlace - whether or not placement is allowed at all
     * @property {string} plane - which plane the block should be placed on. Can
     *                    be either "groundPlane" or "actionPlane"
     */

    /**
     * check whether or not the entity can place the given block on top of the
     * given block
     *
     * @param {LevelBlock} [toPlaceBlock]
     * @param {LevelBlock} [onTopOfBlock]
     * @return {CanPlace}
     */
    canPlaceBlockOver() {
      return { canPlace: false, plane: '' };
    }

    /**
     * check all the movable points and choose the farthest one
     *
     * @param {any} commandQueueItem
     * @param {any} moveAwayFrom (entity)
     *
     * @memberOf BaseEntity
     */
    moveAway(commandQueueItem, moveAwayFrom) {
        this.controller.addCommandRecord("moveAway", this.type, commandQueueItem.repeat);
        var moveAwayPosition = moveAwayFrom.position;
        var bestPosition = [];
        let comparePositions = function (moveAwayPosition, position1, position2) {
            return Position.absoluteDistanceSquare(position1[1], moveAwayPosition) < Position.absoluteDistanceSquare(position2[1], moveAwayPosition) ? position2 : position1;
        };

        var currentDistance = Position.absoluteDistanceSquare(moveAwayPosition, this.position);
        // this entity is on the right side and can move to right
        if (moveAwayPosition.x <= this.position.x && this.controller.levelModel.canMoveDirection(this, FacingDirection.East)[0]) {
            bestPosition = [FacingDirection.East, Position.east(this.position)];
        }
        // this entity is on the left side and can move to left
        if (moveAwayPosition.x >= this.position.x && this.controller.levelModel.canMoveDirection(this, FacingDirection.West)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.West, Position.west(this.position)]);
            } else {
                bestPosition = [FacingDirection.West, Position.west(this.position)];
            }
        }
        // this entity is on the up side and can move to up
        if (moveAwayPosition.y >= this.position.y && this.controller.levelModel.canMoveDirection(this, FacingDirection.North)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.North, Position.north(this.position)]);
            } else {
                bestPosition = [FacingDirection.North, Position.north(this.position)];
            }
        }
        // this entity is on the down side and can move to down
        if (moveAwayPosition.y <= this.position.y && this.controller.levelModel.canMoveDirection(this, FacingDirection.South)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.South, Position.south(this.position)]);
            } else {
                bestPosition = [FacingDirection.South, Position.south(this.position)];
            }
        }
        // terminate the action since it's impossible to move
        if (bestPosition.length === 0 || currentDistance >= Position.absoluteDistanceSquare(moveAwayPosition, bestPosition[1])) {
            commandQueueItem.succeeded();
        } else {
            // execute the best result
            this.moveDirection(commandQueueItem, bestPosition[0]);
        }
    }

    /**
     * check all the movable points and choose the farthest one
     *
     * @param {any} commandQueueItem
     * @param {any} moveTowardTo (entity)
     *
     * @memberOf BaseEntity
     */
    moveToward(commandQueueItem, moveTowardTo) {
        this.controller.addCommandRecord("moveToward", this.type, commandQueueItem.repeat);
        var moveTowardPosition = moveTowardTo.position;
        var bestPosition = [];
        let comparePositions = function (moveTowardPosition, position1, position2) {
          return Position.absoluteDistanceSquare(position1[1], moveTowardPosition) >
                 Position.absoluteDistanceSquare(position2[1], moveTowardPosition)
                   ? position2
                   : position1;
        };

        // this entity is on the right side and can move to right
        if (moveTowardPosition.x >= this.position.x && this.controller.levelModel.canMoveDirection(this, FacingDirection.East)[0]) {
            bestPosition = [FacingDirection.East, Position.east(this.position)];
        }
        // this entity is on the left side and can move to left
        if (moveTowardPosition.x <= this.position.x && this.controller.levelModel.canMoveDirection(this, FacingDirection.West)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.West, Position.west(this.position)]);
            } else {
                bestPosition = [FacingDirection.West, Position.west(this.position)];
            }
        }
        // this entity is on the up side and can move to up
        if (moveTowardPosition.y <= this.position.y && this.controller.levelModel.canMoveDirection(this, FacingDirection.North)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.North, Position.north(this.position)]);
            } else {
                bestPosition = [FacingDirection.North, Position.north(this.position)];
            }
        }
        // this entity is on the down side and can move to down
        if (moveTowardPosition.y >= this.position.y && this.controller.levelModel.canMoveDirection(this, FacingDirection.South)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.South, Position.south(this.position)]);
            } else {
                bestPosition = [FacingDirection.South, Position.south(this.position)];
            }
        }
        // terminate the action since it's impossible to move
        if (Position.absoluteDistanceSquare(this.position, moveTowardPosition) === 1) {
            if (this.position.x < moveTowardPosition.x) {
                this.facing = FacingDirection.East;
            } else if (this.position.x > moveTowardPosition.x) {
                this.facing = FacingDirection.West;
            } else if (this.position.y < moveTowardPosition.y) {
                this.facing = FacingDirection.South;
            } else if (this.position.y > moveTowardPosition.y) {
                this.facing = FacingDirection.North;
            }
            this.updateAnimationDirection();
            this.bump(commandQueueItem);
            return false;
        } else {
            if (bestPosition.length === 0) {
                commandQueueItem.succeeded();
                return false;
                // execute the best result
            } else {
                this.moveDirection(commandQueueItem, bestPosition[0]);
                return true;
            }
        }
    }


    moveTo(commandQueueItem, moveTowardTo) {
        if (Position.absoluteDistanceSquare(moveTowardTo.position, this.position) === 1) {
            /// north
            if (moveTowardTo.position.y - this.position.y === -1) {
                this.moveDirection(commandQueueItem, FacingDirection.North);
            } else if (moveTowardTo.position.y - this.position.y === 1) {
                this.moveDirection(commandQueueItem, FacingDirection.South);
            } else if (moveTowardTo.position.x - this.position.x === 1) {
                this.moveDirection(commandQueueItem, FacingDirection.East);
            } else {
                this.moveDirection(commandQueueItem, FacingDirection.West);
            }
        } else if (this.moveToward(commandQueueItem, moveTowardTo)) {
            var callbackCommand = new CallbackCommand(this.controller, () => { }, () => {
                this.moveTo(callbackCommand, moveTowardTo);
            }, this.identifier);
            this.addCommand(callbackCommand);
        } else {
            this.bump(commandQueueItem);
        }
    }

    turn(commandQueueItem, direction, record = true) {
        if (record) {
            this.controller.addCommandRecord("turn", this.type, commandQueueItem.repeat);
        }
        // update entity direction
        if (direction === -1) {
            this.controller.levelModel.turnLeft(this);
        }

        if (direction === 1) {
            this.controller.levelModel.turnRight(this);
        }
        // update animation
        this.updateAnimationDirection();
        this.controller.delayPlayerMoveBy(200, 800, () => {
            commandQueueItem.succeeded();
        });
    }

    turnRandom(commandQueueItem) {
        this.controller.addCommandRecord("turnRandom", this.type, commandQueueItem.repeat);
        var getRandomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        var direction = getRandomInt(0, 1) === 0 ? 1 : -1;
        this.turn(commandQueueItem, direction, false);
    }

    use(commandQueueItem, userEntity) {
        // default behavior for use ?
        var animationName = "lookAtCam" + this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.getAnimationManager(), animationName);
        this.queue.startPushHighPriorityCommands();
        this.controller.events.forEach(e => e({ eventType: EventType.WhenUsed, targetType: this.type, eventSenderIdentifier: userEntity.identifier, targetIdentifier: this.identifier }));
        this.queue.endPushHighPriorityCommands();
        commandQueueItem.succeeded();
    }

    drop(commandQueueItem, itemType) {
        this.controller.addCommandRecord("drop", this.type, commandQueueItem.repeat);
        this.controller.levelView.playItemDropAnimation(this.position, itemType, () => {
            commandQueueItem.succeeded();

            if (this.controller.levelModel.usePlayer) {
                const playerCommand = this.controller.levelModel.player.queue.currentCommand;
                if (playerCommand && playerCommand.waitForOtherQueue) {
                    playerCommand.succeeded();
                }
            }
        });
    }

    attack(commandQueueItem) {
        this.controller.addCommandRecord("attack", this.type, commandQueueItem.repeat);
        let facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.getAnimationManager(), "attack" + facingName);
        setTimeout((entity) => {
            let frontEntity = entity.controller.levelEntity.getEntityAt(entity.controller.levelModel.getMoveForwardPosition(entity));
            if (frontEntity) {
                var callbackCommand = new CallbackCommand(entity.controller, () => { }, () => { frontEntity.takeDamage(callbackCommand); }, frontEntity);
                frontEntity.addCommand(callbackCommand);
            }
            setTimeout(function (controller, entity, thisEntity) {
                if (entity !== null) {
                    frontEntity.queue.startPushHighPriorityCommands();
                    controller.events.forEach(e => e({ eventType: EventType.WhenAttacked, targetType: entity.type, eventSenderIdentifier: thisEntity.identifier, targetIdentifier: entity.identifier }));
                    frontEntity.queue.endPushHighPriorityCommands();
                }
                commandQueueItem.succeeded();
            }, 300 / this.controller.tweenTimeScale, entity.controller, frontEntity, entity);
        }, 200 / this.controller.tweenTimeScale, this);
    }

    pushBack(commandQueueItem, pushDirection, movementTime, completionHandler) {
        var levelModel = this.controller.levelModel;
        var pushBackPosition = Position.forward(this.position, pushDirection);
        var canMoveBack = levelModel.isPositionEmpty(pushBackPosition)[0];
        if (canMoveBack) {
            this.updateHidingBlock(this.position);
            this.position = pushBackPosition;
            this.updateHidingTree();
            var tween = this.controller.levelView.addResettableTween(this.sprite).to({
                x: (this.offset[0] + 40 * this.position[0]), y: (this.offset[1] + 40 * this.position[1])
            }, movementTime, Phaser.Easing.Linear.None);
            tween.onComplete.add(() => {
                setTimeout(() => {
                    commandQueueItem.succeeded();
                    if (completionHandler !== undefined) {
                        completionHandler(this);
                    }
                }, movementTime  / this.controller.tweenTimeScale);
            });
            tween.start();
        } else {
            commandQueueItem.succeeded();
            if (completionHandler !== undefined) {
                completionHandler(this);
            }
        }
    }

    takeDamage(callbackCommand) {
        let levelView = this.controller.levelView;
        let facingName = levelView.getDirectionName(this.facing);
        if (this.healthPoint > 1) {
            levelView.playScaledSpeed(this.getAnimationManager(), "hurt" + facingName);
            setTimeout(() => {
                this.healthPoint--;
                callbackCommand.succeeded();
            }, 1500 / this.controller.tweenTimeScale);
        } else {
            this.healthPoint--;
            this.getAnimationManager().stop(null, true);
            this.controller.levelView.playScaledSpeed(this.getAnimationManager(), "die" + facingName);
            setTimeout(() => {
                var tween = this.controller.levelView.addResettableTween(this.sprite).to({
                    alpha: 0
                }, 300, Phaser.Easing.Linear.None);
                tween.onComplete.add(() => {
                    this.controller.levelEntity.destroyEntity(this.identifier);
                });
                tween.start();
            }, 1500 / this.controller.tweenTimeScale);
        }
    }

    playRandomIdle(facing) {
        var facingName,
            rand,
            animationName = "";
        facingName = this.controller.levelView.getDirectionName(facing);
        rand = Math.trunc(Math.random() * 5) + 1;

        switch (rand) {
            case 1:
                animationName += "idle";
                break;
            case 2:
                animationName += "lookLeft";
                break;
            case 3:
                animationName += "lookRight";
                break;
            case 4:
                animationName += "lookAtCam";
                break;
            case 5:
                animationName += "lookDown";
                break;
            default:
        }

        animationName += facingName;
        this.controller.levelView.playScaledSpeed(this.getAnimationManager(), animationName);
    }

    updateAnimationDirection() {
        let facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.getAnimationManager(), "idle" + facingName);
    }

    getDistance(entity) {
      return Position.absoluteDistanceSquare(this.position, entity.position);
    }

    blowUp(commandQueueItem, explosionPosition) {
        let pushBackDirection = FacingDirection.South;
        if (explosionPosition[0] > this.position[0]) {
            pushBackDirection = FacingDirection.West;
            this.facing = FacingDirection.East;
            this.updateAnimationDirection();
        } else if (explosionPosition[0] < this.position[0]) {
            pushBackDirection = FacingDirection.East;
            this.facing = FacingDirection.West;
            this.updateAnimationDirection();
        } else if (explosionPosition[1] > this.position[1]) {
            pushBackDirection = FacingDirection.North;
            this.facing = FacingDirection.South;
            this.updateAnimationDirection();
        } else if (explosionPosition[1] < this.position[1]) {
            pushBackDirection = FacingDirection.South;
            this.facing = FacingDirection.North;
            this.updateAnimationDirection();
        }
        this.pushBack(commandQueueItem, pushBackDirection, 150, function (entity) {
            let callbackCommand = new CallbackCommand(entity.controller, () => { }, () => { entity.controller.destroyEntity(callbackCommand, entity.identifier); }, entity.identifier);
            entity.queue.startPushHighPriorityCommands();
            entity.addCommand(callbackCommand, commandQueueItem.repeat);
            entity.queue.endPushHighPriorityCommands();
        });

    }

  hasPermissionToWalk(actionBlock, frontEntity, groundBlock = null) {
        return (actionBlock.isWalkable || ((frontEntity !== undefined && frontEntity.isOnBlock)
        // action plane is empty
        && !actionBlock.isEmpty))
        // there is no entity
        && (frontEntity === undefined || frontEntity.canMoveThrough())
        // no lava or water
        && (groundBlock.blockType !== "water" && groundBlock.blockType !== "lava");
  }

  handleMoveOffPressurePlate(moveOffset) {
    const previousPosition = Position.add(this.position, moveOffset);
    const isMovingOffOf = this.controller.levelModel.actionPlane.getBlockAt(previousPosition).blockType === "pressurePlateDown";
    const destinationBlock = this.controller.levelModel.actionPlane.getBlockAt(this.position);
    let remainOn = false;
    if (destinationBlock === undefined || !destinationBlock.isWalkable) {
      remainOn = true;
    }
    this.controller.levelEntity.entityMap.forEach((workingEntity) => {
      if (workingEntity.identifier !== this.identifier
      && workingEntity.canTriggerPressurePlates()
      && this.controller.positionEquivalence(workingEntity.position, previousPosition)) {
        remainOn = true;
      }
    });
    if (isMovingOffOf && !remainOn) {
      this.controller.audioPlayer.play("pressurePlateClick");
      const block = new LevelBlock('pressurePlateUp');
      this.controller.levelModel.actionPlane.setBlockAt(previousPosition, block, moveOffset[0], moveOffset[1]);
    }
  }

  handleMoveOnPressurePlate(moveOffset) {
    const targetPosition = Position.add(this.position, moveOffset);
    const isMovingOnToPlate = this.controller.levelModel.actionPlane.getBlockAt(targetPosition).blockType === "pressurePlateUp";
    if (isMovingOnToPlate) {
      this.controller.audioPlayer.play("pressurePlateClick");
      const block = new LevelBlock('pressurePlateDown');
      this.controller.levelModel.actionPlane.setBlockAt(targetPosition, block);
      return true;
    }
    return false;
  }

  handleMoveOffIronDoor(moveOffset) {
    const formerPosition = Position.add(this.position, moveOffset);
    if (!this.controller.levelModel.inBounds(formerPosition)) {
      return;
    }

    const wasOnDoor = this.controller.levelModel.actionPlane.getBlockAt(formerPosition).blockType === "doorIron";
    const isOnDoor = this.controller.levelModel.actionPlane.getBlockAt(this.position).blockType === "doorIron";
    if (wasOnDoor && !isOnDoor) {
      this.controller.levelModel.actionPlane.findDoorToAnimate(new Position(-1, -1));
    }
  }

  handleMoveAwayFromPiston(moveOffset) {
    const formerPosition = Position.add(this.position, moveOffset);
    Position.getOrthogonalPositions(formerPosition).forEach(workingPos => {
      if (this.controller.levelModel.actionPlane.inBounds(workingPos)) {
        const block = this.controller.levelModel.actionPlane.getBlockAt(workingPos);
        if (block.blockType.startsWith("piston") && block.isPowered) {
          this.controller.levelModel.actionPlane.activatePiston(workingPos);
        }
      }
    });
  }

  handleGetOnRails(direction) {
    this.getOffTrack = false;
    this.handleMoveOffPressurePlate(new Position(0, 0));
    this.controller.levelView.playTrack(this.position, direction, true, this, null);
  }
};
