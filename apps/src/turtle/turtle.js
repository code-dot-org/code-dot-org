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

// Globals used in this file:
//  Blockly
//  StudioApp

/**
 * @fileoverview Demonstration of Blockly: Turtle Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var StudioApp = require('../base');
var commonMsg = require('../../locale/current/common');
var turtleMsg = require('../../locale/current/turtle');
var levels = require('./levels');
var Colours = require('./core').Colours;
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var utils = require('../utils');
var Slider = require('../slider');

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var JOINT_RADIUS = 4;

var SMOOTH_ANIMATE_STEP_SIZE = 5;
var FAST_SMOOTH_ANIMATE_STEP_SIZE = 15;

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

/**
 * An instantiable Turtle class
 */
var TurtleClass = function () {
  // image icons and image paths for the 'set pattern block'
  this.lineStylePatternOptions = [];

  // PID of animation task currently executing.
  this.pid = 0;

  // Should the turtle be drawn?
  this.visible = true;

  // Set a turtle heading.
  this.heading = 0;

  // The avatar image
  this.avatarImage = new Image();
  this.numberAvatarHeadings = undefined;

  // The avatar animation decoration image
  this.decorationAnimationImage = new Image();

  // Drawing with a pattern
  this.currentPathPattern = new Image();
  this.loadedPathPatterns = [];
  this.isDrawingWithPattern = false;

  StudioApp.CHECK_FOR_EMPTY_BLOCKS = true;
  StudioApp.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

  // these get set by init based on skin.
  // TODO (brent) - dont capitalize, these arent constants
  this.AVATAR_WIDTH = 0;
  this.AVATAR_HEIGHT = 0;
  this.DECORATIONANIMATION_WIDTH = 85;
  this.DECORATIONANIMATION_HEIGHT = 85;
  this.speedSlider = null;

  this.ctxAnswer = null;
  this.ctxImages = null;
  this.ctxPredraw = null;
  this.ctxScratch = null;
  this.ctxPattern = null;
  this.ctxFeedback = null;
  this.ctxDisplay = null;

  this.isDrawingAnswer_ = false;
  this.isPredrawing_ = false;
};

var turtleSingleton = new TurtleClass();
module.exports = turtleSingleton;

// TODO - move this onto class probably
var skin;
var level;

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
TurtleClass.prototype.init = function(config) {

  skin = config.skin;
  level = config.level;

  this.lineStylePatternOptions = [
    [skin.patternDefault, 'DEFAULT'], //  signals return to default path drawing
    [skin.rainbowMenu, 'rainbowLine'],  // set to property name for image within skin
    [skin.ropeMenu, 'ropeLine'],  // referenced as skin[pattern];
    [skin.squigglyMenu, 'squigglyLine'],
    [skin.swirlyMenu, 'swirlyLine'],
    [skin.annaLine, 'annaLine'],
    [skin.elsaLine, 'elsaLine'],
    [skin.annaLine_2x, 'annaLine_2x'],
    [skin.elsaLine_2x, 'elsaLine_2x'],
  ];

  if (skin.id == "anna" || skin.id == "elsa") {
    // let's try adding a background image
    level.images = [{}];
    level.images[0].filename = 'background.jpg';

    level.images[0].position = [ 0, 0 ];
    level.images[0].scale = 1;
  }

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';

  if (skin.id == "anna") {
    this.AVATAR_WIDTH = 73;
    this.AVATAR_HEIGHT = 100;
  }
  else if (skin.id == "elsa") {
    this.AVATAR_WIDTH = 73;
    this.AVATAR_HEIGHT = 100;
    this.DECORATIONANIMATION_WIDTH = 85;
    this.DECORATIONANIMATION_HEIGHT = 85;
  } else {
    this.AVATAR_WIDTH = 70;
    this.AVATAR_HEIGHT = 51;
  }

  config.html = page({
    assetUrl: StudioApp.assetUrl,
    data: {
      localeDirection: StudioApp.localeDirection(),
      controls: require('./controls.html')({assetUrl: StudioApp.assetUrl}),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  // TODO (brent) - pull these functions out

  config.loadAudio = function() {
    StudioApp.loadAudio(skin.winSound, 'win');
    StudioApp.loadAudio(skin.startSound, 'start');
    StudioApp.loadAudio(skin.failureSound, 'failure');
  };

  var self = this;
  config.afterInject = function () {
    self.afterInject_(config);
  }

  StudioApp.init(config);
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
TurtleClass.prototype.afterInject_ = function (config) {
  if (this !== turtleSingleton) {
    throw new Error("failure");
  }

  // Initialize the slider.
  var slider = document.getElementById('slider');
  this.speedSlider = new Slider(10, 35, 130, slider);

  // Change default speed (eg Speed up levels that have lots of steps).
  if (config.level.sliderSpeed) {
    this.speedSlider.setValue(config.level.sliderSpeed);
  }

  if (StudioApp.usingBlockly) {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    //XXX Not sure if this is still right.
    Blockly.JavaScript.addReservedWords('Turtle,code');
  }

  // Create hidden canvases.
  this.ctxAnswer = this.createCanvas_('answer', 400, 400).getContext('2d');
  this.ctxImages = this.createCanvas_('images', 400, 400).getContext('2d');
  this.ctxPredraw = this.createCanvas_('predraw', 400, 400).getContext('2d');
  this.ctxScratch = this.createCanvas_('scratch', 400, 400).getContext('2d');
  this.ctxPattern = this.createCanvas_('pattern', 400, 400).getContext('2d');
  this.ctxFeedback = this.createCanvas_('feedback', 154, 154).getContext('2d');

  // Create display canvas.
  var displayCanvas = this.createCanvas_('display', 400, 400);

  var visualization = document.getElementById('visualization');
  visualization.appendChild(displayCanvas);
  this.ctxDisplay = displayCanvas.getContext('2d');

  // TODO - pull this out
  if (StudioApp.usingBlockly && (skin.id == "anna" || skin.id == "elsa")) {
    Blockly.JavaScript.colour_random = function() {
      // Generate a random colour.
      if (!Blockly.JavaScript.definitions_.colour_random) {
        var functionName = Blockly.JavaScript.variableDB_.getDistinctName(
          'colour_random', Blockly.Generator.NAME_TYPE);
          Blockly.JavaScript.colour_random.functionName = functionName;
          var func = [];
          func.push('function ' + functionName + '() {');
          func.push('   var colors = ' + JSON.stringify(Blockly.FieldColour.COLOURS) + ';');
          func.push('  return colors[Math.floor(Math.random()*colors.length)];');
          func.push('}');
          Blockly.JavaScript.definitions_.colour_random = func.join('\n');
        }
        var code = Blockly.JavaScript.colour_random.functionName + '()';
        return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
      };
    }

    this.loadDecorationAnimation();

    // Set their initial contents.
    this.loadTurtle();
    this.drawImages();
    this.isDrawingAnswer_ = true;
    this.drawAnswer();
    this.isDrawingAnswer_ = false;
    if (level.predraw_blocks) {
      this.isPredrawing_ = true;
      this.drawBlocksOnCanvas(level.predraw_blocks, this.ctxPredraw);
      this.isPredrawing_ = false;
    }

    // pre-load image for line pattern block. Creating the image object and setting source doesn't seem to be
    // enough in this case, so we're actually creating and reusing the object within the document body.

    if (skin.id == "anna" || skin.id == "elsa") {
      var imageContainer = document.createElement('div');
      imageContainer.style.display='none';
      document.body.appendChild(imageContainer);

      for( var i = 0; i < this.lineStylePatternOptions.length; i++) {
        var pattern = this.lineStylePatternOptions[i][1];
        if (skin[pattern]) {
          var img = new Image();
          img.src = skin[pattern];
          this.loadedPathPatterns[pattern] = img;
        }
      }
    }

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';
  };

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
turtleSingleton.drawAnswer = function() {
  if (level.solutionBlocks) {
    turtleSingleton.drawBlocksOnCanvas(level.solutionBlocks, turtleSingleton.ctxAnswer);
  } else {
    turtleSingleton.drawLogOnCanvas(level.answer, turtleSingleton.ctxAnswer);
  }
};

turtleSingleton.drawLogOnCanvas = function(log, canvas) {
  StudioApp.reset();
  while (log.length) {
    var tuple = log.shift();
    turtleSingleton.step(tuple[0], tuple.splice(1), {smoothAnimate: false});
    resetStepInfo();
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(turtleSingleton.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

turtleSingleton.drawBlocksOnCanvas = function(blocks, canvas) {
  var code;
  if (StudioApp.usingBlockly) {
    var domBlocks = Blockly.Xml.textToDom(blocks);
    Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, domBlocks);
    code = Blockly.Generator.blockSpaceToCode('JavaScript');
  } else {
    code = blocks;
  }
  turtleSingleton.evalCode(code);
  if (StudioApp.usingBlockly) {
    Blockly.mainBlockSpace.clear();
  }
  turtleSingleton.drawCurrentBlocksOnCanvas(canvas);
};

turtleSingleton.drawCurrentBlocksOnCanvas = function(canvas) {
  turtleSingleton.drawLogOnCanvas(api.log, canvas);
};

/**
 * Place an image at the specified coordinates.
 * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
 * @param {string} filename Relative path to image.
 * @param {!Array} position An x-y pair.
 * @param {number} optional scale at which image is drawn
 */
turtleSingleton.placeImage = function(filename, position, scale) {
  var img = new Image();
  img.onload = function() {
    if (scale) {
      if (img.width !== 0) {
        turtleSingleton.ctxImages.drawImage(img, position[0], position[1], img.width, img.height, 0, 0, img.width * scale, img.height * scale);
      }
    } else {
      if (img.width !== 0) {
        turtleSingleton.ctxImages.drawImage(img, position[0], position[1]);
      }
    }
    turtleSingleton.display();
  };
  if (skin.id == "anna" || skin.id == "elsa")
  {
    img.src = skin.assetUrl(filename);
  }
  else
  {
    img.src = StudioApp.assetUrl('media/turtle/' + filename);
  }
};

/**
 * Draw the images for this page and level onto turtleSingleton.ctxImages.
 */
turtleSingleton.drawImages = function() {
  if (!level.images) {
    return;
  }
  for (var i = 0; i < level.images.length; i++) {
    var image = level.images[i];
    turtleSingleton.placeImage(image.filename, image.position, image.scale);
  }
  turtleSingleton.ctxImages.globalCompositeOperation = 'copy';
  turtleSingleton.ctxImages.drawImage(turtleSingleton.ctxScratch.canvas, 0, 0);
  turtleSingleton.ctxImages.globalCompositeOperation = 'source-over';
};

/**
 * Initial the turtle image on load.
 */
turtleSingleton.loadTurtle = function() {
  turtleSingleton.avatarImage.onload = function() {
    turtleSingleton.display();
  };

  turtleSingleton.avatarImage.src = skin.avatar;
  if (skin.id == "anna")
    turtleSingleton.numberAvatarHeadings = 36;
  else if (skin.id == "elsa")
    turtleSingleton.numberAvatarHeadings = 18;
  else
    turtleSingleton.numberAvatarHeadings = 180;
  turtleSingleton.avatarImage.spriteHeight = turtleSingleton.AVATAR_HEIGHT;
  turtleSingleton.avatarImage.spriteWidth = turtleSingleton.AVATAR_WIDTH;
};

/**
 * Initial the turtle animation deocration on load.
 */
turtleSingleton.loadDecorationAnimation = function() {
  if (skin.id == "elsa") {
    turtleSingleton.decorationAnimationImage.src = skin.decorationAnimation;
    turtleSingleton.decorationAnimationImage.height = turtleSingleton.DECORATIONANIMATION_HEIGHT;
    turtleSingleton.decorationAnimationImage.width = turtleSingleton.DECORATIONANIMATION_WIDTH;
  }
};

var turtleFrame = 0;


/**
 * Draw the turtle image based on turtleSingleton.x, turtleSingleton.y, and turtleSingleton.heading.
 */
turtleSingleton.drawTurtle = function() {
  var sourceY;
  // Computes the index of the image in the sprite.
  var index = Math.floor(turtleSingleton.heading * turtleSingleton.numberAvatarHeadings / 360);
  if (skin.id == "anna" || skin.id == "elsa") {
    // the rotations in the sprite sheet go in the opposite direction.
    index = turtleSingleton.numberAvatarHeadings - index;

    // and they are 180 degrees out of phase.
    index = (index + turtleSingleton.numberAvatarHeadings/2) % turtleSingleton.numberAvatarHeadings;
  }
  var sourceX = turtleSingleton.avatarImage.spriteWidth * index;
  if (skin.id == "anna" || skin.id == "elsa") {
    sourceY = turtleSingleton.avatarImage.spriteHeight * turtleFrame;
    turtleFrame = (turtleFrame + 1) % skin.turtleNumFrames;
  } else {
    sourceY = 0;
  }
  var sourceWidth = turtleSingleton.avatarImage.spriteWidth;
  var sourceHeight = turtleSingleton.avatarImage.spriteHeight;
  var destWidth = turtleSingleton.avatarImage.spriteWidth;
  var destHeight = turtleSingleton.avatarImage.spriteHeight;
  var destX = turtleSingleton.x - destWidth / 2;
  var destY = turtleSingleton.y - destHeight + 7;

  if (turtleSingleton.avatarImage.width === 0 || turtleSingleton.avatarImage.height === 0)
    return;

  if (sourceX < 0 ||
      sourceY < 0 ||
      sourceX + sourceWidth  -0 > turtleSingleton.avatarImage.width ||
      sourceY + sourceHeight > turtleSingleton.avatarImage.height)
  {
    if (console && console.log) {
      console.log("drawImage is out of source bounds!");
    }
    return;
  }

  if (turtleSingleton.avatarImage.width !== 0) {
    turtleSingleton.ctxDisplay.drawImage(
      turtleSingleton.avatarImage,
      Math.round(sourceX), Math.round(sourceY),
      sourceWidth - 0, sourceHeight,
      Math.round(destX), Math.round(destY),
      destWidth - 0, destHeight);
  }
};

/**
  * This is called twice, once with "before" and once with "after", referring to before or after
  * the sprite is drawn.  For some angles it should be drawn before, and for some after.
  */

turtleSingleton.drawDecorationAnimation = function(when) {
  if (skin.id == "elsa") {
    var frameIndex = (turtleFrame + 10) % skin.decorationAnimationNumFrames;

    var angleIndex = Math.floor(turtleSingleton.heading * turtleSingleton.numberAvatarHeadings / 360);

    // the rotations in the Anna & Elsa sprite sheets go in the opposite direction.
    angleIndex = turtleSingleton.numberAvatarHeadings - angleIndex;

    // and they are 180 degrees out of phase.
    angleIndex = (angleIndex + turtleSingleton.numberAvatarHeadings/2) % turtleSingleton.numberAvatarHeadings;

    if (ELSA_DECORATION_DETAILS[angleIndex].when == when) {
      var sourceX = turtleSingleton.decorationAnimationImage.width * frameIndex;
      var sourceY = 0;
      var sourceWidth = turtleSingleton.decorationAnimationImage.width;
      var sourceHeight = turtleSingleton.decorationAnimationImage.height;
      var destWidth = sourceWidth;
      var destHeight = sourceHeight;
      var destX = turtleSingleton.x - destWidth / 2 - 15 - 15 + ELSA_DECORATION_DETAILS[angleIndex].x;
      var destY = turtleSingleton.y - destHeight / 2 - 100;

      if (turtleSingleton.decorationAnimationImage.width !== 0) {
        turtleSingleton.ctxDisplay.drawImage(
          turtleSingleton.decorationAnimationImage,
          Math.round(sourceX), Math.round(sourceY),
          sourceWidth, sourceHeight,
          Math.round(destX), Math.round(destY),
          destWidth, destHeight);
      }
    }
  }
};


/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
StudioApp.reset = function(ignore) {
  // Standard starting location and heading of the turtle.
  turtleSingleton.x = CANVAS_HEIGHT / 2;
  turtleSingleton.y = CANVAS_WIDTH / 2;
  turtleSingleton.heading = level.startDirection !== undefined ?
      level.startDirection : 90;
  turtleSingleton.penDownValue = true;
  turtleSingleton.visible = true;

  // For special cases, use a different initial location.
  if (level.initialX !== undefined) {
    turtleSingleton.x = level.initialX;
  }
  if (level.initialY !== undefined) {
    turtleSingleton.y = level.initialY;
  }
  // Clear the display.
  turtleSingleton.ctxScratch.canvas.width = turtleSingleton.ctxScratch.canvas.width;
  turtleSingleton.ctxPattern.canvas.width = turtleSingleton.ctxPattern.canvas.width;
  if (skin.id == "anna") {
    turtleSingleton.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    turtleSingleton.ctxScratch.fillStyle = 'rgb(255,255,255)';
    turtleSingleton.ctxScratch.lineWidth = 2;
  } else if (skin.id == "elsa") {
    turtleSingleton.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    turtleSingleton.ctxScratch.fillStyle = 'rgb(255,255,255)';
    turtleSingleton.ctxScratch.lineWidth = 2;
  } else {
    turtleSingleton.ctxScratch.strokeStyle = '#000000';
    turtleSingleton.ctxScratch.fillStyle = '#000000';
    turtleSingleton.ctxScratch.lineWidth = 5;
  }

  turtleSingleton.ctxScratch.lineCap = 'round';
  turtleSingleton.ctxScratch.font = 'normal 18pt Arial';
  turtleSingleton.display();

  // Clear the feedback.
  turtleSingleton.ctxFeedback.clearRect(
      0, 0, turtleSingleton.ctxFeedback.canvas.width, turtleSingleton.ctxFeedback.canvas.height);

  if (skin.id == "anna") {
    turtleSingleton.setPattern("annaLine");
  } else if (skin.id == "elsa") {
    turtleSingleton.setPattern("elsaLine");
  } else {
    // Reset to empty pattern
    turtleSingleton.setPattern(null);
  }

  // Kill any task.
  if (turtleSingleton.pid) {
    window.clearTimeout(turtleSingleton.pid);
  }
  turtleSingleton.pid = 0;

  // Discard the interpreter.
  turtleSingleton.interpreter = null;
  turtleSingleton.executionError = null;

  // Stop the looping sound.
  StudioApp.stopLoopingAudio('start');

  resetStepInfo();
};

/**
 * When smooth animate is true, steps can be broken up into multiple animations.
 * At the end of each step, we want to reset any incremental information, which
 * is what this does.
 */
function resetStepInfo() {
  turtleSingleton.stepStartX = turtleSingleton.x;
  turtleSingleton.stepStartY = turtleSingleton.y;
  turtleSingleton.stepDistanceCovered = 0;
}


/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
turtleSingleton.display = function() {
  // FF on linux retains drawing of previous location of artist unless we clear
  // the canvas first.
  var style = turtleSingleton.ctxDisplay.fillStyle;
  turtleSingleton.ctxDisplay.fillStyle = 'white';
  turtleSingleton.ctxDisplay.clearRect(0, 0, turtleSingleton.ctxDisplay.canvas.width,
    turtleSingleton.ctxDisplay.canvas.width);
  turtleSingleton.ctxDisplay.fillStyle = style;

  turtleSingleton.ctxDisplay.globalCompositeOperation = 'copy';
  // Draw the images layer.
  turtleSingleton.ctxDisplay.globalCompositeOperation = 'source-over';
  turtleSingleton.ctxDisplay.drawImage(turtleSingleton.ctxImages.canvas, 0, 0);

  // Draw the answer layer.
  if (skin.id == "anna" || skin.id == "elsa") {
    turtleSingleton.ctxDisplay.globalAlpha = 0.4;
  } else {
    turtleSingleton.ctxDisplay.globalAlpha = 0.15;
  }
  turtleSingleton.ctxDisplay.drawImage(turtleSingleton.ctxAnswer.canvas, 0, 0);
  turtleSingleton.ctxDisplay.globalAlpha = 1;

  // Draw the predraw layer.
  turtleSingleton.ctxDisplay.globalCompositeOperation = 'source-over';
  turtleSingleton.ctxDisplay.drawImage(turtleSingleton.ctxPredraw.canvas, 0, 0);

  // Draw the pattern layer.
  turtleSingleton.ctxDisplay.globalCompositeOperation = 'source-over';
  turtleSingleton.ctxDisplay.drawImage(turtleSingleton.ctxPattern.canvas, 0, 0);

  // Draw the user layer.
  turtleSingleton.ctxDisplay.globalCompositeOperation = 'source-over';
  turtleSingleton.ctxDisplay.drawImage(turtleSingleton.ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (turtleSingleton.visible) {
    turtleSingleton.drawDecorationAnimation("before");
    turtleSingleton.drawTurtle();
    turtleSingleton.drawDecorationAnimation("after");
  }
};

/**
 * Click the run button.  Start the program.
 */
StudioApp.runButtonClick = function() {
  StudioApp.toggleRunReset('reset');
  document.getElementById('spinner').style.visibility = 'visible';
  if (StudioApp.usingBlockly) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  StudioApp.attempts++;
  turtleSingleton.execute();

};

turtleSingleton.evalCode = function(code) {
  try {
    codegen.evalWith(code, {
      StudioApp: StudioApp,
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
 * Set up turtleSingleton.code, turtleSingleton.interpreter, etc. to run code for editCode levels
 */
function generateTurtleCodeFromJS () {
  turtleSingleton.code = utils.generateCodeAliases(level.codeFunctions, 'Turtle');
  turtleSingleton.userCodeStartOffset = turtleSingleton.code.length;
  turtleSingleton.code += StudioApp.editor.getValue();
  turtleSingleton.userCodeLength = turtleSingleton.code.length - turtleSingleton.userCodeStartOffset;

  var session = StudioApp.editor.aceEditor.getSession();
  turtleSingleton.cumulativeLength = codegen.aceCalculateCumulativeLength(session);

  var initFunc = function(interpreter, scope) {
    codegen.initJSInterpreter(interpreter, scope, {
                                      StudioApp: StudioApp,
                                      Turtle: api } );
  };
  turtleSingleton.interpreter = new window.Interpreter(turtleSingleton.code, initFunc);
}

/**
 * Execute the user's code.  Heaven help us...
 */
turtleSingleton.execute = function() {
  api.log = [];

  // Reset the graphic.
  StudioApp.reset();

  if (feedback.hasExtraTopBlocks()) {
    // immediately check answer, which will fail and report top level blocks
    turtleSingleton.checkAnswer();
    return;
  }

  if (level.editCode) {
    generateTurtleCodeFromJS();
  } else {
    turtleSingleton.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    turtleSingleton.evalCode(turtleSingleton.code);
  }

  // api.log now contains a transcript of all the user's actions.
  StudioApp.playAudio('start', {loop : true});
  // animate the transcript.
  turtleSingleton.pid = window.setTimeout(turtleSingleton.animate, 100);

  if (StudioApp.usingBlockly) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }
};

/**
 * Special case: if we have a turn, followed by a move forward, then we can just
 * do the turn instantly and then begin the move forward in the same frame.
 */
function checkforTurnAndMove() {
  var nextIsForward = false;

  var currentTuple = api.log[0];
  var currentCommand = currentTuple[0];
  var currentValues = currentTuple.slice(1);

  // Check first for a small turn movement.
  if (currentCommand === 'RT') {
    var currentAngle = currentValues[0];
    if (Math.abs(currentAngle) <= 10) {
      // Check that next command is a move forward.
      if (api.log.length > 1) {
        var nextTuple = api.log[1];
        var nextCommand = nextTuple[0];
        if (nextCommand === 'FD') {
          nextIsForward = true;
        }
      }
    }
  }

  return nextIsForward;
}


/**
 * Attempt to execute one command from the log of API commands.
 */
function executeTuple () {
  if (api.log.length === 0) {
    return false;
  }

  var executeSecondTuple;

  do {
    // Unless something special happens, we will just execute a single tuple.
    executeSecondTuple = false;

    var tuple = api.log[0];
    var command = tuple[0];
    var id = tuple[tuple.length-1];

    StudioApp.highlight(String(id));

    // Should we execute another tuple in this frame of animation?
    if (skin.consolidateTurnAndMove && checkforTurnAndMove()) {
      executeSecondTuple = true;
    }

    // We only smooth animate for Anna & Elsa, and only if there is not another tuple to be done.
    var tupleDone = turtleSingleton.step(command, tuple.slice(1), {smoothAnimate: skin.smoothAnimate && !executeSecondTuple});
    turtleSingleton.display();

    if (tupleDone) {
      api.log.shift();
      resetStepInfo();
    }
  } while (executeSecondTuple);

  return true;
}

/**
 * Handle the tasks to be done after the user program is finished.
 */
function finishExecution () {
  document.getElementById('spinner').style.visibility = 'hidden';
  if (StudioApp.usingBlockly) {
    Blockly.mainBlockSpace.highlightBlock(null);
  }
  turtleSingleton.checkAnswer();
}

/**
 * Iterate through the recorded path and animate the turtle's actions.
 */
turtleSingleton.animate = function() {

  // All tasks should be complete now.  Clean up the PID list.
  turtleSingleton.pid = 0;

  // Scale the speed non-linearly, to give better precision at the fast end.
  var stepSpeed = 1000 * Math.pow(1 - turtleSingleton.speedSlider.getValue(), 2) / skin.speedModifier;

  // when smoothAnimate is true, we divide long steps into partitions of this
  // size.
  turtleSingleton.smoothAnimateStepSize = (stepSpeed === 0 ?
    FAST_SMOOTH_ANIMATE_STEP_SIZE : SMOOTH_ANIMATE_STEP_SIZE);

  if (level.editCode) {
    var stepped = true;
    while (stepped) {
      codegen.selectCurrentCode(turtleSingleton.interpreter,
                                StudioApp.editor,
                                turtleSingleton.cumulativeLength,
                                turtleSingleton.userCodeStartOffset,
                                turtleSingleton.userCodeLength);
      try {
        stepped = turtleSingleton.interpreter.step();
      }
      catch(err) {
        turtleSingleton.executionError = err;
        finishExecution();
        return;
      }
      stepped = turtleSingleton.interpreter.step();

      if (executeTuple()) {
        // We stepped far enough that we executed a commmand, break out:
        break;
      }
    }
    if (!stepped && !executeTuple()) {
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

  turtleSingleton.pid = window.setTimeout(turtleSingleton.animate, stepSpeed);
};

turtleSingleton.calculateSmoothAnimate = function(options, distance) {
  var tupleDone = true;
  var stepDistanceCovered = turtleSingleton.stepDistanceCovered;

  if (options && options.smoothAnimate) {
    var fullDistance = distance;
    var smoothAnimateStepSize = turtleSingleton.smoothAnimateStepSize;

    if (fullDistance < 0) {
      // Going backward.
      if (stepDistanceCovered - smoothAnimateStepSize <= fullDistance) {
        // clamp at maximum
        distance = fullDistance - stepDistanceCovered;
        stepDistanceCovered = fullDistance;
      } else {
        distance = -smoothAnimateStepSize;
        stepDistanceCovered -= smoothAnimateStepSize;
        tupleDone = false;
      }

    } else {
      // Going foward.
      if (stepDistanceCovered + smoothAnimateStepSize >= fullDistance) {
        // clamp at maximum
        distance = fullDistance - stepDistanceCovered;
        stepDistanceCovered = fullDistance;
      } else {
        distance = smoothAnimateStepSize;
        stepDistanceCovered += smoothAnimateStepSize;
        tupleDone = false;
      }
    }
  }

  turtleSingleton.stepDistanceCovered = stepDistanceCovered;

  return { tupleDone: tupleDone, distance: distance };
};

/**
 * Execute one step.
 * @param {string} command Logo-style command (e.g. 'FD' or 'RT').
 * @param {!Array} values List of arguments for the command.
 * @param {number} fraction How much of this step's distance do we draw?
 * @param {object} single option for now: smoothAnimate (true/false)
 */
turtleSingleton.step = function(command, values, options) {
  var tupleDone = true;
  var result;
  var distance;
  var heading;

  switch (command) {
    case 'FD':  // Forward
      distance = values[0];
      result = turtleSingleton.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      turtleSingleton.moveForward_(result.distance);
      break;
    case 'JF':  // Jump forward
      distance = values[0];
      result = turtleSingleton.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      turtleSingleton.jumpForward_(result.distance);
      break;
    case 'MV':  // Move (direction)
      distance = values[0];
      heading = values[1];
      result = turtleSingleton.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      turtleSingleton.setHeading_(heading);
      turtleSingleton.moveForward_(result.distance);
      break;
    case 'JD':  // Jump (direction)
      distance = values[0];
      heading = values[1];
      result = turtleSingleton.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      turtleSingleton.setHeading_(heading);
      turtleSingleton.jumpForward_(result.distance);
      break;
    case 'RT':  // Right Turn
      distance = values[0];
      result = turtleSingleton.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      turtleSingleton.turnByDegrees_(result.distance);
      break;
    case 'DP':  // Draw Print
      turtleSingleton.ctxScratch.save();
      turtleSingleton.ctxScratch.translate(turtleSingleton.x, turtleSingleton.y);
      turtleSingleton.ctxScratch.rotate(2 * Math.PI * (turtleSingleton.heading - 90) / 360);
      turtleSingleton.ctxScratch.fillText(values[0], 0, 0);
      turtleSingleton.ctxScratch.restore();
      break;
    case 'DF':  // Draw Font
      turtleSingleton.ctxScratch.font = values[2] + ' ' + values[1] + 'pt ' + values[0];
      break;
    case 'PU':  // Pen Up
      turtleSingleton.penDownValue = false;
      break;
    case 'PD':  // Pen Down
      turtleSingleton.penDownValue = true;
      break;
    case 'PW':  // Pen Width
      turtleSingleton.ctxScratch.lineWidth = values[0];
      break;
    case 'PC':  // Pen Colour
      turtleSingleton.ctxScratch.strokeStyle = values[0];
      turtleSingleton.ctxScratch.fillStyle = values[0];
      if (skin.id != "anna" && skin.id != "elsa") {
        turtleSingleton.isDrawingWithPattern = false;
      }
      break;
    case 'PS':  // Pen style with image
      if (!values[0] || values[0] == 'DEFAULT') {
          turtleSingleton.setPattern(null);
      } else {
        turtleSingleton.setPattern(values[0]);
      }
      break;
    case 'HT':  // Hide Turtle
      turtleSingleton.visible = false;
      break;
    case 'ST':  // Show Turtle
      turtleSingleton.visible = true;
      break;
    case 'stamp':
      var img = turtleSingleton.stamps[values[0]];
      var width = img.width / 2;
      var height = img.height / 2;
      var x = turtleSingleton.x - width / 2;
      var y = turtleSingleton.y - height / 2;
      if (img.width !== 0) {
        turtleSingleton.ctxScratch.drawImage(img, x, y, width, height);
      }
      break;
  }

  return tupleDone;
};

turtleSingleton.setPattern = function (pattern) {
  if (turtleSingleton.loadedPathPatterns[pattern]) {
    turtleSingleton.currentPathPattern = turtleSingleton.loadedPathPatterns[pattern];
    turtleSingleton.isDrawingWithPattern = true;
  } else if (pattern === null) {
    turtleSingleton.currentPathPattern = new Image();
    turtleSingleton.isDrawingWithPattern = false;
  }
};

turtleSingleton.jumpForward_ = function (distance) {
  turtleSingleton.x += distance * Math.sin(2 * Math.PI * turtleSingleton.heading / 360);
  turtleSingleton.y -= distance * Math.cos(2 * Math.PI * turtleSingleton.heading / 360);
};

turtleSingleton.moveByRelativePosition_ = function (x, y) {
  turtleSingleton.x += x;
  turtleSingleton.y += y;
};

turtleSingleton.dotAt_ = function (x, y) {
  // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
  var dotLineLength = 0.1;
  turtleSingleton.ctxScratch.lineTo(x + dotLineLength, y);
};

turtleSingleton.circleAt_ = function (x, y, radius) {
  turtleSingleton.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
};

turtleSingleton.drawToTurtle_ = function (distance) {
  var isDot = (distance === 0);
  if (isDot) {
    turtleSingleton.dotAt_(turtleSingleton.x, turtleSingleton.y);
  } else {
    turtleSingleton.ctxScratch.lineTo(turtleSingleton.x, turtleSingleton.y);
  }
};

turtleSingleton.turnByDegrees_ = function (degreesRight) {
  turtleSingleton.setHeading_(turtleSingleton.heading + degreesRight);
};

turtleSingleton.setHeading_ = function (heading) {
  heading = turtleSingleton.constrainDegrees_(heading);
  turtleSingleton.heading = heading;
};

turtleSingleton.constrainDegrees_ = function (degrees) {
  degrees %= 360;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
};

turtleSingleton.moveForward_ = function (distance) {
  if (!turtleSingleton.penDownValue) {
    turtleSingleton.jumpForward_(distance);
    return;
  }
  if (turtleSingleton.isDrawingWithPattern) {
    turtleSingleton.drawForwardLineWithPattern_(distance);

    // Frozen gets both a pattern and a line over the top of it.
    if (skin.id != "elsa" && skin.id != "anna") {
      return;
    }
  }

  turtleSingleton.drawForward_(distance);
};

turtleSingleton.drawForward_ = function (distance) {
  if (turtleSingleton.shouldDrawJoints_()) {
    turtleSingleton.drawForwardWithJoints_(distance);
  } else {
    turtleSingleton.drawForwardLine_(distance);
  }
};

/**
 * Draws a line of length `distance`, adding joint knobs along the way
 * @param distance
 */
turtleSingleton.drawForwardWithJoints_ = function (distance) {
  var remainingDistance = distance;

  while (remainingDistance > 0) {
    var enoughForFullSegment = remainingDistance >= JOINT_SEGMENT_LENGTH;
    var currentSegmentLength = enoughForFullSegment ? JOINT_SEGMENT_LENGTH : remainingDistance;

    remainingDistance -= currentSegmentLength;

    if (enoughForFullSegment) {
      turtleSingleton.drawJointAtTurtle_();
    }

    turtleSingleton.drawForwardLine_(currentSegmentLength);

    if (enoughForFullSegment) {
      turtleSingleton.drawJointAtTurtle_();
    }
  }
};

turtleSingleton.drawForwardLine_ = function (distance) {

  if (skin.id == "anna" || skin.id == "elsa") {
    turtleSingleton.ctxScratch.beginPath();
    turtleSingleton.ctxScratch.moveTo(turtleSingleton.stepStartX, turtleSingleton.stepStartY);
    turtleSingleton.jumpForward_(distance);
    turtleSingleton.drawToTurtle_(distance);
    turtleSingleton.ctxScratch.stroke();
  } else {
    turtleSingleton.ctxScratch.beginPath();
    turtleSingleton.ctxScratch.moveTo(turtleSingleton.x, turtleSingleton.y);
    turtleSingleton.jumpForward_(distance);
    turtleSingleton.drawToTurtle_(distance);
    turtleSingleton.ctxScratch.stroke();
  }

};

turtleSingleton.drawForwardLineWithPattern_ = function (distance) {
  var img;
  var startX;
  var startY;

  if (skin.id == "anna" || skin.id == "elsa") {
    turtleSingleton.ctxPattern.moveTo(turtleSingleton.stepStartX, turtleSingleton.stepStartY);
    img = turtleSingleton.currentPathPattern;
    startX = turtleSingleton.stepStartX;
    startY = turtleSingleton.stepStartY;

    var lineDistance = Math.abs(turtleSingleton.stepDistanceCovered);

    turtleSingleton.ctxPattern.save();
    turtleSingleton.ctxPattern.translate(startX, startY);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    turtleSingleton.ctxPattern.rotate(Math.PI * (turtleSingleton.heading - 90) / 180);

    var clipSize;
    if (lineDistance % turtleSingleton.smoothAnimateStepSize === 0) {
      clipSize = turtleSingleton.smoothAnimateStepSize;
    } else if (lineDistance > turtleSingleton.smoothAnimateStepSize) {
      // this happens when our line was not divisible by smoothAnimateStepSize
      // and we've hit our last chunk
      clipSize = lineDistance % turtleSingleton.smoothAnimateStepSize;
    } else {
      clipSize = lineDistance;
    }
    if (img.width !== 0) {
      turtleSingleton.ctxPattern.drawImage(img,
        // Start point for clipping image
        Math.round(lineDistance), 0,
        // clip region size
        clipSize, img.height,
        // some mysterious hand-tweaking done by Brendan
        Math.round((turtleSingleton.stepDistanceCovered - clipSize - 2)), Math.round((- 18)),
        clipSize, img.height);
    }

    turtleSingleton.ctxPattern.restore();

  } else {

    turtleSingleton.ctxScratch.moveTo(turtleSingleton.x, turtleSingleton.y);
    img = turtleSingleton.currentPathPattern;
    startX = turtleSingleton.x;
    startY = turtleSingleton.y;

    turtleSingleton.jumpForward_(distance);
    turtleSingleton.ctxScratch.save();
    turtleSingleton.ctxScratch.translate(startX, startY);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    turtleSingleton.ctxScratch.rotate(Math.PI * (turtleSingleton.heading - 90) / 180);

    if (img.width !== 0) {
      turtleSingleton.ctxScratch.drawImage(img,
        // Start point for clipping image
        0, 0,
        // clip region size
        distance+img.height / 2, img.height,
        // draw location relative to the ctx.translate point pre-rotation
        -img.height / 4, -img.height / 2,
        distance+img.height / 2, img.height);
    }

    turtleSingleton.ctxScratch.restore();
  }
};

turtleSingleton.shouldDrawJoints_ = function () {
  return level.isK1 && !turtleSingleton.isPredrawing_;
};

turtleSingleton.drawJointAtTurtle_ = function () {
  turtleSingleton.ctxScratch.beginPath();
  turtleSingleton.ctxScratch.moveTo(turtleSingleton.x, turtleSingleton.y);
  turtleSingleton.circleAt_(turtleSingleton.x, turtleSingleton.y, JOINT_RADIUS);
  turtleSingleton.ctxScratch.stroke();
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
 * StudioApp.displayFeedback when appropriate
 */
var displayFeedback = function() {
  var feedbackImageCanvas;
  if (skin.id == "anna" || skin.id == "elsa") {
    // For frozen skins, show background and characters along with drawing
    feedbackImageCanvas = turtleSingleton.ctxDisplay;
  } else {
    feedbackImageCanvas = turtleSingleton.ctxScratch;
  }

  StudioApp.displayFeedback({
    app: 'turtle', //XXX
    skin: skin.id,
    feedbackType: turtleSingleton.testResults,
    message: turtleSingleton.message,
    response: turtleSingleton.response,
    level: level,
    feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay || level.impressive),
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && turtleSingleton.response && turtleSingleton.response.save_to_gallery_url,
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
turtleSingleton.onReportComplete = function(response) {
  turtleSingleton.response = response;
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
turtleSingleton.checkAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var userImage =
      turtleSingleton.ctxScratch.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var answerImage =
      turtleSingleton.ctxAnswer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
  var levelComplete = (level.freePlay || isCorrect(delta, permittedErrors)) &&
                        (!level.editCode || !turtleSingleton.executionError);
  turtleSingleton.testResults = StudioApp.getTestResults(levelComplete);

  var program;
  if (StudioApp.usingBlockly) {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  // Make sure we don't reuse an old message, since not all paths set one.
  turtleSingleton.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !levelComplete && !StudioApp.editCode &&
      level.solutionBlocks &&
      removeK1Lengths(program) === removeK1Lengths(level.solutionBlocks)) {
    turtleSingleton.testResults = StudioApp.TestResults.APP_SPECIFIC_ERROR;
    turtleSingleton.message = turtleMsg.lengthFeedback();
  }

  // For levels where using too many blocks would allow students
  // to miss the point, convert that feedback to a failure.
  if (level.failForTooManyBlocks &&
      turtleSingleton.testResults == StudioApp.TestResults.TOO_MANY_BLOCKS_FAIL) {
    // TODO: Add more helpful error message.
    turtleSingleton.testResults = StudioApp.TestResults.TOO_MANY_BLOCKS_FAIL;

  } else if ((turtleSingleton.testResults ==
      StudioApp.TestResults.TOO_MANY_BLOCKS_FAIL) ||
      (turtleSingleton.testResults == StudioApp.TestResults.ALL_PASS)) {
    // Check that they didn't use a crazy large repeat value when drawing a
    // circle.  This complains if the limit doesn't start with 3.
    // Note that this level does not use colour, so no need to check for that.
    if (level.failForCircleRepeatValue && StudioApp.usingBlockly) {
      var code = Blockly.Generator.blockSpaceToCode('JavaScript');
      if (code.indexOf('count < 3') == -1) {
        turtleSingleton.testResults =
            StudioApp.TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        turtleSingleton.message = commonMsg.tooMuchWork();
      }
    }
  }

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = StudioApp.editor.getValue();
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    turtleSingleton.testResults = StudioApp.TestResults.FREE_PLAY;
  }

  // Play sound
  StudioApp.stopLoopingAudio('start');
  if (turtleSingleton.testResults === StudioApp.TestResults.FREE_PLAY ||
      turtleSingleton.testResults >= StudioApp.TestResults.TOO_MANY_BLOCKS_FAIL) {
    StudioApp.playAudio('win');
  } else {
    StudioApp.playAudio('failure');
  }

  var reportData = {
    app: 'turtle',
    level: level.id,
    builder: level.builder,
    result: levelComplete,
    testResult: turtleSingleton.testResults,
    program: encodeURIComponent(program),
    onComplete: turtleSingleton.onReportComplete,
    save_to_gallery: level.impressive
  };

  // https://www.pivotaltracker.com/story/show/84171560
  // Never send up frozen images for now.
  var isFrozen = (skin.id === 'anna' || skin.id === 'elsa');

  // Get the canvas data for feedback.
  if (turtleSingleton.testResults >= StudioApp.TestResults.TOO_MANY_BLOCKS_FAIL &&
    !isFrozen && (level.freePlay || level.impressive)) {
    reportData.image = getFeedbackImage();
  }

  StudioApp.report(reportData);

  if (StudioApp.usingBlockly) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

  // The call to displayFeedback() will happen later in onReportComplete()
};

var getFeedbackImage = function() {
  var feedbackImageCanvas;
  if (skin.id == "anna" || skin.id == "elsa") {
    feedbackImageCanvas = turtleSingleton.ctxDisplay;
  } else {
    feedbackImageCanvas = turtleSingleton.ctxScratch;
  }

  // Copy the user layer
  turtleSingleton.ctxFeedback.globalCompositeOperation = 'copy';
  turtleSingleton.ctxFeedback.drawImage(feedbackImageCanvas.canvas, 0, 0, 154, 154);
  var feedbackCanvas = turtleSingleton.ctxFeedback.canvas;
  return encodeURIComponent(
      feedbackCanvas.toDataURL("image/png").split(',')[1]);
};

// Helper for creating canvas elements.
TurtleClass.prototype.createCanvas_ = function (id, width, height) {
  var el = document.createElement('canvas');
  el.id = id;
  el.width = width;
  el.height = height;
  return el;
};
