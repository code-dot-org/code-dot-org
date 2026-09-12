const LevelPlane = require("./LevelPlane.js");
const LevelBlock = require("./LevelBlock.js");
const FacingDirection = require("./FacingDirection.js");
const Position = require("./Position.js");
const Player = require("../Entities/Player.js");
const Agent = require("../Entities/Agent.js");

// for blocks on the action plane, we need an actual "block" object, so we can model

module.exports = class LevelModel {
  constructor(levelData, controller) {
    this.planeWidth = levelData.gridDimensions ?
      levelData.gridDimensions[0] : 10;
    this.planeHeight = levelData.gridDimensions ?
      levelData.gridDimensions[1] : 10;
    this.controller = controller;
    this.player = {};
    this.agent = {};
    this.usingAgent = false;

    this.initialLevelData = Object.create(levelData);

    this.reset();

    this.initialPlayerState = Object.create(this.player);
    this.initialAgentState = Object.create(this.agent);
  }

  isUnderwater() {
    return !!this.getOceanType();
  }

  getOceanType() {
    return this.initialLevelData.ocean;
  }

  isInBoat() {
    return this.initialLevelData.boat;
  }

  planeArea() {
    return this.planeWidth * this.planeHeight;
  }

  inBounds(position) {
    const x = position[0];
    const y = position[1];
    return x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight;
  }

  reset() {
    this.groundPlane = new LevelPlane(this.initialLevelData.groundPlane, this.planeWidth, this.planeHeight, this, "groundPlane");
    this.groundDecorationPlane = new LevelPlane(this.initialLevelData.groundDecorationPlane, this.planeWidth, this.planeHeight, this, "decorationPlane");
    this.shadingPlane = [];
    this.actionPlane = new LevelPlane(this.initialLevelData.actionPlane, this.planeWidth, this.planeHeight, this, "actionPlane");

    this.actionPlane.powerRedstone();

    this.actionPlane.getAllPositions().forEach((position) => {
      if (this.actionPlane.getBlockAt(position).isRedstone) {
        this.actionPlane.determineRedstoneSprite(position);
      }
      if (this.actionPlane.getBlockAt(position).isRail) {
        this.actionPlane.determineRailType(position);
      }
    });

    this.fluffPlane = new LevelPlane(this.initialLevelData.fluffPlane, this.planeWidth, this.planeHeight);
    this.fowPlane = [];
    this.isDaytime = this.initialLevelData.isDaytime === undefined || this.initialLevelData.isDaytime;

    let levelData = Object.create(this.initialLevelData);
    if (this.initialLevelData.usePlayer !== undefined) {
      this.usePlayer = this.initialLevelData.usePlayer;
    } else {
      this.usePlayer = true;
    }
    if (this.usePlayer) {
      const position = Position.fromArray(levelData.playerStartPosition);
      this.player = new Player(
        this.controller,
        'Player',
        position.x,
        position.y,
        this.initialLevelData.playerName || 'Steve',
        !this.actionPlane.getBlockAt(position).getIsEmptyOrEntity(),
        levelData.playerStartDirection
      );
      this.controller.levelEntity.pushEntity(this.player);
      this.controller.player = this.player;

      if (levelData.useAgent) {
        this.spawnAgent(levelData);
      }
    }

    // If we have an agent but the level initialization data doesn't define one,
    // then we must have spawned one during the level run and so want to reset
    // back to not having one
    if (!levelData.useAgent && this.usingAgent) {
      this.destroyAgent();
    }

    this.computeShadingPlane();
    this.computeFowPlane();
  }

  /**
   * Creates the Agent entity
   *
   * @param {Object} levelData the initial level data object, specifying the
   *        Agent's default position and direction
   * @param {[Number, Number]} [positionOverride] optional position override
   * @param {Number} [directionOverride] optional direction override
   */
  spawnAgent(levelData, positionOverride, directionOverride) {
    this.usingAgent = true;

    const position = (positionOverride !== undefined)
      ? positionOverride
      : Position.fromArray(levelData.agentStartPosition);

    const direction = (directionOverride !== undefined)
        ? directionOverride
        : levelData.agentStartDirection;

    const name = "PlayerAgent";
    const key = "Agent";

    const startingBlock = this.actionPlane.getBlockAt(position);
    this.agent = new Agent(this.controller, name, position.x, position.y, key, !startingBlock.getIsEmptyOrEntity(), direction);
    this.controller.levelEntity.pushEntity(this.agent);
    this.controller.agent = this.agent;
  }

  /**
   * Destroys the agent entity; is the inverse of spawnAgent.
   */
  destroyAgent() {
    this.controller.agent = undefined;
    this.controller.levelEntity.destroyEntity(this.agent.identifier);
    this.agent = undefined;
    this.usingAgent = false;
  }

  yToIndex(y) {
    return y * this.planeWidth;
  }

  isSolved() {
    return this.initialLevelData.verificationFunction(this);
  }

  isFailed() {
    if (this.initialLevelData.failureCheckFunction !== undefined) {
      return this.initialLevelData.failureCheckFunction(this);
    } else {
      return false;
    }
  }

  getHouseBottomRight() {
    return Position.fromArray(this.initialLevelData.houseBottomRight);
  }

  // Verifications
  isPlayerNextTo(blockType) {
    if (!this.usePlayer) {
      return false;
    }

    return Position.getOrthogonalPositions(this.player.position).some(position => {
      return (
        this.inBounds(position) &&
        (this.isBlockOfType(position, blockType) ||
          this.isEntityOfType(position, blockType) ||
          this.groundPlane.getBlockAt(position).blockType === blockType)
      );
    });
  }

  isEntityNextTo(entityType, blockType) {
    const entityList = this.controller.levelEntity.getEntitiesOfType(entityType);

    return entityList.some(entity => {
      return Position.getOrthogonalPositions(entity.position).some(position => {
        return (
          this.inBounds(position) &&
          (this.isBlockOfType(position, blockType) ||
            this.isEntityOfType(position, blockType) ||
            this.groundPlane.getBlockAt(position).blockType === blockType)
        );
      });
    });
  }

  isEntityOnBlocktype(entityType, blockType, count = 1) {
    var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
    var resultCount = 0;
    for (var i = 0; i < entityList.length; i++) {
      var entity = entityList[i];
      if (this.isBlockOfType(entity.position, blockType) || this.groundPlane.getBlockAt(entity.position).blockType === blockType) {
        resultCount++;
      }
    }
    return resultCount >= count;
  }

  /**
   * @param {string} entityType
   * @param {Position|Number[]} position to check against as either a Position
   *        instance or an array of the form [x, y]. Array-style position is
   *        supported for compability with the verification API
   */
  isEntityAt(entityType, position) {
    if (Array.isArray(position)) {
      position = Position.fromArray(position);
    }

    var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
    for (var i = 0; i < entityList.length; i++) {
      var entity = entityList[i];
      if (Position.equals(entity.position, position)) {
        return true;
      }
    }
    return false;
  }

  isEntityTypeRunning(entityType) {
    var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
    for (var i = 0; i < entityList.length; i++) {
      var entity = entityList[i];
      const notStarted = !entity.queue.isStarted();
      const notFinished = !entity.queue.isFinished();
      if ((notStarted && entity.queue.commandList_.length > 0) || notFinished) {
        return true;
      }
    }
    return false;
  }

  isEntityDied(entityType, count = 1) {
    var deathCount = this.controller.levelEntity.entityDeathCount;
    if (deathCount.has(entityType)) {
      if (deathCount.get(entityType) >= count) {
        return true;
      }
    }
    return false;
  }

  getScore() {
    return this.controller.score;
  }

  shouldRide(direction) {
    let player = this.player;
    let frontPosition = this.getNextRailPosition(player, direction);
    let frontBlock = this.actionPlane.getBlockAt(frontPosition);
    return this.isNextRailValid(frontBlock, direction);
  }

  isNextRailValid(block, direction) {
    if (!block) {
      return;
    }
    return FacingDirection.opposite(block.connectionA) === direction ||
      FacingDirection.opposite(block.connectionB) === direction ||
      block.connectionA === direction ||
      block.connectionB === direction;
  }

  getNextRailPosition(entity = this.player, direction) {
    const offset = Position.directionToOffsetPosition(direction) || new Position(0, 0);
    return Position.add(entity.position, offset);
  }

  getEntityCount(entityType) {
    var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
    return entityList.length;
  }

  getCommandExecutedCount(commandName, targetType) {
    return this.controller.getCommandCount(commandName, targetType, false);
  }

  getRepeatCommandExecutedCount(commandName, targetType) {
    return this.controller.getCommandCount(commandName, targetType, true);
  }

  getTurnRandomCount() {
    return this.controller.turnRandomCount;
  }

  getInventoryAmount(inventoryType) {
    if (!this.usePlayer) {
      return 0;
    }
    if (inventoryType === "all" || inventoryType === "All") {
      var inventory = this.player.inventory;
      var count = 0;
      for (var key in inventory) {
        count += inventory[key];
      }
      return count;
    }
    return this.player.inventory[inventoryType];
  }

  getInventoryTypes() {
    if (!this.usePlayer) {
      return [];
    }
    return Object.keys(this.player.inventory);
  }

  countOfTypeOnMap(blockType) {
    const blocksOfType = this.actionPlane.getAllPositions().filter((position) => {
      return this.actionPlane.getBlockAt(position).blockType === blockType;
    });

    return blocksOfType.length;
  }

  /**
   * @param {Position|Number[]} position to check against as either a Position
   *        instance or an array of the form [x, y]. Array-style position is
   *        supported for compability with the verification API
   */
  isPlayerAt(position) {
    if (!this.usePlayer) {
      return false;
    }

    if (Array.isArray(position)) {
      position = Position.fromArray(position);
    }
    return Position.equals(this.player.position, position);
  }

  spritePositionToIndex(offset, spritePosition) {
    const position = Position.subtract(spritePosition, offset);
    return new Position(position.x / 40, position.y / 40);
  }

  solutionMapMatchesResultMap(solutionMap) {
    for (var i = 0; i < this.planeArea(); i++) {
      var solutionItemType = solutionMap[i];
      let position = this.actionPlane.indexToCoordinates(i);

      // "" on the solution map means we dont care what's at that spot
      if (solutionItemType !== "") {
        if (solutionItemType === "empty") {
          if (!this.actionPlane.getBlockAt(position).isEmpty) {
            return false;
          }
        } else if (solutionItemType === "any") {
          if (this.actionPlane.getBlockAt(position).isEmpty) {
            return false;
          }
        } else if (this.actionPlane.getBlockAt(position).blockType !== solutionItemType) {
          return false;
        }
      }
    }
    return true;
  }

  getTnt() {
    return this.actionPlane.getAllPositions().filter((position) => {
      const block = this.actionPlane.getBlockAt(position);
      return (block && block.blockType === "tnt");
    });
  }

  getMoveForwardPosition(entity = this.player) {
    return Position.forward(entity.position, entity.facing);
  }

  getMoveDirectionPosition(entity, direction) {
    let absoluteDirection = entity.facing;
    for (let i = 0; i < direction; ++i) {
      absoluteDirection = FacingDirection.turn(absoluteDirection, 'right');
    }
    return Position.forward(entity.position, absoluteDirection);
  }

  isForwardBlockOfType(blockType) {
    let blockForwardPosition = this.getMoveForwardPosition();

    let actionIsEmpty = this.isBlockOfTypeOnPlane(blockForwardPosition, "empty", this.actionPlane);

    if (blockType === '' && actionIsEmpty) {
      return true;
    }

    return actionIsEmpty ?
      this.isBlockOfTypeOnPlane(blockForwardPosition, blockType, this.groundPlane) :
      this.isBlockOfTypeOnPlane(blockForwardPosition, blockType, this.actionPlane);
  }

  getForwardBlockType() {
    const forwardBlock = this.getForwardBlock();
    if (forwardBlock) {
      return forwardBlock.blockType;
    }
    return "";
  }

  getForwardBlock() {
    let blockForwardPosition = this.getMoveForwardPosition();
    return this.actionPlane.getBlockAt(blockForwardPosition);
  }

  isBlockOfType(position, blockType) {
    return this.isBlockOfTypeOnPlane(position, blockType, this.actionPlane);
  }

  isEntityOfType(position, type) {
    const entities = this.controller.levelEntity.getEntitiesOfType(type);
    return entities.some(entity => Position.equals(position, entity.position));
  }

  isBlockOfTypeOnPlane(position, blockType, plane) {
    var result = false;

    if (this.inBounds(position)) {

      if (blockType === "empty") {
        result = plane.getBlockAt(position).isEmpty;
      } else if (blockType === "tree") {
        result = plane.getBlockAt(position).getIsTree();
      } else {
        result = (blockType === plane.getBlockAt(position).blockType);
      }
    }

    return result;
  }

  isPlayerStandingInWater() {
    return this.groundPlane.getBlockAt(this.player.position).blockType === "water";
  }

  isPlayerStandingInLava() {
    return this.groundPlane.getBlockAt(this.player.position).blockType === "lava";
  }

  coordinatesToIndex(coordinates) {
    return this.yToIndex(coordinates[1]) + coordinates[0];
  }

  checkPositionForTypeAndPush(blockType, position, objectArray) {
    if ((!blockType && (this.actionPlane.getBlockAt(position).blockType !== "")) || this.isBlockOfType(position, blockType)) {
      objectArray.push([true, position]);
      return true;
    } else {
      objectArray.push([false, null]);
      return false;
    }
  }

  houseGroundToFloorHelper(position, woolType, arrayCheck) {
    var checkActionBlock,
      posAbove,
      posBelow,
      posRight,
      posLeft,
      checkIndex = 0,
      array = arrayCheck;
    let index = this.yToIndex(position[2]) + position[1];

    if (index === 44) {
      index = 44;
    }

    posAbove = [0, position[1], position[2] + 1];
    posAbove[0] = this.yToIndex(posAbove[2]) + posAbove[1];

    posBelow = [0, position[1], position[2] - 1];
    posBelow[0] = this.yToIndex(posBelow[2]) + posBelow[1];

    posRight = [0, position[1] + 1, position[2]];
    posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

    posLeft = [0, position[1] - 1, position[2]];
    posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

    checkActionBlock = this.actionPlane.getBlockAt(this.actionPlane.indexToCoordinates(index));
    for (var i = 0; i < array.length; ++i) {
      if (array[i][0] === index) {
        checkIndex = -1;
        break;
      }
    }

    if (checkActionBlock.blockType !== "") {
      return {};
    } else if (array.length > 0 && checkIndex === -1) {
      return {};
    }
    array.push(position);
    array.concat(this.houseGroundToFloorHelper(posAbove, woolType, array));
    array.concat(this.houseGroundToFloorHelper(posBelow, woolType, array));
    array.concat(this.houseGroundToFloorHelper(posRight, woolType, array));
    array.concat(this.houseGroundToFloorHelper(posLeft, woolType, array));

    return array;
  }

  houseGroundToFloorBlocks(startingPosition) {
    //checkCardinalDirections for actionblocks.
    //If no action block and square isn't the type we want.
    //Change it.
    var woolType = "wool_orange";

    //Place this block here
    //this.createBlock(this.groundPlane, startingPosition[0], startingPosition[1], woolType);
    var helperStartData = [0, startingPosition[0], startingPosition[1]];
    return this.houseGroundToFloorHelper(helperStartData, woolType, []);
  }

  getEntityAt(position) {
    for (var entity of this.controller.levelEntity.entityMap) {
      if (Position.equals(entity[1].position, position)) {
        return entity[1];
      }
    }
    return undefined;
  }

  getAllBorderingPositionNotOfType(position, blockType) {
    var surroundingBlocks = this.getAllBorderingPosition(position, null);
    for (var b = 1; b < surroundingBlocks.length; ++b) {
      if (surroundingBlocks[b][0] && this.actionPlane.getBlockAt(surroundingBlocks[b][1]).blockType === blockType) {
        surroundingBlocks[b][0] = false;
      }
    }
    return surroundingBlocks;
  }

  getAllBorderingPosition(position, blockType) {
    var allFoundObjects = [false];

    Position.getSurroundingPositions(position).forEach((surroundingPosition) => {
      if (this.checkPositionForTypeAndPush(blockType, surroundingPosition, allFoundObjects)) {
        allFoundObjects[0] = true;
      }
    });

    return allFoundObjects;
  }

  canMoveForward(entity = this.player) {
    const position = this.getMoveForwardPosition(entity);
    if (!this.controller.followingPlayer() && (position.x > 9 || position.y > 9)) {
      return false;
    }
    return this.isPositionEmpty(position, entity);
  }

  canMoveBackward(entity = this.player) {
    const position = this.getMoveDirectionPosition(entity, 2);
    return this.isPositionEmpty(position, entity);
  }

  isPositionEmpty(position, entity = this.player) {
    var result = [false];

    if (this.inBounds(position)) {
      if (!this.actionPlane.getBlockAt(position).isWalkable) {
        result.push("notWalkable");
      }
      if (!this.actionPlane.getBlockAt(position).isEmpty) {
        if (this.player.isOnBlock) {
          return [true];
        }
        result.push("notEmpty");
      }
      // Prevent walking into water/lava in levels where the player is
      // controlled by arrow keys. In levels where the player is controlled by
      // blocks, let them drown.
      const blockTypeAtPosition = this.groundPlane.getBlockAt(position).blockType;
      const frontEntity = this.getEntityAt(position);
      const isWalkable = this.actionPlane.getBlockAt(position).isWalkable;
      if (['water', 'lava'].includes(blockTypeAtPosition) && isWalkable) {
        if (this.controller.getIsDirectPlayerControl()) {
          result.push(blockTypeAtPosition);
        } else if (frontEntity === undefined || frontEntity.canMoveThrough()) {
          return [true];
        }
      }

      if (this.groundPlane.getBlockAt(position).blockType !== "water" && this.isInBoat()) {
        result.push("notWater");
        return result;
      }

      if (frontEntity !== undefined) {
        result.push("frontEntity");
        result.push(frontEntity);
      }
      let groundBlock = this.groundPlane.getBlockAt(position);
      let actionBlock = this.actionPlane.getBlockAt(position);
      result[0] = entity.hasPermissionToWalk(actionBlock, frontEntity, groundBlock);
    } else {
      result.push("outBound");
    }

    return result;
  }

  canMoveDirection(entity = this.player, direction) {
    // save current direction of the entity
    var currentDirection = entity.facing;
    this.turnToDirection(entity, direction);
    var result = this.canMoveForward(entity);
    // rerotate the entity to the saved direction
    this.turnToDirection(entity, currentDirection);
    return result;
  }

  canPlaceBlock(entity, blockAtPosition) {
    return entity.canPlaceBlock(blockAtPosition);
  }

  canPlaceBlockDirection(blockType = "", entity , direction) {
    if (entity.isOnBlock) {
      return false;
    }
    let plane = this.getPlaneToPlaceOn(this.getMoveDirectionPosition(entity, direction), entity, blockType);
    if (plane === this.groundPlane) {
      if (LevelBlock.notValidOnGroundPlane(blockType) && this.groundPlane.getBlockAt(this.getMoveDirectionPosition(entity, direction))) {
        return false;
      }
    }

    if (this.checkEntityConflict(this.getMoveDirectionPosition(entity, direction))) {
      return false;
    }
    return this.getPlaneToPlaceOn(this.getMoveDirectionPosition(entity, direction), entity, blockType) !== null;
  }

  checkEntityConflict(position) {
    var conflict = false;
    this.controller.levelEntity.entityMap.forEach(entity => {
      if (Position.equals(entity.position, position)) {
        conflict = true;
      }
    });
    return conflict;
  }

  canPlaceBlockForward(blockType = "", entity = this.player) {
    return this.canPlaceBlockDirection(blockType, entity, 0);
  }

  getPlaneToPlaceOn(position, entity, blockType) {
    if (this.inBounds(position)) {
      let actionBlock = this.actionPlane.getBlockAt(position);
      if (entity === this.agent && actionBlock.isEmpty) {
        let groundBlock = this.groundPlane.getBlockAt(position);
        if (groundBlock.getIsLiquid()) {
          if (LevelBlock.getCanFall(blockType)) {
            return this.groundPlane;
          } else if (!LevelBlock.getIsPlaceableInLiquid(blockType)) {
            return null;
          }
        }
        return this.actionPlane;
      }
      if (actionBlock.isPlacable) {
        let groundBlock = this.groundPlane.getBlockAt(position);
        if (groundBlock.isPlacable) {
          return this.groundPlane;
        }
        return this.actionPlane;
      }
    }

    return null;
  }

  canDestroyBlockForward(entity = this.player) {
    var result = false;

    if (!entity.isOnBlock) {
      let blockForwardPosition = this.getMoveForwardPosition(entity);

      if (this.inBounds(blockForwardPosition)) {
        let block = this.actionPlane.getBlockAt(blockForwardPosition);
        result = !block.isEmpty && (block.isDestroyable || block.isUsable);
      }
    }

    return result;
  }

  moveForward(entity = this.player) {
    let blockForwardPosition = this.getMoveForwardPosition(entity);
    this.moveTo(blockForwardPosition, entity);
  }

  moveBackward(entity = this.player) {
    let blockBackwardPosition = this.getMoveDirectionPosition(entity, 2);
    this.moveTo(blockBackwardPosition, entity);
  }

  moveTo(position, entity = this.player) {
    entity.setMovePosition(position);

    if (this.actionPlane.getBlockAt(position).isEmpty) {
      entity.isOnBlock = false;
    }
  }

  turnLeft(entity = this.player) {
    entity.facing = FacingDirection.turn(entity.facing, 'left');
  }

  turnRight(entity = this.player) {
    entity.facing = FacingDirection.turn(entity.facing, 'right');
  }

  turnToDirection(entity = this.player, direction) {
    entity.facing = direction;
  }

  moveDirection(entity = this.player, direction) {
    this.turnToDirection(entity, direction);
    this.moveForward();
  }

  placeBlock(blockType, entity = this.player) {
    const position = entity.position;
    let placedBlock = null;

    const ground = this.groundPlane.getBlockAt(position);
    const currentBlock = this.actionPlane.getBlockAt(position);
    const block = new LevelBlock(blockType);
    let result = entity.canPlaceBlockOver(block, ground);
    if (result.canPlace && !currentBlock.getIsMiniblock()) {
      switch (result.plane) {
        case "actionPlane":
          placedBlock = this.actionPlane.setBlockAt(position, block);
          entity.walkableCheck(block);
          break;
        case "groundPlane":
          this.groundPlane.setBlockAt(position, block);
          break;
      }
    }

    return placedBlock;
  }

  placeBlockForward(blockType, targetPlane, entity = this.player) {
    return this.placeBlockDirection(blockType, targetPlane, entity, 0);
  }

  placeBlockDirection(blockType, targetPlane, entity, direction) {
    let blockPosition = this.getMoveDirectionPosition(entity, direction);

    //for placing wetland for crops in free play
    if (blockType === "watering") {
      blockType = "farmlandWet";
      targetPlane = this.groundPlane;
    }
    return targetPlane.setBlockAt(blockPosition, new LevelBlock(blockType));
  }

  destroyBlock(position) {
    var block = null;

    if (this.inBounds(position)) {
      block = this.actionPlane.getBlockAt(position);
      if (block !== null) {
        block.position = position;

        if (block.isDestroyable) {
          this.actionPlane.setBlockAt(position, new LevelBlock(""));
        }
      }
    }
    return block;
  }

  destroyBlockForward(entity) {
    var block = null;

    let blockForwardPosition = this.getMoveForwardPosition(entity);

    if (this.inBounds(blockForwardPosition)) {
      block = this.actionPlane.getBlockAt(blockForwardPosition);
      if (block !== null) {

        if (block.isDestroyable) {
          this.actionPlane.setBlockAt(blockForwardPosition, new LevelBlock(""));
        }
      }
    }
    return block;
  }

  solveFOWTypeForMap() {
    var emissives,
      blocksToSolve;

    emissives = this.getAllEmissives();
    blocksToSolve = this.findBlocksAffectedByEmissives(emissives);

    for (var block in blocksToSolve) {
      if (blocksToSolve.hasOwnProperty(block)) {
        this.solveFOWTypeFor(blocksToSolve[block], emissives);
      }
    }
  }

  solveFOWTypeFor(position, emissives) {
    var emissivesTouching,
      topLeftQuad = false,
      botLeftQuad = false,
      leftQuad = false,
      topRightQuad = false,
      botRightQuad = false,
      rightQuad = false,
      topQuad = false,
      botQuad = false,
      angle = 0,
      index = this.coordinatesToIndex(position),
      x,
      y;

    emissivesTouching = this.findEmissivesThatTouch(position, emissives);

    for (var torch in emissivesTouching) {
      var currentTorch = emissivesTouching[torch];
      y = position[1];
      x = position[0];

      angle = Math.atan2(currentTorch[1] - position[1], currentTorch[0] - position[0]);
      //invert
      angle = -angle;
      //Normalize to be between 0 and 2*pi
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      //convert to degrees for simplicity
      angle *= 360 / (2 * Math.PI);

      //top right
      if (!rightQuad && angle > 32.5 && angle <= 57.5) {
        topRightQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_TopRight", precedence: 0 });
      }//top left
      if (!leftQuad && angle > 122.5 && angle <= 147.5) {
        topLeftQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_TopLeft", precedence: 0 });
      }//bot left
      if (!leftQuad && angle > 212.5 && angle <= 237.5) {
        botLeftQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_BottomLeft", precedence: 0 });
      }//botright
      if (!rightQuad && angle > 302.5 && angle <= 317.5) {
        botRightQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_BottomRight", precedence: 0 });
      }
      //right
      if (angle >= 327.5 || angle <= 32.5) {
        rightQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Right", precedence: 1 });
      }//bot
      if (angle > 237.5 && angle <= 302.5) {
        botQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom", precedence: 1 });
      }
      //left
      if (angle > 147.5 && angle <= 212.5) {
        leftQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Left", precedence: 1 });
      }
      //top
      if (angle > 57.5 && angle <= 122.5) {
        topQuad = true;
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top", precedence: 1 });
      }
    }

    if (topLeftQuad && botLeftQuad) {
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Left", precedence: 1 });
    }
    if (topRightQuad && botRightQuad) {
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Right", precedence: 1 });
    }
    if (topLeftQuad && topRightQuad) {
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top", precedence: 1 });
    }
    if (botRightQuad && botLeftQuad) {
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom", precedence: 1 });
    }

    if (leftQuad && rightQuad || topQuad && botQuad || (rightQuad && botQuad && topLeftQuad) ||
      (botQuad && topRightQuad && topLeftQuad) || (topQuad && botRightQuad && botLeftQuad) ||
      (leftQuad && topRightQuad && botRightQuad) || (leftQuad && botQuad && topRightQuad)) {
      //fully lit
      this.fowPlane[index] = "";
    } else if (topLeftQuad && botRightQuad) {
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_TopLeftBottomRight", precedence: 2 });
    } else if (botLeftQuad && topRightQuad) {
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_BottomLeftTopRight", precedence: 2 });
    } else if ((botQuad && leftQuad) || (botQuad && topLeftQuad) || (leftQuad && botRightQuad)) {
      // darkend botleft corner
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom_Left", precedence: 2 });
    } else if ((botQuad && rightQuad) || (botQuad && topRightQuad) || (rightQuad && botLeftQuad)) {
      // darkend botRight corner
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom_Right", precedence: 2 });
    } else if ((topQuad && rightQuad) || (topQuad && botRightQuad) || (rightQuad && topLeftQuad)) {
      // darkend topRight corner
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top_Right", precedence: 2 });
    } else if ((topQuad && leftQuad) || (topQuad && botLeftQuad) || (leftQuad && topRightQuad)) {
      // darkend topLeft corner
      this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top_Left", precedence: 2 });
    }
  }

  pushIfHigherPrecedence(index, fowObject) {
    if (fowObject === "") {
      this.fowPlane[index] = "";
      return;
    }
    var existingItem = this.fowPlane[index];
    if (existingItem && existingItem.precedence > fowObject.precedence) {
      return;
    }
    this.fowPlane[index] = fowObject;
  }

  /**
   * @return {Position[]}
   */
  getAllEmissives() {
    var emissives = [];
    for (var y = 0; y < this.planeHeight; ++y) {
      for (var x = 0; x < this.planeWidth; ++x) {
        let position = new Position(x, y);
        if (
          (!this.actionPlane.getBlockAt(position).isEmpty &&
            this.actionPlane.getBlockAt(position).isEmissive) ||
          (this.groundPlane.getBlockAt(position).isEmissive &&
            (this.actionPlane.getBlockAt(position).isEmpty || this.actionPlane.getBlockAt(position).isTransparent)) ||
          (this.actionPlane.getBlockAt(position).isEmpty &&
            this.groundDecorationPlane.getBlockAt(position).isEmissive)
        ) {
          emissives.push(position);
        }
      }
    }
    return emissives;
  }

  /**
   * @param {Position[]}
   */
  findBlocksAffectedByEmissives(emissives) {
    var blocksTouchedByEmissives = {};
    //find emissives that are close enough to light us.
    for (var torch in emissives) {
      var currentTorch = emissives[torch];
      let x = currentTorch.x;
      let y = currentTorch.y;
      for (var yIndex = currentTorch.y - 2; yIndex <= (y + 2); ++yIndex) {
        for (var xIndex = currentTorch.x - 2; xIndex <= (x + 2); ++xIndex) {

          let position = new Position(xIndex, yIndex);

          //Ensure we're looking inside the map
          if (!this.inBounds(position)) {
            continue;
          }

          //Ignore the indexes directly around us.
          //Theyre taken care of on the FOW first pass
          if ((yIndex >= y - 1 && yIndex <= y + 1) && (xIndex >= x - 1 && xIndex <= x + 1)) {
            continue;
          }

          //we want unique copies so we use a map.
          blocksTouchedByEmissives[`${yIndex}_${xIndex}`] = position;
        }
      }
    }

    return blocksTouchedByEmissives;
  }

  findEmissivesThatTouch(position, emissives) {
    var emissivesThatTouch = [];
    let y = position.y;
    let x = position.x;

    //find emissives that are close enough to light us.
    for (var yIndex = y - 2; yIndex <= (y + 2); ++yIndex) {
      for (var xIndex = x - 2; xIndex <= (x + 2); ++xIndex) {

        let touchingPosition = new Position(xIndex, yIndex);

        //Ensure we're looking inside the map
        if (!this.inBounds(touchingPosition)) {
          continue;
        }

        //Ignore the indexes directly around us.
        if ((yIndex >= y - 1 && yIndex <= y + 1) && (xIndex >= x - 1 && xIndex <= x + 1)) {
          continue;
        }

        for (var torch in emissives) {
          if (Position.equals(emissives[torch], touchingPosition)) {
            emissivesThatTouch.push(emissives[torch]);
          }
        }
      }
    }

    return emissivesThatTouch;
  }

  computeFowPlane() {
    var x, y;

    this.fowPlane = [];
    if (!this.isDaytime) {
      // compute the fog of war for light emitting blocks
      for (y = 0; y < this.planeHeight; ++y) {
        for (x = 0; x < this.planeWidth; ++x) {
          this.fowPlane.push({ x: x, y: y, type: "FogOfWar_Center" });
        }
      }

      //second pass for partial lit squares
      this.solveFOWTypeForMap();

      for (y = 0; y < this.planeHeight; ++y) {
        for (x = 0; x < this.planeWidth; ++x) {
          const position = new Position(x, y);
          const groundBlock = this.groundPlane.getBlockAt(position);
          const actionBlock = this.actionPlane.getBlockAt(position);
          const decorationBlock = this.groundDecorationPlane.getBlockAt(position);
          if (groundBlock.isEmissive && (actionBlock.isEmpty || actionBlock.isTransparent) ||
            (!actionBlock.isEmpty && actionBlock.isEmissive) ||
            (actionBlock.isEmpty && decorationBlock.isEmissive)) {
            this.clearFowAround(x, y);
          }
        }
      }

    }
  }

  clearFowAround(x, y) {
    var ox, oy;

    for (oy = -1; oy <= 1; ++oy) {
      for (ox = -1; ox <= 1; ++ox) {
        this.clearFowAt(x + ox, y + oy);
      }
    }
  }

  clearFowAt(x, y) {
    if (x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight) {
      let blockIndex = this.yToIndex(y) + x;
      this.fowPlane[blockIndex] = "";
    }
  }

  clearFow() {
    for (var x = 0; x < this.planeWidth; x++) {
      for (var y = 0; y < this.planeHeight; y++) {
        let blockIndex = this.yToIndex(y) + x;
        this.fowPlane[blockIndex] = "";
      }
    }
  }

  computeShadingPlane() {
    this.shadingPlane = [];
    this.computeShading(this.actionPlane);
    this.computeShading(this.groundPlane);
  }

  occludedBy(block) {
    return block && !block.getIsEmptyOrEntity() && !block.getIsLiquid();
  }

  computeShading(plane) {
    var x,
      y,
      index,
      hasRight;

    for (index = 0; index < this.planeArea(); ++index) {
      x = index % this.planeWidth;
      y = Math.floor(index / this.planeWidth);

      const position = new Position(x, y);

      hasRight = false;

      const block = plane.getBlockAt(position);
      const groundBlock = this.groundPlane.getBlockAt(position);
      if (block.isEmpty || block.isTransparent || block.getIsLiquid()) {
        let atlas = 'AO';
        if (block.blockType === 'lava') {
          atlas = 'LavaGlow';
        } else if (block.blockType === 'water' || block.blockType === 'magmaUnderwater') {
          atlas = 'WaterAO';
        }

        if (block === groundBlock || !groundBlock.getIsLiquid()) {
          // Edge of world AO.
          if (y === 0) {
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Bottom'});
          }

          if (y === this.planeHeight - 1) {
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Top'});
          }

          if (x === 0) {
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Right'});
          }

          if (x === this.planeWidth - 1) {
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Left'});
          }
        }

        // Neighbor AO.
        const surrounding = plane.getSurroundingBlocks(position);
        if (x < this.planeWidth - 1 && this.occludedBy(surrounding.east)) {
          // needs a left side AO shadow
          this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_Left' });
        }

        if (x > 0 && this.occludedBy(surrounding.west)) {
          // needs a right side AO shadow
          this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_Right' });

          // Lighting shadows.
          if (!block.getIsLiquid()) {
            this.shadingPlane.push({
              x,
              y,
              atlas: 'blockShadows',
              type: 'Shadow_Parts_Fade_base.png'
            });

            if (y > 0 && x > 0 &&
              plane.getBlockAt(Position.north(Position.west(position))).getIsEmptyOrEntity()) {
              this.shadingPlane.push({
                x,
                y,
                atlas: 'blockShadows',
                type: 'Shadow_Parts_Fade_top.png'
              });
            }
          }

          hasRight = true;
        }

        if (y > 0 && this.occludedBy(surrounding.north)) {
          // needs a bottom side AO shadow
          this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_Bottom' });
        } else if (y > 0) {
          if (x < this.planeWidth - 1 && this.occludedBy(surrounding.northEast) &&
            !this.occludedBy(surrounding.east)) {
            // needs a bottom left side AO shadow
            this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_BottomLeft' });
          }

          if (!hasRight && x > 0 && this.occludedBy(surrounding.northWest)) {
            // needs a bottom right side AO shadow
            this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_BottomRight' });
          }
        }

        if (y < this.planeHeight - 1 && this.occludedBy(surrounding.south)) {
          // needs a top side AO shadow
          this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_Top' });
        } else if (y < this.planeHeight - 1) {
          if (x < this.planeWidth - 1 && this.occludedBy(surrounding.southEast) &&
            !this.occludedBy(surrounding.east)) {
            // needs a bottom left side AO shadow
            this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_TopLeft' });
          }

          if (!hasRight && x > 0 && this.occludedBy(surrounding.southWest)) {
            // needs a bottom right side AO shadow
            this.shadingPlane.push({ x, y, atlas, type: 'AOeffect_TopRight' });
          }
        }
      }
    }
  }
};
