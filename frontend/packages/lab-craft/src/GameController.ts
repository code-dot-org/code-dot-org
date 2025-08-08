import * as Phaser from 'phaser';

import AssetLoader from './AssetLoader';
import type BaseCommand from './BaseCommand';
import type BaseEntity from './BaseEntity';
import CommandQueue from './CommandQueue';
import CallbackCommand from './commands/CallbackCommand';
import type {Agent, Player} from './entities';
import {Direction} from './FacingDirection';
import LevelEntity from './level/LevelEntity';
import LevelModel from './level/LevelModel';
import LevelView from './level/LevelView';
import levels from './levels';
import type {CraftData} from './types';
import {safeEval, convertNameToEntity} from './utils';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;

/**
 * The interface for the audio device we want passed into the controller.
 */
export interface AudioPlayer {
  /** Registers the given sound */
  register(options: {id: string; mp3: string; ogg: string}): void;
  /** Plays the given sound */
  play(id: string): void;
}

export interface GameControllerConfig {
  /** The DOM id for the container to instantiate the game within */
  containerId: string;
  forceSetTimeOut: boolean;
  audioPlayer: AudioPlayer;
  assetRoot: string;
  afterAssetsLoaded?: () => void;
  earlyLoadAssetPacks?: string[];
  earlyLoadNiceToHaveAssetPacks?: string[];
  onScoreUpdate?: () => void;
  customSlowMotion?: number;
  levelConfig: CraftData;
}

export interface SceneConfig extends GameControllerConfig {
  assetLoader: AssetLoader;
}

// The Phaser Scene for the preloader
class EarlyLoadScene extends Phaser.Scene {
  protected assetLoader: AssetLoader;
  protected earlyLoadAssetPacks: string[];
  protected loadingText?: Phaser.GameObjects.Text;
  protected progressBar?: Phaser.GameObjects.Graphics;

  constructor({assetLoader, earlyLoadAssetPacks}: SceneConfig) {
    super('earlyLoad');

    this.assetLoader = assetLoader;
    this.earlyLoadAssetPacks = earlyLoadAssetPacks || [];
  }

  updateProgress(value: number) {
    // Update the width of the progress bar based on the loading progress
    this.progressBar?.clear();
    this.progressBar?.fillStyle(0x00ff00, 1); // Green color for the progress
    this.progressBar?.fillRect(0, 390, 400 * value, 10); // Update the progress bar width

    // Optional: Update the loading percentage text
    const percent = Math.floor(value * 100);
    this.loadingText?.setText(`Loading... ${percent}%`);
  }

  preload() {
    console.log('Early Load Preload');
    // Create the progress bar background (white)
    this.add.graphics().fillStyle(0xffffff, 0.8).fillRect(0, 390, 400, 10);

    // Create the progress bar foreground (green)
    this.progressBar = this.add.graphics();

    // Display a loading text
    this.loadingText = this.add
      .text(400, 390, 'Loading...', {
        fontSize: '10px',
        color: '#ffffff',
      })
      .setOrigin(1.0, 1.0);

    // Register the progress event
    this.load.on('progress', this.updateProgress, this);
    this.assetLoader.loadPacks(this, this.earlyLoadAssetPacks);
  }

  create() {
    // Start the level
    this.scene.start('levelRunner');
  }
}

// The Phaser Scene for the game itself
export class LevelRunnerScene extends Phaser.Scene {
  protected assetLoader: AssetLoader;
  audioPlayer: AudioPlayer;
  levelView!: LevelView;
  levelModel!: LevelModel;
  levelEntity!: LevelEntity;
  turnRandomCount: number = 0;
  score: number = 0;
  player?: Player;
  agent?: Agent;
  assumedSlowMotion: number = 1;
  initialSlowMotion: number = 1;
  tweenTimeScale: number;
  attemptRunning: boolean = false;
  private resettableTimers: Phaser.Time.TimerEvent[] = [];
  levelData: CraftData;
  queue: CommandQueue;
  playerDelayFactor: number;
  assetRoot: string;
  afterAssetsLoaded?: () => void;
  onDayCallback?: () => void;
  onNightCallback?: () => void;
  /** Time to wait for the level to run before failing verification */
  timeout?: number;
  timeoutResult?: ((api: LevelModel) => boolean) | (() => boolean);
  /** The special level type designation */
  specialLevelType?: string;
  /** Whether or not the level should display and track a score */
  useScore?: boolean;
  isRepeat: boolean = false;
  DEBUG: boolean = false;
  commandRecord: Map<string, Map<string, number>> = new Map();
  repeatCommandRecord: Map<string, Map<string, number>> = new Map();

  constructor({
    assetRoot,
    assetLoader,
    afterAssetsLoaded,
    audioPlayer,
    levelConfig,
    customSlowMotion,
  }: SceneConfig) {
    super('levelRunner');

    this.queue = new CommandQueue(this);
    this.assetLoader = assetLoader;
    this.audioPlayer = audioPlayer;
    this.afterAssetsLoaded = afterAssetsLoaded;
    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1;
    this.initialSlowMotion = customSlowMotion || this.assumedSlowMotion;
    this.tweenTimeScale = 1.5 / this.initialSlowMotion;
    this.playerDelayFactor = 1.0;
    this.assetRoot = assetRoot;
    this.levelData = Object.freeze({...levelConfig});
    this.initializeCommandRecord();
  }

  getCommandCount(_commandName: string, _targetType?: string, _repeated?: boolean): number {
    return 0;
  }

  delayBy(ms: number, completionHandler: () => void) {
    const timer = this.time.addEvent({
      delay: ms,
      callback: completionHandler,
    });
    this.resettableTimers.push(timer);
  }

  delayPlayerMoveBy(minMs: number, maxMs: number, completionHandler: () => void) {
    this.delayBy(Math.max(minMs, maxMs * this.playerDelayFactor), completionHandler);
  }

  /**
   * Is this one of those level types in which the player is controlled by arrow
   * keys rather than by blocks?
   */
  getIsDirectPlayerControl(): boolean {
    return this.levelData.isEventLevel || this.levelData.isAgentLevel || false;
  }

  originalFpsToScaled(fps: number): number {
    const realFps = fps * this.assumedSlowMotion;
    return realFps / (this.time.timeScale || 1);
  }

  followingPlayer(): boolean {
    return (
      !!this.levelData.gridDimensions && !this.checkMinecartLevelEndAnimation()
    );
  }

  checkTntAnimation(): boolean {
    return this.specialLevelType === 'freeplay';
  }

  checkMinecartLevelEndAnimation(): boolean {
    return this.specialLevelType === 'minecart';
  }

  loadLevel(levelConfig: CraftData) {
    this.levelEntity = new LevelEntity(this);
    this.levelModel = new LevelModel(this.levelData, this);
    this.levelView = new LevelView(this);

    this.specialLevelType = levelConfig.specialLevelType;
    this.timeout = levelConfig.levelVerificationTimeout;
    this.useScore = levelConfig.useScore;
    this.timeoutResult = typeof levelConfig.timeoutResult === 'string' ? safeEval(levelConfig.timeoutResult, () => false) : levelConfig.timeoutResult;
    this.onDayCallback = levelConfig.onDayCallback;
    this.onNightCallback = levelConfig.onNightCallback;
  }

  scaleFromOriginal() {
    const [newWidth, newHeight] = this.levelData.gridDimensions || [10, 10];
    const [originalWidth, originalHeight] = [10, 10];
    return [newWidth / originalWidth, newHeight / originalHeight];
  }

  preload() {
    console.log('Level Runner preload');
    this.assetLoader.loadPacks(this, this.levelData?.assetPacks?.beforeLoad || []);
  }

  addCheatKeys() {
    if (!this.levelModel.usePlayer) {
      return;
    }

    const keysToMovementState: {[key: string]: number} = {
      [Phaser.Input.Keyboard.KeyCodes.UP]: Direction.North,
      [Phaser.Input.Keyboard.KeyCodes.W]: Direction.North,
      [Phaser.Input.Keyboard.KeyCodes.RIGHT]: Direction.East,
      [Phaser.Input.Keyboard.KeyCodes.D]: Direction.East,
      [Phaser.Input.Keyboard.KeyCodes.DOWN]: Direction.South,
      [Phaser.Input.Keyboard.KeyCodes.S]: Direction.South,
      [Phaser.Input.Keyboard.KeyCodes.LEFT]: Direction.West,
      [Phaser.Input.Keyboard.KeyCodes.A]: Direction.West,
      [Phaser.Input.Keyboard.KeyCodes.SPACE]: -2,
    };

    const editableElementSelected = (): boolean => {
      const editableHtmlTags = ['INPUT', 'TEXTAREA'];
      return (
        document.activeElement !== null &&
        editableHtmlTags.includes(document.activeElement.tagName.toUpperCase())
      );
    };

    if (this.input.keyboard) {
      for (const key of Object.keys(keysToMovementState)) {
        const movementState = keysToMovementState[key];

        // Create a key from the keyCode
        const keyObj = this.input.keyboard.addKey(key);

        // Listen for the key press (down)
        keyObj.on('down', () => {
          if (editableElementSelected()) {
            return;
          }
          if (this.player) {
            this.player.movementState = movementState;
            this.player.updateMovement();
          }
        });

        // Listen for the key release (up)
        keyObj.on('up', () => {
          if (editableElementSelected()) {
            return;
          }
          if (this.player && this.player.movementState === movementState) {
            this.player.movementState = -1;
          }
          this.player?.updateMovement();
        });

        // Optionally, you can call removeKeyCapture, but Phaser 3 handles key events globally, so this may not be necessary.
        // this.input.keyboard.removeKeyCapture(keyCode);
      }
    }
  }

  create() {
    console.log('Level Runner create');
    this.loadLevel(this.levelData);

    this.levelView.create(this.levelModel);
    this.time.timeScale = this.initialSlowMotion;
    this.addCheatKeys();
    this.assetLoader.loadPacks(
      this,
      this.levelData.assetPacks?.afterLoad || [],
    );
    this.load.image('timer', `${this.assetRoot}images/placeholderTimer.png`);
    this.load.glsl('underwater', `${this.assetRoot}shaders/`);
    this.load.on('complete', () => {
      this.afterAssetsLoaded?.();
    });
    this.levelEntity.loadData(this.levelData);
    this.load.start();

    if (this.checkTntAnimation()) {
      console.log('show whole world bounds');
      this.levelView.scaleShowWholeWorld(() => {});
    }
  }

  update() {
    this.queue.tick();
    this.levelEntity.tick();

    // Draw screen from backbuffer
    this.levelView.world.clear();
    this.levelView.world.draw(this.levelView.worldContainer);
  }

  handleEndState(result: boolean) {
    console.log('handleEndState', result);
  }

  use(commandQueueItem: CallbackCommand) {
    const player = this.levelModel.player;
    if (!player) {
      return;
    }

    const frontPosition = this.levelModel.getMoveForwardPosition(player);
    const frontEntity = this.levelEntity.getEntityAt(frontPosition);
    const frontBlock = this.levelModel.actionPlane.getBlockAt(frontPosition);

    const isFrontBlockDoor = frontBlock ? frontBlock.blockType === "door" : false;
    if (frontEntity && frontEntity !== this.agent) {
      // Push use command to execute general use behavior of the entity before executing the event
      this.levelView.setSelectionIndicatorPosition(frontPosition);
      player.play('punch', () => {
        frontEntity.queue.startPushHighPriorityCommands();
        const useCommand = new CallbackCommand(
          this,
          () => {},
          frontEntity.identifier,
          () => {},
          () => {
            frontEntity.use(useCommand, player);
          },
        );
        const isFriendlyEntity = this.levelEntity.isFriendlyEntity(frontEntity.type);

        // Push frienly entity 1 block
        if (!isFriendlyEntity) {
          const pushDirection = player.facing;
          const moveAwayCommand = new CallbackCommand(
            this,
            () => {},
            frontEntity.identifier,
            () => {},
            () => {
              frontEntity.pushBack(moveAwayCommand, pushDirection, 150);
            },
          );
          frontEntity.addCommand(moveAwayCommand);
        }

        frontEntity.addCommand(useCommand);
        frontEntity.queue.endPushHighPriorityCommands();
        this.levelView.player?.play('idle');
        if (this.getIsDirectPlayerControl()) {
          this.delayPlayerMoveBy(0, 0, () => {
            commandQueueItem.succeeded();
          });
        } else {
          commandQueueItem.waitForOtherQueue = true;
        }
        setTimeout(() => {
          this.levelView.setSelectionIndicatorPosition(player.position);
        }, 0);
      });
    } else if (isFrontBlockDoor) {
      this.levelView.setSelectionIndicatorPosition(frontPosition);
      player.play('punch', () => {
        this.audioPlayer.play("doorOpen");
        // if it's not walable, then open otherwise, close
        const canOpen = !!frontBlock && !frontBlock.isWalkable;
        this.levelView.playDoorAnimation(frontPosition, canOpen, () => {
          if (frontBlock) {
            frontBlock.isWalkable = !frontBlock.isWalkable;
          }
          player.play('idle');
          this.levelView.setSelectionIndicatorPosition(player.position);
          commandQueueItem.succeeded();
        });
      });
    } else if (frontBlock && frontBlock.isRail) {
      this.levelView.playTrack(frontPosition, player.facing, true, player);
      commandQueueItem.succeeded();
    } else {
      this.levelView.playPunchDestroyAirAnimation(this.levelModel.getMoveForwardPosition(), () => {
        this.levelView.setSelectionIndicatorPosition(player.position);
        player.play('idle');
        this.delayPlayerMoveBy(0, 0, () => {
          commandQueueItem.succeeded();
        });
      }, player);
    }
  }

  initializeCommandRecord() {
    const commandList = ["moveAway", "moveToward", "moveForward", "turn", "turnRandom", "explode", "wait", "flash", "drop", "spawn", "destroy", "playSound", "attack", "addScore"];

    this.commandRecord = new Map<string, Map<string, number>>();
    this.repeatCommandRecord = new Map<string, Map<string, number>>();
    this.isRepeat = false;

    for (const command of commandList) {
      this.commandRecord.set(command, new Map<string, number>());
      this.commandRecord.get(command)?.set("count", 0);
      this.repeatCommandRecord.set(command, new Map<string, number>());
      this.repeatCommandRecord.get(command)?.set("count", 0);
    }
  }

  startPushRepeatCommand() {
    this.isRepeat = true;
  }

  endPushRepeatCommand() {
    this.isRepeat = false;
  }

  addCommandRecord(commandName: string, targetType: string, repeat: boolean) {
    const commandRecord = repeat ? this.repeatCommandRecord : this.commandRecord;
    // correct command name
    if (commandRecord.has(commandName)) {
      // update count for command map
      const commandMap = commandRecord.get(commandName);
      commandMap?.set("count", (commandMap?.get("count") || 0) + 1);
      // command map has target
      if (commandMap?.has(targetType)) {
        // increment count
        commandMap?.set(targetType, (commandMap?.get(targetType) || 0) + 1);
      } else {
        commandMap?.set(targetType, 1);
      }
      if (this.DEBUG) {
        const msgHeader = repeat ? "Repeat " : "" + "Command :";
        console.log(msgHeader + commandName + " executed in mob type : " + targetType + " updated count : " + commandMap?.get(targetType));
      }
    }
  }

  execute(_commandQueueItem: BaseCommand, _command: {
    command: string;
    direction?: Direction;
  }) {
  }

  moveForward(commandQueueItem: BaseCommand) {
    this.execute(commandQueueItem, {
      command: 'moveForward',
    });
  }

  moveBackward(commandQueueItem: BaseCommand) {
    this.execute(commandQueueItem, {
      command: 'moveBackward',
    });
  }

  moveDirection(commandQueueItem: BaseCommand, direction: Direction) {
    const player = this.levelModel.player;
    if (!player) {
      return;
    }

    const shouldRide = this.levelModel.shouldRide(direction);
    if (shouldRide) {
      player.handleGetOnRails(direction);
      commandQueueItem.succeeded();
    } else {
      this.execute(commandQueueItem, {
        command: 'moveDirection',
        direction,
      });
    }
  }

  turn(commandQueueItem: BaseCommand, direction: Direction) {
    this.execute(commandQueueItem, {
      command: 'turn',
      direction,
    });
  }

  turnRandom(commandQueueItem: BaseCommand) {
    this.execute(commandQueueItem, {
      command: 'turnRandom',
    });
  }

  getEntity(target?: string | number): BaseEntity | undefined {
    target ||= 'Player';

    const entity = this.levelEntity.entityMap.get(target);
    if (!entity) {
      console.log("Debug GetEntity: there is no entity : " + target + "\n");
    }

    return entity;
  }

  isPathAhead(blockType: string): boolean {
    return this.player?.isOnBlock ? true : this.levelModel.isForwardBlockOfType(blockType);
  }

  placeBlock(commandQueueItem: BaseCommand, blockType: string) {
    const player = this.getEntity(commandQueueItem.target);
    if (!player) {
      return;
    }

    const position = player.position;
    const blockAtPosition = this.levelModel.actionPlane.getBlockAt(position);
    const blockTypeAtPosition: string = blockAtPosition?.blockType || '';

    if (blockAtPosition && this.levelModel.canPlaceBlock(player, blockAtPosition)) {
      if (blockTypeAtPosition !== "") {
        this.levelModel.destroyBlock(position);
      }

      if (blockType !== "cropWheat" || this.levelModel.groundPlane.getBlockAt(player.position)?.blockType === "farmlandWet") {
        this.levelModel.player?.updateHidingBlock(player.position);
        if (this.checkMinecartLevelEndAnimation() && blockType === "rail") {
          // Special 'minecart' level places a mix of regular and powered tracks, depending on location.
          if (player.position.y < 7) {
            blockType = "railsUnpoweredVertical";
          } else {
            blockType = "rails";
          }
        }
        this.levelView.playPlaceBlockAnimation(player, player.position, blockType, blockTypeAtPosition, () => {
          const entity = convertNameToEntity(blockType, position.x, position.y);
          if (entity) {
            this.levelEntity.spawnEntityAt(...entity);
          } else {
            this.levelModel.placeBlock(blockType, player);
            this.levelModel.computeFowPlane();
            this.levelView.updateFowGroup(this.levelModel.fowPlane);
            this.levelModel.computeShadingPlane();
            this.levelView.updateShadingGroup(this.levelModel.shadingPlane);
          }
          this.delayBy(200, () => {
            player.play('idle');
          });
          this.delayPlayerMoveBy(200, 400, () => {
            commandQueueItem.succeeded();
          });
        });
      } else {
        player.play('jumpUp', () => {
          // When it loops the first time, stop it and just play the idle
          player.stop();
          player.play('idle');
          this.delayBy(800, () => commandQueueItem.succeeded());
        });
      }
    } else {
      commandQueueItem.succeeded();
    }
  }

  placeBlockDirection(commandQueueItem: BaseCommand, blockType: string, direction: Direction) {
    const player = this.getEntity(commandQueueItem.target);

    if (!player) {
      return;
    }

    if (!this.levelModel.canPlaceBlockDirection(blockType, player, direction)) {
      player.play('punch', () => {
        player.play('idle');
        commandQueueItem.succeeded();
      });
      return;
    }

    const position = this.levelModel.getMoveDirectionPosition(player, direction);
    const placementPlane = this.levelModel.getPlaneToPlaceOn(position, player, blockType);

    const soundEffect = (placementPlane && this.levelModel.isBlockOfTypeOnPlane(position, 'lava', placementPlane))
      ? () => this.levelView.audioPlayer.play('fizz')
      : () => {};

    soundEffect();
    /*
    this.levelView.playPlaceBlockInFrontAnimation(player, player.position, player.facing, position, () => {
      this.levelModel.placeBlockDirection(blockType, placementPlane, player, direction);
      this.levelView.refreshGroundGroup();

      this.levelModel.computeFowPlane();
      this.levelView.updateFowGroup(this.levelModel.fowPlane);
      this.levelModel.computeShadingPlane();
      this.levelView.updateShadingGroup(this.levelModel.shadingPlane);
      soundEffect();

      this.delayBy(200, () => {
        this.levelView.playIdleAnimation(player.position, player.facing, false, player);
      });
      this.delayPlayerMoveBy(200, 400, () => {
        commandQueueItem.succeeded();
      });
    });*/
  }

  placeBlockForward(commandQueueItem: BaseCommand, blockType: string) {
    this.placeBlockDirection(commandQueueItem, blockType, Direction.North);
  }

  isType(target: string | number): boolean {
    return (typeof target === 'string') && (target !== 'Player' && target !== "PlayerAgent");
  }

  destroyEntity(commandQueueItem: BaseCommand, target?: string | number) {
    if (!target || !this.isType(target)) {
      // apply to all entities
      if (target === undefined) {
        const entities = this.levelEntity.entityMap;
        for (const value of entities) {
          const entity = value[1];
          const callbackCommand = new CallbackCommand(this, () => {}, entity.identifier, () => {}, () => {
            this.destroyEntity(callbackCommand, entity.identifier);
          });
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        }
        commandQueueItem.succeeded();
      } else if (typeof target === 'string') {
        this.addCommandRecord("destroy", target, commandQueueItem.repeat);
        const entity = this.getEntity(target);
        if (entity !== undefined) {
          entity.healthPoint = 1;
          entity.takeDamage(commandQueueItem);
        } else {
          commandQueueItem.succeeded();
        }
      }
    } else if (typeof target === 'string') {
      const entities = this.levelEntity.getEntitiesOfType(target);
      for (const entity of entities) {
        const callbackCommand = new CallbackCommand(this, () => {}, entity.identifier, () => {}, () => {
          this.destroyEntity(callbackCommand, entity.identifier);
        });
        entity.addCommand(callbackCommand, commandQueueItem.repeat);
      }
      commandQueueItem.succeeded();
    }
  }

  destroyBlock(_commandQueueItem: BaseCommand) {
    /*
    let player = this.getEntity(commandQueueItem.target);
    // if there is a destroyable block in front of the player
    if (this.levelModel.canDestroyBlockForward(player)) {
      let block = this.levelModel.actionPlane.getBlockAt(this.levelModel.getMoveForwardPosition(player));

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
    */
  }
}

class GameController {
  game: Phaser.Game;
  earlyLoadScene: EarlyLoadScene;
  levelRunnerScene: LevelRunnerScene;
  audioPlayer: AudioPlayer;
  assetRoot: string;
  private assetLoader: AssetLoader;
  config: GameControllerConfig;
  onScoreUpdate?: () => void;

  constructor(config: GameControllerConfig) {
    console.log('constructing a craft game');
    this.audioPlayer = config.audioPlayer;
    this.assetRoot = config.assetRoot;
    this.config = config;

    this.assetLoader = new AssetLoader(this);

    this.onScoreUpdate = config.onScoreUpdate;

    // Create the Phaser Scenes
    const sceneConfig: SceneConfig = {
      ...config,
      assetRoot: this.assetRoot,
      assetLoader: this.assetLoader,
      audioPlayer: this.audioPlayer,
      levelConfig: {
        ...(config.levelConfig || levels.aquatic10),
      },
    };

    // 'earlyLoad'
    this.earlyLoadScene = new EarlyLoadScene(sceneConfig);

    // 'levelRunner'
    this.levelRunnerScene = new LevelRunnerScene(sceneConfig);

    this.game = new Phaser.Game({
      fps: {
        forceSetTimeOut: config.forceSetTimeOut,
      },
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      type: Phaser.AUTO,
      mode: Phaser.Scale.RESIZE,
      parent: config.containerId,
      scene: [this.earlyLoadScene, this.levelRunnerScene],
      pixelArt: false,
      render: {
        antialias: true,
      },
    });

    console.log(this.game);
  }

  destroy() {
    this.game.scene.remove('earlyLoad');
    this.game.scene.remove('levelRunner');
    this.game.destroy(true);

    // Destroy the canvas, if it still exists
    const canvas = document
      .getElementById(this.config.containerId)
      ?.querySelector('canvas');
    canvas?.remove();
  }
}

export default GameController;
