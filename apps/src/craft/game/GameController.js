import CommandQueue from "./CommandQueue/CommandQueue.js";
import BaseCommand from "./CommandQueue/BaseCommand.js";
import DestroyBlockCommand from "./CommandQueue/DestroyBlockCommand.js";
import MoveForwardCommand from "./CommandQueue/MoveForwardCommand.js";
import TurnCommand from "./CommandQueue/TurnCommand.js";
import WhileCommand from "./CommandQueue/WhileCommand.js";
import IfBlockAheadCommand from "./CommandQueue/IfBlockAheadCommand.js";

import LevelModel from "./LevelMVC/LevelModel.js";
import LevelView from "./LevelMVC/LevelView.js";
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

    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1.5;
    this.initialSlowMotion = gameControllerConfig.customSlowMotion || this.assumedSlowMotion;

    this.playerDelayFactor = 1.0;

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

    this.levelModel = new LevelModel(this.levelData);
    this.levelView = new LevelView(this);
    this.specialLevelType = levelConfig.specialLevelType;

    this.game.state.start('levelRunner');
  }

  reset() {
    this.levelModel.reset();
    this.levelView.reset(this.levelModel);
    this.resettableTimers.forEach((timer) => {
      timer.stop(true);
    });
    this.resettableTimers.length = 0;
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
    this.game.load.start();
  }

  followingPlayer() {
    return !!this.levelData.gridDimensions;
  }

  update() {
      this.queue.tick();
      this.levelView.update();

      if (this.queue.isFinished()) {
          this.handleEndState();
      }
  }

  addCheatKeys() {
    this.game.input.keyboard.addKey(Phaser.Keyboard.TILDE).onUp.add(() => {
      this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(() => {
        var dummyFunc = function () {
          console.log("highlight move forward command.");
        };
        this.codeOrgAPI.moveForward(dummyFunc);
      });

      this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onUp.add(() => {
        var dummyFunc = function () {
          console.log("highlight turn right command.");
        };
        this.codeOrgAPI.turnRight(dummyFunc);
      });

      this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onUp.add(() => {
        var dummyFunc = function () {
          console.log("highlight turn left command.");
        };
        this.codeOrgAPI.turnLeft(dummyFunc);
      });

      this.game.input.keyboard.addKey(Phaser.Keyboard.P).onUp.add(() => {
        var dummyFunc = function () {
          console.log("highlight placeBlock command.");
        };
        this.codeOrgAPI.placeBlock(dummyFunc, "logOak");
      });

      this.game.input.keyboard.addKey(Phaser.Keyboard.D).onUp.add(() => {
        var dummyFunc = function () {
          console.log("highlight destroy block command.");
        };
        this.codeOrgAPI.destroyBlock(dummyFunc);
      });

      this.game.input.keyboard.addKey(Phaser.Keyboard.E).onUp.add(() => {
        var dummyFunc = function (result) {
          console.log(`Execute command list done: ${result} `);
        };
        this.codeOrgAPI.startAttempt(dummyFunc);
      });

      this.game.input.keyboard.addKey(Phaser.Keyboard.W).onUp.add(() => {
        var dummyFunc = function () {
          console.log("Execute While command list");
        };
        var blockType = "empty";
        var codeBlock = function () {
          this.GameController.codeOrgAPI.moveForward(function () {
            console.log("Execute While command move block");
          });
          this.GameController.codeOrgAPI.moveForward(function () {
            console.log("Execute While command move block2");
          });
          this.GameController.codeOrgAPI.turnLeft(function () {
            console.log("Execute While command turn");
          });
        };
        this.codeOrgAPI.whilePathAhead(dummyFunc, blockType, codeBlock);
      });
    });
  }

  handleEndState() {
      // TODO: go into success/failure animation? (or are we called by CodeOrg for that?)

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
  moveForward(commandQueueItem) {
    var player = this.levelModel.player,
      allFoundCreepers,
      groundType,
      jumpOff;

    if (this.levelModel.canMoveForward()) {
      let wasOnBlock = player.isOnBlock;
      this.levelModel.moveForward();
      // TODO: check for Lava, Creeper, water => play approp animation & call commandQueueItem.failed()

      jumpOff = wasOnBlock && wasOnBlock != player.isOnBlock;
      if(player.isOnBlock || jumpOff) {
        groundType = this.levelModel.actionPlane[this.levelModel.yToIndex(player.position[1]) + player.position[0]].blockType;
      } else {
        groundType = this.levelModel.groundPlane[this.levelModel.yToIndex(player.position[1]) + player.position[0]].blockType;
      }

      this.levelView.playMoveForwardAnimation(player.position, player.facing, jumpOff, player.isOnBlock, groundType, () => {
        this.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);

      //First arg is if we found a creeper
        allFoundCreepers = this.levelModel.isPlayerStandingNearCreeper();

        if (this.levelModel.isPlayerStandingInWater()) {
            this.levelView.playDrownFailureAnimation(player.position, player.facing, player.isOnBlock, () => {
              commandQueueItem.failed();
            } );
        } else if(this.levelModel.isPlayerStandingInLava()) {
          this.levelView.playBurnInLavaAnimation(player.position, player.facing, player.isOnBlock, () => {
            commandQueueItem.failed();
          } );
        } else {
          this.delayPlayerMoveBy(30, 200, () => {
            commandQueueItem.succeeded();
          });
        }
      });
    } else {
      if(this.levelModel.isForwardBlockOfType("creeper")) {
        this.levelView.playCreeperExplodeAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(), player.isOnBlock, () => {
          commandQueueItem.failed();
        });
      } else {
        this.levelView.playBumpAnimation(player.position, player.facing, false);
        this.delayPlayerMoveBy(400, 800, () => {
          commandQueueItem.succeeded();
        });
      }
    }
  }

  turn(commandQueueItem, direction) {
    if (direction == -1) {
      this.levelModel.turnLeft();
    }

    if (direction == 1) {
      this.levelModel.turnRight();
    }
    this.levelView.updatePlayerDirection(this.levelModel.player.position, this.levelModel.player.facing);

    this.delayPlayerMoveBy(200, 800, () => {
      commandQueueItem.succeeded();
    });

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
        switch(blockType){
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
        this.levelView.playExplosionAnimation(this.levelModel.player.position, this.levelModel.player.facing, destroyPosition, blockType, ()=>{}, true);
      } else if (block.isUsable) {
        switch (blockType) {
          case "sheep":
            // TODO: What to do with already sheered sheep?
            this.levelView.playShearAnimation(this.levelModel.player.position, this.levelModel.player.facing, destroyPosition, blockType, ()=>{});
            break;
        }
      }
    }
  }

  destroyBlock(commandQueueItem) {
    let player = this.levelModel.player;
    if (this.levelModel.canDestroyBlockForward()) {
      let block = this.levelModel.destroyBlockForward();

      if (block !== null) {
        let destroyPosition = block.position;
        let blockType = block.blockType;

        if (block.isDestroyable) {
          this.levelModel.computeShadingPlane();
          this.levelModel.computeFowPlane();
          switch(blockType){
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
      if(this.checkMinecartLevelEndAnimation() && blockType == "rail") {
        blockType = this.checkRailBlock(blockType);
      }

      if (blockTypeAtPosition !== "") {
        this.levelModel.destroyBlock(blockIndex);
      }
      if (this.levelModel.placeBlock(blockType)) {
        this.levelView.playPlaceBlockAnimation(this.levelModel.player.position, this.levelModel.player.facing, blockType, blockTypeAtPosition,  () => {
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
          this.delayBy(800, () => { commandQueueItem.succeeded(); });
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
        soundEffect = ()=>{};

    if (!this.levelModel.canPlaceBlockForward()) {
      this.levelView.playPunchAirAnimation(this.levelModel.player.position, this.levelModel.player.facing, this.levelModel.player.position, () => {
        this.levelView.playIdleAnimation(this.levelModel.player.position, this.levelModel.player.facing, false);
        commandQueueItem.succeeded();
      });
      return;
    }

    forwardPosition = this.levelModel.getMoveForwardPosition();
    placementPlane = this.levelModel.getPlaneToPlaceOn(forwardPosition);
    if(this.levelModel.isBlockOfTypeOnPlane(forwardPosition, "lava", placementPlane)) {
      soundEffect = ()=>{this.levelView.audioPlayer.play("fizz");};
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
      if(this.checkHouseBuiltEndAnimation()) {
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
      } else if(this.checkMinecartLevelEndAnimation()) {
        this.levelView.playMinecartAnimation(player.position, player.facing, player.isOnBlock,
            () => { commandQueueItem.succeeded(); }, this.levelModel.getMinecartTrack(), this.levelModel.getUnpoweredRails());
      } else if(this.checkTntAnimation()) {
        this.levelView.scaleShowWholeWorld(() => {});
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
          for(var i in tnt) {
            if (tnt[i].x === this.levelModel.player.position.x && tnt[i].y === this.levelModel.player.position.y) {
              this.levelModel.player.isOnBlock = false;
            }
            var surroundingBlocks = this.levelModel.getAllBorderingPositionNotOfType(tnt[i], "tnt");
            this.levelModel.destroyBlock(tnt[i]);
            for(var b = 1; b < surroundingBlocks.length; ++b) {
              if(surroundingBlocks[b][0]) {
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
            () => { commandQueueItem.succeeded(); });
      }
    } else {
      this.levelView.playFailureAnimation(player.position, player.facing, player.isOnBlock, () => {
        commandQueueItem.failed();
      });
    }
  }

  isPathAhead(blockType)  {
      return this.levelModel.isForwardBlockOfType(blockType);
  }

}

window.GameController = GameController;

export default GameController;
