import FacingDirection, {Direction} from '../FacingDirection';
import Position from '../Position';

import AdjacencySet from './AdjacencySet';
import LevelBlock from './LevelBlock';
import type LevelModel from './LevelModel';

function connectionName(connection?: Direction): string {
  if (connection === Direction.North) {
    return 'North';
  } else if (connection === Direction.South) {
    return 'South';
  } else if (connection === Direction.East) {
    return 'East';
  } else if (connection === Direction.West) {
    return 'West';
  }

  return '';
}

const RedstoneCircuitConnections: string[] = [
  '',
  'Vertical',
  'Vertical',
  'Vertical',
  'Horizontal',
  'UpRight',
  'DownRight',
  'TRight',
  'Horizontal',
  'UpLeft',
  'DownLeft',
  'TLeft',
  'Horizontal',
  'TUp',
  'TDown',
  'Cross',
];

const RailConnectionPriority: Direction[][] = [
  [],
  [Direction.North],
  [Direction.South],
  [Direction.North, Direction.South],
  [Direction.East],
  [Direction.North, Direction.East],
  [Direction.South, Direction.East],
  [Direction.South, Direction.East],
  [Direction.West],
  [Direction.North, Direction.West],
  [Direction.South, Direction.West],
  [Direction.South, Direction.West],
  [Direction.East, Direction.West],
  [Direction.North, Direction.East],
  [Direction.South, Direction.East],
  [Direction.North, Direction.East],
];

const PoweredRailConnectionPriority: Direction[][] = [
  [],
  [Direction.North],
  [Direction.South],
  [Direction.North, Direction.South],
  [Direction.East],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
  [Direction.West],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
  [Direction.East, Direction.West],
];

class LevelPlane {
  protected data: LevelBlock[];
  protected width: number;
  protected height: number;
  protected levelModel: LevelModel;
  protected planeType: string;
  protected playPistonOn: boolean;
  protected playPistonOff: boolean;
  protected redstoneAdjacencySet: AdjacencySet;

  constructor(
    planeData: string[],
    width: number,
    height: number,
    levelModel: LevelModel,
    planeType: string,
  ) {
    this.data = [];
    this.width = width;
    this.height = height;
    this.levelModel = levelModel;
    this.planeType = planeType;
    this.playPistonOn = false;
    this.playPistonOff = false;

    for (let index = 0; index < planeData.length; index++) {
      const block = new LevelBlock(planeData[index]);
      this.data.push(block);
    }

    if (this.isActionPlane()) {
      this.redstoneAdjacencySet = this.createRedstoneAdjacencySet();
    } else {
      this.redstoneAdjacencySet = new AdjacencySet([]);
    }
  }

  /**
   * Determines whether the position in question is within the bounds of the plane.
   */
  inBounds(position: Position) {
    return (
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    );
  }

  /**
   * Converts coordinates to a index
   */
  coordinatesToIndex(position: Position) {
    return position.y * this.width + position.x;
  }

  /**
   * Determines the positional coordinates given a specific index.
   */
  indexToCoordinates(index: number) {
    const y = Math.floor(index / this.width);
    const x = index - y * this.width;
    return new Position(x, y);
  }

  /**
   * Retrieve all the [x, y] coordinates within this plane as Position objects.
   */
  getAllPositions(): Position[] {
    return this.data.map((_: LevelBlock, i: number) => {
      return this.indexToCoordinates(i);
    });
  }

  /**
   * Gets the block at the desired position within the plane, optionally with an
   * offset
   *
   * @param position - [x, y] coordinates of block
   */
  getBlockAt(position: Position): LevelBlock | undefined {
    if (this.inBounds(position)) {
      return this.data[this.coordinatesToIndex(position)];
    }
  }

  isActionPlane(): boolean {
    return this.planeType === 'actionPlane';
  }

  isDecorationPlane(): boolean {
    return this.planeType === 'decorationPlane';
  }

  isGroundPlane(): boolean {
    return this.planeType === 'groundPlane';
  }

  /**
   * Changes the block at a desired position to the desired block.
   * Important note: This is the cornerstone of block placing/destroying.
   */
  setBlockAt(position: Position, block: LevelBlock): LevelBlock | undefined {
    if (!this.inBounds(position)) {
      return;
    }

    this.data[this.coordinatesToIndex(position)] = block;

    if (this.isActionPlane()) {
      if (block.isRedstone || block.isRedstoneBattery) {
        this.redstoneAdjacencySet.add(position);
      } else {
        this.redstoneAdjacencySet.remove(position);
      }

      let redstoneToRefresh: Position[] = [];
      if (block.needToRefreshRedstone()) {
        redstoneToRefresh = this.refreshRedstone();
      }

      this.updateWeakCharge(position, block);

      // if we've just removed a block, clean up any rail connections that were
      // formerly connected to this block
      if (block.isEmpty) {
        [Direction.North, Direction.South, Direction.East, Direction.West].forEach(direction => {
          // if the block in the given cardinal direction is a rail block with a
          // connection to this one, sever that connection
          const offset = Position.directionToOffsetPosition(direction);
          const adjacentBlock = this.getBlockAt(Position.add(position, offset));
          if (adjacentBlock && adjacentBlock.isRail) {
            if (adjacentBlock.connectionA === FacingDirection.opposite(direction)) {
              adjacentBlock.connectionA = undefined;
            }
            if (adjacentBlock.connectionB === FacingDirection.opposite(direction)) {
              adjacentBlock.connectionB = undefined;
            }
          }
        });
      }
      this.determineRailType(position, true);

      if (this.levelModel && this.levelModel.scene.levelView) {
        const northEast = Position.north(Position.east(position));
        const southWest = Position.south(Position.west(position));
        const positionAndTouching = Position.getOrthogonalPositions(
          position,
        ).concat([position, northEast, southWest]);
        this.levelModel.scene.levelView.refreshActionGroup(positionAndTouching);
        this.levelModel.scene.levelView.refreshActionGroup(redstoneToRefresh);
      }
    } else if (this.isGroundPlane()) {
      this.levelModel.scene.levelView.refreshGroundGroup();
    }

    this.resolveConduitState();

    return block;
  }

  /**
   * Gets the blocks within orthogonal positions around a given position.
   * Important note: This DOES to bounds checking. Will be undefined if OOB.
   */
  getOrthogonalBlocks(position: Position): {
    north: {
      block?: LevelBlock;
      relative: Direction;
    };
    south: {
      block?: LevelBlock;
      relative: Direction;
    };
    east: {
      block?: LevelBlock;
      relative: Direction;
    };
    west: {
      block?: LevelBlock;
      relative: Direction;
    };
  } {
    return {
      north: {
        block: this.getBlockAt(Position.north(position)),
        relative: Direction.South,
      },
      south: {
        block: this.getBlockAt(Position.south(position)),
        relative: Direction.North,
      },
      east: {
        block: this.getBlockAt(Position.east(position)),
        relative: Direction.West,
      },
      west: {
        block: this.getBlockAt(Position.west(position)),
        relative: Direction.East,
      },
    };
  }

  /**
   * Gets the blocks surrounding a given position.
   * Important note: This DOES to bounds checking. Will be undefined if OOB.
   */
  getSurroundingBlocks(position: Position): {
    north?: LevelBlock;
    northEast?: LevelBlock;
    east?: LevelBlock;
    southEast?: LevelBlock;
    south?: LevelBlock;
    southWest?: LevelBlock;
    west?: LevelBlock;
    northWest?: LevelBlock;
  } {
    return {
      north: this.getBlockAt(Position.north(position)),
      northEast: this.getBlockAt(Position.north(Position.east(position))),
      east: this.getBlockAt(Position.east(position)),
      southEast: this.getBlockAt(Position.south(Position.east(position))),
      south: this.getBlockAt(Position.south(position)),
      southWest: this.getBlockAt(Position.south(Position.west(position))),
      west: this.getBlockAt(Position.west(position)),
      northWest: this.getBlockAt(Position.north(Position.west(position))),
    };
  }

  /**
   * Gets the mask of the orthogonal indices around the given position.
   */
  getOrthogonalMask(
    position: Position,
    comparator: (args: {block?: LevelBlock, relative: Direction}) => boolean,
  ): number {
    const orthogonal = this.getOrthogonalBlocks(position);
    return (
      ((comparator(orthogonal.north) ? 1 : 0) << 0) |
      ((comparator(orthogonal.south) ? 1 : 0) << 1) |
      ((comparator(orthogonal.east) ? 1 : 0) << 2) |
      ((comparator(orthogonal.west) ? 1 : 0) << 3)
    );
  }

  getMinecartTrack(
    position: Position,
    facing: Direction,
  ): [string, Position, Direction, number] | undefined {
    const block = this.getBlockAt(position);

    if (!block || !block.isRail) {
      return;
    }

    const speed = 300;

    if (block.connectionA === facing || block.connectionB === facing) {
      return ['', Position.forward(position, facing), facing, speed];
    }

    const incomming = FacingDirection.opposite(facing);
    if (block.connectionA === incomming && block.connectionB !== undefined) {
      const rotation = FacingDirection.turnDirection(facing, block.connectionB);
      const newFacing = FacingDirection.turn(facing, rotation);
      return [`turn_${rotation}`, position, newFacing, speed];
    }

    if (block.connectionB === incomming && block.connectionA !== undefined) {
      const rotation = FacingDirection.turnDirection(facing, block.connectionA);
      const newFacing = FacingDirection.turn(facing, rotation);
      return [`turn_${rotation}`, position, newFacing, speed];
    }

    return ['', position, facing, speed];
  }

  /**
   * Determine whether or not the blocks at the given positions are powered
   * rails that are connected to each other.
   */
  getPoweredRailsConnected(left: Position, right: Position): boolean {
    // return early if the positions are not even adjacent
    if (!Position.isAdjacent(left, right)) {
      return false;
    }

    const leftBlock = this.getBlockAt(left);
    const rightBlock = this.getBlockAt(right);

    // to be connected, both blocks must be powerable rails
    if (!(leftBlock?.getIsPowerableRail() && rightBlock?.getIsPowerableRail())) {
      return false;
    }

    // to be connected, both blocks must be oriented either North/South or
    // East/West
    if (leftBlock?.getIsHorizontal() && rightBlock?.getIsHorizontal()) {
      return (
        Position.equals(Position.forward(left, Direction.East), right) ||
        Position.equals(Position.forward(left, Direction.West), right)
      );
    } else if (leftBlock?.getIsVertical() && rightBlock?.getIsVertical()) {
      return (
        Position.equals(Position.forward(left, Direction.North), right) ||
        Position.equals(Position.forward(left, Direction.South), right)
      );
    }

    return false;
  }

  /**
   * Propagate power to (and orient) all redstone wire in the level
   */
  powerRedstone(): Position[] {
    // redstone charge propagation
    this.redstoneAdjacencySet.sets.forEach((set: Position[]) => {
      const somePower = set.some(
        (position: Position) => this.getBlockAt(position)?.isRedstoneBattery,
      );

      set.forEach((position: Position) => {
        const block = this.getBlockAt(position);
        if (block) {
          block.isPowered = somePower;
        }
        this.determineRedstoneSprite(position);
      });
    });

    return this.redstoneAdjacencySet.flattenSets();
  }

  createRedstoneAdjacencySet(): AdjacencySet {
    const redstonePositions = this.getAllPositions().filter(
      (position: Position) => {
        const block = this.getBlockAt(position);
        return block && (block.isRedstone || block.isRedstoneBattery);
      },
    );

    return new AdjacencySet(redstonePositions);
  }

  /**
   * Propagate power to (and orient) all powerable rails in the level.
   */
  powerRails(): Position[] {
    // find all rails that can be powered
    const powerableRails = this.getAllPositions().filter(position =>
      this.getBlockAt(position)?.getIsPowerableRail(),
    );

    // update powerable rails once to set their orientations
    powerableRails.forEach(position => {
      this.determineRailType(position);
    });

    // propagate power
    new AdjacencySet(
      powerableRails,
      this.getPoweredRailsConnected.bind(this),
    ).sets.forEach(set => {
      // each set of connected rails should be entirely powered if any of them
      // is powered
      const somePower = set.some(
        position => this.getBlockAt(position)?.isPowered,
      );

      if (somePower) {
        set.forEach(position => {
          const block = this.getBlockAt(position);
          if (block) {
            block.isPowered = true;
          }
        });
      }
    });

    // update all rails again to set their power state
    powerableRails.forEach(position => {
      this.determineRailType(position);
    });

    return powerableRails;
  }

  /**
   * Determines which rail object should be placed given the context of surrounding
   * indices.
   */
  determineRailType(position: Position, updateTouching: boolean = false) {
    const block = this.getBlockAt(position);

    if (!block || !block.isRail) {
      return;
    }

    let powerState = '';
    let priority = RailConnectionPriority;
    if (block.getIsPowerableRail()) {
      powerState = block.isPowered ? 'Powered' : 'Unpowered';
      priority = PoweredRailConnectionPriority;
    }

    if (block.connectionA === undefined || block.connectionB === undefined) {
      const mask = this.getOrthogonalMask(position, ({block, relative}) => {
        if (!block || !block.isRail) {
          return false;
        }
        const a =
          block.connectionA === undefined || block.connectionA === relative;
        const b =
          block.connectionB === undefined || block.connectionB === relative;

        return a || b;
      });

      // Look up what type of connection to create, based on the surrounding tracks.
      [block.connectionA, block.connectionB] = priority[mask];
    }

    const variant = connectionName(block.connectionA) + connectionName(block.connectionB);
    block.blockType = `rails${powerState}${variant}`;

    if (updateTouching) {
      Position.getOrthogonalPositions(position).forEach(orthogonalPosition => {
        this.determineRailType(orthogonalPosition);
      });
    }
  }

  /**
   * Determines which redstoneWire variant should be placed given the context of
   * surrounding indices and Powered state.
   */
  determineRedstoneSprite(position: Position): string {
    const block = this.getBlockAt(position);

    if (!block || !block.isRedstone) {
      return 'redstoneWire';
    }

    const mask = this.getOrthogonalMask(position, ({block}) => {
      return !!block && (block.isRedstone || block.isConnectedToRedstone);
    });

    const variant = RedstoneCircuitConnections[mask];
    const powerState = block.isPowered ? 'On' : '';
    block.blockType = `redstoneWire${variant}${powerState}`;

    return `redstoneWire${variant}`;
  }

  /**
   * Updates the state and sprites of all redstoneWire on the plane.
   * Important note: This is what kicks off redstone charge propagation and is called
   * on place/destroy/run/load.... wherever updating charge is important.
   */
  refreshRedstone(): Position[] {
    // power redstone
    const redstonePositions = this.powerRedstone();

    // power all blocks powered by redstone
    this.powerAllBlocks();

    // power rails powered by redstone
    const powerableRails = this.powerRails();
    const posToRefresh = redstonePositions.concat(powerableRails);

    // Once we're done updating redstoneWire states, check to see if doors and pistons should open/close.
    this.getAllPositions().forEach(position => {
      this.getIronDoors(position);
      this.getPistonState(position);
    });
    this.playPistonSound();
    return posToRefresh;
  }

  playPistonSound() {
    if (!this.levelModel) {
      return;
    }
    if (this.playPistonOn) {
      this.levelModel.scene.audioPlayer.play('pistonOut');
    } else if (this.playPistonOff) {
      this.levelModel.scene.audioPlayer.play('pistonIn');
    }
    this.playPistonOn = false;
    this.playPistonOff = false;
  }

  checkEntityConflict(position: Position): boolean {
    if (!this.levelModel) {
      return false;
    }

    let captureReturn = false;
    this.levelModel.scene.levelEntity.entityMap.forEach(workingEntity => {
      if (Position.equals(position, workingEntity.position)) {
        captureReturn = true;
      }
    });
    return captureReturn;
  }

  /**
   * Evaluates what state Iron Doors on the map should be in.
   */
  getIronDoors(position: Position) {
    const block = this.getBlockAt(position);
    const index = this.coordinatesToIndex(position);

    if (block?.blockType === 'doorIron') {
      block.isPowered = this.powerCheck(position, true);
      if (block.isPowered && !block.isOpen) {
        block.isOpen = true;
        if (this.levelModel) {
          this.levelModel.scene.levelView.animateDoor(index, true);
        }
      } else if (!block.isPowered && block.isOpen) {
        if (this.levelModel) {
          if (!this.checkEntityConflict(position)) {
            block.isOpen = false;
            this.levelModel.scene.levelView.animateDoor(index, false);
          }
        }
      }
    }
  }

  /**
   * Evaluates what state Pistons on the map should be in.
   */
  getPistonState(position: Position) {
    const block = this.getBlockAt(position);
    if (!block) {
      return;
    }

    if (block.getIsPiston() && !block.getIsPistonArm()) {
      block.isPowered = this.powerCheck(position, true);
      if (block.isPowered) {
        this.activatePiston(position);
      } else if (!block.isPowered) {
        this.deactivatePiston(position);
      }
      if (this.levelModel) {
        this.levelModel.computeFowPlane();
        this.levelModel.scene.levelView.updateFowGroup(
          this.levelModel.fowPlane,
        );

        this.levelModel.computeShadingPlane();
        this.levelModel.scene.levelView.updateShadingGroup(
          this.levelModel.shadingPlane,
        );
      }
    }
  }

  /**
   * Find all iron doors in a level and evaluate if they need to be animated based on state
   */
  findDoorToAnimate(positionInQuestion: Position) {
    this.getAllPositions().forEach((position: Position) => {
      const block = this.getBlockAt(position);
      const index = this.coordinatesToIndex(position);

      if (block && block.blockType === 'doorIron' && position !== positionInQuestion) {
        block.isPowered = this.powerCheck(position, true);
        if (block.isPowered && !block.isOpen) {
          block.isOpen = true;
          if (this.levelModel) {
            this.levelModel.scene.levelView.animateDoor(index, true);
          }
        } else if (
          !block.isPowered &&
          block.isOpen &&
          !this.checkEntityConflict(position)
        ) {
          block.isOpen = false;
          if (this.levelModel) {
            this.levelModel.scene.levelView.animateDoor(index, false);
          }
        }
      }
    });
  }

  /**
   * Activates a piston at a given position to push blocks away from it
   * depending on type.
   */
  activatePiston(position: Position) {
    const block = this.getBlockAt(position);
    if (!block) {
      return;
    }

    let pistonType = block.blockType;
    if (block.getIsStickyPiston()) {
      pistonType = pistonType.substring(0, pistonType.length - 6);
    }
    const checkOn = pistonType.substring(
      pistonType.length - 2,
      pistonType.length,
    );
    if (checkOn === 'On') {
      pistonType = pistonType.substring(0, pistonType.length - 2);
    }

    const direction = block.getPistonDirection();
    let armType = `pistonArm${FacingDirection.directionToRelative(direction)}`;

    const offset = Position.directionToOffsetPosition(direction);
    const pos = Position.forward(position, direction);
    const workingNeighbor = this.getBlockAt(pos);

    if (this.pistonArmBlocked(position, offset)) {
      return;
    }
    // Break an object right in front of the piston.
    if (workingNeighbor?.isDestroyableUponPush()) {
      this.setBlockAt(pos, new LevelBlock(''));
      this.playPistonOn = true;
      if (this.levelModel) {
        this.levelModel.scene.levelView.playExplosionAnimation(
          pos,
          2,
          pos,
          workingNeighbor.blockType
        );
      }
    } else if (
      workingNeighbor &&
      workingNeighbor.blockType !== '' &&
      !workingNeighbor.getIsPistonArm()
    ) {
      // We've actually got something to push.
      const blocksPositions = this.getBlocksToPush(pos, offset);
      let concat = 'On';
      if (block.getIsStickyPiston()) {
        concat += 'Sticky';
      }
      const onPiston = new LevelBlock((pistonType += concat));
      this.setBlockAt(position, onPiston);
      this.pushBlocks(blocksPositions, offset);
      this.playPistonOn = true;
    } else if (workingNeighbor?.blockType === '') {
      // Nothing to push, so just make the arm.
      let concat = 'On';
      if (block.getIsStickyPiston()) {
        concat += 'Sticky';
        armType += 'Sticky';
      }
      const armBlock = new LevelBlock(armType);
      const pistonBlock = new LevelBlock((pistonType += concat));
      this.setBlockAt(pos, armBlock);
      this.setBlockAt(position, pistonBlock);
      this.playPistonOn = true;
    }
  }

  pistonArmBlocked(position: Position, offset: Position): boolean {
    const workingPosition = Position.add(position, offset);
    return this.checkEntityConflict(workingPosition);
  }

  /**
   * Deactivates a piston at a given position by determining what the arm
   * orientation is.
   */
  deactivatePiston(position: Position) {
    const block = this.getBlockAt(position);
    if (!block || !block.getIsPiston() || !block.blockType.match('On')) {
      return;
    }

    const direction = block.getPistonDirection();
    if (direction !== undefined) {
      this.retractArm(Position.forward(position, direction), position);
    }
  }

  /**
   * Does the actual retraction of the arm of a piston.
   */
  retractArm(armPosition: Position, pistonPosition: Position) {
    const emptyBlock = new LevelBlock('');

    const pistonType = this.getBlockAt(pistonPosition);
    if (!pistonType) {
      // If we cannot get the piston at the position, bail out
      return;
    }

    let concat = '';
    let blockType = '';
    if (this.getBlockAt(pistonPosition)?.getIsStickyPiston()) {
      concat = 'Sticky';
      blockType = pistonType.blockType.substring(
        0,
        pistonType.blockType.length - 8,
      );
    } else {
      blockType = pistonType.blockType.substring(
        0,
        pistonType.blockType.length - 2,
      );
    }
    const newPistonType = blockType + concat;
    const offPiston = new LevelBlock(newPistonType);
    if (this.getBlockAt(armPosition)?.getIsPistonArm()) {
      if (this.getBlockAt(pistonPosition)?.getIsStickyPiston()) {
        const offset = Position.directionToOffsetPosition(
          pistonType.getPistonDirection(),
        );
        const stuckBlockPosition = Position.add(armPosition, offset);
        const stuckBlock = this.getBlockAt(stuckBlockPosition);
        if (
          this.inBounds(stuckBlockPosition) &&
          stuckBlock &&
          stuckBlock.isStickable
        ) {
          this.setBlockAt(armPosition, stuckBlock);
          this.setBlockAt(stuckBlockPosition, emptyBlock);
        } else {
          this.setBlockAt(armPosition, emptyBlock);
          this.playPistonOff = true;
        }
      } else {
        this.setBlockAt(armPosition, emptyBlock);
        this.playPistonOff = true;
      }
    }
    this.setBlockAt(pistonPosition, offPiston);
  }

  /**
   * Goes through a list of blocks and shuffles them over 1 index in a given direction.
   */
  pushBlocks(blocksPositions: Position[], offset: Position = new Position(0, 0)) {
    let pistonType = '';
    let redo = false;
    if (offset.x === 1) {
      pistonType = 'pistonArmRight';
    } else if (offset.x === -1) {
      pistonType = 'pistonArmLeft';
    } else {
      if (offset.y === 1) {
        pistonType = 'pistonArmDown';
      } else if (offset.y === -1) {
        pistonType = 'pistonArmUp';
      } else {
        // There is no offset, so we're not putting down anything.
      }
    }

    const armBlock = new LevelBlock(pistonType);
    for (let i = blocksPositions.length - 1; i >= 0; --i) {
      const destination = Position.add(
        blocksPositions[i],
        offset,
      );
      const block = this.getBlockAt(blocksPositions[i]);
      if (
        this.inBounds(destination) &&
        this.getBlockAt(destination)?.isDestroyableUponPush()
      ) {
        if (block && this.levelModel) {
          this.levelModel.scene.levelView.playExplosionAnimation(
            destination,
            2,
            destination,
            block.blockType
          );
        }
        redo = true;
      }
      if (block) {
        this.setBlockAt(destination, block);
      }
      if (i === 0) {
        this.setBlockAt(blocksPositions[i], armBlock);
      }
    }
    if (redo) {
      this.refreshRedstone();
    }
  }

  /**
   * Returns a list of blocks in a given direction to be shuffled over later.
   */
  getBlocksToPush(
    position: Position,
    offset: Position = new Position(0, 0)
  ): Position[] {
    const pushingBlocks: Position[] = [];
    let workingPosition = position;

    while (
      this.inBounds(workingPosition) &&
      this.getBlockAt(workingPosition)?.getIsPushable()
    ) {
      pushingBlocks.push(workingPosition);
      workingPosition = Position.add(
        workingPosition,
        offset,
      );
    }

    return pushingBlocks;
  }

  /**
   * Checking power state for objects that are powered by redstone.
   */
  powerCheck(position: Position, canReadCharge: boolean = false): boolean {
    return Position.getOrthogonalPositions(position).some(
      (orthogonalPosition: Position) => {
        const block = this.getBlockAt(orthogonalPosition);
        if (block) {
          if (!block.isWeaklyPowerable) {
            return false;
          }

          if (this.getBlockAt(position)?.getIsPiston()) {
            const piston = this.getBlockAt(position);
            if (piston) {
              const ignoreThisSide =
                Position.directionToOffsetPosition(piston.getPistonDirection()) ||
                new Position(0, 0);
              const posCheck = Position.add(position, ignoreThisSide);
              if (Position.equals(orthogonalPosition, posCheck)) {
                return false;
              }
            }
          }
          if (canReadCharge) {
            return block.isPowered || block.isRedstoneBattery;
          }
          return (
            (block.isRedstone && block.isPowered) || block.isRedstoneBattery
          );
        }
      },
    );
  }

  powerAllBlocks() {
    this.getAllPositions().forEach((position: Position) => {
      const block = this.getBlockAt(position);
      if (block && block.blockType !== '' && block.canHoldCharge()) {
        block.isPowered = this.powerCheck(position);
      }
    });
  }

  updateWeakCharge(position: Position, block: LevelBlock) {
    if (block.isWeaklyPowerable) {
      block.isPowered = this.powerCheck(position);
    }
    if (block.isPowered) {
      Position.getOrthogonalPositions(position).forEach(workingPos => {
        if (this.inBounds(workingPos)) {
          this.getIronDoors(workingPos);
          this.getPistonState(workingPos);
        }
      });
    }
  }

  getConduitRingPositions(position: Position, ringSize: number): Position[] {
    // We could hard code this... but might as well have a method for variable ring sizes just in case.
    const topLeft = new Position(position.x - ringSize, position.y - ringSize);
    const bottomRight = new Position(
      position.x + ringSize,
      position.y + ringSize,
    );
    const positionList: Position[] = [];

    // if both corners are in bounds, then the whole ring ought to be in bounds
    if (!this.inBounds(topLeft) || !this.inBounds(bottomRight)) {
      return positionList;
    }

    const sideLength = ringSize * 2 + 1;

    for (let i = 0; i < sideLength; i++) {
      for (let j = 0; j < sideLength; j++) {
        if (
          i === 0 ||
          i === sideLength - 1 ||
          j === 0 ||
          j === sideLength - 1
        ) {
          const newIndex = new Position(topLeft.x + i, topLeft.y + j);
          positionList.push(newIndex);
        }
      }
    }

    return positionList;
  }

  resolveConduitState() {
    this.getAllPositions().forEach(position => {
      const block = this.getBlockAt(position);
      if (block && block.blockType === 'conduit') {
        let prismarineCount = 0;
        let airCount = 0;
        const prismarineRingSize = 2;
        const airRingSize = 1;

        this.getConduitRingPositions(position, prismarineRingSize).forEach(
          workingPosition => {
            const block = this.getBlockAt(workingPosition);
            if (block && block.blockType === 'prismarine') {
              prismarineCount++;
            }
          },
        );

        this.getConduitRingPositions(position, airRingSize).forEach(
          workingPosition => {
            const block = this.getBlockAt(workingPosition);
            if (block && block.isEmpty) {
              airCount++;
            }
          },
        );

        if (
          prismarineCount === this.getRingRequirement(prismarineRingSize) &&
          airCount === this.getRingRequirement(airRingSize) &&
          !block.isActivatedConduit
        ) {
          const existingBlock = this.getBlockAt(position);
          if (existingBlock) {
            existingBlock.isActivatedConduit = true;
          }
          if (this.levelModel) {
            this.levelModel.scene.levelView.playOpenConduitAnimation(position);
          }
        } else if (
          (prismarineCount < this.getRingRequirement(prismarineRingSize) ||
            airCount < this.getRingRequirement(airRingSize)) &&
          block.isActivatedConduit
        ) {
          const existingBlock = this.getBlockAt(position);
          if (existingBlock) {
            existingBlock.isActivatedConduit = false;
          }
          if (this.levelModel) {
            this.levelModel.scene.levelView.playCloseConduitAnimation(position);
          }
        }
      }
    });
  }

  getRingRequirement(ringSize: number): number {
    // a ring size of 1 (away from the block itself) would correlate to all
    // orthogonal and diagonal adjacent blocks. 3x3 - 1 (the center) = 8
    return 8 * ringSize;
  }
}

export default LevelPlane;
