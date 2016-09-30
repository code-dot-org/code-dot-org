import BaseEntity from "../Entities/BaseEntity.js";
import Sheep from "../Entities/Sheep.js";
import Zombie from "../Entities/Zombie.js";
import IronGolem from "../Entities/IronGolem.js";
import Creeper from "../Entities/Creeper.js";
import Cow from "../Entities/Cow.js";
import Chicken from "../Entities/Chicken.js";


/**
 * Handling non-player entities inside of the level
 */
export default class LevelEntity {
    constructor(controller) {
        this.controller = controller;
        this.game = controller.game;
        this.entityMap = new Map();
        this.sprite = null;
        this.id = 0;
    }

    loadData(levelData) {
        if (levelData.entities !== undefined) {
            for (var i = 0; i < levelData.entities.length; i++) {
                let data = levelData.entities[i];
                this.createEntity(data[0], this.id++, data[1], data[2], data[3]);
            }
        }
    }

    tick() {
        let updateEntity = function (value, key, map) {
            value.tick();
        }
        this.entityMap.forEach(updateEntity);
    }

    pushEntity(entity) {
        if (!this.entityMap.has(entity.identifier)) {
            this.entityMap.set(entity.identifier, entity);
        }
        else if (this.controller.DEBUG) {
            this.game.debug.text("Duplicate entity name : " + entity.identifier + "\n");
        }
    }

    createEntity(type, identifier, x, y, facing) {
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
                default:
                    entity = new BaseEntity(this.controller, type, identifier, x, y, facing);

            }
            this.entityMap.set(identifier, entity);
        }
        else if (this.controller.DEBUG) {
            this.game.debug.text("Duplicate entity name : " + identifier + "\n");
        }
        return entity;
    }

    spawnEntity(type, spawnDirection) {
        var getRandomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var levelModel = this.controller.levelModel;
        var width = levelModel.planeWidth;
        var height = levelModel.planeHeight;
        if (spawnDirection === "middle") {
            var position = [getRandomInt(1, width - 2), getRandomInt(1, height - 2)];
            while (!levelModel.isPositionEmpty(position)[0]) {
                position = [getRandomInt(1, width - 2), getRandomInt(1, height - 2)];
            }
            return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
        } else if (spawnDirection === "left") {
            var xIndex = 0;
            var columnFull = true;
            while (xIndex < width && columnFull) {
                columnFull = true;
                for (var i = 0; i < height; i++) {
                    if (levelModel.isPositionEmpty([xIndex, i])) {
                        columnFull = false;
                        break;
                    }
                }
                xIndex++;
            }
            if (xIndex < width) {
                var position = [xIndex, getRandomInt(1, height - 2)];
                while (!levelModel.isPositionEmpty(position)[0]) {
                    position = [xIndex, getRandomInt(1, height - 2)];
                }
                return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
            }
        } else if (spawnDirection === "right") {
            var xIndex = width - 1;
            var columnFull = true;
            while (xIndex > -1 && columnFull) {
                columnFull = true;
                for (var i = 0; i < height; i++) {
                    if (levelModel.isPositionEmpty([xIndex, i])) {
                        columnFull = false;
                        break;
                    }
                }
                xIndex--;
            }
            if (xIndex > -1) {
                var position = [xIndex, getRandomInt(1, height - 2)];
                while (!levelModel.isPositionEmpty(position)[0]) {
                    position = [xIndex, getRandomInt(1, height - 2)];
                }
                return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
            }
        } else if (spawnDirection === "up") {
            var yIndex = 0;
            var rowFull = true;
            while (yIndex < height && rowFull) {
                rowFull = true;
                for (var i = 0; i < width; i++) {
                    if (levelModel.isPositionEmpty([i,yIndex])) {
                        rowFull = false;
                        break;
                    }
                }
                yIndex++;
            }
            if (yIndex < height) {
                var position = [getRandomInt(1, height - 2), yIndex];
                while (!levelModel.isPositionEmpty(position)[0]) {
                    position = [getRandomInt(1, height - 2), yIndex];
                }
                return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
            }
        } else if(spawnDirection === "down") {
            var yIndex = height - 1;
            var rowFull = true;
            while (yIndex > -1 && rowFull) {
                rowFull = true;
                for (var i = 0; i < width; i++) {
                    if (levelModel.isPositionEmpty([i,yIndex])) {
                        rowFull = false;
                        break;
                    }
                }
                yIndex--;
            }
            if (yIndex > -1) {
                var position = [getRandomInt(1, height - 2), yIndex];
                while (!levelModel.isPositionEmpty(position)[0]) {
                    position = [getRandomInt(1, height - 2), yIndex];
                }
                return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
            }
        }
        return null;
    }

    spawnEntityAt(type, x, y, facing) {
        return this.createEntity(type, this.id++, x, y, facing);
    }

    destroyEntity(identifier) {
        if (this.entityMap.has(identifier)) {
            this.entityMap.get(identifier).sprite.animations.stop(null, true);
            this.entityMap.get(identifier).sprite.destroy();
            this.entityMap.delete(identifier);
        } else if (this.controller.DEBUG) {
            this.game.debug.text("It's impossible to delete since entity name : " + identifier + " is not existing\n");
        }
    }

    getEntityAt(position) {
        for (var value of this.entityMap) {
            let entity = value[1];
            if (entity.position[0] === position[0] && entity.position[1] === position[1])
                return entity;
        }
        return null;
    }

    getEntitiesOfType(type) {
        var entities = [];
        for (var value of this.entityMap) {
            let entity = value[1];
            if (entity.type === type)
                entities.push(entity);
        }
        return entities;
    }

    reset() {
        this.entityMap.clear();
    }
}