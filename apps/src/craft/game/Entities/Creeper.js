import BaseEntity from "./BaseEntity.js"
import AssetLoader from "../LevelMVC/AssetLoader.js";
import LevelView from "../LevelMVC/LevelView.js"
import FacingDirection from "../LevelMVC/FacingDirection.js";
export default class Creeper extends BaseEntity {
    constructor(controller, type, identifier, x, y, facing) {
        super(controller, type, identifier, x, y, facing);
        var zOrderYIndex = this.position[1];
        this.offset = [-43, -55];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex);
    }

    prepareSprite() {
        let getRandomSecondBetween = function (min, max) {
            return (Math.random() * (max - min) + min) * 1000;
        }
        let frameRate = 10, pauseFrame = 30, randomPauseMin = 0.2, randomPauseMax = 1;
        let actionPlane = this.controller.levelView.actionPlane;
        var frameList = [];
        var frameName = "ShadowCreeper_2016_"
        this.sprite = actionPlane.create(0, 0, 'creeper', 'ShadowCreeper_2016_000.png');
        // for normal sheep
        // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[bump]]
        var frameListPerDirection = [[[0, 0], [0, 3], [6, 10], [12, 16], [18, 21], [24, 35], [36, 39], [36, 50], [51, 56], [57, 63], [256, 263]], // down
            [[64, 64], [64, 67], [70, 73], [76, 89], [82, 85], [88, 99], [100, 103], [100, 114], [115, 120], [121, 127], [264, 271]], // right
            [[128, 128], [128, 131], [134, 137], [140, 143], [146, 149], [152, 163], [164, 167], [164, 178], [179, 184], [185, 191], [272, 279]], // up 
            [[192, 192], [192, 195], [198, 201], [204, 207], [210, 213], [216, 227], [228, 231], [228, 242], [243, 248], [249, 255], [280, 287]]]; // left
        for (var i = 0; i < 4; i++) {
            var facingName = this.controller.levelView.getDirectionName(i);

            // idle sequence
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
            for (var j = 0; j < 12; j++)
                frameList.push(frameList[0]);
            this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // look left sequence ( look left -> pause for random time -> look front -> idle)
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
            this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "lookLeft" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 3);
            this.sprite.animations.add("lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look right sequence ( look right -> pause for random time -> look front -> idle)
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 3);
            this.sprite.animations.add("lookRight" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "lookRight" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 3);
            this.sprite.animations.add("lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look up sequence ( look up -> pause for random time -> look front -> play random idle)
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 3);
            this.sprite.animations.add("lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "lookAtCam" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 3);
            this.sprite.animations.add("lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look down
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 3);
            this.sprite.animations.add("lookDown" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "lookDown_2" + this.controller.levelView.getDirectionName(this.facing));
            });

            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][1], frameListPerDirection[i][4][0], ".png", 3);
            this.sprite.animations.add("lookDown_2" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // walk
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
            this.sprite.animations.add("walk" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // attack
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
            this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // take damage
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
            this.sprite.animations.add("hurt" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // die
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
            this.sprite.animations.add("die" + facingName, frameList, frameRate, false);
            // bump
            frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
            this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
        }
        // initialize
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
        this.sprite.x = this.offset[0] + 40 * this.position[0];
        this.sprite.y = this.offset[1] + 40 * this.position[1];
    }
}