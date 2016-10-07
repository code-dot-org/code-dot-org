import BaseEntity from "./BaseEntity.js"
import AssetLoader from "../LevelMVC/AssetLoader.js";
import LevelView from "../LevelMVC/LevelView.js"
import FacingDirection from "../LevelMVC/FacingDirection.js";
import EventType from "../Event/EventType.js";

export default class Sheep extends BaseEntity {
    constructor(controller, type, identifier, x, y, facing) {
        super(controller, type, identifier, x, y, facing);
        var zOrderYIndex = this.position[1];
        this.offset = [-43, -55];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex);
        this.naked = false;
    }

    use(commandQueueItem, userEntity) {
        this.controller.levelView.setSelectionIndicatorPosition(this.position[0], this.position[1]);
        commandQueueItem.succeeded();
        super.use(commandQueueItem, userEntity);
    }

    playMoveForwardAnimation(position, facing, commandQueueItem, groundType, completionHandler) {
        var levelModel = this.controller.levelModel, levelView = this.controller.levelView;
        var tween;
        // update z order
        var zOrderYIndex = position[1] + (facing === FacingDirection.Up ? 1 : 0);
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex) + 1;
        // stepping sound
        levelView.playBlockSound(groundType);
        // play walk animation
        var animName = "";
        if (this.naked)
            animName += "naked_";
        animName += "walk" + this.controller.levelView.getDirectionName(this.facing);
        levelView.playScaledSpeed(this.sprite.animations, animName);
        setTimeout(() => {
            tween = this.controller.levelView.addResettableTween(this.sprite).to({
                x: (this.offset[0] + 40 * position[0]), y: (this.offset[1] + 40 * position[1])
            }, 300, Phaser.Easing.Linear.None);
            tween.onComplete.add(() => {
                commandQueueItem.succeeded();
            });

            tween.start();
        }, 50);
        // smooth movement using tween

    }

    bump(commandQueueItem) {
        var animName = "";
        if (this.naked)
            animName += "naked_";
        animName += "bump";
        var facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.playScaledSpeed(this.sprite.animations, animName + facingName);
        this.controller.delayPlayerMoveBy(400, 800, () => {
            commandQueueItem.succeeded();
        });
    }

    prepareSprite() {
        let getRandomSecondBetween = function (min, max) {
            return (Math.random() * (max - min) + min) * 1000;
        }
        let frameRate = 10, pauseFrame = 30, randomPauseMin = 0.2, randomPauseMax = 1;
        let actionPlane = this.controller.levelView.actionPlane;
        var frameList = [];
        var frameName = "ShadowSheep_2016";
        this.sprite = actionPlane.create(0, 0, 'sheep', 'ShadowSheep_2016001.png');
        let stillFrameName = ['ShadowSheep_2016217.png','ShadowSheep_2016109.png','ShadowSheep_2016001.png','ShadowSheep_2016325.png'];
        let idleDelayFrame = 8;
        // for normal sheep
        // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[eat],[bump]]
        var frameListPerDirection = [[[252, 261], [220, 222], [228, 231], [276, 279], [270, 275], [282, 293], [294, 305], [306, 317], [318, 324], [234, 243], [880, 887]], // up 
            [[144, 153], [112, 114], [120, 123], [168, 171], [162, 167], [174, 185], [186, 197], [198, 209], [210, 216], [126, 135], [872, 879]], // right
            [[36, 45], [3, 6], [12, 15], [60, 63], [54, 59], [66, 77], [78, 89], [90, 101], [102, 108], [18, 27], [864, 871]], // down
            [[360, 369], [328, 330], [336, 339], [384, 387], [378, 383], [390, 401], [402, 413], [414, 425], [426, 432], [342, 351], [888, 895]]]; // left
        for (var i = 0; i < 4; i++) {
            var facingName = this.controller.levelView.getDirectionName(i);

            // idle sequence
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
            // idle delay
            for( var j = 0 ; j < idleDelayFrame ; j++)
                frameList.push(stillFrameName[i]);
            this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // look left sequence ( look left -> pause for random time -> look front -> idle)
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
            this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    
                    if(this.naked)
                        this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_lookLeft" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                    else
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
                    if(this.naked)
                        this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_lookRight" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                    else
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
                    if(this.naked)
                        this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_lookAtCam" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                    else
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
            this.sprite.animations.add("die" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // eat
            frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
            this.sprite.animations.add("eat" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // bump
            frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 3);
            this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
        }
        // for naked sheep
        // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[eat],[bump]]
        frameListPerDirection = [[[684, 693], [652, 654], [660, 663], [708, 711], [702, 707], [714, 725], [726, 737], [738, 749], [750, 756], [666, 675], [912, 919]], // up 
            [[576, 585], [544, 546], [552, 555], [600, 603], [594, 599], [606, 617], [618, 629], [630, 641], [642, 648], [558, 567], [904, 911]], // right
            [[468, 477], [436, 438], [444, 447], [492, 495], [486, 491], [498, 509], [510, 521], [522, 533], [534, 540], [450, 459], [896, 903]], // down
            [[792, 801], [760, 762], [768, 771], [816, 819], [810, 815], [822, 833], [834, 845], [846, 857], [858, 864], [774, 783], [920, 927]]]; // left
        stillFrameName = ['ShadowSheep_2016649.png','ShadowSheep_2016541.png','ShadowSheep_2016433.png','ShadowSheep_2016757.png'];
        for (var i = 0; i < 4; i++) {
            var facingName = this.controller.levelView.getDirectionName(i);

            // idle sequence
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
            // idle delay
            for( var j = 0 ; j < idleDelayFrame ; j++)
                frameList.push(stillFrameName[i]);
            this.sprite.animations.add("naked_idle" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // look left sequence ( look left -> pause for random time -> look front -> idle)
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
            this.sprite.animations.add("naked_lookLeft" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_lookLeft" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 3);
            this.sprite.animations.add("naked_lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look right sequence ( look right -> pause for random time -> look front -> idle)
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 3);
            this.sprite.animations.add("naked_lookRight" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_lookRight" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 3);
            this.sprite.animations.add("naked_lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look up sequence ( look up -> pause for random time -> look front -> play random idle)
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 3);
            this.sprite.animations.add("naked_lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_lookAtCam" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 3);
            this.sprite.animations.add("naked_lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // look down
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 3);
            this.sprite.animations.add("naked_lookDown" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // walk
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
            this.sprite.animations.add("naked_walk" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // attack
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
            this.sprite.animations.add("naked_attack" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // take damage
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
            this.sprite.animations.add("naked_hurt_" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // die
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
            this.sprite.animations.add("naked_die" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // eat
            frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
            this.sprite.animations.add("naked_eat" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.naked = false;
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
            // bump
            frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 3);
            this.sprite.animations.add("naked_bump" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + this.controller.levelView.getDirectionName(this.facing));
            });
        }

        // initialize
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
        this.sprite.x = this.offset[0] + 40 * this.position[0];
        this.sprite.y = this.offset[1] + 40 * this.position[1];
    }

    playRandomIdle(facing) {
        var facingName,
            rand,
            animationName = "";
        facingName = this.controller.levelView.getDirectionName(facing);
        rand = Math.trunc(Math.random() * 6) + 1;

        if (this.naked)
            animationName = "naked_";
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
            case 6:
                animationName += "eat";
            default:
        }

        animationName += facingName;
        this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
        this.controller.printErrorMsg(this.type + " calls animation : " + animationName + "\n");
    }

    attack(commandQueueItem) {
        let nakedSuffix = "";
        if (this.naked)
            nakedSuffix = "naked_";
        let facingName = this.controller.levelView.getDirectionName(this.facing);
        this.controller.levelView.onAnimationEnd(this.controller.levelView.playScaledSpeed(this.sprite.animations, nakedSuffix + "attack" + facingName),()=>{
        let frontEntity = this.controller.levelEntity.getEntityAt(this.controller.levelModel.getMoveForwardPosition(this));
        if(frontEntity !== null) {
            this.controller.levelView.onAnimationEnd(this.controller.levelView.playScaledSpeed(frontEntity.sprite.animations, nakedSuffix +  "hurt" + facingName),()=>{
            this.controller.events.forEach(e => e({ eventType: EventType.WhenAttacked, targetType: this.type, eventSenderIdentifier: this.identifier, targetIdentifier: frontEntity.identifier }))});
        }
        commandQueueItem.succeeded();
        });
    }


    updateAnimationDirection() {
        let suffix = "";
        let facingName = this.controller.levelView.getDirectionName(this.facing);
        if (this.naked)
            suffix = "naked_";
        this.controller.levelView.playScaledSpeed(this.sprite.animations, suffix + "idle" + facingName);
    }

    drop(commandQueueItem, itemType) {
        super.drop(commandQueueItem,itemType);
        if(itemType === 'wool')
        {
            // default behavior for drop ?
            if (!this.naked) {
                let direction = this.controller.levelView.getDirectionName(this.facing);
                this.naked = true;
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + direction, () => { });
            }
        }
    }
}