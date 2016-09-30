import BaseEntity from "./BaseEntity.js"
import AssetLoader from "../LevelMVC/AssetLoader.js";
import LevelView from "../LevelMVC/LevelView.js"
import FacingDirection from "../LevelMVC/FacingDirection.js";
export default class Zombie extends BaseEntity {
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
        let frameRate = 12, pauseFrame = 30, randomPauseMin = 0.2, randomPauseMax = 1;
        let actionPlane = this.controller.levelView.actionPlane;
        var frameList = [];
        var frameName = "Zombie_"
        this.sprite = actionPlane.create(0, 0, 'zombie', 'Zombie_001.png');
        // for normal sheep
        // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[bump]]
        var frameListPerDirection = [[[73, 79], [57, 59], [61, 63], [69, 71], [65, 67], [80, 88], [89, 91], [93, 101], [102, 110], [229, 236]], // down
            [[183, 189], [167, 169], [171, 173], [179, 181], [175, 177], [190, 198], [199, 201], [203, 211], [212, 220], [245, 252]], // right
            [[18, 24], [2, 4], [6, 8], [14, 16], [10, 12], [25, 33], [34, 36], [38, 46], [47, 55], [221, 228]], // up 
            [[128, 134], [112, 114], [116, 118], [124, 126], [120, 122], [135, 143], [144, 146], [148, 156], [175, 165], [237, 244]]]; // left
        for (var i = 0; i < 4; i++) {
            var facingName = this.controller.levelView.getDirectionName(i);

            // idle sequence
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
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
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // walk
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
            this.sprite.animations.add("walk" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // attack
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
            this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // take damage
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
            this.sprite.animations.add("takeDamage" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // die
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
            this.sprite.animations.add("die" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // bump
            frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
            this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
        }
        // initialize
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
        this.sprite.x = this.offset[0] + 40 * this.position[0];
        this.sprite.y = this.offset[1] + 40 * this.position[1];
    }
}