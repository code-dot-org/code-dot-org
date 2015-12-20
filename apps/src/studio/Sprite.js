var Collidable = require('./collidable');
var constants = require('./constants');
var studioMsg = require('./locale');
var spriteActions = require('./spriteActions');
var Direction = constants.Direction;
var Emotions = constants.Emotions;
var NextTurn = constants.NextTurn;
var utils = require('../utils');
var _ = utils.getLodash();
var StudioAnimation = require('./StudioAnimation');
var StudioSpriteSheet = require('./StudioSpriteSheet');

/**
 * A Sprite is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 * @extends {Collidable}
 */
var Sprite = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  /**
   * Rendering offset for item animation vs display position - applied as
   * late as possible.
   * @type {{x: number, y: number}}
   */
  this.renderOffset = options.renderOffset || { x: 0, y: 0 };

  this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED;
  this.displayDir = Direction.NONE;
  this.startFadeTime = null;
  this.fadeTime = 0;

  this.image = null;
  this.legacyImage = null;

  this.animation_ = null;
  this.legacyAnimation_ = null;

  this.useLegacyIdleEmotionAnimations = false;
};
Sprite.inherits(Collidable);
module.exports = Sprite;

/**
 * Sets (or modifies) the image - we will generate a StudioSpriteSheet and
 * StudioAnimation in response..
 */
Sprite.prototype.setImage = function (image, frameCounts) {
  if (image !== this.image) {
    this.image = image;

    var options = {
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      animationFrameDuration: this.animationFrameDuration,
      width: this.drawWidth,
      height: this.drawHeight,
      imageAsset: {
        spriteSheet: this.image,
        animations: {
          'direction': {
            count: frameCounts.turns || 0
          },
          'idle': {
            count: (frameCounts.idleNormal || 0) + (frameCounts.idleEmotions || 0)
          },
          'walkingEmotions': {
            count: frameCounts.walkingEmotions || 0
          }
        },
        defaultFramesPerAnimation: frameCounts.walk
      },
      skewAnimations: true
    };

    if (this.animation_) {
      this.animation_.removeElement();
    }

    /** @private {StudioAnimation} */
    this.animation_ = new StudioAnimation($.extend({}, options, {
      spriteSheet: new StudioSpriteSheet(options),
      animationFrameDuration: this.getAnimationFrameDuration()
    }));
  }
};

Sprite.prototype.setLegacyImage = function (image, frameCounts) {
  if (image !== this.legacyImage) {
    this.legacyImage = image;

    var rowCount = 1 + utils.valueOr(frameCounts.extraEmotions, 0);
    var frameCount = frameCounts.normal + frameCounts.turns + frameCounts.emotions;

    var options = {
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      animationFrameDuration: this.animationFrameDuration,
      width: this.drawWidth,
      height: this.drawHeight,
      imageAsset: {
        spriteSheet: this.legacyImage,
        animations: {
          legacyEmotionRow: {
            count: rowCount,
            frames: frameCount
          }
        },
        defaultFramesPerAnimation: frameCount
      },
      horizontalAnimation: true,
      skewAnimations: true
    };

    if (this.legacyAnimation_) {
      this.legacyAnimation_.removeElement();
    }

    /** @private {StudioAnimation} */
    this.legacyAnimation_ = new StudioAnimation($.extend({}, options, {
      spriteSheet: new StudioSpriteSheet(options),
      animationFrameDuration: this.getAnimationFrameDuration()
    }));

    var turnCount = utils.valueOr(frameCounts.turns, 0);
    var frame0Count = utils.valueOr(frameCounts.holdIdleFrame0Count, 1);
    var i, animationList;

    for (var row = 0; row < rowCount; row++) {
      // Create a new special animation called "idle":
      animationList = [];

      for (i = 0; i < frame0Count; i++) {
        animationList.push({
          type: 'legacyEmotionRow',
          index: row,
          frame: 0
        });
      }
      for (i = 1; i < frameCounts.normal; i++) {
        animationList.push({
          type: 'legacyEmotionRow',
          index: row,
          frame: i
        });
      }
      this.legacyAnimation_.createSpecialAnimation('idle', row, animationList);

      // Create single-frame 'direction' animations from each 'turn' frame:
      if (turnCount >= 7) {
        var turnIndex = 0;
        var frameIndex = 0;
        if (turnCount === 7) {
          // If turnCount is only 7, create the first animation from 'normal'
          // frame 0.
          this.legacyAnimation_.createSpecialAnimation('direction',
              turnIndex,
              [ { type: 'legacyEmotionRow', index: row, frame: 0 } ]);
          turnIndex++;
        }
        for (;turnIndex < 8; turnIndex++, frameIndex++) {
          this.legacyAnimation_.createSpecialAnimation('direction',
              turnIndex,
              [ { type: 'legacyEmotionRow',
                  index: row,
                  frame: this.frameCounts.normal + frameIndex
              } ]);
        }
      }
    }

    if (rowCount === 1) {
      // If no extra emotions were supplied as complete rows, we can create
      // special idle animations for each emotion from single emotion frames:

      for (i = 0; i < frameCounts.emotions; i++) {
      // Create a new special animation called "idle" with emotion as index:
        animationList = [];
        for (var j = 0; j < frame0Count; j++) {
          animationList.push({
            type: 'legacyEmotionRow',
            index: 0,
            frame: frameCounts.normal + frameCounts.turns + i
          });
        }
        for (var k = 1; k < frameCounts.normal; k++) {
          animationList.push({
            type: 'legacyEmotionRow',
            index: 0,
            frame: k
          });
        }
        this.legacyAnimation_.createSpecialAnimation('idle', i + 1, animationList);
        this.useLegacyIdleEmotionAnimations = true;
      }
    }
  }
};

/** @returns {SVGImageElement} */
Sprite.prototype.getElement = function () {
  return this.animation_.getElement();
};

/** @returns {SVGImageElement} */
Sprite.prototype.getLegacyElement = function () {
  return this.legacyAnimation_.getElement();
};

/**
 * Returns the frame of the spritesheet for the current walking direction.
 */
Sprite.prototype.getDirectionFrame = function() {
  // Every other frame, if we aren't yet rendering in the correct direction,
  // assign a new displayDir from state table; only one turn at a time.

  // TODO (cpirich): re-enable this or place in display or update

  // temporarily disabled as it is redundant
  /*
  if (this.dir !== this.displayDir && this.displayDir !== undefined) {
    if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
      this.displayDir = NextTurn[this.displayDir][this.dir];
    }
  }
  */

  var frameDirTable = this.spritesCounterclockwise ?
    constants.frameDirTableWalkingWithIdleCounterclockwise :
    constants.frameDirTableWalkingWithIdleClockwise;

  return frameDirTable[this.displayDir];
};

/**
 * Create an image element with a clip path
 */
Sprite.prototype.createElement = function (parentElement) {
  if (this.animation_) {
    this.animation_.createElement(parentElement);
    if (!this.visible) {
      this.animation_.hide();
    }
  }
  if (this.legacyAnimation_) {
    this.legacyAnimation_.createElement(parentElement);
    if (!this.visible) {
      this.legacyAnimation_.hide();
    }
  }
};

/**
 * This function should be called every frame, and moves the sprite around.
 */

// TODO (cpirich): ensure that update is called for Sprite object

Sprite.prototype.update = function () {

  // Draw the sprite's current location.
  Studio.drawDebugRect("spriteCenter", this.x, this.y, 3, 3);

};

/**
 * Begin a fade out.
 * @param {!number} fadeTime - the duration of the fade (in milliseconds)
 */
Sprite.prototype.startFade = function (fadeTime) {
  this.startFadeTime = new Date().getTime();
  this.fadeTime = utils.valueOr(fadeTime, constants.DEFAULT_ACTOR_FADE_TIME);
};

/**
 * Remove our element/clipPath/animator
 */
Sprite.prototype.removeElement = function() {
  if (this.animation_) {
    this.animation_.removeElement();
  }
  if (this.legacyAnimation_) {
    this.legacyAnimation_.removeElement();
  }
};

/**
 * Retrieve animation frame duration (frames per tick)
 */
Sprite.prototype.getAnimationFrameDuration = function () {
  if (this.dir === Direction.NONE) {
    return constants.DEFAULT_SPRITE_ANIMATION_FRAME_DURATION;
  } else {
    return constants.DEFAULT_SPRITE_ANIMATION_FRAME_DURATION *
        constants.DEFAULT_SPRITE_SPEED / this.speed;
  }
};

/**
 * Returns true if the item is currently fading away.
 */
Sprite.prototype.isFading = function() {
  return !!this.startFadeTime;
};

/**
 * Returns true if the item has finished fading away.  The caller will usually
 * then call removeElement to destroy this item's assets.
 */
Sprite.prototype.hasCompletedFade = function() {
  var currentTime = new Date().getTime();

  return this.startFadeTime && currentTime > this.startFadeTime + this.fadeTime;
};

/**
 * Display our item at its current location
 */
Sprite.prototype.display = function () {
  var currentTime = new Date().getTime();
  var opacity = 1;
  if (this.startFadeTime) {
    opacity = 1 - (currentTime - this.startFadeTime) / this.fadeTime;
    opacity = Math.max(opacity, 0);
    this.setOpacity(opacity);
    if (this.hasCompletedFade()) {
      // NOTE: we don't automatically change the state to hidden or set visible
      // to false here.
      this.startFadeTime = null;
    }
  }

  var useLegacyAnimation = false;
  var animationType;
  var animationIndex;
  var standingStill = this.displayDir === Direction.NONE;
  var facingSouthWithEmotion =
      this.displayDir === Direction.SOUTH && this.emotion !== Emotions.NORMAL;

  if (standingStill || (!this.animation_ && facingSouthWithEmotion)) {
    // Show idle animation while standing still
    // if we only have a legacy animation, also show while moving south
    animationIndex = this.emotion;
    animationType = 'idle';

    if (standingStill && this.frameCounts.normal) {
      // If we see legacy normal frames (which are "idle" animations), use them:
      useLegacyAnimation = true;
    } else if (this.animation_ && !this.frameCounts.idleNormal) {
      // If we are playing an "idle" animation from the primary spritesheet and
      // there were no "normal" idle animations in the sheet, index based on
      // (emotion - 1) instead of (emotion)
      animationIndex -= 1;
    }
  } else if (facingSouthWithEmotion &&
      this.animation_ && this.animation_.hasType('walkingEmotions')) {
    animationIndex = this.emotion - 1;
    animationType = 'walkingEmotions';
  } else {
    animationIndex = this.getDirectionFrame();
    animationType = 'direction';
  }
  if (!this.animation_) {
    useLegacyAnimation = true;
  }

  if (useLegacyAnimation) {
    // Legacy render path:
    if (this.animation_) {
      this.animation_.hide();
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.setCurrentAnimation(animationType, animationIndex);
      this.legacyAnimation_.redrawCenteredAt({
            x: this.displayX + (this.drawWidth / 2) + this.renderOffset.x,
            y: this.displayY + (this.drawHeight / 2) + this.renderOffset.y
          },
          Studio.tickCount);
      if (this.visible) {
        this.legacyAnimation_.show();
      } else {
        this.legacyAnimation_.hide();
      }
    }
  } else {
    this.animation_.setCurrentAnimation(animationType, animationIndex);
    this.animation_.redrawCenteredAt({
          x: this.displayX + (this.drawWidth / 2) + this.renderOffset.x,
          y: this.displayY + (this.drawHeight / 2) + this.renderOffset.y
        },
        Studio.tickCount);
    if (this.visible) {
      this.animation_.show();
    } else {
      this.animation_.hide();
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.hide();
    }
  }
};

Sprite.prototype.getNextPosition = function () {
  var unit = Direction.getUnitVector(this.dir);
  var speed = this.speed;
  return {
    x: this.x + speed * unit.x,
    y: this.y + speed * unit.y
  };
};

Sprite.prototype.moveToNextPosition = function () {
  var next = this.getNextPosition();
  this.x = next.x;
  this.y = next.y;
};

/**
 * Sets the speed and changes the animation frame duration to match.
 * @param {number} speed Number of pixels to move per tick
 */
Sprite.prototype.setSpeed = function (speed) {
  this.speed = speed;
  if (this.animation_) {
    this.animation_.setAnimationFrameDuration(this.getAnimationFrameDuration());
  }
  if (this.legacyAnimation_) {
    this.legacyAnimation_.setAnimationFrameDuration(
        this.getAnimationFrameDuration());
  }
};

/**
 * Change visible opacity of this collidable sprite.
 * @param {number} newOpacity (between 0 and 1)
 */
Sprite.prototype.setOpacity = function (newOpacity) {

  if (this.animation_) {
    this.animation_.setOpacity(newOpacity);
  }
  if (this.legacyAnimation_) {
    this.legacyAnimation_.setOpacity(newOpacity);
  }

  // TODO (cpririch): Remove this and rely on animation rendering only

  var spriteIndex = Studio.sprite.indexOf(this);
  if (spriteIndex < 0) {
    return;
  }

  var spriteRegularIcon = document.getElementById('sprite' + spriteIndex);
  var spriteWalkIcon = document.getElementById('spriteWalk' + spriteIndex);
  if (spriteRegularIcon) {
    spriteRegularIcon.setAttribute('opacity', newOpacity);
  }
  if (spriteWalkIcon) {
    spriteWalkIcon.setAttribute('opacity', newOpacity);
  }
};
