/**
 * Blockly Demo: Turtle Graphics
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Sample answers for Turtle levels. Used for prompts and marking.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var ArtistAPI = require('./api');
var api = new ArtistAPI();

var setRandomVisibleColour = function () {
  var num = Math.floor(Math.random() * Math.pow(2, 24));
  // Make sure at least one component is below 0x80 and the rest
  // below 0xA0, to prevent too light of colours.
  num &= 0x9f7f9f;
  var colour = '#' + ('00000' + num.toString(16)).substr(-6);
  api.penColour(colour);
};

var drawSquare = function (length, random_colour) {
  for (var count = 0; count < 4; count++) {
    if (random_colour) {
      setRandomVisibleColour();
    }
    api.moveForward(length);
    api.turnRight(90);
  }
};

var drawTriangle = function (length, random_colour) {
  for (var count = 0; count < 3; count++) {
    if (random_colour) {
      setRandomVisibleColour();
    }
    api.moveForward(length);
    api.turnRight(120);
  }
};

var drawSnowman = function (height) {
  api.turnLeft(90);
  var distances = [height * 0.5, height * 0.3, height * 0.2];
  for (var i = 0; i < 6; i++) {
    var distance = distances[i < 3 ? i : 5 - i] / 57.5;
    for (var d = 0; d < 180; d += 2) {
      api.moveForward(distance);
      api.turnRight(2);
    }
    if (i != 2) {
      api.turnRight(180);
    }
  }
  api.turnLeft(90);
};

var drawHouse = function (length) {
  drawSquare(length);
  api.moveForward(length);
  api.turnRight(30);
  drawTriangle(length);
  api.turnRight(60);
  api.moveForward(length);
  api.turnLeft(90);
  api.moveBackward(length);
};

/**
 * Returns the log of a sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function.
 */
exports.answer = function (page, level) {
  api.log = [];
  var count, sideIdx, len;
  if (page == 1) {
    switch (level) {
      case 1:
        // El.
        api.moveForward(100);
        api.turnRight(90);
        api.moveForward(100);
        break;
      case 2:
        // Square.
        setRandomVisibleColour();
        drawSquare(100, false);
        break;
      case 3:
        // Use repeat to draw a square.
        drawSquare(100, false);
        break;
      case 4:
        // Equilateral triangle.
        drawTriangle(100, true);
        break;
      case 5:
        // Sideways envelope.
        drawSquare(100);
        drawTriangle(100);
        break;
      case 6:
        // Triangle and square.
        drawTriangle(100);
        api.turnRight(180);
        drawSquare(100);
        break;
      case 7:
        // Glasses.
        api.penColour('#00cc00');  // blue
        api.turnRight(90);
        drawSquare(100);
        api.moveBackward(150);
        drawSquare(100);
        break;
      case 8:
        // Spiky.
        for (count = 0; count < 8; count++) {
          setRandomVisibleColour();
          api.moveForward(100);
          api.moveBackward(100);
          api.turnRight(45);
        }
        break;
      case 9:
        // Circle.
        for (count = 0; count < 360; count++) {
          api.moveForward(1);
          api.turnRight(1);
        }
        break;
    }
  } else if (page == 2) {
    switch (level) {
      case 1:
        // Single square in some color.
        setRandomVisibleColour();
        drawSquare(100);
        break;
      case 2:
        // Single green square.
        api.penColour('#00ff00');  // green
        drawSquare(50);
        break;
      case 3:
        // Three squares, 120 degrees apart, in random colors.
        for (count = 0; count < 3; count++) {
          setRandomVisibleColour();
          drawSquare(100);
          api.turnRight(120);
        }
        break;
      case 4:
        // 36 squares, 10 degrees apart, in random colors.
        for (count = 0; count < 36; count++) {
          setRandomVisibleColour();
          drawSquare(100);
          api.turnRight(10);
        }
        break;
      case 5:  // Draw without using for-loop.  (Fall through to next case.)
      case 6:
        // Squares with sides of 50, 60, 70, 80, and 90 pixels.
        for (len = 50; len <= 90; len += 10) {
          drawSquare(len);
        }
        break;
      case 7:
        // Mini-spiral.
        for (len = 25; len <= 60; len += 5) {
          api.moveForward(len);
          api.turnRight(90);
        }
        break;
      case 7.5:
        drawSnowman(250);
        drawSnowman(100);
        break;
      case 8:
        // Same-height snowmen.
        for (var i = 0; i < 3; i++) {
          setRandomVisibleColour();
          drawSnowman(150);
          api.turnRight(90);
          api.jumpForward(100);
          api.turnLeft(90);
        }
        break;
      case 9:
        // Different height snowmen.
        for (var height = 110; height >= 70; height -= 10) {
          setRandomVisibleColour();
          drawSnowman(height);
          api.turnRight(90);
          api.jumpForward(60);
          api.turnLeft(90);
        }
        break;
    }
  } else if (page == 3) {
    switch (level) {
      case 1:
        // Draw a square.
        drawSquare(100);
        break;
      case 2:
        // Draw a triangle.
        drawTriangle(100);
        break;
      case 3:
        drawTriangle(100);
        api.moveForward(100);
        drawSquare(100);
        api.moveForward(100);
        drawTriangle(100);
        break;
      case 4:
        // Draw a house using "draw a square" and "draw a triangle".
        drawHouse(100);
        break;
      case 5:
        // Draw a house using a function.
        drawHouse(100);
        break;
      case 6:
        setRandomVisibleColour();
        drawTriangle(100);
        api.moveForward(100);
        setRandomVisibleColour();
        drawTriangle(200);
        break;
      case 7:
        // Add a parameter to the "draw a house" procedure.
        drawHouse(150);
        break;
      case 8:
        drawHouse(100);
        drawHouse(150);
        drawHouse(100);
        break;
      case 9:
        for (count = 50; count <= 150; count += 50) {
          setRandomVisibleColour();
          drawHouse(count);
        }
        break;
    }
  } else if (page == 4) {
    switch (level) {
      case 1:
        // Draw an equilateral triangle.
        drawTriangle(100);
        break;
      case 2:
        // Draw two equilateral triangles.
        for (count = 0; count < 2; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(90);
        }
        break;
      case 3:
        // Draw four equilateral triangles.
        for (count = 0; count < 4; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(90);
        }
        break;
      case 4:
        for (count = 0; count < 10; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(36);
        }
        break;
      case 5:
        for (count = 0; count < 36; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(10);
        }
        break;
      case 6:
        drawSquare(20);
        break;
      case 7:
        for (count = 0; count < 10; count++) {
          setRandomVisibleColour();
          drawSquare(20);
          api.moveForward(20);
        }
      break;
      case 8:
        for (sideIdx = 0; sideIdx < 4; sideIdx++) {
          for (count = 0; count < 10; count++) {
            setRandomVisibleColour();
            drawSquare(20);
            api.moveForward(20);
          }
          api.turnRight(90);
        }
      break;
      case 9:
        for (sideIdx = 0; sideIdx < 4; sideIdx++) {
          for (count = 0; count < 10; count++) {
            setRandomVisibleColour();
            drawSquare(20);
            api.moveForward(20);
          }
          api.turnRight(80);
        }
      break;
      case 10:
        for (sideIdx = 0; sideIdx < 9; sideIdx++) {
          for (count = 0; count < 10; count++) {
            setRandomVisibleColour();
            drawSquare(20);
            api.moveForward(20);
          }
          api.turnRight(80);
        }
      break;
    }
  }
  return api.log;
};
