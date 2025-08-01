import * as Phaser from 'phaser';

import type BaseCommand from './BaseCommand';
import CommandQueue from './CommandQueue';
import CallbackCommand from './commands/CallbackCommand';
import {EventType} from './events';
import FacingDirection, {Direction} from './FacingDirection';
import type {LevelRunnerScene} from './GameController';
import LevelBlock from './level/LevelBlock';
import Position from './Position';

export interface Animation {
  // The position in the sprite atlas to find the animation frame
  offsets?: {
    up?: number[];
    down?: number[];
    right?: number[];
    left?: number[];
    upFrames?: number[];
    downFrames?: number[];
    rightFrames?: number[];
    leftFrames?: number[];
  };
  // Just give the frame numbers specifically
  frames?: number[];
  // The name of the spritesheet (atlas) to use
  atlas?: string;
  // The frame prefix in the atlas
  prefix: string;
  // The frame suffix in the atlas, if any
  suffix?: string;
  // The frame index padding. If 2, the frames are _00, _01, etc. (Default: 3)
  zeroPad?: number;
  // Keep track of animation end delays, if the animation is meant to be
  // stretched a little longer
  delay?: number;
  // The frame number to use when generating delay frames. Default is to just
  // copy the last frame in the offset ranges or frame list.
  delayFrame?: {
    up: number;
    down: number;
    right: number;
    left: number;
  };
  // Keep track of the framerates of particular animations, if different from
  // the base frameRate. This can be altered per-direction.
  fps?:
    | number
    | {
        up: number;
        down: number;
        left: number;
        right: number;
      };
  // Keep track of where the animation leads to when it completes to chain
  // animations together
  destination?: string | string[];
  // A function to determine the delay before going to the destination.
  // Useful for adding random delays between idle animations.
  destinationDelay?: () => number;
  // Whether or not this animation repeats (and the number of times, if so)
  repeat?: boolean | number;
  // Whether or not a sound is played when the animation starts
  sound?: string;
  // Whether or not a sound is played when the animation ends
  completeSound?: string;
  // On-complete callback
  onComplete?: () => void;
}

export interface Animations {
  [key: string]: Animation;
}

/**
 * The resulting metadata for a 'canPlace' query.
 */
export interface CanPlace {
  /** Whether or not placement is allowed at all */
  canPlace: boolean;
  /** Which plane or block should be placed on. Can be either 'groundPlane' or 'actionPlane' */
  plane: '' | 'groundPlane' | 'actionPlane';
}

class BaseEntity {
  scene: LevelRunnerScene;
  type: string;
  identifier: number | string;
  position: Position;
  facing: Direction;
  offset: [number, number];
  healthPoint: number;
  queue: CommandQueue;
  getOffTrack: boolean = false;
  underTree: {
    state: boolean;
    treeIndex: number;
  };
  sprite?: Phaser.GameObjects.Sprite;
  onTracks: boolean = false;
  entityName: string;
  isOnBlock: boolean = false;
  animations: Animations = {};

  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: number | string,
    x: number,
    y: number,
    facing: Direction,
  ) {
    this.queue = new CommandQueue(scene);
    this.scene = scene;
    this.position = new Position(x, y);
    this.type = type;
    // temp
    this.facing = facing;
    // offset for sprite position in grid
    this.offset = [-22, -12];
    this.identifier = identifier;
    this.healthPoint = 3;
    this.underTree = {state: false, treeIndex: -1};
    this.entityName = 'unknown';
  }

  tick() {
    this.queue.tick();
  }

  reset() {}

  canMoveThrough(): boolean {
    return false;
  }

  canPlaceBlock(_: LevelBlock): boolean {
    return false;
  }

  canTriggerPressurePlates(): boolean {
    return false;
  }

  /**
   * Whether or not the white "selection indicator" highlight square should
   * update to follow this entity around as it moves and interacts with the
   * world
   */
  shouldUpdateSelectionIndicator(): boolean {
    return false;
  }

  setMovePosition(position: Position) {
    this.position = position;
  }

  /**
   * For entities which need to be able to accomodate rendering in the same
   * cell as other entities, provide a way to define a rendering offset.
   *
   * @see LevelView.playPlayerAnimation
   * @see LevelView.playMoveForwardAnimation
   */
  getSortOrderOffset(): number {
    return 5;
  }

  addCommand(commandQueueItem: BaseCommand, repeat: boolean = false) {
    this.queue.addCommand(commandQueueItem, repeat);
    // execute the command
    this.queue.begin();
  }

  getAnimation(action: string): string {
    return `${this.entityName}-${action}-${this.scene.levelView.getDirectionName(this.facing)}`;
  }

  playMoveForwardAnimation(
    position: Position,
    facing: Direction,
    commandQueueItem: BaseCommand,
    groundType: string,
  ) {
    // update z order
    const zOrderYIndex =
      position.y + (facing === FacingDirection.North ? 1 : 0);
    this.sprite?.setDepth(zOrderYIndex);
    // stepping sound
    this.scene.levelView.playBlockSound(groundType);
    // play walk animation
    this.play('walk');
    setTimeout(() => {
      const tween = this.scene.tweens.add({
        targets: this.sprite,
        x: this.offset[0] + 40 * position.x,
        y: this.offset[1] + 40 * position.y,
        duration: 300,
        ease: 'Linear',
        onComplete: () => {
          this.play('idle');
          commandQueueItem.succeeded();
        },
      });
      this.scene.levelView.addResettableTween(tween);
      tween.play();
    }, 50 / this.scene.tweenTimeScale);
  }

  /**
   * Player walkable stuff.
   */
  walkableCheck(_: LevelBlock) {
    // Do nothing.
  }

  updateHidingTree() {
    const levelView = this.scene.levelView;

    // this is not under tree
    if (!this.underTree.state) {
      const treeList = levelView.trees;
      for (let i = 0; i < treeList.length; i++) {
        if (levelView.isUnderTree(i, this.position)) {
          levelView.changeTreeAlpha(i, 0.8);
          this.underTree = {state: true, treeIndex: i};
          break;
        }
      }
      // this is under tree
    } else {
      const currentTreeIndex = this.underTree.treeIndex;
      const entities = this.scene.levelEntity.entityMap;
      const isOtherEntityUnderTree = (
        currentEntity: BaseEntity,
        entities: Map<string | number, BaseEntity>,
        currentTreeIndex: number,
      ) => {
        for (const value of entities) {
          const entity = value[1];
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
        this.underTree = {state: false, treeIndex: -1};
      }
    }
  }

  updateHidingBlock(prevPosition?: Position) {
    const levelView = this.scene.levelView;
    const actionPlane = this.scene.levelModel.actionPlane;

    const frontBlockCheck = (entity: BaseEntity, position: Position) => {
      const frontPosition = Position.south(position);
      const frontBlock = actionPlane.getBlockAt(frontPosition);
      if (frontBlock && !frontBlock.isTransparent) {
        const sprite = levelView.actionPlaneBlocks.get(levelView.coordinatesToIndex(frontPosition));
        if (sprite) {
          const tween = this.scene.tweens.add({
            targets: sprite,
            alpha: 0.8,
            duration: 300,
          });
          tween.play();
        }
      }
    };

    const prevBlockCheck = (entity: BaseEntity, position: Position) => {
      const frontPosition = Position.south(position);
      if (frontPosition.y < 10) {
        const sprite = levelView.actionPlaneBlocks.get(levelView.coordinatesToIndex(frontPosition));
        if (sprite) {
          const tween = this.scene.tweens.add({
            targets: sprite,
            alpha: 1,
            duration: 300,
          });
          tween.play();
        }
      }
    };

    if (!this.isOnBlock) {
      frontBlockCheck(this, this.position);
    }

    if (prevPosition) {
      prevBlockCheck(this, prevPosition);
    }
  }

  doMoveForward(commandQueueItem: BaseCommand, forwardPosition: Position) {
    const levelModel = this.scene.levelModel;
    const prevPosition = this.position;
    this.position = forwardPosition;
    // play sound effect
    const groundType = levelModel.groundPlane.getBlockAt(
      this.position,
    )?.blockType || '';
    // play move forward animation and play idle after that
    this.playMoveForwardAnimation(
      forwardPosition,
      this.facing,
      commandQueueItem,
      groundType,
    );
    this.updateHidingTree();
    this.updateHidingBlock(prevPosition);
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

  callBumpEvents(forwardPositionInformation) {
    for (let i = 1; i < forwardPositionInformation.length; i++) {
      if (forwardPositionInformation[i] === 'frontEntity') {
        this.scene.events.emit(EventType.WhenTouched, {
          targetType: forwardPositionInformation[i + 1].type,
          eventSenderIdentifier: this.identifier,
          targetIdentifier: forwardPositionInformation[i + 1].identifier,
        });
        i++;
      }
    }
  }

  moveDirection(commandQueueItem: BaseCommand, direction: Direction) {
    // update entity's direction
    this.scene.levelModel.turnToDirection(this, direction);
    this.moveForward(commandQueueItem, false);
  }

  moveForward(commandQueueItem: BaseCommand, record: boolean = true) {
    if (record) {
      this.scene.addCommandRecord(
        'moveForward',
        this.type,
        commandQueueItem.repeat,
      );
    }
    const forwardPosition = this.scene.levelModel.getMoveForwardPosition(this);
    const forwardPositionInformation =
      this.scene.levelModel.canMoveForward(this);
    if (forwardPositionInformation) {
      const offset = Position.directionToOffsetPosition(this.facing);
      const reverseOffset = Position.directionToOffsetPosition(
        FacingDirection.opposite(this.facing),
      );
      const weMovedOnTo = this.handleMoveOnPressurePlate(offset);
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

  moveBackward(commandQueueItem: BaseCommand, record: boolean = true) {
    if (record) {
      this.scene.addCommandRecord(
        'moveBackward',
        this.type,
        commandQueueItem.repeat,
      );
    }
    const backwardPosition = this.scene.levelModel.getMoveDirectionPosition(
      this,
      2,
    );
    const backwardPositionInformation =
      this.scene.levelModel.canMoveBackward(this);
    if (backwardPositionInformation[0]) {
      const offset = Position.directionToOffsetPosition(
        FacingDirection.opposite(this.facing),
      );
      const reverseOffset = Position.directionToOffsetPosition(this.facing);
      const weMovedOnTo = this.handleMoveOnPressurePlate(offset);
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
   * Check whether or not the entity can place the given block on top of the
   * given block
   *
   * @param {LevelBlock} [toPlaceBlock]
   * @param {LevelBlock} [onTopOfBlock]
   */
  canPlaceBlockOver(
    _toPlaceBlock: LevelBlock,
    _onTopOfBlock: LevelBlock,
  ): CanPlace {
    return {
      canPlace: false,
      plane: '',
    };
  }

  /**
   * Check all the movable points and choose the farthest one
   */
  moveAway(commandQueueItem: BaseCommand, moveAwayFrom: BaseEntity) {
    this.scene.addCommandRecord('moveAway', this.type, commandQueueItem.repeat);
    const moveAwayPosition = moveAwayFrom.position;
    let bestPosition: [Direction, Position] | undefined;
    const comparePositions: (moveAwayPosition: Position, position1: [Direction, Position], position2: [Direction, Position]) => [Direction, Position] = (
      moveAwayPosition,
      position1,
      position2,
    ) => {
      return Position.absoluteDistanceSquare(position1[1], moveAwayPosition) <
        Position.absoluteDistanceSquare(position2[1], moveAwayPosition)
        ? position2
        : position1;
    };

    const currentDistance = Position.absoluteDistanceSquare(
      moveAwayPosition,
      this.position,
    );
    // this entity is on the right side and can move to right
    if (
      moveAwayPosition.x <= this.position.x &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.East)[0]
    ) {
      bestPosition = [FacingDirection.East, Position.east(this.position)];
    }
    // this entity is on the left side and can move to left
    if (
      moveAwayPosition.x >= this.position.x &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.West)[0]
    ) {
      if (bestPosition) {
        bestPosition = comparePositions(moveAwayPosition, bestPosition, [
          FacingDirection.West,
          Position.west(this.position),
        ]);
      } else {
        bestPosition = [FacingDirection.West, Position.west(this.position)];
      }
    }
    // this entity is on the up side and can move to up
    if (
      moveAwayPosition.y >= this.position.y &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.North)[0]
    ) {
      if (bestPosition) {
        bestPosition = comparePositions(moveAwayPosition, bestPosition, [
          FacingDirection.North,
          Position.north(this.position),
        ]);
      } else {
        bestPosition = [FacingDirection.North, Position.north(this.position)];
      }
    }
    // this entity is on the down side and can move to down
    if (
      moveAwayPosition.y <= this.position.y &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.South)[0]
    ) {
      if (bestPosition) {
        bestPosition = comparePositions(moveAwayPosition, bestPosition, [
          FacingDirection.South,
          Position.south(this.position),
        ]);
      } else {
        bestPosition = [FacingDirection.South, Position.south(this.position)];
      }
    }
    // terminate the action since it's impossible to move
    if (
      bestPosition === undefined ||
      currentDistance >=
        Position.absoluteDistanceSquare(moveAwayPosition, bestPosition[1])
    ) {
      commandQueueItem.succeeded();
    } else {
      // execute the best result
      this.moveDirection(commandQueueItem, bestPosition[0]);
    }
  }

  /**
   * Check all the movable points and choose the farthest one
   */
  moveToward(commandQueueItem: BaseCommand, moveTowardTo: BaseEntity) {
    this.scene.addCommandRecord(
      'moveToward',
      this.type,
      commandQueueItem.repeat,
    );
    const moveTowardPosition = moveTowardTo.position;
    let bestPosition: [Direction, Position] | undefined;
    const comparePositions: (moveTowardPosition: Position, position1: [Direction, Position], position2: [Direction, Position]) => [Direction, Position] = (
      moveTowardPosition,
      position1,
      position2,
    ) => {
      return Position.absoluteDistanceSquare(position1[1], moveTowardPosition) >
        Position.absoluteDistanceSquare(position2[1], moveTowardPosition)
        ? position2
        : position1;
    };

    // this entity is on the right side and can move to right
    if (
      moveTowardPosition.x >= this.position.x &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.East)[0]
    ) {
      bestPosition = [FacingDirection.East, Position.east(this.position)];
    }
    // this entity is on the left side and can move to left
    if (
      moveTowardPosition.x <= this.position.x &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.West)[0]
    ) {
      if (bestPosition) {
        bestPosition = comparePositions(moveTowardPosition, bestPosition, [
          FacingDirection.West,
          Position.west(this.position),
        ]);
      } else {
        bestPosition = [FacingDirection.West, Position.west(this.position)];
      }
    }
    // this entity is on the up side and can move to up
    if (
      moveTowardPosition.y <= this.position.y &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.North)[0]
    ) {
      if (bestPosition) {
        bestPosition = comparePositions(moveTowardPosition, bestPosition, [
          FacingDirection.North,
          Position.north(this.position),
        ]);
      } else {
        bestPosition = [FacingDirection.North, Position.north(this.position)];
      }
    }
    // this entity is on the down side and can move to down
    if (
      moveTowardPosition.y >= this.position.y &&
      this.scene.levelModel.canMoveDirection(this, FacingDirection.South)[0]
    ) {
      if (bestPosition) {
        bestPosition = comparePositions(moveTowardPosition, bestPosition, [
          FacingDirection.South,
          Position.south(this.position),
        ]);
      } else {
        bestPosition = [FacingDirection.South, Position.south(this.position)];
      }
    }
    // terminate the action since it's impossible to move
    if (
      Position.absoluteDistanceSquare(this.position, moveTowardPosition) === 1
    ) {
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
      if (!bestPosition) {
        commandQueueItem.succeeded();
        return false;
        // execute the best result
      } else {
        this.moveDirection(commandQueueItem, bestPosition[0]);
        return true;
      }
    }
  }

  moveTo(commandQueueItem: BaseCommand, moveTowardTo: BaseEntity) {
    if (
      Position.absoluteDistanceSquare(moveTowardTo.position, this.position) ===
      1
    ) {
      // North
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
      const callbackCommand = new CallbackCommand(
        this.scene,
        () => {},
        this.identifier,
        () => {},
        () => {
          this.moveTo(callbackCommand, moveTowardTo);
        },
      );
      this.addCommand(callbackCommand);
    } else {
      this.bump(commandQueueItem);
    }
  }

  turn(
    commandQueueItem: BaseCommand,
    direction: 1 | -1,
    record: boolean = true,
  ) {
    if (record) {
      this.scene.addCommandRecord('turn', this.type, commandQueueItem.repeat);
    }

    // Update entity direction
    if (direction === -1) {
      this.scene.levelModel.turnLeft(this);
    }

    if (direction === 1) {
      this.scene.levelModel.turnRight(this);
    }

    // Update animation
    this.updateAnimationDirection();
    this.scene.delayPlayerMoveBy(200, 800, () => {
      commandQueueItem.succeeded();
    });
  }

  turnRandom(commandQueueItem: BaseCommand) {
    this.scene.addCommandRecord(
      'turnRandom',
      this.type,
      commandQueueItem.repeat,
    );
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.turn(commandQueueItem, direction, false);
  }

  use(commandQueueItem: BaseCommand, userEntity: BaseEntity) {
    this.play('lookAtCam');
    this.queue.startPushHighPriorityCommands();
    this.scene.events.emit(EventType.WhenUsed, {
      targetType: this.type,
      eventSenderIdentifier: userEntity.identifier,
      targetIdentifier: this.identifier,
    });
    this.queue.endPushHighPriorityCommands();
    commandQueueItem.succeeded();
  }

  drop(commandQueueItem: BaseCommand, itemType: string) {
    this.scene.addCommandRecord('drop', this.type, commandQueueItem.repeat);
    this.scene.levelView.playItemDropAnimation(this.position, itemType, () => {
      commandQueueItem.succeeded();

      if (this.scene.levelModel.usePlayer) {
        const playerCommand = this.scene.levelModel.player?.queue.currentCommand;
        if (playerCommand && playerCommand.waitForOtherQueue) {
          playerCommand.succeeded();
        }
      }
    });
  }

  attack(commandQueueItem: BaseCommand) {
    this.scene.addCommandRecord('attack', this.type, commandQueueItem.repeat);
    this.play('attack');
    setTimeout(() => {
      const frontEntity = this.scene.levelEntity.getEntityAt(
        this.scene.levelModel.getMoveForwardPosition(this),
      );

      if (frontEntity) {
        const callbackCommand = new CallbackCommand(
          this.scene,
          () => {},
          frontEntity.identifier,
          () => {},
          () => {
            frontEntity.takeDamage(callbackCommand);
          },
        );
        frontEntity.addCommand(callbackCommand);
      }

      setTimeout(() => {
        if (frontEntity) {
          frontEntity.queue.startPushHighPriorityCommands();
          this.scene.events.emit(EventType.WhenAttacked, {
            targetType: frontEntity.type,
            eventSenderIdentifier: this.identifier,
            targetIdentifier: frontEntity.identifier,
          });
          frontEntity.queue.endPushHighPriorityCommands();
        }
        commandQueueItem.succeeded();
      }, 300 / this.scene.tweenTimeScale);
    }, 200 / this.scene.tweenTimeScale);
  }

  pushBack(
    commandQueueItem: BaseCommand,
    pushDirection: Direction,
    movementTime: number,
    completionHandler?: (entity: BaseEntity) => void,
  ) {
    const levelModel = this.scene.levelModel;
    const pushBackPosition = Position.forward(this.position, pushDirection);
    const canMoveBack = levelModel.isPositionEmpty(pushBackPosition)[0];
    if (canMoveBack) {
      this.updateHidingBlock(this.position);
      this.position = pushBackPosition;
      this.updateHidingTree();
      const tween = this.scene.tweens.add({
        targets: this.sprite,
        x: this.offset[0] + 40 * this.position.x,
        y: this.offset[1] + 40 * this.position.y,
        duration: movementTime,
        ease: 'Linear',
        onComplete: () => {
          setTimeout(() => {
            commandQueueItem.succeeded();
            completionHandler?.(this);
          }, movementTime / this.scene.tweenTimeScale);
        },
      });

      tween.play();
    } else {
      commandQueueItem.succeeded();
      completionHandler?.(this);
    }
  }

  takeDamage(callbackCommand: CallbackCommand) {
    if (this.healthPoint > 1) {
      this.play('hurt');
      setTimeout(() => {
        this.healthPoint--;
        callbackCommand.succeeded();
      }, 1500 / this.scene.tweenTimeScale);
    } else {
      this.healthPoint--;
      this.stop();
      this.play('die');
      setTimeout(() => {
        const tween = this.scene.tweens.add({
          targets: this.sprite,
          alpha: 0,
          duration: 300,
          ease: 'Linear',
          onComplete: () => {
            this.scene.levelEntity.destroyEntity(this.identifier);
          },
        });
        tween.play();
      }, 1500 / this.scene.tweenTimeScale);
    }
  }

  updateAnimationDirection() {
    this.play('idle');
  }

  getDistance(entity: BaseEntity) {
    return Position.absoluteDistanceSquare(this.position, entity.position);
  }

  blowUp(commandQueueItem: BaseCommand, explosionPosition: Position) {
    let pushBackDirection: Direction = Direction.South;
    if (explosionPosition.x > this.position.x) {
      pushBackDirection = FacingDirection.West;
      this.facing = FacingDirection.East;
      this.updateAnimationDirection();
    } else if (explosionPosition.x < this.position.x) {
      pushBackDirection = FacingDirection.East;
      this.facing = FacingDirection.West;
      this.updateAnimationDirection();
    } else if (explosionPosition.y > this.position.y) {
      pushBackDirection = FacingDirection.North;
      this.facing = FacingDirection.South;
      this.updateAnimationDirection();
    } else if (explosionPosition.y < this.position.y) {
      pushBackDirection = FacingDirection.South;
      this.facing = FacingDirection.North;
      this.updateAnimationDirection();
    }

    this.pushBack(commandQueueItem, pushBackDirection, 150, entity => {
      const callbackCommand = new CallbackCommand(
        entity.scene,
        () => {},
        entity.identifier,
        () => {},
        () => {
          entity.scene.destroyEntity(callbackCommand, entity.identifier);
        },
      );
      entity.queue.startPushHighPriorityCommands();
      entity.addCommand(callbackCommand, commandQueueItem.repeat);
      entity.queue.endPushHighPriorityCommands();
    });
  }

  hasPermissionToWalk(
    actionBlock: LevelBlock,
    frontEntity?: BaseEntity,
    groundBlock?: LevelBlock,
  ): boolean {
    return (
      (actionBlock.isWalkable ||
        (frontEntity !== undefined &&
          frontEntity.isOnBlock &&
          // action plane is empty
          !actionBlock.isEmpty)) &&
      // there is no entity
      (frontEntity === undefined || frontEntity.canMoveThrough()) &&
      // no lava or water
      groundBlock?.blockType !== 'water' &&
      groundBlock?.blockType !== 'lava'
    );
  }

  handleMoveOffPressurePlate(moveOffset: Position) {
    const previousPosition = Position.add(this.position, moveOffset);
    const isMovingOffOf =
      this.scene.levelModel.actionPlane.getBlockAt(previousPosition)?.blockType === 'pressurePlateDown';
    const destinationBlock = this.scene.levelModel.actionPlane.getBlockAt(
      this.position,
    );

    let remainOn = false;
    if (destinationBlock === undefined || !destinationBlock.isWalkable) {
      remainOn = true;
    }

    this.scene.levelEntity.entityMap.forEach(workingEntity => {
      if (
        workingEntity.identifier !== this.identifier &&
        workingEntity.canTriggerPressurePlates() &&
        Position.equals(workingEntity.position, previousPosition)
      ) {
        remainOn = true;
      }
    });

    if (isMovingOffOf && !remainOn) {
      this.scene.audioPlayer.play('pressurePlateClick');
      const block = new LevelBlock('pressurePlateUp');
      this.scene.levelModel.actionPlane.setBlockAt(previousPosition, block);
    }
  }

  handleMoveOnPressurePlate(moveOffset: Position): boolean {
    const targetPosition = Position.add(this.position, moveOffset);
    const isMovingOnToPlate =
      this.scene.levelModel.actionPlane.getBlockAt(targetPosition)?.blockType === 'pressurePlateUp';
    if (isMovingOnToPlate) {
      this.scene.audioPlayer.play('pressurePlateClick');
      const block = new LevelBlock('pressurePlateDown');
      this.scene.levelModel.actionPlane.setBlockAt(targetPosition, block);
      return true;
    }
    return false;
  }

  handleMoveOffIronDoor(moveOffset: Position) {
    const formerPosition = Position.add(this.position, moveOffset);
    if (!this.scene.levelModel.inBounds(formerPosition)) {
      return;
    }

    const wasOnDoor =
      this.scene.levelModel.actionPlane.getBlockAt(formerPosition)?.blockType === 'doorIron';
    const isOnDoor =
      this.scene.levelModel.actionPlane.getBlockAt(this.position)?.blockType === 'doorIron';
    if (wasOnDoor && !isOnDoor) {
      this.scene.levelModel.actionPlane.findDoorToAnimate(new Position(-1, -1));
    }
  }

  handleMoveAwayFromPiston(moveOffset: Position) {
    const formerPosition = Position.add(this.position, moveOffset);
    Position.getOrthogonalPositions(formerPosition).forEach(workingPos => {
      if (this.scene.levelModel.actionPlane.inBounds(workingPos)) {
        const block = this.scene.levelModel.actionPlane.getBlockAt(workingPos);
        if (block && block.blockType.startsWith('piston') && block.isPowered) {
          this.scene.levelModel.actionPlane.activatePiston(workingPos);
        }
      }
    });
  }

  handleGetOnRails(direction: Direction) {
    this.getOffTrack = false;
    this.handleMoveOffPressurePlate(new Position(0, 0));
    this.scene.levelView.playTrack(this.position, direction, true, this, null);
  }

  /**
   * Plays the given action as the animation.
   *
   * This will negotiate with the animations that have been provided for this
   * entity and pick the one that matches the current direction the entity is
   * facing.
   */
  play(action: string, onComplete?: () => void) {
    const animationName = this.getAnimation(action);
    const animationInfo = this.animations[action];
    const repeated = animationInfo?.repeat;

    if (!this.scene.anims.exists(animationName)) {
      console.warn(`${animationName} animation does not exist!`);
    } else {
      if (onComplete) {
        this.sprite?.on(
          `${repeated === true ? Phaser.Animations.Events.ANIMATION_REPEAT : Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animationName}`,
          onComplete
        );
      }
      this.sprite?.anims.play(animationName);
    }
  }

  /**
   * Stops any active animation for the entity's sprite.
   */
  stop() {
    this.sprite?.anims.stop();
  }
  
  destroy() {
    this.reset();
    this.stop();
    this.sprite?.destroy();
  }

  /**
   * Registers all animations listed within the provided data.
   */
  registerAnimations(animations: Animations, frameRate: number, atlas: string) {
    // The name of the entity when defining the global animation name
    const entityName = this.entityName;
    this.animations = animations;

    for (const [action, info] of Object.entries(animations)) {
      // Determine animation delay, which is a padding at the end of the
      // animation to make it a little longer
      const frameDelay = info.delay || 0;
      const destination: string | string[] | undefined = info.destination;
      const frameName = info.prefix;

      for (let i = 0; i < 4; i++) {
        const facingName = this.scene.levelView.getDirectionName(i);
        const offset: number[] | undefined = info.offsets?.[facingName];

        // Build the animation name. {entityName}-${action}-${facing}
        // i.e. 'player-lookAtCam-left'
        const animationName = `${entityName}-${action}-${facingName}`;

        // Get the frame names that match the atlas
        const frames: number[] =
          info.offsets?.[`${facingName}Frames`] || info.frames || [];
        const frameList: Phaser.Types.Animations.AnimationFrame[] =
          frames.length > 0
            ? frames.map(index =>
                // Generate the frame name from the index
                ({
                  key: info.atlas || atlas,
                  frame: `${info.prefix}${index.toString().padStart(info.zeroPad || 3, '0')}${info.suffix || ''}`,
                }),
              )
            : offset
              ? this.scene.anims.generateFrameNames(info.atlas || atlas, {
                  start: offset[0],
                  end: offset[1],
                  zeroPad: info.zeroPad || 3,
                  prefix: frameName,
                  suffix: info.suffix || '',
                })
              : [];

        const fps: number = (info.fps ? typeof info.fps === 'number' ? info.fps : info.fps[facingName] : frameRate) || frameRate;

        // Skip, if there are no animation frames to register
        if (frameList.length === 0) {
          continue;
        }

        // Add animation delay to the end of the animation, if requested
        const delayFrame = info.delayFrame
          ? {
              key: info.atlas || atlas,
              frame: `${info.prefix}${(info.delayFrame.up ? info.delayFrame[facingName] : info.delayFrame).toString().padStart(info.zeroPad || 3, '0')}${info.suffix || ''}`,
            }
          : frameList[frameList.length - 1];
        for (let j = 0; j < frameDelay; j++) {
          frameList.push(delayFrame);
        }

        // Create the global animation, if it doesn't already exist
        if (!this.scene.anims.exists(animationName)) {
          this.scene.anims.create({
            key: animationName,
            frames: frameList,
            frameRate: this.scene.originalFpsToScaled(fps),
            repeat: info.repeat === true ? -1 : !info.repeat ? 0 : info.repeat,
          });
        }

        // If specified, play the given animation next once this one completes
        if (destination || info.completeSound || info.onComplete) {
          this.sprite?.on(
            `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animationName}`,
            () => {
              // If the destination is an array, randomly pick one
              if (Array.isArray(destination)) {
                this.play(
                  destination[Math.floor(Math.random() * destination.length)],
                );
              } else if (destination) {
                // Otherwise, play the desired animation on complete of this one.
                if (info.destinationDelay) {
                  setTimeout(() => {
                    this.play(destination);
                  }, info.destinationDelay());
                } else {
                  this.play(destination);
                }
              }

              // Play the requested on-end sound
              if (info.completeSound) {
                this.play(info.completeSound);
              }

              // Callback
              info.onComplete?.();
            },
          );
        }

        // If specified, play a sound when the animation starts
        if (info.sound) {
          this.sprite?.on(
            `${Phaser.Animations.Events.ANIMATION_START}${animationName}`,
            () => {
              if (info.sound) {
                this.scene.levelView.audioPlayer.play(info.sound);
              }
            },
          );
        }
      }
    }
  }
}

export default BaseEntity;
