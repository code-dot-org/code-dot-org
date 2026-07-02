import BaseEntity from '../Entities/BaseEntity';
import Boat from '../Entities/Boat';
import Chicken from '../Entities/Chicken';
import Cod from '../Entities/Cod';
import Cow from '../Entities/Cow';
import Creeper from '../Entities/Creeper';
import Dolphin from '../Entities/Dolphin';
import Ghast from '../Entities/Ghast';
import IronGolem from '../Entities/IronGolem';
import Salmon from '../Entities/Salmon';
import SeaTurtle from '../Entities/SeaTurtle';
import Sheep from '../Entities/Sheep';
import Squid from '../Entities/Squid';
import TropicalFish from '../Entities/TropicalFish';
import Zombie from '../Entities/Zombie';

import Position from './Position';

/**
 * Handling non-player entities inside of the level
 */
export default class LevelEntity {
  constructor(controller) {
    this.controller = controller;
    this.entityMap = new Map();
    this.entityDeathCount = new Map();
    this.sprite = null;
    this.id = 0;
  }

  loadData(levelData) {
    if (levelData.entities !== undefined) {
      for (var i = 0; i < levelData.entities.length; i++) {
        let data = levelData.entities[i];
        let entity = this.createEntity(data[0], this.id++, data[1], data[2], data[3], data[4]);
        entity.updateHidingTree();
        entity.updateHidingBlock();
      }
    }
  }

  tick() {
    let updateEntity = function (value) {
      value.tick();
    };
    this.entityMap.forEach(updateEntity);
  }

  pushEntity(entity) {
    if (!this.entityMap.has(entity.identifier)) {
      this.entityMap.set(entity.identifier, entity);
    } else if (this.controller.DEBUG) {
      console.debug("Duplicate entity name : " + entity.identifier + "\n");
    }
  }

  isFriendlyEntity(type) {
    const friendlyEntityList = ['sheep', 'ironGolem', 'cow', 'chicken','cod',
    'dolphin','salmon','seaTurtle','seaTurtle',
    'squid','tropicalFish'];
    for (var i = 0; i < friendlyEntityList.length; i++) {
      if (type === friendlyEntityList[i]) {
        return true;
      }
    }
    return false;
  }

  createEntity(type, identifier, x, y, facing, pattern) {
    var entity = null;
    if (!this.entityMap.has(identifier)) {
      switch (type) {
        case 'sheep':
          entity = new Sheep(this.controller, type, identifier, x, y, facing);
          break;
        case 'zombie':
          entity = new Zombie(this.controller, type, identifier, x, y, facing);
          break;
        case 'ironGolem':
          entity = new IronGolem(this.controller, type, identifier, x, y, facing);
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
          entity = new Ghast(this.controller, type, identifier, x, y, facing, pattern);
          break;
        case 'boat':
          entity = new Boat(this.controller, type, identifier, x, y, facing);
          break;
        case 'salmon':
          entity = new Salmon(this.controller, type, identifier, x, y, facing);
          break;
        case 'seaTurtle':
          entity = new SeaTurtle(this.controller, type, identifier, x, y, facing);
          break;
        case 'squid':
          entity = new Squid(this.controller, type, identifier, x, y, facing);
          break;
        case 'tropicalFish':
          entity = new TropicalFish(this.controller, type, identifier, x, y, facing);
          break;
        default:
          entity = new BaseEntity(this.controller, type, identifier, x, y, facing);

      }
      if (this.controller.DEBUG) {
        console.log('Create Entity type : ' + type + ' ' + x + ',' + y);
      }
      this.entityMap.set(identifier, entity);
    } else if (this.controller.DEBUG) {
      console.debug("Duplicate entity name : " + identifier + "\n");
    }
    return entity;
  }

  isSpawnableInBetween(minX, minY, maxX, maxY) {
    for (var i = minX; i <= maxX; i++) {
      for (var j = minY; j <= maxY; j++) {
        if (this.controller.levelModel.isPositionEmpty(new Position(i, j))[0]) {
          return true;
        }
      }
    }
    return false;
  }

  spawnEntity(type, spawnDirection) {
    let getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    let levelModel = this.controller.levelModel;
    let width = levelModel.planeWidth;
    let height = levelModel.planeHeight;
    if (spawnDirection === "middle") {
      if (this.isSpawnableInBetween(Math.floor(0.25 * width), Math.floor(0.25 * height), Math.floor(0.75 * width), Math.floor(0.75 * height))) {
        let position = new Position(
          getRandomInt(Math.floor(0.25 * width), Math.floor(0.75 * width)),
          getRandomInt(Math.floor(0.25 * height), Math.floor(0.75 * height))
        );
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(
            getRandomInt(Math.floor(0.25 * width), Math.floor(0.75 * width)),
            getRandomInt(Math.floor(0.25 * height), Math.floor(0.75 * height))
          );
        }
        return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
      } else {
        if (!this.isSpawnableInBetween(1, 1, width - 2, height - 2)) {
          return null;
        }
        let position = new Position(
          getRandomInt(1, width - 2),
          getRandomInt(1, height - 2)
        );
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(
            getRandomInt(1, width - 2),
            getRandomInt(1, height - 2)
          );
        }
        return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
      }
    } else if (spawnDirection === "left") {
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
        let position = new Position(xIndex, getRandomInt(0, height - 1));
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(xIndex, getRandomInt(0, height - 1));
        }
        return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
      }
    } else if (spawnDirection === "right") {
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
        let position = new Position(xIndex, getRandomInt(0, height - 1));
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(xIndex, getRandomInt(0, height - 1));
        }
        return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
      }
    } else if (spawnDirection === "up") {
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
        let position = new Position(getRandomInt(0, height - 1), yIndex);
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(getRandomInt(0, height - 1), yIndex);
        }
        return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
      }
    } else if (spawnDirection === "down") {
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
        let position = new Position(getRandomInt(0, height - 1), yIndex);
        while (!levelModel.isPositionEmpty(position)[0]) {
          position = new Position(getRandomInt(0, height - 1), yIndex);
        }
        return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
      }
    }
    return null;
  }

  spawnEntityAt(type, x, y, facing) {
    return this.createEntity(type, this.id++, x, y, facing);
  }

  destroyEntity(identifier) {
    if (this.entityMap.has(identifier)) {
      var entity = this.entityMap.get(identifier);
      if (this.entityDeathCount.has(entity.type)) {
        this.entityDeathCount.set(entity.type, this.entityDeathCount.get(entity.type) + 1);
      } else {
        this.entityDeathCount.set(entity.type, 1);
      }
      entity.reset();
      entity.getAnimationTarget().anims.stop();
      entity.sprite.destroy();
      this.entityMap.delete(identifier);
    } else if (this.controller.DEBUG) {
      console.debug("It's impossible to delete since entity name : " + identifier + " is not existing\n");
    }
  }

  getEntityAt(position) {
    for (var value of this.entityMap) {
      let entity = value[1];
      if (Position.equals(position, entity.position)) {
        return entity;
      }
    }
    return null;
  }

  getEntitiesOfType(type) {
    if (type === "all") {
      let entities = [];
      for (let value of this.entityMap) {
        let entity = value[1];
        if (entity.type !== 'Player') {
          entities.push(entity);
        }
      }
      return entities;
    } else {
      let entities = [];
      for (let value of this.entityMap) {
        let entity = value[1];
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
};
