/** @file An animated image, which handles frame counts, rates and offsets
 * internally and exposes simple methods for rendering at the desired position. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var SVG_NS = require('../constants').SVG_NS;

// Unique element ID that increments by 1 each time an element is created
var uniqueId = 0;

/**
 * A StudioAnimation represents an animation asset that can be created,
 * positioned and rendered by other code.  It tries to hide away all the
 * details of actually rendering the correct frame at the correct offset
 * and advancing frames at the correct rate.
 * @constructor
 * @param {!Object} options
 * @param {!StudioSpriteSheet} spriteSheet - The source asset for this animation,
 *        wrapped in necessary metadata.
 * @param {number} [options.renderScale] - Default 1.
 * @param {number} [options.opacity] - Opacity on a 0-1 scale.  Default 1.
 * @param {number} [options.animationFrameDuration] - How fast the animation
 *        should be played, in 30 fps ticks per frame.  Default 1 (30 fps).
 * @param {boolean} [options.loop] - Whether the animation should loop
 *        automatically.  Default false.
 */
var StudioAnimation = module.exports = function (options) {
  /** @private {StudioSpriteSheet} */
  this.spriteSheet_ = options.spriteSheet;

  /** @private {number} render scale */
  this.renderScale_ = utils.valueOr(options.renderScale, 1);

  /** @private {number} opacity on a scale of 0 (transparent) to 1 (opaque) */
  this.opacity_ = utils.valueOr(options.opacity, 1);

  /**
   * Which animation type (a group of columns in the sprite sheet) is currently
   * playing.
   * @private {number}
   */
  this.currentAnimationType_ = 0;

  /**
   * Which animation (which column in the sprite sheet for a given type) is
   * currently playing.
   * @private {number}
   */
  this.currentAnimationIndex_ = 0;

  /** @private {boolean} whether the animation should loop automatically. */
  this.loop_ = utils.valueOr(options.loop, false);

  /** @private {SVGImageElement} */
  this.element_ = null;

  /** @private {SVGElement} */
  this.clipPath_ = null;

  /** @private {number} frame duration of current animation (1/30 sec ticks). */
  this.animationFrameDuration_ = options.animationFrameDuration || 1;
};

/**
 * Test only function so that we can start our id count over.
 */
StudioAnimation.__resetIds = function () {
  uniqueId = 0;
};

/** @returns {SVGImageElement} */
StudioAnimation.prototype.getElement = function () {
  return this.element_;
};

/**
 * Create an image element with a clip path
 */
StudioAnimation.prototype.createElement = function (parentElement) {
  if (this.element_ && this.clipPath_) {

    // Update the clip rect
    var clipRect = this.clipPath_.childNodes[0];
    clipRect.setAttribute('width', this.spriteSheet_.frameWidth * this.renderScale_);
    clipRect.setAttribute('height', this.spriteSheet_.frameHeight * this.renderScale_);

    // Update the image and asset rect
    this.element_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
       this.spriteSheet_.assetPath);
    this.element_.setAttribute('height',
        this.spriteSheet_.assetHeight() * this.renderScale_);
    this.element_.setAttribute('width',
        this.spriteSheet_.assetWidth() * this.renderScale_);

    return;
  }

  this.animId = (uniqueId++);

  // create our clipping path/rect
  this.clipPath_ = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'studioanimation_clippath_' + this.animId;
  this.clipPath_.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', this.spriteSheet_.frameWidth * this.renderScale_);
  rect.setAttribute('height', this.spriteSheet_.frameHeight * this.renderScale_);
  this.clipPath_.appendChild(rect);
  parentElement.appendChild(this.clipPath_);

  var itemId = 'studioanimation_' + this.animId;
  this.element_ = document.createElementNS(SVG_NS, 'image');
  this.element_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
     this.spriteSheet_.assetPath);
  this.element_.setAttribute('id', itemId);
  this.element_.setAttribute('height',
      this.spriteSheet_.assetHeight() * this.renderScale_);
  this.element_.setAttribute('width',
      this.spriteSheet_.assetWidth() * this.renderScale_);
  parentElement.appendChild(this.element_);

  this.element_.setAttribute('clip-path', 'url(#' + clipId + ')');
};

/**
 * Remove our element/clipPath/animator
 */
StudioAnimation.prototype.removeElement = function() {

  if (this.element_) {
    this.element_.parentNode.removeChild(this.element_);
    this.element_ = null;
  }

  // remove clip path element
  if (this.clipPath_) {
    this.clipPath_.parentNode.removeChild(this.clipPath_);
    this.clipPath_ = null;
  }

};

/**
 * Display the current frame at the given location
 */
StudioAnimation.prototype.redrawCenteredAt = function (center, tickCount) {
  var animTick = tickCount;

  // Each animation will start at a different frame when this is enabled:
  if (this.skewAnimations) {
    // NOTE: not intended to be used with non-looping animations
    animTick = tickCount + this.animId * (this.animationFrameDuration_ + 1);
  }

  var currentFrame = Math.floor(animTick / this.animationFrameDuration_);
  var framesInThisAnimation =
      this.spriteSheet_.getAnimationFrameCount(this.currentAnimationType_);

  if (this.loop_) {
    currentFrame = currentFrame % framesInThisAnimation;
  } else {
    currentFrame = Math.min(currentFrame, framesInThisAnimation - 1);
  }

  var frame = this.spriteSheet_.getFrame(this.currentAnimationType_,
      this.currentAnimationIndex_,
      currentFrame);

  var scale = this.renderScale_;

  // Preserved behavior: When scaling a sprite up, we actually scale around the
  //       bottom-center of the sprite (so feet stay planted in the same place)
  //       rather than actually around its center.
  //       That's what the (2 * scale - 1) bit is about; just change that to
  //       (scale) if you want to scale about the sprite center again.
  // TODO: Improve this by scaling around an explicitly encoded 'sprite center'
  var topLeft = {
    x: center.x - (frame.width / 2) * scale,
    y: center.y - (frame.height / 2) * (2 * scale - 1)
  };

  // Offset the spritesheet DOM element by the inverse of the offset of the
  // frame we want to display.
  this.element_.setAttribute('x', topLeft.x - frame.left * scale);
  this.element_.setAttribute('y', topLeft.y - frame.top * scale);
  this.element_.setAttribute('opacity', this.opacity_);

  // Then set the clip rect to the position where we want to display it, so
  // only the frame that's now positioned correctly is shown.
  var clipRect = this.clipPath_.childNodes[0];
  clipRect.setAttribute('x', topLeft.x);
  clipRect.setAttribute('y', topLeft.y);
};

/**
 * Sets which animation to play out of the sprite sheet.
 * Animations are indexed by their position in the sprite sheet, where each
 * animation is its own column and animation zero is the far-left column.
 * @param {!string} animationType
 * @param {!number} animationIndex
 */
StudioAnimation.prototype.setCurrentAnimation = function (animationType, animationIndex) {
  this.currentAnimationType_ = animationType;
  this.currentAnimationIndex_ = animationIndex;
};

/**
 * Set the animation speed for this item's sprite.
 * @param {number} ticksPerFrame
 */
StudioAnimation.prototype.setAnimationFrameDuration = function (ticksPerFrame) {
  this.animationFrameDuration_ = ticksPerFrame;
};

/**
 * Change visible opacity of this animation.
 * @param {number} newOpacity (between 0 and 1)
 */
StudioAnimation.prototype.setOpacity = function (newOpacity) {
  this.opacity_ = newOpacity;
};

/**
 * Make this animation hidden.
 */
StudioAnimation.prototype.hide = function () {
  this.element_.setAttribute('visibility', 'hidden');
};

/**
 * Make this animation visible.
 */
StudioAnimation.prototype.show = function () {
  this.element_.setAttribute('visibility', 'visible');
};
