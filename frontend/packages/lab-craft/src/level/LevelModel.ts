import type BaseEntity from '../BaseEntity';
import Agent from '../entities/Agent';
import Player from '../entities/Player';
import FacingDirection, {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';
import Position from '../Position';
import type {CraftData, VerificationAPI} from '../types';
import {safeEval} from '../utils';

import LevelBlock from './LevelBlock';
import LevelPlane from './LevelPlane';

export interface PlaneItem {
  x: number;
  y: number;
  type: string;
  precedence?: number;
}

export type FowPlaneItem = PlaneItem | '';

export interface ShadingPlaneItem {
  x: number;
  y: number;
  type: string;
  atlas: string;
}

// For blocks on the action plane, we need an actual "block" object, so we can model
class LevelModel implements VerificationAPI {
  readonly planeWidth: number;
  readonly planeHeight: number;
  usePlayer: boolean = false;
  usingAgent: boolean = false;
  player?: Player;
  agent?: Agent;
  scene: LevelRunnerScene;
  fowPlane: FowPlaneItem[] = [];
  shadingPlane: ShadingPlaneItem[] = [];
  groundPlane!: LevelPlane;
  groundDecorationPlane!: LevelPlane;
  actionPlane!: LevelPlane;
  fluffPlane!: LevelPlane;
  isDaytime: boolean = false;
  initialLevelData: CraftData;

  constructor(levelData: CraftData, scene: LevelRunnerScene) {
    this.planeWidth = levelData.gridDimensions
      ? levelData.gridDimensions[0]
      : 10;
    this.planeHeight = levelData.gridDimensions
      ? levelData.gridDimensions[1]
      : 10;
    this.scene = scene;

    this.initialLevelData = {...levelData};

    if (typeof this.initialLevelData.verificationFunction === 'string') {
      this.initialLevelData.verificationFunction = safeEval(this.initialLevelData.verificationFunction, () => false);
    }

    this.reset();
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

  inBounds(position: Position): boolean {
    const x = position.x;
    const y = position.y;
    return x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight;
  }

  reset() {
    this.groundPlane = new LevelPlane(
      this.initialLevelData.groundPlane || [],
      this.planeWidth,
      this.planeHeight,
      this,
      'groundPlane',
    );
    this.groundDecorationPlane = new LevelPlane(
      this.initialLevelData.groundDecorationPlane || [],
      this.planeWidth,
      this.planeHeight,
      this,
      'decorationPlane',
    );
    this.shadingPlane = [];
    this.actionPlane = new LevelPlane(
      this.initialLevelData.actionPlane || [],
      this.planeWidth,
      this.planeHeight,
      this,
      'actionPlane',
    );

    this.actionPlane.powerRedstone();

    this.actionPlane.getAllPositions().forEach(position => {
      if (this.actionPlane.getBlockAt(position)?.isRedstone) {
        this.actionPlane.determineRedstoneSprite(position);
      }
      if (this.actionPlane.getBlockAt(position)?.isRail) {
        this.actionPlane.determineRailType(position);
      }
    });

    this.fluffPlane = new LevelPlane(
      this.initialLevelData.fluffPlane || [],
      this.planeWidth,
      this.planeHeight,
      this,
      'fluffPlane',
    );
    this.fowPlane = [];
    this.isDaytime =
      this.initialLevelData.isDaytime === undefined ||
      this.initialLevelData.isDaytime;

    const levelData = Object.create(this.initialLevelData);
    if (this.initialLevelData.usePlayer !== undefined) {
      this.usePlayer = this.initialLevelData.usePlayer;
    } else {
      this.usePlayer = true;
    }

    if (this.usePlayer) {
      const position = Position.fromArray(levelData.playerStartPosition);
      console.log('creating player');
      this.player = new Player(
        this.scene,
        'Player',
        this.initialLevelData.playerName || 'Steve',
        position.x,
        position.y,
        levelData.playerStartDirection,
        !this.actionPlane.getBlockAt(position)?.getIsEmptyOrEntity(),
      );
      this.scene.levelEntity.pushEntity(this.player);
      this.scene.player = this.player;

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
   * @param levelData - the initial level data object, specifying the
   *        Agent's default position and direction
   * @param [positionOverride] optional position override
   * @param [directionOverride] optional direction override
   */
  spawnAgent(
    levelData: CraftData,
    positionOverride?: Position,
    directionOverride?: Direction,
  ) {
    this.usingAgent = true;

    const position = positionOverride || Position.fromArray(levelData.agentStartPosition || [0, 0]);

    const direction = directionOverride !== undefined ? directionOverride : levelData.agentStartDirection || Direction.North;

    const name = 'PlayerAgent';
    const key = 'Agent';

    const startingBlock = this.actionPlane.getBlockAt(position);
    console.log('spawnAgent', direction, position);
    this.agent = new Agent(
      this.scene,
      'agent',
      name,
      position.x,
      position.y,
      direction,
      !startingBlock?.getIsEmptyOrEntity(),
      key,
    );
    this.scene.levelEntity.pushEntity(this.agent);
    this.scene.agent = this.agent;
  }

  /**
   * Destroys the agent entity; is the inverse of spawnAgent.
   */
  destroyAgent() {
    this.scene.agent = undefined;
    if (this.agent) {
      this.scene.levelEntity.destroyEntity(this.agent.identifier);
    }
    this.agent = undefined;
    this.usingAgent = false;
  }

  yToIndex(y: number): number {
    return y * this.planeWidth;
  }

  isSolved(): boolean {
    if (typeof this.initialLevelData.verificationFunction === 'string') {
      return false;
    }

    return !!this.initialLevelData.verificationFunction?.(this);
  }

  isFailed(): boolean {
    if (typeof this.initialLevelData.failureCheckFunction === 'string') {
      return false;
    }

    if (this.initialLevelData.failureCheckFunction !== undefined) {
      return this.initialLevelData.failureCheckFunction(this);
    } else {
      return false;
    }
  }

  getHouseBottomRight(): Position {
    return Position.fromArray(this.initialLevelData.houseBottomRight || [0, 0]);
  }

  // Verifications
  isPlayerNextTo(blockType: string): boolean {
    if (!this.player || !this.usePlayer) {
      return false;
    }

    return Position.getOrthogonalPositions(this.player.position).some(
      position => {
        return (
          this.inBounds(position) &&
          (this.isBlockOfType(position, blockType) ||
            this.isEntityOfType(position, blockType) ||
            this.groundPlane.getBlockAt(position)?.blockType === blockType)
        );
      },
    );
  }

  isEntityNextTo(entityType: string, blockType: string): boolean {
    const entityList = this.scene.levelEntity.getEntitiesOfType(entityType);

    return entityList.some(entity => {
      return Position.getOrthogonalPositions(entity.position).some(position => {
        return (
          this.inBounds(position) &&
          (this.isBlockOfType(position, blockType) ||
            this.isEntityOfType(position, blockType) ||
            this.groundPlane.getBlockAt(position)?.blockType === blockType)
        );
      });
    });
  }

  isEntityOnBlocktype(entityType: string, blockType: string, count: number = 1): boolean {
    const entityList = this.scene.levelEntity.getEntitiesOfType(entityType);

    let resultCount = 0;
    for (let i = 0; i < entityList.length; i++) {
      const entity = entityList[i];
      if (
        this.isBlockOfType(entity.position, blockType) ||
        this.groundPlane.getBlockAt(entity.position)?.blockType === blockType
      ) {
        resultCount++;
      }
    }

    return resultCount >= count;
  }

  /**
   * @param {string} entityType - The type of entity to check against.
   * @param position - Position to check against.
   */
  isEntityAt(entityType: string, position: Position): boolean {
    const entityList = this.scene.levelEntity.getEntitiesOfType(entityType);
    for (let i = 0; i < entityList.length; i++) {
      const entity = entityList[i];
      if (Position.equals(entity.position, position)) {
        return true;
      }
    }

    return false;
  }

  isEntityTypeRunning(entityType: string): boolean {
    const entityList = this.scene.levelEntity.getEntitiesOfType(entityType);
    for (let i = 0; i < entityList.length; i++) {
      const entity = entityList[i];
      const notStarted = !entity.queue.isStarted();
      const notFinished = !entity.queue.isFinished();
      if ((notStarted && entity.queue.commandList.length > 0) || notFinished) {
        return true;
      }
    }
    return false;
  }

  isEntityDied(entityType: string, count: number = 1): boolean {
    const deathCount = this.scene.levelEntity.entityDeathCount;
    if (deathCount.has(entityType)) {
      if ((deathCount.get(entityType) || 0) >= count) {
        return true;
      }
    }
    return false;
  }

  getScore(): number {
    return this.scene.score;
  }

  shouldRide(direction: Direction): boolean {
    const player = this.player;
    if (!player) {
      return false;
    }

    const frontPosition = this.getNextRailPosition(player, direction);
    const frontBlock = this.actionPlane.getBlockAt(frontPosition);
    if (!frontBlock) {
      return false;
    }

    return this.isNextRailValid(frontBlock, direction);
  }

  isNextRailValid(block: LevelBlock, direction: Direction): boolean {
    return (
      FacingDirection.opposite(block.connectionA || Direction.North) === direction ||
      FacingDirection.opposite(block.connectionB || Direction.North) === direction ||
      block.connectionA === direction ||
      block.connectionB === direction
    );
  }

  getNextRailPosition(entity: BaseEntity, direction: Direction): Position {
    const offset =
      Position.directionToOffsetPosition(direction) || new Position(0, 0);
    return Position.add(entity.position, offset);
  }

  getEntityCount(entityType: string): number {
    const entityList = this.scene.levelEntity.getEntitiesOfType(entityType);
    return entityList.length;
  }

  getCommandExecutedCount(commandName: string, targetType?: string): number {
    return this.scene.getCommandCount(commandName, targetType, false);
  }

  getRepeatCommandExecutedCount(commandName: string, targetType?: string): number {
    return this.scene.getCommandCount(commandName, targetType, true);
  }

  getTurnRandomCount(): number {
    return this.scene.turnRandomCount;
  }

  getInventoryAmount(inventoryType: string): number {
    if (!this.player || !this.usePlayer) {
      return 0;
    }

    if (inventoryType === 'all' || inventoryType === 'All') {
      const inventory = this.player.inventory;
      let count = 0;
      for (const key in inventory) {
        count += inventory[key];
      }
      return count;
    }

    return this.player.inventory[inventoryType];
  }

  getInventoryTypes(): string[] {
    if (!this.player || !this.usePlayer) {
      return [];
    }

    return Object.keys(this.player.inventory);
  }

  countOfTypeOnMap(blockType: string): number {
    const blocksOfType = this.actionPlane.getAllPositions().filter(position => {
      return this.actionPlane.getBlockAt(position)?.blockType === blockType;
    });

    return blocksOfType.length;
  }

  /**
   * @param position - Position to check against.
   */
  isPlayerAt(position: Position): boolean {
    if (!this.player || !this.usePlayer) {
      return false;
    }

    return Position.equals(this.player.position, position);
  }

  spritePositionToIndex(offset: Position, spritePosition: Position): Position {
    const position = Position.subtract(spritePosition, offset);
    return new Position(position.x / 40, position.y / 40);
  }

  solutionMapMatchesResultMap(solutionMap: string[]): boolean {
    for (let i = 0; i < this.planeArea(); i++) {
      const solutionItemType = solutionMap[i];
      const position = this.actionPlane.indexToCoordinates(i);

      // "" on the solution map means we dont care what's at that spot
      if (solutionItemType !== '') {
        if (solutionItemType === 'empty') {
          if (!this.actionPlane.getBlockAt(position)?.isEmpty) {
            return false;
          }
        } else if (solutionItemType === 'any') {
          if (this.actionPlane.getBlockAt(position)?.isEmpty) {
            return false;
          }
        } else if (
          this.actionPlane.getBlockAt(position)?.blockType !== solutionItemType
        ) {
          return false;
        }
      }
    }

    return true;
  }

  getTnt() {
    return this.actionPlane.getAllPositions().filter(position => {
      const block = this.actionPlane.getBlockAt(position);
      return block && block.blockType === 'tnt';
    });
  }

  getMoveForwardPosition(entity?: BaseEntity): Position {
    entity ||= this.player;
    return Position.forward(entity?.position || new Position(0, 0), entity?.facing || Direction.North);
  }

  getMoveDirectionPosition(entity: BaseEntity, direction: Direction) {
    let absoluteDirection = entity.facing;
    for (let i = 0; i < direction; i++) {
      absoluteDirection = FacingDirection.turn(absoluteDirection, 'right');
    }

    return Position.forward(entity.position, absoluteDirection);
  }

  isForwardBlockOfType(blockType: string): boolean {
    const blockForwardPosition = this.getMoveForwardPosition();

    const actionIsEmpty = this.isBlockOfTypeOnPlane(
      blockForwardPosition,
      'empty',
      this.actionPlane,
    );

    if (blockType === '' && actionIsEmpty) {
      return true;
    }

    return actionIsEmpty
      ? this.isBlockOfTypeOnPlane(
          blockForwardPosition,
          blockType,
          this.groundPlane,
        )
      : this.isBlockOfTypeOnPlane(
          blockForwardPosition,
          blockType,
          this.actionPlane,
        );
  }

  getForwardBlockType(): string {
    const forwardBlock = this.getForwardBlock();
    if (forwardBlock) {
      return forwardBlock.blockType;
    }
    return '';
  }

  getForwardBlock(): LevelBlock | undefined {
    const blockForwardPosition = this.getMoveForwardPosition();
    return this.actionPlane.getBlockAt(blockForwardPosition);
  }

  isBlockOfType(position: Position, blockType: string): boolean {
    return this.isBlockOfTypeOnPlane(position, blockType, this.actionPlane);
  }

  isEntityOfType(position: Position, type: string): boolean {
    const entities = this.scene.levelEntity.getEntitiesOfType(type);
    return entities.some(entity => Position.equals(position, entity.position));
  }

  isBlockOfTypeOnPlane(position: Position, blockType: string, plane: LevelPlane): boolean {
    let result: boolean = false;

    if (this.inBounds(position)) {
      if (blockType === 'empty') {
        result = !!plane.getBlockAt(position)?.isEmpty;
      } else if (blockType === 'tree') {
        result = !!plane.getBlockAt(position)?.getIsTree();
      } else {
        result = blockType === plane.getBlockAt(position)?.blockType;
      }
    }

    return result;
  }

  isPlayerStandingInWater() {
    return (
      this.groundPlane.getBlockAt(this.player?.position || new Position(1000, 1000))?.blockType === 'water'
    );
  }

  isPlayerStandingInLava() {
    return (
      this.groundPlane.getBlockAt(this.player?.position || new Position(1000, 1000))?.blockType === 'lava'
    );
  }

  coordinatesToIndex(coordinates: Position) {
    return this.yToIndex(coordinates.y) + coordinates.x;
  }

  checkPositionForTypeAndPush(blockType: string | undefined, position: Position, objectArray: [boolean, Position | undefined][]): boolean {
    if (
      (!blockType && this.actionPlane.getBlockAt(position)?.blockType !== '') ||
      this.isBlockOfType(position, blockType || '')
    ) {
      objectArray.push([true, position]);
      return true;
    } else {
      objectArray.push([false, undefined]);
      return false;
    }
  }

  houseGroundToFloorHelper(position: [number, number, number], woolType: string, arrayCheck: [number, number, number][]): [number, number, number][] {
    let checkIndex = 0;
    let index = this.yToIndex(position[2]) + position[1];
    const array = arrayCheck;

    if (index === 44) {
      index = 44;
    }

    const posAbove: [number, number, number] = [0, position[1], position[2] + 1];
    posAbove[0] = this.yToIndex(posAbove[2]) + posAbove[1];

    const posBelow: [number, number, number] = [0, position[1], position[2] - 1];
    posBelow[0] = this.yToIndex(posBelow[2]) + posBelow[1];

    const posRight: [number, number, number] = [0, position[1] + 1, position[2]];
    posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

    const posLeft: [number, number, number] = [0, position[1] - 1, position[2]];
    posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

    const checkActionBlock = this.actionPlane.getBlockAt(
      this.actionPlane.indexToCoordinates(index),
    );

    for (let i = 0; i < array.length; i++) {
      if (array[i][0] === index) {
        checkIndex = -1;
        break;
      }
    }

    if (checkActionBlock?.blockType !== '') {
      return [];
    } else if (array.length > 0 && checkIndex === -1) {
      return [];
    }

    array.push(position);
    array.concat(this.houseGroundToFloorHelper(posAbove, woolType, array));
    array.concat(this.houseGroundToFloorHelper(posBelow, woolType, array));
    array.concat(this.houseGroundToFloorHelper(posRight, woolType, array));
    array.concat(this.houseGroundToFloorHelper(posLeft, woolType, array));

    return array;
  }

  houseGroundToFloorBlocks(startingPosition: Position) {
    //checkCardinalDirections for actionblocks.
    //If no action block and square isn't the type we want.
    //Change it.
    const woolType = 'wool_orange';

    //Place this block here
    //this.createBlock(this.groundPlane, startingPosition[0], startingPosition[1], woolType);
    const helperStartData: [number, number, number] = [0, startingPosition.x, startingPosition.y];
    return this.houseGroundToFloorHelper(helperStartData, woolType, []);
  }

  getEntityAt(position: Position): BaseEntity | undefined {
    for (const entity of this.scene.levelEntity.entityMap) {
      if (Position.equals(entity[1].position, position)) {
        return entity[1];
      }
    }

    return;
  }

  getAllBorderingPositionNotOfType(position: Position, blockType: string): [boolean, Position | undefined][] {
    const surroundingBlocks: [boolean, Position | undefined][] = this.getAllBorderingPosition(position);

    for (let b = 1; b < surroundingBlocks.length; b++) {
      const blockPosition: Position | undefined = surroundingBlocks[b][1];
      if (
        surroundingBlocks[b][0] &&
        blockPosition &&
        this.actionPlane.getBlockAt(blockPosition)?.blockType === blockType
      ) {
        surroundingBlocks[b][0] = false;
      }
    }

    return surroundingBlocks;
  }

  getAllBorderingPosition(position: Position, blockType?: string): [boolean, Position | undefined][] {
    const allFoundObjects: [boolean, Position | undefined][] = [[false, undefined]];

    Position.getSurroundingPositions(position).forEach(surroundingPosition => {
      if (
        this.checkPositionForTypeAndPush(
          blockType,
          surroundingPosition,
          allFoundObjects,
        )
      ) {
        allFoundObjects[0][0] = true;
      }
    });

    return allFoundObjects;
  }

  canMoveForward(entity?: BaseEntity): [boolean, (string | BaseEntity)[]] {
    entity ||= this.player;
    if (!entity) {
      return [false, []];
    }

    const position = this.getMoveForwardPosition(entity);
    if (!this.scene.followingPlayer() && (position.x > 9 || position.y > 9)) {
      return [false, []];
    }

    return this.isPositionEmpty(position, entity);
  }

  canMoveBackward(entity?: BaseEntity): [boolean, (string | BaseEntity)[]] {
    entity ||= this.player;
    if (!entity) {
      return [false, []];
    }

    const position = this.getMoveDirectionPosition(entity, 2);
    return this.isPositionEmpty(position, entity);
  }

  isPositionEmpty(position: Position, entity?: BaseEntity): [boolean, (string | BaseEntity)[]] {
    entity ||= this.player;

    const result: [boolean, (string | BaseEntity)[]] = [false, []];

    if (this.inBounds(position)) {
      if (!this.actionPlane.getBlockAt(position)?.isWalkable) {
        result[1].push('notWalkable');
      }
      if (!this.actionPlane.getBlockAt(position)?.isEmpty) {
        if (this.player?.isOnBlock) {
          return [true, []];
        }
        result[1].push('notEmpty');
      }

      // Prevent walking into water/lava in levels where the player is
      // controlled by arrow keys. In levels where the player is controlled by
      // blocks, let them drown.
      const blockTypeAtPosition =
        this.groundPlane.getBlockAt(position)?.blockType || '';
      const frontEntity = this.getEntityAt(position);
      const isWalkable = !!this.actionPlane.getBlockAt(position)?.isWalkable;
      if (['water', 'lava'].includes(blockTypeAtPosition) && isWalkable) {
        if (this.scene.getIsDirectPlayerControl()) {
          result[1].push(blockTypeAtPosition);
        } else if (!frontEntity || frontEntity.canMoveThrough()) {
          return [true, []];
        }
      }

      if (
        this.groundPlane.getBlockAt(position)?.blockType !== 'water' &&
        this.isInBoat()
      ) {
        result[1].push('notWater');
        return result;
      }

      if (frontEntity) {
        result[1].push('frontEntity');
        result[1].push(frontEntity);
      }

      const groundBlock = this.groundPlane.getBlockAt(position);
      const actionBlock = this.actionPlane.getBlockAt(position);
      result[0] = !!actionBlock && !!entity?.hasPermissionToWalk(
        actionBlock,
        frontEntity,
        groundBlock,
      );
    } else {
      result[1].push('outBound');
    }

    return result;
  }

  canMoveDirection(entity: BaseEntity, direction: Direction): [boolean, (string | BaseEntity)[]] {
    // save current direction of the entity
    const currentDirection = entity.facing;
    this.turnToDirection(entity, direction);
    const result = this.canMoveForward(entity);
    // rerotate the entity to the saved direction
    this.turnToDirection(entity, currentDirection);
    return result;
  }

  canPlaceBlock(entity: BaseEntity, blockAtPosition: LevelBlock): boolean {
    return entity.canPlaceBlock(blockAtPosition);
  }

  canPlaceBlockDirection(blockType: string, entity: BaseEntity, direction: Direction): boolean {
    if (entity.isOnBlock) {
      return false;
    }

    const plane = this.getPlaneToPlaceOn(
      this.getMoveDirectionPosition(entity, direction),
      entity,
      blockType,
    );

    if (plane === this.groundPlane) {
      if (
        LevelBlock.notValidOnGroundPlane(blockType) &&
        this.groundPlane.getBlockAt(
          this.getMoveDirectionPosition(entity, direction),
        )
      ) {
        return false;
      }
    }

    if (
      this.checkEntityConflict(this.getMoveDirectionPosition(entity, direction))
    ) {
      return false;
    }

    return (
      this.getPlaneToPlaceOn(
        this.getMoveDirectionPosition(entity, direction),
        entity,
        blockType,
      ) !== null
    );
  }

  checkEntityConflict(position: Position): boolean {
    let conflict = false;
    this.scene.levelEntity.entityMap.forEach(entity => {
      if (Position.equals(entity.position, position)) {
        conflict = true;
      }
    });

    return conflict;
  }

  canPlaceBlockForward(blockType?: string, entity?: BaseEntity): boolean {
    entity ||= this.player;
    if (!entity) {
      return false;
    }

    return this.canPlaceBlockDirection(blockType || '', entity, 0);
  }

  getPlaneToPlaceOn(position: Position, entity: BaseEntity, blockType: string): LevelPlane | undefined {
    if (this.inBounds(position)) {
      const actionBlock = this.actionPlane.getBlockAt(position);
      if (actionBlock && entity === this.agent && actionBlock.isEmpty) {
        const groundBlock = this.groundPlane.getBlockAt(position);
        if (groundBlock && groundBlock.getIsLiquid()) {
          if (LevelBlock.getCanFall(blockType)) {
            return this.groundPlane;
          } else if (!LevelBlock.getIsPlaceableInLiquid(blockType)) {
            return;
          }
        }
        return this.actionPlane;
      }

      if (actionBlock?.isPlacable) {
        const groundBlock = this.groundPlane.getBlockAt(position);
        if (groundBlock?.isPlacable) {
          return this.groundPlane;
        }
        return this.actionPlane;
      }
    }

    return;
  }

  canDestroyBlockForward(entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return false;
    }

    let result = false;

    if (!entity.isOnBlock) {
      const blockForwardPosition = this.getMoveForwardPosition(entity);

      if (this.inBounds(blockForwardPosition)) {
        const block = this.actionPlane.getBlockAt(blockForwardPosition);
        if (block) {
          result = !block.isEmpty && (block.isDestroyable || block.isUsable);
        }
      }
    }

    return result;
  }

  moveForward(entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    const blockForwardPosition = this.getMoveForwardPosition(entity);
    this.moveTo(blockForwardPosition, entity);
  }

  moveBackward(entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    const blockBackwardPosition = this.getMoveDirectionPosition(entity, 2);
    this.moveTo(blockBackwardPosition, entity);
  }

  moveTo(position: Position, entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    entity.setMovePosition(position);

    if (this.actionPlane.getBlockAt(position)?.isEmpty) {
      entity.isOnBlock = false;
    }
  }

  turnLeft(entity?: BaseEntity) {
    entity ||= this.player;
    if (entity) {
      entity.facing = FacingDirection.turn(entity.facing, 'left');
    }
  }

  turnRight(entity?: BaseEntity) {
    entity ||= this.player;
    if (entity) {
      entity.facing = FacingDirection.turn(entity.facing, 'right');
    }
  }

  turnToDirection(entity: BaseEntity, direction: Direction) {
    entity.facing = direction;
  }

  moveDirection(entity: BaseEntity, direction: Direction) {
    this.turnToDirection(entity, direction);
    this.moveForward();
  }

  placeBlock(blockType: string, entity?: BaseEntity): LevelBlock | undefined {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    const position = entity.position;
    let placedBlock: LevelBlock | undefined;

    const ground = this.groundPlane.getBlockAt(position);
    const currentBlock = this.actionPlane.getBlockAt(position);
    const block = new LevelBlock(blockType);
    const result = (!!ground && entity.canPlaceBlockOver(block, ground)) || {
      canPlace: false,
      plane: ''
    };
    if (result.canPlace && currentBlock && !currentBlock.getIsMiniblock()) {
      switch (result.plane) {
        case 'actionPlane':
          placedBlock = this.actionPlane.setBlockAt(position, block);
          entity.walkableCheck(block);
          break;
        case 'groundPlane':
          this.groundPlane.setBlockAt(position, block);
          break;
      }
    }

    return placedBlock;
  }

  placeBlockForward(blockType: string, targetPlane: LevelPlane, entity?: BaseEntity): LevelBlock | undefined {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    return this.placeBlockDirection(blockType, targetPlane, entity, 0);
  }

  placeBlockDirection(blockType: string, targetPlane: LevelPlane, entity: BaseEntity, direction: Direction) {
    const blockPosition = this.getMoveDirectionPosition(entity, direction);

    // For placing wetland for crops in free play
    if (blockType === 'watering') {
      blockType = 'farmlandWet';
      targetPlane = this.groundPlane;
    }

    return targetPlane.setBlockAt(blockPosition, new LevelBlock(blockType));
  }

  destroyBlock(position: Position): LevelBlock | undefined {
    let block: LevelBlock | undefined;

    if (this.inBounds(position)) {
      block = this.actionPlane.getBlockAt(position);
      if (block) {
        if (block.isDestroyable) {
          this.actionPlane.setBlockAt(position, new LevelBlock(''));
        }
      }
    }

    return block;
  }

  destroyBlockForward(entity: BaseEntity) {
    let block = null;

    const blockForwardPosition = this.getMoveForwardPosition(entity);

    if (this.inBounds(blockForwardPosition)) {
      block = this.actionPlane.getBlockAt(blockForwardPosition);
      if (block?.isDestroyable) {
        this.actionPlane.setBlockAt(blockForwardPosition, new LevelBlock(''));
      }
    }
    return block;
  }

  solveFOWTypeForMap() {
    const emissives = this.getAllEmissives();
    const blocksToSolve = this.findBlocksAffectedByEmissives(emissives);

    for (const block of blocksToSolve) {
      this.solveFOWTypeFor(block, emissives);
    }
  }

  solveFOWTypeFor(position: Position, emissives: Position[]) {
    let topLeftQuad = false,
      botLeftQuad = false,
      leftQuad = false,
      topRightQuad = false,
      botRightQuad = false,
      rightQuad = false,
      topQuad = false,
      botQuad = false;

    const index = this.coordinatesToIndex(position);
    const emissivesTouching = this.findEmissivesThatTouch(position, emissives);

    const y = position.y;
    const x = position.x;

    for (const torch of emissivesTouching) {
      let angle = Math.atan2(torch.y - position.y, torch.x - position.x);
      // Invert
      angle = -angle;

      // Normalize to be between 0 and 2*pi
      if (angle < 0) {
        angle += 2 * Math.PI;
      }

      // Convert to degrees for simplicity
      angle *= 360 / (2 * Math.PI);

      // Top right
      if (!rightQuad && angle > 32.5 && angle <= 57.5) {
        topRightQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_InCorner_TopRight',
          precedence: 0,
        });
      }

      // Top left
      if (!leftQuad && angle > 122.5 && angle <= 147.5) {
        topLeftQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_InCorner_TopLeft',
          precedence: 0,
        });
      }

      // Bottom left
      if (!leftQuad && angle > 212.5 && angle <= 237.5) {
        botLeftQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_InCorner_BottomLeft',
          precedence: 0,
        });
      }

      // Bottom right
      if (!rightQuad && angle > 302.5 && angle <= 317.5) {
        botRightQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_InCorner_BottomRight',
          precedence: 0,
        });
      }

      // Right
      if (angle >= 327.5 || angle <= 32.5) {
        rightQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_Right',
          precedence: 1,
        });
      }

      // Bottom
      if (angle > 237.5 && angle <= 302.5) {
        botQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_Bottom',
          precedence: 1,
        });
      }

      // Left
      if (angle > 147.5 && angle <= 212.5) {
        leftQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_Left',
          precedence: 1,
        });
      }

      // Top
      if (angle > 57.5 && angle <= 122.5) {
        topQuad = true;
        this.pushIfHigherPrecedence(index, {
          x,
          y,
          type: 'FogOfWar_Top',
          precedence: 1,
        });
      }
    }

    if (topLeftQuad && botLeftQuad) {
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Left',
        precedence: 1,
      });
    }

    if (topRightQuad && botRightQuad) {
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Right',
        precedence: 1,
      });
    }

    if (topLeftQuad && topRightQuad) {
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Top',
        precedence: 1,
      });
    }

    if (botRightQuad && botLeftQuad) {
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Bottom',
        precedence: 1,
      });
    }

    if (
      (leftQuad && rightQuad) ||
      (topQuad && botQuad) ||
      (rightQuad && botQuad && topLeftQuad) ||
      (botQuad && topRightQuad && topLeftQuad) ||
      (topQuad && botRightQuad && botLeftQuad) ||
      (leftQuad && topRightQuad && botRightQuad) ||
      (leftQuad && botQuad && topRightQuad)
    ) {
      // Fully lit
      this.fowPlane[index] = '';
    } else if (topLeftQuad && botRightQuad) {
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_TopLeftBottomRight',
        precedence: 2,
      });
    } else if (botLeftQuad && topRightQuad) {
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_BottomLeftTopRight',
        precedence: 2,
      });
    } else if (
      (botQuad && leftQuad) ||
      (botQuad && topLeftQuad) ||
      (leftQuad && botRightQuad)
    ) {
      // Darkened bottom-left corner
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Bottom_Left',
        precedence: 2,
      });
    } else if (
      (botQuad && rightQuad) ||
      (botQuad && topRightQuad) ||
      (rightQuad && botLeftQuad)
    ) {
      // Darkened bottom-right corner
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Bottom_Right',
        precedence: 2,
      });
    } else if (
      (topQuad && rightQuad) ||
      (topQuad && botRightQuad) ||
      (rightQuad && topLeftQuad)
    ) {
      // Darkened top-right corner
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Top_Right',
        precedence: 2,
      });
    } else if (
      (topQuad && leftQuad) ||
      (topQuad && botLeftQuad) ||
      (leftQuad && topRightQuad)
    ) {
      // Darkened top-left corner
      this.pushIfHigherPrecedence(index, {
        x,
        y,
        type: 'FogOfWar_Top_Left',
        precedence: 2,
      });
    }
  }

  pushIfHigherPrecedence(index: number, fowObject: FowPlaneItem) {
    if (fowObject === '') {
      this.fowPlane[index] = '';
      return;
    }

    const existingItem = this.fowPlane[index];
    if (existingItem && (existingItem.precedence || 0) > (fowObject.precedence || 0)) {
      return;
    }

    this.fowPlane[index] = fowObject;
  }

  getAllEmissives(): Position[] {
    const emissives: Position[] = [];

    for (let y = 0; y < this.planeHeight; y++) {
      for (let x = 0; x < this.planeWidth; x++) {
        const position = new Position(x, y);

        if (
          (!this.actionPlane.getBlockAt(position)?.isEmpty &&
            this.actionPlane.getBlockAt(position)?.isEmissive) ||
          (this.groundPlane.getBlockAt(position)?.isEmissive &&
            (this.actionPlane.getBlockAt(position)?.isEmpty ||
              this.actionPlane.getBlockAt(position)?.isTransparent)) ||
          (this.actionPlane.getBlockAt(position)?.isEmpty &&
            this.groundDecorationPlane.getBlockAt(position)?.isEmissive)
        ) {
          emissives.push(position);
        }
      }
    }

    return emissives;
  }

  findBlocksAffectedByEmissives(emissives: Position[]) {
    const blocksTouchedByEmissives: {
      [key: string]: Position;
    } = {};

    // Find emissives that are close enough to light us.
    for (const torch of emissives) {
      const x = torch.x;
      const y = torch.y;

      // Circle the torch 2 spaces around it
      for (let yIndex = y - 2; yIndex <= y + 2; yIndex++) {
        for (let xIndex = x - 2; xIndex <= x + 2; xIndex++) {
          const position = new Position(xIndex, yIndex);

          // Ensure we're looking inside the map
          if (!this.inBounds(position)) {
            continue;
          }

          // Ignore the indexes directly around us.
          // They're taken care of on the FOW first pass
          if (
            yIndex >= y - 1 &&
            yIndex <= y + 1 &&
            xIndex >= x - 1 &&
            xIndex <= x + 1
          ) {
            continue;
          }

          // We want unique copies so we use a map.
          blocksTouchedByEmissives[`${yIndex}_${xIndex}`] = position;
        }
      }
    }

    return Object.values(blocksTouchedByEmissives);
  }

  findEmissivesThatTouch(
    position: Position,
    emissives: Position[],
  ): Position[] {
    const emissivesThatTouch: Position[] = [];
    const y = position.y;
    const x = position.x;

    // Find emissives that are close enough to light us
    // Look around the current emissive 2 tiles in each direction.
    for (let yIndex = y - 2; yIndex <= y + 2; yIndex++) {
      for (let xIndex = x - 2; xIndex <= x + 2; xIndex++) {
        const touchingPosition = new Position(xIndex, yIndex);

        // Ensure we're looking inside the map
        if (!this.inBounds(touchingPosition)) {
          continue;
        }

        // Ignore the indexes directly around us.
        if (
          yIndex >= y - 1 &&
          yIndex <= y + 1 &&
          xIndex >= x - 1 &&
          xIndex <= x + 1
        ) {
          continue;
        }

        for (const torch in emissives) {
          if (Position.equals(emissives[torch], touchingPosition)) {
            emissivesThatTouch.push(emissives[torch]);
          }
        }
      }
    }

    return emissivesThatTouch;
  }

  computeFowPlane() {
    this.fowPlane = [];
    if (!this.isDaytime) {
      // compute the fog of war for light emitting blocks
      for (let y = 0; y < this.planeHeight; y++) {
        for (let x = 0; x < this.planeWidth; x++) {
          this.fowPlane.push({x, y, type: 'FogOfWar_Center'});
        }
      }

      // Second pass for partial lit squares
      this.solveFOWTypeForMap();

      for (let y = 0; y < this.planeHeight; y++) {
        for (let x = 0; x < this.planeWidth; x++) {
          const position = new Position(x, y);
          const groundBlock = this.groundPlane.getBlockAt(position);
          const actionBlock = this.actionPlane.getBlockAt(position);
          const decorationBlock = this.groundDecorationPlane.getBlockAt(position);
          if (
            (groundBlock?.isEmissive &&
              (actionBlock?.isEmpty || actionBlock?.isTransparent)) ||
            (!actionBlock?.isEmpty && actionBlock?.isEmissive) ||
            (actionBlock?.isEmpty && decorationBlock?.isEmissive)
          ) {
            this.clearFowAround(x, y);
          }
        }
      }
    }
  }

  clearFowAround(x: number, y: number) {
    let ox, oy;

    for (oy = -1; oy <= 1; oy++) {
      for (ox = -1; ox <= 1; ox++) {
        this.clearFowAt(x + ox, y + oy);
      }
    }
  }

  clearFowAt(x: number, y: number) {
    if (x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight) {
      const blockIndex = this.yToIndex(y) + x;
      this.fowPlane[blockIndex] = '';
    }
  }

  clearFow() {
    for (let x = 0; x < this.planeWidth; x++) {
      for (let y = 0; y < this.planeHeight; y++) {
        const blockIndex = this.yToIndex(y) + x;
        this.fowPlane[blockIndex] = '';
      }
    }
  }

  computeShadingPlane() {
    this.shadingPlane = [];
    this.computeShading(this.actionPlane);
    this.computeShading(this.groundPlane);
  }

  occludedBy(block?: LevelBlock): boolean {
    return !!block && !block.getIsEmptyOrEntity() && !block.getIsLiquid();
  }

  computeShading(plane: LevelPlane) {
    let x, y, index, hasRight;

    for (index = 0; index < this.planeArea(); index++) {
      x = index % this.planeWidth;
      y = Math.floor(index / this.planeWidth);

      const position = new Position(x, y);

      hasRight = false;

      const block = plane.getBlockAt(position);
      const groundBlock = this.groundPlane.getBlockAt(position);
      if (block && (block.isEmpty || block.isTransparent || block.getIsLiquid())) {
        let atlas = 'AO';
        if (block.blockType === 'lava') {
          atlas = 'LavaGlow';
        } else if (
          block.blockType === 'water' ||
          block.blockType === 'magmaUnderwater'
        ) {
          atlas = 'WaterAO';
        }

        if (groundBlock && (block === groundBlock || !groundBlock.getIsLiquid())) {
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
          this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Left'});
        }

        if (x > 0 && this.occludedBy(surrounding.west)) {
          // needs a right side AO shadow
          this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Right'});

          // Lighting shadows.
          if (block && !block.getIsLiquid()) {
            this.shadingPlane.push({
              x,
              y,
              atlas: 'blockShadows',
              type: 'Shadow_Parts_Fade_base',
            });

            if (
              y > 0 &&
              x > 0 &&
              plane.getBlockAt(Position.north(Position.west(position)))?.getIsEmptyOrEntity()
            ) {
              this.shadingPlane.push({
                x,
                y,
                atlas: 'blockShadows',
                type: 'Shadow_Parts_Fade_top',
              });
            }
          }

          hasRight = true;
        }

        if (y > 0 && this.occludedBy(surrounding.north)) {
          // Needs a bottom side AO shadow
          this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Bottom'});
        } else if (y > 0) {
          if (
            x < this.planeWidth - 1 &&
            this.occludedBy(surrounding.northEast) &&
            !this.occludedBy(surrounding.east)
          ) {
            // Needs a bottom left side AO shadow
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_BottomLeft'});
          }

          if (!hasRight && x > 0 && this.occludedBy(surrounding.northWest)) {
            // Needs a bottom right side AO shadow
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_BottomRight'});
          }
        }

        if (y < this.planeHeight - 1 && this.occludedBy(surrounding.south)) {
          // Needs a top side AO shadow
          this.shadingPlane.push({x, y, atlas, type: 'AOeffect_Top'});
        } else if (y < this.planeHeight - 1) {
          if (
            x < this.planeWidth - 1 &&
            this.occludedBy(surrounding.southEast) &&
            !this.occludedBy(surrounding.east)
          ) {
            // needs a bottom left side AO shadow
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_TopLeft'});
          }

          if (!hasRight && x > 0 && this.occludedBy(surrounding.southWest)) {
            // Needs a bottom right side AO shadow
            this.shadingPlane.push({x, y, atlas, type: 'AOeffect_TopRight'});
          }
        }
      }
    }
  }
}

export default LevelModel;
