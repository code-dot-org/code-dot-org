import {generateFrameNames} from '../LevelMVC/Utils';

import BaseEntity from './BaseEntity';
export default class Cow extends BaseEntity {
    constructor(controller, type, identifier, x, y, facing) {
        super(controller, type, identifier, x, y, facing);
        this.offset = [-43, -55];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(this.position.y);
    }

    prepareSprite() {
        let getRandomSecondBetween = function (min, max) {
            return (Math.random() * (max - min) + min) * 1000;
        };
        let frameRate = 12, randomPauseMin = 0.2, randomPauseMax = 1;
        let actionGroup = this.controller.levelView.actionGroup;
        var frameList = [];
        var frameName = "Cow";
        this.sprite = this.controller.levelView.createSprite(actionGroup, 0, 0, 'cow', 'Cow0001.png');
        let stillFrameName = ['Cow0222.png', 'Cow0111.png', 'Cow0001.png', 'Cow0333.png'];
        let idleDelayFrame = 20;
        // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[bump],[idle2],[eat]]
        var frameListPerDirection = [[[258, 264], [225, 227], [224, 226], [285, 287], [240, 241], [291, 302], [303, 313], [314, 326], [327, 332], [460, 467], [276, 282], [240, 249]], // down
        [[147, 153], [114, 116], [129, 130], [174, 176], [129, 130], [180, 191], [192, 202], [203, 215], [216, 221], [452, 459], [165, 171], [129, 138]], // right
        [[36, 42], [3, 5], [12, 14], [63, 65], [18, 19], [69, 80], [81, 91], [92, 104], [105, 110], [444, 451], [51, 54], [18, 27]], // up
        [[369, 375], [336, 338], [335, 337], [396, 398], [351, 352], [402, 413], [414, 424], [425, 437], [438, 443], [468, 475], [387, 393], [351, 360]]]; // left
        for (var i = 0; i < 4; i++) {
            var facingName = this.controller.levelView.getDirectionName(i);

            // idle sequence
            frameList = [];
            for (var j = 0; j < idleDelayFrame; j++) {
                frameList.push(stillFrameName[i]);
            }
            this.addAnimation("idle" + facingName, frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle2" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look left sequence ( look left -> pause for random time -> look front -> idle)
            frameList = generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 4);
            this.addAnimation("lookLeft" + facingName, frameList, frameRate, false, () => {
                this.sprite.anims.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite, "lookLeft" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
            });
            frameList = generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 4);
            this.addAnimation("lookLeft" + facingName + "_2", frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look right sequence ( look right -> pause for random time -> look front -> idle)
            frameList = generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 4);
            this.addAnimation("lookRight" + facingName, frameList, frameRate, false, () => {
                //this.sprite.anims.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite, "lookRight" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 4);
            this.addAnimation("lookRight" + facingName + "_2", frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look up sequence ( look up -> pause for random time -> look front -> play random idle)
            frameList = generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 4);
            this.addAnimation("lookAtCam" + facingName, frameList, frameRate, false, () => {
                //this.sprite.anims.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite, "lookAtCam" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
            });
            frameList = generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 4);
            this.addAnimation("lookAtCam" + facingName + "_2", frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look down
            frameList = generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 4);
            this.addAnimation("lookDown" + facingName, frameList, frameRate, false, () => {
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite, "lookDown" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
            });

            frameList = generateFrameNames(frameName, frameListPerDirection[i][4][1], frameListPerDirection[i][4][0], ".png", 4);
            this.addAnimation("lookDown" + facingName + "_2", frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // walk
            frameList = generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 4);
            this.addAnimation("walk" + facingName, frameList, frameRate, true);
            // attack
            frameList = generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 4);
            this.addAnimation("attack" + facingName, frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // take damage
            frameList = generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 4);
            this.addAnimation("hurt" + facingName, frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // die
            frameList = generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 4);
            this.addAnimation("die" + facingName, frameList, frameRate, false);
            // bump
            frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 4);
            this.addAnimation("bump" + facingName, frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // idle2 sequence
            if (i === 2) {
                frameList = generateFrameNames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 4);
                this.addAnimation("idle2" + facingName, frameList, frameRate / 2, false, () => {
                    this.controller.levelView.playScaledSpeed(this.sprite, "idle2" + this.controller.levelView.getDirectionName(this.facing) + "_reverse");
                });

                frameList = generateFrameNames(frameName, frameListPerDirection[i][10][1], frameListPerDirection[i][10][0], ".png", 4);
                this.addAnimation("idle2" + facingName + "_reverse", frameList, frameRate / 2, false, () => {
                    this.playRandomIdle(this.facing);
                });
            } else {
                frameList = generateFrameNames(frameName, frameListPerDirection[i][10][1], frameListPerDirection[i][10][0], ".png", 4);
                this.addAnimation("idle2" + facingName, frameList, frameRate, false, () => {
                    this.controller.levelView.playScaledSpeed(this.sprite, "idle2" + this.controller.levelView.getDirectionName(this.facing) + "_reverse");
                });
                frameList = generateFrameNames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 4);
                this.addAnimation("idle2" + facingName + "_reverse", frameList, frameRate, false, () => {
                    this.playRandomIdle(this.facing);
                });
            }
            // eat
            frameList = generateFrameNames(frameName, frameListPerDirection[i][11][0], frameListPerDirection[i][11][1], ".png", 4);
            this.addAnimation("eat" + facingName, frameList, frameRate, false, () => {
                this.sprite.anims.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite, "eat" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
            });
            frameList = generateFrameNames(frameName, frameListPerDirection[i][11][1], frameListPerDirection[i][11][0], ".png", 4);
            this.addAnimation("eat" + facingName + "_2", frameList, frameRate, false, () => {
                this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });

        }
        // initialize
        this.controller.levelView.playScaledSpeed(this.sprite, "idle" + this.controller.levelView.getDirectionName(this.facing));
        this.sprite.x = this.offset[0] + 40 * this.position.x;
        this.sprite.y = this.offset[1] + 40 * this.position.y;
    }

    playRandomIdle(facing) {
        var facingName,
            rand,
            animationName = "";
        facingName = this.controller.levelView.getDirectionName(facing);
        rand = Math.trunc(Math.random() * 5) + 1;

        switch (rand) {
            case 1:
                animationName += "idle";
                break;
            case 2:
                animationName += "lookLeft";
                break;
            case 3:
                animationName += "lookRight";
                break;
            case 4:
                animationName += "lookAtCam";
                break;
            case 5:
                animationName += "lookDown";
                break;
            default:
        }

        animationName += facingName;
        this.controller.levelView.playScaledSpeed(this.sprite,animationName);
        this.controller.printErrorMsg(this.type + " calls animation : " + animationName + "\n");
    }
};
