import CommandQueue from "./CommandQueue/CommandQueue.js";
import BaseCommand from "./CommandQueue/BaseCommand.js";
import DestroyBlockCommand from "./CommandQueue/DestroyBlockCommand.js";
import MoveForwardCommand from "./CommandQueue/MoveForwardCommand.js";
import TurnCommand from "./CommandQueue/TurnCommand.js";
import WhileCommand from "./CommandQueue/WhileCommand.js";
import IfBlockAheadCommand from "./CommandQueue/IfBlockAheadCommand.js";
import CallbackCommand from "./CommandQueue/CallbackCommand.js";

import EventType from "./Event/EventType.js";
import FacingDirection from "./LevelMVC/FacingDirection.js";

import LevelModel from "./LevelMVC/LevelModel.js";
import LevelView from "./LevelMVC/LevelView.js";
import LevelEntity from "./LevelMVC/LevelEntity.js";
import AssetLoader from "./LevelMVC/AssetLoader.js";

import BaseEntity from "./Entities/BaseEntity.js";

import * as CodeOrgAPI from "./API/CodeOrgAPI.js";

var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;

/**
 * Initializes a new instance of a mini-game visualization
 */
class GameController {
  /**
   * @param {Object} gameControllerConfig
   * @param {String} gameControllerConfig.containerId DOM ID to mount this app
   * @param {Phaser} gameControllerConfig.Phaser Phaser package
   * @constructor
   */
  constructor(gameControllerConfig) {
    this.DEBUG = gameControllerConfig.debug;

    // Phaser pre-initialization config
    window.PhaserGlobal = {
      disableAudio: true,
      disableWebAudio: true,
      hideBanner: !this.DEBUG
    };

    /**
     * @public {Object} codeOrgAPI - API with externally-callable methods for
     * starting an attempt, issuing commands, etc.
     */
    this.codeOrgAPI = CodeOrgAPI.get(this);

    var Phaser = gameControllerConfig.Phaser;

    /**
     * Main Phaser game instance.
     * @property {Phaser.Game}
     */
    this.game = new Phaser.Game({
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      renderer: Phaser.CANVAS,
      parent: gameControllerConfig.containerId,
      state: 'earlyLoad',
      // TODO(bjordan): remove now that using canvas?
      preserveDrawingBuffer: true // enables saving .png screengrabs
    });

    this.specialLevelType = null;
    this.queue = new CommandQueue(this);
    this.OnCompleteCallback = null;

    this.assetRoot = gameControllerConfig.assetRoot;

    this.audioPlayer = gameControllerConfig.audioPlayer;
    this.afterAssetsLoaded = gameControllerConfig.afterAssetsLoaded;
    this.assetLoader = new AssetLoader(this);
    this.earlyLoadAssetPacks =
      gameControllerConfig.earlyLoadAssetPacks || [];
    this.earlyLoadNiceToHaveAssetPacks =
      gameControllerConfig.earlyLoadNiceToHaveAssetPacks || [];

    this.resettableTimers = [];

    this.events = [];

    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1.5;
    this.initialSlowMotion = gameControllerConfig.customSlowMotion || this.assumedSlowMotion;

    this.playerDelayFactor = 1.0;
    this.dayNightCycle = false;
    this.player = null;

    this.game.state.add('earlyLoad', {
      preload: () => {
        // don't let state change stomp essential asset downloads in progress
        this.game.load.resetLocked = true;
        this.assetLoader.loadPacks(this.earlyLoadAssetPacks);
      },
      create: () => {
        // optionally load some more assets if we complete early load before level load
        this.assetLoader.loadPacks(this.earlyLoadNiceToHaveAssetPacks);
        this.game.load.start();
      }
    });

    this.game.state.add('levelRunner', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.update.bind(this),
      render: this.render.bind(this)
    });
  }

  /**
   * @param {Object} levelConfig
   */
  loadLevel(levelConfig) {
    this.levelData = Object.freeze(levelConfig);

    this.levelEntity = new LevelEntity(this);
    this.levelModel = new LevelModel(this.levelData, this);
    this.levelView = new LevelView(this);
    this.specialLevelType = levelConfig.specialLevelType;

    this.game.state.start('levelRunner');
  }

  reset() {
    this.dayNightCycle = false
    this.levelEntity.reset();
    this.levelModel.reset();
    this.levelView.reset(this.levelModel);
    this.levelEntity.loadData(this.levelData);
    this.player = this.levelModel.player;
    this.resettableTimers.forEach((timer) => {
      timer.stop(true);
    });
    this.resettableTimers.length = 0;
    this.events.length = 0;
  }

  preload() {
    this.game.load.resetLocked = true;
    this.game.time.advancedTiming = this.DEBUG;
    this.game.stage.disableVisibilityChange = true;
    this.assetLoader.loadPacks(this.levelData.assetPacks.beforeLoad);
  }

  create() {
    this.levelView.create(this.levelModel);
    this.game.time.slowMotion = this.initialSlowMotion;
    this.addCheatKeys();
    this.assetLoader.loadPacks(this.levelData.assetPacks.afterLoad);
    this.game.load.onLoadComplete.addOnce(() => {
      if (this.afterAssetsLoaded) {
        this.afterAssetsLoaded();
      }
    });
    this.levelEntity.loadData(this.levelData);
    this.game.load.start();
  }

  followingPlayer() {
    return !!this.levelData.gridDimensions;
  }

  update() {
    this.queue.tick();
    this.levelEntity.tick();
    this.player.updateMovement();
    this.levelView.update();
  }

  addCheatKeys() {
    this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(() => {
      this.player.movementState = FacingDirection.Up;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Up)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(() => {
      this.player.movementState = FacingDirection.Up;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.W).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Up)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(() => {
      this.player.movementState = FacingDirection.Right;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Right)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(() => {
      this.player.movementState = FacingDirection.Right;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.D).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Right)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(() => {
      this.player.movementState = FacingDirection.Down;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Down)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.S).onDown.add(() => {
      this.player.movementState = FacingDirection.Down;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.S).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Down)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(() => {
      this.player.movementState = FacingDirection.Left;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Left)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(() => {
      this.player.movementState = FacingDirection.Left;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.A).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Left)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(() => {
      this.player.movementState = -2;
      this.player.updateMovement();
    })
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onUp.add(() => {
      if (this.player.movementState === -2)
        this.player.movementState = -1;
      this.player.updateMovement();
    });
  }

  handleEndState() {
    // report back to the code.org side the pass/fail result
    //     then clear the callback so we dont keep calling it
    if (this.OnCompleteCallback) {
      if (this.queue.isSucceeded()) {
        this.OnCompleteCallback(true, this.levelModel);
      } else {
        this.OnCompleteCallback(false, this.levelModel);
      }
      this.OnCompleteCallback = null;
    }
  }

  render() {
    if (this.DEBUG) {
      this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
    }
    this.levelView.render();
  }

  scaleFromOriginal() {
    var [newWidth, newHeight] = this.levelData.gridDimensions || [10, 10];
    var [originalWidth, originalHeight] = [10, 10];
    return [newWidth / originalWidth, newHeight / originalHeight];
  }

  getScreenshot() {
    return this.game.canvas.toDataURL("image/png");
  }

  // command processors

  getEntity(target) {
    if (target === undefined)
      target = 'Player';
    let entity = this.levelEntity.entityMap.get(target);
    if (entity === undefined)
      this.printErrorMsg("Debug GetEntity: there is no entity : " + target + "\n");
    return entity;
  }

  getEntities(type) {
    return this.levelEntity.getEntitiesOfType(type);
  }

  isType(target) {
    return typeof (target) === 'string' && target !== 'Player';
  }

  printErrorMsg(msg) {
    if (this.DEBUG)
      this.game.debug.text(msg);
  }

  /**
   * @param {any} commandQueueItem
   * @param {any} moveAwayFrom (entity identifier)
   *
   * @memberOf GameController
   */
  moveAway(commandQueueItem, moveAwayFrom) {
    var target = commandQueueItem.target;
    var targetIsType = this.isType(target);
    var moveAwayFromIsType = this.isType(moveAwayFrom);
    if (target === moveAwayFrom) {
      this.printErrorMsg("Debug MoveAway: Can't move away entity from itself\n");
      commandQueueItem.failed();
      return;
    }
    // move away entity from entity
    if (!targetIsType && !moveAwayFromIsType) {
      var entity = this.getEntity(target);
      var moveAwayFromEntity = this.getEntity(moveAwayFrom);
      entity.moveAway(commandQueueItem, moveAwayFromEntity);
    }
    // move away type from entity
    else if (targetIsType && !moveAwayFromIsType) {
      var targetEntities = this.getEntities(target);
      var moveAwayFromEntity = this.getEntity(moveAwayFrom);
      if (moveAwayFromEntity !== undefined) {
        for (var i = 0; i < targetEntities.length; i++) {
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFrom) }, targetEntities[i].identifier);
          targetEntities[i].addCommand(callbackCommand);
        }
      }
      commandQueueItem.succeeded();
    }
    // move away entity from type
    else if (!targetIsType && moveAwayFromIsType) {
      var entity = this.getEntity(target);
      var moveAwayFromEntities = this.getEntities(moveAwayFrom);
      if (moveAwayFromEntities.length > 0) {
        var closestTarget = [entity.getDistance(moveAwayFromEntities[0]), 0];
        for (var i = 1; i < moveAwayFromEntities.length; i++) {
          let distance = entity.getDistance(moveAwayFromEntities[i]);
          if (distance < closestTarget[0]) {
            closestTarget = [distance, i];
          }
        }
        entity.moveAway(commandQueueItem, moveAwayFromEntities[closestTarget[1]]);
      } else
        commandQueueItem.succeeded();
    }
    // move away type from type
    else {
      var entities = this.getEntities(target);
      var moveAwayFromEntities = this.getEntities(moveAwayFrom);
      if (moveAwayFromEntities.length > 0 && entities.length > 0) {
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          var closestTarget = [entity.getDistance(moveAwayFromEntities[0]), 0];
          for (var j = 1; j < moveAwayFromEntities.length; j++) {
            let distance = entity.getDistance(moveAwayFromEntities[j]);
            if (distance < closestTarget[0]) {
              closestTarget = [distance, j];
            }
          }
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFromEntities[closestTarget[1]].identifier) }, entity.identifier);
          entity.addCommand(callbackCommand);
        }
        commandQueueItem.succeeded();
      }
    }
  }


  /**
   * @param {any} commandQueueItem
   * @param {any} moveTowardTo (entity identifier)
   *
   * @memberOf GameController
   */
  moveToward(commandQueueItem, moveTowardTo) {
    var target = commandQueueItem.target;
    var targetIsType = this.isType(target);
    var moveTowardToIsType = this.isType(moveTowardTo);
    if (target === moveTowardTo) {
      this.printErrorMsg("Debug MoveToward: Can't move toward entity to itself\n");
      commandQueueItem.failed();
      return;
    }
    // move toward entity to entity
    if (!targetIsType && !moveTowardToIsType) {
      var entity = this.getEntity(target);
      var moveTowardToEntity = this.getEntity(moveTowardTo);
      entity.moveToward(commandQueueItem, moveTowardToEntity);
    }
    // move toward type to entity
    else if (targetIsType && !moveTowardToIsType) {
      var targetEntities = this.getEntities(target);
      var moveTowardToEntity = this.getEntity(moveTowardTo);
      if (moveTowardToEntity !== undefined) {
        for (var i = 0; i < targetEntities.length; i++) {
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardTo) }, targetEntities[i].identifier);
          targetEntities[i].addCommand(callbackCommand);
        }
        commandQueueItem.succeeded();
      }
    }
    // move toward entity to type
    else if (!targetIsType && moveTowardToIsType) {
      var entity = this.getEntity(target);
      var moveTowardToEntities = this.getEntities(moveTowardTo);
      if (moveTowardToEntities.length > 0) {
        var closestTarget = [entity.getDistance(moveTowardToEntities[0]), 0];
        for (var i = 1; i < moveTowardToEntities.length; i++) {
          let distance = entity.getDistance(moveTowardToEntities[i]);
          if (distance < closestTarget[0]) {
            closestTarget = [distance, i];
          }
        }
        entity.moveToward(commandQueueItem, moveTowardToEntities[closestTarget[1]]);
      } else
        commandQueueItem.succeeded();
    }
    // move toward type to type
    else {
      var entities = this.getEntities(target);
      var moveTowardToEntities = this.getEntities(moveTowardTo);
      if (moveTowardToEntities.length > 0 && entities.length > 0) {
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          var closestTarget = [entity.getDistance(moveTowardToEntities[0]), 0];
          for (var j = 1; j < moveTowardToEntities.length; j++) {
            let distance = entity.getDistance(moveTowardToEntities[j]);
            if (distance < closestTarget[0]) {
              closestTarget = [distance, j];
            }
          }
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardToEntities[closestTarget[1]].identifier) }, entity.identifier);
          entity.addCommand(callbackCommand);
        }
        commandQueueItem.succeeded();
      }
    }
  }

  moveTo(commandQueueItem, moveTowardTo) {
    var target = commandQueueItem.target;
    var targetIsType = this.isType(target);
    var moveTowardToIsType = this.isType(moveTowardTo);
    if (target === moveTowardTo) {
      this.printErrorMsg("Debug MoveToward: Can't move toward entity to itself\n");
      commandQueueItem.failed();
      return;
    }
    // move toward entity to entity
    if (!targetIsType && !moveTowardToIsType) {
      var entity = this.getEntity(target);
      var moveTowardToEntity = this.getEntity(moveTowardTo);
      entity.moveTo(commandQueueItem, moveTowardToEntity);
    }
    // move toward type to entity
    else if (targetIsType && !moveTowardToIsType) {
      var targetEntities = this.getEntities(target);
      var moveTowardToEntity = this.getEntity(moveTowardTo);
      if (moveTowardToEntity !== undefined) {
        for (var i = 0; i < targetEntities.length; i++) {
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveTo(callbackCommand, moveTowardTo) }, targetEntities[i].identifier);
          targetEntities[i].addCommand(callbackCommand);
        }
        commandQueueItem.succeeded();
      }
    }
    // move toward entity to type
    else if (!targetIsType && moveTowardToIsType) {
      var entity = this.getEntity(target);
      var moveTowardToEntities = this.getEntities(moveTowardTo);
      if (moveTowardToEntities.length > 0) {
        var closestTarget = [entity.getDistance(moveTowardToEntities[0]), 0];
        for (var i = 1; i < moveTowardToEntities.length; i++) {
          let distance = entity.getDistance(moveTowardToEntities[i]);
          if (distance < closestTarget[0]) {
            closestTarget = [distance, i];
          }
        }
        entity.moveTo(commandQueueItem, moveTowardToEntities[closestTarget[1]]);
      } else
        commandQueueItem.succeeded();
    }
    // move toward type to type
    else {
      var entities = this.getEntities(target);
      var moveTowardToEntities = this.getEntities(moveTowardTo);
      if (moveTowardToEntities.length > 0 && entities.length > 0) {
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          var closestTarget = [entity.getDistance(moveTowardToEntities[0]), 0];
          for (var j = 1; j < moveTowardToEntities.length; j++) {
            let distance = entity.getDistance(moveTowardToEntities[j]);
            if (distance < closestTarget[0]) {
              closestTarget = [distance, j];
            }
          }
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveTo(callbackCommand, moveTowardToEntities[closestTarget[1]].identifier) }, entity.identifier);
          entity.addCommand(callbackCommand);
        }
        commandQueueItem.succeeded();
      }
    }
  }

  moveForward(commandQueueItem) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      entity.moveForward(commandQueueItem);
    }
    else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveForward(callbackCommand) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  moveDirection(commandQueueItem, direction) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      entity.moveDirection(commandQueueItem, direction);
    }
    else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveDirection(callbackCommand, direction) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  moveRandom(commandQueueItem) {
    var target = commandQueueItem.target;
    var getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      entity.moveDirection(commandQueueItem, getRandomInt(0, 3));
    }
    else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveDirection(callbackCommand, getRandomInt(0, 3)) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  turn(commandQueueItem, direction) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      entity.turn(commandQueueItem, direction);
    }
    else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.turn(callbackCommand, direction) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  turnRandom(commandQueueItem) {
    var target = commandQueueItem.target;
    var getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      entity.turn(commandQueueItem, getRandomInt(0, 1) === 0 ? 1 : -1);
    }
    else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.turn(callbackCommand, getRandomInt(0, 1) === 0 ? 1 : -1) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  flashEntity(commandQueueItem) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      var delay = this.levelView.flashSpriteToWhite(entity.sprite);
      this.delayBy(delay, () => {
        commandQueueItem.succeeded();
      });
    } else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.flashEntity(callbackCommand) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }


  explodeEntity(commandQueueItem) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      this.levelView.playExplosionCloudAnimation(entity.position);
      commandQueueItem.succeeded();
    } else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.explodeEntity(callbackCommand) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  wait(commandQueueItem, time) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      setTimeout(() => { commandQueueItem.succeeded() }, time * 1000);
    } else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.wait(callbackCommand, time) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  playSound(commandQueueItem, sound) {
    this.levelView.audioPlayer.play(sound);
    commandQueueItem.succeeded();
  }

  destroyBlockWithoutPlayerInteraction(position) {
    let block = this.levelModel.actionPlane[this.levelModel.yToIndex(position[1]) + position[0]];
    this.levelModel.destroyBlock(position);

    if (block !== null) {
      let destroyPosition = block.position;
      let blockType = block.blockType;

      if (block.isDestroyable) {
        this.levelModel.computeShadingPlane();
        this.levelModel.computeFowPlane();
        switch (blockType) {
          case "logAcacia":
          case "treeAcacia":
            blockType = "planksAcacia";
            break;
          case "logBirch":
          case "treeBirch":
            blockType = "planksBirch";
            break;
          case "logJungle":
          case "treeJungle":
            blockType = "planksJungle";
            break;
          case "logOak":
          case "treeOak":
            blockType = "planksOak";
            break;
          case "logSpruce":
          case "treeSpruce":
            blockType = "planksSpruce";
            break;
        }
        this.levelView.actionPlaneBlocks[this.levelModel.yToIndex(destroyPosition[1]) + destroyPosition[0]].kill();
        this.levelView.playExplosionAnimation(this.levelModel.player.position, this.levelModel.player.facing, destroyPosition, blockType, () => { }, true);
      } else if (block.isUsable) {
        switch (blockType) {
          case "sheep":
            // TODO: What to do with already sheered sheep?
            this.levelView.playShearAnimation(this.levelModel.player.position, this.levelModel.player.facing, destroyPosition, blockType, () => { });
            break;
        }
      }
    }
  }

  destroyBlock(commandQueueItem, type) {
    let player = this.levelModel.player;
    let frontEntity = this.levelEntity.getEntityAt(this.levelModel.getMoveForwardPosition(player));
    // if there is a destroyable block in front of the player
    if (this.levelModel.canDestroyBlockForward()) {
      let block = this.levelModel.destroyBlockForward();

      if (block !== null) {
        let destroyPosition = block.position;
        let blockType = block.blockType;

        if (block.isDestroyable) {
          this.levelModel.computeShadingPlane();
          this.levelModel.computeFowPlane();
          switch (blockType) {
            case "logAcacia":
            case "treeAcacia":
              blockType = "planksAcacia";
              break;
            case "logBirch":
            case "treeBirch":
              blockType = "planksBirch";
              break;
            case "logJungle":
            case "treeJungle":
              blockType = "planksJungle";
              break;
            case "logOak":
            case "treeOak":
              blockType = "planksOak";
              break;
            case "logSpruce":
            case "treeSpruce":
              blockType = "planksSpruce";
              break;
          }

          this.levelView.playDestroyBlockAnimation(player.position, player.facing, destroyPosition, blockType, this.levelModel.shadingPlane, this.levelModel.fowPlane, () => {
            commandQueueItem.succeeded();
          });
        }
        else if (block.isUsable) {
          switch (blockType) {
            case "sheep":
              // TODO: What to do with already sheered sheep?
              this.levelView.playShearSheepAnimation(player.position, player.facing, destroyPosition, blockType, () => {
                commandQueueItem.succeeded();
              });

              break;
            default:
              commandQueueItem.succeeded();
          }
        } else {
          commandQueueItem.succeeded();
        }
      }
      // if there is a entity in front of the player
    } else if (frontEntity != null) {
      // push use command to execute general use behavior of the entity before executing the event
      this.levelView.onAnimationEnd(this.levelView.playPlayerAnimation("punch", player.position, player.facing, false), () => {
        var useCommand = new CallbackCommand(this, () => { }, () => { frontEntity.use(useCommand, player); }, frontEntity.identifier);

        frontEntity.queue.startPushHighPriorityCommands();
        frontEntity.addCommand(useCommand);
        frontEntity.queue.endPushHighPriorityCommands();
        this.levelView.playExplosionAnimation(player.position, player.facing, frontEntity.position, frontEntity.type, () => { }, false);
        this.levelView.playPlayerAnimation("idle", player.position, player.facing, false);
        this.delayPlayerMoveBy(200, 600, () => {
          commandQueueItem.succeeded();
        });
        setTimeout(() => { this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]); }, 200);
      });
    } else {
      this.levelView.playPunchDestroyAirAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(), () => {
        this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
        this.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
        this.delayPlayerMoveBy(200, 600, () => {
          commandQueueItem.succeeded();
        });
      });
    }
  }

  canUseTints() {
    // TODO(bjordan): Remove
    // all browsers appear to work with new version of Phaser
    return true;
  }

  checkTntAnimation() {
    return this.specialLevelType === 'freeplay';
  }

  checkMinecartLevelEndAnimation() {
    return this.specialLevelType === 'minecart';
  }

  checkHouseBuiltEndAnimation() {
    return this.specialLevelType === 'houseBuild';
  }

  checkRailBlock(blockType) {
    var checkRailBlock = this.levelModel.railMap[this.levelModel.yToIndex(this.levelModel.player.position[1]) + this.levelModel.player.position[0]];
    if (checkRailBlock !== "") {
      blockType = checkRailBlock;
    } else {
      blockType = "railsVertical";
    }
    return blockType;
  }

  placeBlock(commandQueueItem, blockType) {
    var blockIndex = (this.levelModel.yToIndex(this.levelModel.player.position[1]) + this.levelModel.player.position[0]);
    var blockTypeAtPosition = this.levelModel.actionPlane[blockIndex].blockType;
    if (this.levelModel.canPlaceBlock()) {
      if (this.checkMinecartLevelEndAnimation() && blockType === "rail") {
        blockType = this.checkRailBlock(blockType);
      }

      if (blockTypeAtPosition !== "") {
        this.levelModel.destroyBlock(blockIndex);
      }
      if (this.levelModel.placeBlock(blockType)) {
        this.levelView.playPlaceBlockAnimation(this.levelModel.player.position, this.levelModel.player.facing, blockType, blockTypeAtPosition, () => {
          this.levelModel.computeShadingPlane();
          this.levelModel.computeFowPlane();
          this.levelView.updateShadingPlane(this.levelModel.shadingPlane);
          this.levelView.updateFowPlane(this.levelModel.fowPlane);
          this.delayBy(200, () => {
            this.levelView.playIdleAnimation(this.levelModel.player.position, this.levelModel.player.facing, false);
          });
          this.delayPlayerMoveBy(200, 400, () => {
            commandQueueItem.succeeded();
          });
        });
      } else {
        var signalBinding = this.levelView.playPlayerAnimation("jumpUp", this.levelModel.player.position, this.levelModel.player.facing, false).onLoop.add(() => {
          this.levelView.playIdleAnimation(this.levelModel.player.position, this.levelModel.player.facing, false);
          signalBinding.detach();
          this.delayBy(800, () => commandQueueItem.succeeded());
        }, this);
      }
    } else {
      commandQueueItem.failed();
    }
  }

  setPlayerActionDelayByQueueLength() {
    var START_SPEED_UP = 10;
    var END_SPEED_UP = 20;

    var queueLength = this.queue.getLength();
    var speedUpRangeMax = END_SPEED_UP - START_SPEED_UP;
    var speedUpAmount = Math.min(Math.max(queueLength - START_SPEED_UP, 0), speedUpRangeMax);

    this.playerDelayFactor = 1 - (speedUpAmount / speedUpRangeMax);
  }

  delayBy(ms, completionHandler) {
    var timer = this.game.time.create(true);
    timer.add(this.originalMsToScaled(ms), completionHandler, this);
    timer.start();
    this.resettableTimers.push(timer);
  }

  delayPlayerMoveBy(minMs, maxMs, completionHandler) {
    this.delayBy(Math.max(minMs, maxMs * this.playerDelayFactor), completionHandler);
  }

  originalMsToScaled(ms) {
    var realMs = ms / this.assumedSlowMotion;
    return realMs * this.game.time.slowMotion;
  }

  originalFpsToScaled(fps) {
    var realFps = fps * this.assumedSlowMotion;
    return realFps / this.game.time.slowMotion;
  }

  placeBlockForward(commandQueueItem, blockType) {
    var forwardPosition,
      placementPlane,
      soundEffect = () => { };

    if (!this.levelModel.canPlaceBlockForward()) {
      this.levelView.playPunchAirAnimation(this.levelModel.player.position, this.levelModel.player.facing, this.levelModel.player.position, () => {
        this.levelView.playIdleAnimation(this.levelModel.player.position, this.levelModel.player.facing, false);
        commandQueueItem.succeeded();
      });
      return;
    }

    forwardPosition = this.levelModel.getMoveForwardPosition();
    placementPlane = this.levelModel.getPlaneToPlaceOn(forwardPosition);
    if (this.levelModel.isBlockOfTypeOnPlane(forwardPosition, "lava", placementPlane)) {
      soundEffect = () => this.levelView.audioPlayer.play("fizz");
    }
    this.levelModel.placeBlockForward(blockType, placementPlane);
    this.levelView.playPlaceBlockInFrontAnimation(this.levelModel.player.position, this.levelModel.player.facing, this.levelModel.getMoveForwardPosition(), placementPlane, blockType, () => {
      this.levelModel.computeShadingPlane();
      this.levelModel.computeFowPlane();
      this.levelView.updateShadingPlane(this.levelModel.shadingPlane);
      this.levelView.updateFowPlane(this.levelModel.fowPlane);
      soundEffect();
      this.delayBy(200, () => {
        this.levelView.playIdleAnimation(this.levelModel.player.position, this.levelModel.player.facing, false);
      });
      this.delayPlayerMoveBy(200, 400, () => {
        commandQueueItem.succeeded();
      });
    });
  }

  checkSolution(commandQueueItem) {
    let player = this.levelModel.player;
    this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);

    // check the final state to see if its solved
    if (this.levelModel.isSolved()) {
      if (this.checkHouseBuiltEndAnimation()) {
        var houseBottomRight = this.levelModel.getHouseBottomRight();
        var inFrontOfDoor = [houseBottomRight[0] - 1, houseBottomRight[1] + 2];
        var bedPosition = [houseBottomRight[0], houseBottomRight[1]];
        var doorPosition = [houseBottomRight[0] - 1, houseBottomRight[1] + 1];
        this.levelModel.moveTo(inFrontOfDoor);
        this.levelView.playSuccessHouseBuiltAnimation(
          player.position,
          player.facing,
          player.isOnBlock,
          this.levelModel.houseGroundToFloorBlocks(houseBottomRight),
          [bedPosition, doorPosition],
          () => {
            commandQueueItem.succeeded();
          },
          () => {
            this.levelModel.destroyBlock(bedPosition);
            this.levelModel.destroyBlock(doorPosition);
            this.levelModel.computeShadingPlane();
            this.levelModel.computeFowPlane();
            this.levelView.updateShadingPlane(this.levelModel.shadingPlane);
            this.levelView.updateFowPlane(this.levelModel.fowPlane);
          }
        );
      } else if (this.checkMinecartLevelEndAnimation()) {
        this.levelView.playMinecartAnimation(player.position, player.facing, player.isOnBlock,
          () => commandQueueItem.succeeded(), this.levelModel.getMinecartTrack(), this.levelModel.getUnpoweredRails());
      } else if (this.checkTntAnimation()) {
        this.levelView.scaleShowWholeWorld(() => { });
        var tnt = this.levelModel.getTnt();
        var wasOnBlock = player.isOnBlock;
        this.levelView.playDestroyTntAnimation(player.position, player.facing, player.isOnBlock, this.levelModel.getTnt(), this.levelModel.shadingPlane,
          () => {
            if (tnt.length) {
              // Shakes camera (need to avoid contention with pan?)
              //this.game.camera.setPosition(0, 5);
              //this.game.add.tween(this.game.camera)
              //    .to({y: -10}, 40, Phaser.Easing.Sinusoidal.InOut, false, 0, 3, true)
              //    .to({y: 0}, 0)
              //    .start();
            }
            for (var i in tnt) {
              if (tnt[i].x === this.levelModel.player.position.x && tnt[i].y === this.levelModel.player.position.y) {
                this.levelModel.player.isOnBlock = false;
              }
              var surroundingBlocks = this.levelModel.getAllBorderingPositionNotOfType(tnt[i], "tnt");
              this.levelModel.destroyBlock(tnt[i]);
              for (var b = 1; b < surroundingBlocks.length; ++b) {
                if (surroundingBlocks[b][0]) {
                  this.destroyBlockWithoutPlayerInteraction(surroundingBlocks[b][1]);
                }
              }
            }
            if (!player.isOnBlock && wasOnBlock) {
              this.levelView.playPlayerJumpDownVerticalAnimation(player.position, player.facing);
            }
            this.levelModel.computeShadingPlane();
            this.levelModel.computeFowPlane();
            this.levelView.updateShadingPlane(this.levelModel.shadingPlane);
            this.levelView.updateFowPlane(this.levelModel.fowPlane);
            this.delayBy(200, () => {
              this.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, () => {
                commandQueueItem.succeeded();
              });
            });
          });
      } else {
        this.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock,
          () => commandQueueItem.succeeded());
      }
    } else {
      this.levelView.playFailureAnimation(player.position, player.facing, player.isOnBlock, () => {
        commandQueueItem.failed();
      });
    }
  }

  isPathAhead(blockType) {
    return this.levelModel.isForwardBlockOfType(blockType);
  }

  useEntity(commandQueueItem, userIdentifier, targetIdentifier) {
    if (this.levelEntity.entityMap.has(targetIdentifier)) {
      let userEntity = this.getEntity(userIdentifier);
      this.levelEntity.entityMap.get(targetIdentifier).use(commandQueueItem, userEntity);
    }
  }

  spawnEntity(commandQueueItem, type, spawnDirection) {
    var spawnedEntity = this.levelEntity.spawnEntity(type, spawnDirection);
    if (spawnedEntity !== null) {
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier }));
    }
    commandQueueItem.succeeded();
  }

  spawnEntityAt(commandQueueItem, type, x, y, facing) {
    var spawnedEntity = this.levelEntity.spawnEntityAt(type, x, y, facing);
    if (spawnedEntity !== null) {
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier }));
      commandQueueItem.succeeded();
    }
    else
      commandQueueItem.failed();
  }

  destroyEntity(commandQueueItem, target) {
    if (!this.isType(target)) {
      if (target !== 'Player') {
        let entity = this.getEntity(target);
        entity.healthPoint = 1;
        entity.takeDamage(commandQueueItem);
      }
      else {
        this.printErrorMsg("Not able to destroy player\n");
        commandQueueItem.succeeded();
      }
    }
    else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, entity.identifier); }, entity.identifier);
        entity.addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  drop(commandQueueItem, itemType) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      entity.drop(commandQueueItem, itemType);
    } else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.drop(callbackCommand, itemType) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  attack(commandQueueItem) {
    var target = commandQueueItem.target;
    if (!this.isType(target)) {
      var entity = this.getEntity(target);
      if (entity.identifier === 'Player') {
        this.codeOrgAPI.destroyBlock(dummyFunc);
        commandQueueItem.succeeded();
      } else {
        entity.attack(commandQueueItem);
      }
    } else {
      var entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.attack(callbackCommand) }, entities[i].identifier);
        entities[i].addCommand(callbackCommand);
      }
      commandQueueItem.succeeded();
    }
  }

  addCommand(commandQueueItem) {
    var target = this.getEntity(commandQueueItem.target);
    // there is a target, push command to the specific target
    if (target !== undefined)
      target.addCommand(commandQueueItem);
    else {
      this.queue.addCommand(commandQueueItem);
      this.queue.begin();
    }
  }

  addGlobalCommand(commandQueueItem) {
    let entity = this.levelEntity.entityMap.get(commandQueueItem.target);
    if (entity !== undefined)
      entity.addCommand(commandQueueItem);
    else {
      this.queue.addCommand(commandQueueItem);
      this.queue.begin();
    }
  }

  startDay(commandQueueItem) {
    if (this.levelModel.isDaytime) {
      if (commandQueueItem)
        commandQueueItem.succeeded();
      if (this.DEBUG)
        this.game.debug.text("Impossible to start day since it's already day time\n");
    }
    else {
      this.levelModel.isDaytime = true;
      this.levelModel.clearFow();
      this.levelView.updateFowPlane(this.levelModel.fowPlane);
      this.events.forEach(e => e({ eventType: EventType.WhenDayGlobal }));
      var entities = this.levelEntity.entityMap;
      for (var value of entities) {
        let entity = value[1];
        this.events.forEach(e => e({ eventType: EventType.WhenDay, targetIdentifier: entity.identifier, targetType: entity.type }));
      }
      var zombieList = this.levelEntity.getEntitiesOfType('zombie');
      for (var i = 0; i < zombieList.length; i++) {
        zombieList[i].setBurn(true);
      }
      if (commandQueueItem)
        commandQueueItem.succeeded();
    }
  }

  startNight(commandQueueItem) {
    if (!this.levelModel.isDaytime) {
      if (commandQueueItem)
        commandQueueItem.succeeded();
      if (this.DEBUG)
        this.game.debug.text("Impossible to start night since it's already night time\n");
    }
    else {
      this.levelModel.isDaytime = false;
      this.levelModel.computeFowPlane();
      this.levelView.updateFowPlane(this.levelModel.fowPlane);
      this.events.forEach(e => e({ eventType: EventType.WhenNightGlobal }));
      var entities = this.levelEntity.entityMap;
      for (var value of entities) {
        let entity = value[1];
        this.events.forEach(e => e({ eventType: EventType.WhenNight, targetIdentifier: entity.identifier, targetType: entity.type }));
      }
      var zombieList = this.levelEntity.getEntitiesOfType('zombie');
      for (var i = 0; i < zombieList.length; i++) {
        zombieList[i].setBurn(false);
      }
      if (commandQueueItem)
        commandQueueItem.succeeded();
    }
  }

  initiateDayNightCycle(firstDelay, delayInSecond, startTime) {
    if (startTime === "day" || startTime === "Day") {
      setTimeout(() => {
        this.startDay(null);
        this.setDayNightCycle(delayInSecond, "night");
      }, firstDelay * 1000)
    }
    else if (startTime === "night" || startTime === "Night") {
      setTimeout(() => {
        this.startNight(null);
        this.setDayNightCycle(delayInSecond, "day");
      }, firstDelay * 1000)
    }
  }

  setDayNightCycle(delayInSecond, startTime) {
    if (!this.dayNightCycle)
      return;
    if (startTime === "day" || startTime === "Day") {
      setTimeout(() => {
        if (!this.dayNightCycle)
          return;
        this.startDay(null);
        this.setDayNightCycle(delayInSecond, "night");
      }, delayInSecond * 1000)
    }
    else if (startTime === "night" || startTime === "Night") {
      setTimeout(() => {
        if (!this.dayNightCycle)
          return;
        this.startNight(null);
        this.setDayNightCycle(delayInSecond, "day");
      }, delayInSecond * 1000)
    }
  }

  dispatchSpawnEventAtStart() {
    for (var value of this.levelEntity.entityMap) {
      var entity = value[1];
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: entity.type, targetIdentifier: entity.identifier }));
    }
  }

  arrowDown(direction) {
    this.player.movementState = direction;
    this.player.updateMovement();
  }

  arrowUp(direction) {
    if (this.player.movementState === direction)
      this.player.movementState = -1;
    this.player.updateMovement();
  }

  clickDown() {
    this.player.movementState = -2;
    this.player.updateMovement();
  }

  clickUp() {
    if (this.player.movementState === -2)
      this.player.movementState = -1;
    this.player.updateMovement();
  }
}

window.GameController = GameController;

export default GameController;
