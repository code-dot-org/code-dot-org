import CommandQueue from "../CommandQueue/CommandQueue.js";
import FacingDirection from "../LevelMVC/FacingDirection.js";
import EventType from "../Event/EventType.js";
import CallbackCommand from "../CommandQueue/CallbackCommand.js";

export default class BaseEntity {
    constructor(controller, type, identifier, x, y, facing) {
        this.queue = new CommandQueue(controller);
        this.controller = controller;
        this.game = controller.game;
        this.position = [x, y];
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

    addCommand(commandQueueItem, repeat = false) {
        this.queue.addCommand(commandQueueItem, repeat);
        // execute the command
        this.queue.begin();
    }

    playMoveForwardAnimation(position, facing, commandQueueItem, groundType) {
        var levelView = this.controller.levelView;
        var tween;
        // update z order
        var zOrderYIndex = position[1] + (facing === FacingDirection.Up ? 1 : 0);
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex) + 1;
        // stepping sound
        levelView.playBlockSound(groundType);
        // play walk animation
        var animName = "walk" + this.controller.levelView.getDirectionName(this.facing);
        var idleAnimName = "idle" + this.controller.levelView.getDirectionName(this.facing);
        levelView.playScaledSpeed(this.sprite.animations, animName);
        setTimeout(() => {
            tween = this.controller.levelView.addResettableTween(this.sprite).to({
                x: (this.offset[0] + 40 * position[0]), y: (this.offset[1] + 40 * position[1])
            }, 300, Phaser.Easing.Linear.None);
            tween.onComplete.add(() => {
                levelView.playScaledSpeed(this.sprite.animations, idleAnimName);
                commandQueueItem.succeeded();
            });

            tween.start();
        }, 50);
        // smooth movement using tween

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
        var levelView = this.controller.levelView;
        let frontBlockCheck = function (entity, position) {
            let frontPosition = [position[0], position[1] + 1];
            if (frontPosition[1] < 10) {
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
            let frontPosition = [position[0], position[1] + 1];
            if (frontPosition[1] < 10) {
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
        let groundType = levelModel.groundPlane[levelModel.yToIndex(this.position[1]) + this.position[0]].blockType;
        // play move forward animation and play idle after that
        this.playMoveForwardAnimation(forwardPosition, this.facing, commandQueueItem, groundType, () => {
        });
        this.updateHidingTree();
        this.updateHidingBlock(prevPosition);
    }

    bump(commandQueueItem) {
        var animName = "bump";
        var facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.sprite.animations, animName + facingName);
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
            this.doMoveForward(commandQueueItem, forwardPosition);
        } else {
            this.bump(commandQueueItem);
            this.callBumpEvents(forwardPositionInformation);
        }
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
        let absoluteDistanceSquare = function (position1, position2) {
            return Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2);
        };
        let comparePositions = function (moveAwayPosition, position1, position2) {
            return absoluteDistanceSquare(position1[1], moveAwayPosition) < absoluteDistanceSquare(position2[1], moveAwayPosition) ? position2 : position1;
        };
        var currentDistance = absoluteDistanceSquare(moveAwayPosition, this.position);
        // this entity is on the right side and can move to right
        if (moveAwayPosition[0] <= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Right)[0]) {
            bestPosition = [FacingDirection.Right, [this.position[0] + 1, this.position[1]]];
        }
        // this entity is on the left side and can move to left
        if (moveAwayPosition[0] >= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Left)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.Left, [this.position[0] - 1, this.position[1]]]);
            } else {
                bestPosition = [FacingDirection.Left, [this.position[0] - 1, this.position[1]]];
            }
        }
        // this entity is on the up side and can move to up
        if (moveAwayPosition[1] >= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Up)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.Up, [this.position[0], this.position[1] - 1]]);
            } else {
                bestPosition = [FacingDirection.Up, [this.position[0], this.position[1] - 1]];
            }
        }
        // this entity is on the down side and can move to down
        if (moveAwayPosition[1] <= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Down)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.Down, [this.position[0], this.position[1] + 1]]);
            } else {
                bestPosition = [FacingDirection.Down, [this.position[0], this.position[1] + 1]];
            }
        }
        // terminate the action since it's impossible to move
        if (bestPosition.length === 0 || currentDistance >= absoluteDistanceSquare(moveAwayPosition, bestPosition[1])) {
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
        let absoluteDistanceSquare = function (position1, position2) {
            return Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2);
        };
        let comparePositions = function (moveTowardPosition, position1, position2) {
            return absoluteDistanceSquare(position1[1], moveTowardPosition) > absoluteDistanceSquare(position2[1], moveTowardPosition) ? position2 : position1;
        };
        // this entity is on the right side and can move to right
        if (moveTowardPosition[0] >= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Right)[0]) {
            bestPosition = [FacingDirection.Right, [this.position[0] + 1, this.position[1]]];
        }
        // this entity is on the left side and can move to left
        if (moveTowardPosition[0] <= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Left)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.Left, [this.position[0] - 1, this.position[1]]]);
            } else {
                bestPosition = [FacingDirection.Left, [this.position[0] - 1, this.position[1]]];
            }
        }
        // this entity is on the up side and can move to up
        if (moveTowardPosition[1] <= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Up)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.Up, [this.position[0], this.position[1] - 1]]);
            } else {
                bestPosition = [FacingDirection.Up, [this.position[0], this.position[1] - 1]];
            }
        }
        // this entity is on the down side and can move to down
        if (moveTowardPosition[1] >= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Down)[0]) {
            if (bestPosition.length > 0) {
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.Down, [this.position[0], this.position[1] + 1]]);
            } else {
                bestPosition = [FacingDirection.Down, [this.position[0], this.position[1] + 1]];
            }
        }
        // terminate the action since it's impossible to move
        if (absoluteDistanceSquare(this.position, moveTowardPosition) === 1) {
            if (this.position[0] < moveTowardPosition[0]) {
                this.facing = FacingDirection.Right;
            } else if (this.position[0] > moveTowardPosition[0]) {
                this.facing = FacingDirection.Left;
            } else if (this.position[1] < moveTowardPosition[1]) {
                this.facing = FacingDirection.Down;
            } else if (this.position[1] > moveTowardPosition[1]) {
                this.facing = FacingDirection.Up;
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

        let absoluteDistanceSquare = function (position1, position2) {
            return Math.sqrt(Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2));
        };
        if (absoluteDistanceSquare(moveTowardTo.position, this.position) === 1) {
            /// north
            if (moveTowardTo.position[1] - this.position[1] === -1) {
                this.moveDirection(commandQueueItem, FacingDirection.Up);
            } else if (moveTowardTo.position[1] - this.position[1] === 1) {
                this.moveDirection(commandQueueItem, FacingDirection.Down);
            } else if (moveTowardTo.position[0] - this.position[0] === 1) {
                this.moveDirection(commandQueueItem, FacingDirection.Right);
            } else {
                this.moveDirection(commandQueueItem, FacingDirection.Left);
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
        this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
        this.queue.startPushHighPriorityCommands();
        this.controller.events.forEach(e => e({ eventType: EventType.WhenUsed, targetType: this.type, eventSenderIdentifier: userEntity.identifier, targetIdentifier: this.identifier }));
        this.queue.endPushHighPriorityCommands();
        commandQueueItem.succeeded();
    }

    drop(commandQueueItem, itemType) {
        this.controller.addCommandRecord("drop", this.type, commandQueueItem.repeat);
        this.controller.levelView.playItemDropAnimation(this.position, itemType, () => {
            commandQueueItem.succeeded();

            if (this.controller.levelData.usePlayer) {
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
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "attack" + facingName);
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
            }, 300, entity.controller, frontEntity, entity);
        }, 200, this);
    }

    pushBack(commandQueueItem, pushDirection, movementTime, completionHandler) {
        var levelModel = this.controller.levelModel;
        var pushBackPosition = levelModel.getPushBackPosition(this, pushDirection);
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
                }, movementTime);
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
            levelView.playScaledSpeed(this.sprite.animations, "hurt" + facingName);
            setTimeout(() => {
                this.healthPoint--;
                callbackCommand.succeeded();
            }, 1500);
        } else {
            this.healthPoint--;
            this.sprite.animations.stop(null, true);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "die" + facingName);
            setTimeout(() => {
                var tween = this.controller.levelView.addResettableTween(this.sprite).to({
                    alpha: 0
                }, 300, Phaser.Easing.Linear.None);
                tween.onComplete.add(() => {
                    this.controller.levelEntity.destroyEntity(this.identifier);
                });
                tween.start();
            }, 1500);
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
        this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
    }

    updateAnimationDirection() {
        let facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + facingName);
    }

    getDistance(entity) {
        return Math.abs(Math.pow(this.position[0] - entity.position[0], 2) + Math.pow(this.position[1] - entity.position[1], 2));
    }

    blowUp(commandQueueItem, explosionPosition) {
        let pushBackDirection = FacingDirection.Down;
        if (explosionPosition[0] > this.position[0]) {
            pushBackDirection = FacingDirection.Left;
            this.facing = FacingDirection.Right;
            this.updateAnimationDirection();
        } else if (explosionPosition[0] < this.position[0]) {
            pushBackDirection = FacingDirection.Right;
            this.facing = FacingDirection.Left;
            this.updateAnimationDirection();
        } else if (explosionPosition[1] > this.position[1]) {
            pushBackDirection = FacingDirection.Up;
            this.facing = FacingDirection.Down;
            this.updateAnimationDirection();
        } else if (explosionPosition[1] < this.position[1]) {
            pushBackDirection = FacingDirection.Down;
            this.facing = FacingDirection.Up;
            this.updateAnimationDirection();
        }
        this.pushBack(commandQueueItem, pushBackDirection, 150, function (entity) {
            let callbackCommand = new CallbackCommand(entity.controller, () => { }, () => { entity.controller.destroyEntity(callbackCommand, entity.identifier); }, entity.identifier);
            entity.queue.startPushHighPriorityCommands();
            entity.addCommand(callbackCommand, commandQueueItem.repeat);
            entity.queue.endPushHighPriorityCommands();
        });

    }

}
