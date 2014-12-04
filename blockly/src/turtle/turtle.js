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
var levels = require('./levels');
var Colours = require('./core').Colours;
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var utils = require('../utils');

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = true;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var JOINT_RADIUS = 4;

var SMOOTH_ANIMATE_STEP_SIZE = 5;
var FAST_SMOOTH_ANIMATE_STEP_SIZE = 15;

/**
 * Minimum joint segment length
 */
var JOINT_SEGMENT_LENGTH = 50;

// image icons and image paths for the 'set pattern block'
exports.lineStylePatternOptions = [];

/**
 * PID of animation task currently executing.
 */
Turtle.pid = 0;

/**
 * Should the turtle be drawn?
 */
Turtle.visible = true;

/**
 * Set a turtle heading.
 */
Turtle.heading = 0;

/**
 * The avatar image
 */
Turtle.avatarImage = new Image();
Turtle.numberAvatarHeadings = undefined;

/**
 * The avatar animation decoration image
 */
Turtle.decorationAnimationImage = new Image();

/**
 * Drawing with a pattern
 */

Turtle.currentPathPattern = new Image();
Turtle.loadedPathPatterns = [];
Turtle.isDrawingWithPattern = false;

function backingScale(context) {
  // disable retina for now
  // if ('devicePixelRatio' in window) {
  //   if (window.devicePixelRatio > 1) {
  //     return window.devicePixelRatio;
  //   }
  // }
  return 1;
}

var retina = 1;

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Turtle.init = function(config) {

  skin = config.skin;
  level = config.level;

  exports.lineStylePatternOptions = [
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

  if (skin.id == "anna" || skin.id == "elsa")
  {
    retina = backingScale();

    // We don't support ratios other than 2 right now (sorry!) so fall back to 1.
    if (retina != 2)
      retina = 1;

    // let's try adding a background image
    level.images = [{}];
    if (retina > 1) {
      level.images[0].filename = 'background_2x.jpg';
    }
    else {
      level.images[0].filename = 'background.jpg';
    }

    level.images[0].position = [ 0, 0 ];
    level.images[0].scale = 1;
  }

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';

  if (skin.id == "anna")
  {
    Turtle.AVATAR_WIDTH = 73;
    Turtle.AVATAR_HEIGHT = 100;
  }
  else if (skin.id == "elsa")
  {
    Turtle.AVATAR_WIDTH = 73;
    Turtle.AVATAR_HEIGHT = 100;
    Turtle.DECORATIONANIMATION_WIDTH = 85;
    Turtle.DECORATIONANIMATION_HEIGHT = 85;
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
    BlocklyApps.loadAudio(skin.winSound, 'win');
    BlocklyApps.loadAudio(skin.startSound, 'start');
    BlocklyApps.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    if (BlocklyApps.usingBlockly) {
      // Add to reserved word list: API, local variables in execution evironment
      // (execute) and the infinite loop detection function.
      //XXX Not sure if this is still right.
      Blockly.JavaScript.addReservedWords('Turtle,code');
    }

    // Helper for creating canvas elements.
    var createCanvas = function(id, width, height) {
      var el = document.createElement('canvas');
      el.id = id;
      el.width = width;
      el.height = height;
      return el;
    };

    // Create hidden canvases.
    Turtle.ctxAnswer = createCanvas('answer', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxImages = createCanvas('images', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxPredraw = createCanvas('predraw', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxScratch = createCanvas('scratch', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxPattern = createCanvas('pattern', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxFeedback = createCanvas('feedback', 154, 154).getContext('2d');

    // Create display canvas.
    var display = createCanvas('display', 400 * retina, 400 * retina);

    if (retina > 1)
    {
      display.style.width = '400px';
      display.style.height = '400px';
    }

    var visualization = document.getElementById('visualization');
    visualization.appendChild(display);
    Turtle.ctxDisplay = display.getContext('2d');


    if (BlocklyApps.usingBlockly && (skin.id == "anna" || skin.id == "elsa")) {
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

    Turtle.loadDecorationAnimation();

    // Set their initial contents.
    Turtle.loadTurtle();
    Turtle.drawImages();
    Turtle.isDrawingAnswer_ = true;
    Turtle.drawAnswer();
    Turtle.isDrawingAnswer_ = false;
    if (level.predraw_blocks) {
      Turtle.isPredrawing_ = true;
      Turtle.drawBlocksOnCanvas(level.predraw_blocks, Turtle.ctxPredraw);
      Turtle.isPredrawing_ = false;
    }

    // pre-load image for line pattern block. Creating the image object and setting source doesn't seem to be
    // enough in this case, so we're actually creating and reusing the object within the document body.

    if (skin.id == "anna" || skin.id == "elsa")
    {
      var imageContainer = document.createElement('div');
      imageContainer.style.display='none';
      document.body.appendChild(imageContainer);

      for( var i = 0; i < exports.lineStylePatternOptions.length; i++) {
        var pattern = exports.lineStylePatternOptions[i][1];
        if (skin[pattern]) {
          var img = new Image();
          img.src = skin[pattern];
          Turtle.loadedPathPatterns[pattern] = img;
        }
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
    resetStepInfo();
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(Turtle.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

Turtle.drawBlocksOnCanvas = function(blocks, canvas) {
  var code;
  if (BlocklyApps.usingBlockly) {
    var domBlocks = Blockly.Xml.textToDom(blocks);
    Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, domBlocks);
    code = Blockly.Generator.blockSpaceToCode('JavaScript');
  } else {
    code = blocks;
  }
  Turtle.evalCode(code);
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.clear();
  }
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
      if (img.width !== 0) {
        Turtle.ctxImages.drawImage(img, position[0] * retina, position[1] * retina, img.width, img.height, 0, 0, img.width * scale, img.height * scale);
      }
    } else {
      if (img.width !== 0) {
        Turtle.ctxImages.drawImage(img, position[0] * retina, position[1] * retina);
      }
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
  if ((skin.id == "anna" || skin.id == "elsa") && retina > 1)
    Turtle.avatarImage.src = skin.avatar_2x;
  else
    Turtle.avatarImage.src = skin.avatar;
  if (skin.id == "anna")
    Turtle.numberAvatarHeadings = 36;
  else if (skin.id == "elsa")
    Turtle.numberAvatarHeadings = 18;
  else
    Turtle.numberAvatarHeadings = 180;
  Turtle.avatarImage.spriteHeight = Turtle.AVATAR_HEIGHT;
  Turtle.avatarImage.spriteWidth = Turtle.AVATAR_WIDTH;
};

/**
 * Initial the turtle animation deocration on load.
 */
Turtle.loadDecorationAnimation = function() {
  if (skin.id == "elsa")
  {
    if (retina > 1)
      Turtle.decorationAnimationImage.src = skin.decorationAnimation_2x;
    else
      Turtle.decorationAnimationImage.src = skin.decorationAnimation;
    Turtle.decorationAnimationImage.height = Turtle.DECORATIONANIMATION_HEIGHT;
    Turtle.decorationAnimationImage.width = Turtle.DECORATIONANIMATION_WIDTH;
  }
};

var turtleFrame = 0;


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
  var sourceX = Turtle.avatarImage.spriteWidth * index;
  if (skin.id == "anna" || skin.id == "elsa") {
    sourceY = Turtle.avatarImage.spriteHeight * turtleFrame;
    turtleFrame = (turtleFrame + 1) % skin.turtleNumFrames;
  } else {
    sourceY = 0;
  }
  var sourceWidth = Turtle.avatarImage.spriteWidth;
  var sourceHeight = Turtle.avatarImage.spriteHeight;
  var destWidth = Turtle.avatarImage.spriteWidth;
  var destHeight = Turtle.avatarImage.spriteHeight;
  var destX = Turtle.x - destWidth / 2;
  var destY = Turtle.y - destHeight + 7;

  if (Turtle.avatarImage.width === 0 || Turtle.avatarImage.height === 0)
    return;

  if (sourceX * retina < 0 ||
      sourceY * retina < 0 ||
      sourceX * retina + sourceWidth  * retina -0 > Turtle.avatarImage.width ||
      sourceY * retina + sourceHeight * retina > Turtle.avatarImage.height)
  {
    if (console && console.log) {
      console.log("drawImage is out of source bounds!");
    }
    return;
  }

  if (Turtle.avatarImage.width !== 0) {
    Turtle.ctxDisplay.drawImage(
      Turtle.avatarImage,
      Math.round(sourceX * retina), Math.round(sourceY * retina),
      sourceWidth * retina - 0, sourceHeight * retina,
      Math.round(destX * retina), Math.round(destY * retina),
      destWidth * retina - 0, destHeight * retina);
  }

  /* console.log(Math.round(sourceX * retina), Math.round(sourceY * retina),
                              sourceWidth * retina, sourceHeight * retina, Math.round(destX * retina), Math.round(destY * retina),
                              destWidth * retina, destHeight * retina); */
};

// An x offset against the sprite edge where the decoration should be drawn,
// along with whether it should be drawn before or after the turtle sprite itself.

var decorationImageDetails = [
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
  * This is called twice, once with "before" and once with "after", referring to before or after
  * the sprite is drawn.  For some angles it should be drawn before, and for some after.
  */

Turtle.drawDecorationAnimation = function(when) {
  if (skin.id == "elsa") {
    var frameIndex = (turtleFrame + 10) % skin.decorationAnimationNumFrames;

    var angleIndex = Math.floor(Turtle.heading * Turtle.numberAvatarHeadings / 360);

    // the rotations in the Anna & Elsa sprite sheets go in the opposite direction.
    angleIndex = Turtle.numberAvatarHeadings - angleIndex;

    // and they are 180 degrees out of phase.
    angleIndex = (angleIndex + Turtle.numberAvatarHeadings/2) % Turtle.numberAvatarHeadings;

    if (decorationImageDetails[angleIndex].when == when) {
      var sourceX = Turtle.decorationAnimationImage.width * frameIndex;
      var sourceY = 0;
      var sourceWidth = Turtle.decorationAnimationImage.width;
      var sourceHeight = Turtle.decorationAnimationImage.height;
      var destWidth = sourceWidth;
      var destHeight = sourceHeight;
      var destX = Turtle.x - destWidth / 2 - 15 - 15 + decorationImageDetails[angleIndex].x;
      var destY = Turtle.y - destHeight / 2 - 100;

      if (Turtle.decorationAnimationImage.width !== 0) {
        Turtle.ctxDisplay.drawImage(
          Turtle.decorationAnimationImage,
          Math.round(sourceX * retina), Math.round(sourceY * retina),
          sourceWidth * retina, sourceHeight * retina,
          Math.round(destX * retina), Math.round(destY * retina),
          destWidth * retina, destHeight * retina);
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
  Turtle.ctxPattern.canvas.width = Turtle.ctxPattern.canvas.width;
  if (skin.id == "anna") {
    Turtle.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.fillStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.lineWidth = 2 * retina;
  } else if (skin.id == "elsa") {
    Turtle.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.fillStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.lineWidth = 2 * retina;
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

  if (skin.id == "anna") {
    if (retina > 1)
      Turtle.setPattern("annaLine_2x");
    else
      Turtle.setPattern("annaLine");
  } else if (skin.id == "elsa") {
    if (retina > 1)
      Turtle.setPattern("elsaLine_2x");
    else
      Turtle.setPattern("elsaLine");
  } else {
    // Reset to empty pattern
    Turtle.setPattern(null);
  }

  // Kill any task.
  if (Turtle.pid) {
    window.clearTimeout(Turtle.pid);
  }
  Turtle.pid = 0;

  // Discard the interpreter.
  Turtle.interpreter = null;
  Turtle.executionError = null;

  // Stop the looping sound.
  BlocklyApps.stopLoopingAudio('start');

  resetStepInfo();
};

/**
 * When smooth animate is true, steps can be broken up into multiple animations.
 * At the end of each step, we want to reset any incremental information, which
 * is what this does.
 */
function resetStepInfo() {
  Turtle.stepStartX = Turtle.x;
  Turtle.stepStartY = Turtle.y;
  Turtle.stepDistanceCovered = 0;
}


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

  // Draw the pattern layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxPattern.canvas, 0, 0);

  // Draw the user layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (Turtle.visible) {
    Turtle.drawDecorationAnimation("before");
    Turtle.drawTurtle();
    Turtle.drawDecorationAnimation("after");
  }
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  document.getElementById('spinner').style.visibility = 'visible';
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.traceOn(true);
  }
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
    Turtle.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    Turtle.evalCode(Turtle.code);
  }

  // api.log now contains a transcript of all the user's actions.
  BlocklyApps.playAudio('start', {loop : true});
  // animate the transcript.
  Turtle.pid = window.setTimeout(Turtle.animate, 100);

  if (BlocklyApps.usingBlockly) {
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

    BlocklyApps.highlight(String(id));

    // Should we execute another tuple in this frame of animation?
    if (skin.consolidateTurnAndMove && checkforTurnAndMove()) {
      executeSecondTuple = true;
    }

    // We only smooth animate for Anna & Elsa, and only if there is not another tuple to be done.
    var tupleDone = Turtle.step(command, tuple.slice(1), {smoothAnimate: skin.smoothAnimate && !executeSecondTuple});
    Turtle.display();

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
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.highlightBlock(null);
  }
  Turtle.checkAnswer();
}

/**
 * Iterate through the recorded path and animate the turtle's actions.
 */
Turtle.animate = function() {

  // All tasks should be complete now.  Clean up the PID list.
  Turtle.pid = 0;

  // Scale the speed non-linearly, to give better precision at the fast end.
  var stepSpeed = 1000 * Math.pow(1 - Turtle.speedSlider.getValue(), 2) / skin.speedModifier;

  // when smoothAnimate is true, we divide long steps into partitions of this
  // size.
  Turtle.smoothAnimateStepSize = (stepSpeed === 0 ?
    FAST_SMOOTH_ANIMATE_STEP_SIZE : SMOOTH_ANIMATE_STEP_SIZE);

  if (level.editCode) {
    var stepped = true;
    while (stepped) {
      codegen.selectCurrentCode(Turtle.interpreter,
                                BlocklyApps.editor,
                                Turtle.cumulativeLength,
                                Turtle.userCodeStartOffset,
                                Turtle.userCodeLength);
      try {
        stepped = Turtle.interpreter.step();
      }
      catch(err) {
        Turtle.executionError = err;
        finishExecution();
        return;
      }
      stepped = Turtle.interpreter.step();

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

  Turtle.pid = window.setTimeout(Turtle.animate, stepSpeed);
};

Turtle.calculateSmoothAnimate = function(options, distance) {
  var tupleDone = true;
  var stepDistanceCovered = Turtle.stepDistanceCovered;

  if (options && options.smoothAnimate) {
    var fullDistance = distance;
    var smoothAnimateStepSize = Turtle.smoothAnimateStepSize;

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

  Turtle.stepDistanceCovered = stepDistanceCovered;

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
  var distance;
  var heading;

  switch (command) {
    case 'FD':  // Forward
      distance = values[0];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.moveForward_(result.distance);
      break;
    case 'JF':  // Jump forward
      distance = values[0];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.jumpForward_(result.distance);
      break;
    case 'MV':  // Move (direction)
      distance = values[0];
      heading = values[1];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.setHeading_(heading);
      Turtle.moveForward_(result.distance);
      break;
    case 'JD':  // Jump (direction)
      distance = values[0];
      heading = values[1];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.setHeading_(heading);
      Turtle.jumpForward_(result.distance);
      break;
    case 'RT':  // Right Turn
      distance = values[0];
      result = Turtle.calculateSmoothAnimate(options, distance);
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
      if (skin.id != "anna" && skin.id != "elsa") {
        Turtle.isDrawingWithPattern = false;
      }
      break;
    case 'PS':  // Pen style with image
      if (!values[0] || values[0] == 'DEFAULT') {
          Turtle.setPattern(null);
      } else {
        Turtle.setPattern(values[0]);
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
      if (img.width !== 0) {
        Turtle.ctxScratch.drawImage(img, x, y, width, height);
      }
      break;
  }

  return tupleDone;
};

Turtle.setPattern = function (pattern) {
  if (Turtle.loadedPathPatterns[pattern]) {
    Turtle.currentPathPattern = Turtle.loadedPathPatterns[pattern];
    Turtle.isDrawingWithPattern = true;
  } else if (pattern === null) {
    Turtle.currentPathPattern = new Image();
    Turtle.isDrawingWithPattern = false;
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
    Turtle.ctxScratch.lineTo(Turtle.x * retina, Turtle.y * retina);
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
    Turtle.drawForwardLineWithPattern_(distance);

    // Frozen gets both a pattern and a line over the top of it.
    if (skin.id != "elsa" && skin.id != "anna") {
      return;
    }
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

  if (skin.id == "anna" || skin.id == "elsa") {
    Turtle.ctxScratch.beginPath();
    Turtle.ctxScratch.moveTo(Turtle.stepStartX * retina, Turtle.stepStartY * retina);
    Turtle.jumpForward_(distance);
    Turtle.drawToTurtle_(distance);
    Turtle.ctxScratch.stroke();
  } else {
    Turtle.ctxScratch.beginPath();
    Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
    Turtle.jumpForward_(distance);
    Turtle.drawToTurtle_(distance);
    Turtle.ctxScratch.stroke();
  }

};

Turtle.drawForwardLineWithPattern_ = function (distance) {
  var img;
  var startX;
  var startY;

  if (skin.id == "anna" || skin.id == "elsa") {
    Turtle.ctxPattern.moveTo(Turtle.stepStartX * retina, Turtle.stepStartY * retina);
    img = Turtle.currentPathPattern;
    startX = Turtle.stepStartX;
    startY = Turtle.stepStartY;

    var lineDistance = Math.abs(Turtle.stepDistanceCovered);

    Turtle.ctxPattern.save();
    Turtle.ctxPattern.translate(startX * retina, startY * retina);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    Turtle.ctxPattern.rotate(Math.PI * (Turtle.heading - 90) / 180);

    var clipSize;
    if (lineDistance % Turtle.smoothAnimateStepSize === 0) {
      clipSize = Turtle.smoothAnimateStepSize;
    } else if (lineDistance > Turtle.smoothAnimateStepSize) {
      // this happens when our line was not divisible by smoothAnimateStepSize
      // and we've hit our last chunk
      clipSize = lineDistance % Turtle.smoothAnimateStepSize;
    } else {
      clipSize = lineDistance;
    }
    if (img.width !== 0) {
      Turtle.ctxPattern.drawImage(img,
        // Start point for clipping image
        Math.round(lineDistance * retina), 0,
        // clip region size
        clipSize * retina, img.height,
        // some mysterious hand-tweaking done by Brendan
        Math.round((Turtle.stepDistanceCovered - clipSize - 2) * retina), Math.round((- 18) * retina),
        clipSize * retina, img.height);
    }

    Turtle.ctxPattern.restore();

  } else {

    Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
    img = Turtle.currentPathPattern;
    startX = Turtle.x;
    startY = Turtle.y;

    Turtle.jumpForward_(distance);
    Turtle.ctxScratch.save();
    Turtle.ctxScratch.translate(startX, startY);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    Turtle.ctxScratch.rotate(Math.PI * (Turtle.heading - 90) / 180);

    if (img.width !== 0) {
      Turtle.ctxScratch.drawImage(img,
        // Start point for clipping image
        0, 0,
        // clip region size
        distance+img.height / 2, img.height,
        // draw location relative to the ctx.translate point pre-rotation
        -img.height / 4, -img.height / 2,
        distance+img.height / 2, img.height);
    }

    Turtle.ctxScratch.restore();
  }
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
    // For frozen skins, show background and characters along with drawing
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
    showingSharing: !level.disableSharing && (level.freePlay || level.impressive),
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && Turtle.response && Turtle.response.save_to_gallery_url,
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
  var levelComplete = (level.freePlay || isCorrect(delta, permittedErrors)) &&
                        (!level.editCode || !Turtle.executionError);
  Turtle.testResults = BlocklyApps.getTestResults(levelComplete);

  var program;
  if (BlocklyApps.usingBlockly) {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  // Make sure we don't reuse an old message, since not all paths set one.
  Turtle.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !levelComplete && !BlocklyApps.editCode &&
      level.solutionBlocks &&
      removeK1Lengths(program) === removeK1Lengths(level.solutionBlocks)) {
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
    if (level.failForCircleRepeatValue && BlocklyApps.usingBlockly) {
      var code = Blockly.Generator.blockSpaceToCode('JavaScript');
      if (code.indexOf('count < 3') == -1) {
        Turtle.testResults =
            BlocklyApps.TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        Turtle.message = commonMsg.tooMuchWork();
      }
    }
  }

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = BlocklyApps.editor.getValue();
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
    program: encodeURIComponent(program),
    onComplete: Turtle.onReportComplete,
    save_to_gallery: level.impressive
  };

  // Get the canvas data for feedback.
  if (Turtle.testResults >= BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    reportData.image = getFeedbackImage();
  }

  BlocklyApps.report(reportData);

  if (BlocklyApps.usingBlockly) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

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
