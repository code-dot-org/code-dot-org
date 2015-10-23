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

var constants = require('./constants');
var utils = require('../utils');

// The SVG namespace that must be applied to new SVG elements
var SVG_NS = "http://www.w3.org/2000/svg";

// Unique element ID that increments by 1 each time an element is created
var uniqueId = 0;

/**
 * A StudioAnimation represents an animation asset that can be created,
 * positioned and rendered by other code.  It tries to hide away all the
 * details of actually rendering the correct frame at the correct offset
 * and advancing frames at the correct rate.
 * @constructor
 * @param {!Object} options
 * @param {!string} options.image - URL of the sprite sheet asset.
 * @param {number} [options.width] - frame width in original asset.  Default 50.
 * @param {number} [options.height] - frame height in original asset. Default 50.
 * @param {number} [options.renderScale] - Default 1.
 * @param {number} [options.opacity] - Opacity on a 0-1 scale.  Default 1.
 * @param {number} [options.animationRate] - How fast the animation should be
 *        played, in frames per second.  Default 20.
 * @param {number} [options.totalAnimations] - How many animations (columns)
 *        there are in the sprite sheet. Default 9.
 * @param {number} [options.frames] - How many frames (rows) there are per
 *        animation. Default 1.
 * @param {boolean} [options.loop] - Whether the animation should loop
 *        automatically.  Default false.
 */
var StudioAnimation = module.exports = function (options) {
  /** @type {string} image path */
  this.image = options.image;

  /** @type {number} frame width */
  this.width = utils.valueOr(options.width, 50); // TODO: Magic number

  /** @type {number} frame height */
  this.height = utils.valueOr(options.height, 50); // TODO: Magic number

  /** @type {number} render scale */
  this.renderScale = utils.valueOr(options.renderScale, 1);

  /** @private {number} opacity on a scale of 0 (transparent) to 1 (opaque) */
  this.opacity_ = utils.valueOr(options.opacity, 1);

  /** @private {number} animations in sheet / width in frames of sprite sheet */
  this.totalAnimations_ = utils.valueOr(options.totalAnimations, 9);

  /** @private {number} frames per animation / height in frames of sprite sheet */
  this.framesPerAnimation_ = utils.valueOr(options.frames, 1);

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

  /** @type {SVGElement} */
  this.clipPath = null;

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
  this.clipPath = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'studioanimation_clippath_' + nextId;
  this.clipPath.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', this.width * this.renderScale);
  rect.setAttribute('height', this.height * this.renderScale);
  this.clipPath.appendChild(rect);
  parentElement.appendChild(this.clipPath);

  var itemId = 'studioanimation_' + nextId;
  this.element_ = document.createElementNS(SVG_NS, 'image');
  this.element_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
     this.image);
  this.element_.setAttribute('id', itemId);
  this.element_.setAttribute('height',
      this.height * this.framesPerAnimation_ * this.renderScale);
  this.element_.setAttribute('width',
      this.width * this.totalAnimations_ * this.renderScale);
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
  if (this.clipPath) {
    this.clipPath.parentNode.removeChild(this.clipPath);
    this.clipPath = null;
  }

  if (this.animator_) {
    window.clearInterval(this.animator_);
    this.animator_ = null;
  }
};

/**
 * Display the current frame at the given location
 */
StudioAnimation.prototype.redrawAt = function (topLeft) {
  this.element_.setAttribute('x',
      topLeft.x - this.width *
      (this.currentAnimation_ * this.renderScale + (this.renderScale-1)/2));
  this.element_.setAttribute('y',
      topLeft.y - this.height *
      (this.currentFrame_ * this.renderScale + (this.renderScale-1)));
  this.element_.setAttribute('opacity', this.opacity_);

  var clipRect = this.clipPath.childNodes[0];
  clipRect.setAttribute('x', topLeft.x - this.width * (this.renderScale-1)/2);
  clipRect.setAttribute('y', topLeft.y - this.height * (this.renderScale-1));
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
    if (this.loop_ || this.currentFrame_ + 1 < this.framesPerAnimation_) {
      this.currentFrame_ = (this.currentFrame_ + 1) % this.framesPerAnimation_;
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
