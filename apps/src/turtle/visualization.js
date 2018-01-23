/**
 * Blockly Demo: Turtle Graphics
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Demonstration of Blockly: Turtle Graphics.
 * @author fraser@google.com (Neil Fraser)
 */

var utils = require('../utils');

const JOINT_RADIUS = 4;

/**
 * Minimum joint segment length
 */
const JOINT_SEGMENT_LENGTH = 50;

module.exports = class Visualization {
  constructor(options) {
    this.heading = 0;
    this.penDownValue = true;
    this.isPredrawing = false;
    this.isDrawingWithPattern = false;
    this.isFrozenSkin = options.isFrozenSkin;
    this.isK1 = options.isK1;

    // Create hidden canvases.
    this.ctxAnswer = this.createCanvas('answer', 400, 400).getContext('2d');
    this.ctxImages = this.createCanvas('images', 400, 400).getContext('2d');
    this.ctxPredraw = this.createCanvas('predraw', 400, 400).getContext('2d');
    this.ctxScratch = this.createCanvas('scratch', 400, 400).getContext('2d');
    this.ctxPattern = this.createCanvas('pattern', 400, 400).getContext('2d');
    this.ctxFeedback = this.createCanvas('feedback', 154, 154).getContext('2d');
    this.ctxThumbnail = this.createCanvas('thumbnail', 180, 180).getContext('2d');

    // Create hidden canvases for normalized versions
    this.ctxNormalizedScratch = this.createCanvas('normalizedScratch', 400, 400).getContext('2d');
    this.ctxNormalizedAnswer = this.createCanvas('normalizedAnswer', 400, 400).getContext('2d');

    // Create display canvas.
    this.displayCanvas = this.createCanvas('display', 400, 400);
    this.ctxDisplay = this.displayCanvas.getContext('2d');

    // Drawing with a pattern
    this.currentPathPattern = new Image();
    this.loadedPathPatterns = [];
    this.lineStylePatternOptions = options.lineStylePatternOptions;
    this.linePatterns = options.linePatterns;
    this.stickerImages = options.stickerImages;
  }

  preload() {
    return Promise.all([
      this.preloadAllStickerImages(),
      this.preloadAllPatternImages(),
    ]);
  }

  createCanvas(id, width, height) {
    var el = document.createElement('canvas');
    el.id = id;
    el.width = width;
    el.height = height;
    return el;
  }

  /**
   * Initializes all sticker images as defined in this.stickerImages, if any,
   * storing the created images in this.stickers.
   *
   * NOTE: initializes this.stickers as a side effect
   *
   * @return {Promise} that resolves once all images have finished loading,
   *         whether they did so successfully or not (or that resolves instantly
   *         if there are no images to load).
   */
  preloadAllStickerImages() {
    this.stickers = {};

    const loadSticker = name => new Promise(resolve => {
      const img = new Image();

      img.onload = () => resolve();
      img.onerror = () => resolve();

      img.src = this.stickerImages[name];
      this.stickers[name] = img;
    });

    const stickers = (this.skin && this.stickerImages) || {};
    const stickerNames = Object.keys(stickers);

    if (stickerNames.length) {
      return Promise.all(stickerNames.map(loadSticker));
    } else {
      return Promise.resolve();
    }
  };

  /**
   * Initializes all pattern images as defined in this.lineStylePatternOptions,
   * if any, storing the created images in this.loadedPathPatterns.
   *
   * @return {Promise} that resolves once all images have finished loading,
   *         whether they did so successfully or not (or that resolves instantly
   *         if there are no images to load).
   */
  preloadAllPatternImages() {
    const loadPattern = patternOption => new Promise(resolve => {
      const pattern = patternOption[1];

      if (this.linePatterns[pattern]) {
        const img = new Image();

        img.onload = () => resolve();
        img.onerror = () => resolve();

        img.src = this.linePatterns[pattern];
        this.loadedPathPatterns[pattern] = img;
      } else {
        resolve();
      }
    });

    const patternOptions = (this.lineStylePatternOptions);
    if (patternOptions.length) {
      return Promise.all(patternOptions.map(loadPattern));
    } else {
      return Promise.resolve();
    }
  };

  setPattern(pattern) {
    if (this.shouldDrawNormalized_) {
      pattern = null;
    }

    if (this.loadedPathPatterns[pattern]) {
      this.currentPathPattern = this.loadedPathPatterns[pattern];
      this.isDrawingWithPattern = true;
    } else if (pattern === null) {
      this.currentPathPattern = new Image();
      this.isDrawingWithPattern = false;
    }
  };

  jumpTo_(pos) {
    let x, y;
    if (Array.isArray(pos)) {
      [x, y] = pos;
    } else {
      x = utils.xFromPosition(pos, CANVAS_WIDTH);
      y = utils.yFromPosition(pos, CANVAS_HEIGHT);
    }
    this.x = Number(x);
    this.y = Number(y);
  };

  jumpForward(distance) {
    this.x += distance * Math.sin(utils.degreesToRadians(this.heading));
    this.y -= distance * Math.cos(utils.degreesToRadians(this.heading));
  };

  dotAt_(x, y) {
    // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
    var dotLineLength = 0.1;
    this.ctxScratch.lineTo(x + dotLineLength, y);
  };

  circleAt_(x, y, radius) {
    this.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
  };

  drawToTurtle_(distance) {
    var isDot = (distance === 0);
    if (isDot) {
      this.dotAt_(this.x, this.y);
    } else {
      this.ctxScratch.lineTo(this.x, this.y);
    }
  };

  turnByDegrees(degreesRight) {
    this.setHeading(this.heading + degreesRight);
  };

  setHeading(heading) {
    heading = this.constrainDegrees_(heading);
    this.heading = heading;
  };

  constrainDegrees_(degrees) {
    degrees %= 360;
    if (degrees < 0) {
      degrees += 360;
    }
    return degrees;
  };

  moveForward(distance, isDiagonal) {
    if (!this.penDownValue) {
      this.jumpForward(distance);
      return;
    }
    if (this.isDrawingWithPattern) {
      this.drawForwardLineWithPattern_(distance);

      // Frozen gets both a pattern and a line over the top of it.
      if (!this.isFrozenSkin) {
        return;
      }
    }

    this.drawForward_(distance, isDiagonal);
  };

  drawForward_(distance, isDiagonal) {
    if (this.shouldDrawJoints_()) {
      this.drawForwardWithJoints_(distance, isDiagonal);
    } else {
      this.drawForwardLine_(distance);
    }
  };

  /**
   * Draws a line of length `distance`, adding joint knobs along the way at
   * intervals of `JOINT_SEGMENT_LENGTH` if `isDiagonal` is false, or
   * `JOINT_SEGMENT_LENGTH * sqrt(2)` if `isDiagonal` is true.
   * @param distance
   * @param isDiagonal
   */
  drawForwardWithJoints_(distance, isDiagonal) {
    var remainingDistance = distance;
    var segmentLength = JOINT_SEGMENT_LENGTH * (isDiagonal ? Math.sqrt(2) : 1);

    if (remainingDistance >= segmentLength) {
      this.drawJointAtTurtle_();
    }

    while (remainingDistance > 0) {
      var enoughForFullSegment = remainingDistance >= segmentLength;
      var currentSegmentLength = enoughForFullSegment ? segmentLength
        : remainingDistance;

      remainingDistance -= currentSegmentLength;

      this.drawForwardLine_(currentSegmentLength);

      if (enoughForFullSegment) {
        this.drawJointAtTurtle_();
      }
    }
  };

  drawForwardLine_(distance) {

    if (this.isFrozenSkin) {
      this.ctxScratch.beginPath();
      this.ctxScratch.moveTo(this.stepStartX, this.stepStartY);
      this.jumpForward(distance);
      this.drawToTurtle_(distance);
      this.ctxScratch.stroke();
    } else {
      this.ctxScratch.beginPath();
      this.ctxScratch.moveTo(this.x, this.y);
      this.jumpForward(distance);
      this.drawToTurtle_(distance);
      this.ctxScratch.stroke();
    }

  };

  drawForwardLineWithPattern_(distance) {
    var img;
    var startX;
    var startY;

    if (this.isFrozenSkin) {
      this.ctxPattern.moveTo(this.stepStartX, this.stepStartY);
      img = this.currentPathPattern;
      startX = this.stepStartX;
      startY = this.stepStartY;

      var lineDistance = Math.abs(this.stepDistanceCovered);

      this.ctxPattern.save();
      this.ctxPattern.translate(startX, startY);
      // increment the angle and rotate the image.
      // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
      this.ctxPattern.rotate(utils.degreesToRadians(this.heading - 90));

      var clipSize;
      if (lineDistance % this.smoothAnimateStepSize === 0) {
        clipSize = this.smoothAnimateStepSize;
      } else if (lineDistance > this.smoothAnimateStepSize) {
        // this happens when our line was not divisible by smoothAnimateStepSize
        // and we've hit our last chunk
        clipSize = lineDistance % this.smoothAnimateStepSize;
      } else {
        clipSize = lineDistance;
      }
      if (img.width > 0 && img.height > 0 && clipSize > 0) {
        this.ctxPattern.drawImage(img,
          // Start point for clipping image
          Math.round(lineDistance), 0,
          // clip region size
          clipSize, img.height,
          // some mysterious hand-tweaking done by Brendan
          Math.round((this.stepDistanceCovered - clipSize - 2)),
          Math.round((-18)),
          clipSize, img.height);
      }

      this.ctxPattern.restore();

    } else {

      this.ctxScratch.moveTo(this.x, this.y);
      img = this.currentPathPattern;
      startX = this.x;
      startY = this.y;

      this.jumpForward(distance);
      this.ctxScratch.save();
      this.ctxScratch.translate(startX, startY);
      // increment the angle and rotate the image.
      // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
      this.ctxScratch.rotate(utils.degreesToRadians(this.heading - 90));

      if (img.width !== 0) {
        this.ctxScratch.drawImage(img,
          // Start point for clipping image
          0, 0,
          // clip region size
          distance + img.height / 2, img.height,
          // draw location relative to the ctx.translate point pre-rotation
          -img.height / 4, -img.height / 2,
          distance + img.height / 2, img.height);
      }

      this.ctxScratch.restore();
    }
  };

  shouldDrawJoints_() {
    return this.isK1 && !this.isPredrawing;
  };

  drawJointAtTurtle_ = function () {
    this.ctxScratch.beginPath();
    this.ctxScratch.moveTo(this.x, this.y);
    this.circleAt_(this.x, this.y, JOINT_RADIUS);
    this.ctxScratch.stroke();
  };
};
