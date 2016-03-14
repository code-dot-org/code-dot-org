/** @file A utility that can help find particular frames within a spritesheet,
 * given certain metadata about that spritesheet */
'use strict';

var utils = require('../utils');

/**
 * @typedef AnimationDescription
 * @property {string} type Descriptive unique name for this animation type
 * @property {number} count Number of animations of this type
 * @property {number} frames Number of frames in each animation of this type
 */

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
 * @param {!string} options.assetPath - URL of the sprite sheet asset.
 * @param {AnimationDescription[]} [options.animations] - Animation descriptions
 * @param {number} [options.totalAnimations] - How many animations (columns)
 *        there are in the sprite sheet. Don't use with options.animations
 * @param {number} [options.defaultFramesPerAnimation] - How many frames there
 *        are per animation. Default 1.
 * @param {number} [options.packedSheetFrameCount] - How many frames before
 *        wrapping if animation frames are packed. Defaults to non-packed.
 * @param {boolean} [options.horizontalAnimation] - If animation frames run in
 *        rows instead of columns.
 */

var StudioSpriteSheet = module.exports = function (options) {
  /** @type {Array} */
  this.animations = options.animations || [];

  /** @type {number} */
  this.frameWidth = options.frameWidth;

  /** @type {number} */
  this.frameHeight = options.frameHeight;

  /** @type {string} */
  this.assetPath = options.assetPath;

  /** @type {number} frames per animation / height in frames of sprite sheet */
  this.defaultFramesPerAnimation = options.defaultFramesPerAnimation || 1;

  /** @type {number} If non-zero, the animations are packed in one long strip
   * that wraps around to the next row/column every n frames. The row/column
   * no longer implies the beginning or end of an animation.
   * (which means this mode requires that options.animations be supplied)
   * animationOffsets are stored as an 0-based frame index in this mode.
   */
  this.packedSheetFrameCount = options.packedSheetFrameCount;

  /** @type {number} animations in sheet / width in frames of sprite sheet */
  this.animationOffsets = {};
  this.animationFrameCounts = {};
  var totalFrames = 0;
  var totalAnimations = 0;
  for (var i = 0; i < this.animations.length; i++) {
    this.animationOffsets[this.animations[i].type] = this.packedSheetFrameCount ?
        totalFrames : totalAnimations;
    totalAnimations += this.animations[i].count;
    var framesPerThisAnimationType = utils.valueOr(
        this.animations[i].frames,
        this.defaultFramesPerAnimation);
    this.animationFrameCounts[this.animations[i].type] = framesPerThisAnimationType;
    totalFrames += framesPerThisAnimationType * this.animations[i].count;
  }
  this.totalAnimations = utils.valueOr(options.totalAnimations, totalAnimations);
  this.totalFrames = totalFrames ||
      (this.totalAnimations * this.defaultFramesPerAnimation);

  /** @type {boolean} Whether animation frames run in rows, not columns */
  this.horizontalAnimation = utils.valueOr(options.horizontalAnimation, false);

  if (this.packedSheetFrameCount) {
    var framesOneSide = Math.ceil(this.totalFrames / this.packedSheetFrameCount);
    var framesOtherSide = Math.ceil(this.totalFrames / framesOneSide);
    this.columnCount = this.horizontalAnimation ? framesOtherSide : framesOneSide;
    this.rowCount = this.horizontalAnimation ? framesOneSide : framesOtherSide;
  } else {
    this.rowCount = this.horizontalAnimation ? this.totalAnimations :
        this.defaultFramesPerAnimation;
    this.columnCount = this.horizontalAnimation ? this.defaultFramesPerAnimation :
        this.totalAnimations;
  }
};

/** @return {number} original height of the whole sprite sheet. */
StudioSpriteSheet.prototype.assetWidth = function () {
  return this.frameWidth * this.columnCount;
};

/** @return {number} original width of the whole sprite sheet. */
StudioSpriteSheet.prototype.assetHeight = function () {
  return this.frameHeight * this.rowCount;
};

/** @return {number} number of animation frames for a given type. */
StudioSpriteSheet.prototype.getAnimationFrameCount = function (animationType) {
  return utils.valueOr(this.animationFrameCounts[animationType],
      this.defaultFramesPerAnimation);
};

/**
 * Get the framing rect for a particular animation and frame within the
 * sprite sheet.
 * @param {string} animationType - Which type of animation to look up (optional).
 * @param {number} animationIndex - Which animation to look up.
 * @param {number} frameIndex - Which frame in the animation to look up.
 * @returns {Object} a frame rect at spritesheet scale relative to the sheet's
 *          top-left corner.
 */
StudioSpriteSheet.prototype.getFrame = function (animationType,
    animationIndex, frameIndex) {
  var x, y;
  if (this.packedSheetFrameCount) {
    var absoluteFrameIndex = this.animationOffsets[animationType] +
        this.animationFrameCounts[animationType] * animationIndex;
    absoluteFrameIndex += frameIndex;

    if (this.horizontalAnimation) {
      x = this.frameWidth * (absoluteFrameIndex % this.columnCount);
      y = this.frameHeight * Math.floor(absoluteFrameIndex / this.columnCount);
    } else {
      x = this.frameWidth * Math.floor(absoluteFrameIndex / this.rowCount);
      y = this.frameHeight * (absoluteFrameIndex % this.rowCount);
    }
  } else {
    if (animationType) {
      animationIndex += this.animationOffsets[animationType];
    }
    x = this.frameWidth * (this.horizontalAnimation ? frameIndex : animationIndex);
    y = this.frameHeight * (this.horizontalAnimation ? animationIndex : frameIndex);
  }
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
