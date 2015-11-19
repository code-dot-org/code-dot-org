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
var constants = require('./constants');

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
 * @param {number} [options.animationRate] - How fast the animation should be
 *        played, in frames per second.  Default 20.
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
   * Which animation (which column in the sprite sheet) is currently playing.
   * @private {number}
   */
  this.currentAnimation_ = 0;

  /** @private {number} index of current frame in the current animation. */
  this.currentFrame_ = 0;

  /** @private {boolean} whether the animation should loop automatically. */
  this.loop_ = utils.valueOr(options.loop, false);

  /** @private {SVGImageElement} */
  this.element_ = null;

  /** @private {SVGElement} */
  this.clipPath_ = null;

  // Setting the animation rate here initializes the setInterval that keeps
  // the current frame changing at the framerate.
  this.setAnimationRate(utils.valueOr(options.animationRate,
      constants.DEFAULT_ANIMATION_RATE));
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
  var nextId = (uniqueId++);

  // create our clipping path/rect
  this.clipPath_ = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'studioanimation_clippath_' + nextId;
  this.clipPath_.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', this.spriteSheet_.frameWidth * this.renderScale_);
  rect.setAttribute('height', this.spriteSheet_.frameHeight * this.renderScale_);
  this.clipPath_.appendChild(rect);
  parentElement.appendChild(this.clipPath_);

  var itemId = 'studioanimation_' + nextId;
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

  this.stopAnimator();
};

/**
 * Stop the animator (used when we freeze in onPuzzleComplete)
 */
StudioAnimation.prototype.stopAnimator = function() {
  if (this.animator_) {
    window.clearInterval(this.animator_);
    this.animator_ = null;
  }
};

/**
 * Display the current frame at the given location
 */
StudioAnimation.prototype.redrawCenteredAt = function (center) {
  var frame = this.spriteSheet_.getFrame(this.currentAnimation_, this.currentFrame_);
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
 * @param {!number} animationIndex
 */
StudioAnimation.prototype.setCurrentAnimation = function (animationIndex) {
  this.currentAnimation_ = animationIndex;
};

/**
 * Set the animation rate for this item's sprite.
 * @param {number} framesPerSecond
 */
StudioAnimation.prototype.setAnimationRate = function (framesPerSecond) {
  if (this.animator_) {
    window.clearInterval(this.animator_);
  }
  this.animator_ = window.setInterval(function () {
    if (this.loop_ || this.currentFrame_ + 1 < this.spriteSheet_.framesPerAnimation) {
      this.currentFrame_ = (this.currentFrame_ + 1) %
          this.spriteSheet_.framesPerAnimation;
    }
  }.bind(this), Math.round(1000 / framesPerSecond));
};

/**
 * Change visible opacity of this animation..
 * @param {number} newOpacity (between 0 and 1)
 */
StudioAnimation.prototype.setOpacity = function (newOpacity) {
  this.opacity_ = newOpacity;
};
