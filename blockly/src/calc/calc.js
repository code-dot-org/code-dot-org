/**
 * Blockly Demo: Calc Graphics
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
 * @fileoverview Demonstration of Blockly: Calc Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

window.calc = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Calc = module.exports;
var commonMsg = require('../../locale/current/common');
var CalcMsg = require('../../locale/current/calc');
var skins = require('../skins');
var levels = require('./levels');
var Colours = require('./core').Colours;
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');

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
Calc.pid = 0;

/**
 * Should the Calc be drawn?
 */
Calc.visible = true;

/**
 * The avatar image
 */
Calc.avatarImage = new Image();
Calc.numberAvatarHeadings = undefined;

/**
 * Initialize Blockly and the Calc.  Called on page load.
 */
Calc.init = function(config) {

  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = true;
  config.insertWhenRun = true;

  // Enable blockly param editing in levelbuilder, regardless of level setting
  if (config.level.edit_blocks) {
    config.disableParamEditing = false;
  }

  Calc.AVATAR_HEIGHT = 51;
  Calc.AVATAR_WIDTH = 70;

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      blockUsed : undefined,
      idealBlockNumber : undefined,
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
    Blockly.JavaScript.addReservedWords('Calc,code');

    // Helper for creating canvas elements.
    var createCanvas = function(id, width, height) {
      var el = document.createElement('canvas');
      el.id = id;
      el.width = width;
      el.height = height;
      return el;
    };

    // Create hidden canvases.
    Calc.ctxAnswer = createCanvas('answer', 400, 400).getContext('2d');
    Calc.ctxImages = createCanvas('images', 400, 400).getContext('2d');
    Calc.ctxPredraw = createCanvas('predraw', 400, 400).getContext('2d');
    Calc.ctxScratch = createCanvas('scratch', 400, 400).getContext('2d');
    Calc.ctxFeedback = createCanvas('feedback', 154, 154).getContext('2d');

    // Create display canvas.
    var display = createCanvas('display', 400, 400);
    var visualization = document.getElementById('visualization');
    visualization.appendChild(display);
    Calc.ctxDisplay = display.getContext('2d');

    // Set their initial contents.
    Calc.loadCalc();
    Calc.drawImages();
    Calc.drawAnswer();
    if (level.predraw_blocks) {
      Calc.isPredrawing_ = true;
      Calc.drawBlocksOnCanvas(level.predraw_blocks, Calc.ctxPredraw);
      Calc.isPredrawing_ = false;
    }

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';
  };

  config.getDisplayWidth = function() {
    var el = document.getElementById('visualizationColumn');
    return el.getBoundingClientRect().width;
  };

  BlocklyApps.init(config);
};

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
Calc.drawAnswer = function() {
  if (level.solutionBlocks) {
    Calc.drawBlocksOnCanvas(level.solutionBlocks, Calc.ctxAnswer);
  } else {
    Calc.drawLogOnCanvas(level.answer, Calc.ctxAnswer);
  }
};

Calc.drawLogOnCanvas = function(log, canvas) {
  BlocklyApps.reset();
  while (log.length) {
    var tuple = log.shift();
    Calc.step(tuple[0], tuple.splice(1));
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(Calc.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

Calc.drawBlocksOnCanvas = function(blocks, canvas) {
  var domBlocks = Blockly.Xml.textToDom(blocks);
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, domBlocks);
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  Calc.evalCode(code);
  Blockly.mainWorkspace.clear();
  Calc.drawCurrentBlocksOnCanvas(canvas);
};

Calc.drawCurrentBlocksOnCanvas = function(canvas) {
  Calc.drawLogOnCanvas(api.log, canvas);
};

/**
 * Place an image at the specified coordinates.
 * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
 * @param {string} filename Relative path to image.
 * @param {!Array} position An x-y pair.
 */
Calc.placeImage = function(filename, position) {
  var img = new Image();
  img.onload = function() {
    Calc.ctxImages.drawImage(img, position[0], position[1]);
    Calc.display();
  };
  img.src = BlocklyApps.assetUrl('media/calc/' + filename);
};

/**
 * Draw the images for this page and level onto Calc.ctxImages.
 */
Calc.drawImages = function() {
  if (!level.images) {
    return;
  }
  for (var i = 0; i < level.images.length; i++) {
    var image = level.images[i];
    Calc.placeImage(image.filename, image.position);
  }
  Calc.ctxImages.globalCompositeOperation = 'copy';
  Calc.ctxImages.drawImage(Calc.ctxScratch.canvas, 0, 0);
  Calc.ctxImages.globalCompositeOperation = 'source-over';
};

/**
 * Initial the Calc image on load.
 */
Calc.loadCalc = function() {
  Calc.avatarImage.onload = function() {
    Calc.display();
  };
  Calc.avatarImage.src = skin.avatar;
  Calc.numberAvatarHeadings = 180;
  Calc.avatarImage.height = Calc.AVATAR_HEIGHT;
  Calc.avatarImage.width = Calc.AVATAR_WIDTH;
};

/**
 * Draw the Calc image based on Calc.x, Calc.y, and Calc.heading.
 */
Calc.drawCalc = function() {
  // Computes the index of the image in the sprite.
  var index = Math.floor(Calc.heading * Calc.numberAvatarHeadings / 360);
  var sourceX = Calc.avatarImage.width * index;
  var sourceY = 0;
  var sourceWidth = Calc.avatarImage.width;
  var sourceHeight = Calc.avatarImage.height;
  var destWidth = Calc.avatarImage.width;
  var destHeight = Calc.avatarImage.height;
  var destX = Calc.x - destWidth / 2;
  var destY = Calc.y - destHeight + 7;

  Calc.ctxDisplay.drawImage(Calc.avatarImage, sourceX, sourceY,
                              sourceWidth, sourceHeight, destX, destY,
                              destWidth, destHeight);
};

/**
 * Reset the Calc to the start position, clear the display, and kill any
 * pending tasks.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
BlocklyApps.reset = function(ignore) {
  // Standard starting location and heading of the Calc.
  Calc.x = CANVAS_HEIGHT / 2;
  Calc.y = CANVAS_WIDTH / 2;
  Calc.heading = level.startDirection !== undefined ?
      level.startDirection : 90;
  Calc.penDownValue = true;
  Calc.visible = true;

  // For special cases, use a different initial location.
  if (level.initialX !== undefined) {
    Calc.x = level.initialX;
  }
  if (level.initialY !== undefined) {
    Calc.y = level.initialY;
  }
  // Clear the display.
  Calc.ctxScratch.canvas.width = Calc.ctxScratch.canvas.width;
  Calc.ctxScratch.strokeStyle = '#000000';
  Calc.ctxScratch.fillStyle = '#000000';
  Calc.ctxScratch.lineWidth = 5;
  Calc.ctxScratch.lineCap = 'round';
  Calc.ctxScratch.font = 'normal 18pt Arial';
  Calc.display();

  // Clear the feedback.
  Calc.ctxFeedback.clearRect(
      0, 0, Calc.ctxFeedback.canvas.width, Calc.ctxFeedback.canvas.height);

  // Kill any task.
  if (Calc.pid) {
    window.clearTimeout(Calc.pid);
  }
  Calc.pid = 0;

  // Stop the looping sound.
  BlocklyApps.stopLoopingAudio('start');
};

/**
 * Copy the scratch canvas to the display canvas. Add a Calc marker.
 */
Calc.display = function() {
  // FF on linux retains drawing of previous location of artist unless we clear
  // the canvas first.
  var style = Calc.ctxDisplay.fillStyle;
  Calc.ctxDisplay.fillStyle = 'white';
  Calc.ctxDisplay.clearRect(0, 0, Calc.ctxDisplay.canvas.width,
    Calc.ctxDisplay.canvas.width);
  Calc.ctxDisplay.fillStyle = style;

  Calc.ctxDisplay.globalCompositeOperation = 'copy';
  // Draw the answer layer.
  Calc.ctxDisplay.globalAlpha = 0.15;
  Calc.ctxDisplay.drawImage(Calc.ctxAnswer.canvas, 0, 0);
  Calc.ctxDisplay.globalAlpha = 1;

  // Draw the images layer.
  Calc.ctxDisplay.globalCompositeOperation = 'source-over';
  Calc.ctxDisplay.drawImage(Calc.ctxImages.canvas, 0, 0);

  // Draw the predraw layer.
  Calc.ctxDisplay.globalCompositeOperation = 'source-over';
  Calc.ctxDisplay.drawImage(Calc.ctxPredraw.canvas, 0, 0);

  // Draw the user layer.
  Calc.ctxDisplay.globalCompositeOperation = 'source-over';
  Calc.ctxDisplay.drawImage(Calc.ctxScratch.canvas, 0, 0);

  // Draw the Calc.
  if (Calc.visible) {
    Calc.drawCalc();
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
  Calc.execute();
};

Calc.evalCode = function(code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Calc: api
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
 * Execute the user's code.  Heaven help us...
 */
Calc.execute = function() {
  api.log = [];

  if (feedback.hasExtraTopBlocks()) {
    // immediately check answer, which will fail and report top level blocks
    Calc.checkAnswer();
    return;
  }

  Calc.code = Blockly.Generator.workspaceToCode('JavaScript');
  Calc.evalCode(Calc.code);

  // api.log now contains a transcript of all the user's actions.
  // Reset the graphic and animate the transcript.
  BlocklyApps.reset();
  BlocklyApps.playAudio('start', {loop : true});
  Calc.pid = window.setTimeout(Calc.animate, 100);

  // Disable toolbox while running
  Blockly.mainWorkspace.setEnableToolbox(false);
};

/**
 * Iterate through the recorded path and animate the Calc's actions.
 */
Calc.animate = function() {
  // All tasks should be complete now.  Clean up the PID list.
  Calc.pid = 0;

  var tuple = api.log.shift();
  if (!tuple) {
    document.getElementById('spinner').style.visibility = 'hidden';
    Blockly.mainWorkspace.highlightBlock(null);
    Calc.checkAnswer();
    return;
  }
  var command = tuple.shift();
  BlocklyApps.highlight(tuple.pop());
  Calc.step(command, tuple);
  Calc.display();

  // Scale the speed non-linearly, to give better precision at the fast end.
  // var stepSpeed = 1000 * Math.pow(1 - Calc.speedSlider.getValue(), 2);
  var stepSpeed = 1000;
  Calc.pid = window.setTimeout(Calc.animate, stepSpeed);
};

/**
 * Execute one step.
 * @param {string} command Logo-style command (e.g. 'FD' or 'RT').
 * @param {!Array} values List of arguments for the command.
 */
Calc.step = function(command, values) {
  switch (command) {
    case 'FD':  // Forward
      Calc.moveForward_(values[0]);
      break;
    case 'JF':  // Jump forward
      Calc.jumpForward_(values[0]);
      break;
    case 'MV':  // Move (direction)
      var distance = values[0];
      var heading = values[1];
      Calc.setHeading_(heading);
      Calc.moveForward_(distance);
      break;
    case 'JD':  // Jump (direction)
      distance = values[0];
      heading = values[1];
      Calc.setHeading_(heading);
      Calc.jumpForward_(distance);
      break;
    case 'RT':  // Right Turn
      Calc.turnByDegrees_(values[0]);
      break;
    case 'DP':  // Draw Print
      Calc.ctxScratch.save();
      Calc.ctxScratch.translate(Calc.x, Calc.y);
      Calc.ctxScratch.rotate(2 * Math.PI * (Calc.heading - 90) / 360);
      Calc.ctxScratch.fillText(values[0], 0, 0);
      Calc.ctxScratch.restore();
      break;
    case 'DF':  // Draw Font
      Calc.ctxScratch.font = values[2] + ' ' + values[1] + 'pt ' + values[0];
      break;
    case 'PU':  // Pen Up
      Calc.penDownValue = false;
      break;
    case 'PD':  // Pen Down
      Calc.penDownValue = true;
      break;
    case 'PW':  // Pen Width
      Calc.ctxScratch.lineWidth = values[0];
      break;
    case 'PC':  // Pen Colour
      Calc.ctxScratch.strokeStyle = values[0];
      Calc.ctxScratch.fillStyle = values[0];
      break;
    case 'HT':  // Hide Calc
      Calc.visible = false;
      break;
    case 'ST':  // Show Calc
      Calc.visible = true;
      break;
  }
};

Calc.jumpForward_ = function (distance) {
  Calc.x += distance * Math.sin(2 * Math.PI * Calc.heading / 360);
  Calc.y -= distance * Math.cos(2 * Math.PI * Calc.heading / 360);
};

Calc.moveByRelativePosition_ = function (x, y) {
  Calc.x += x;
  Calc.y += y;
};

Calc.dotAt_ = function (x, y) {
  // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
  var dotLineLength = 0.1;
  Calc.ctxScratch.lineTo(x + dotLineLength, y);
};

Calc.circleAt_ = function (x, y, radius) {
  Calc.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
};

Calc.drawToCalc_ = function (distance) {
  var isDot = (distance === 0);
  if (isDot) {
    Calc.dotAt_(Calc.x, Calc.y);
  } else {
    Calc.ctxScratch.lineTo(Calc.x, Calc.y);
  }
};

Calc.turnByDegrees_ = function (degreesRight) {
  Calc.setHeading_(Calc.heading + degreesRight);
};

Calc.setHeading_ = function (heading) {
  heading = Calc.constrainDegrees_(heading);
  Calc.heading = heading;
};

Calc.constrainDegrees_ = function (degrees) {
  degrees %= 360;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
};

Calc.moveForward_ = function (distance) {
  if (!Calc.penDownValue) {
    Calc.jumpForward_(distance);
    return;
  }
  Calc.drawForward_(distance);
};

Calc.drawForward_ = function (distance) {
  if (Calc.shouldDrawJoints_()) {
    Calc.drawForwardWithJoints_(distance);
  } else {
    Calc.drawForwardLine_(distance);
  }
};

/**
 * Draws a line of length `distance`, adding joint knobs along the way
 * @param distance
 */
Calc.drawForwardWithJoints_ = function (distance) {
  var remainingDistance = distance;

  while (remainingDistance > 0) {
    var enoughForFullSegment = remainingDistance >= JOINT_SEGMENT_LENGTH;
    var currentSegmentLength = enoughForFullSegment ? JOINT_SEGMENT_LENGTH : remainingDistance;

    remainingDistance -= currentSegmentLength;

    if (enoughForFullSegment) {
      Calc.drawJointAtCalc_();
    }

    Calc.drawForwardLine_(currentSegmentLength);

    if (enoughForFullSegment) {
      Calc.drawJointAtCalc_();
    }
  }
};

Calc.drawForwardLine_ = function (distance) {
  Calc.ctxScratch.beginPath();
  Calc.ctxScratch.moveTo(Calc.x, Calc.y);
  Calc.jumpForward_(distance);
  Calc.drawToCalc_(distance);
  Calc.ctxScratch.stroke();
};

Calc.shouldDrawJoints_ = function () {
  return level.isK1 && !Calc.isPredrawing_;
};

Calc.drawJointAtCalc_ = function () {
  Calc.ctxScratch.beginPath();
  Calc.ctxScratch.moveTo(Calc.x, Calc.y);
  Calc.circleAt_(Calc.x, Calc.y, JOINT_RADIUS);
  Calc.ctxScratch.stroke();
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
  BlocklyApps.displayFeedback({
    app: 'Calc', //XXX
    skin: skin.id,
    feedbackType: Calc.testResults,
    message: Calc.message,
    response: Calc.response,
    level: level,
    feedbackImage: Calc.ctxScratch.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: level.freePlay || level.impressive,
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && Calc.response.save_to_gallery_url,
    appStrings: {
      reinfFeedbackMsg: CalcMsg.reinfFeedbackMsg(),
      sharingText: CalcMsg.shareDrawing()
    }
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Calc.onReportComplete = function(response) {
  Calc.response = response;
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
Calc.checkAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var userImage =
      Calc.ctxScratch.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var answerImage =
      Calc.ctxAnswer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
  Calc.testResults = BlocklyApps.getTestResults(levelComplete);

  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var textBlocks = Blockly.Xml.domToText(xml);

  // Make sure we don't reuse an old message, since not all paths set one.
  Calc.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !levelComplete && !BlocklyApps.editCode &&
      level.solutionBlocks &&
      removeK1Lengths(textBlocks) === removeK1Lengths(level.solutionBlocks)) {
    Calc.testResults = BlocklyApps.TestResults.APP_SPECIFIC_ERROR;
    Calc.message = CalcMsg.lengthFeedback();
  }

  // For levels where using too many blocks would allow students
  // to miss the point, convert that feedback to a failure.
  if (level.failForTooManyBlocks &&
      Calc.testResults == BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    // TODO: Add more helpful error message.
    Calc.testResults = BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL;

  } else if ((Calc.testResults ==
      BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) ||
      (Calc.testResults == BlocklyApps.TestResults.ALL_PASS)) {
    // Check that they didn't use a crazy large repeat value when drawing a
    // circle.  This complains if the limit doesn't start with 3.
    // Note that this level does not use colour, so no need to check for that.
    if (level.failForCircleRepeatValue) {
      var code = Blockly.Generator.workspaceToCode('JavaScript');
      if (code.indexOf('count < 3') == -1) {
        Calc.testResults =
            BlocklyApps.TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        Calc.message = commonMsg.tooMuchWork();
      }
    }
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Calc.testResults = BlocklyApps.TestResults.FREE_PLAY;
  }

  // Play sound
  BlocklyApps.stopLoopingAudio('start');
  if (Calc.testResults === BlocklyApps.TestResults.FREE_PLAY ||
      Calc.testResults >= BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    BlocklyApps.playAudio('win');
  } else {
    BlocklyApps.playAudio('failure');
  }

  var reportData = {
    app: 'Calc',
    level: level.id,
    builder: level.builder,
    result: levelComplete,
    testResult: Calc.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: Calc.onReportComplete,
    save_to_gallery: level.impressive
  };

  // Get the canvas data for feedback.
  if (Calc.testResults >= BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    reportData.image = getFeedbackImage();
  }

  BlocklyApps.report(reportData);

  // reenable toolbox
  Blockly.mainWorkspace.setEnableToolbox(true);

  // The call to displayFeedback() will happen later in onReportComplete()
};

var getFeedbackImage = function() {
  // Copy the user layer
  Calc.ctxFeedback.globalCompositeOperation = 'copy';
  Calc.ctxFeedback.drawImage(Calc.ctxScratch.canvas, 0, 0, 154, 154);
  var feedbackCanvas = Calc.ctxFeedback.canvas;
  return encodeURIComponent(
      feedbackCanvas.toDataURL("image/png").split(',')[1]);
};
