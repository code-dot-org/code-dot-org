var Collidable = require('./collidable');
var constants = require('./constants');
var studioMsg = require('./locale');
var spriteActions = require('./spriteActions');
var Direction = constants.Direction;
var Emotions = constants.Emotions;
var NextTurn = constants.NextTurn;
var utils = require('../utils'); // Provides Function.prototype.inherits
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
  this.setNormalFrameDuration(options.animationFrameDuration);
  this.displayDir = Direction.NONE;
  this.startFadeTime = null;
  this.fadeTime = 0;

  this.image = null;
  this.legacyImage = null;

  this.animation_ = null;
  this.legacyAnimation_ = null;

  this.useLegacyIdleEmotionAnimations = false;

  this.lastDrawPosition = { x: 0, y: 0 };
};
Sprite.inherits(Collidable);
module.exports = Sprite;


/**
 * FrameCounts objects are used in setImage and setLegacyImage:
 * @typedef {Object} FrameCounts
 * @property {number} walkFrames - frames in walk animations (spriteSheet)
 * @property {number} idleFrames - frames in idle animations (spriteSheet)
 * @property {number} walk - default frames in all types of animations (spriteSheet)
 * @property {number} idleNormal - number of idle animations (spriteSheet)
 * @property {number} idleEmotions - number of idle animations for each emotion (spriteSheet)
 * @property {number} walkingEmotions - number of south walking animations for each emotion (spriteSheet)
 * @property {number} turns - how many turn animations (applies to spriteSheet && legacySpriteSheet)
 * @property {boolean} counterClockwise - turn animations are in counter
 *    clockwise order (spriteSheet)
 * @property {number} packedSheetFrameCount - count of frames before wrapping
 *    for a packed sheet (applies to spriteSheet)
 * @property {number} normal - number of frames in idle animation (legacySpriteSheet)
 * @property {number} holdIdleFrame0Count - number of times to repeat frame 0 of idle animation (legacySpriteSheet)
 * @property {number} emotions - number of emotions included, 1 frame each (legacySpriteSheet)
 * @property {number} extraEmotions - number of emotions included, all frames cloned (legacySpriteSheet)
 */

/**
 * Sets (or modifies) the image for the preferred spritesheet format - we will
 * generate a StudioSpriteSheet and StudioAnimation in response..
 *
 * @param {string} image URL for spritesheet image
 * @param {FrameCounts} frameCounts metadata describing spritesheet
 */
Sprite.prototype.setImage = function (image, frameCounts) {
  if (image === this.image) {
    return;
  }

  this.image = image;

  var options = {
    renderScale: this.renderScale,
    opacity: this.opacity,
    loop: this.loop,
    animationFrameDuration: this.animationFrameDuration,
    frameWidth: this.drawWidth,
    frameHeight: this.drawHeight,
    assetPath: this.image,
    animations: [
      {
        type: 'direction',
        count: frameCounts.turns || 0,
        frames: frameCounts.walkFrames || frameCounts.walk
      },
      {
        type: 'idle',
        count: (frameCounts.idleNormal || 0) + (frameCounts.idleEmotions || 0),
        frames: frameCounts.idleFrames || frameCounts.walk
      },
      {
        type: 'walkingEmotions',
        count: frameCounts.walkingEmotions || 0,
        frames: frameCounts.walkFrames || frameCounts.walk
      }
    ],
    packedSheetFrameCount: frameCounts.packedSheetFrameCount,
    defaultFramesPerAnimation: frameCounts.walk,
    skewAnimations: true
  };

  if (this.animation_) {
    this.animation_.removeElement();
  }

  if (!this.image) {
    this.animation_ = null;
    return;
  }

  this.animation_ = new StudioAnimation($.extend({}, options, {
    spriteSheet: new StudioSpriteSheet(options),
    animationFrameDuration: this.getAnimationFrameDuration()
  }));
};

/**
 * Sets (or modifies) the image for the legacy spritesheet format - we will
 * generate a StudioSpriteSheet and StudioAnimation in response..
 *
 * The "legacy" spritesheet format was used by all of the original playlab
 * skins. Typically a single horizontal strip of images.
 *
 * Originally, it contained a normal frame and an optional blink frame
 * (later extended into an idle animation), a single frame for each direction
 * (called turns), and a single frame for each emotion.
 *
 * In late 2014, walking animations were added in a separate spritesheet. The
 * app switches between showing the walking spritesheet and the original
 * spritesheet when walking starts and stops.
 *
 * In late 2015, the original spritesheet format was extended to replicate all
 * of the non-walking frames in the original format for each emotion, such that
 * it contained multiple rows of images (extraEmotions)
 *
 * @param {string} image URL for spritesheet image
 * @param {FrameCounts} frameCounts metadata describing spritesheet
 */
Sprite.prototype.setLegacyImage = function (image, frameCounts) {
  if (image === this.legacyImage) {
    return;
  }

  this.legacyImage = image;

  var rowCount = 1 + utils.valueOr(frameCounts.extraEmotions, 0);
  var frameCount = frameCounts.normal + frameCounts.turns + frameCounts.emotions;

  var options = {
    renderScale: this.renderScale,
    opacity: this.opacity,
    loop: this.loop,
    animationFrameDuration: this.animationFrameDuration,
    frameWidth: this.drawWidth,
    frameHeight: this.drawHeight,
    assetPath: this.legacyImage,
    animations: [
      {
        type: 'legacyEmotionRow',
        count: rowCount,
        frames: frameCount
      }
    ],
    defaultFramesPerAnimation: frameCount,
    horizontalAnimation: true,
    skewAnimations: true
  };

  if (this.legacyAnimation_) {
    this.legacyAnimation_.removeElement();
  }

  if (!this.legacyImage) {
    this.legacyAnimation_ = null;
    return;
  }

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
            [{ type: 'legacyEmotionRow', index: row, frame: 0 }]);
        turnIndex++;
      }
      for (;turnIndex < 8; turnIndex++, frameIndex++) {
        this.legacyAnimation_.createSpecialAnimation('direction',
            turnIndex,
            [{ type: 'legacyEmotionRow',
                index: row,
                frame: this.frameCounts.normal + frameIndex
            }]);
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
};

/** @returns {SVGImageElement} */
Sprite.prototype.getElement = function () {
  return this.animation_ ? this.animation_.getElement() : null;
};

/** @returns {SVGImageElement} */
Sprite.prototype.getLegacyElement = function () {
  return this.legacyAnimation_ ? this.legacyAnimation_.getElement() : null;
};

/**
 * Returns the frame of the spritesheet for the current walking direction.
 */
Sprite.prototype.getDirectionFrame = function () {

  var frameDirTable = this.frameCounts.counterClockwise ?
    constants.frameDirTableWalkingWithIdleCounterclockwise :
    constants.frameDirTableWalkingWithIdleClockwise;

  return frameDirTable[this.displayDir];
};

/**
 * Create an image element with a clip path
 */
Sprite.prototype.createElement = function (parentElement) {
  if (this.animation_) {
    if (!this.animation_.getElement()) {
      this.animation_.createElement(parentElement);
    }
    if (!this.visible) {
      this.animation_.hide();
    }
  }
  if (this.legacyAnimation_) {
    if (!this.legacyAnimation_.getElement()) {
      this.legacyAnimation_.createElement(parentElement);
    }
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
Sprite.prototype.removeElement = function () {
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
    return this.normalFrameDuration;
  } else {
    return this.normalFrameDuration * constants.DEFAULT_SPRITE_SPEED / this.speed;
  }
};

/**
 * Returns true if the item is currently fading away.
 */
Sprite.prototype.isFading = function () {
  return !!this.startFadeTime;
};

/**
 * Returns true if the item has finished fading away.  The caller will usually
 * then call removeElement to destroy this item's assets.
 */
Sprite.prototype.hasCompletedFade = function () {
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

  var drawPosition = this.getCurrentDrawPosition();

  if (useLegacyAnimation) {
    // Legacy render path:
    if (this.animation_) {
      this.animation_.hide();
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.setCurrentAnimation(animationType, animationIndex);
      this.legacyAnimation_.redrawCenteredAt(drawPosition, Studio.tickCount);
      if (this.visible) {
        this.legacyAnimation_.show();
      } else {
        this.legacyAnimation_.hide();
      }
    }
  } else {
    this.animation_.setCurrentAnimation(animationType, animationIndex);
    this.animation_.redrawCenteredAt(drawPosition, Studio.tickCount);
    if (this.visible) {
      this.animation_.show();
    } else {
      this.animation_.hide();
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.hide();
    }
  }

  this.lastDrawPosition = drawPosition;
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

/** @returns {object} the center x, y coordinates for the next draw */
Sprite.prototype.getCurrentDrawPosition = function () {
  return {
    x: this.displayX + (this.drawWidth / 2) + this.renderOffset.x,
    y: this.displayY + (this.drawHeight / 2) + this.renderOffset.y
  };
};

Sprite.prototype.updateAnimationFrameDuration_ = function () {
  if (this.animation_) {
    this.animation_.setAnimationFrameDuration(this.getAnimationFrameDuration());
  }
  if (this.legacyAnimation_) {
    this.legacyAnimation_.setAnimationFrameDuration(
        this.getAnimationFrameDuration());
  }
};

/**
 * Sets the speed and changes the animation frame duration to match.
 * @param {number} speed Number of pixels to move per tick
 */
Sprite.prototype.setSpeed = function (speed) {
  this.speed = speed;
  this.updateAnimationFrameDuration_();
};

/**
 * Sets the direction and changes the animation frame duration based on direction.
 * @param {number} direction
 */
Sprite.prototype.setDirection = function (direction) {
  this.dir = direction;
  this.updateAnimationFrameDuration_();
};

/**
 * Sets the normal animation frame duration and changes the current animation
 * frame duration to match.
 * @param {number} duration Number of ticks per frame
 */
Sprite.prototype.setNormalFrameDuration = function (duration) {
  this.normalFrameDuration = duration ||
      constants.DEFAULT_SPRITE_ANIMATION_FRAME_DURATION;
  this.updateAnimationFrameDuration_();
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
};
