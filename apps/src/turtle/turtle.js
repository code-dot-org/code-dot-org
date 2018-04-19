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

var color = require("../util/color");

const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 400;

const DEFAULT_X = CANVAS_WIDTH / 2;
const DEFAULT_Y = CANVAS_HEIGHT / 2;
const DEFAULT_DIRECTION = 90;

const JOINT_RADIUS = 4;

const decorationAnimationWidth = 85;
const decorationAnimationHeight = 85;
const decorationAnimationNumFrames = 19;

/**
* Minimum joint segment length
*/
var JOINT_SEGMENT_LENGTH = 50;

/**
 * An x offset against the sprite edge where the decoration should be drawn,
 * along with whether it should be drawn before or after the turtle sprite itself.
 */
var ELSA_DECORATION_DETAILS = [
  { x: 15, when: "after" },
  { x: 26, when: "after" },
  { x: 37, when: "after" },
  { x: 46, when: "after" },
  { x: 60, when: "after" },
  { x: 65, when: "after" },
  { x: 66, when: "after" },
  { x: 64, when: "after" },
  { x: 62, when: "before" },
  { x: 55, when: "before" },
  { x: 48, when: "before" },
  { x: 33, when: "before" },
  { x: 31, when: "before" },
  { x: 22, when: "before" },
  { x: 17, when: "before" },
  { x: 12, when: "before" },
  { x:  8, when: "after" },
  { x: 10, when: "after" }
];

export default class Visualization {
  constructor(options = {}) {
    this.x = DEFAULT_X;
    this.y = DEFAULT_Y;
    this.heading = DEFAULT_DIRECTION;
    this.penDownValue = true;

    this.avatar = options.avatar;
    this.isFrozenSkin = !!options.isFrozenSkin;
    this.isK1 = !!options.isK1;
    this.decorationAnimationImage = options.decorationAnimationImage;
    this.showDecoration = options.showDecoration;

    // Internal state.
    this.turtleFrame_ = 0;
    this.isPredrawing_ = false;
    this.currentPathPattern = new Image();
    this.isDrawingWithPattern = false;

    // This flag is used to draw a version of code (either user code or solution
    // code) that normalizes patterns and stickers to always use the "first"
    // option, so that validation can be agnostic.
    this.shouldDrawNormalized_ = false;

    // Create hidden canvases.
    this.ctxAnswer = this.createCanvas_('answer', 400, 400).getContext('2d');
    this.ctxImages = this.createCanvas_('images', 400, 400).getContext('2d');
    this.ctxPredraw = this.createCanvas_('predraw', 400, 400).getContext('2d');
    this.ctxScratch = this.createCanvas_('scratch', 400, 400).getContext('2d');
    this.ctxPattern = this.createCanvas_('pattern', 400, 400).getContext('2d');
    this.ctxFeedback = this.createCanvas_('feedback', 154, 154).getContext('2d');
    this.ctxThumbnail = this.createCanvas_('thumbnail', 180, 180).getContext('2d');

    // Create hidden canvases for normalized versions
    this.ctxNormalizedScratch = this.createCanvas_('normalizedScratch', 400, 400).getContext('2d');
    this.ctxNormalizedAnswer = this.createCanvas_('normalizedAnswer', 400, 400).getContext('2d');

    // Create display canvas.
    this.displayCanvas = this.createCanvas_('display', 400, 400);
    this.ctxDisplay = this.displayCanvas.getContext('2d');
  }

  resetTurtleFrame() {
    this.turtleFrame_ = 0;
  }

  // Helper for creating canvas elements.
  createCanvas_(id, width, height) {
    var el = document.createElement('canvas');
    el.id = id;
    el.width = width;
    el.height = height;
    return el;
  }

  /**
   * Draw the turtle image based on this.x, this.y, and this.heading.
   */
  drawTurtle() {
    if (!this.avatar.visible) {
      return;
    }
    this.drawDecorationAnimation("before");

    // Computes the index of the image in the sprite.
    var index = Math.floor(this.heading * this.avatar.numHeadings / 360);
    if (this.isFrozenSkin) {
      // the rotations in the sprite sheet go in the opposite direction.
      index = this.avatar.numHeadings - index;

      // and they are 180 degrees out of phase.
      index = (index + this.avatar.numHeadings / 2) % this.avatar.numHeadings;
    }
    var sourceX = this.avatar.width * index;
    var sourceY = this.avatar.height * this.turtleFrame_;
    this.turtleFrame_ = (this.turtleFrame_ + 1) % this.avatar.numFrames;

    var sourceWidth = this.avatar.width;
    var sourceHeight = this.avatar.height;
    var destWidth = this.avatar.width;
    var destHeight = this.avatar.height;
    var destX = this.x - destWidth / 2;
    var destY = this.y - destHeight + 7;

    if (!this.avatar.image) {
      return;
    }

    if (sourceX < 0 ||
      sourceY < 0 ||
      sourceX + sourceWidth  -0 > this.avatar.image.width ||
      sourceY + sourceHeight > this.avatar.image.height) {
      return;
    }

    if (this.avatar.image.width !== 0) {
      this.ctxDisplay.drawImage(
        this.avatar.image,
        Math.round(sourceX), Math.round(sourceY),
        sourceWidth - 0, sourceHeight,
        Math.round(destX), Math.round(destY),
        destWidth - 0, destHeight);
    }

    this.drawDecorationAnimation("after");
  }

  /**
   * This is called twice, once with "before" and once with "after", referring to before or after
   * the sprite is drawn.  For some angles it should be drawn before, and for some after.
   */
  drawDecorationAnimation(when) {
    if (this.showDecoration()) {
      var frameIndex = (this.turtleFrame_ + 10) % decorationAnimationNumFrames;

      var angleIndex = Math.floor(this.heading * this.avatar.numHeadings / 360);

      // the rotations in the Anna & Elsa sprite sheets go in the opposite direction.
      angleIndex = this.avatar.numHeadings - angleIndex;

      // and they are 180 degrees out of phase.
      angleIndex = (angleIndex + this.avatar.numHeadings / 2) % this.avatar.numHeadings;

      if (ELSA_DECORATION_DETAILS[angleIndex].when === when) {
        var sourceX = decorationAnimationWidth * frameIndex;
        var sourceY = 0;
        var sourceWidth = decorationAnimationWidth;
        var sourceHeight = decorationAnimationHeight;
        var destWidth = sourceWidth;
        var destHeight = sourceHeight;
        var destX = this.x - destWidth / 2 - 15 - 15 + ELSA_DECORATION_DETAILS[angleIndex].x;
        var destY = this.y - destHeight / 2 - 100;

        if (this.decorationAnimationImage.width !== 0) {
          this.ctxDisplay.drawImage(
            this.decorationAnimationImage,
            Math.round(sourceX), Math.round(sourceY),
            sourceWidth, sourceHeight,
            Math.round(destX), Math.round(destY),
            destWidth, destHeight);
        }
      }
    }
  }

  /**
   * Copy the scratch canvas to the display canvas. Add a turtle marker.
   */
  display() {
    // FF on linux retains drawing of previous location of artist unless we clear
    // the canvas first.
    var style = this.ctxDisplay.fillStyle;
    this.ctxDisplay.fillStyle = color.white;
    this.ctxDisplay.clearRect(0, 0, this.ctxDisplay.canvas.width,
      this.ctxDisplay.canvas.width);
    this.ctxDisplay.fillStyle = style;

    this.ctxDisplay.globalCompositeOperation = 'copy';
    // Draw the images layer.
    this.ctxDisplay.globalCompositeOperation = 'source-over';
    this.ctxDisplay.drawImage(this.ctxImages.canvas, 0, 0);

    // Draw the predraw layer.
    this.ctxDisplay.globalCompositeOperation = 'source-over';
    this.ctxDisplay.drawImage(this.ctxPredraw.canvas, 0, 0);

    // Draw the answer layer.
    if (this.isFrozenSkin) {
      this.ctxDisplay.globalAlpha = 0.4;
    } else {
      this.ctxDisplay.globalAlpha = 0.3;
    }
    this.ctxDisplay.drawImage(this.ctxAnswer.canvas, 0, 0);
    this.ctxDisplay.globalAlpha = 1;

    // Draw the pattern layer.
    this.ctxDisplay.globalCompositeOperation = 'source-over';
    this.ctxDisplay.drawImage(this.ctxPattern.canvas, 0, 0);

    // Draw the user layer.
    this.ctxDisplay.globalCompositeOperation = 'source-over';
    this.ctxDisplay.drawImage(this.ctxScratch.canvas, 0, 0);

    // Draw the turtle.
    this.drawTurtle();
  }

  jumpTo(pos) {
    let [x, y] = pos;
    this.x = Number(x);
    this.y = Number(y);
  }

  jumpForward(distance) {
    this.x += distance * Math.sin(this.degreesToRadians_(this.heading));
    this.y -= distance * Math.cos(this.degreesToRadians_(this.heading));
  }

  circleAt_(x, y, radius) {
    this.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
  }

  drawToTurtle_(distance) {
    var isDot = (distance === 0);
    if (isDot) {
      // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
      this.ctxScratch.lineTo(this.x + 0.1, this.y);
    } else {
      this.ctxScratch.lineTo(this.x, this.y);
    }
  }

  pointTo(degrees) {
    this.setHeading(degrees + DEFAULT_DIRECTION);
  }

  turnByDegrees(degreesRight) {
    this.setHeading(this.heading + degreesRight);
  }

  setHeading(heading) {
    heading = this.constrainDegrees_(heading);
    this.heading = heading;
  }

  reset(startDirection = DEFAULT_DIRECTION, initialX = DEFAULT_X, initialY = DEFAULT_Y) {
    // Standard starting location and heading of the turtle.
    this.x = initialX;
    this.y = initialY;
    this.heading = startDirection;
    this.penDownValue = true;
    this.avatar.visible = true;
    this.resetTurtleFrame();

    // Clear the display.
    this.ctxScratch.canvas.width = this.ctxScratch.canvas.width;
    this.ctxPattern.canvas.width = this.ctxPattern.canvas.width;
    if (this.isFrozenSkin) {
      this.ctxScratch.strokeStyle = 'rgb(255,255,255)';
      this.ctxScratch.fillStyle = 'rgb(255,255,255)';
      this.ctxScratch.lineWidth = 2;
    } else {
      this.ctxScratch.strokeStyle = '#000000';
      this.ctxScratch.fillStyle = '#000000';
      this.ctxScratch.lineWidth = 5;
    }

    this.ctxScratch.lineCap = 'round';
    this.ctxScratch.font = 'normal 18pt Arial';
    this.display();

    // Clear the feedback.
    this.ctxFeedback.clearRect(
      0, 0, this.ctxFeedback.canvas.width, this.ctxFeedback.canvas.height);
  }

  /**
   * Converts degrees into radians.
   *
   * @param {number} degrees - The degrees to convert to radians
   * @return {number} `degrees` converted to radians
   */
  degreesToRadians_(degrees) {
    return degrees * (Math.PI / 180);
  }

  constrainDegrees_(degrees) {
    degrees %= 360;
    if (degrees < 0) {
      degrees += 360;
    }
    return degrees;
  }

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
  }

  drawForward_(distance, isDiagonal) {
    if (this.shouldDrawJoints_()) {
      this.drawForwardWithJoints_(distance, isDiagonal);
    } else {
      this.drawForwardLine_(distance);
    }
  }

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
      var currentSegmentLength = enoughForFullSegment ? segmentLength : remainingDistance;

      remainingDistance -= currentSegmentLength;

      this.drawForwardLine_(currentSegmentLength);

      if (enoughForFullSegment) {
        this.drawJointAtTurtle_();
      }
    }
  }

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
  }

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
      this.ctxPattern.rotate(this.degreesToRadians_(this.heading - 90));

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
          Math.round((this.stepDistanceCovered - clipSize - 2)), Math.round((- 18)),
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
      // Need to subtract 90 to accommodate difference in canvas vs. Turtle direction
      this.ctxScratch.rotate(this.degreesToRadians_(this.heading - 90));

      if ((distance > 0) && (img.width !== 0)) {
          this.ctxScratch.drawImage(img,
            // Start point for clipping image forward
            0, 0,
            // clip region size
            distance, img.height,
            // draw location relative to the ctx.translate point pre-rotation
            -img.height / 4, -img.height / 2,
            distance+img.height / 2, img.height);
      } else if ((distance < 0) && (img.width !== 0)) {
            this.ctxScratch.drawImage(img,
              // Start point for clipping image backward
              img.width, 0,
              // clip region size
              distance, img.height,
              // draw location relative to the ctx.translate point pre-rotation
              -img.height / 4, -img.height / 2,
              distance+img.height / 2, img.height);
      }

      this.ctxScratch.restore();
    }
  }

  shouldDrawJoints_() {
    return this.isK1 && !this.isPredrawing_;
  }

  drawJointAtTurtle_() {
    this.ctxScratch.beginPath();
    this.ctxScratch.moveTo(this.x, this.y);
    this.circleAt_(this.x, this.y, JOINT_RADIUS);
    this.ctxScratch.stroke();
  }
}
