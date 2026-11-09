const LevelBlock = require("./LevelBlock.js");
const {
  North,
  South,
  East,
  West,
  opposite,
  turnDirection,
  turn,
  directionToRelative
} = require("./FacingDirection.js");

const Position = require("./Position");
const AdjacencySet = require("./AdjacencySet");

const connectionName = function (connection) {
  switch (connection) {
    case North: return 'North';
    case South: return 'South';
    case East: return 'East';
    case West: return 'West';
    default: return '';
  }
};

const RedstoneCircuitConnections = [
  "", "Vertical", "Vertical", "Vertical",
  "Horizontal", "UpRight", "DownRight", "TRight",
  "Horizontal", "UpLeft", "DownLeft", "TLeft",
  "Horizontal", "TUp", "TDown", "Cross",
];

const RailConnectionPriority = [
  [], [North], [South], [North, South],
  [East], [North, East], [South, East], [South, East],
  [West], [North, West], [South, West], [South, West],
  [East, West], [North, East], [South, East], [North, East],
];

const PoweredRailConnectionPriority = [
  [], [North], [South], [North, South],
  [East], [East, West], [East, West], [East, West],
  [West], [East, West], [East, West], [East, West],
  [East, West], [East, West], [East, West], [East, West],
];

module.exports = class LevelPlane {
  constructor(planeData, width, height, levelModel, planeType) {
    this._data = [];
    this.width = width;
    this.height = height;
    this.levelModel = levelModel;
    this.planeType = planeType;
    this.playPistonOn = false;
    this.playPistonOff = false;

    for (let index = 0; index < planeData.length; ++index) {
      let block = new LevelBlock(planeData[index]);
      this._data.push(block);
    }

    if (this.isActionPlane()) {
      this.redstoneAdjacencySet = this.createRedstoneAdjacencySet();
    }
  }

  /**
   * Determines whether the position in question is within the bounds of the plane.
   */
  inBounds(position) {
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
  coordinatesToIndex(position) {
    return position.y * this.width + position.x;
  }

  /**
  * Determines the positional coordinates given a specific index.
  */
  indexToCoordinates(index) {
    let y = Math.floor(index / this.width);
    let x = index - (y * this.width);
    return new Position(x, y);
  }

  /**
   * Retrieve all the [x, y] coordinates within this plane
   *
   * @return {[Number, Number][]}
   */
  getAllPositions() {
    return this._data.map((_, i) => {
      return this.indexToCoordinates(i);
    });
  }

  /**
   * Gets the block at the desired position within the plane, optionally with an
   * offset
   *
   * @param {Position} position - [x, y] coordinates of block
   *
   * @return {LevelBlock}
   */
  getBlockAt(position) {
    position = Position.fromArray(position);
    if (this.inBounds(position)) {
      return this._data[this.coordinatesToIndex(position)];
    }
  }

  isActionPlane() {
    return this.planeType === "actionPlane";
  }

  isDecorationPlane() {
    return this.planeType === "decorationPlane";
  }

  isGroundPlane() {
    return this.planeType === "groundPlane";
  }

  /**
   * Changes the block at a desired position to the desired block.
   * Important note: This is the cornerstone of block placing/destroying.
   */
  setBlockAt(position, block) {
    position = Position.fromArray(position);
    if (!this.inBounds(position)) {
      return;
    }
    this._data[this.coordinatesToIndex(position)] = block;

    if (this.isActionPlane()) {

      if (block.isRedstone || block.isRedstoneBattery) {
        this.redstoneAdjacencySet.add(position);
      } else {
        this.redstoneAdjacencySet.remove(position);
      }

      let redstoneToRefresh = [];
      if (block.needToRefreshRedstone()) {
        redstoneToRefresh = this.refreshRedstone();
      }

      this.updateWeakCharge(position, block);

      // if we've just removed a block, clean up any rail connections that were
      // formerly connected to this block
      if (block.isEmpty) {
        [North, South, East, West].forEach((direction) => {
          // if the block in the given cardinal direction is a rail block with a
          // connection to this one, sever that connection
          const offset = Position.directionToOffsetPosition(direction);
          const adjacentBlock = this.getBlockAt(Position.add(position, offset));
          if (adjacentBlock && adjacentBlock.isRail) {
            if (adjacentBlock.connectionA === opposite(direction)) {
              adjacentBlock.connectionA = undefined;
            }
            if (adjacentBlock.connectionB === opposite(direction)) {
              adjacentBlock.connectionB = undefined;
            }
          }
        });
      }
      this.determineRailType(position, true);

      if (this.levelModel && this.levelModel.controller.levelView) {
        const northEast = Position.north(Position.east(position));
        const southWest = Position.south(Position.west(position));
        let positionAndTouching = Position.getOrthogonalPositions(position).concat([position, northEast, southWest]);
        this.levelModel.controller.levelView.refreshActionGroup(positionAndTouching);
        this.levelModel.controller.levelView.refreshActionGroup(redstoneToRefresh);
      }
    } else if (this.isGroundPlane()) {
      this.levelModel.controller.levelView.refreshGroundGroup();
    }

    this.resolveConduitState();

    return block;
  }

  /**
  * Gets the blocks within orthogonal positions around a given position.
  * Important note: This DOES to bounds checking. Will be undefined if OOB.
  */
  getOrthogonalBlocks(position) {
    return {
      north: {block: this.getBlockAt(Position.north(position)), relative: South},
      south: {block: this.getBlockAt(Position.south(position)), relative: North},
      east: {block: this.getBlockAt(Position.east(position)), relative: West},
      west: {block: this.getBlockAt(Position.west(position)), relative: East},
    };
  }

  /**
   * Gets the blocks surrounding a given position.
   * Important note: This DOES to bounds checking. Will be undefined if OOB.
   */
  getSurroundingBlocks(position) {
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
  getOrthogonalMask(position, comparator) {
    const orthogonal = this.getOrthogonalBlocks(position);
    return (
      (comparator(orthogonal.north) << 0) +
      (comparator(orthogonal.south) << 1) +
      (comparator(orthogonal.east) << 2) +
      (comparator(orthogonal.west) << 3)
    );
  }

  getMinecartTrack(position, facing) {
    const block = this.getBlockAt(position);

    if (!block.isRail) {
      return;
    }

    const speed = 300;

    if (block.connectionA === facing || block.connectionB === facing) {
      return ["", Position.forward(position, facing), facing, speed];
    }

    const incomming = opposite(facing);
    if (block.connectionA === incomming && block.connectionB !== undefined) {
      const rotation = turnDirection(facing, block.connectionB);
      const newFacing = turn(facing, rotation);
      return [`turn_${rotation}`, position, newFacing, speed];
    }
    if (block.connectionB === incomming && block.connectionA !== undefined) {
      const rotation = turnDirection(facing, block.connectionA);
      const newFacing = turn(facing, rotation);
      return [`turn_${rotation}`, position, newFacing, speed];
    }
  }

  /**
   * Determine whether or not the blocks at the given positions are powered
   * rails that are connected to each other.
   *
   * @param {Posititon} left
   * @param {Posititon} right
   * @return {boolean}
   */
  getPoweredRailsConnected(left, right) {
    // return early if the positions are not even adjacent
    if (!Position.isAdjacent(left, right)) {
      return false;
    }

    const leftBlock = this.getBlockAt(left);
    const rightBlock = this.getBlockAt(right);

    // to be connected, both blocks must be powerable rails
    if (!(leftBlock.getIsPowerableRail() && rightBlock.getIsPowerableRail())) {
      return false;
    }

    // to be connected, both blocks must be oriented either North/South or
    // East/West
    if (leftBlock.getIsHorizontal() && rightBlock.getIsHorizontal()) {
      return Position.equals(Position.forward(left, East), right) ||
          Position.equals(Position.forward(left, West), right);
    } else if (leftBlock.getIsVertical() && rightBlock.getIsVertical()) {
      return Position.equals(Position.forward(left, North), right) ||
          Position.equals(Position.forward(left, South), right);
    } else {
      return false;
    }
  }

  /**
   * Propagate power to (and orient) all redstone wire in the level
   */
  powerRedstone() {
    // redstone charge propagation
    this.redstoneAdjacencySet.sets.forEach((set) => {
      const somePower = set.some((position) => this.getBlockAt(position).isRedstoneBattery);

      set.forEach((position) => {
        this.getBlockAt(position).isPowered = somePower;
        this.determineRedstoneSprite(position);
      });
    });

    return this.redstoneAdjacencySet.flattenSets();
  }

  createRedstoneAdjacencySet() {
    const redstonePositions = this.getAllPositions().filter((position) => {
      const block = this.getBlockAt(position);
      return block.isRedstone || block.isRedstoneBattery;
    });

    return new AdjacencySet(redstonePositions);
  }

  /**
   * Propagate power to (and orient) all powerable rails in the level.
   */
  powerRails() {
    // find all rails that can be powered
    const powerableRails = this.getAllPositions().filter(position => (
      this.getBlockAt(position).getIsPowerableRail()
    ));

    // update powerable rails once to set their orientations
    powerableRails.forEach((position) => {
      this.determineRailType(position);
    });

    // propagate power
    new AdjacencySet(
      powerableRails,
      this.getPoweredRailsConnected.bind(this)
    ).sets.forEach(set => {
      // each set of connected rails should be entirely powered if any of them
      // is powered
      const somePower = set.some(position => this.getBlockAt(position).isPowered);

      if (somePower) {
        set.forEach(position => {
          this.getBlockAt(position).isPowered = true;
        });
      }
    });

    // update all rails again to set their power state
    powerableRails.forEach((position) => {
      this.determineRailType(position);
    });

    return powerableRails;
  }

  /**
   * Determines which rail object should be placed given the context of surrounding
   * indices.
   */
  determineRailType(position, updateTouching = false) {
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
        const a = block.connectionA === undefined || block.connectionA === relative;
        const b = block.connectionB === undefined || block.connectionB === relative;

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
  determineRedstoneSprite(position) {
    const block = this.getBlockAt(position);

    if (!block || !block.isRedstone) {
      return;
    }

    const mask = this.getOrthogonalMask(position, ({block}) => {
      return block && (block.isRedstone || block.isConnectedToRedstone);
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
  refreshRedstone() {
    // power redstone
    const redstonePositions = this.powerRedstone();

    // power all blocks powered by redstone
    this.powerAllBlocks();

    // power rails powered by redstone
    const powerableRails = this.powerRails();
    const posToRefresh = redstonePositions.concat(powerableRails);

    // Once we're done updating redstoneWire states, check to see if doors and pistons should open/close.
    this.getAllPositions().forEach((position) => {
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
      this.levelModel.controller.audioPlayer.play("pistonOut");
    } else if (this.playPistonOff) {
      this.levelModel.controller.audioPlayer.play("pistonIn");
    }
    this.playPistonOn = false;
    this.playPistonOff = false;
  }

  checkEntityConflict(position) {
    if (!this.levelModel) {
      return;
    }
    let captureReturn = false;
    this.levelModel.controller.levelEntity.entityMap.forEach((workingEntity) => {
      if (this.levelModel.controller.positionEquivalence(position, workingEntity.position)) {
        captureReturn = true;
      }
    });
    return captureReturn;
  }

  /**
  * Evaluates what state Iron Doors on the map should be in.
  */
  getIronDoors(position) {
    position = Position.fromArray(position);
    const block = this.getBlockAt(position);
    const index = this.coordinatesToIndex(position);

    if (block.blockType === "doorIron") {
      block.isPowered = this.powerCheck(position, true);
      if (block.isPowered && !block.isOpen) {
        block.isOpen = true;
        if (this.levelModel) {
          this.levelModel.controller.levelView.animateDoor(index, true);
        }
      } else if (!block.isPowered && block.isOpen) {
        if (this.levelModel) {
          if (!this.checkEntityConflict(position)) {
            block.isOpen = false;
            this.levelModel.controller.levelView.animateDoor(index, false);
          }
        }
      }
    }
  }

  /**
  * Evaluates what state Pistons on the map should be in.
  */
  getPistonState(position) {
    const block = this.getBlockAt(position);

    if (block.getIsPiston() && !block.getIsPistonArm()) {
      block.isPowered = this.powerCheck(position, true);
      if (block.isPowered) {
        this.activatePiston(position);
      } else if (!block.isPowered) {
        this.deactivatePiston(position);
      }
      if (this.levelModel) {
        this.levelModel.controller.updateFowPlane();
        this.levelModel.controller.updateShadingPlane();
      }
    }
  }

  /**
  * Find all iron doors in a level and evaluate if they need to be animated based on state
  */
  findDoorToAnimate(positionInQuestion) {
    this.getAllPositions().forEach((position) => {
      const block = this.getBlockAt(position);
      const index = this.coordinatesToIndex(position);

      if (block.blockType === "doorIron" && position !== positionInQuestion) {
        block.isPowered = this.powerCheck(position, true);
        if (block.isPowered && !block.isOpen) {
          block.isOpen = true;
          if (this.levelModel) {
            this.levelModel.controller.levelView.animateDoor(index, true);
          }
        } else if (!block.isPowered && block.isOpen && !this.checkEntityConflict(position)) {
          block.isOpen = false;
          if (this.levelModel) {
            this.levelModel.controller.levelView.animateDoor(index, false);
          }
        }
      }
    });
  }

  /**
   * Activates a piston at a given position to push blocks away from it
   * depending on type.
   */
  activatePiston(position) {
    const block = this.getBlockAt(position);

    let pistonType = block.blockType;
    if (block.getIsStickyPiston()) {
      pistonType = pistonType.substring(0, pistonType.length - 6);
    }
    let checkOn = pistonType.substring(pistonType.length - 2, pistonType.length);
    if (checkOn === "On") {
      pistonType = pistonType.substring(0, pistonType.length - 2);
    }

    const direction = block.getPistonDirection();
    let armType = `pistonArm${directionToRelative(direction)}`;

    const offset = Position.directionToOffsetPosition(direction);
    const pos = Position.forward(position, direction);
    const workingNeighbor = this.getBlockAt(pos);

    if (this.pistonArmBlocked(position, offset)) {
      return;
    }
    // Break an object right in front of the piston.
    if (workingNeighbor.isDestroyableUponPush()) {
      this.setBlockAt(pos, new LevelBlock(""));
      this.playPistonOn = true;
      if (this.levelModel) {
        this.levelModel.controller.levelView.playExplosionAnimation(pos, 2, pos, workingNeighbor.blockType, null, null, this.player);
      }
    } else if (workingNeighbor.blockType !== "" && !workingNeighbor.getIsPistonArm()) {
      // We've actually got something to push.
      let blocksPositions = this.getBlocksToPush(pos, offset);
      let concat = "On";
      if (block.getIsStickyPiston()) {
        concat += "Sticky";
      }
      let onPiston = new LevelBlock(pistonType += concat);
      this.setBlockAt(position, onPiston);
      this.pushBlocks(blocksPositions, offset);
      this.playPistonOn = true;
    } else if (workingNeighbor.blockType === "") {
      // Nothing to push, so just make the arm.
      let concat = "On";
      if (block.getIsStickyPiston()) {
        concat += "Sticky";
        armType += "Sticky";
      }
      let armBlock = new LevelBlock(armType);
      let pistonBlock = new LevelBlock(pistonType += concat);
      this.setBlockAt(pos, armBlock);
      this.setBlockAt(position, pistonBlock);
      this.playPistonOn = true;
    }
  }

  pistonArmBlocked(position, offset) {
    const workingPosition = Position.add(position, offset);
    return this.checkEntityConflict(workingPosition);
  }


  /**
   * Deactivates a piston at a given position by determining what the arm
   * orientation is.
   */
  deactivatePiston(position) {
    const block = this.getBlockAt(position);
    if (!block.getIsPiston() || !block.blockType.match("On")) {
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
  retractArm(armPosition, pistonPosition) {
    let emptyBlock = new LevelBlock("");
    let pistonType = this.getBlockAt(pistonPosition);
    let concat = "";
    let blockType = "";
    if (this.getBlockAt(pistonPosition).getIsStickyPiston()) {
      concat = "Sticky";
      blockType = pistonType.blockType.substring(0, pistonType.blockType.length - 8);
    } else {
      blockType = pistonType.blockType.substring(0, pistonType.blockType.length - 2);
    }
    let newPistonType = blockType + concat;
    let offPiston = new LevelBlock(newPistonType);
    if (this.getBlockAt(armPosition).getIsPistonArm()) {
      if (this.getBlockAt(pistonPosition).getIsStickyPiston()) {
        const offset = Position.directionToOffsetPosition(pistonType.getPistonDirection());
        const stuckBlockPosition = Position.add(armPosition, offset);
        if (this.inBounds(stuckBlockPosition) && this.getBlockAt(stuckBlockPosition).isStickable) {
          this.setBlockAt(armPosition, this.getBlockAt(stuckBlockPosition));
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
   *
   * @param {Position[]} blocksPositions
   * @param {Position} [offset=[0, 0]]
   */
  pushBlocks(blocksPositions, offset = [0, 0]) {
    let pistonType = "";
    let redo = false;
    if (offset[0] === 1) {
      pistonType = "pistonArmRight";
    } else if (offset[0] === -1) {
      pistonType = "pistonArmLeft";
    } else {
      if (offset[1] === 1) {
        pistonType = "pistonArmDown";
      } else if (offset[1] === -1) {
        pistonType = "pistonArmUp";
      } else {
        // There is no offset, so we're not putting down anything.
      }
    }
    let armBlock = new LevelBlock(pistonType);
    for (let i = blocksPositions.length - 1; i >= 0; --i) {
      let destination = Position.add(blocksPositions[i], Position.fromArray(offset));
      let block = this.getBlockAt(blocksPositions[i]);
      if (this.inBounds(destination) && this.getBlockAt(destination).isDestroyableUponPush()) {
        if (this.levelModel) {
          this.levelModel.controller.levelView.playExplosionAnimation(destination, 2, destination, block.blockType, null, null, this.player);
        }
        redo = true;
      }
      this.setBlockAt(destination, this.getBlockAt(blocksPositions[i]));
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
   * @param {Position} position
   * @param {Position} [offset=[0, 0]]
   */
  getBlocksToPush(position, offset = [0, 0]) {
    let pushingBlocks = [];
    let workingPosition = position;
    while (this.inBounds(workingPosition) && this.getBlockAt(workingPosition).getIsPushable()) {
      pushingBlocks.push(workingPosition);
      workingPosition = Position.add(workingPosition, Position.fromArray(offset));
    }
    return pushingBlocks;
  }

  /**
  * Checking power state for objects that are powered by redstone.
  */
  powerCheck(position, canReadCharge = false) {
    return Position.getOrthogonalPositions(position).some(orthogonalPosition => {
      const block = this.getBlockAt(orthogonalPosition);
      if (block) {
        if (!block.isWeaklyPowerable) {
          return false;
        }
        if (this.getBlockAt(position).getIsPiston()) {
          const piston = this.getBlockAt(position);
          const ignoreThisSide = Position.directionToOffsetPosition(piston.getPistonDirection()) || new Position(0, 0);
          const posCheck = Position.add(position, ignoreThisSide);
          if (Position.equals(orthogonalPosition, posCheck)) {
            return false;
          }
        }
        if (canReadCharge) {
          return block.isPowered || block.isRedstoneBattery;
        }
        return (block.isRedstone && block.isPowered) || block.isRedstoneBattery;
      }
    });
  }

  powerAllBlocks() {
    this.getAllPositions().forEach((position) => {
      const block = this.getBlockAt(position);
      if (block.blockType !== "" && block.canHoldCharge()) {
        block.isPowered = this.powerCheck(position);
      }
    });
  }

  updateWeakCharge(position, block) {
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

  getConduitRingPositions(position, ringSize) {
    // We could hard code this... but might as well have a method for variable ring sizes just in case.
    let topLeft = new Position(position.x - ringSize, position.y - ringSize);
    let bottomRight = new Position(position.x + ringSize, position.y + ringSize);
    let positionList = [];

    // if both corners are in bounds, then the whole ring ought to be in bounds
    if (!this.inBounds(topLeft) || !this.inBounds(bottomRight)) {
      return positionList;
    }

    let sideLength = ringSize * 2 + 1;

    for (let i = 0; i < sideLength; ++i) {
      for (let j = 0; j < sideLength; ++j) {
        if ((i === 0 || i === sideLength - 1) || (j === 0 || j === sideLength - 1)){
          let newIndex = new Position(topLeft.x + i, topLeft.y + j);
          positionList.push(newIndex);
        }
      }
    }

    return positionList;
  }

  resolveConduitState() {
    this.getAllPositions().forEach((position) => {
      const block = this.getBlockAt(position);
      if (block.blockType === "conduit"){

        var prismarineCount = 0;
        var airCount = 0;
        let prismarineRingSize = 2;
        let airRingSize = 1;

        this.getConduitRingPositions(position, prismarineRingSize).forEach((workingPosition) => {
          const block = this.getBlockAt(workingPosition);
          if (block.blockType === "prismarine") {
            ++prismarineCount;
          }
        });

        this.getConduitRingPositions(position, airRingSize).forEach((workingPosition) => {
          const block = this.getBlockAt(workingPosition);
          if (block.isEmpty) {
            ++airCount;
          }
        });

        if (prismarineCount === this.getRingRequirement(prismarineRingSize) && airCount === this.getRingRequirement(airRingSize) && !block.isActivatedConduit) {
          this.getBlockAt(position).isActivatedConduit = true;
          if (this.levelModel) {
            this.levelModel.controller.levelView.playOpenConduitAnimation(position);
          }
        } else if ((prismarineCount < this.getRingRequirement(prismarineRingSize) || airCount < this.getRingRequirement(airRingSize)) && block.isActivatedConduit) {
          this.getBlockAt(position).isActivatedConduit = false;
          if (this.levelModel) {
            this.levelModel.controller.levelView.playCloseConduitAnimation(position);
          }
        }
      }
    });
  }

  getRingRequirement(ringSize){
    // a ring size of 1 (away from the block itself) would correlate to all
    // orthogonal and diagonal adjacent blocks. 3x3 - 1 (the center) = 8
    return 8 * ringSize;
  }

};
