'use strict';

var ImageAsset = function (options) {
  /*
   * spriteSheet: a rectangular sprite sheet containing walking & idle
   *  animation frames.
   * Y Axis: One column represents all of the walking frames.
   * X Axis: One row represents all of the directions (orientations).
   *
   * The 8th column (to the right of all of the turns) contains all of the idle
   *  animation frames if spriteSheetIncludesIdle is set
   * The next set of columns contains all of the idle animation frames for the
   *  other emotions if spriteSheetIncludesIdleEmotions is set
   * The next set of columns contains all of the walking south animation frames
   *  for the other emotions if spriteSheetIncludesWalkingEmotions is set
   */
  this.spriteSheet = options.spriteSheet;
  this.spriteSheetIncludesIdle = options.spriteSheetIncludesIdle;
  this.spriteSheetIncludesIdleEmotions = options.spriteSheetIncludesIdleEmotions;
  this.spriteSheetIncludesWalkingEmotions = options.spriteSheetIncludesWalkingEmotions;

  /* animations: names and counts of animations */
  this.animations = options.animations;

  /* animationFrames: number of frames in all of the animations */
  this.animationFrames = options.animationFrames;

  /*
   * legacySpriteSheet: a horizontal sprite sheet containing in each row:
   *  normal (south facing + idle animation), turns, emotions
   *
   * if extraEmotions is set, there are that number of additional rows,
   *  duplicatiing the above for each other emotion
   */
  this.legacySpriteSheet = options.legacySpriteSheet;

  /*
   * frameCounts object: contains counts for each type:
   *  walk, idleNormal, idleEmotions, walkingEmotions: (applies to spriteSheet)
   *  counterClockwise (boolean): (applies to spriteSheet)
   *  turns: (applies to spriteSheet && legacySpriteSheet)
   *  normal, emotions, extraEmotions: (applies to legacySpriteSheet)
   */
  this.frameCounts = options.frameCounts;

  switch (this.frameCounts.turns) {
    case undefined:
    case 0:
    case 7:
      this.turnsIncludesSouth = false;
      break;
    case 8:
      this.turnsIncludesSouth = true;
      break;
    default:
      throw('Unexpected turns count');
  }

  /* animationFrameDuration: number of ticks (at 30fps) per frame */
  this.animationFrameDuration = options.animationFrameDuration;

  /* To be added: renderOffset, scale, width, height */

  /* dropdownThumbnail: separate image used for preview in block editor */
  this.dropdownThumbnail = options.dropdownThumbnail;
};

ImageAsset.prototype.spriteSheetCount = function () {
  return !!this.spriteSheet + !!this.legacySpriteSheet;
};

ImageAsset.prototype.spriteSheets = function () {
  var sheets = [];
  if (this.spriteSheet) {
    sheets.push(this.spriteSheet);
  }
  if (this.legacySpriteSheet) {
    sheets.push(this.legacySpriteSheet);
  }
  return sheets;
};

module.exports = ImageAsset;
