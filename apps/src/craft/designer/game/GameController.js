import CommandQueue from "./CommandQueue/CommandQueue.js";
import CallbackCommand from "./CommandQueue/CallbackCommand.js";

import EventType from "./Event/EventType.js";
import FacingDirection from "./LevelMVC/FacingDirection.js";

import LevelModel from "./LevelMVC/LevelModel.js";
import LevelView from "./LevelMVC/LevelView.js";
import LevelEntity from "./LevelMVC/LevelEntity.js";
import AssetLoader from "./LevelMVC/AssetLoader.js";

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
    this.timeouts = [];
    this.timeout = 0;
    this.initializeCommandRecord();

    this.score = 0;
    this.useScore = false;
    this.scoreText = null;
    this.onScoreUpdate = gameControllerConfig.onScoreUpdate;

    this.events = [];

    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1.5;
    this.initialSlowMotion = gameControllerConfig.customSlowMotion || this.assumedSlowMotion;
    this.tweenTimeScale = 1.5 / this.initialSlowMotion;

    this.playerDelayFactor = 1.0;
    this.dayNightCycle = false;
    this.player = null;

    this.timerSprite = null;

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
    this.timeout = levelConfig.levelVerificationTimeout;
    if (levelConfig.useScore !== undefined) {
      this.useScore = levelConfig.useScore;
    }
    this.timeoutResult = levelConfig.timeoutResult;
    this.onDayCallback = levelConfig.onDayCallback;
    this.onNightCallback = levelConfig.onNightCallback;
    this.game.state.start('levelRunner');
  }

  reset() {
    this.dayNightCycle = false;
    this.queue.reset();
    this.levelEntity.reset();
    this.levelModel.reset();
    this.levelView.reset(this.levelModel);
    this.levelEntity.loadData(this.levelData);
    this.player = this.levelModel.player;
    this.resettableTimers.forEach((timer) => {
      timer.stop(true);
    });
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    if (this.timerSprite) {
      this.timerSprite.kill();
    }
    this.timerSprite = null;
    this.timeouts = [];
    this.resettableTimers.length = 0;
    this.events.length = 0;

    this.score = 0;
    if (this.useScore) {
      this.updateScore();
    }

    this.initializeCommandRecord();
  }

  preload() {
    this.game.load.resetLocked = true;
    this.game.time.advancedTiming = this.DEBUG;
    this.game.stage.disableVisibilityChange = true;
    this.assetLoader.loadPacks(this.levelData.assetPacks.beforeLoad);
  }

  isEdge() {
    return /Edge\/\d./i.test(navigator.userAgent);
  }

  create() {
    this.levelView.create(this.levelModel);
    this.game.time.slowMotion = this.initialSlowMotion;
    this.addCheatKeys();
    this.assetLoader.loadPacks(this.levelData.assetPacks.afterLoad);
    this.game.load.image('timer', `${this.assetRoot}images/placeholderTimer.png`);
    this.game.load.onLoadComplete.addOnce(() => {
      if (this.afterAssetsLoaded) {
        this.afterAssetsLoaded();
      }
    });
    this.levelEntity.loadData(this.levelData);
    this.game.load.start();
  }

  run() {
    // dispatch when spawn event at run
    this.events.forEach(e => e({ eventType: EventType.WhenRun, targetIdentifier: undefined }));
    for (var value of this.levelEntity.entityMap) {
      var entity = value[1];
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: entity.type, targetIdentifier: entity.identifier }));
      entity.queue.begin();
    }
    // set timeout for timeout
    const isNumber = !isNaN(this.timeout);
    if (isNumber && this.timeout > 0) {
      this.timerSprite = this.game.add.sprite(-50, 390, 'timer');
      var tween = this.levelView.addResettableTween(this.timerSprite).to({
        x: -450, alpha: 0.5
      }, this.timeout, Phaser.Easing.Linear.None);

      tween.start();
      tween = this.levelView.addResettableTween().to({
      }, this.timeout, Phaser.Easing.Linear.None);

      tween.onComplete.add(() => {
        this.endLevel(this.timeoutResult(this.levelModel));
      });
      tween.start();
    }
  }

  followingPlayer() {
    return !!this.levelData.gridDimensions;
  }

  update() {
    this.queue.tick();
    this.levelEntity.tick();
    if (this.levelModel.usePlayer) {
      this.player.updateMovement();
    }
    this.levelView.update();

    // Check for completion every frame for "event" levels. For procedural
    // levels, only check completion after the player has run all commands.
    if (this.levelData.isEventLevel || this.player.queue.state > 1) {
      this.checkSolution();
    }
  }

  addCheatKeys() {
    if (!this.levelModel.usePlayer) {
      return;
    }
    this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(() => {
      this.player.movementState = FacingDirection.Up;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Up) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(() => {
      this.player.movementState = FacingDirection.Up;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.W).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Up) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(() => {
      this.player.movementState = FacingDirection.Right;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Right) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(() => {
      this.player.movementState = FacingDirection.Right;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.D).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Right) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(() => {
      this.player.movementState = FacingDirection.Down;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Down) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.S).onDown.add(() => {
      this.player.movementState = FacingDirection.Down;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.S).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Down) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(() => {
      this.player.movementState = FacingDirection.Left;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Left) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(() => {
      this.player.movementState = FacingDirection.Left;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.A).onUp.add(() => {
      if (this.player.movementState === FacingDirection.Left) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(() => {
      this.player.movementState = -2;
      this.player.updateMovement();
      if (this.isEdge()) {
        this.player.movementState = -1;
        this.player.updateMovement();
      }
    });
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onUp.add(() => {
      if (this.player.movementState === -2) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    });
  }

  handleEndState(result) {
    // report back to the code.org side the pass/fail result
    //     then clear the callback so we dont keep calling it
    if (this.OnCompleteCallback) {
      this.OnCompleteCallback(result, this.levelModel);
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

  // command record

  initializeCommandRecord() {
    let commandList = ["moveAway", "moveToward", "moveForward", "turn", "turnRandom", "explode", "wait", "flash", "drop", "spawn", "destroy", "playSound", "attack", "addScore"];
    this.commandRecord = new Map;
    this.repeatCommandRecord = new Map;
    this.isRepeat = false;
    for (var i = 0; i < commandList.length; i++) {
      this.commandRecord.set(commandList[i], new Map);
      this.commandRecord.get(commandList[i]).set("count", 0);
      this.repeatCommandRecord.set(commandList[i], new Map);
      this.repeatCommandRecord.get(commandList[i]).set("count", 0);
    }
  }

  startPushRepeatCommand() {
    this.isRepeat = true;
  }

  endPushRepeatCommand() {
    this.isRepeat = false;
  }

  addCommandRecord(commandName, targetType, repeat) {
    var commandRecord = repeat ? this.repeatCommandRecord : this.commandRecord;
    // correct command name
    if (commandRecord.has(commandName)) {
      // update count for command map
      let commandMap = commandRecord.get(commandName);
      commandMap.set("count", commandMap.get("count") + 1);
      // command map has target
      if (commandMap.has(targetType)) {
        // increment count
        commandMap.set(targetType, commandMap.get(targetType) + 1);
      } else {
        commandMap.set(targetType, 1);
      }
      if (this.DEBUG) {
        const msgHeader = repeat ? "Repeat " : "" + "Command :";
        console.log(msgHeader + commandName + " executed in mob type : " + targetType + " updated count : " + commandMap.get(targetType));
      }
    }
  }

  getCommandCount(commandName, targetType, repeat) {
    var commandRecord = repeat ? this.repeatCommandRecord : this.commandRecord;
    // command record has command name and target
    if (commandRecord.has(commandName)) {
      let commandMap = commandRecord.get(commandName);
      // doesn't have target so returns global count for command
      if (targetType === undefined) {
        return commandMap.get("count");
        // type specific count
      } else if (commandMap.has(targetType)) {
        return commandMap.get(targetType);
        // doesn't have a target
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  // command processors

  getEntity(target) {
    if (target === undefined) {
      target = 'Player';
    }
    let entity = this.levelEntity.entityMap.get(target);
    if (entity === undefined) {
      console.log("Debug GetEntity: there is no entity : " + target + "\n");
    }
    return entity;
  }

  getEntities(type) {
    return this.levelEntity.getEntitiesOfType(type);
  }

  isType(target) {
    return typeof (target) === 'string' && target !== 'Player';
  }

  printErrorMsg(msg) {
    if (this.DEBUG) {
      this.game.debug.text(msg);
    }
  }

  /**
   * @param {any} commandQueueItem
   * @param {any} moveAwayFrom (entity identifier)
   *
   * @memberOf GameController
   */
  moveAway(commandQueueItem, moveAwayFrom) {
    var target = commandQueueItem.target;
    // apply to all entities
    if (target === undefined) {
      var entities = this.levelEntity.entityMap;
      for (var value of entities) {
        let entity = value[1];
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFrom); }, entity.identifier);
        entity.addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    } else {
      let targetIsType = this.isType(target);
      let moveAwayFromIsType = this.isType(moveAwayFrom);
      if (target === moveAwayFrom) {
        this.printErrorMsg("Debug MoveAway: Can't move away entity from itself\n");
        commandQueueItem.succeeded();
        return;
      }
      // move away entity from entity
      if (!targetIsType && !moveAwayFromIsType) {
        let entity = this.getEntity(target);
        let moveAwayFromEntity = this.getEntity(moveAwayFrom);
        if (entity === moveAwayFromEntity) {
          commandQueueItem.succeeded();
          return;
        }
        entity.moveAway(commandQueueItem, moveAwayFromEntity);
      } else if (targetIsType && !moveAwayFromIsType) {
        // move away type from entity
        let targetEntities = this.getEntities(target);
        let moveAwayFromEntity = this.getEntity(moveAwayFrom);
        if (moveAwayFromEntity !== undefined) {
          for (var i = 0; i < targetEntities.length; i++) {
            // not move if it's same entity
            if (targetEntities[i].identifier === moveAwayFromEntity.identifier) {
              continue;
            }
            let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFrom); }, targetEntities[i].identifier);
            targetEntities[i].addCommand(callbackCommand, commandQueueItem.repeat);
          }
        }
        commandQueueItem.succeeded();
      } else if (!targetIsType && moveAwayFromIsType) {
        // move away entity from type
        let entity = this.getEntity(target);
        let moveAwayFromEntities = this.getEntities(moveAwayFrom);
        if (moveAwayFromEntities.length > 0) {
          let closestTarget = [Number.MAX_VALUE, -1];
          for (let i = 0; i < moveAwayFromEntities.length; i++) {
            if (entity.identifier === moveAwayFromEntities[i].identifier) {
              continue;
            }
            let distance = entity.getDistance(moveAwayFromEntities[i]);
            if (distance < closestTarget[0]) {
              closestTarget = [distance, i];
            }
          }
          if (closestTarget[1] !== -1) {
            entity.moveAway(commandQueueItem, moveAwayFromEntities[closestTarget[1]]);
          }
        } else {
          commandQueueItem.succeeded();
        }
      } else {
        // move away type from type
        let entities = this.getEntities(target);
        let moveAwayFromEntities = this.getEntities(moveAwayFrom);
        if (moveAwayFromEntities.length > 0 && entities.length > 0) {
          for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let closestTarget = [Number.MAX_VALUE, -1];
            for (let j = 0; j < moveAwayFromEntities.length; j++) {
              // not move if it's same entity
              if (moveAwayFromEntities[i].identifier === entity.identifier) {
                continue;
              }
              let distance = entity.getDistance(moveAwayFromEntities[j]);
              if (distance < closestTarget[0]) {
                closestTarget = [distance, j];
              }
            }
            if (closestTarget !== -1) {
              let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFromEntities[closestTarget[1]].identifier); }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            } else {
              commandQueueItem.succeeded();
            }
          }
          commandQueueItem.succeeded();
        }
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
    // apply to all entities
    if (target === undefined) {
      let entities = this.levelEntity.entityMap;
      for (var value of entities) {
        let entity = value[1];
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardTo); }, entity.identifier);
        entity.addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    } else {
      let targetIsType = this.isType(target);
      let moveTowardToIsType = this.isType(moveTowardTo);
      if (target === moveTowardTo) {
        commandQueueItem.succeeded();
        return;
      }
      // move toward entity to entity
      if (!targetIsType && !moveTowardToIsType) {
        let entity = this.getEntity(target);
        let moveTowardToEntity = this.getEntity(moveTowardTo);
        entity.moveToward(commandQueueItem, moveTowardToEntity);
      } else if (targetIsType && !moveTowardToIsType) {
        // move toward type to entity
        let targetEntities = this.getEntities(target);
        let moveTowardToEntity = this.getEntity(moveTowardTo);
        if (moveTowardToEntity !== undefined) {
          for (let i = 0; i < targetEntities.length; i++) {
            // not move if it's same entity
            if (targetEntities[i].identifier === moveTowardToEntity.identifier) {
              continue;
            }
            let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardTo); }, targetEntities[i].identifier);
            targetEntities[i].addCommand(callbackCommand, commandQueueItem.repeat);
          }
          commandQueueItem.succeeded();
        }
      } else if (!targetIsType && moveTowardToIsType) {
        // move toward entity to type
        let entity = this.getEntity(target);
        let moveTowardToEntities = this.getEntities(moveTowardTo);
        if (moveTowardToEntities.length > 0) {
          let closestTarget = [Number.MAX_VALUE, -1];
          for (let i = 0; i < moveTowardToEntities.length; i++) {
            // not move if it's same entity
            if (moveTowardToEntities[i].identifier === entity.identifier) {
              continue;
            }
            let distance = entity.getDistance(moveTowardToEntities[i]);
            if (distance < closestTarget[0]) {
              closestTarget = [distance, i];
            }
          }
          // there is valid target
          if (closestTarget[1] !== -1) {
            entity.moveToward(commandQueueItem, moveTowardToEntities[closestTarget[1]]);
          } else {
            commandQueueItem.succeeded();
          }
        } else {
          commandQueueItem.succeeded();
        }
      } else {
        // move toward type to type
        let entities = this.getEntities(target);
        let moveTowardToEntities = this.getEntities(moveTowardTo);
        if (moveTowardToEntities.length > 0 && entities.length > 0) {
          for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let closestTarget = [Number.MAX_VALUE, -1];
            for (let j = 0; j < moveTowardToEntities.length; j++) {
              // not move if it's same entity
              if (moveTowardToEntities[i].identifier === entity.identifier) {
                continue;
              }
              let distance = entity.getDistance(moveTowardToEntities[j]);
              if (distance < closestTarget[0]) {
                closestTarget = [distance, j];
              }
            }
            if (closestTarget[1] !== -1) {
              let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardToEntities[closestTarget[1]].identifier); }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            }
          }
          commandQueueItem.succeeded();
        }
      }
    }
  }

  moveForward(commandQueueItem) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (var value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveForward(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        entity.moveForward(commandQueueItem);
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveForward(callbackCommand); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  moveDirection(commandQueueItem, direction) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveDirection(callbackCommand, direction); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        entity.moveDirection(commandQueueItem, direction);
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveDirection(callbackCommand, direction); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  moveRandom(commandQueueItem) {
    let target = commandQueueItem.target;
    let getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveDirection(callbackCommand, getRandomInt(0, 3)); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        entity.moveDirection(commandQueueItem, getRandomInt(0, 3));
      }
    } else {
      let entities = this.getEntities(target);
      for (var i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveDirection(callbackCommand, getRandomInt(0, 3)); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  turn(commandQueueItem, direction) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.turn(callbackCommand, direction); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        entity.turn(commandQueueItem, direction);
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.turn(callbackCommand, direction); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  turnRandom(commandQueueItem) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.turnRandom(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        entity.turnRandom(commandQueueItem);
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.turnRandom(callbackCommand); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  flashEntity(commandQueueItem) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.flashEntity(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        let delay = this.levelView.flashSpriteToWhite(entity.sprite);
        this.addCommandRecord("flash", entity.type, commandQueueItem.repeat);
        this.delayBy(delay, () => {
          commandQueueItem.succeeded();
        });
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.flashEntity(callbackCommand); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }


  explodeEntity(commandQueueItem) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.explodeEntity(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let targetEntity = this.getEntity(target);
        this.levelView.playExplosionCloudAnimation(targetEntity.position);
        this.addCommandRecord("explode", targetEntity.type, commandQueueItem.repeat);
        this.levelView.audioPlayer.play("explode");
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) {
                continue;
              }
              let position = [targetEntity.position[0] + i, targetEntity.position[1] + j];
              this.destroyBlockWithoutPlayerInteraction(position);
              if (entity.position[0] === targetEntity.position[0] + i && entity.position[1] === targetEntity.position[1] + j) {
                entity.blowUp(commandQueueItem, targetEntity.position);
              }
            }
          }
        }

        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, targetEntity.identifier); }, targetEntity.identifier);
        targetEntity.queue.startPushHighPriorityCommands();
        targetEntity.addCommand(callbackCommand, commandQueueItem.repeat);
        targetEntity.queue.endPushHighPriorityCommands();
      }
      commandQueueItem.succeeded();
      this.updateFowPlane();
      this.updateShadingPlane();
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.explodeEntity(callbackCommand); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  wait(commandQueueItem, time) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      let entity = this.getEntity(target);
      this.addCommandRecord("wait", entity.type, commandQueueItem.repeat);
      setTimeout(() => { commandQueueItem.succeeded(); }, time * 1000);
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.wait(callbackCommand, time); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  useEntity(commandQueueItem, userIdentifier, targetIdentifier) {
    if (this.levelEntity.entityMap.has(targetIdentifier)) {
      let userEntity = this.getEntity(userIdentifier);
      this.levelEntity.entityMap.get(targetIdentifier).use(commandQueueItem, userEntity);
    }
  }

  spawnEntity(commandQueueItem, type, spawnDirection) {
    this.addCommandRecord("spawn", type, commandQueueItem.repeat);
    let spawnedEntity = this.levelEntity.spawnEntity(type, spawnDirection);
    if (spawnedEntity !== null) {
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier }));
    }
    commandQueueItem.succeeded();
  }

  spawnEntityAt(commandQueueItem, type, x, y, facing) {
    let spawnedEntity = this.levelEntity.spawnEntityAt(type, x, y, facing);
    if (spawnedEntity !== null) {
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier }));
    }
    commandQueueItem.succeeded();
  }

  destroyEntity(commandQueueItem, target) {
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, entity.identifier); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        this.addCommandRecord("destroy", this.type, commandQueueItem.repeat);
        let entity = this.getEntity(target);
        if (entity !== undefined) {
          entity.healthPoint = 1;
          entity.takeDamage(commandQueueItem);
        } else {
          commandQueueItem.succeeded();
        }
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, entity.identifier); }, entity.identifier);
        entity.addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  drop(commandQueueItem, itemType) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.drop(callbackCommand, itemType); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        entity.drop(commandQueueItem, itemType);
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.drop(callbackCommand, itemType); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  attack(commandQueueItem) {
    let target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        let entities = this.levelEntity.entityMap;
        for (let value of entities) {
          let entity = value[1];
          let callbackCommand = new CallbackCommand(this, () => { }, () => { this.attack(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        let entity = this.getEntity(target);
        if (entity.identifier === 'Player') {
          this.codeOrgAPI.destroyBlock(() => { }, entity.identifier);
          commandQueueItem.succeeded();
        } else {
          entity.attack(commandQueueItem);
        }
      }
    } else {
      let entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        let callbackCommand = new CallbackCommand(this, () => { }, () => { this.attack(callbackCommand); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  playSound(commandQueueItem, sound) {
    this.addCommandRecord("playSound", undefined, commandQueueItem.repeat);
    this.levelView.audioPlayer.play(sound);
    commandQueueItem.succeeded();
  }
  use(commandQueueItem) {
    let player = this.levelModel.player;
    let frontPosition = this.levelModel.getMoveForwardPosition(player);
    let frontEntity = this.levelEntity.getEntityAt(frontPosition);
    const frontIndex = this.levelModel.yToIndex(frontPosition[1]) + frontPosition[0];
    let frontBlock = this.levelModel.actionPlane[frontIndex];
    const isFrontBlockDoor = frontBlock === undefined ? false : frontBlock.blockType === "door";
    if (frontEntity !== null) {
      // push use command to execute general use behavior of the entity before executing the event
      this.levelView.setSelectionIndicatorPosition(frontPosition[0], frontPosition[1]);
      this.levelView.onAnimationEnd(this.levelView.playPlayerAnimation("punch", player.position, player.facing, false), () => {

        frontEntity.queue.startPushHighPriorityCommands();
        let useCommand = new CallbackCommand(this, () => { }, () => { frontEntity.use(useCommand, player); }, frontEntity.identifier);
        const isFriendlyEntity = this.levelEntity.isFriendlyEntity(frontEntity.type);
        // push frienly entity 1 block
        if (!isFriendlyEntity) {
          const pushDirection = player.facing;
          let moveAwayCommand = new CallbackCommand(this, () => { }, () => { frontEntity.pushBack(moveAwayCommand, pushDirection, 150); }, frontEntity.identifier);
          frontEntity.addCommand(moveAwayCommand);
        }
        frontEntity.addCommand(useCommand);
        frontEntity.queue.endPushHighPriorityCommands();
        this.levelView.playPlayerAnimation("idle", player.position, player.facing, false);
        if (this.levelData.isEventLevel) {
          this.delayPlayerMoveBy(0, 0, () => {
            commandQueueItem.succeeded();
          });
        } else {
          commandQueueItem.waitForOtherQueue = true;
        }
        setTimeout(() => { this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]); }, 0);
      });
    } else if (isFrontBlockDoor) {
      this.levelView.setSelectionIndicatorPosition(frontPosition[0], frontPosition[1]);
      this.levelView.onAnimationEnd(this.levelView.playPlayerAnimation("punch", player.position, player.facing, false), () => {
        this.audioPlayer.play("doorOpen");
        // if it's not walable, then open otherwise, close
        const canOpen = !frontBlock.isWalkable;
        this.levelView.playDoorAnimation(frontPosition, canOpen, () => {
          frontBlock.isWalkable = !frontBlock.isWalkable;
          this.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
          this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
          commandQueueItem.succeeded();
        });
      });
    } else {
      this.levelView.playPunchDestroyAirAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(), () => {
        this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
        this.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
        this.delayPlayerMoveBy(0, 0, () => {
          commandQueueItem.succeeded();
        });
      });
    }
  }

  destroyBlock(commandQueueItem) {
    let player = this.levelModel.player;
    // if there is a destroyable block in front of the player
    if (this.levelModel.canDestroyBlockForward()) {
      let block = this.levelModel.destroyBlockForward();

      if (block !== null) {
        let destroyPosition = this.levelModel.getMoveForwardPosition(player);
        let blockType = block.blockType;

        if (block.isDestroyable) {
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

          this.levelView.playDestroyBlockAnimation(player.position, player.facing, destroyPosition, blockType, () => {
            commandQueueItem.succeeded();
          });
        } else if (block.isUsable) {
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
    } else {
      this.levelView.playPunchDestroyAirAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(), () => {
        this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
        this.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
        this.delayPlayerMoveBy(0, 0, () => {
          commandQueueItem.succeeded();
        });
      });
    }
  }

  destroyBlockWithoutPlayerInteraction(position) {
    if (!this.levelModel.inBounds(position[0], position[1])) {
      return;
    }
    let block = this.levelModel.actionPlane[this.levelModel.yToIndex(position[1]) + position[0]];
    // clear the block in level model (block info in 2d grid)
    this.levelModel.destroyBlock(position);

    if (block !== null && block !== undefined) {
      let destroyPosition = position;
      let blockType = block.blockType;

      if (block.isDestroyable) {
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
        this.levelView.destroyBlockWithoutPlayerInteraction(destroyPosition);
        this.levelView.playExplosionAnimation(this.levelModel.player.position, this.levelModel.player.facing, position, blockType, () => { }, false);
        this.levelView.createMiniBlock(destroyPosition[0], destroyPosition[1], blockType);
        this.updateFowPlane();
        this.updateShadingPlane();
      } else if (block.isUsable) {
        switch (blockType) {
          case "sheep":
            // TODO: What to do with already sheered sheep?
            this.levelView.playShearAnimation(this.levelModel.player.position, this.levelModel.player.facing, position, blockType, () => { });
            break;
        }
      }
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
    let checkRailBlock = this.levelModel.railMap[this.levelModel.yToIndex(this.levelModel.player.position[1]) + this.levelModel.player.position[0]];
    if (checkRailBlock !== "") {
      blockType = checkRailBlock;
    } else {
      blockType = "railsVertical";
    }
    return blockType;
  }

  placeBlock(commandQueueItem, blockType) {
    let blockIndex = (this.levelModel.yToIndex(this.levelModel.player.position[1]) + this.levelModel.player.position[0]);
    let blockTypeAtPosition = this.levelModel.actionPlane[blockIndex].blockType;
    if (this.levelModel.canPlaceBlock()) {
      if (this.checkMinecartLevelEndAnimation() && blockType === "rail") {
        blockType = this.checkRailBlock(blockType);
      }

      if (blockTypeAtPosition !== "") {
        this.levelModel.destroyBlock(blockIndex);
      }
      if (this.levelModel.placeBlock(blockType)) {
        this.levelModel.player.updateHidingBlock(this.levelModel.player.position);
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
        let signalBinding = this.levelView.playPlayerAnimation("jumpUp", this.levelModel.player.position, this.levelModel.player.facing, false).onLoop.add(() => {
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
    if (!this.levelModel.usePlayer) {
      return;
    }

    let START_SPEED_UP = 10;
    let END_SPEED_UP = 20;

    let queueLength = this.levelModel.player.queue.getLength();
    let speedUpRangeMax = END_SPEED_UP - START_SPEED_UP;
    let speedUpAmount = Math.min(Math.max(queueLength - START_SPEED_UP, 0), speedUpRangeMax);

    this.playerDelayFactor = 1 - (speedUpAmount / speedUpRangeMax);
  }

  delayBy(ms, completionHandler) {
    let timer = this.game.time.create(true);
    timer.add(this.originalMsToScaled(ms), completionHandler, this);
    timer.start();
    this.resettableTimers.push(timer);
  }

  delayPlayerMoveBy(minMs, maxMs, completionHandler) {
    this.delayBy(Math.max(minMs, maxMs * this.playerDelayFactor), completionHandler);
  }

  originalMsToScaled(ms) {
    let realMs = ms / this.assumedSlowMotion;
    return realMs * this.game.time.slowMotion;
  }

  originalFpsToScaled(fps) {
    let realFps = fps * this.assumedSlowMotion;
    return realFps / this.game.time.slowMotion;
  }

  placeBlockForward(commandQueueItem, blockType) {
    let forwardPosition,
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

  checkSolution() {
    if (!this.attemptRunning || this.resultReported) {
      return;
    }
    // check the final state to see if its solved
    if (this.levelModel.isSolved()) {
      const player = this.levelModel.player;
      if (this.checkHouseBuiltEndAnimation()) {
        this.resultReported = true;
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
            this.endLevel(true);
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
        this.resultReported = true;
        this.levelView.playMinecartAnimation(player.position, player.facing, player.isOnBlock,
          () => { this.handleEndState(true); }, this.levelModel.getMinecartTrack(), this.levelModel.getUnpoweredRails());
      } else if (this.checkTntAnimation()) {
        this.resultReported = true;
        this.levelView.scaleShowWholeWorld(() => {});
        var tnt = this.levelModel.getTnt();
        var wasOnBlock = player.isOnBlock;
        this.levelView.playDestroyTntAnimation(player.position, player.facing, player.isOnBlock, this.levelModel.getTnt(), this.levelModel.shadingPlane,
          () => {
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
                this.endLevel(true);
              });
            });
          });
      } else {
        this.endLevel(true);
      }
    } else if (this.levelModel.isFailed() || !this.levelData.isEventLevel) {
      // For "Events" levels, check the final state to see if it's failed.
      // Procedural levels only call `checkSolution` after all code has run, so
      // fail if we didn't pass the success condition.
      this.endLevel(false);
    }
  }

  endLevel(result) {
    if (!this.levelModel.usePlayer) {
      if (result) {
        this.levelView.audioPlayer.play("success");
      } else {
        this.levelView.audioPlayer.play("failure");
      }
      this.resultReported = true;
      this.handleEndState(result);
      return;
    }
    if (result) {
      let player = this.levelModel.player;
      let callbackCommand = new CallbackCommand(this, () => { }, () => {
        this.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, () => { this.handleEndState(true); });
      }, player.identifier);
      player.queue.startPushHighPriorityCommands();
      player.addCommand(callbackCommand, this.isRepeat);
      player.queue.endPushHighPriorityCommands();
    } else {
      let player = this.levelModel.player;
      let callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, player.identifier); }, player.identifier);
      player.queue.startPushHighPriorityCommands();
      player.addCommand(callbackCommand, this.isRepeat);
      player.queue.endPushHighPriorityCommands();
    }
  }

  addScore(commandQueueItem, score) {
    this.addCommandRecord("addScore", undefined, commandQueueItem.repeat);
    if (this.useScore) {
      this.score += score;
      this.updateScore();
    }
    commandQueueItem.succeeded();
  }

  updateScore() {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  isPathAhead(blockType) {
    return this.levelModel.isForwardBlockOfType(blockType);
  }

  addCommand(commandQueueItem) {
    // there is a target, push command to the specific target
    if (commandQueueItem.target !== undefined) {
      let target = this.getEntity(commandQueueItem.target);
      target.addCommand(commandQueueItem, this.isRepeat);
    } else {
      this.queue.addCommand(commandQueueItem, this.isRepeat);
      this.queue.begin();
    }
  }

  addGlobalCommand(commandQueueItem) {
    let entity = this.levelEntity.entityMap.get(commandQueueItem.target);
    if (entity !== undefined) {
      entity.addCommand(commandQueueItem, this.isRepeat);
    } else {
      this.queue.addCommand(commandQueueItem, this.isRepeat);
      this.queue.begin();
    }
  }

  startDay(commandQueueItem) {
    if (this.levelModel.isDaytime) {
      if (commandQueueItem !== undefined && commandQueueItem !== null) {
        commandQueueItem.succeeded();
      }
      if (this.DEBUG) {
        this.game.debug.text("Impossible to start day since it's already day time\n");
      }
    } else {
      if (this.onDayCallback !== undefined) {
        this.onDayCallback();
      }
      this.levelModel.isDaytime = true;
      this.levelModel.clearFow();
      this.levelView.updateFowPlane(this.levelModel.fowPlane);
      this.events.forEach(e => e({ eventType: EventType.WhenDayGlobal }));
      let entities = this.levelEntity.entityMap;
      for (let value of entities) {
        let entity = value[1];
        this.events.forEach(e => e({ eventType: EventType.WhenDay, targetIdentifier: entity.identifier, targetType: entity.type }));
      }
      let zombieList = this.levelEntity.getEntitiesOfType('zombie');
      for (let i = 0; i < zombieList.length; i++) {
        zombieList[i].setBurn(true);
      }
      if (commandQueueItem !== undefined && commandQueueItem !== null) {
        commandQueueItem.succeeded();
      }
    }
  }

  startNight(commandQueueItem) {
    if (!this.levelModel.isDaytime) {
      if (commandQueueItem !== undefined && commandQueueItem !== null) {
        commandQueueItem.succeeded();
      }
      if (this.DEBUG) {
        this.game.debug.text("Impossible to start night since it's already night time\n");
      }
    } else {
      if (this.onNightCallback !== undefined) {
        this.onNightCallback();
      }
      this.levelModel.isDaytime = false;
      this.levelModel.computeFowPlane();
      this.levelView.updateFowPlane(this.levelModel.fowPlane);
      this.events.forEach(e => e({ eventType: EventType.WhenNightGlobal }));
      let entities = this.levelEntity.entityMap;
      for (let value of entities) {
        let entity = value[1];
        this.events.forEach(e => e({ eventType: EventType.WhenNight, targetIdentifier: entity.identifier, targetType: entity.type }));
      }
      let zombieList = this.levelEntity.getEntitiesOfType('zombie');
      for (let i = 0; i < zombieList.length; i++) {
        zombieList[i].setBurn(false);
      }
      if (commandQueueItem !== undefined && commandQueueItem !== null) {
        commandQueueItem.succeeded();
      }
    }
  }

  initiateDayNightCycle(firstDelay, delayInSecond, startTime) {
    if (startTime === "day" || startTime === "Day") {
      this.timeouts.push(setTimeout(() => {
        this.startDay(null);
        this.setDayNightCycle(delayInSecond, "night");
      }, firstDelay * 1000));
    } else if (startTime === "night" || startTime === "Night") {
      this.timeouts.push(setTimeout(() => {
        this.startNight(null);
        this.setDayNightCycle(delayInSecond, "day");
      }, firstDelay * 1000));
    }
  }

  setDayNightCycle(delayInSecond, startTime) {
    if (!this.dayNightCycle) {
      return;
    }
    if (startTime === "day" || startTime === "Day") {
      this.timeouts.push(setTimeout(() => {
        if (!this.dayNightCycle) {
          return;
        }
        this.startDay(null);
        this.setDayNightCycle(delayInSecond, "night");
      }, delayInSecond * 1000));
    } else if (startTime === "night" || startTime === "Night") {
      this.timeouts.push(setTimeout(() => {
        if (!this.dayNightCycle) {
          return;
        }
        this.startNight(null);
        this.setDayNightCycle(delayInSecond, "day");
      }, delayInSecond * 1000));
    }
  }

  arrowDown(direction) {
    if (!this.levelModel.usePlayer) {
      return;
    }
    this.player.movementState = direction;
    this.player.updateMovement();
  }

  arrowUp(direction) {
    if (!this.levelModel.usePlayer) {
      return;
    }
    if (this.player.movementState === direction) {
      this.player.movementState = -1;
    }
    this.player.updateMovement();
  }

  clickDown() {
    if (!this.levelModel.usePlayer) {
      return;
    }
    this.player.movementState = -2;
    this.player.updateMovement();
  }

  clickUp() {
    if (!this.levelModel.usePlayer) {
      return;
    }
    if (this.player.movementState === -2) {
      this.player.movementState = -1;
    }
    this.player.updateMovement();
  }

  updateFowPlane() {
    this.levelModel.computeFowPlane();
    this.levelView.updateFowPlane(this.levelModel.fowPlane);
  }

  updateShadingPlane() {
    this.levelModel.computeShadingPlane();
    this.levelView.updateShadingPlane(this.levelModel.shadingPlane);
  }
}

window.GameController = GameController;

export default GameController;
