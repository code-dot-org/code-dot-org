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
'use strict';

window.Turtle = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Turtle = module.exports;
var commonMsg = require('../../locale/current/common');
var turtleMsg = require('../../locale/current/turtle');
var skins = require('../skins');
var levels = require('./levels');
var Colours = require('./core').Colours;
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var utils = require('../utils');

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var JOINT_RADIUS = 4;

/**
 * Minimum joint segment length
 */
var JOINT_SEGMENT_LENGTH = 50;

/**
 * PID of animation task currently executing.
 */
Turtle.pid = 0;

/**
 * Should the turtle be drawn?
 */
Turtle.visible = true;

/**
 * The avatar image
 */
Turtle.avatarImage = new Image();
Turtle.numberAvatarHeadings = undefined;

/**
 * Drawing with a pattern
 */

Turtle.patternForPaths = new Image();
Turtle.isDrawingWithPattern = false;

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Turtle.init = function(config) {

  skin = config.skin;
  level = config.level;

  if (skin.id == "anna" || skin.id == "elsa")
  {
    if (skin.id == "elsa")
    {
      turtleNumFrames = 20;
    }
    else if (skin.id == "anna")
    {
      turtleNumFrames = 10;
    }

    // let's try adding a background image
    level.images = [{}];
    level.images[0].filename = 'background.jpg';
    level.images[0].position = [ 0, 0 ];
    level.images[0].scale = 0.5;  // image is double sized for retina
  }

  config.grayOutUndeletableBlocks = true;
  config.insertWhenRun = true;

  if (skin.id == "anna")
  {
    Turtle.AVATAR_WIDTH = 57;
    Turtle.AVATAR_HEIGHT = 78;
  }
  else if (skin.id == "elsa")
  {
    Turtle.AVATAR_WIDTH = 57;
    Turtle.AVATAR_HEIGHT = 67;
  }
  else
  {
    Turtle.AVATAR_WIDTH = 70;
    Turtle.AVATAR_HEIGHT = 51;
  }

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      controls: require('./controls.html')({assetUrl: BlocklyApps.assetUrl}),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    Blockly.loadAudio_(skin.winSound, 'win');
    Blockly.loadAudio_(skin.startSound, 'start');
    Blockly.loadAudio_(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    //XXX Not sure if this is still right.
    Blockly.JavaScript.addReservedWords('Turtle,code');

    // Helper for creating canvas elements.
    var createCanvas = function(id, width, height) {
      var el = document.createElement('canvas');
      el.id = id;
      el.width = width;
      el.height = height;
      return el;
    };

    // Create hidden canvases.
    Turtle.ctxAnswer = createCanvas('answer', 400, 400).getContext('2d');
    Turtle.ctxImages = createCanvas('images', 400, 400).getContext('2d');
    Turtle.ctxPredraw = createCanvas('predraw', 400, 400).getContext('2d');
    Turtle.ctxScratch = createCanvas('scratch', 400, 400).getContext('2d');
    Turtle.ctxFeedback = createCanvas('feedback', 154, 154).getContext('2d');

    // Create display canvas.
    var display = createCanvas('display', 400, 400);
    var visualization = document.getElementById('visualization');
    visualization.appendChild(display);
    Turtle.ctxDisplay = display.getContext('2d');

    // Set their initial contents.
    Turtle.loadTurtle();
    Turtle.drawImages();
    Turtle.drawAnswer();
    if (level.predraw_blocks) {
      Turtle.isPredrawing_ = true;
      Turtle.drawBlocksOnCanvas(level.predraw_blocks, Turtle.ctxPredraw);
      Turtle.isPredrawing_ = false;
    }

    // pre-load image for line pattern block. Creating the image object and setting source doesn't seem to be
    // enough in this case, so we're actually creating and reusing the object within the document body.

    if (config.level.edit_blocks)
    {
      var imageContainer = document.createElement('div');
      imageContainer.style.display='none';
      document.body.appendChild(imageContainer);

      for( var i = 0; i <  Blockly.Blocks.draw_line_style_pattern.Options.length; i++) {
        var pattern = Blockly.Blocks.draw_line_style_pattern.Options[i][1];
        var img = new Image();
        img.src = skin[pattern];
        img.id = pattern;
        imageContainer.appendChild(img);
      }
    }

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';
  };

  BlocklyApps.init(config);
};

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
Turtle.drawAnswer = function() {
  if (level.solutionBlocks) {
    Turtle.drawBlocksOnCanvas(level.solutionBlocks, Turtle.ctxAnswer);
  } else {
    Turtle.drawLogOnCanvas(level.answer, Turtle.ctxAnswer);
  }
};

Turtle.drawLogOnCanvas = function(log, canvas) {
  BlocklyApps.reset();
  while (log.length) {
    var tuple = log.shift();
    Turtle.step(tuple[0], tuple.splice(1), {smoothAnimate: false});
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(Turtle.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

Turtle.drawBlocksOnCanvas = function(blocks, canvas) {
  var domBlocks = Blockly.Xml.textToDom(blocks);
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, domBlocks);
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  Turtle.evalCode(code);
  Blockly.mainWorkspace.clear();
  Turtle.drawCurrentBlocksOnCanvas(canvas);
};

Turtle.drawCurrentBlocksOnCanvas = function(canvas) {
  Turtle.drawLogOnCanvas(api.log, canvas);
};

/**
 * Place an image at the specified coordinates.
 * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
 * @param {string} filename Relative path to image.
 * @param {!Array} position An x-y pair.
 * @param {number} optional scale at which image is drawn
 */
Turtle.placeImage = function(filename, position, scale) {
  var img = new Image();
  img.onload = function() {
    if (scale) {
      Turtle.ctxImages.drawImage(img, position[0], position[1], img.width, img.height, 0, 0, img.width * scale, img.height * scale);
    } else {
      Turtle.ctxImages.drawImage(img, position[0], position[1]);
    }
    Turtle.display();
  };
  if (skin.id == "anna" || skin.id == "elsa")
  {
    img.src = skin.assetUrl(filename);
  }
  else
  {
    img.src = BlocklyApps.assetUrl('media/turtle/' + filename);
  }
};

/**
 * Draw the images for this page and level onto Turtle.ctxImages.
 */
Turtle.drawImages = function() {
  if (!level.images) {
    return;
  }
  for (var i = 0; i < level.images.length; i++) {
    var image = level.images[i];
    Turtle.placeImage(image.filename, image.position, image.scale);
  }
  Turtle.ctxImages.globalCompositeOperation = 'copy';
  Turtle.ctxImages.drawImage(Turtle.ctxScratch.canvas, 0, 0);
  Turtle.ctxImages.globalCompositeOperation = 'source-over';
};

/**
 * Initial the turtle image on load.
 */
Turtle.loadTurtle = function() {
  Turtle.avatarImage.onload = function() {
    Turtle.display();
  };
  Turtle.avatarImage.src = skin.avatar;
  if (skin.id == "anna")
    Turtle.numberAvatarHeadings = 36;
  else if (skin.id == "elsa")
    Turtle.numberAvatarHeadings = 18;
  else
    Turtle.numberAvatarHeadings = 180;
  Turtle.avatarImage.height = Turtle.AVATAR_HEIGHT;
  Turtle.avatarImage.width = Turtle.AVATAR_WIDTH;
};

var turtleNumFrames;
var turtleFrame = 0;
var turtleFrameSlowdown = 5;


/**
 * Draw the turtle image based on Turtle.x, Turtle.y, and Turtle.heading.
 */
Turtle.drawTurtle = function() {
  var sourceY;
  // Computes the index of the image in the sprite.
  var index = Math.floor(Turtle.heading * Turtle.numberAvatarHeadings / 360);
  if (skin.id == "anna" || skin.id == "elsa") {
    // the rotations in the sprite sheet go in the opposite direction.
    index = Turtle.numberAvatarHeadings - index;

    // and they are 180 degrees out of phase.
    index = (index + Turtle.numberAvatarHeadings/2) % Turtle.numberAvatarHeadings;
  }
  var sourceX = Turtle.avatarImage.width * index;
  if (skin.id == "anna" || skin.id == "elsa") {
    sourceY = Turtle.avatarImage.height * turtleFrame;
    turtleFrame = (turtleFrame + 1) % turtleNumFrames;
  } else {
    sourceY = 0;
  }
  var sourceWidth = Turtle.avatarImage.width;
  var sourceHeight = Turtle.avatarImage.height;
  var destWidth = Turtle.avatarImage.width;
  var destHeight = Turtle.avatarImage.height;
  var destX = Turtle.x - destWidth / 2;
  var destY = Turtle.y - destHeight + 7;

  Turtle.ctxDisplay.drawImage(Turtle.avatarImage, sourceX, sourceY,
                              sourceWidth, sourceHeight, destX, destY,
                              destWidth, destHeight);
};

/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
BlocklyApps.reset = function(ignore) {
  // Standard starting location and heading of the turtle.
  Turtle.x = CANVAS_HEIGHT / 2;
  Turtle.y = CANVAS_WIDTH / 2;
  Turtle.heading = level.startDirection !== undefined ?
      level.startDirection : 90;
  Turtle.penDownValue = true;
  Turtle.visible = true;

  // For special cases, use a different initial location.
  if (level.initialX !== undefined) {
    Turtle.x = level.initialX;
  }
  if (level.initialY !== undefined) {
    Turtle.y = level.initialY;
  }
  // Clear the display.
  Turtle.ctxScratch.canvas.width = Turtle.ctxScratch.canvas.width;
  if (skin.id == "anna") {
    Turtle.ctxScratch.strokeStyle = 'rgb(255,255,238)';
    Turtle.ctxScratch.fillStyle = 'rgb(255,255,238)';
    Turtle.ctxScratch.lineWidth = 4;
  } else if (skin.id == "elsa") {
    Turtle.ctxScratch.strokeStyle = 'rgb(255,255,238)';
    Turtle.ctxScratch.fillStyle = 'rgb(255,255,238)';
    Turtle.ctxScratch.lineWidth = 4;
  } else {
    Turtle.ctxScratch.strokeStyle = '#000000';
    Turtle.ctxScratch.fillStyle = '#000000';
    Turtle.ctxScratch.lineWidth = 5;
  }

  Turtle.ctxScratch.lineCap = 'round';
  Turtle.ctxScratch.font = 'normal 18pt Arial';
  Turtle.display();

  // Clear the feedback.
  Turtle.ctxFeedback.clearRect(
      0, 0, Turtle.ctxFeedback.canvas.width, Turtle.ctxFeedback.canvas.height);

  // Reset to empty pattern
  Turtle.setPattern(null);

  // Kill any task.
  if (Turtle.pid) {
    window.clearTimeout(Turtle.pid);
  }
  Turtle.pid = 0;

  // Discard the interpreter.
  Turtle.interpreter = null;

  // Stop the looping sound.
  BlocklyApps.stopLoopingAudio('start');

  jumpDistanceCovered = 0;
};

/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
Turtle.display = function() {
  // FF on linux retains drawing of previous location of artist unless we clear
  // the canvas first.
  var style = Turtle.ctxDisplay.fillStyle;
  Turtle.ctxDisplay.fillStyle = 'white';
  Turtle.ctxDisplay.clearRect(0, 0, Turtle.ctxDisplay.canvas.width,
    Turtle.ctxDisplay.canvas.width);
  Turtle.ctxDisplay.fillStyle = style;

  Turtle.ctxDisplay.globalCompositeOperation = 'copy';
  // Draw the images layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxImages.canvas, 0, 0);

  // Draw the answer layer.
  if (skin.id == "anna" || skin.id == "elsa") {
    Turtle.ctxDisplay.globalAlpha = 0.4;
  } else {
    Turtle.ctxDisplay.globalAlpha = 0.15;
  }
  Turtle.ctxDisplay.drawImage(Turtle.ctxAnswer.canvas, 0, 0);
  Turtle.ctxDisplay.globalAlpha = 1;

  // Draw the predraw layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxPredraw.canvas, 0, 0);

  // Draw the user layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (Turtle.visible) {
    Turtle.drawTurtle();
  }
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  document.getElementById('spinner').style.visibility = 'visible';
  Blockly.mainWorkspace.traceOn(true);
  BlocklyApps.attempts++;
  Turtle.execute();
};

Turtle.evalCode = function(code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Turtle: api
    });
  } catch (e) {
    // Infinity is thrown if we detect an infinite loop. In that case we'll
    // stop further execution, animate what occured before the infinite loop,
    // and analyze success/failure based on what was drawn.
    // Otherwise, abnormal termination is a user error.
    if (e !== Infinity) {
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror("UserCode:" + e.message, document.URL, 0);
      }
      window.alert(e);
    }
  }
};

/**
 * Set up Turtle.code, Turtle.interpreter, etc. to run code for editCode levels
 */
function generateTurtleCodeFromJS () {
  Turtle.code = utils.generateCodeAliases(level.codeFunctions, 'Turtle');
  Turtle.userCodeStartOffset = Turtle.code.length;
  Turtle.code += BlocklyApps.editor.getValue();
  Turtle.userCodeLength = Turtle.code.length - Turtle.userCodeStartOffset;

  var session = BlocklyApps.editor.aceEditor.getSession();
  Turtle.cumulativeLength = codegen.aceCalculateCumulativeLength(session);

  var initFunc = function(interpreter, scope) {
    codegen.initJSInterpreter(interpreter, scope, {
                                      BlocklyApps: BlocklyApps,
                                      Turtle: api } );
  };
  Turtle.interpreter = new window.Interpreter(Turtle.code, initFunc);
}

/**
 * Execute the user's code.  Heaven help us...
 */
Turtle.execute = function() {
  api.log = [];

  // Reset the graphic.
  BlocklyApps.reset();

  if (feedback.hasExtraTopBlocks()) {
    // immediately check answer, which will fail and report top level blocks
    Turtle.checkAnswer();
    return;
  }

  if (level.editCode) {
    generateTurtleCodeFromJS();
  } else {
    Turtle.code = Blockly.Generator.workspaceToCode('JavaScript');
    Turtle.evalCode(Turtle.code);
  }

  // api.log now contains a transcript of all the user's actions.
  BlocklyApps.playAudio('start', {loop : true});
  // animate the transcript.
  Turtle.pid = window.setTimeout(Turtle.animate, 100);

  // Disable toolbox while running
  Blockly.mainWorkspace.setEnableToolbox(false);
};

// Divide each jump into substeps so that we can animate every movement.
var jumpDistance = 10;
var jumpDistanceCovered = 0;

/**
 * Attempt to execute one command from the log of API commands.
 */
function executeTuple () {

  if (api.log.length > 0)
  {
    var tuple = api.log[0];
    var command = tuple[0];
    var id = tuple[tuple.length-1];

    BlocklyApps.highlight(String(id));
    var smoothAnimate = skin.id == "anna" || skin.id == "elsa";
    var tupleDone = Turtle.step(command, tuple.slice(1), {smoothAnimate: smoothAnimate});
    Turtle.display();

    if (tupleDone)
    {
      api.log.shift();
      jumpDistanceCovered = 0;
    }

    return true;
  }
  else
  {
    return false;
  }
}

/**
 * Handle the tasks to be done after the user program is finished.
 */
function finishExecution () {
  document.getElementById('spinner').style.visibility = 'hidden';
  Blockly.mainWorkspace.highlightBlock(null);
  Turtle.checkAnswer();
}

/**
 * Iterate through the recorded path and animate the turtle's actions.
 */
Turtle.animate = function() {
  // All tasks should be complete now.  Clean up the PID list.
  Turtle.pid = 0;

  if (level.editCode) {
    var stepped = true;
    while (stepped) {
      codegen.selectCurrentCode(Turtle.interpreter,
                                BlocklyApps.editor,
                                Turtle.cumulativeLength,
                                Turtle.userCodeStartOffset,
                                Turtle.userCodeLength);
      stepped = Turtle.interpreter.step();

      if (executeTuple()) {
        // We stepped far enough that we executed a commmand, break out:
        break;
      }
    }
    if (!stepped) {
      // We dropped out of the step loop because we ran out of code, all done:
      finishExecution();
      return;
    }
  } else {
    if (!executeTuple()) {
      finishExecution();
      return;
    }
  }

  // Scale the speed non-linearly, to give better precision at the fast end.
  var stepSpeed = 1000 * Math.pow(1 - Turtle.speedSlider.getValue(), 2);
  if (skin.id == "anna" || skin.id == "elsa")
  {
    stepSpeed /= 10;
  }
  Turtle.pid = window.setTimeout(Turtle.animate, stepSpeed);
};


Turtle.doSmoothAnimate = function(options, distance)
{
  var tupleDone = true;

  if (options && options.smoothAnimate)
  {
    var fullDistance = distance;
    distance /= jumpDistance;
    jumpDistanceCovered += distance;
    if (jumpDistanceCovered < fullDistance)
      tupleDone = false;
  }

  return { tupleDone: tupleDone, distance: distance };
};

/**
 * Execute one step.
 * @param {string} command Logo-style command (e.g. 'FD' or 'RT').
 * @param {!Array} values List of arguments for the command.
 * @param {number} fraction How much of this step's distance do we draw?
 * @param {object} single option for now: smoothAnimate (true/false)
 */
Turtle.step = function(command, values, options) {
  var tupleDone = true;
  var result;

  switch (command) {
    case 'FD':  // Forward
      distance = values[0];
      result = Turtle.doSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.moveForward_(result.distance);
      break;
    case 'JF':  // Jump forward
      distance = values[0];
      result = Turtle.doSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.jumpForward_(result.distance);
      break;
    case 'MV':  // Move (direction)
      var distance = values[0];
      var heading = values[1];
      result = Turtle.doSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.setHeading_(heading);
      Turtle.moveForward_(result.distance);
      break;
    case 'JD':  // Jump (direction)
      distance = values[0];
      result = Turtle.doSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.setHeading_(heading);
      Turtle.jumpForward_(result.distance);
      break;
    case 'RT':  // Right Turn
      distance = values[0];
      result = Turtle.doSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.turnByDegrees_(result.distance);
      break;
    case 'DP':  // Draw Print
      Turtle.ctxScratch.save();
      Turtle.ctxScratch.translate(Turtle.x, Turtle.y);
      Turtle.ctxScratch.rotate(2 * Math.PI * (Turtle.heading - 90) / 360);
      Turtle.ctxScratch.fillText(values[0], 0, 0);
      Turtle.ctxScratch.restore();
      break;
    case 'DF':  // Draw Font
      Turtle.ctxScratch.font = values[2] + ' ' + values[1] + 'pt ' + values[0];
      break;
    case 'PU':  // Pen Up
      Turtle.penDownValue = false;
      break;
    case 'PD':  // Pen Down
      Turtle.penDownValue = true;
      break;
    case 'PW':  // Pen Width
      Turtle.ctxScratch.lineWidth = values[0];
      break;
    case 'PC':  // Pen Colour
      Turtle.ctxScratch.strokeStyle = values[0];
      Turtle.ctxScratch.fillStyle = values[0];
      Turtle.isDrawingWithPattern = false;
      break;
    case 'PS':  // Pen style with image
      if (!values[0] || values[0] == 'DEFAULT') {
          Turtle.setPattern(null);
      } else {
        Turtle.setPattern(document.getElementById(values[0]));
      }
      break;
    case 'HT':  // Hide Turtle
      Turtle.visible = false;
      break;
    case 'ST':  // Show Turtle
      Turtle.visible = true;
      break;
    case 'stamp':
      var img = Turtle.stamps[values[0]];
      var width = img.width / 2;
      var height = img.height / 2;
      var x = Turtle.x - width / 2;
      var y = Turtle.y - height / 2;
      Turtle.ctxScratch.drawImage(img, x, y, width, height);
      break;
  }

  return tupleDone;
};

Turtle.setPattern = function (pattern) {
  if ( pattern === null ) {
    Turtle.patternForPaths = new Image();
    Turtle.isDrawingWithPattern = false;
  } else {
    Turtle.patternForPaths = pattern;
    Turtle.isDrawingWithPattern = true;
  }
};

Turtle.jumpForward_ = function (distance) {
  Turtle.x += distance * Math.sin(2 * Math.PI * Turtle.heading / 360);
  Turtle.y -= distance * Math.cos(2 * Math.PI * Turtle.heading / 360);
};

Turtle.moveByRelativePosition_ = function (x, y) {
  Turtle.x += x;
  Turtle.y += y;
};

Turtle.dotAt_ = function (x, y) {
  // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
  var dotLineLength = 0.1;
  Turtle.ctxScratch.lineTo(x + dotLineLength, y);
};

Turtle.circleAt_ = function (x, y, radius) {
  Turtle.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
};

Turtle.drawToTurtle_ = function (distance) {
  var isDot = (distance === 0);
  if (isDot) {
    Turtle.dotAt_(Turtle.x, Turtle.y);
  } else {
    Turtle.ctxScratch.lineTo(Turtle.x, Turtle.y);
  }
};

Turtle.turnByDegrees_ = function (degreesRight) {
  Turtle.setHeading_(Turtle.heading + degreesRight);
};

Turtle.setHeading_ = function (heading) {
  heading = Turtle.constrainDegrees_(heading);
  Turtle.heading = heading;
};

Turtle.constrainDegrees_ = function (degrees) {
  degrees %= 360;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
};

Turtle.moveForward_ = function (distance) {
  if (!Turtle.penDownValue) {
    Turtle.jumpForward_(distance);
    return;
  }
  if (Turtle.isDrawingWithPattern) {
    Turtle.drawForwardWithPattern_(distance);
    return;
  }

  Turtle.drawForward_(distance);
};

Turtle.drawForward_ = function (distance) {
  if (Turtle.shouldDrawJoints_()) {
    Turtle.drawForwardWithJoints_(distance);
  } else {
    Turtle.drawForwardLine_(distance);
  }
};

Turtle.drawForwardWithPattern_ = function (distance) {
  //TODO: deal with drawing joints, if appropriate
  Turtle.drawForwardLineWithPattern_(distance);
};

/**
 * Draws a line of length `distance`, adding joint knobs along the way
 * @param distance
 */
Turtle.drawForwardWithJoints_ = function (distance) {
  var remainingDistance = distance;

  while (remainingDistance > 0) {
    var enoughForFullSegment = remainingDistance >= JOINT_SEGMENT_LENGTH;
    var currentSegmentLength = enoughForFullSegment ? JOINT_SEGMENT_LENGTH : remainingDistance;

    remainingDistance -= currentSegmentLength;

    if (enoughForFullSegment) {
      Turtle.drawJointAtTurtle_();
    }

    Turtle.drawForwardLine_(currentSegmentLength);

    if (enoughForFullSegment) {
      Turtle.drawJointAtTurtle_();
    }
  }
};

Turtle.drawForwardLine_ = function (distance) {
  Turtle.ctxScratch.beginPath();
  Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  Turtle.jumpForward_(distance);
  Turtle.drawToTurtle_(distance);
  Turtle.ctxScratch.stroke();
};

Turtle.drawForwardLineWithPattern_ = function (distance) {
  Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  var img = Turtle.patternForPaths;
  var startX = Turtle.x;
  var startY = Turtle.y;

  Turtle.jumpForward_(distance);
  Turtle.ctxScratch.save();
  Turtle.ctxScratch.translate(startX, startY);
  Turtle.ctxScratch.rotate(Math.PI * (Turtle.heading - 90) / 180); // increment the angle and rotate the image.
                                                                 // Need to subtract 90 to accomodate difference in canvas
                                                                 // vs. Turtle direction
  Turtle.ctxScratch.drawImage(img,
    0, 0,                                 // Start point for clipping image
    distance+img.height / 2, img.height,  // clip region size
    -img.height / 4, -img.height / 2,      // draw location relative to the ctx.translate point pre-rotation
    distance+img.height / 2, img.height);

  Turtle.ctxScratch.restore();
};

Turtle.shouldDrawJoints_ = function () {
  return level.isK1 && !Turtle.isPredrawing_;
};

Turtle.drawJointAtTurtle_ = function () {
  Turtle.ctxScratch.beginPath();
  Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  Turtle.circleAt_(Turtle.x, Turtle.y, JOINT_RADIUS);
  Turtle.ctxScratch.stroke();
};

/**
 * Validate whether the user's answer is correct.
 * @param {number} pixelErrors Number of pixels that are wrong.
 * @param {number} permittedErrors Number of pixels allowed to be wrong.
 * @return {boolean} True if the level is solved, false otherwise.
 */
var isCorrect = function(pixelErrors, permittedErrors) {
  return pixelErrors <= permittedErrors;
};

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function() {
  var feedbackImageCanvas;
  if (skin.id == "anna" || skin.id == "elsa") {
    feedbackImageCanvas = Turtle.ctxDisplay;
  } else {
    feedbackImageCanvas = Turtle.ctxScratch;
  }

  BlocklyApps.displayFeedback({
    app: 'turtle', //XXX
    skin: skin.id,
    feedbackType: Turtle.testResults,
    message: Turtle.message,
    response: Turtle.response,
    level: level,
    feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: level.freePlay || level.impressive,
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && Turtle.response.save_to_gallery_url,
    appStrings: {
      reinfFeedbackMsg: turtleMsg.reinfFeedbackMsg(),
      sharingText: turtleMsg.shareDrawing()
    }
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Turtle.onReportComplete = function(response) {
  Turtle.response = response;
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  displayFeedback();
};

// This removes lengths from the text version of the XML of programs.
// It is used to determine if the user program and model solution are
// identical except for lengths.
var removeK1Lengths = function(s) {
  return s.replace(removeK1Lengths.regex, '">');
};

removeK1Lengths.regex = /_length"><title name="length">.*?<\/title>/;

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
Turtle.checkAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var userImage =
      Turtle.ctxScratch.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var answerImage =
      Turtle.ctxAnswer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var len = Math.min(userImage.data.length, answerImage.data.length);
  var delta = 0;
  // Pixels are in RGBA format.  Only check the Alpha bytes.
  for (var i = 3; i < len; i += 4) {
    // Copying and compositing images across canvases seems to distort the
    // alpha. Use a large error value (250) to compensate.
    if (Math.abs(userImage.data[i] - answerImage.data[i]) > 250) {
      delta++;
    }
  }

  // Allow some number of pixels to be off, but be stricter
  // for certain levels.
  var permittedErrors = level.permittedErrors;
  if (permittedErrors === undefined) {
    permittedErrors = 150;
  }

  // Test whether the current level is a free play level, or the level has
  // been completed
  var levelComplete = level.freePlay || isCorrect(delta, permittedErrors);
  Turtle.testResults = BlocklyApps.getTestResults(levelComplete);

  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var textBlocks = Blockly.Xml.domToText(xml);

  // Make sure we don't reuse an old message, since not all paths set one.
  Turtle.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !levelComplete && !BlocklyApps.editCode &&
      level.solutionBlocks &&
      removeK1Lengths(textBlocks) === removeK1Lengths(level.solutionBlocks)) {
    Turtle.testResults = BlocklyApps.TestResults.APP_SPECIFIC_ERROR;
    Turtle.message = turtleMsg.lengthFeedback();
  }

  // For levels where using too many blocks would allow students
  // to miss the point, convert that feedback to a failure.
  if (level.failForTooManyBlocks &&
      Turtle.testResults == BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    // TODO: Add more helpful error message.
    Turtle.testResults = BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL;

  } else if ((Turtle.testResults ==
      BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) ||
      (Turtle.testResults == BlocklyApps.TestResults.ALL_PASS)) {
    // Check that they didn't use a crazy large repeat value when drawing a
    // circle.  This complains if the limit doesn't start with 3.
    // Note that this level does not use colour, so no need to check for that.
    if (level.failForCircleRepeatValue) {
      var code = Blockly.Generator.workspaceToCode('JavaScript');
      if (code.indexOf('count < 3') == -1) {
        Turtle.testResults =
            BlocklyApps.TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        Turtle.message = commonMsg.tooMuchWork();
      }
    }
  }

  if (level.editCode) {
    Turtle.testResults = levelComplete ?
      BlocklyApps.TestResults.ALL_PASS :
      BlocklyApps.TestResults.TOO_FEW_BLOCKS_FAIL;
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Turtle.testResults = BlocklyApps.TestResults.FREE_PLAY;
  }

  // Play sound
  BlocklyApps.stopLoopingAudio('start');
  if (Turtle.testResults === BlocklyApps.TestResults.FREE_PLAY ||
      Turtle.testResults >= BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    BlocklyApps.playAudio('win');
  } else {
    BlocklyApps.playAudio('failure');
  }

  var reportData = {
    app: 'turtle',
    level: level.id,
    builder: level.builder,
    result: levelComplete,
    testResult: Turtle.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: Turtle.onReportComplete,
    save_to_gallery: level.impressive
  };

  // Get the canvas data for feedback.
  if (Turtle.testResults >= BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    reportData.image = getFeedbackImage();
  }

  BlocklyApps.report(reportData);

  // reenable toolbox
  Blockly.mainWorkspace.setEnableToolbox(true);

  // The call to displayFeedback() will happen later in onReportComplete()
};

var getFeedbackImage = function() {
  var feedbackImageCanvas;
  if (skin.id == "anna" || skin.id == "elsa") {
    feedbackImageCanvas = Turtle.ctxDisplay;
  } else {
    feedbackImageCanvas = Turtle.ctxScratch;
  }

  // Copy the user layer
  Turtle.ctxFeedback.globalCompositeOperation = 'copy';
  Turtle.ctxFeedback.drawImage(feedbackImageCanvas.canvas, 0, 0, 154, 154);
  var feedbackCanvas = Turtle.ctxFeedback.canvas;
  return encodeURIComponent(
      feedbackCanvas.toDataURL("image/png").split(',')[1]);
};
