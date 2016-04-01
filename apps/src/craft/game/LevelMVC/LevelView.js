import FacingDirection from "./FacingDirection.js";

export default class LevelView {
  constructor(controller) {
    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;
    this.game = controller.game;

    this.baseShading = null;

    this.playerSprite = null;
    this.playerGhost = null;        // The ghost is a copy of the player sprite that sits on top of everything at 20% opacity, so the player can go under trees and still be seen.
    this.selectionIndicator = null;

    this.groundPlane = null;
    this.shadingPlane = null;
    this.actionPlane = null;
    this.fluffPlane = null;
    this.fowPlane = null;

    this.miniBlocks = {
      "dirt": ["Miniblocks", 0, 5],
      "dirtCoarse": ["Miniblocks", 6, 11],
      "sand": ["Miniblocks", 12, 17],
      "gravel": ["Miniblocks", 18, 23],
      "bricks": ["Miniblocks", 24, 29],
      "logAcacia": ["Miniblocks", 30, 35],
      "logBirch": ["Miniblocks", 36, 41],
      "logJungle": ["Miniblocks", 42, 47],
      "logOak": ["Miniblocks", 48, 53],
      "logSpruce": ["Miniblocks", 54, 59],
      "planksAcacia": ["Miniblocks", 60, 65],
      "planksBirch": ["Miniblocks", 66, 71],
      "planksJungle": ["Miniblocks", 72, 77],
      "planksOak": ["Miniblocks", 78, 83],
      "planksSpruce": ["Miniblocks", 84, 89],
      "cobblestone": ["Miniblocks", 90, 95],
      "sandstone": ["Miniblocks", 96, 101],
      "wool": ["Miniblocks", 102, 107],
      "redstoneDust": ["Miniblocks", 108, 113],
      "lapisLazuli": ["Miniblocks", 114, 119],
      "ingotIron": ["Miniblocks", 120, 125],
      "ingotGold": ["Miniblocks", 126, 131],
      "emerald": ["Miniblocks", 132, 137],
      "diamond": ["Miniblocks", 138, 143],
      "coal": ["Miniblocks", 144, 149],
      "bucketWater": ["Miniblocks", 150, 155],
      "bucketLava": ["Miniblocks", 156, 161],
      "gunPowder": ["Miniblocks", 162, 167],
      "wheat": ["Miniblocks", 168, 173],
      "potato": ["Miniblocks", 174, 179],
      "carrots": ["Miniblocks", 180, 185],

      "sheep": ["Miniblocks", 102, 107]
    };

    this.blocks = {
      "bedrock": ["blocks", "Bedrock", -13, 0],
      "bricks": ["blocks", "Bricks", -13, 0],
      "oreCoal": ["blocks", "Coal_Ore", -13, 0],
      "dirtCoarse": ["blocks", "Coarse_Dirt", -13, 0],
      "cobblestone": ["blocks", "Cobblestone", -13, 0],
      "oreDiamond": ["blocks", "Diamond_Ore", -13, 0],
      "dirt": ["blocks", "Dirt", -13, 0],
      "oreEmerald": ["blocks", "Emerald_Ore", -13, 0],
      "farmlandWet": ["blocks", "Farmland_Wet", -13, 0],
      "flowerDandelion": ["blocks", "Flower_Dandelion", -13, 0],
      "flowerOxeeye": ["blocks", "Flower_Oxeeye", -13, 0],
      "flowerRose": ["blocks", "Flower_Rose", -13, 0],
      "glass": ["blocks", "Glass", -13, 0],
      "oreGold": ["blocks", "Gold_Ore", -13, 0],
      "grass": ["blocks", "Grass", -13, 0],
      "gravel": ["blocks", "Gravel", -13, 0],
      "oreIron": ["blocks", "Iron_Ore", -13, 0],
      "oreLapis": ["blocks", "Lapis_Ore", -13, 0],
      "lava": ["blocks", "Lava_0", -13, 0],
      "logAcacia": ["blocks", "Log_Acacia", -13, 0],
      "logBirch": ["blocks", "Log_Birch", -13, 0],
      "logJungle": ["blocks", "Log_Jungle", -13, 0],
      "logOak": ["blocks", "Log_Oak", -13, 0],
      "logSpruce": ["blocks", "Log_Spruce", -13, 0],
      //"obsidian": ["blocks", "Obsidian", -13, 0],
      "planksAcacia": ["blocks", "Planks_Acacia", -13, 0],
      "planksBirch": ["blocks", "Planks_Birch", -13, 0],
      "planksJungle": ["blocks", "Planks_Jungle", -13, 0],
      "planksOak": ["blocks", "Planks_Oak", -13, 0],
      "planksSpruce": ["blocks", "Planks_Spruce", -13, 0],
      "oreRedstone": ["blocks", "Redstone_Ore", -13, 0],
      "sand": ["blocks", "Sand", -13, 0],
      "sandstone": ["blocks", "Sandstone", -13, 0],
      "stone": ["blocks", "Stone", -13, 0],
      "tnt": ["tnt", "TNTexplosion0", -80, -58],
      "water": ["blocks", "Water_0", -13, 0],
      "wool": ["blocks", "Wool_White", -13, 0],
      "wool_orange": ["blocks", "Wool_Orange", -13, 0],

      "leavesAcacia": ["leavesAcacia", "Leaves0", -42, 80],
      "leavesBirch": ["leavesBirch", "Leaves0", -100, -10],
      "leavesJungle": ["leavesJungle", "Leaves0", -69, 43],
      "leavesOak": ["leavesOak", "Leaves0", -100, 0],
      "leavesSpruce": ["leavesSpruce", "Leaves0", -76, 60],

      "watering": ["blocks", "Water_0", -13, 0],
      "cropWheat": ["blocks", "Wheat0", -13, 0],
      "torch": ["torch", "Torch0", -13, 0],

      "tallGrass": ["tallGrass", "", -13, 0],

      "lavaPop": ["lavaPop", "LavaPop01", -13, 0],
      "fire": ["fire", "", -11, 135],
      "bubbles": ["bubbles", "", -11, 135],
      "explosion": ["explosion", "", -70, 60],

      "door": ["door", "", -12, -15],

      "railsBottomLeft": ["blocks", "Rails_BottomLeft", -13, 0],
      "railsBottomRight": ["blocks", "Rails_BottomRight", -13, 0],
      "railsHorizontal": ["blocks", "Rails_Horizontal", -13, 0],
      "railsTopLeft": ["blocks", "Rails_TopLeft", -13, 0],
      "railsTopRight": ["blocks", "Rails_TopRight", -13, 0],
      "railsUnpoweredHorizontal": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],
      "railsUnpoweredVertical": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsVertical": ["blocks", "Rails_Vertical", -13, -0],
      "railsPoweredHorizontal": ["blocks", "Rails_PoweredHorizontal", -13, 0],
      "railsPoweredVertical": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsRedstoneTorch": ["blocks", "Rails_RedstoneTorch", -12, 9],
    };

    this.actionPlaneBlocks = [];
    this.toDestroy = [];
    this.resettableTweens = [];
  }

  yToIndex(y) {
    return this.controller.levelModel.yToIndex(y);
  }

  create(levelModel) {
    this.createPlanes();
    this.reset(levelModel);
  }

  reset(levelModel) {
    let player = levelModel.player;

    this.resettableTweens.forEach((tween) => {
      tween.stop(false);
    });
    this.resettableTweens.length = 0;

    this.resetPlanes(levelModel);
    this.preparePlayerSprite(player.name);
    this.playerSprite.animations.stop();
    this.updateShadingPlane(levelModel.shadingPlane);
    this.updateFowPlane(levelModel.fowPlane);
    this.setPlayerPosition(player.position[0], player.position[1], player.isOnBlock);
    this.setSelectionIndicatorPosition(player.position[0], player.position[1]);
    this.selectionIndicator.visible = true;
    this.playIdleAnimation(player.position, player.facing, player.isOnBlock);

    if (this.controller.followingPlayer()) {
      this.game.world.setBounds(0, 0, levelModel.planeWidth * 40, levelModel.planeHeight * 40);
      this.game.camera.follow(this.playerSprite);
      this.game.world.scale.x = 1;
      this.game.world.scale.y = 1;
    }
  }

  update() {
    var i;

    for (i = 0; i < this.toDestroy.length; ++i) {
      this.toDestroy[i].destroy();
    }
    this.toDestroy = [];

    if (this.playerGhost) {
      this.playerGhost.frame = this.playerSprite.frame;
      this.playerGhost.z = 1000;
    }
  }

  render() {
    this.actionPlane.sort('sortOrder');
    this.fluffPlane.sort('z');
  }

  getDirectionName(facing) {
    var direction;

    switch (facing) {
      case FacingDirection.Up:
        direction = "_up";
        break;

      case FacingDirection.Right:
        direction = "_right";
        break;

      case FacingDirection.Down:
        direction = "_down";
        break;

      case FacingDirection.Left:
        direction = "_left";
        break;
    }

    return direction;
  }

  updatePlayerDirection(position, facing) {
    let direction = this.getDirectionName(facing);

    this.setSelectionIndicatorPosition(position[0], position[1]);
    this.playScaledSpeed(this.playerSprite.animations, "idle" + direction);
  }

  playPlayerAnimation(animationName, position, facing, isOnBlock) {
    let direction = this.getDirectionName(facing);
    this.playerSprite.sortOrder = this.yToIndex(position[1]) + 5;

    let animName = animationName + direction;
    return this.playScaledSpeed(this.playerSprite.animations, animName);
  }

  playIdleAnimation(position, facing, isOnBlock) {
    this.playPlayerAnimation("idle", position, facing, isOnBlock);
  }

  scaleShowWholeWorld(completionHandler) {
    var [scaleX, scaleY] = this.controller.scaleFromOriginal();
    var scaleTween = this.addResettableTween(this.game.world.scale).to({
      x: 1 / scaleX,
      y: 1 / scaleY
    }, 1000, Phaser.Easing.Exponential.Out);

    this.game.camera.unfollow();

    var positionTween = this.addResettableTween(this.game.camera).to({
      x: 0,
      y: 0
    }, 1000, Phaser.Easing.Exponential.Out);

    scaleTween.onComplete.addOnce(() => {
      completionHandler();
    });

    positionTween.start();
    scaleTween.start();
  }

  playSuccessAnimation(position, facing, isOnBlock, completionHandler) {
    this.controller.delayBy(250, () => {
      this.audioPlayer.play("success");
      this.onAnimationEnd(this.playPlayerAnimation("celebrate", position, facing, isOnBlock), () => {
        completionHandler();
      });
    });
  }

  playFailureAnimation(position, facing, isOnBlock, completionHandler) {
    this.controller.delayBy(500, () => {
      this.audioPlayer.play("failure");
      this.onAnimationEnd(this.playPlayerAnimation("fail", position, facing, isOnBlock), () => {
        this.controller.delayBy(800, completionHandler);
      });
    });
  }

  playBumpAnimation(position, facing, isOnBlock) {
    var animation = this.playPlayerAnimation("bump", position, facing, isOnBlock);
    animation.onComplete.add(()=>{
      this.playIdleAnimation(position, facing, isOnBlock);
    });
    return animation;
  }

  playDrownFailureAnimation(position, facing, isOnBlock, completionHandler) {
      var sprite,
          tween;

      this.playPlayerAnimation("fail", position, facing, isOnBlock);
      this.createBlock(this.fluffPlane, position[0], position[1], "bubbles");

      sprite = this.fluffPlane.create(0, 0, "finishOverlay");
      var [scaleX, scaleY] = this.controller.scaleFromOriginal();
      sprite.scale.x = scaleX;
      sprite.scale.y = scaleY;
      sprite.alpha = 0;
      if (this.controller.canUseTints()) {
        sprite.tint = 0x324bff;
      }

      tween = this.addResettableTween(sprite).to({
          alpha: 0.5,
      }, 200, Phaser.Easing.Linear.None);

      tween.onComplete.add(() => {
          completionHandler();
      });

      tween.start();
  }

  playBurnInLavaAnimation(position, facing, isOnBlock, completionHandler) {
    var sprite,
        tween;

    this.playPlayerAnimation("jumpUp", position, facing, isOnBlock);
    this.createBlock(this.fluffPlane, position[0], position[1], "fire");

    sprite = this.fluffPlane.create(0, 0, "finishOverlay");
    var [scaleX, scaleY] = this.controller.scaleFromOriginal();
    sprite.scale.x = scaleX;
    sprite.scale.y = scaleY;
    sprite.alpha = 0;
    if (this.controller.canUseTints()) {
      sprite.tint = 0xd1580d;
    }

    tween = this.addResettableTween(sprite).to({
      alpha: 0.5,
    }, 200, Phaser.Easing.Linear.None);

    tween.onComplete.add(() => {
      completionHandler();
    });

    tween.start();
  }

  playDestroyTntAnimation(position, facing, isOnBlock, tntArray, newShadingPlaneData, completionHandler) {
    var block,
        lastAnimation;
    if (tntArray.length === 0) {
      completionHandler();
      return;
    }

    this.audioPlayer.play("fuse");
    for(var tnt in tntArray) {
        block = this.actionPlaneBlocks[this.coordinatesToIndex(tntArray[tnt])];
        lastAnimation = this.playScaledSpeed(block.animations, "explode");
    }

    this.onAnimationEnd(lastAnimation, () => {
      this.audioPlayer.play("explode");
      completionHandler();
    });
  }


  playCreeperExplodeAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
    this.controller.delayBy(180, () => {
      //this.onAnimationLoopOnce(
      this.playPlayerAnimation("bump", position, facing, false).onComplete.add(() => {
        //add creeper windup sound
        this.audioPlayer.play("fuse");
        this.playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler, this);

        this.controller.delayBy(200, ()=>{
          this.onAnimationLoopOnce(this.playPlayerAnimation("jumpUp", position, facing, false), () => {
            this.playIdleAnimation(position, facing, isOnBlock);
          });
        });
      });
    });
  }

  playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
    let direction = this.getDirectionName(facing);

    let blockIndex = (this.yToIndex(destroyPosition[1])) + destroyPosition[0];
    let blockToExplode = this.actionPlaneBlocks[blockIndex];

    var creeperExplodeAnimation = blockToExplode.animations.getAnimation("explode");
    creeperExplodeAnimation.onComplete.add(() => {
      var borderingPositions;
      blockToExplode.kill();
      this.playExplosionAnimation(position, facing, destroyPosition, isOnBlock, () => {
        this.controller.delayBy(100, () => {
          this.playFailureAnimation(position, facing, false, completionHandler);
        });
      }, false);
      this.audioPlayer.play("explode");
      this.playExplosionCloudAnimation(destroyPosition);
    });

    creeperExplodeAnimation.play();
  }

  playExplosionCloudAnimation(position){
    this.createBlock(this.fluffPlane, position[0], position[1], "explosion");
  }


  coordinatesToIndex(coordinates) {
    return (this.yToIndex(coordinates[1])) + coordinates[0];
  }

  playMinecartTurnAnimation(position, facing, isOnBlock, completionHandler, turnDirection) {
    var animation = this.playPlayerAnimation("mineCart_turn" + turnDirection, position, FacingDirection.Down, false);
    return animation;
  }

  playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed) {
    var animation,
        tween;

    //if we loop the sfx that might be better?
    this.audioPlayer.play("minecart");
    this.playPlayerAnimation("mineCart", position, facing, false);
    tween = this.addResettableTween(this.playerSprite).to({
      x: (-18 + 40 * nextPosition[0]),
      y: (-32 + 40 * nextPosition[1]),
    }, speed, Phaser.Easing.Linear.None);
    tween.start();
    this.playerSprite.sortOrder = this.yToIndex(nextPosition[1]) + 5;

    return tween;
  }


  activateUnpoweredRails(unpoweredRails) {
    for(var railIndex = 0; railIndex < unpoweredRails.length; railIndex += 2) {
      var rail = unpoweredRails[railIndex + 1];
      var position = unpoweredRails[railIndex];
      this.createActionPlaneBlock(position, rail);
    }
  }



  playMinecartAnimation(position, facing, isOnBlock, completionHandler, minecartTrack, unpoweredRails) {
    var animation;
    this.track = minecartTrack;
    this.i = 0;

    //start at 3,2
    this.setPlayerPosition(3, 2, isOnBlock);
    position = [3, 2];

    animation = this.playLevelEndAnimation(position, facing, isOnBlock, completionHandler, false);

    animation.onComplete.add(() => {
      this.activateUnpoweredRails(unpoweredRails);
      this.playTrack(position, facing, isOnBlock, completionHandler, minecartTrack);
    });
  }

  playTrack(position, facing, isOnBlock, completionHandler, minecartTrack) {
    if(this.i < this.track.length) {
      var direction,
          arraydirection = this.track[this.i][0],
          nextPosition = this.track[this.i][1],
          speed = this.track[this.i][3];
      facing = this.track[this.i][2];

      //turn
      if(arraydirection.substring(0, 4) === "turn") {
        direction = arraydirection.substring(5);
        this.playMinecartTurnAnimation(position, facing, isOnBlock, completionHandler, direction).onComplete.add(() => {
          this.playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed).onComplete.add(() => {
            position = nextPosition;
            this.playTrack(position, facing, isOnBlock, completionHandler, minecartTrack);
          });
        });
      } else {
        this.playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed).onComplete.add(() => {
          this.playTrack(position, facing, isOnBlock, completionHandler, minecartTrack);
        });
      }
      this.i++;
    } else {
      this.playSuccessAnimation(position, facing, isOnBlock, function(){});
      completionHandler();
    }
  }

  addHouseBed(bottomCoordinates) {
    //Temporary, will be replaced by bed blocks
    var bedTopCoordinate = (bottomCoordinates[1] - 1);
    var sprite = this.actionPlane.create(38 * bottomCoordinates[0], 35 * bedTopCoordinate, "bed");
    sprite.sortOrder = this.yToIndex(bottomCoordinates[1]);
  }

  addDoor(coordinates) {
    var sprite;
    let toDestroy = this.actionPlaneBlocks[this.coordinatesToIndex(coordinates)];
    this.createActionPlaneBlock(coordinates, "door");
    //Need to grab the correct blocktype from the action layer
    //And use that type block to create the ground block under the door
    sprite = this.createBlock(this.groundPlane, coordinates[0], coordinates[1], "wool_orange");
    toDestroy.kill();
    sprite.sortOrder = this.yToIndex(6);
  }

  playSuccessHouseBuiltAnimation(position, facing, isOnBlock, createFloor, houseObjectPositions, completionHandler, updateScreen) {
    //fade screen to white
    //Add house blocks
    //fade out of white
    //Play success animation on player.
    var tweenToW,
        tweenWToC;

    tweenToW = this.playLevelEndAnimation(position, facing, isOnBlock, () => {
      this.controller.delayBy(4000, completionHandler);
    }, true);
    tweenToW.onComplete.add(() => {
      this.audioPlayer.play("houseSuccess");
      //Change house ground to floor
      var xCoord;
      var yCoord;
      var sprite;

      for(var i = 0; i < createFloor.length; ++i) {
        xCoord = createFloor[i][1];
        yCoord = createFloor[i][2];
        /*this.groundPlane[this.coordinatesToIndex([xCoord,yCoord])].kill();*/
        sprite = this.createBlock(this.groundPlane, xCoord, yCoord, "wool_orange");
        sprite.sortOrder = this.yToIndex(yCoord);
      }

      this.addHouseBed(houseObjectPositions[0]);
      this.addDoor(houseObjectPositions[1]);
      this.groundPlane.sort('sortOrder');
      updateScreen();
    });
  }

  //Tweens in and then out of white. returns the tween to white for adding callbacks
  playLevelEndAnimation(position, facing, isOnBlock, completionHandler, playSuccessAnimation) {
    var sprite,
        tweenToW,
        tweenWToC;

    sprite = this.fluffPlane.create(0, 0, "finishOverlay");
    var [scaleX, scaleY] = this.controller.scaleFromOriginal();
    sprite.scale.x = scaleX;
    sprite.scale.y = scaleY;
    sprite.alpha = 0;

    tweenToW = this.tweenToWhite(sprite);
    tweenWToC = this.tweenFromWhiteToClear(sprite);

    tweenToW.onComplete.add(() => {
      this.selectionIndicator.visible = false;
      this.setPlayerPosition(position[0], position[1], isOnBlock);
      tweenWToC.start();
    });
    if(playSuccessAnimation) {
      tweenWToC.onComplete.add(() => {
        this.playSuccessAnimation(position, facing, isOnBlock, completionHandler);
      });
    }
    tweenToW.start();

    return tweenToW;
  }
  tweenFromWhiteToClear(sprite) {
    var tweenWhiteToClear;

    tweenWhiteToClear = this.addResettableTween(sprite).to({
      alpha: 0.0,
    }, 700, Phaser.Easing.Linear.None);
    return tweenWhiteToClear;
  }

  tweenToWhite(sprite){
    var tweenToWhite;

    tweenToWhite = this.addResettableTween(sprite).to({
      alpha: 1.0,
    }, 300, Phaser.Easing.Linear.None);
    return tweenToWhite;
  }

  playBlockSound(groundType) {
    var oreString = groundType.substring(0, 3);
    if(groundType === "stone" || groundType === "cobblestone" || groundType === "bedrock" ||
        oreString === "ore" || groundType === "bricks") {
      this.audioPlayer.play("stepStone");
    } else if(groundType === "grass" || groundType === "dirt" || groundType === "dirtCoarse" ||
        groundType == "wool_orange" || groundType == "wool") {
      this.audioPlayer.play("stepGrass");
    } else if(groundType === "gravel") {
      this.audioPlayer.play("stepGravel");
    } else if(groundType === "farmlandWet") {
      this.audioPlayer.play("stepFarmland");
    } else{
      this.audioPlayer.play("stepWood");
    }
  }

  playMoveForwardAnimation(position, facing, shouldJumpDown, isOnBlock, groundType, completionHandler) {
    var tween,
        oldPosition,
        newPosVec,
        animName,
        yOffset = -32;

    //stepping on stone sfx
    this.playBlockSound(groundType);

    let direction = this.getDirectionName(facing);

    this.setSelectionIndicatorPosition(position[0], position[1]);
    //make sure to render high for when moving up after placing a block
    var zOrderYIndex = position[1] + (facing === FacingDirection.Up ? 1 : 0);
    this.playerSprite.sortOrder = this.yToIndex(zOrderYIndex) + 5;
    oldPosition = [Math.trunc((this.playerSprite.position.x + 18)/ 40), Math.ceil((this.playerSprite.position.y+ 32) / 40)];
    newPosVec = [position[0] - oldPosition[0], position[1] - oldPosition[1]];

    //change offset for moving on top of blocks
    if(isOnBlock) {
      yOffset -= 22;
    }

    if (!shouldJumpDown) {
      animName = "walk" + direction;
      this.playScaledSpeed(this.playerSprite.animations, animName);
      tween = this.addResettableTween(this.playerSprite).to({
        x: (-18 + 40 * position[0]),
        y: (yOffset + 40 * position[1])
      }, 200, Phaser.Easing.Linear.None);
    } else {
      animName = "jumpDown" + direction;
      this.playScaledSpeed(this.playerSprite.animations, animName);
      tween = this.addResettableTween(this.playerSprite).to({
        x: [-18 + 40 * oldPosition[0], -18 + 40 * (oldPosition[0] + newPosVec[0]), -18 + 40 * position[0]],
        y: [-32 + 40 * oldPosition[1], -32 + 40 * (oldPosition[1] + newPosVec[1]) - 50, -32 + 40 * position[1]]
      }, 300, Phaser.Easing.Linear.None).interpolation((v, k) => {
        return Phaser.Math.bezierInterpolation(v, k);
      });

      tween.onComplete.add(() => {
        this.audioPlayer.play("fall");
      });
    }

    tween.onComplete.add(() => {
      completionHandler();
    });

    tween.start();

    return tween;
  }

  playPlayerJumpDownVerticalAnimation(position, direction) {
    var animName = "jumpDown" + this.getDirectionName(direction);
    this.playScaledSpeed(this.playerSprite.animations, animName);
    var tween = this.addResettableTween(this.playerSprite).to({
      x: [-18 + 40 * position[0], -18 + 40 * position[0], -18 + 40 * position[0]],
      y: [-32 + 40 * position[1], -32 + 40 * position[1] - 50, -32 + 40 * position[1]]
    }, 300, Phaser.Easing.Linear.None).interpolation((v, k) => {
      return Phaser.Math.bezierInterpolation(v, k);
    });
    tween.onComplete.addOnce(() => {
      this.audioPlayer.play("fall");
    });
    tween.start();
  }

  playPlaceBlockAnimation(position, facing, blockType, blockTypeAtPosition, completionHandler) {
    var jumpAnimName;
    let blockIndex = this.yToIndex(position[1]) + position[0];

    if (blockType === "cropWheat" || blockType === "torch" || blockType.substring(0, 5) === "rails") {
      this.setSelectionIndicatorPosition(position[0], position[1]);

      var signalDetacher = this.playPlayerAnimation("punch", position, facing, false).onComplete.add(() => {
        var sprite;
        signalDetacher.detach();
        let blockIndex = (this.yToIndex(position[1])) + position[0];
        sprite = this.createBlock(this.actionPlane, position[0], position[1], blockType);

        if (sprite) {
          sprite.sortOrder = this.yToIndex(position[1]);
        }

        this.actionPlaneBlocks[blockIndex] = sprite;
        completionHandler();
      });
    } else {
      this.audioPlayer.play("placeBlock");

      let direction = this.getDirectionName(facing);
      this.setSelectionIndicatorPosition(position[0], position[1]);

      jumpAnimName = "jumpUp" + direction;

      if(blockTypeAtPosition !== "") {
        this.playExplosionAnimation(position, facing, position, blockTypeAtPosition, (()=>{}), false);
      }

      this.playScaledSpeed(this.playerSprite.animations, jumpAnimName);
      var placementTween = this.addResettableTween(this.playerSprite).to({
        y: (-55 + 40 * position[1])
      }, 125, Phaser.Easing.Cubic.EaseOut);

      placementTween.onComplete.addOnce(() => {
        placementTween = null;

        if (blockTypeAtPosition !== "") {
          this.actionPlaneBlocks[blockIndex].kill();
        }
        var sprite = this.createBlock(this.actionPlane, position[0], position[1], blockType);

        if (sprite) {
          sprite.sortOrder = this.yToIndex(position[1]);
        }

        this.actionPlaneBlocks[blockIndex] = sprite;
        completionHandler();
      });
      placementTween.start();
    }
  }

  playPlaceBlockInFrontAnimation(playerPosition, facing, blockPosition, plane, blockType, completionHandler) {
    this.setSelectionIndicatorPosition(blockPosition[0], blockPosition[1]);

    this.playPlayerAnimation("punch", playerPosition, facing, false).onComplete.addOnce(() => {
      if (plane === this.controller.levelModel.actionPlane) {
        this.createActionPlaneBlock(blockPosition, blockType);
      } else {
        // re-lay ground tiles based on model
        this.refreshGroundPlane();
      }
      completionHandler();
    });
  }

  createActionPlaneBlock(position, blockType) {
    let blockIndex = (this.yToIndex(position[1])) + position[0];
    var sprite = this.createBlock(this.actionPlane, position[0], position[1], blockType);

    if (sprite) {
      sprite.sortOrder = this.yToIndex(position[1]);
    }

    this.actionPlaneBlocks[blockIndex] = sprite;
  }

  playShearAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
    let blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
    let blockToShear = this.actionPlaneBlocks[blockIndex];

    blockToShear.animations.stop(null, true);
    this.onAnimationLoopOnce(this.playScaledSpeed(blockToShear.animations, "used"), () => {
      this.playScaledSpeed(blockToShear.animations, "face");
    });

    this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
  }

  playShearSheepAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
    let direction = this.getDirectionName(facing);
    this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);

    this.onAnimationEnd(this.playPlayerAnimation("punch", playerPosition, facing, false), () => {
      let blockIndex = (this.yToIndex(destroyPosition[1])) + destroyPosition[0];
      let blockToShear = this.actionPlaneBlocks[blockIndex];

      blockToShear.animations.stop(null, true);
      this.onAnimationLoopOnce(this.playScaledSpeed(blockToShear.animations, "used"), () => {
        this.playScaledSpeed(blockToShear.animations, "face");
      });

      this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
    });
  }

  playDestroyBlockAnimation(playerPosition, facing, destroyPosition, blockType, newShadingPlaneData, newFowPlaneData, completionHandler) {
    this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);

    var playerAnimation =
        blockType.match(/(ore|stone|clay|bricks|bedrock)/) ? "mine" : "punchDestroy";
    this.playPlayerAnimation(playerAnimation, playerPosition, facing, false);
    this.playMiningParticlesAnimation(facing, destroyPosition);
    this.playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, newShadingPlaneData, newFowPlaneData, completionHandler);
  }


  playPunchDestroyAirAnimation(playerPosition, facing, destroyPosition, completionHandler) {
    this.playPunchAnimation(playerPosition, facing, destroyPosition, "punchDestroy", completionHandler);
  }

  playPunchAirAnimation(playerPosition, facing, destroyPosition, completionHandler) {
    this.playPunchAnimation(playerPosition, facing, destroyPosition, "punch", completionHandler);
  }

  playPunchAnimation(playerPosition, facing, destroyPosition, animationType, completionHandler) {
    this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);
    this.onAnimationEnd(this.playPlayerAnimation(animationType, playerPosition, facing, false), () => {
      completionHandler();
    });
  }

  playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, newShadingPlaneData, newFowPlaneData, completionHandler) {
    let blockIndex = (this.yToIndex(destroyPosition[1])) + destroyPosition[0];
    let blockToDestroy = this.actionPlaneBlocks[blockIndex];
    let direction = this.getDirectionName(facing);

    let destroyOverlay = this.actionPlane.create(-12 + 40 * destroyPosition[0], -22 + 40 * destroyPosition[1], "destroyOverlay", "destroy1");
    destroyOverlay.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    this.onAnimationEnd(destroyOverlay.animations.add("destroy", Phaser.Animation.generateFrameNames("destroy", 1, 12, "", 0), 30, false), () => {
      this.actionPlaneBlocks[blockIndex] = null;

      if (blockToDestroy.hasOwnProperty("onBlockDestroy")) {
        blockToDestroy.onBlockDestroy(blockToDestroy);
      }

      blockToDestroy.kill();
      destroyOverlay.kill();
      this.toDestroy.push(blockToDestroy);
      this.toDestroy.push(destroyOverlay);
      this.updateShadingPlane(newShadingPlaneData);
      this.updateFowPlane(newFowPlaneData);

      this.setSelectionIndicatorPosition(playerPosition[0], playerPosition[1]);

      this.audioPlayer.play('dig_wood1');
      this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
    });

    this.playScaledSpeed(destroyOverlay.animations, "destroy");
  }

  playMiningParticlesAnimation(facing, destroyPosition) {
    let miningParticlesData = [
      [24, -100, -80],   // left
      [12, -120, -80],   // bottom
      [0, -60, -80],   // right
      [36, -80, -60],   // top
    ];

    let direction = this.getDirectionName(facing);
    let miningParticlesIndex = (direction === "_left" ? 0 : direction === "_bottom" ? 1 : direction === "_right" ? 2 : 3);
    let miningParticlesFirstFrame = miningParticlesData[miningParticlesIndex][0];
    let miningParticlesOffsetX = miningParticlesData[miningParticlesIndex][1];
    let miningParticlesOffsetY = miningParticlesData[miningParticlesIndex][2];
    let miningParticles = this.actionPlane.create(miningParticlesOffsetX + 40 * destroyPosition[0], miningParticlesOffsetY + 40 * destroyPosition[1], "miningParticles", "MiningParticles" + miningParticlesFirstFrame);
    miningParticles.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    this.onAnimationEnd(miningParticles.animations.add("miningParticles", Phaser.Animation.generateFrameNames("MiningParticles", miningParticlesFirstFrame, miningParticlesFirstFrame + 11, "", 0), 30, false), () => {
      miningParticles.kill();
      this.toDestroy.push(miningParticles);
    });
    this.playScaledSpeed(miningParticles.animations, "miningParticles");
  }

  playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, placeBlock) {
    var signalBinding,
        explodeAnim = this.actionPlane.create(-36 + 40 * destroyPosition[0], -30 + 40 * destroyPosition[1], "blockExplode", "BlockBreakParticle0");

    //explodeAnim.tint = 0x324bff;
    if (this.controller.canUseTints()) {
      switch (blockType) {
        case "treeAcacia":
        case "logAcacia":
          explodeAnim.tint = 0x6c655a;
          break;
        case "treeBirch":
        case "logBirch":
          explodeAnim.tint = 0xdad6cc;
          break;
        case "treeJungle":
        case "logJungle":
          explodeAnim.tint = 0x6a4f31;
          break;
        case "treeOak":
        case "logOak":
          explodeAnim.tint = 0x675231;
          break;
        case "treeSpruce":
        case "logSpruce":
          explodeAnim.tint = 0x4b3923;
          break;

        case "planksAcacia":
          explodeAnim.tint = 0xba6337;
          break;
        case "planksBirch":
          explodeAnim.tint = 0xd7cb8d;
          break;
        case "planksJungle":
          explodeAnim.tint = 0xb88764;
          break;
        case "planksOak":
          explodeAnim.tint = 0xb4905a;
          break;
        case "planksSpruce":
          explodeAnim.tint = 0x805e36;
          break;
        case "stone":
        case "oreCoal":
        case "oreDiamond":
        case "oreIron":
        case "oreGold":
        case "oreEmerald":
        case "oreRedstone":
          explodeAnim.tint = 0xC6C6C6;
          break;
        case "grass":
        case "cropWheat":
          explodeAnim.tint = 0x5d8f23;
          break;
        case "dirt":
          explodeAnim.tint = 0x8a5e33;
          break;

        default:
          break;
      }
    }

    explodeAnim.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    this.onAnimationEnd(explodeAnim.animations.add("explode", Phaser.Animation.generateFrameNames("BlockBreakParticle", 0, 7, "", 0), 30, false), () => {
      explodeAnim.kill();
      this.toDestroy.push(explodeAnim);

      if(placeBlock) {
        this.playPlayerAnimation("idle", playerPosition, facing, false);
        this.playItemDropAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler);
      }
    });
    this.playScaledSpeed(explodeAnim.animations, "explode");
    if(!placeBlock) {
      completionHandler();
    }
  }

  playItemDropAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
    var sprite = this.createMiniBlock(destroyPosition[0], destroyPosition[1], blockType);
    sprite.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    this.onAnimationEnd(this.playScaledSpeed(sprite.animations, "animate"), () => {
      this.playItemAcquireAnimation(playerPosition, facing, destroyPosition, blockType, sprite, completionHandler);
    });
  }

  playScaledSpeed(animationManager, name) {
    var animation = animationManager.getAnimation(name);
    if (!animation.originalFps) {
      animation.originalFps = 1000 / animation.delay;
    }
    return animationManager.play(name, this.controller.originalFpsToScaled(animation.originalFps));
  }

  playItemAcquireAnimation(playerPosition, facing, destroyPosition, blockType, sprite, completionHandler) {
    var tween;

    tween = this.addResettableTween(sprite).to({
      x: (-18 + 40 * playerPosition[0]),
      y: (-32 + 40 * playerPosition[1])
    }, 200, Phaser.Easing.Linear.None);

    tween.onComplete.add(() => {
      this.audioPlayer.play("collectedBlock");
      sprite.kill();
      this.toDestroy.push(sprite);
      completionHandler();
    });

    tween.start();
  }

  setPlayerPosition(x, y, isOnBlock) {
    this.playerSprite.x = -18 + 40 * x;
    this.playerSprite.y = -32 + (isOnBlock ? -23 : 0) + 40 * y;
    this.playerSprite.sortOrder = this.yToIndex(y) + 5;
  }

  setSelectionIndicatorPosition(x, y) {
    this.selectionIndicator.x = -35 + 23 + 40 * x;
    this.selectionIndicator.y = -55 + 43 + 40 * y;
  }

  createPlanes() {
    this.groundPlane = this.game.add.group();
    this.groundPlane.yOffset = -2;
    this.shadingPlane = this.game.add.group();
    this.shadingPlane.yOffset = -2;
    this.actionPlane = this.game.add.group();
    this.actionPlane.yOffset = -22;
    this.fluffPlane = this.game.add.group();
    this.fluffPlane.yOffset = -160;
    this.fowPlane = this.game.add.group();
    this.fowPlane.yOffset = 0;
  }

  resetPlanes(levelData) {
    var sprite,
        x,
        y,
        i,
        blockType,
        frameList;

    this.groundPlane.removeAll(true);
    this.actionPlane.removeAll(true);
    this.fluffPlane.removeAll(true);
    this.shadingPlane.removeAll(true);
    this.fowPlane.removeAll(true);

    this.baseShading = this.game.add.group();

    for (var shadeX = 0; shadeX < this.controller.levelModel.planeWidth * 40; shadeX += 400) {
      for (var shadeY = 0; shadeY < this.controller.levelModel.planeHeight * 40; shadeY += 400) {
        this.baseShading.create(shadeX, shadeY, 'shadeLayer');
      }
    }

    this.refreshGroundPlane();

    this.actionPlaneBlocks = [];
    for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
      for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
        let blockIndex = (this.yToIndex(y)) + x;
        sprite = null;

        if (!levelData.groundDecorationPlane[blockIndex].isEmpty) {
          sprite = this.createBlock(this.actionPlane, x, y, levelData.groundDecorationPlane[blockIndex].blockType);
          if (sprite) {
            sprite.sortOrder = this.yToIndex(y);
          }
        }

        sprite = null;
        if (!levelData.actionPlane[blockIndex].isEmpty) {
          blockType = levelData.actionPlane[blockIndex].blockType;
          sprite = this.createBlock(this.actionPlane, x, y, blockType);
          if (sprite !== null) {
            sprite.sortOrder = this.yToIndex(y);
          }
        }

        this.actionPlaneBlocks.push(sprite);
      }
    }

    for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
      for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
        let blockIndex = (this.yToIndex(y)) + x;
        if (!levelData.fluffPlane[blockIndex].isEmpty) {
          sprite = this.createBlock(this.fluffPlane, x, y, levelData.fluffPlane[blockIndex].blockType);
        }
      }
    }
  }

  refreshGroundPlane() {
    this.groundPlane.removeAll(true);
    for (var y = 0; y < this.controller.levelModel.planeHeight; ++y) {
      for (var x = 0; x < this.controller.levelModel.planeWidth; ++x) {
        let blockIndex = (this.yToIndex(y)) + x;
        var sprite = this.createBlock(this.groundPlane, x, y, this.controller.levelModel.groundPlane[blockIndex].blockType);
        if (sprite) {
          sprite.sortOrder = this.yToIndex(y);
        }
      }
    }
  }

  updateShadingPlane(shadingData) {
    var index, shadowItem, sx, sy, atlas;

    this.shadingPlane.removeAll();

    this.shadingPlane.add(this.baseShading);
    this.shadingPlane.add(this.selectionIndicator);

    for (index = 0; index < shadingData.length; ++index) {
      shadowItem = shadingData[index];

      atlas = "AO";
      sx = 40 * shadowItem.x;
      sy = -22 + 40 * shadowItem.y;

      switch (shadowItem.type) {
        case "AOeffect_Left":
          sx += 26;
          sy += 22;
          break;

        case "AOeffect_Right":
          sx += 0;
          sy += 22;
          break;

        case "AOeffect_Bottom":
          sx += 0;
          sy += 22;
          break;

        case "AOeffect_BottomLeft":
          sx += 25;
          sy += 22;
          break;

        case "AOeffect_BottomRight":
          sx += 0;
          sy += 22;
          break;

        case "AOeffect_Top":
          sx += 0;
          sy += 47;
          break;

        case "AOeffect_TopLeft":
          sx += 25;
          sy += 47;
          break;

        case "AOeffect_TopRight":
          sx += 0;
          sy += 47;
          break;

        case "Shadow_Parts_Fade_base.png":
          atlas = "blockShadows";
          sx -= 52;
          sy += 0;
          break;

        case "Shadow_Parts_Fade_top.png":
          atlas = "blockShadows";
          sx -= 52;
          sy += 0;
          break;
      }

      this.shadingPlane.create(sx, sy, atlas, shadowItem.type);
    }
  }

  updateFowPlane(fowData) {
    var index, fx, fy, atlas;

    this.fowPlane.removeAll();

    for (index = 0; index < fowData.length; ++index) {
      let fowItem = fowData[index];

      if (fowItem !== "") {
        atlas = "undergroundFow";
        fx = -40 + 40 * fowItem.x;
        fy = -40 + 40 * fowItem.y;

        switch (fowItem.type) {
          case "FogOfWar_Center":
            break;

          default:
            break;
        }

        this.fowPlane.create(fx, fy, atlas, fowItem.type);
      }
    }
  }

  playRandomPlayerIdle(facing) {
    var facingName,
        rand,
        animationName;

    facingName = this.getDirectionName(facing);
    rand = Math.trunc(Math.random() * 4) + 1;

    switch(rand) {
      case 1:
      animationName = "idle";
      break;
      case 2:
      animationName = "lookLeft";
      break;
      case 3:
      animationName = "lookRight";
      break;
      case 4:
      animationName = "lookAtCam";
      break;
      default:
    }

    animationName += facingName;
    this.playScaledSpeed(this.playerSprite.animations, animationName);
  }

  generatePlayerCelebrateFrames() {
    var frameList = [],
        i;

    //Crouch Down
   /* frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 29, 32, "", 3));
    //Crouch Down
    frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 29, 32, "", 3));
    //turn and pause
    for (i = 0; i < 4; ++i) {
    frameList = frameList.concat("Player_061");
    }
    for (i = 0; i < 2; ++i) {
    frameList = frameList.concat("Player_149");
    }
        //Crouch Up
    frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 149, 152, "", 3));
    //Crouch Up
    frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 149, 152, "", 3));*/


///////////////////////////Alternative Animation/////////////////////
    //Face Down
     for (i = 0; i < 6; ++i) {
      frameList.push("Player_001");
    }
    //Crouch Left
    //frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 209, 212, "", 3));
    frameList = frameList.concat("Player_259");
    frameList = frameList.concat("Player_260");

    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");
    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");
    //Pause
    frameList.push("Player_001");
    frameList.push("Player_001");
    frameList.push("Player_001");
    frameList.push("Player_001");
    frameList.push("Player_001");
    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");
    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");

    //for (i = 0; i < 5; ++i) {
    //  frameList.push("Player_262");
    //
    return frameList;
  }

  generateFramesWithEndDelay(frameName, startFrame, endFrame, endFrameFullName, buffer, frameDelay) {
    var frameList = Phaser.Animation.generateFrameNames(frameName, startFrame, endFrame, "", buffer);
    for (var i = 0; i < frameDelay; ++i) {
      frameList.push(endFrameFullName);
    }
    return frameList;
  }

  preparePlayerSprite(playerName) {
    var frameList,
        genFrames,
        i,
        singlePunch,
        jumpCelebrateFrames,
        idleFrameRate = 10;

    let frameRate = 20;

    this.playerSprite = this.actionPlane.create(0, 0, `player${playerName}`, 'Player_121');
    if (this.controller.followingPlayer()) {
      this.game.camera.follow(this.playerSprite);
    }
    this.playerGhost = this.fluffPlane.create(0, 0, `player${playerName}`, 'Player_121');
    this.playerGhost.parent = this.playerSprite;
    this.playerGhost.alpha = 0.2;

    this.selectionIndicator = this.shadingPlane.create(24, 44, 'selectionIndicator');

    jumpCelebrateFrames = Phaser.Animation.generateFrameNames("Player_", 285, 296, "", 3);

    frameList = [];

    frameList.push("Player_001");
    frameList.push("Player_003");
    frameList.push("Player_001");
    frameList.push("Player_007");
    frameList.push("Player_009");
    frameList.push("Player_007");
    for (i = 0; i < 5; ++i) {
      frameList.push("Player_001");
    }

    this.playerSprite.animations.add('idle_down', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Down);
    });
    frameList = this.generateFramesWithEndDelay("Player_", 6, 5, "Player_005", 3, 5);
    frameList.push("Player_006");
    this.playerSprite.animations.add('lookLeft_down', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_down");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 12, 11, "Player_011", 3, 5);
    frameList.push("Player_012");
    this.playerSprite.animations.add('lookRight_down', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_down");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 263, 262, "Player_262", 3, 5);
    frameList.push("Player_263");
    this.playerSprite.animations.add('lookAtCam_down', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_down");
    });
    frameList = [];
    for (i = 0; i < 13; ++i) {
      frameList.push("Player_001");
    }
    this.playerSprite.animations.add('idlePause_down', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Down);
    });

    this.playerSprite.animations.add('walk_down', Phaser.Animation.generateFrameNames("Player_", 13, frameRate, "", 3), frameRate, true);
    singlePunch = Phaser.Animation.generateFrameNames("Player_", 21, 24, "", 3);
    this.playerSprite.animations.add('punch_down', singlePunch, frameRate, false).onComplete.add(() => {
      this.audioPlayer.play("punch");
    });
    this.playerSprite.animations.add('punchDestroy_down', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
    this.playerSprite.animations.add('hurt_down', Phaser.Animation.generateFrameNames("Player_", 25, 28, "", 3), frameRate, true);
    this.playerSprite.animations.add('crouch_down', Phaser.Animation.generateFrameNames("Player_", 29, 32, "", 3), frameRate, true);
    this.playerSprite.animations.add('jumpUp_down', Phaser.Animation.generateFrameNames("Player_", 33, 36, "", 3), frameRate / 2, true);
    this.playerSprite.animations.add('fail_down', Phaser.Animation.generateFrameNames("Player_", 45, 48, "", 3), frameRate, false);
    this.playerSprite.animations.add('celebrate_down', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
    this.playerSprite.animations.add('bump_down', Phaser.Animation.generateFrameNames("Player_", 49, 54, "", 3), frameRate, false).onStart.add(() => {
      this.audioPlayer.play("bump");
    });
    this.playerSprite.animations.add('jumpDown_down', Phaser.Animation.generateFrameNames("Player_", 55, 60, "", 3), frameRate, true);
    this.playerSprite.animations.add('mine_down', Phaser.Animation.generateFrameNames("Player_", 241, 244, "", 3), frameRate, true);
    this.playerSprite.animations.add('mineCart_down', Phaser.Animation.generateFrameNames("Minecart_", 5, 5, "", 2), frameRate, false);
    this.playerSprite.animations.add('mineCart_turnleft_down', Phaser.Animation.generateFrameNames("Minecart_", 6, 6, "", 2), frameRate, false);
    this.playerSprite.animations.add('mineCart_turnright_down', Phaser.Animation.generateFrameNames("Minecart_", 12, 12, "", 2), frameRate, false);

    frameList = [];

    frameList.push("Player_061");
    frameList.push("Player_063");
    frameList.push("Player_061");
    frameList.push("Player_067");
    frameList.push("Player_069");
    frameList.push("Player_067");
    for (i = 0; i < 5; ++i) {
      frameList.push("Player_061");
    }

    this.playerSprite.animations.add('idle_right', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Right);
    });
    frameList = this.generateFramesWithEndDelay("Player_", 66, 65, "Player_065", 3, 5);
    frameList.push("Player_066");
    this.playerSprite.animations.add('lookLeft_right', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_right");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 72, 71, "Player_071", 3, 5);
    frameList.push("Player_072");
    this.playerSprite.animations.add('lookRight_right', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_right");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 270, 269, "Player_269", 3, 5);
    frameList.push("Player_270");
    this.playerSprite.animations.add('lookAtCam_right', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_right");
    });
    frameList = [];
    for (i = 0; i < 13; ++i) {
      frameList.push("Player_061");
    }
    this.playerSprite.animations.add('idlePause_right', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Right);
    });

    this.playerSprite.animations.add('walk_right', Phaser.Animation.generateFrameNames("Player_", 73, 80, "", 3), frameRate, true);
    singlePunch = Phaser.Animation.generateFrameNames("Player_", 81, 84, "", 3);
    this.playerSprite.animations.add('punch_right', singlePunch, frameRate, false).onComplete.add(() => {
      this.audioPlayer.play("punch");
    });
    this.playerSprite.animations.add('punchDestroy_right', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
    this.playerSprite.animations.add('hurt_right', Phaser.Animation.generateFrameNames("Player_", 85, 88, "", 3), frameRate, true);
    this.playerSprite.animations.add('crouch_right', Phaser.Animation.generateFrameNames("Player_", 89, 92, "", 3), frameRate, true);
    this.playerSprite.animations.add('jumpUp_right', Phaser.Animation.generateFrameNames("Player_", 93, 96, "", 3), frameRate / 2, true);
    this.playerSprite.animations.add('fail_right', Phaser.Animation.generateFrameNames("Player_", 105, 108, "", 3), frameRate / 2, false);
    this.playerSprite.animations.add('celebrate_right', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
    this.playerSprite.animations.add('bump_right', Phaser.Animation.generateFrameNames("Player_", 109, 114, "", 3), frameRate, false).onStart.add(() => {
      this.audioPlayer.play("bump");
    });
    this.playerSprite.animations.add('jumpDown_right', Phaser.Animation.generateFrameNames("Player_", 115, 120, "", 3), frameRate, true);
    this.playerSprite.animations.add('mine_right', Phaser.Animation.generateFrameNames("Player_", 245, 248, "", 3), frameRate, true);
    this.playerSprite.animations.add('mineCart_right', Phaser.Animation.generateFrameNames("Minecart_", 7, 7, "", 2), frameRate, false);

    frameList = [];

    frameList.push("Player_181");
    frameList.push("Player_183");
    frameList.push("Player_181");
    frameList.push("Player_187");
    frameList.push("Player_189");
    frameList.push("Player_187");
    for (i = 0; i < 5; ++i) {
      frameList.push("Player_181");
    }

    this.playerSprite.animations.add('idle_left', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Left);
    });
    frameList = this.generateFramesWithEndDelay("Player_", 186, 185, "Player_185", 3, 5);
    frameList.push("Player_186");
    this.playerSprite.animations.add('lookLeft_left', frameList, idleFrameRate, false).onComplete.add(()=> {
     this.playScaledSpeed(this.playerSprite.animations, "idlePause_left");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 192, 191, "Player_191", 3, 5);
    frameList.push("Player_192");
    this.playerSprite.animations.add('lookRight_left', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_left");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 284, 283, "Player_283", 3, 5);
    frameList.push("Player_284");
    this.playerSprite.animations.add('lookAtCam_left', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_left");
    });
    frameList = [];
    for (i = 0; i < 13; ++i) {
      frameList.push("Player_181");
    }
    this.playerSprite.animations.add('idlePause_left', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Left);
    });

    this.playerSprite.animations.add('walk_left', Phaser.Animation.generateFrameNames("Player_", 193, 200, "", 3), frameRate, true);
    singlePunch = Phaser.Animation.generateFrameNames("Player_", 201, 204, "", 3);
    this.playerSprite.animations.add('punch_left', singlePunch, frameRate, false).onComplete.add(() => {
      this.audioPlayer.play("punch");
    });
    this.playerSprite.animations.add('punchDestroy_left', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
    this.playerSprite.animations.add('hurt_left', Phaser.Animation.generateFrameNames("Player_", 205, 208, "", 3), frameRate, true);
    this.playerSprite.animations.add('crouch_left', Phaser.Animation.generateFrameNames("Player_", 209, 212, "", 3), frameRate, true);
    this.playerSprite.animations.add('jumpUp_left', Phaser.Animation.generateFrameNames("Player_", 213, 216, "", 3), frameRate / 2, true);
    this.playerSprite.animations.add('fail_left', Phaser.Animation.generateFrameNames("Player_", 225, 228, "", 3), frameRate / 2, false);
    this.playerSprite.animations.add('celebrate_left', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
    this.playerSprite.animations.add('bump_left', Phaser.Animation.generateFrameNames("Player_", 229, 234, "", 3), frameRate, false).onStart.add(() => {
      this.audioPlayer.play("bump");
    });
    this.playerSprite.animations.add('jumpDown_left', Phaser.Animation.generateFrameNames("Player_", 235, 240, "", 3), frameRate, true);
    this.playerSprite.animations.add('mine_left', Phaser.Animation.generateFrameNames("Player_", 253, 256, "", 3), frameRate, true);
    this.playerSprite.animations.add('mineCart_left', Phaser.Animation.generateFrameNames("Minecart_", 11, 11, "", 2), frameRate, false);

    frameList = [];
    frameList.push("Player_121");
    frameList.push("Player_123");
    frameList.push("Player_121");
    frameList.push("Player_127");
    frameList.push("Player_129");
    frameList.push("Player_127");
    for (i = 0; i < 5; ++i) {
      frameList.push("Player_121");
    }

    this.playerSprite.animations.add('idle_up', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Up);
    });
    frameList = this.generateFramesWithEndDelay("Player_", 126, 125, "Player_125", 3, 5);
    frameList.push("Player_126");
    this.playerSprite.animations.add('lookLeft_up', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_up");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 132, 131, "Player_131", 3, 5);
    frameList.push("Player_132");
    this.playerSprite.animations.add('lookRight_up', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_up");
    });
    frameList = this.generateFramesWithEndDelay("Player_", 277, 276, "Player_276", 3, 5);
    frameList.push("Player_277");
    this.playerSprite.animations.add('lookAtCam_up', frameList, idleFrameRate, false).onComplete.add(()=> {
      this.playScaledSpeed(this.playerSprite.animations, "idlePause_up");
    });

    frameList = [];
    for (i = 0; i < 13; ++i) {
      frameList.push("Player_121");
    }
    this.playerSprite.animations.add('idlePause_up', frameList, frameRate / 3, false).onComplete.add(()=> {
      this.playRandomPlayerIdle(FacingDirection.Up);
    });
    this.playerSprite.animations.add('walk_up', Phaser.Animation.generateFrameNames("Player_", 133, 140, "", 3), frameRate, true);
    singlePunch = Phaser.Animation.generateFrameNames("Player_", 141, 144, "", 3);
    this.playerSprite.animations.add('punch_up', singlePunch, frameRate, false).onComplete.add(() => {
      this.audioPlayer.play("punch");
    });
    this.playerSprite.animations.add('punchDestroy_up', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
    this.playerSprite.animations.add('hurt_up', Phaser.Animation.generateFrameNames("Player_", 145, 148, "", 3), frameRate, true);
    this.playerSprite.animations.add('crouch_up', Phaser.Animation.generateFrameNames("Player_", 149, 152, "", 3), frameRate, true);
    this.playerSprite.animations.add('jumpUp_up', Phaser.Animation.generateFrameNames("Player_", 153, 156, "", 3), frameRate / 2, true);
    this.playerSprite.animations.add('fail_up', Phaser.Animation.generateFrameNames("Player_", 165, 168, "", 3), frameRate / 2, false);
    this.playerSprite.animations.add('celebrate_up', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
    this.playerSprite.animations.add('bump_up', Phaser.Animation.generateFrameNames("Player_", 169, 174, "", 3), frameRate, false).onStart.add(() => {
      this.audioPlayer.play("bump");
    });
    this.playerSprite.animations.add('jumpDown_up', Phaser.Animation.generateFrameNames("Player_", 175, 180, "", 3), frameRate, true);
    this.playerSprite.animations.add('mine_up', Phaser.Animation.generateFrameNames("Player_", 249, 252, "", 3), frameRate, true);
    this.playerSprite.animations.add('mineCart_up', Phaser.Animation.generateFrameNames("Minecart_", 9, 9, "", 2), frameRate, false);
    this.playerSprite.animations.add('mineCart_turnleft_up', Phaser.Animation.generateFrameNames("Minecart_", 10, 10, "", 2), frameRate, false);
    this.playerSprite.animations.add('mineCart_turnright_up', Phaser.Animation.generateFrameNames("Minecart_", 8, 8, "", 2), frameRate, false);
  }

  createMiniBlock(x, y, blockType) {
    var frame = "",
        sprite = null,
        frameList,
        i, len;

    switch (blockType) {
      case "treeAcacia":
      case "treeBirch":
      case "treeJungle":
      case "treeOak":
      case "treeSpruce":
        frame = "log" + blockType.substring(4);
        break;
      case "stone":
        frame = "cobblestone";
        break;
      case "oreCoal":
        frame = "coal";
        break;
      case "oreDiamond":
        frame = "diamond";
        break;
      case "oreIron":
        frame = "ingotIron";
        break;
      case "oreLapis":
        frame = "lapisLazuli";
        break;
      case "oreGold":
        frame = "ingotGold";
        break;
      case "oreEmerald":
        frame = "emerald";
        break;
      case "oreRedstone":
        frame = "redstoneDust";
        break;
      case "grass":
        frame = "dirt";
        break;
      case "wool_orange":
        frame = "wool";
        break;
      case "tnt":
        frame = "gunPowder";
        break;
      default:
        frame = blockType;
        break;
    }

    let atlas = "miniBlocks";
    let framePrefix = this.miniBlocks[frame][0];
    let frameStart = this.miniBlocks[frame][1];
    let frameEnd = this.miniBlocks[frame][2];
    let xOffset = -10;
    let yOffset = 0;

    frameList = Phaser.Animation.generateFrameNames(framePrefix, frameStart, frameEnd, "", 3);

    sprite = this.actionPlane.create(xOffset + 40 * x, yOffset + this.actionPlane.yOffset + 40 * y, atlas, "");
    sprite.animations.add("animate", frameList, 10, false);
    return sprite;
  }

  playAnimationWithOffset(sprite, animationName, animationFrameTotal, startFrame){
    var rand = Math.trunc(Math.random() * animationFrameTotal) + startFrame;
    this.playScaledSpeed(sprite.animations, animationName).setFrame(rand, true);
  }

  playRandomSheepAnimation(sprite) {
    var rand = Math.trunc(Math.random() * 20 + 1);

    switch(rand) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      //eat grass
      sprite.play("idle");
      break;
      case 7:
      case 8:
      case 9:
      case 10:
      //look left
      sprite.play("lookLeft");
      break;
      case 11:
      case 12:
      case 13:
      case 14:
      //look right
      sprite.play("lookRight");
      break;
      case 15:
      case 16:
      case 17:
      //cam
      sprite.play("lookAtCam");
      break;
      case 18:
      case 19:
      //kick
      sprite.play("kick");
      break;
      case 20:
      //idlePause
      sprite.play("idlePause");
      break;
      default:
    }
  }

  playRandomCreeperAnimation(sprite) {
    var rand = Math.trunc(this.yToIndex(Math.random()) + 1);

    switch(rand) {
      case 1:
      case 2:
      case 3:
      //look left
      sprite.play("lookLeft");
      break;
      case 4:
      case 5:
      case 6:
      //look right
      sprite.play("lookRight");
      break;
      case 7:
      case 8:
      //look at cam
      sprite.play("lookAtCam");
      break;
      case 9:
      case 10:
      //shuffle feet
      sprite.play("idle");
      break;
      default:
    }
  }

  createBlock(plane, x, y, blockType) {
    var i,
        sprite = null,
        frameList,
        atlas,
        frame,
        xOffset,
        yOffset,
        stillFrames;

    switch (blockType) {
      case "treeAcacia":
      case "treeBirch":
      case "treeJungle":
      case "treeOak":
      case "treeSpruce":
        sprite = this.createBlock(plane, x, y, "log" + blockType.substring(4));
        sprite.fluff = this.createBlock(this.fluffPlane, x, y, "leaves" + blockType.substring(4));

        sprite.onBlockDestroy = (logSprite) => {
          logSprite.fluff.animations.add("despawn", Phaser.Animation.generateFrameNames("Leaves", 0, 6, "", 0), 10, false).onComplete.add(() => {
            this.toDestroy.push(logSprite.fluff);
            logSprite.fluff.kill();
          });

          this.playScaledSpeed(logSprite.fluff.animations, "despawn");
        };
        break;

      case "sheep":
        var sFrames = 10;
        // Facing Left: Eat Grass: 199-216
        sprite = plane.create(-22 + 40 * x, -12 + 40 * y, "sheep", "Sheep_199");
        frameList = Phaser.Animation.generateFrameNames("Sheep_", 199, 215, "", 0);
        for (i = 0; i < sFrames; ++i) {
          frameList.push("Sheep_215");
        }
        sprite.animations.add("idle", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        //Look Right
        frameList = Phaser.Animation.generateFrameNames("Sheep_", 184, 186, "", 0);
        for (i = 0; i < sFrames; ++i) {
          frameList.push("Sheep_186");
        }
        frameList.push("Sheep_188");
        sprite.animations.add("lookRight", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        //Look Left
        frameList = Phaser.Animation.generateFrameNames("Sheep_", 193, 195, "", 0);
        for (i = 0; i < sFrames; ++i) {
          frameList.push("Sheep_195");
        }
        frameList.push("Sheep_197");
        sprite.animations.add("lookLeft", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        //Kick
        frameList = Phaser.Animation.generateFrameNames("Sheep_", 217, 233, "", 0);
        sprite.animations.add("kick", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        //Look At Camera
        frameList = Phaser.Animation.generateFrameNames("Sheep_", 484, 485, "", 0);
        for (i = 0; i < sFrames; ++i) {
          frameList.push("Sheep_485");
        }
        frameList.push("Sheep_486");
        sprite.animations.add("lookAtCam", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        frameList = [];
        for (i = 0; i < 15; ++i) {
          frameList.push("Sheep_215");
        }
        sprite.animations.add("idlePause", frameList, 15, false).onComplete.add(() => {
          this.playRandomSheepAnimation(sprite);
        });

        // TODO(bjordan/gaallen) - update once updated Sheep.json
        frameList = Phaser.Animation.generateFrameNames("Sheep_", 490, 491, "", 0);
        stillFrames = Math.trunc(Math.random() * 3) + 3;
        for (i = 0; i < stillFrames; ++i) {
          frameList.push("Sheep_491");
        }
        this.onAnimationStart(sprite.animations.add("face", frameList, 2, true), ()=>{
          this.audioPlayer.play("sheepBaa");
        });

        frameList = Phaser.Animation.generateFrameNames("Sheep_", 439, 455, "", 0);
        for (i = 0; i < 3; ++i) {
          frameList.push("Sheep_455");
        }

        sprite.animations.add("used", frameList, 15, true);
        this.playAnimationWithOffset(sprite, "idle", 17, 199);
        break;

      case "creeper":
        sprite = plane.create(-6 + 40 * x, 0 + plane.yOffset + 40 * y, "creeper", "Creeper_053");

        frameList = Phaser.Animation.generateFrameNames("Creeper_", 37, 51, "", 3);
        sprite.animations.add("explode", frameList, 10, false);

        //Look Left
        frameList = Phaser.Animation.generateFrameNames("Creeper_", 4, 7, "", 3);
        for (i = 0; i < 15; ++i) {
          frameList.push("Creeper_007");
        }
        frameList.push("Creeper_008");
        frameList.push("Creeper_009");
        frameList.push("Creeper_010");
        frameList.push("Creeper_011");
        sprite.animations.add("lookLeft", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        //Look Right
        frameList = Phaser.Animation.generateFrameNames("Creeper_", 16, 19, "", 3);
        for (i = 0; i < 15; ++i) {
          frameList.push("Creeper_019");
        }
        frameList.push("Creeper_020");
        frameList.push("Creeper_021");
        frameList.push("Creeper_022");
        frameList.push("Creeper_023");
        sprite.animations.add("lookRight", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        //Look At Cam
        frameList = Phaser.Animation.generateFrameNames("Creeper_", 244, 245, "", 3);
        for (i = 0; i < 15; ++i) {
          frameList.push("Creeper_245");
        }
        frameList.push("Creeper_246");
        sprite.animations.add("lookAtCam", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });

        frameList = [];
        for (i = 0; i < 15; ++i) {
          frameList.push("Creeper_004");
        }
        sprite.animations.add("idlePause", frameList, 15, false).onComplete.add(() => {
          this.playRandomCreeperAnimation(sprite);
        });

        frameList = Phaser.Animation.generateFrameNames("Creeper_", 53, 59, "", 3);
        stillFrames = Math.trunc(this.yToIndex(Math.random())) + 20;
        for (i = 0; i < stillFrames; ++i) {
          frameList.push("Creeper_004");
        }
        sprite.animations.add("idle", frameList, 15, false).onComplete.add(() => {
          sprite.play("idlePause");
        });
        this.playAnimationWithOffset(sprite, "idle", 8, 52);
        break;

      case "cropWheat":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("Wheat", 0, 2, "", 0);
        sprite.animations.add("idle", frameList, 0.4, false);
        this.playScaledSpeed(sprite.animations, "idle");
        break;

      case "torch":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("Torch", 0, 23, "", 0);
        sprite.animations.add("idle", frameList, 15, true);
        this.playScaledSpeed(sprite.animations, "idle");
        break;

      case "water":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("Water_", 0, 5, "", 0);
        sprite.animations.add("idle", frameList, 5, true);
        this.playScaledSpeed(sprite.animations, "idle");
        break;

      //for placing wetland for crops in free play
      case "watering":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        sprite.kill();
        this.toDestroy.push(sprite);
        this.createBlock(this.groundPlane, x, y, "farmlandWet");
        this.refreshGroundPlane();
        break;

      case "lava":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("Lava_", 0, 5, "", 0);
        sprite.animations.add("idle", frameList, 5, true);
        this.playScaledSpeed(sprite.animations, "idle");
        break;

      case "lavaPop":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("LavaPop", 1, 7, "", 2);
        for(i = 0; i < 4; ++i) {
          frameList.push("LavaPop07");
        }
        frameList = frameList.concat(Phaser.Animation.generateFrameNames("LavaPop", 8, 13, "", 2));
        for(i = 0; i < 3; ++i) {
          frameList.push("LavaPop13");
        }
        frameList = frameList.concat(Phaser.Animation.generateFrameNames("LavaPop", 14, 30, "", 2));
        for(i = 0; i < 8; ++i) {
          frameList.push("LavaPop01");
        }
        sprite.animations.add("idle", frameList, 5, true);
        this.playAnimationWithOffset(sprite, "idle", 29, 1);
        break;

      case "fire":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("Fire", 0, 14, "", 2);
        sprite.animations.add("idle", frameList, 5, true);
        this.playScaledSpeed(sprite.animations, "idle");
        break;

      case "bubbles":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("Bubbles", 0, 14, "", 2);
        sprite.animations.add("idle", frameList, 5, true);
        this.playScaledSpeed(sprite.animations, "idle");
        break;

      case "explosion":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("Explosion", 0, 16, "", 1);
        sprite.animations.add("idle", frameList, 15, false).onComplete.add(() => {
          this.toDestroy.push(sprite);
          sprite.kill();
        });
        this.playScaledSpeed(sprite.animations, "idle");
        break;

      case "door":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);

        frameList = [];
        var animationFrames = Phaser.Animation.generateFrameNames("Door", 0, 3, "", 1);
        for(var j = 0; j < 5; ++j) {
          frameList.push("Door0");
        }
        frameList = frameList.concat(animationFrames);

        var animation = sprite.animations.add("open", frameList, 5, false);
        animation.enableUpdate = true;
        //play when the door starts opening
        animation.onUpdate.add(() => {
          if(animation.frame === 1) {
            this.audioPlayer.play("doorOpen");
          }
        });
        this.playScaledSpeed(sprite.animations, "open");
        break;

      case "tnt":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        frameList = Phaser.Animation.generateFrameNames("TNTexplosion", 0, 8, "", 0);
        sprite.animations.add("explode", frameList, 7, false).onComplete.add(() => {
          this.playExplosionCloudAnimation([x, y]);
          sprite.kill();
          this.toDestroy.push(sprite);
          this.actionPlaneBlocks[this.coordinatesToIndex([x, y])] = null;
        });
        break;

      default:
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
        break;
    }

    return sprite;
  }

  onAnimationEnd(animation, completionHandler) {
    var signalBinding = animation.onComplete.add(() => {
      signalBinding.detach();
      completionHandler();
    });
  }

  onAnimationStart(animation, completionHandler) {
    var signalBinding = animation.onStart.add(() => {
      signalBinding.detach();
      completionHandler();
    });
  }

  onAnimationLoopOnce(animation, completionHandler) {
    var signalBinding = animation.onLoop.add(() => {
      signalBinding.detach();
      completionHandler();
    });
  }

  addResettableTween(sprite) {
    var tween = this.game.add.tween(sprite);
    this.resettableTweens.push(tween);
    return tween;
  }

}
