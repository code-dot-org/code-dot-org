/** @file A utility that can help find particular frames within a spritesheet,
 * given certain metadata about that spritesheet */
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

/**
 * Provider of metadata about a particular sprite sheet, to help find frames
 * within it.
 *
 * Assumptions:
 * All frames are the same size, and are arranged in a grid.
 * All animations are the same number of frames.
 * Each animation is a single column or a single row
 *
 * @constructor
 * @param {!Object} options
 * @param {!string} options.image - URL of the sprite sheet asset.
 * @param {number} [options.width] - frame width in original asset.  Default 50.
 * @param {number} [options.height] - frame height in original asset. Default 50.
 * @param {number} [options.totalAnimations] - How many animations (columns)
 *        there are in the sprite sheet. Default 9.
 * @param {number} [options.frames] - How many frames (rows) there are per
 *        animation. Default 1.
 * @param {boolean} [options.horizontalAnimation] - If animation frames run in
 *        rows instead of columns.
 */
var StudioSpriteSheet = module.exports = function (options) {
  /** @type {string} spritesheet asset path */
  this.assetPath = options.image;

  /** @type {number} */
  this.frameWidth = utils.valueOr(options.width, 50); // TODO: Magic Number

  /** @type {number} */
  this.frameHeight = utils.valueOr(options.height, 50); // TODO: Magic Number

  /** @type {number} animations in sheet / width in frames of sprite sheet */
  this.totalAnimations = utils.valueOr(options.totalAnimations, 9);

  /** @type {number} frames per animation / height in frames of sprite sheet */
  this.framesPerAnimation = utils.valueOr(options.frames, 1);

  /** @type {boolean} Whether animation frames run in rows, not columns */
  this.horizontalAnimation = utils.valueOr(options.horizontalAnimation, false);
};

/** @return {number} original height of the whole sprite sheet. */
StudioSpriteSheet.prototype.assetWidth = function () {
    return this.frameWidth * (this.horizontalAnimation ?
            this.framesPerAnimation : this.totalAnimations);
};

/** @return {number} original width of the whole sprite sheet. */
StudioSpriteSheet.prototype.assetHeight = function () {
  return this.frameHeight * (this.horizontalAnimation ?
          this.totalAnimations : this.framesPerAnimation);
};

/**
 * Get the framing rect for a particular animation and frame within the
 * sprite sheet.
 * @param {number} animationIndex - Which animation to look up.
 * @param {number} frameIndex - Which frame in the animation to look up.
 * @returns {Object} a frame rect at spritesheet scale relative to the sheet's
 *          top-left corner.
 */
StudioSpriteSheet.prototype.getFrame = function (animationIndex, frameIndex) {
  var x = this.frameWidth * (this.horizontalAnimation ? frameIndex : animationIndex);
  var y = this.frameHeight * (this.horizontalAnimation ? animationIndex : frameIndex);
  return {
    x: x,
    y: y,
    width: this.frameWidth,
    height: this.frameHeight,
    top: y,
    left: x,
    right: x + this.frameWidth,
    bottom: y + this.frameHeight
  };
};
