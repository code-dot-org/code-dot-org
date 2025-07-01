import Phaser from 'phaser';

import BaseEntity from '../BaseEntity';
import {
  Boat,
  Chicken,
  Cod,
  Cow,
  Creeper,
  Dolphin,
  Ghast,
  IronGolem,
  Salmon,
  SeaTurtle,
  Sheep,
  Squid,
  TropicalFish,
  Zombie,
} from '../entities';
import type GameController from '../GameController';
import Position from '../Position';
import {randomInt} from '../utils';

/**
 * Handling non-player entities inside of the level
 */
class LevelEntity {
  protected controller: GameController;
  protected game: Phaser.Game;
  protected entityMap: Map<string, BaseEntity>;
  protected entityDeathCount: Map<string, number>;
  protected id: number;

  constructor(controller: GameController) {
    this.controller = controller;
    this.game = controller.game;
    this.entityMap = new Map<string, BaseEntity>();
    this.entityDeathCount = new Map<string, number>();
    this.id = 0;
  }

  loadData(levelData) {
    console.log('load data', levelData);
    for (const data of levelData.entities || []) {
      const entity = this.createEntity(
        data[0],
        this.id,
        data[1],
        data[2],
        data[3],
        data[4],
      );
      this.id++;
      entity.updateHidingTree();
      entity.updateHidingBlock();
    }
  }

  tick() {
    this.entityMap.forEach((value: BaseEntity) => {
      value.tick();
    });
  }

  pushEntity(entity: BaseEntity) {
    if (!this.entityMap.has(entity.identifier)) {
      this.entityMap.set(entity.identifier, entity);
    } else if (this.controller.DEBUG) {
      this.game.debug.text(
        'Duplicate entity name : ' + entity.identifier + '\n',
      );
    }
  }

  isFriendlyEntity(type: string): boolean {
    const friendlyEntityList: string[] = [
      'sheep',
      'ironGolem',
      'cow',
      'chicken',
      'cod',
      'dolphin',
      'salmon',
      'seaTurtle',
      'seaTurtle',
      'squid',
      'tropicalFish',
    ];

    for (const friendlyEntity of friendlyEntityList) {
      if (type === friendlyEntity) {
        return true;
      }
    }
    return false;
  }

  createEntity(
    type: string,
    identifier: string,
    x: number,
    y: number,
    facing: Direction,
    pattern: string,
  ): BaseEntity | undefined {
    let entity: BaseEntity | undefined;

    if (!this.entityMap.has(identifier)) {
      switch (type) {
        case 'sheep':
          entity = new Sheep(this.controller, type, identifier, x, y, facing);
          break;
        case 'zombie':
          entity = new Zombie(this.controller, type, identifier, x, y, facing);
          break;
        case 'ironGolem':
          entity = new IronGolem(
            this.controller,
            type,
            identifier,
            x,
            y,
            facing,
          );
          break;
        case 'creeper':
          entity = new Creeper(this.controller, type, identifier, x, y, facing);
          break;
        case 'cow':
          entity = new Cow(this.controller, type, identifier, x, y, facing);
          break;
        case 'chicken':
          entity = new Chicken(this.controller, type, identifier, x, y, facing);
          break;
        case 'cod':
          entity = new Cod(this.controller, type, identifier, x, y, facing);
          break;
        case 'dolphin':
          entity = new Dolphin(this.controller, type, identifier, x, y, facing);
          break;
        case 'ghast':
          entity = new Ghast(
            this.controller,
            type,
            identifier,
            x,
            y,
            facing,
            pattern,
          );
          break;
        case 'boat':
          entity = new Boat(this.controller, type, identifier, x, y, facing);
          break;
        case 'salmon':
          entity = new Salmon(this.controller, type, identifier, x, y, facing);
          break;
        case 'seaTurtle':
          entity = new SeaTurtle(
            this.controller,
            type,
            identifier,
            x,
            y,
            facing,
          );
          break;
        case 'squid':
          entity = new Squid(this.controller, type, identifier, x, y, facing);
          break;
        case 'tropicalFish':
          entity = new TropicalFish(
            this.controller,
            type,
            identifier,
            x,
            y,
            facing,
          );
          break;
        default:
          entity = new BaseEntity(
            this.controller,
            type,
            identifier,
            x,
            y,
            facing,
          );
      }

      this.entityMap.set(identifier, entity);
    }

    return entity;
  }

  isSpawnableInBetween(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): boolean {
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        if (this.controller.levelModel.isPositionEmpty(new Position(i, j))[0]) {
          return true;
        }
      }
    }

    return false;
  }

  spawnEntity(type: string, spawnDirection: Direction): BaseEntity | undefined {
    const levelModel = this.controller.levelModel;
    const width = levelModel.planeWidth;
    const height = levelModel.planeHeight;
    if (spawnDirection === 'middle') {
      if (
        this.isSpawnableInBetween(
          Math.floor(0.25 * width),
          Math.floor(0.25 * height),
          Math.floor(0.75 * width),
          Math.floor(0.75 * height),
        )
      ) {
        let position = new Position(
          randomInt(Math.floor(0.25 * width), Math.floor(0.75 * width)),
          randomInt(Math.floor(0.25 * height), Math.floor(0.75 * height)),
        );
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(
            randomInt(Math.floor(0.25 * width), Math.floor(0.75 * width)),
            randomInt(Math.floor(0.25 * height), Math.floor(0.75 * height)),
          );
        }
        return this.createEntity(
          type,
          this.id++,
          position.x,
          position.y,
          randomInt(0, 3),
        );
      } else {
        if (!this.isSpawnableInBetween(1, 1, width - 2, height - 2)) {
          return undefined;
        }
        let position = new Position(
          randomInt(1, width - 2),
          randomInt(1, height - 2),
        );
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(
            randomInt(1, width - 2),
            randomInt(1, height - 2),
          );
        }
        return this.createEntity(
          type,
          this.id++,
          position.x,
          position.y,
          randomInt(0, 3),
        );
      }
    } else if (spawnDirection === 'left') {
      let xIndex = 0;
      let columnFull = true;
      while (xIndex < width && columnFull) {
        columnFull = true;
        for (let i = 0; i < height; i++) {
          if (levelModel.isPositionEmpty(new Position(xIndex, i))[0]) {
            columnFull = false;
            break;
          }
        }
        if (columnFull) {
          xIndex++;
        }
      }
      if (xIndex < width) {
        let position = new Position(xIndex, randomInt(0, height - 1));
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(xIndex, randomInt(0, height - 1));
        }
        return this.createEntity(
          type,
          this.id++,
          position.x,
          position.y,
          randomInt(0, 3),
        );
      }
    } else if (spawnDirection === 'right') {
      let xIndex = width - 1;
      let columnFull = true;
      while (xIndex > -1 && columnFull) {
        columnFull = true;
        for (let i = 0; i < height; i++) {
          if (levelModel.isPositionEmpty(new Position(xIndex, i))[0]) {
            columnFull = false;
            break;
          }
        }
        if (columnFull) {
          xIndex--;
        }
      }
      if (xIndex > -1) {
        let position = new Position(xIndex, randomInt(0, height - 1));
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(xIndex, randomInt(0, height - 1));
        }
        return this.createEntity(
          type,
          this.id++,
          position.x,
          position.y,
          randomInt(0, 3),
        );
      }
    } else if (spawnDirection === 'up') {
      let yIndex = 0;
      let rowFull = true;
      while (yIndex < height && rowFull) {
        rowFull = true;
        for (let i = 0; i < width; i++) {
          if (levelModel.isPositionEmpty(new Position(i, yIndex))[0]) {
            rowFull = false;
            break;
          }
        }
        if (rowFull) {
          yIndex++;
        }
      }
      if (yIndex < height) {
        let position = new Position(randomInt(0, height - 1), yIndex);
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(randomInt(0, height - 1), yIndex);
        }
        return this.createEntity(
          type,
          this.id++,
          position.x,
          position.y,
          randomInt(0, 3),
        );
      }
    } else if (spawnDirection === 'down') {
      let yIndex = height - 1;
      let rowFull = true;
      while (yIndex > -1 && rowFull) {
        rowFull = true;
        for (let i = 0; i < width; i++) {
          if (levelModel.isPositionEmpty(new Position(i, yIndex))[0]) {
            rowFull = false;
            break;
          }
        }
        if (rowFull) {
          yIndex--;
        }
      }
      if (yIndex > -1) {
        let position = new Position(randomInt(0, height - 1), yIndex);
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(randomInt(0, height - 1), yIndex);
        }
        const ret = this.createEntity(
          type,
          this.id,
          position.x,
          position.y,
          randomInt(0, 3),
        );
        this.id++;
        return ret;
      }
    }

    return undefined;
  }

  spawnEntityAt(
    type: string,
    x: number,
    y: number,
    facing: Direction,
  ): BaseEntity | undefined {
    const ret = this.createEntity(type, this.id, x, y, facing);
    this.id++;
    return ret;
  }

  destroyEntity(identifier: string) {
    if (this.entityMap.has(identifier)) {
      const entity = this.entityMap.get(identifier);
      if (this.entityDeathCount.has(entity.type)) {
        this.entityDeathCount.set(
          entity.type,
          this.entityDeathCount.get(entity.type) + 1,
        );
      } else {
        this.entityDeathCount.set(entity.type, 1);
      }
      entity.reset();
      entity.getAnimationManager().stop(null, true);
      entity.sprite.destroy();
      this.entityMap.delete(identifier);
    }
  }

  getEntityAt(position: Position): BaseEntity | undefined {
    for (const value of this.entityMap) {
      const entity = value[1];
      if (Position.equals(position, entity.position)) {
        return entity;
      }
    }

    return;
  }

  getEntitiesOfType(type: string): BaseEntity[] {
    if (type === 'all') {
      const entities = [];
      for (const value of this.entityMap) {
        const entity = value[1];
        if (entity.type !== 'Player') {
          entities.push(entity);
        }
      }
      return entities;
    } else {
      const entities = [];
      for (const value of this.entityMap) {
        const entity = value[1];
        if (entity.type === type) {
          entities.push(entity);
        }
      }
      return entities;
    }
  }

  reset() {
    this.entityMap.clear();
    this.entityDeathCount = new Map();
  }
}

export default LevelEntity;
