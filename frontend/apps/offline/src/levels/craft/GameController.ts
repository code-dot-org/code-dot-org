import * as Phaser from 'phaser';

import AssetLoader from './AssetLoader';
import CommandQueue from './CommandQueue';
import type {Agent, Player} from './entities';
import {Direction} from './FacingDirection';
import LevelEntity from './level/LevelEntity';
import LevelModel from './level/LevelModel';
import LevelView from './level/LevelView';
import levels from './levels';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;

/**
 * The interface for the audio device we want passed into the controller.
 */
export interface AudioPlayer {
  /** Registers the given sound */
  register(options: {id: string; mp3: string; ogg: string});
  /** Plays the given sound */
  play(id: string);
}

export interface GameControllerConfig {
  /** The DOM id for the container to instantiate the game within */
  containerId: string;
  forceSetTimeOut: boolean;
  audioPlayer: AudioPlayer;
  assetRoot: string;
  afterAssetsLoaded: () => void;
  earlyLoadAssetPacks?: string[];
  earlyLoadNiceToHaveAssetPacks?: string[];
  onScoreUpdate?: () => void;
  customSlowMotion?: number;
}

// The Phaser Scene for the preloader
class EarlyLoadScene extends Phaser.Scene {
  protected assetLoader: AssetLoader;
  protected earlyLoadAssetPacks: string[];

  constructor({
    assetLoader,
    earlyLoadAssetPacks,
  }: {
    assetLoader: AssetLoader;
    earlyLoadAssetPacks: string[];
  }) {
    super('earlyLoad');

    this.assetLoader = assetLoader;
    this.earlyLoadAssetPacks = earlyLoadAssetPacks;
  }

  updateProgress(value) {
    // Update the width of the progress bar based on the loading progress
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1); // Green color for the progress
    this.progressBar.fillRect(0, 390, 400 * value, 10); // Update the progress bar width

    // Optional: Update the loading percentage text
    const percent = Math.floor(value * 100);
    this.loadingText.setText(`Loading... ${percent}%`);
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
        fill: '#ffffff',
      })
      .setOrigin(1.0, 1.0);

    // Register the progress event
    this.load.on('progress', this.updateProgress, this);

    // Don't let state change stomp essential asset downloads in progress
    this.load.resetLocked = true;
    this.assetLoader.loadPacks(this, this.earlyLoadAssetPacks);
  }

  create() {
    // Start the level
    this.scene.start('levelRunner');
  }
}

// The Phaser Scene for the game itself
class LevelRunnerScene extends Phaser.Scene {
  protected assetLoader: AssetLoader;
  audioPlayer: AudioPlayer;

  constructor({
    assetRoot,
    assetLoader,
    audioPlayer,
    levelConfig,
    controller,
    customSlowMotion,
  }) {
    super('levelRunner');

    this.queue = new CommandQueue(this);
    this.assetLoader = assetLoader;
    this.audioPlayer = audioPlayer;
    this.controller = controller;
    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1;
    this.initialSlowMotion = customSlowMotion || this.assumedSlowMotion;
    this.tweenTimeScale = 1.5 / this.initialSlowMotion;
    this.playerDelayFactor = 1.0;
    this.assetRoot = assetRoot;
    this.levelData = Object.freeze({...levelConfig});
  }

  /**
   * Is this one of those level types in which the player is controlled by arrow
   * keys rather than by blocks?
   */
  getIsDirectPlayerControl(): boolean {
    return this.levelData.isEventLevel || this.levelData.isAgentLevel;
  }

  originalFpsToScaled(fps: number): number {
    const realFps = fps * this.assumedSlowMotion;
    return realFps / (this.time.scale || 1);
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

  loadLevel(levelConfig: LevelData) {
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
  }

  scaleFromOriginal() {
    const [newWidth, newHeight] = this.levelData.gridDimensions || [10, 10];
    const [originalWidth, originalHeight] = [10, 10];
    return [newWidth / originalWidth, newHeight / originalHeight];
  }

  preload() {
    console.log('Level Runner preload');
    this.load.resetLocked = true;
    this.time.advancedTiming = this.DEBUG;
    this.scene.disableVisibilityChange = true;
    this.assetLoader.loadPacks(
      this,
      this.levelData?.assetPacks?.beforeLoad || [],
    );
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

    Object.keys(keysToMovementState).forEach(key => {
      const movementState = keysToMovementState[key];
      const keyCode = parseInt(key, 10);

      // Create a key from the keyCode
      const keyObj = this.input.keyboard.addKey(keyCode);

      // Listen for the key press (down)
      keyObj.on('down', () => {
        if (editableElementSelected()) {
          return;
        }
        this.player.movementState = movementState;
        this.player.updateMovement();
      });

      // Listen for the key release (up)
      keyObj.on('up', () => {
        if (editableElementSelected()) {
          return;
        }
        if (this.player.movementState === movementState) {
          this.player.movementState = -1;
        }
        this.player.updateMovement();
      });

      // Optionally, you can call removeKeyCapture, but Phaser 3 handles key events globally, so this may not be necessary.
      // this.input.keyboard.removeKeyCapture(keyCode);
    });
  }

  create() {
    console.log('Level Runner create');
    this.loadLevel(this.levelData);

    this.levelView.create(this.levelModel);
    this.time.slowMotion = this.initialSlowMotion;
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
}

class GameController {
  game: Phaser.Game;
  earlyLoadScene: EarlyLoadScene;
  levelRunnerScene: LevelRunnerScene;
  audioPlayer: AudioPlayer;
  assetRoot: string;
  levelModel: LevelModel;
  levelView: LevelView;
  private specialLevelType?: string;
  queue: CommandQueue;
  private onCompleteCallback?: () => void;
  private afterAssetsLoaded?: () => void;
  private assetLoader: AssetLoader;
  private earlyLoadAssetPacks: string[];
  private earlyLoadNiceToHaveAssetPacks: string[];
  private resettableTimers: number[] = [];
  private timeouts: number[] = [];
  private timeout: number = 0;
  private score: number = 0;
  private useScore: boolean = false;
  private scoreText?: string;
  private onScoreUpdate?: () => void;
  private events: object[] = [];
  private assumedSlowMotion: number;
  private initialSlowMotion: number;
  tweenTimeScale: number;
  private playerDelayFactor: number = 1.0;
  private dayNightCycle: boolean = false;
  private player?: Player;
  private agent?: Agent;
  private timerSprite?: object;
  DEBUG: boolean = false;

  constructor(config: GameControllerConfig) {
    console.log('constructing a craft game');
    this.audioPlayer = config.audioPlayer;
    this.assetRoot = config.assetRoot;
    this.config = config;

    this.afterAssetsLoaded = config.afterAssetsLoaded;
    this.earlyLoadAssetPacks = config.earlyLoadAssetPacks || [];
    this.earlyLoadNiceToHaveAssetPacks =
      config.earlyLoadNiceToHaveAssetPacks || [];
    this.assetLoader = new AssetLoader(this);

    this.onScoreUpdate = config.onScoreUpdate;

    // Create the Phaser Scenes
    const sceneConfig = {
      assetRoot: this.assetRoot,
      assetLoader: this.assetLoader,
      audioPlayer: this.audioPlayer,
      earlyLoadAssetPacks: this.earlyLoadAssetPacks,
      controller: this,
      customSlowMotion: config.customSlowMotion,
      levelConfig: {
        ...levels.aquatic10,
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
