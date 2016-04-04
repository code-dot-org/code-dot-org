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

/**
 * @fileoverview Demonstration of Blockly: Turtle Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var color = require('../color');
var commonMsg = require('../locale');
var turtleMsg = require('./locale');
var levels = require('./levels');
var Colours = require('./colours');
var codegen = require('../codegen');
var ArtistAPI = require('./api');
var apiJavascript = require('./apiJavascript');
var AppView = require('../templates/AppView.jsx');
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var Slider = require('../slider');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');
var JSInterpreter = require('../JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var MAX_STICKER_SIZE = 100;

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
 * An instantiable Artist class
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var Artist = function () {
  this.skin = null;
  this.level = null;

  this.api = new ArtistAPI();
  apiJavascript.injectArtistAPI(this.api);

  /** @type {JSInterpreter} */
  this.JSInterpreter = null;

  /** @private {JsInterpreterLogger} */
  this.consoleLogger_ = new JsInterpreterLogger(window.console);

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

  // these get set by init based on skin.
  this.avatarWidth = 0;
  this.avatarHeight = 0;
  this.decorationAnimationWidth = 85;
  this.decorationAnimationHeight = 85;
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

module.exports = Artist;


/**
 * todo
 */
Artist.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = _.bind(this.reset, this);
  this.studioApp_.runButtonClick = _.bind(this.runButtonClick, this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Artist.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error("Artist requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  // Preload sticker images
  this.stickers = {};
  for (var name in this.skin.stickers) {
    var img = new Image();
    img.src = this.skin.stickers[name];

    this.stickers[name] = img;
  }

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    // let's try adding a background image
    this.level.images = [{}];
    this.level.images[0].filename = 'background.jpg';

    this.level.images[0].position = [ 0, 0 ];
    this.level.images[0].scale = 1;
  }

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';
  config.dropletConfig = dropletConfig;

  if (this.skin.id == "anna") {
    this.avatarWidth = 73;
    this.avatarHeight = 100;
  } else if (this.skin.id == "elsa") {
    this.avatarWidth = 73;
    this.avatarHeight = 100;
    this.decorationAnimationWidth = 85;
    this.decorationAnimationHeight = 85;
  } else {
    this.avatarWidth = 70;
    this.avatarHeight = 51;
  }

  var iconPath = 'media/turtle/' + (config.isLegacyShare && config.hideSource ? 'icons_white.png' : 'icons.png');
  config.loadAudio = _.bind(this.loadAudio_, this);
  config.afterInject = _.bind(this.afterInject_, this, config);

  var generateCodeWorkspaceHtmlFromEjs = function () {
    return codeWorkspaceEjs({
      assetUrl: this.studioApp_.assetUrl,
      data: {
        localeDirection: this.studioApp_.localeDirection(),
        blockUsed : undefined,
        idealBlockNumber : undefined,
        editCode: this.level.editCode,
        blockCounterClass : 'block-counter-default',
        readonlyWorkspace: config.readonlyWorkspace
      }
    });
  }.bind(this);

  var generateVisualizationColumnHtmlFromEjs = function () {
    return visualizationColumnEjs({
      assetUrl: this.studioApp_.assetUrl,
      data: {
        visualization: '',
        controls: require('./controls.html.ejs')({assetUrl: this.studioApp_.assetUrl, iconPath: iconPath})
      }
    });
  }.bind(this);

  ReactDOM.render(React.createElement(AppView, {
    assetUrl: this.studioApp_.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    noVisualization: false,
    isRtl: this.studioApp_.isRtl(),
    generateCodeWorkspaceHtml: generateCodeWorkspaceHtmlFromEjs,
    generateVisualizationColumnHtml: generateVisualizationColumnHtmlFromEjs,
    onMount: this.studioApp_.init.bind(this.studioApp_, config)
  }), document.getElementById(config.containerId));
};

Artist.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
Artist.prototype.afterInject_ = function (config) {
  // Initialize the slider.
  var slider = document.getElementById('slider');
  this.speedSlider = new Slider(10, 35, 130, slider);

  // Change default speed (eg Speed up levels that have lots of steps).
  if (config.level.sliderSpeed) {
    this.speedSlider.setValue(config.level.sliderSpeed);
  }

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
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

  // TODO (br-pair): - pull this out?
  if (this.studioApp_.isUsingBlockly() && (this.skin.id === "anna" || this.skin.id === "elsa")) {
    // Override colour_random to only generate random colors from within our frozen
    // palette
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

  if (this.level.predrawBlocks) {
    this.isPredrawing_ = true;
    this.drawBlocksOnCanvas(this.level.predrawBlocks, this.ctxPredraw);
    this.isPredrawing_ = false;
  }

  // pre-load image for line pattern block. Creating the image object and setting source doesn't seem to be
  // enough in this case, so we're actually creating and reusing the object within the document body.
  var imageContainer = document.createElement('div');
  imageContainer.style.display='none';
  document.body.appendChild(imageContainer);

  for( var i = 0; i < this.skin.lineStylePatternOptions.length; i++) {
    var pattern = this.skin.lineStylePatternOptions[i][1];
    if (this.skin[pattern]) {
      var img = new Image();
      img.src = this.skin[pattern];
      this.loadedPathPatterns[pattern] = img;
    }
  }

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = '400px';
};

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
Artist.prototype.drawAnswer = function() {
  if (this.level.solutionBlocks) {
    this.drawBlocksOnCanvas(this.level.solutionBlocks, this.ctxAnswer);
  } else {
    this.drawLogOnCanvas(this.level.answer, this.ctxAnswer);
  }
};

/**
 * Given a set of commands and a canvas, draws the commands onto the canvas
 * composited over the scratch canvas.
 */
Artist.prototype.drawLogOnCanvas = function(log, canvas) {
  this.studioApp_.reset();
  while (log.length) {
    var tuple = log.shift();
    this.step(tuple[0], tuple.splice(1), {smoothAnimate: false});
    this.resetStepInfo_();
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(this.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

/**
 * Evaluates blocks or code, and draws onto given canvas.
 */
Artist.prototype.drawBlocksOnCanvas = function(blocksOrCode, canvas) {
  var code;
  if (this.studioApp_.isUsingBlockly()) {
    var domBlocks = Blockly.Xml.textToDom(blocksOrCode);
    Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, domBlocks);
    code = Blockly.Generator.blockSpaceToCode('JavaScript');
  } else {
    code = blocksOrCode;
  }
  this.evalCode(code);
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.clear();
  }
  this.drawCurrentBlocksOnCanvas(canvas);
};

/**
 * Draws the results of block evaluation (stored on api.log) onto the given
 * canvas.
 */
Artist.prototype.drawCurrentBlocksOnCanvas = function(canvas) {
  this.drawLogOnCanvas(this.api.log, canvas);
};

/**
 * Place an image at the specified coordinates.
 * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
 * @param {string} filename Relative path to image.
 * @param {!Array} position An x-y pair.
 * @param {number} optional scale at which image is drawn
 */
Artist.prototype.placeImage = function(filename, position, scale) {
  var img = new Image();
  img.onload = _.bind(function() {
    if (img.width !== 0) {
      if (scale) {
        this.ctxImages.drawImage(img, position[0], position[1], img.width,
          img.height, 0, 0, img.width * scale, img.height * scale);
      } else  {
        this.ctxImages.drawImage(img, position[0], position[1]);
      }
    }
    this.display();
  }, this);

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    img.src = this.skin.assetUrl(filename);
  } else {
    img.src = this.studioApp_.assetUrl('media/turtle/' + filename);
  }
};

/**
 * Draw the images for this page and level onto this.ctxImages.
 */
Artist.prototype.drawImages = function() {
  if (!this.level.images) {
    return;
  }
  for (var i = 0; i < this.level.images.length; i++) {
    var image = this.level.images[i];
    this.placeImage(image.filename, image.position, image.scale);
  }
  this.ctxImages.globalCompositeOperation = 'copy';
  this.ctxImages.drawImage(this.ctxScratch.canvas, 0, 0);
  this.ctxImages.globalCompositeOperation = 'source-over';
};

/**
 * Initial the turtle image on load.
 */
Artist.prototype.loadTurtle = function() {
  this.avatarImage.onload = _.bind(this.display, this);

  this.avatarImage.src = this.skin.avatar;
  if (this.skin.id == "anna") {
    this.numberAvatarHeadings = 36;
  } else if (this.skin.id == "elsa") {
    this.numberAvatarHeadings = 18;
  } else {
    this.numberAvatarHeadings = 180;
  }
  this.avatarImage.spriteHeight = this.avatarHeight;
  this.avatarImage.spriteWidth = this.avatarWidth;
};

/**
 * Initial the turtle animation deocration on load.
 */
Artist.prototype.loadDecorationAnimation = function() {
  if (this.skin.id == "elsa") {
    this.decorationAnimationImage.src = this.skin.decorationAnimation;
    this.decorationAnimationImage.height = this.decorationAnimationHeight;
    this.decorationAnimationImage.width = this.decorationAnimationWidth;
  }
};

var turtleFrame = 0;


/**
 * Draw the turtle image based on this.x, this.y, and this.heading.
 */
Artist.prototype.drawTurtle = function() {
  var sourceY;
  // Computes the index of the image in the sprite.
  var index = Math.floor(this.heading * this.numberAvatarHeadings / 360);
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    // the rotations in the sprite sheet go in the opposite direction.
    index = this.numberAvatarHeadings - index;

    // and they are 180 degrees out of phase.
    index = (index + this.numberAvatarHeadings/2) % this.numberAvatarHeadings;
  }
  var sourceX = this.avatarImage.spriteWidth * index;
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    sourceY = this.avatarImage.spriteHeight * turtleFrame;
    turtleFrame = (turtleFrame + 1) % this.skin.turtleNumFrames;
  } else {
    sourceY = 0;
  }
  var sourceWidth = this.avatarImage.spriteWidth;
  var sourceHeight = this.avatarImage.spriteHeight;
  var destWidth = this.avatarImage.spriteWidth;
  var destHeight = this.avatarImage.spriteHeight;
  var destX = this.x - destWidth / 2;
  var destY = this.y - destHeight + 7;

  if (this.avatarImage.width === 0 || this.avatarImage.height === 0) {
    return;
  }

  if (sourceX < 0 ||
      sourceY < 0 ||
      sourceX + sourceWidth  -0 > this.avatarImage.width ||
      sourceY + sourceHeight > this.avatarImage.height) {
    if (console && console.log) {
      // TODO(bjordan): ask Brent, starting to flood grunt mochaTest messages,
      // better fix here?
      // console.log("drawImage is out of source bounds!");
    }
    return;
  }

  if (this.avatarImage.width !== 0) {
    this.ctxDisplay.drawImage(
      this.avatarImage,
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

Artist.prototype.drawDecorationAnimation = function(when) {
  if (this.skin.id == "elsa") {
    var frameIndex = (turtleFrame + 10) % this.skin.decorationAnimationNumFrames;

    var angleIndex = Math.floor(this.heading * this.numberAvatarHeadings / 360);

    // the rotations in the Anna & Elsa sprite sheets go in the opposite direction.
    angleIndex = this.numberAvatarHeadings - angleIndex;

    // and they are 180 degrees out of phase.
    angleIndex = (angleIndex + this.numberAvatarHeadings/2) % this.numberAvatarHeadings;

    if (ELSA_DECORATION_DETAILS[angleIndex].when == when) {
      var sourceX = this.decorationAnimationImage.width * frameIndex;
      var sourceY = 0;
      var sourceWidth = this.decorationAnimationImage.width;
      var sourceHeight = this.decorationAnimationImage.height;
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
};


/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
Artist.prototype.reset = function (ignore) {
  // Standard starting location and heading of the turtle.
  this.x = CANVAS_HEIGHT / 2;
  this.y = CANVAS_WIDTH / 2;
  this.heading = this.level.startDirection !== undefined ?
      this.level.startDirection : 90;
  this.penDownValue = true;
  this.visible = true;

  // For special cases, use a different initial location.
  if (this.level.initialX !== undefined) {
    this.x = this.level.initialX;
  }
  if (this.level.initialY !== undefined) {
    this.y = this.level.initialY;
  }
  // Clear the display.
  this.ctxScratch.canvas.width = this.ctxScratch.canvas.width;
  this.ctxPattern.canvas.width = this.ctxPattern.canvas.width;
  if (this.skin.id == "anna") {
    this.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    this.ctxScratch.fillStyle = 'rgb(255,255,255)';
    this.ctxScratch.lineWidth = 2;
  } else if (this.skin.id == "elsa") {
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

  if (this.skin.id == "anna") {
    this.setPattern("annaLine");
  } else if (this.skin.id == "elsa") {
    this.setPattern("elsaLine");
  } else {
    // Reset to empty pattern
    this.setPattern(null);
  }

  // Kill any task.
  if (this.pid) {
    window.clearTimeout(this.pid);
  }
  this.pid = 0;

  // Discard the interpreter.
  this.consoleLogger_.detach();

  // Discard the interpreter.
  if (this.JSInterpreter) {
    this.JSInterpreter.deinitialize();
    this.JSInterpreter = null;
  }
  this.executionError = null;

  // Stop the looping sound.
  this.studioApp_.stopLoopingAudio('start');

  this.resetStepInfo_();
};


/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
Artist.prototype.display = function() {
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

  // Draw the answer layer.
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    this.ctxDisplay.globalAlpha = 0.4;
  } else {
    this.ctxDisplay.globalAlpha = 0.15;
  }
  this.ctxDisplay.drawImage(this.ctxAnswer.canvas, 0, 0);
  this.ctxDisplay.globalAlpha = 1;

  // Draw the predraw layer.
  this.ctxDisplay.globalCompositeOperation = 'source-over';
  this.ctxDisplay.drawImage(this.ctxPredraw.canvas, 0, 0);

  // Draw the pattern layer.
  this.ctxDisplay.globalCompositeOperation = 'source-over';
  this.ctxDisplay.drawImage(this.ctxPattern.canvas, 0, 0);

  // Draw the user layer.
  this.ctxDisplay.globalCompositeOperation = 'source-over';
  this.ctxDisplay.drawImage(this.ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (this.visible) {
    this.drawDecorationAnimation("before");
    this.drawTurtle();
    this.drawDecorationAnimation("after");
  }
};

/**
 * Click the run button.  Start the program.
 */
Artist.prototype.runButtonClick = function () {
  this.studioApp_.toggleRunReset('reset');
  document.getElementById('spinner').style.visibility = 'visible';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  this.studioApp_.attempts++;
  this.execute();
};

Artist.prototype.evalCode = function(code) {
  try {
    codegen.evalWith(code, {
      Turtle: this.api
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
 * Set up the JSInterpreter and consoleLogger for editCode levels
 */
Artist.prototype.initInterpreter = function () {
  if (!this.level.editCode) {
    return;
  }
  this.JSInterpreter = new JSInterpreter({
    studioApp: this.studioApp_,
    shouldRunAtMaxSpeed: function () { return false; }
  });
  this.JSInterpreter.onExecutionError.register(this.handleExecutionError.bind(this));
  this.consoleLogger_.attachTo(this.JSInterpreter);
  this.JSInterpreter.parse({
    code: this.studioApp_.getCode(),
    blocks: dropletConfig.blocks,
    blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions
  });
};

/**
 * Handle an execution error from the interpreter
 */
Artist.prototype.handleExecutionError = function (err, lineNumber) {
  this.consoleLogger_.log(err);

  this.executionError = { err: err, lineNumber: lineNumber };

  if (err instanceof SyntaxError) {
    this.testResults = this.studioApp_.TestResults.SYNTAX_ERROR_FAIL;
  }

  this.finishExecution_();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Artist.prototype.execute = function() {
  this.api.log = [];

  // Reset the graphic.
  this.studioApp_.reset();

  if (this.studioApp_.hasExtraTopBlocks() ||
      this.studioApp_.hasDuplicateVariablesInForLoops()) {
    // immediately check answer, which will fail and report top level blocks
    this.checkAnswer();
    return;
  }

  if (this.level.editCode) {
    this.initInterpreter();
  } else {
    this.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    this.evalCode(this.code);
  }

  // api.log now contains a transcript of all the user's actions.
  this.studioApp_.playAudio('start', {loop : true});
  // animate the transcript.

  this.pid = window.setTimeout(_.bind(this.animate, this), 100);

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }
};

/**
 * Special case: if we have a turn, followed by a move forward, then we can just
 * do the turn instantly and then begin the move forward in the same frame.
 */
Artist.prototype.checkforTurnAndMove_ = function () {
  var nextIsForward = false;

  var currentTuple = this.api.log[0];
  var currentCommand = currentTuple[0];
  var currentValues = currentTuple.slice(1);

  // Check first for a small turn movement.
  if (currentCommand === 'RT') {
    var currentAngle = currentValues[0];
    if (Math.abs(currentAngle) <= 10) {
      // Check that next command is a move forward.
      if (this.api.log.length > 1) {
        var nextTuple = this.api.log[1];
        var nextCommand = nextTuple[0];
        if (nextCommand === 'FD') {
          nextIsForward = true;
        }
      }
    }
  }

  return nextIsForward;
};


/**
 * Attempt to execute one command from the log of API commands.
 */
Artist.prototype.executeTuple_ = function () {
  if (this.api.log.length === 0) {
    return false;
  }

  var executeSecondTuple;

  do {
    // Unless something special happens, we will just execute a single tuple.
    executeSecondTuple = false;

    var tuple = this.api.log[0];
    var command = tuple[0];
    var id = tuple[tuple.length-1];

    this.studioApp_.highlight(String(id));

    // Should we execute another tuple in this frame of animation?
    if (this.skin.consolidateTurnAndMove && this.checkforTurnAndMove_()) {
      executeSecondTuple = true;
    }

    // We only smooth animate for Anna & Elsa, and only if there is not another tuple to be done.
    var tupleDone = this.step(command, tuple.slice(1), {smoothAnimate: this.skin.smoothAnimate && !executeSecondTuple});
    this.display();

    if (tupleDone) {
      this.api.log.shift();
      this.resetStepInfo_();
    }
  } while (executeSecondTuple);

  return true;
};

/**
 * Handle the tasks to be done after the user program is finished.
 */
Artist.prototype.finishExecution_ = function () {
  document.getElementById('spinner').style.visibility = 'hidden';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.highlightBlock(null);
  }
  this.checkAnswer();
};

/**
 * Iterate through the recorded path and animate the turtle's actions.
 */
Artist.prototype.animate = function() {

  // All tasks should be complete now.  Clean up the PID list.
  this.pid = 0;

  // Scale the speed non-linearly, to give better precision at the fast end.
  var stepSpeed = 1000 * Math.pow(1 - this.speedSlider.getValue(), 2) / this.skin.speedModifier;

  // when smoothAnimate is true, we divide long steps into partitions of this
  // size.
  this.smoothAnimateStepSize = (stepSpeed === 0 ?
    FAST_SMOOTH_ANIMATE_STEP_SIZE : SMOOTH_ANIMATE_STEP_SIZE);

  if (this.level.editCode &&
      this.JSInterpreter &&
      this.JSInterpreter.initialized()) {

    var programDone = false;
    var completedTuple = false;

    do {
      programDone = this.JSInterpreter.isProgramDone();

      if (!programDone) {
        this.JSInterpreter.executeInterpreter();

        completedTuple = this.executeTuple_();
      }
    } while (!programDone && !completedTuple);

    if (!completedTuple) {
      completedTuple = this.executeTuple_();
    }
    if (programDone && !completedTuple) {
      // All done:
      this.finishExecution_();
      return;
    }
  } else {
    if (!this.executeTuple_()) {
      this.finishExecution_();
      return;
    }
  }

  this.pid = window.setTimeout(_.bind(this.animate, this), stepSpeed);
};

Artist.prototype.calculateSmoothAnimate = function(options, distance) {
  var tupleDone = true;
  var stepDistanceCovered = this.stepDistanceCovered;

  if (options && options.smoothAnimate) {
    var fullDistance = distance;
    var smoothAnimateStepSize = this.smoothAnimateStepSize;

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

  this.stepDistanceCovered = stepDistanceCovered;

  return { tupleDone: tupleDone, distance: distance };
};

/**
 * Execute one step.
 * @param {string} command Logo-style command (e.g. 'FD' or 'RT').
 * @param {!Array} values List of arguments for the command.
 * @param {number} fraction How much of this step's distance do we draw?
 * @param {object} single option for now: smoothAnimate (true/false)
 */
Artist.prototype.step = function(command, values, options) {
  var tupleDone = true;
  var result;
  var distance;
  var heading;

  switch (command) {
    case 'FD':  // Forward
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.moveForward_(result.distance);
      break;
    case 'JF':  // Jump forward
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.jumpForward_(result.distance);
      break;
    case 'MV':  // Move (direction)
      distance = values[0];
      heading = values[1];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.setHeading_(heading);
      this.moveForward_(result.distance);
      break;
    case 'JD':  // Jump (direction)
      distance = values[0];
      heading = values[1];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.setHeading_(heading);
      this.jumpForward_(result.distance);
      break;
    case 'RT':  // Right Turn
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.turnByDegrees_(result.distance);
      break;
    case 'DP':  // Draw Print
      this.ctxScratch.save();
      this.ctxScratch.translate(this.x, this.y);
      this.ctxScratch.rotate(utils.degreesToRadians(this.heading - 90));
      this.ctxScratch.fillText(values[0], 0, 0);
      this.ctxScratch.restore();
      break;
    case 'GA':  // Global Alpha
      var alpha = values[0];
      alpha = Math.max(0, alpha);
      alpha = Math.min(100, alpha);
      this.ctxScratch.globalAlpha = alpha / 100;
      break;
    case 'DF':  // Draw Font
      this.ctxScratch.font = values[2] + ' ' + values[1] + 'pt ' + values[0];
      break;
    case 'PU':  // Pen Up
      this.penDownValue = false;
      break;
    case 'PD':  // Pen Down
      this.penDownValue = true;
      break;
    case 'PW':  // Pen Width
      this.ctxScratch.lineWidth = values[0];
      break;
    case 'PC':  // Pen Colour
      this.ctxScratch.strokeStyle = values[0];
      this.ctxScratch.fillStyle = values[0];
      if (this.skin.id != "anna" && this.skin.id != "elsa") {
        this.isDrawingWithPattern = false;
      }
      break;
    case 'PS':  // Pen style with image
      if (!values[0] || values[0] == 'DEFAULT') {
          this.setPattern(null);
      } else {
        this.setPattern(values[0]);
      }
      break;
    case 'HT':  // Hide Turtle
      this.visible = false;
      break;
    case 'ST':  // Show Turtle
      this.visible = true;
      break;
    case 'sticker':
      var img = this.stickers[values[0]];

      var dimensions = scaleToBoundingBox(MAX_STICKER_SIZE, img.width, img.height);
      var width = dimensions.width;
      var height = dimensions.height;

      // Rotate the image such the the turtle is at the center of the bottom of
      // the image and the image is pointing (from bottom to top) in the same
      // direction as the turtle.
      this.ctxScratch.save();
      this.ctxScratch.translate(this.x, this.y);
      this.ctxScratch.rotate(utils.degreesToRadians(this.heading));
      this.ctxScratch.drawImage(img, -width / 2, -height, width, height);
      this.ctxScratch.restore();

      break;
  }

  return tupleDone;
};

/**
 * Given the width and height of a rectangle this scales the dimensions
 * proportionally such that neither is larger than a given maximum size.
 *
 * @param maxSize - The maximum size of either dimension
 * @param width - The current width of a rectangle
 * @param height - The current height of a rectangle
 * @return an object containing the scaled width and height.
 */
function scaleToBoundingBox(maxSize, width, height) {
  if (width < maxSize && height < maxSize) {
    return {width: width, height: height};
  }

  var newWidth;
  var newHeight;

  if (width > height) {
    newWidth = maxSize;
    newHeight = height * (maxSize / width);
  } else {
    newHeight = maxSize;
    newWidth = width * (maxSize / height);
  }

  return {width: newWidth, height: newHeight};
}

Artist.prototype.setPattern = function (pattern) {
  if (this.loadedPathPatterns[pattern]) {
    this.currentPathPattern = this.loadedPathPatterns[pattern];
    this.isDrawingWithPattern = true;
  } else if (pattern === null) {
    this.currentPathPattern = new Image();
    this.isDrawingWithPattern = false;
  }
};

Artist.prototype.jumpForward_ = function (distance) {
  this.x += distance * Math.sin(utils.degreesToRadians(this.heading));
  this.y -= distance * Math.cos(utils.degreesToRadians(this.heading));
};

Artist.prototype.moveByRelativePosition_ = function (x, y) {
  this.x += x;
  this.y += y;
};

Artist.prototype.dotAt_ = function (x, y) {
  // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
  var dotLineLength = 0.1;
  this.ctxScratch.lineTo(x + dotLineLength, y);
};

Artist.prototype.circleAt_ = function (x, y, radius) {
  this.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
};

Artist.prototype.drawToTurtle_ = function (distance) {
  var isDot = (distance === 0);
  if (isDot) {
    this.dotAt_(this.x, this.y);
  } else {
    this.ctxScratch.lineTo(this.x, this.y);
  }
};

Artist.prototype.turnByDegrees_ = function (degreesRight) {
  this.setHeading_(this.heading + degreesRight);
};

Artist.prototype.setHeading_ = function (heading) {
  heading = this.constrainDegrees_(heading);
  this.heading = heading;
};

Artist.prototype.constrainDegrees_ = function (degrees) {
  degrees %= 360;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
};

Artist.prototype.moveForward_ = function (distance) {
  if (!this.penDownValue) {
    this.jumpForward_(distance);
    return;
  }
  if (this.isDrawingWithPattern) {
    this.drawForwardLineWithPattern_(distance);

    // Frozen gets both a pattern and a line over the top of it.
    if (this.skin.id != "elsa" && this.skin.id != "anna") {
      return;
    }
  }

  this.drawForward_(distance);
};

Artist.prototype.drawForward_ = function (distance) {
  if (this.shouldDrawJoints_()) {
    this.drawForwardWithJoints_(distance);
  } else {
    this.drawForwardLine_(distance);
  }
};

/**
 * Draws a line of length `distance`, adding joint knobs along the way
 * @param distance
 */
Artist.prototype.drawForwardWithJoints_ = function (distance) {
  var remainingDistance = distance;

  while (remainingDistance > 0) {
    var enoughForFullSegment = remainingDistance >= JOINT_SEGMENT_LENGTH;
    var currentSegmentLength = enoughForFullSegment ? JOINT_SEGMENT_LENGTH : remainingDistance;

    remainingDistance -= currentSegmentLength;

    if (enoughForFullSegment) {
      this.drawJointAtTurtle_();
    }

    this.drawForwardLine_(currentSegmentLength);

    if (enoughForFullSegment) {
      this.drawJointAtTurtle_();
    }
  }
};

Artist.prototype.drawForwardLine_ = function (distance) {

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    this.ctxScratch.beginPath();
    this.ctxScratch.moveTo(this.stepStartX, this.stepStartY);
    this.jumpForward_(distance);
    this.drawToTurtle_(distance);
    this.ctxScratch.stroke();
  } else {
    this.ctxScratch.beginPath();
    this.ctxScratch.moveTo(this.x, this.y);
    this.jumpForward_(distance);
    this.drawToTurtle_(distance);
    this.ctxScratch.stroke();
  }

};

Artist.prototype.drawForwardLineWithPattern_ = function (distance) {
  var img;
  var startX;
  var startY;

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
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
    if (img.width !== 0) {
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

    this.jumpForward_(distance);
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
        distance+img.height / 2, img.height,
        // draw location relative to the ctx.translate point pre-rotation
        -img.height / 4, -img.height / 2,
        distance+img.height / 2, img.height);
    }

    this.ctxScratch.restore();
  }
};

Artist.prototype.shouldDrawJoints_ = function () {
  return this.level.isK1 && !this.isPredrawing_;
};

Artist.prototype.drawJointAtTurtle_ = function () {
  this.ctxScratch.beginPath();
  this.ctxScratch.moveTo(this.x, this.y);
  this.circleAt_(this.x, this.y, JOINT_RADIUS);
  this.ctxScratch.stroke();
};

/**
 * Validate whether the user's answer is correct.
 * @param {number} pixelErrors Number of pixels that are wrong.
 * @param {number} permittedErrors Number of pixels allowed to be wrong.
 * @return {boolean} True if the level is solved, false otherwise.
 */
Artist.prototype.isCorrect_ = function (pixelErrors, permittedErrors) {
  return pixelErrors <= permittedErrors;
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
Artist.prototype.displayFeedback_ = function() {
  var feedbackImageCanvas;
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    // For frozen skins, show background and characters along with drawing
    feedbackImageCanvas = this.ctxDisplay;
  } else {
    feedbackImageCanvas = this.ctxScratch;
  }

  var level = this.level;

  this.studioApp_.displayFeedback({
    app: 'turtle',
    skin: this.skin.id,
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay || level.impressive),
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && this.response && this.response.save_to_gallery_url,
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
Artist.prototype.onReportComplete = function(response) {
  this.response = response;
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  this.studioApp_.onReportComplete(response);
  this.displayFeedback_();
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
Artist.prototype.checkAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var userImage =
      this.ctxScratch.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var answerImage =
      this.ctxAnswer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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

  var level = this.level;

  // Optionally allow some number of pixels to be off, default to
  // pixel-perfect strictness
  var permittedErrors = level.permittedErrors || 0;

  // Test whether the current level is a free play level, or the level has
  // been completed
  var levelComplete = (level.freePlay || this.isCorrect_(delta, permittedErrors)) &&
                        (!level.editCode || !this.executionError);
  this.testResults = this.studioApp_.getTestResults(levelComplete);

  var program;
  if (this.studioApp_.isUsingBlockly()) {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  // Make sure we don't reuse an old message, since not all paths set one.
  this.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !levelComplete && !this.studioApp_.editCode &&
      level.solutionBlocks &&
      removeK1Lengths(program) === removeK1Lengths(level.solutionBlocks)) {
    this.testResults = this.studioApp_.TestResults.APP_SPECIFIC_ERROR;
    this.message = turtleMsg.lengthFeedback();
  }

  // For levels where using too many blocks would allow students
  // to miss the point, convert that feedback to a failure.
  if (level.failForTooManyBlocks &&
      this.testResults == this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL) {
    this.testResults = this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL;

  } else if ((this.testResults ==
      this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL) ||
      (this.testResults == this.studioApp_.TestResults.ALL_PASS)) {
    // Check that they didn't use a crazy large repeat value when drawing a
    // circle.  This complains if the limit doesn't start with 3.
    // Note that this level does not use colour, so no need to check for that.
    if (level.failForCircleRepeatValue && this.studioApp_.isUsingBlockly()) {
      var code = Blockly.Generator.blockSpaceToCode('JavaScript');
      if (code.indexOf('count < 3') == -1) {
        this.testResults =
            this.studioApp_.TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        this.message = commonMsg.tooMuchWork();
      }
    }
  }

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = this.studioApp_.editor.getValue();
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    this.testResults = this.studioApp_.TestResults.FREE_PLAY;
  }

  // Play sound
  this.studioApp_.stopLoopingAudio('start');
  if (this.testResults === this.studioApp_.TestResults.FREE_PLAY ||
      this.testResults >= this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL) {
    this.studioApp_.playAudio('win');
  } else {
    this.studioApp_.playAudio('failure');
  }

  var reportData = {
    app: 'turtle',
    level: level.id,
    builder: level.builder,
    result: levelComplete,
    testResult: this.testResults,
    program: encodeURIComponent(program),
    onComplete: _.bind(this.onReportComplete, this),
    save_to_gallery: level.impressive
  };

  // https://www.pivotaltracker.com/story/show/84171560
  // Never send up frozen images for now.
  var isFrozen = (this.skin.id === 'anna' || this.skin.id === 'elsa');

  // Get the canvas data for feedback.
  if (this.testResults >= this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL &&
    !isFrozen && (level.freePlay || level.impressive)) {
    reportData.image = this.getFeedbackImage_();
  }

  this.studioApp_.report(reportData);

  if (this.studioApp_.isUsingBlockly()) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

  // The call to displayFeedback() will happen later in onReportComplete()
};

Artist.prototype.getFeedbackImage_ = function() {
  var feedbackImageCanvas;
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    feedbackImageCanvas = this.ctxDisplay;
  } else {
    feedbackImageCanvas = this.ctxScratch;
  }

  // Copy the user layer
  this.ctxFeedback.globalCompositeOperation = 'copy';
  this.ctxFeedback.drawImage(feedbackImageCanvas.canvas, 0, 0, 154, 154);
  var feedbackCanvas = this.ctxFeedback.canvas;
  return encodeURIComponent(
      feedbackCanvas.toDataURL("image/png").split(',')[1]);
};

// Helper for creating canvas elements.
Artist.prototype.createCanvas_ = function (id, width, height) {
  var el = document.createElement('canvas');
  el.id = id;
  el.width = width;
  el.height = height;
  return el;
};

/**
* When smooth animate is true, steps can be broken up into multiple animations.
* At the end of each step, we want to reset any incremental information, which
* is what this does.
*/
Artist.prototype.resetStepInfo_ = function () {
  this.stepStartX = this.x;
  this.stepStartY = this.y;
  this.stepDistanceCovered = 0;
};
