const BaseEntity = require("./BaseEntity.js");
const randomInt = require("./../LevelMVC/Utils.js").randomInt;
module.exports = class Ghast extends BaseEntity {
    constructor(controller, type, identifier, x, y, facing) {
        super(controller, type, identifier, x, y, facing);
        this.offset = [-50, -84];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(Number.MAX_SAFE_INTEGER);
        this.audioDelay = 15;
        if (x < 5) {
          this.patrolA();
        } else {
          this.patrolB();
        }
    }

    prepareSprite() {
        let getRandomSecondBetween = function (min, max) {
            return (Math.random() * (max - min) + min) * 1000;
        };
        let frameRate = 12, randomPauseMin = 0.2, randomPauseMax = 1;
        let actionGroup = this.controller.levelView.actionGroup;
        var frameList = [];
        var frameName = "Ghast";
        this.sprite = actionGroup.create(0, 0, 'ghast', 'Ghast0000.png');
        this.sprite.scale.setTo(1,1);
        let idleDelayFrame = 0;
        // [direction][[idle],[shoot]]
        var frameListPerDirection = [[[72, 83], [84, 95]], // down
        [[48, 59], [60, 71]], // right
        [[24, 35], [36, 47]], // up
        [[0, 11], [12, 23]]]; // left
        for (var i = 0; i < 4; i++) {
            var facingName = this.controller.levelView.getDirectionName(i);

            // idle sequence
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 4);

            let randomOffset = randomInt(2, frameList.length);
            let framesToOffset = [];
            for (let k = 0; k < randomOffset; ++k) {
              framesToOffset.push(frameList[0]);
              frameList.splice(0, 1);
            }
            for (let k = 0; k < framesToOffset.length; ++k) {
              frameList.push(framesToOffset[k]);
            }

            for (var j = 0; j < idleDelayFrame; j++) {
                frameList.push(frameList[0]);
            }
            this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.playRandomIdle(this.facing);
            });
            // shoot
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 4);
            this.sprite.animations.add("shoot" + facingName, frameList, frameRate, false).onComplete.add(() => {
                this.sprite.animations.stop();
                setTimeout(() => {
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "shoot" + this.controller.levelView.getDirectionName(this.facing) + "_2");
                }, getRandomSecondBetween(randomPauseMin, randomPauseMax));

            });
            frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 4);
            this.sprite.animations.add("shoot" + facingName + "_2", frameList, frameRate, false).onComplete.add(() => {
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            });
        }
        // initialize
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
        this.sprite.x = this.offset[0] + 40 * this.position.x;
        this.sprite.y = this.offset[1] + 40 * this.position.y;
    }

  /**
   * @override
   */
  canMoveThrough() {
    return true;
  }

  playRandomIdle(facing) {
    var facingName,
        animationName = "";
    facingName = this.controller.levelView.getDirectionName(facing);

    animationName += "idle";

    animationName += facingName;
    this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);

    if (this.audioDelay > 0) {
      --this.audioDelay;
    } else {
      this.audioDelay = 5;
      let chance = Math.floor(Math.random() * 5);
      if (chance === 0) {
        let soundNum = Math.floor(Math.random() * 4);
        this.playMoan(soundNum);
      }
    }
  }

  playMoan(number) {
    switch (number) {
      case 0:
        this.controller.audioPlayer.play("moan2");
        break;
      case 1:
        this.controller.audioPlayer.play("moan3");
        break;
      case 2:
        this.controller.audioPlayer.play("moan6");
        break;
      default:
        this.controller.audioPlayer.play("moan7");
        break;
    }
  }

  patrolA() {
    const options = [Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true];

    this.controller.levelView.addResettableTween(this.sprite).to({
        y: (this.offset[1] + 40 * this.position.y + 80),
      }, randomInt(2500, 3500), ...options);

    this.controller.levelView.addResettableTween(this.sprite).to({
        x: (this.offset[0] + 40 * this.position.x + 10),
      }, randomInt(1500, 2000), ...options);
  }

  patrolB() {
    const options = [Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true];

    this.controller.levelView.addResettableTween(this.sprite).to({
      y: (this.offset[1] + 40 * this.position.y - 80),
    }, randomInt(2500, 3500), ...options);

    this.controller.levelView.addResettableTween(this.sprite).to({
      x: (this.offset[0] + 40 * this.position.x - 10),
    }, randomInt(1500, 2000), ...options);
  }
};
