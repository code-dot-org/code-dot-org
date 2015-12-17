var Collidable = require('./collidable');
var constants = require('./constants');
var studioMsg = require('./locale');
var spriteActions = require('./spriteActions');
var Direction = constants.Direction;
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

  this.height = options.height || 50;
  this.width = options.width || 50;

  /**
   * Rendering offset for item animation vs display position - applied as
   * late as possible.
   * @type {{x: number, y: number}}
   */
  this.renderOffset = options.renderOffset || { x: 0, y: 0 };

  this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED;
  this.displayDir = Direction.NONE;
  this.startFadeTime = null;
  this.fadeTime = constants.DEFAULT_ACTOR_FADE_TIME;

  this.image = null;
  this.legacyImage = null;
};
Sprite.inherits(Collidable);
module.exports = Sprite;

/**
 * Sets (or modifies) the image - we will generate a StudioSpriteSheet and
 * StudioAnimation in response..
 */
Sprite.prototype.setImage = function (image, totalAnimations) {
  if (image !== this.image) {
    this.image = image;
    this.totalAnimations = totalAnimations;

    var options = {
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      animationFrameDuration: this.animationFrameDuration,
      image: this.image,
      width: this.width,
      height: this.height,
      frames: this.frameCounts ? this.frameCounts.walk : this.frames,
      totalAnimations: totalAnimations
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

    var options = {
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      animationFrameDuration: this.animationFrameDuration,
      width: this.width,
      height: this.height,
      imageAsset: {
        spriteSheet: this.legacyImage,
        animations: {
          normal: {
            count: 1,
            frames: frameCounts.normal
          },
          turns: {
            count: 1,
            frames: frameCounts.turns
          },
          emotions: {
            count: 1,
            frames: frameCounts.emotions
          }
        },
      },
      horizontalAnimation: true,
      animationsInOneStrip: true
    };

    if (this.legacyAnimation_) {
      this.legacyAnimation_.removeElement();
    }

    /** @private {StudioAnimation} */
    this.legacyAnimation_ = new StudioAnimation($.extend({}, options, {
      spriteSheet: new StudioSpriteSheet(options),
      animationFrameDuration: this.getAnimationFrameDuration()
    }));
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

  if (this.dir !== this.displayDir && this.displayDir !== undefined) {
    if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
      this.displayDir = NextTurn[this.displayDir][this.dir];
    }
  }

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
  }
  if (this.legacyAnimation_) {
    this.legacyAnimation_.createElement(parentElement);
  }
};

/**
 * This function should be called every frame, and moves the sprite around.
 */
Sprite.prototype.update = function () {

  // Draw the sprite's current location.
  Studio.drawDebugRect("spriteCenter", this.x, this.y, 3, 3);

};

/**
 * Begin a fade out.
 */
Sprite.prototype.beginRemoveElement = function () {
  this.startFadeTime = new Date().getTime();
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
    // this.animation_.setOpacity(opacity);
    this.setOpacity(opacity);
  }

  var animationIndex = this.getDirectionFrame();
  if ((animationIndex >= this.totalAnimations) || (!this.animation_)) {
    // Legacy render path:
    if (this.animation_) {
      this.animation_.hide();
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.setCurrentAnimation('normal', 0);
      this.legacyAnimation_.redrawCenteredAt({
            x: this.x + this.renderOffset.x,
            y: this.y + this.renderOffset.y
          },
          Studio.tickCount);
      this.legacyAnimation_.show();
    }
  } else {
    this.animation_.setCurrentAnimation('direction', animationIndex);
    this.animation_.redrawCenteredAt({
          x: this.x + this.renderOffset.x,
          y: this.y + this.renderOffset.y
        },
        Studio.tickCount);
    this.animation_.show();
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
