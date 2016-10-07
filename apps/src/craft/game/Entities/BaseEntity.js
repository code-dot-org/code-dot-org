import CommandQueue from "../CommandQueue/CommandQueue.js";
import LevelView from "../LevelMVC/LevelView.js"
import LevelModel from "../LevelMVC/LevelModel.js";
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
    }

    tick() {
        this.queue.tick();
    }

    reset() {

    }

    addCommand(commandQueueItem) {
        this.queue.addCommand(commandQueueItem);
        // execute the command
        this.queue.begin();
    }

    playMoveForwardAnimation(position, facing, commandQueueItem, groundType, completionHandler) {
        var levelModel = this.controller.levelModel, levelView = this.controller.levelView;
        var tween;
        // update z order
        var zOrderYIndex = position[1] + (facing === FacingDirection.Up ? 1 : 0);
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex) + 1;
        // stepping sound
        levelView.playBlockSound(groundType);
        // play walk animation
        var animName = "walk" + this.controller.levelView.getDirectionName(this.facing);
        levelView.playScaledSpeed(this.sprite.animations, animName);
        setTimeout(() => {
            tween = this.controller.levelView.addResettableTween(this.sprite).to({
                x: (this.offset[0] + 40 * position[0]), y: (this.offset[1] + 40 * position[1])
            }, 300, Phaser.Easing.Linear.None);
            tween.onComplete.add(() => {
                commandQueueItem.succeeded();
            });

            tween.start();
        }, 50);
        // smooth movement using tween

    }

    doMoveForward(commandQueueItem, forwardPosition) {
        var levelModel = this.controller.levelModel, levelView = this.controller.levelView;
        this.position = forwardPosition;
        // play sound effect
        let groundType = levelModel.groundPlane[levelModel.yToIndex(this.position[1]) + this.position[0]].blockType;
        // play move forward animation and play idle after that
        this.playMoveForwardAnimation(forwardPosition, this.facing, commandQueueItem, groundType, () => {
        });
    }

    bump(commandQueueItem) {
        // TODO: bump animation
        var animName = "bump";
        var facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.sprite.animations, animName + facingName);
        this.controller.delayPlayerMoveBy(400, 800, () => {
            commandQueueItem.succeeded();
        });
    }

    callBumpEvents(forwardPositionInformation) {
        for (var i = 1; i < forwardPositionInformation.length; i++) {
            // no events for block this time
            /*if (forwardPositionInformation[i] === 'notEmpty')
                this.controller.events.forEach(e => e({ eventType: 'blockTouched', blockReference: this.controller.levelModel.getForwardBlock(), blockType: this.controller.levelModel.getForwardBlockType() }));
            else*/
            if (forwardPositionInformation[i] === 'frontEntity') {
                this.controller.events.forEach(e => e({ eventType: EventType.WhenTouched, targetType: forwardPositionInformation[i + 1].type, eventSenderIdentifier: this.identifier, targetIdentifier: forwardPositionInformation[i + 1].identifier }));
                i++;
            }
        }
    }

    moveDirection(commandQueueItem, direction) {
        // update entity's direction
        this.controller.levelModel.turnToDirection(this, direction);
        this.moveForward(commandQueueItem);
    }

    moveForward(commandQueueItem) {
        let forwardPosition = this.controller.levelModel.getMoveForwardPosition(this);
        var forwardPositionInformation = this.controller.levelModel.canMoveForward(this);
        if (forwardPositionInformation[0]) {
            this.doMoveForward(commandQueueItem, forwardPosition);
            // not entity moved event
            //this.controller.events.forEach(e => e({ eventType: 'entityMoved', entityIdentifier: this.identifier }));
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
        var moveAwayPosition = moveAwayFrom.position;
        var bestPosition = [];
        let absoluteDistanceSquare = function (position1, position2) {
            return Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2);
        }
        let comparePositions = function (moveAwayPosition, position1, position2) {
            return absoluteDistanceSquare(position1[1], moveAwayPosition) < absoluteDistanceSquare(position2[1], moveAwayPosition) ? position2 : position1;
        }
        var currentDistance = absoluteDistanceSquare(moveAwayPosition, this.position);
        // this entity is on the right side and can move to right
        if (moveAwayPosition[0] <= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Right)[0]) {
            bestPosition = [FacingDirection.Right, [this.position[0] + 1, this.position[1]]];
        }
        // this entity is on the left side and can move to left
        if (moveAwayPosition[0] >= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Left)[0]) {
            if (bestPosition.length > 0)
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.Left, [this.position[0] - 1, this.position[1]]]);
            else
                bestPosition = [FacingDirection.Left, [this.position[0] - 1, this.position[1]]];
        }
        // this entity is on the up side and can move to up
        if (moveAwayPosition[1] >= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Up)[0]) {
            if (bestPosition.length > 0)
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.Up, [this.position[0], this.position[1] - 1]]);
            else
                bestPosition = [FacingDirection.Up, [this.position[0], this.position[1] - 1]];
        }
        // this entity is on the down side and can move to down
        if (moveAwayPosition[1] <= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Down)[0]) {
            if (bestPosition.length > 0)
                bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.Down, [this.position[0], this.position[1] + 1]]);
            else
                bestPosition = [FacingDirection.Down, [this.position[0], this.position[1] + 1]];
        }
        // terminate the action since it's impossible to move
        if (bestPosition.length === 0 || currentDistance >= absoluteDistanceSquare(moveAwayPosition, bestPosition[1]))
            commandQueueItem.succeeded();
        // execute the best result
        else
            this.moveDirection(commandQueueItem, bestPosition[0]);
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
        var moveTowardPosition = moveTowardTo.position;
        var bestPosition = [];
        let absoluteDistanceSquare = function (position1, position2) {
            return Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2);
        }
        let comparePositions = function (moveTowardPosition, position1, position2) {
            return absoluteDistanceSquare(position1[1], moveTowardPosition) > absoluteDistanceSquare(position2[1], moveTowardPosition) ? position2 : position1;
        }
        var currentDistance = absoluteDistanceSquare(moveTowardPosition, this.position);
        // this entity is on the right side and can move to right
        if (moveTowardPosition[0] >= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Right)[0]) {
            bestPosition = [FacingDirection.Right, [this.position[0] + 1, this.position[1]]];
        }
        // this entity is on the left side and can move to left
        if (moveTowardPosition[0] <= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Left)[0]) {
            if (bestPosition.length > 0)
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.Left, [this.position[0] - 1, this.position[1]]]);
            else
                bestPosition = [FacingDirection.Left, [this.position[0] - 1, this.position[1]]];
        }
        // this entity is on the up side and can move to up
        if (moveTowardPosition[1] <= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Up)[0]) {
            if (bestPosition.length > 0)
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.Up, [this.position[0], this.position[1] - 1]]);
            else
                bestPosition = [FacingDirection.Up, [this.position[0], this.position[1] - 1]];
        }
        // this entity is on the down side and can move to down
        if (moveTowardPosition[1] >= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.Down)[0]) {
            if (bestPosition.length > 0)
                bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.Down, [this.position[0], this.position[1] + 1]]);
            else
                bestPosition = [FacingDirection.Down, [this.position[0], this.position[1] + 1]];
        }
        // terminate the action since it's impossible to move
        if (bestPosition.length === 0) {
            commandQueueItem.succeeded();
            return false;
            // execute the best result
        } else {
            if (absoluteDistanceSquare(this.position, moveTowardPosition) === 1) {
                if (this.position[0] < moveTowardPosition[0])
                    this.facing = FacingDirection.Right;
                else if (this.position[0] > moveTowardPosition[0])
                    this.facing = FacingDirection.Left;
                else if (this.position[1] < moveTowardPosition[1])
                    this.facing = FacingDirection.Down;
                else if (this.position[1] > moveTowardPosition[1])
                    this.facing = FacingDirection.Up;
                this.updateAnimationDirection();
                this.controller.delayPlayerMoveBy(200, 800, () => {
                    commandQueueItem.succeeded();
                });
                return false;
            } else {
                this.moveDirection(commandQueueItem, bestPosition[0]);
                return true;
            }
        }
    }

    moveTo(commandQueueItem, moveTowardTo) {

        let absoluteDistanceSquare = function (position1, position2) {
            return Math.sqrt(Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2));
        }
        if (absoluteDistanceSquare(moveTowardTo.position, this.position) === 1) {
            /// north
            if (moveTowardTo.position[1] - this.position[1] == -1)
                this.moveDirection(commandQueueItem, FacingDirection.Up);
            else if (moveTowardTo.position[1] - this.position[1] == 1)
                this.moveDirection(commandQueueItem, FacingDirection.Down);
            else if (moveTowardTo.position[0] - this.position[0] == 1)
                this.moveDirection(commandQueueItem, FacingDirection.Right);
            else
                this.moveDirection(commandQueueItem, FacingDirection.Left);
        }
        else if (this.moveToward(commandQueueItem, moveTowardTo)) {
            var callbackCommand = new CallbackCommand(this.controller, () => { }, () => {
                this.moveTo(callbackCommand, moveTowardTo);
            }, this.identifier);
            this.addCommand(callbackCommand);
        }
        else {
            this.bump(commandQueueItem);
        }
    }

    turn(commandQueueItem, direction) {
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

    use(commandQueueItem, userEntity) {
        // default behavior for use ?
        this.queue.startPushHighpriorityCommands();
        this.controller.events.forEach(e => e({ eventType: EventType.WhenUsed, targetType: this.type, eventSenderIdentifier: userEntity.identifier, targetIdentifier: this.identifier }));
        this.queue.endPushHighpriorityCommands();
        commandQueueItem.succeeded();
    }

    drop(commandQueueItem, itemType) {
        var sprite = this.controller.levelView.createMiniBlock(this.position[0], this.position[1], itemType);
        sprite.sortOrder = this.controller.levelView.yToIndex(this.position[1]) + 2;
        this.controller.levelView.playScaledSpeed(sprite.animations, "animate");
        commandQueueItem.succeeded();
    }

    attack(commandQueueItem) {
        let facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "attack" + facingName);
        setTimeout(() => 
        {
            let frontEntity = this.controller.levelEntity.getEntityAt(this.controller.levelModel.getMoveForwardPosition(this));
            if (frontEntity !== null)
                this.controller.levelView.playScaledSpeed(frontEntity.sprite.animations, "hurt" + facingName);
            setTimeout(function (controller, entity, thisEntity) {
                if (entity !== null) {
                    frontEntity.queue.startPushHighpriorityCommands();
                    controller.events.forEach(e => e({ eventType: EventType.WhenAttacked, targetType: entity.type, eventSenderIdentifier: thisEntity.identifier, targetIdentifier: entity.identifier }))
                    frontEntity.queue.endPushHighpriorityCommands();
                }
                commandQueueItem.succeeded();
            }, 300, this.controller, frontEntity, this);
        }, 200);
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
            default:
        }

        animationName += facingName;
        this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
        this.controller.printErrorMsg(this.type + " calls animation : " + animationName + "\n");
    }

    updateAnimationDirection() {
        let facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + facingName);
    }

    getDistance(entity) {
        return Math.abs(Math.pow(this.position[0] - entity.position[0], 2) + Math.pow(this.position[1] - entity.position[1], 2));
    }

}