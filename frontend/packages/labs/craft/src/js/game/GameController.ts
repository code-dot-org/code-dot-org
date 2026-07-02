// @ts-nocheck -- untyped JS renamed to .ts for progressive adoption
import Phaser from 'phaser';

import { get as getCodeOrgAPI } from './API/CodeOrgAPI';
import CallbackCommand from './CommandQueue/CallbackCommand';
import CommandQueue from './CommandQueue/CommandQueue';
import EventType from './Event/EventType';
import AssetLoader from './LevelMVC/AssetLoader';
import FacingDirection from './LevelMVC/FacingDirection';
import LevelEntity from './LevelMVC/LevelEntity';
import LevelModel from './LevelMVC/LevelModel';
import LevelView from './LevelMVC/LevelView';
import Position from './LevelMVC/Position';
import { convertNameToEntity } from './LevelMVC/Utils';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;

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

    /**
     * @public {Object} codeOrgAPI - API with externally-callable methods for
     * starting an attempt, issuing commands, etc.
     */
    this.codeOrgAPI = getCodeOrgAPI(this);

    /**
     * Main Phaser game instance.
     * @property {Phaser.Game}
     */
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: gameControllerConfig.containerId,
      banner: false,
      audio: {noAudio: true},
      render: {preserveDrawingBuffer: true}, // enables saving .png screengrabs
      fps: gameControllerConfig.forceSetTimeOut
        ? {forceSetTimeOut: true}
        : undefined,
      backgroundColor: '#000000',
    });

    /**
     * The active Phaser scene; assigned by the scene lifecycle below. All
     * factories (add/load/tweens/time/input/cameras) hang off of this.
     * @property {Phaser.Scene}
     */
    this.scene = null;

    /**
     * Root container all display groups live in; world-scale zooms it.
     * @property {Phaser.GameObjects.Container}
     */
    this.worldGroup = null;

    // CE dilated the whole logic clock by time.slowMotion; the ported code
    // reads this field wherever CE read game.time.slowMotion.
    this.slowMotion = 1;

    this._booted = false;
    this._bootQueue = [];
    this.game.events.once('ready', () => {
      this._booted = true;
      this._bootQueue.forEach(fn => fn());
      this._bootQueue = [];
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
    this.agent = null;

    this.timerSprite = null;

    const controller = this;

    class EarlyLoadScene extends Phaser.Scene {
      constructor() {
        super('earlyLoad');
      }
      preload() {
        controller.scene = this;
        controller.assetLoader.loadPacks(controller.earlyLoadAssetPacks);
      }
      create() {
        // optionally load some more assets if we complete early load before level load
        controller.assetLoader.loadPacks(controller.earlyLoadNiceToHaveAssetPacks);
        this.load.start();
      }
    }

    class LevelRunnerScene extends Phaser.Scene {
      constructor() {
        super('levelRunner');
      }
      preload() {
        controller.scene = this;
        controller.preload();
      }
      create() {
        controller.create();
      }
      update() {
        controller.update();
        controller.render();
      }
    }

    this._whenBooted(() => {
      this.game.scene.add('earlyLoad', EarlyLoadScene, true);
      this.game.scene.add('levelRunner', LevelRunnerScene, false);
    });
  }

  _whenBooted(fn) {
    if (this._booted) {
      fn();
    } else {
      this._bootQueue.push(fn);
    }
  }

  /**
   * Is this one of those level types in which the player is controlled by arrow
   * keys rather than by blocks?
   *
   * @return {boolean}
   */
  getIsDirectPlayerControl() {
    return this.levelData.isEventLevel || this.levelData.isAgentLevel;
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

    this._whenBooted(() => {
      this.game.scene.stop('earlyLoad');
      this.game.scene.start('levelRunner');
    });
  }

  reset() {
    this.dayNightCycle = false;
    this.queue.reset();
    this.levelEntity.reset();
    this.levelModel.reset();
    this.levelView.reset(this.levelModel);
    this.levelEntity.loadData(this.levelData);
    this.player = this.levelModel.player;
    this.agent = this.levelModel.agent;
    this.resettableTimers.forEach((timer) => {
      timer.remove(false);
    });
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    if (this.timerSprite) {
      this.timerSprite.setActive(false).setVisible(false);
    }
    this.timerSprite = null;
    this.timeouts = [];
    this.resettableTimers.length = 0;
    this.events.length = 0;

    this.score = 0;
    if (this.useScore) {
      this.updateScore();
    }

    if (!this.getIsDirectPlayerControl()) {
      this.events.push(event => {
        if (event.eventType === EventType.WhenUsed && event.targetType === 'sheep') {
          this.codeOrgAPI.drop(null, 'wool', event.targetIdentifier);
        }
        if (event.eventType === EventType.WhenTouched && event.targetType === 'creeper') {
          this.codeOrgAPI.flashEntity(null, event.targetIdentifier);
          this.codeOrgAPI.explodeEntity(null, event.targetIdentifier);
        }
      });
    }

    this.initializeCommandRecord();
  }

  preload() {
    this.assetLoader.loadPacks(this.levelData.assetPacks.beforeLoad);
  }

  create() {
    this.worldGroup = this.scene.add.container(0, 0);
    this.levelView.create(this.levelModel);
    this.slowMotion = this.initialSlowMotion;
    this.addCheatKeys();
    this.assetLoader.loadPacks(this.levelData.assetPacks.afterLoad);
    this.scene.load.image('timer', `${this.assetRoot}images/placeholderTimer.png`);
    this.scene.load.once('complete', () => {
      if (this.afterAssetsLoaded) {
        this.afterAssetsLoaded();
      }
    });
    this.levelEntity.loadData(this.levelData);
    this.scene.load.start();
  }

  run() {
    // dispatch when spawn event at run
    this.events.forEach(e => e({ eventType: EventType.WhenRun, targetIdentifier: undefined }));
    for (const value of this.levelEntity.entityMap) {
      var entity = value[1];
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: entity.type, targetIdentifier: entity.identifier }));
      entity.queue.begin();
    }
    // set timeout for timeout
    const isNumber = !isNaN(this.timeout);
    if (isNumber && this.timeout > 0) {
      this.timerSprite = this.scene.add.sprite(-50, 390, 'timer').setOrigin(0, 0);
      this.levelView.addResettableTween({
        targets: this.timerSprite,
        x: -450,
        alpha: 0.5,
        duration: this.timeout,
        ease: 'Linear',
        onComplete: () => {
          this.endLevel(this.timeoutResult(this.levelModel));
        },
      });
    }
  }

  followingPlayer() {
    return !!this.levelData.gridDimensions && !this.checkMinecartLevelEndAnimation();
  }

  update() {
    this.queue.tick();
    this.levelEntity.tick();
    if (this.levelModel.usePlayer) {
      this.player.updateMovement();
    }
    if (this.levelModel.usingAgent) {
      this.agent.updateMovement();
    }
    this.levelView.update();

    // Check for completion every frame for "event" levels. For procedural
    // levels, only check completion after the player has run all commands.
    if (this.getIsDirectPlayerControl() || this.player.queue.state > 1) {
      this.checkSolution();
    }
  }

  addCheatKeys() {
    if (!this.levelModel.usePlayer) {
      return;
    }

    const KeyCodes = Phaser.Input.Keyboard.KeyCodes;
    const keysToMovementState = {
      [KeyCodes.UP]: FacingDirection.North,
      [KeyCodes.W]: FacingDirection.North,
      [KeyCodes.RIGHT]: FacingDirection.East,
      [KeyCodes.D]: FacingDirection.East,
      [KeyCodes.DOWN]: FacingDirection.South,
      [KeyCodes.S]: FacingDirection.South,
      [KeyCodes.LEFT]: FacingDirection.West,
      [KeyCodes.A]: FacingDirection.West,
      [KeyCodes.SPACE]: -2
    };

    const editableElementSelected = function () {
      const editableHtmlTags = ["INPUT", "TEXTAREA"];
      return document.activeElement !== null &&
             editableHtmlTags.includes(document.activeElement.tagName);
    };

    Object.keys(keysToMovementState).forEach((key) => {
      const movementState = keysToMovementState[key];
      const keyObject = this.scene.input.keyboard.addKey(Number(key));
      keyObject.on('down', () => {
        if (editableElementSelected()) {
          return;
        }
        this.player.movementState = movementState;
        this.player.updateMovement();
      });
      keyObject.on('up', () => {
        if (editableElementSelected()) {
          return;
        }
        if (this.player.movementState === movementState) {
          this.player.movementState = -1;
        }
        this.player.updateMovement();
      });
      this.scene.input.keyboard.removeCapture(Number(key));
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
    this.levelView.render();
  }

  scaleFromOriginal() {
    const [newWidth, newHeight] = this.levelData.gridDimensions || [10, 10];
    const [originalWidth, originalHeight] = [10, 10];
    return [newWidth / originalWidth, newHeight / originalHeight];
  }

  getScreenshot() {
    return this.game.canvas.toDataURL("image/png");
  }

  // command record

  initializeCommandRecord() {
    const commandList = ["moveAway", "moveToward", "moveForward", "turn", "turnRandom", "explode", "wait", "flash", "drop", "spawn", "destroy", "playSound", "attack", "addScore"];
    this.commandRecord = new Map;
    this.repeatCommandRecord = new Map;
    this.isRepeat = false;
    for (let i = 0; i < commandList.length; i++) {
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
    const commandRecord = repeat ? this.repeatCommandRecord : this.commandRecord;
    // correct command name
    if (commandRecord.has(commandName)) {
      // update count for command map
      const commandMap = commandRecord.get(commandName);
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
    const commandRecord = repeat ? this.repeatCommandRecord : this.commandRecord;
    // command record has command name and target
    if (commandRecord.has(commandName)) {
      const commandMap = commandRecord.get(commandName);
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
    const entity = this.levelEntity.entityMap.get(target);
    if (entity === undefined) {
      console.log("Debug GetEntity: there is no entity : " + target + "\n");
    }
    return entity;
  }

  getEntities(type) {
    return this.levelEntity.getEntitiesOfType(type);
  }

  isType(target) {
    return typeof (target) === 'string' && (target !== 'Player' && target !== "PlayerAgent");
  }

  printErrorMsg(msg) {
    if (this.DEBUG) {
      console.debug(msg);
    }
  }

  /**
   * @param {any} commandQueueItem
   * @param {any} moveAwayFrom (entity identifier)
   *
   * @memberOf GameController
   */
  moveAway(commandQueueItem, moveAwayFrom) {
    const target = commandQueueItem.target;
    // apply to all entities
    if (target === undefined) {
      const entities = this.levelEntity.entityMap;
      for (const value of entities) {
        const entity = value[1];
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFrom); }, entity.identifier);
        entity.addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    } else {
      const targetIsType = this.isType(target);
      const moveAwayFromIsType = this.isType(moveAwayFrom);
      if (target === moveAwayFrom) {
        this.printErrorMsg("Debug MoveAway: Can't move away entity from itself\n");
        commandQueueItem.succeeded();
        return;
      }
      // move away entity from entity
      if (!targetIsType && !moveAwayFromIsType) {
        const entity = this.getEntity(target);
        const moveAwayFromEntity = this.getEntity(moveAwayFrom);
        if (entity === moveAwayFromEntity) {
          commandQueueItem.succeeded();
          return;
        }
        entity.moveAway(commandQueueItem, moveAwayFromEntity);
      } else if (targetIsType && !moveAwayFromIsType) {
        // move away type from entity
        const targetEntities = this.getEntities(target);
        const moveAwayFromEntity = this.getEntity(moveAwayFrom);
        if (moveAwayFromEntity !== undefined) {
          for (let i = 0; i < targetEntities.length; i++) {
            // not move if it's same entity
            if (targetEntities[i].identifier === moveAwayFromEntity.identifier) {
              continue;
            }
            const callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFrom); }, targetEntities[i].identifier);
            targetEntities[i].addCommand(callbackCommand, commandQueueItem.repeat);
          }
        }
        commandQueueItem.succeeded();
      } else if (!targetIsType && moveAwayFromIsType) {
        // move away entity from type
        const entity = this.getEntity(target);
        const moveAwayFromEntities = this.getEntities(moveAwayFrom);
        if (moveAwayFromEntities.length > 0) {
          let closestTarget = [Number.MAX_VALUE, -1];
          for (let i = 0; i < moveAwayFromEntities.length; i++) {
            if (entity.identifier === moveAwayFromEntities[i].identifier) {
              continue;
            }
            const distance = entity.getDistance(moveAwayFromEntities[i]);
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
        const entities = this.getEntities(target);
        const moveAwayFromEntities = this.getEntities(moveAwayFrom);
        if (moveAwayFromEntities.length > 0 && entities.length > 0) {
          for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            let closestTarget = [Number.MAX_VALUE, -1];
            for (let j = 0; j < moveAwayFromEntities.length; j++) {
              // not move if it's same entity
              if (moveAwayFromEntities[i].identifier === entity.identifier) {
                continue;
              }
              const distance = entity.getDistance(moveAwayFromEntities[j]);
              if (distance < closestTarget[0]) {
                closestTarget = [distance, j];
              }
            }
            if (closestTarget !== -1) {
              const callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveAway(callbackCommand, moveAwayFromEntities[closestTarget[1]].identifier); }, entity.identifier);
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
    const target = commandQueueItem.target;
    // apply to all entities
    if (target === undefined) {
      const entities = this.levelEntity.entityMap;
      for (const value of entities) {
        const entity = value[1];
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardTo); }, entity.identifier);
        entity.addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    } else {
      const targetIsType = this.isType(target);
      const moveTowardToIsType = this.isType(moveTowardTo);
      if (target === moveTowardTo) {
        commandQueueItem.succeeded();
        return;
      }
      // move toward entity to entity
      if (!targetIsType && !moveTowardToIsType) {
        const entity = this.getEntity(target);
        const moveTowardToEntity = this.getEntity(moveTowardTo);
        entity.moveToward(commandQueueItem, moveTowardToEntity);
      } else if (targetIsType && !moveTowardToIsType) {
        // move toward type to entity
        const targetEntities = this.getEntities(target);
        const moveTowardToEntity = this.getEntity(moveTowardTo);
        if (moveTowardToEntity !== undefined) {
          for (let i = 0; i < targetEntities.length; i++) {
            // not move if it's same entity
            if (targetEntities[i].identifier === moveTowardToEntity.identifier) {
              continue;
            }
            const callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardTo); }, targetEntities[i].identifier);
            targetEntities[i].addCommand(callbackCommand, commandQueueItem.repeat);
          }
          commandQueueItem.succeeded();
        }
      } else if (!targetIsType && moveTowardToIsType) {
        // move toward entity to type
        const entity = this.getEntity(target);
        const moveTowardToEntities = this.getEntities(moveTowardTo);
        if (moveTowardToEntities.length > 0) {
          let closestTarget = [Number.MAX_VALUE, -1];
          for (let i = 0; i < moveTowardToEntities.length; i++) {
            // not move if it's same entity
            if (moveTowardToEntities[i].identifier === entity.identifier) {
              continue;
            }
            const distance = entity.getDistance(moveTowardToEntities[i]);
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
        const entities = this.getEntities(target);
        const moveTowardToEntities = this.getEntities(moveTowardTo);
        if (moveTowardToEntities.length > 0 && entities.length > 0) {
          for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            let closestTarget = [Number.MAX_VALUE, -1];
            for (let j = 0; j < moveTowardToEntities.length; j++) {
              // not move if it's same entity
              if (moveTowardToEntities[i].identifier === entity.identifier) {
                continue;
              }
              const distance = entity.getDistance(moveTowardToEntities[j]);
              if (distance < closestTarget[0]) {
                closestTarget = [distance, j];
              }
            }
            if (closestTarget[1] !== -1) {
              const callbackCommand = new CallbackCommand(this, () => { }, () => { this.moveToward(callbackCommand, moveTowardToEntities[closestTarget[1]].identifier); }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            }
          }
          commandQueueItem.succeeded();
        }
      }
    }
  }

  positionEquivalence(lhs, rhs) {
    return (lhs[0] === rhs[0] && lhs[1] === rhs[1]);
  }

  /**
   * Run a command. If no `commandQueueItem.target` is provided, the command
   * will be applied to all targets.
   *
   * @param commandQueueItem
   * @param command
   * @param commandArgs
   */
  execute(commandQueueItem, command, ...commandArgs) {
    const target = commandQueueItem.target;
    if (!this.isType(target)) {
      if (target === undefined) {
        // Apply to all entities.
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          const callbackCommand = new CallbackCommand(this, () => { }, () => { this.execute(callbackCommand, command, ...commandArgs); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        // Apply to the given target.
        const entity = this.getEntity(target);
        entity[command](commandQueueItem, ...commandArgs);
      }
    } else {
      // Apply to all targets of the given type.
      const entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.execute(callbackCommand, command, ...commandArgs); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  moveForward(commandQueueItem) {
    this.execute(commandQueueItem, 'moveForward');
  }

  moveBackward(commandQueueItem) {
    this.execute(commandQueueItem, 'moveBackward');
  }

  moveDirection(commandQueueItem, direction) {
    const player = this.levelModel.player;
    const shouldRide = this.levelModel.shouldRide(direction);
    if (shouldRide) {
      player.handleGetOnRails(direction);
      commandQueueItem.succeeded();
    } else {
      this.execute(commandQueueItem, 'moveDirection', direction);
    }
  }

  turn(commandQueueItem, direction) {
    this.execute(commandQueueItem, 'turn', direction);
  }

  turnRandom(commandQueueItem) {
    this.execute(commandQueueItem, 'turnRandom');
  }

  flashEntity(commandQueueItem) {
    const target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          const callbackCommand = new CallbackCommand(this, () => { }, () => { this.flashEntity(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        const entity = this.getEntity(target);
        const delay = this.levelView.flashSpriteToWhite(entity.sprite);
        this.addCommandRecord("flash", entity.type, commandQueueItem.repeat);
        this.delayBy(delay, () => {
          commandQueueItem.succeeded();
        });
      }
    } else {
      const entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.flashEntity(callbackCommand); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  explodeEntity(commandQueueItem) {
    const target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          const callbackCommand = new CallbackCommand(this, () => { }, () => { this.explodeEntity(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        const targetEntity = this.getEntity(target);
        this.levelView.playExplosionCloudAnimation(targetEntity.position);
        this.addCommandRecord("explode", targetEntity.type, commandQueueItem.repeat);
        this.levelView.audioPlayer.play("explode");
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) {
                continue;
              }
              const position = [targetEntity.position[0] + i, targetEntity.position[1] + j];
              this.destroyBlockWithoutPlayerInteraction(position);
              if (entity.position[0] === targetEntity.position[0] + i && entity.position[1] === targetEntity.position[1] + j) {
                entity.blowUp(commandQueueItem, targetEntity.position);
              }
            }
          }
        }

        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, targetEntity.identifier); }, targetEntity.identifier);
        targetEntity.queue.startPushHighPriorityCommands();
        targetEntity.addCommand(callbackCommand, commandQueueItem.repeat);
        targetEntity.queue.endPushHighPriorityCommands();
      }
      commandQueueItem.succeeded();
      this.updateFowPlane();
      this.updateShadingPlane();
    } else {
      const entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.explodeEntity(callbackCommand); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  wait(commandQueueItem, time) {
    const target = commandQueueItem.target;
    if (!this.isType(target)) {
      const entity = this.getEntity(target);
      this.addCommandRecord("wait", entity.type, commandQueueItem.repeat);
      setTimeout(() => { commandQueueItem.succeeded(); }, time * 1000 / this.tweenTimeScale);
    } else {
      const entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.wait(callbackCommand, time); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  spawnEntity(commandQueueItem, type, spawnDirection) {
    this.addCommandRecord("spawn", type, commandQueueItem.repeat);
    const spawnedEntity = this.levelEntity.spawnEntity(type, spawnDirection);
    if (spawnedEntity !== null) {
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier }));
    }
    commandQueueItem.succeeded();
  }

  spawnEntityAt(commandQueueItem, type, x, y, facing) {
    const spawnedEntity = this.levelEntity.spawnEntityAt(type, x, y, facing);
    if (spawnedEntity !== null) {
      this.events.forEach(e => e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier }));
    }
    commandQueueItem.succeeded();
  }

  destroyEntity(commandQueueItem, target) {
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          const callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, entity.identifier); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        this.addCommandRecord("destroy", this.type, commandQueueItem.repeat);
        const entity = this.getEntity(target);
        if (entity !== undefined) {
          entity.healthPoint = 1;
          entity.takeDamage(commandQueueItem);
        } else {
          commandQueueItem.succeeded();
        }
      }
    } else {
      const entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, entity.identifier); }, entity.identifier);
        entity.addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  drop(commandQueueItem, itemType) {
    const target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          const callbackCommand = new CallbackCommand(this, () => { }, () => { this.drop(callbackCommand, itemType); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        const entity = this.getEntity(target);
        entity.drop(commandQueueItem, itemType);
      }
    } else {
      const entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.drop(callbackCommand, itemType); }, entities[i].identifier);
        entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  attack(commandQueueItem) {
    const target = commandQueueItem.target;
    if (!this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          const callbackCommand = new CallbackCommand(this, () => { }, () => { this.attack(callbackCommand); }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else {
        const entity = this.getEntity(target);
        if (entity.identifier === 'Player') {
          this.codeOrgAPI.destroyBlock(() => { }, entity.identifier);
          commandQueueItem.succeeded();
        } else {
          entity.attack(commandQueueItem);
        }
      }
    } else {
      const entities = this.getEntities(target);
      for (let i = 0; i < entities.length; i++) {
        const callbackCommand = new CallbackCommand(this, () => { }, () => { this.attack(callbackCommand); }, entities[i].identifier);
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
    const player = this.levelModel.player;
    const frontPosition = this.levelModel.getMoveForwardPosition(player);
    const frontEntity = this.levelEntity.getEntityAt(frontPosition);
    const frontBlock = this.levelModel.actionPlane.getBlockAt(frontPosition);

    const isFrontBlockDoor = frontBlock === undefined ? false : frontBlock.blockType === "door";
    if (frontEntity !== null && frontEntity !== this.agent) {
      // push use command to execute general use behavior of the entity before executing the event
      this.levelView.setSelectionIndicatorPosition(frontPosition[0], frontPosition[1]);
      const punchKey = this.levelView.playPlayerAnimation("punch", player.position, player.facing, false);
      this.levelView.onAnimationEnd(player.getAnimationTarget(), punchKey, () => {

        frontEntity.queue.startPushHighPriorityCommands();
        const useCommand = new CallbackCommand(this, () => { }, () => { frontEntity.use(useCommand, player); }, frontEntity.identifier);
        const isFriendlyEntity = this.levelEntity.isFriendlyEntity(frontEntity.type);
        // push frienly entity 1 block
        if (!isFriendlyEntity) {
          const pushDirection = player.facing;
          const moveAwayCommand = new CallbackCommand(this, () => { }, () => { frontEntity.pushBack(moveAwayCommand, pushDirection, 150); }, frontEntity.identifier);
          frontEntity.addCommand(moveAwayCommand);
        }
        frontEntity.addCommand(useCommand);
        frontEntity.queue.endPushHighPriorityCommands();
        this.levelView.playPlayerAnimation("idle", player.position, player.facing, false);
        if (this.getIsDirectPlayerControl()) {
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
      const punchKey = this.levelView.playPlayerAnimation("punch", player.position, player.facing, false);
      this.levelView.onAnimationEnd(player.getAnimationTarget(), punchKey, () => {
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
    } else if (frontBlock && frontBlock.isRail) {
      this.levelView.playTrack(frontPosition, player.facing, true, player, null);
      commandQueueItem.succeeded();
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
    const player = this.getEntity(commandQueueItem.target);
    // if there is a destroyable block in front of the player
    if (this.levelModel.canDestroyBlockForward(player)) {
      const block = this.levelModel.actionPlane.getBlockAt(this.levelModel.getMoveForwardPosition(player));

      if (block !== null) {
        const destroyPosition = this.levelModel.getMoveForwardPosition(player);
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
          this.levelView.playDestroyBlockAnimation(player.position, player.facing, destroyPosition, blockType, player, () => {
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
      this.levelView.playPunchDestroyAirAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(player), () => {
        this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
        this.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock, player);
        this.delayPlayerMoveBy(0, 0, () => {
          commandQueueItem.succeeded();
        });
      }, player);
    }
  }

  destroyBlockWithoutPlayerInteraction(position) {
    if (!this.levelModel.inBounds(position)) {
      return;
    }
    const block = this.levelModel.actionPlane.getBlockAt(position);

    if (block !== null && block !== undefined) {
      const destroyPosition = position;
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
          case "logSpruceSnowy":
          case "treeSpruceSnowy":
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

    // clear the block in level model (block info in 2d grid)
    this.levelModel.destroyBlock(position);
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

  checkAgentSpawn() {
    return this.specialLevelType === 'agentSpawn';
  }

  placeBlock(commandQueueItem, blockType) {
    const player = this.getEntity(commandQueueItem.target);
    const position = player.position;
    const blockAtPosition = this.levelModel.actionPlane.getBlockAt(position);
    const blockTypeAtPosition = blockAtPosition.blockType;

    if (this.levelModel.canPlaceBlock(player, blockAtPosition)) {
      if (blockTypeAtPosition !== "") {
        this.levelModel.destroyBlock(position);
      }

      if (blockType !== "cropWheat" || this.levelModel.groundPlane.getBlockAt(player.position).blockType === "farmlandWet") {
        this.levelModel.player.updateHidingBlock(player.position);
        if (this.checkMinecartLevelEndAnimation() && blockType === "rail") {
          // Special 'minecart' level places a mix of regular and powered tracks, depending on location.
          if (player.position[1] < 7) {
            blockType = "railsUnpoweredVertical";
          } else {
            blockType = "rails";
          }
        }
        this.levelView.playPlaceBlockAnimation(player.position, player.facing, blockType, blockTypeAtPosition, player, () => {
          const entity = convertNameToEntity(blockType, position.x, position.y);
          if (entity) {
            this.levelEntity.spawnEntityAt(...entity);
          } else {
            this.levelModel.placeBlock(blockType, player);
            this.updateFowPlane();
            this.updateShadingPlane();
          }
          this.delayBy(200, () => {
            this.levelView.playIdleAnimation(player.position, player.facing, false, player);
          });
          this.delayPlayerMoveBy(200, 400, () => {
            commandQueueItem.succeeded();
          });
        });
      } else {
        const jumpKey = this.levelView.playPlayerAnimation("jumpUp", player.position, player.facing, false, player);
        this.levelView.onAnimationLoopOnce(player.getAnimationTarget(), jumpKey, () => {
          this.levelView.playIdleAnimation(player.position, player.facing, false, player);
          this.delayBy(800, () => commandQueueItem.succeeded());
        });
      }
    } else {
      commandQueueItem.succeeded();
    }
  }

  setPlayerActionDelayByQueueLength() {
    if (!this.levelModel.usePlayer) {
      return;
    }

    const START_SPEED_UP = 10;
    const END_SPEED_UP = 20;

    const queueLength = this.levelModel.player.queue.getLength();
    const speedUpRangeMax = END_SPEED_UP - START_SPEED_UP;
    const speedUpAmount = Math.min(Math.max(queueLength - START_SPEED_UP, 0), speedUpRangeMax);

    this.playerDelayFactor = 1 - (speedUpAmount / speedUpRangeMax);
  }

  delayBy(ms, completionHandler) {
    // CE timers ticked on the slowMotion-dilated clock; bake it into the delay
    const event = this.scene.time.delayedCall(
      this.originalMsToScaled(ms) * this.slowMotion,
      completionHandler,
      [],
      this
    );
    this.resettableTimers.push(event);
  }

  delayPlayerMoveBy(minMs, maxMs, completionHandler) {
    this.delayBy(Math.max(minMs, maxMs * this.playerDelayFactor), completionHandler);
  }

  originalMsToScaled(ms) {
    const realMs = ms / this.assumedSlowMotion;
    return realMs * this.slowMotion;
  }

  originalFpsToScaled(fps) {
    const realFps = fps * this.assumedSlowMotion;
    return realFps / this.slowMotion;
  }

  placeBlockForward(commandQueueItem, blockType) {
    this.placeBlockDirection(commandQueueItem, blockType, 0);
  }

  placeBlockDirection(commandQueueItem, blockType, direction) {
    const player = this.getEntity(commandQueueItem.target);
    let position,
      placementPlane,
      soundEffect = () => { };

    if (!this.levelModel.canPlaceBlockDirection(blockType, player, direction)) {
      this.levelView.playPunchAirAnimation(player.position, player.facing, player.position, () => {
        this.levelView.playIdleAnimation(player.position, player.facing, false, player);
        commandQueueItem.succeeded();
      }, player);
      return;
    }

    position = this.levelModel.getMoveDirectionPosition(player, direction);
    placementPlane = this.levelModel.getPlaneToPlaceOn(position, player, blockType);
    if (this.levelModel.isBlockOfTypeOnPlane(position, "lava", placementPlane)) {
      soundEffect = () => this.levelView.audioPlayer.play("fizz");
    }

    this.levelView.playPlaceBlockInFrontAnimation(player, player.position, player.facing, position, () => {
      this.levelModel.placeBlockDirection(blockType, placementPlane, player, direction);
      this.levelView.refreshGroundGroup();

      this.updateFowPlane();
      this.updateShadingPlane();
      soundEffect();

      this.delayBy(200, () => {
        this.levelView.playIdleAnimation(player.position, player.facing, false, player);
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
        const houseBottomRight = this.levelModel.getHouseBottomRight();
        const inFrontOfDoor = new Position(houseBottomRight.x - 1, houseBottomRight.y + 2);
        const bedPosition = new Position(houseBottomRight.x, houseBottomRight.y);
        const doorPosition = new Position(houseBottomRight.x - 1, houseBottomRight.y + 1);
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
            this.updateFowPlane();
            this.updateShadingPlane();
          }
        );
      } else if (this.checkMinecartLevelEndAnimation()) {
        this.resultReported = true;
        this.levelView.playMinecartAnimation(player.isOnBlock, () => {
          this.handleEndState(true);
        });
      } else if (this.checkAgentSpawn()) {
        this.resultReported = true;

        const levelEndAnimation = this.levelView.playLevelEndAnimation(player.position, player.facing, player.isOnBlock);

        levelEndAnimation.once('complete', () => {
          this.levelModel.spawnAgent(null, new Position(3, 4), 2); // This will spawn the Agent at [3, 4], facing South.
          this.levelView.agent = this.agent;
          this.levelView.resetEntity(this.agent);

          this.updateFowPlane();
          this.updateShadingPlane();
          this.delayBy(200, () => {
            this.endLevel(true);
          });
        });
      } else if (this.checkTntAnimation()) {
        this.resultReported = true;
        this.levelView.scaleShowWholeWorld(() => {});
        const tnt = this.levelModel.getTnt();
        const wasOnBlock = player.isOnBlock;
        this.levelView.playDestroyTntAnimation(player.position, player.facing, player.isOnBlock, this.levelModel.getTnt(), this.levelModel.shadingPlane,
          () => {
            for (const i in tnt) {
              if (tnt[i].x === this.levelModel.player.position.x && tnt[i].y === this.levelModel.player.position.y) {
                this.levelModel.player.isOnBlock = false;
              }
              const surroundingBlocks = this.levelModel.getAllBorderingPositionNotOfType(tnt[i], "tnt");
              this.levelModel.destroyBlock(tnt[i]);
              for (let b = 1; b < surroundingBlocks.length; ++b) {
                if (surroundingBlocks[b][0]) {
                  this.destroyBlockWithoutPlayerInteraction(surroundingBlocks[b][1]);
                }
              }
            }
            if (!player.isOnBlock && wasOnBlock) {
              this.levelView.playPlayerJumpDownVerticalAnimation(player.facing, player.position);
            }
            this.updateFowPlane();
            this.updateShadingPlane();
            this.delayBy(200, () => {
              this.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, () => {
                this.endLevel(true);
              });
            });
          });
      } else {
        this.endLevel(true);
      }
    } else if (this.levelModel.isFailed() || !(this.getIsDirectPlayerControl() || this.levelData.isAquaticLevel)) {
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
      const player = this.levelModel.player;
      const callbackCommand = new CallbackCommand(this, () => { }, () => {
        this.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, () => { this.handleEndState(true); });
      }, player.identifier);
      player.queue.startPushHighPriorityCommands();
      player.addCommand(callbackCommand, this.isRepeat);
      player.queue.endPushHighPriorityCommands();
    } else {
      const player = this.levelModel.player;
      const callbackCommand = new CallbackCommand(this, () => { }, () => { this.destroyEntity(callbackCommand, player.identifier); }, player.identifier);
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
    return this.player.isOnBlock ? true : this.levelModel.isForwardBlockOfType(blockType);
  }

  addCommand(commandQueueItem) {
    // there is a target, push command to the specific target
    if (commandQueueItem.target !== undefined) {
      const target = this.getEntity(commandQueueItem.target);
      target.addCommand(commandQueueItem, this.isRepeat);
    } else {
      this.queue.addCommand(commandQueueItem, this.isRepeat);
      this.queue.begin();
    }
  }

  addGlobalCommand(commandQueueItem) {
    const entity = this.levelEntity.entityMap.get(commandQueueItem.target);
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
        console.debug("Impossible to start day since it's already day time\n");
      }
    } else {
      if (this.onDayCallback !== undefined) {
        this.onDayCallback();
      }
      this.levelModel.isDaytime = true;
      this.levelModel.clearFow();
      this.levelView.updateFowGroup(this.levelModel.fowPlane);
      this.events.forEach(e => e({ eventType: EventType.WhenDayGlobal }));
      const entities = this.levelEntity.entityMap;
      for (const value of entities) {
        const entity = value[1];
        this.events.forEach(e => e({ eventType: EventType.WhenDay, targetIdentifier: entity.identifier, targetType: entity.type }));
      }
      const zombieList = this.levelEntity.getEntitiesOfType('zombie');
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
        console.debug("Impossible to start night since it's already night time\n");
      }
    } else {
      if (this.onNightCallback !== undefined) {
        this.onNightCallback();
      }
      this.levelModel.isDaytime = false;
      this.levelModel.computeFowPlane();
      this.levelView.updateFowGroup(this.levelModel.fowPlane);
      this.events.forEach(e => e({ eventType: EventType.WhenNightGlobal }));
      const entities = this.levelEntity.entityMap;
      for (const value of entities) {
        const entity = value[1];
        this.events.forEach(e => e({ eventType: EventType.WhenNight, targetIdentifier: entity.identifier, targetType: entity.type }));
      }
      const zombieList = this.levelEntity.getEntitiesOfType('zombie');
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
    this.levelView.updateFowGroup(this.levelModel.fowPlane);
  }

  updateShadingPlane() {
    this.levelModel.computeShadingPlane();
    this.levelView.updateShadingGroup(this.levelModel.shadingPlane);
  }
}

window.GameController = GameController;

export default GameController;
