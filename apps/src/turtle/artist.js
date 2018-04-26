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

var React = require('react');
var ReactDOM = require('react-dom');
var color = require("../util/color");
var commonMsg = require('@cdo/locale');
var turtleMsg = require('./locale');
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
var ArtistAPI = require('./api');
var apiJavascript = require('./apiJavascript');
var Provider = require('react-redux').Provider;
import AppView from '../templates/AppView';
var ArtistVisualizationColumn = require('./ArtistVisualizationColumn');
var utils = require('../utils');
var Slider = require('../slider');
var _ = require('lodash');
var dropletConfig = require('./dropletConfig');
var JSInterpreter = require('../lib/tools/jsinterpreter/JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '../containedLevels';
import {getStore} from '../redux';
import {TestResults} from '../constants';
import {captureThumbnailFromCanvas} from '../util/thumbnail';
import {blockAsXmlNode, cleanBlocks} from '../block_utils';
import ArtistSkins from './skins';
import dom from '../dom';
import {SignInState} from '../code-studio/progressRedux';
import Visualization from './turtle.js';

const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 400;

const DEFAULT_X = CANVAS_WIDTH / 2;
const DEFAULT_Y = CANVAS_HEIGHT / 2;
const DEFAULT_DIRECTION = 90;

const MAX_STICKER_SIZE = 100;

const SMOOTH_ANIMATE_STEP_SIZE = 5;
const FAST_SMOOTH_ANIMATE_STEP_SIZE = 15;

const REMIX_PROPS = [
  {
    defaultValues: {
      initialX: DEFAULT_X,
      initialY: DEFAULT_Y,
    },
    generateBlock: args => blockAsXmlNode('jump_to_xy', {
      titles: {
        'XPOS': args.initialX,
        'YPOS': args.initialY,
      }
    }),
  }, {
    defaultValues: {
      startDirection: DEFAULT_DIRECTION
    },
    generateBlock: args => blockAsXmlNode('draw_turn', {
      titles: {
        'DIR': 'turnRight',
      },
      values: {
        'VALUE': {
          type: 'math_number',
          titleName: 'NUM',
          titleValue: args.startDirection - DEFAULT_DIRECTION,
        },
      },
    }),
  },
];

const FROZEN_REMIX_PROPS = [
  {
    defaultValues: {
      initialX: DEFAULT_X,
      initialY: DEFAULT_Y,
    },
    generateBlock: args => blockAsXmlNode('jump_to_xy', {
      titles: {
        'XPOS': args.initialX,
        'YPOS': args.initialY,
      }
    }),
  }, {
    defaultValues: {
      startDirection: 180
    },
    generateBlock: args => blockAsXmlNode('draw_turn', {
      titles: {
        'DIR': 'turnRight',
      },
      values: {
        'VALUE': {
          type: 'math_number',
          titleName: 'NUM',
          titleValue: args.startDirection - 180,
        },
      },
    }),
  }, {
    defaultValues: {
      skin: "elsa",
    },
    generateBlock: args => blockAsXmlNode('turtle_setArtist', {
      titles: {
        'VALUE': args.skin
      },
    }),
  }
];

const REMIX_PROPS_BY_SKIN = {
  artist: REMIX_PROPS,
  anna: FROZEN_REMIX_PROPS,
  elsa: FROZEN_REMIX_PROPS,
};

const PUBLISHABLE_SKINS = ['artist', 'artist_zombie', 'anna', 'elsa'];

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

  // The avatar animation decoration image
  this.decorationAnimationImage = new Image();

  // Drawing with a pattern
  this.loadedPathPatterns = [];
  this.linePatterns = [];

  // these get set by init based on skin.
  this.speedSlider = null;
};

module.exports = Artist;
module.exports.Visualization = Visualization;


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
 * Initializes all sticker images as defined in this.skin.stickers, if any,
 * storing the created images in this.stickers.
 *
 * NOTE: initializes this.stickers as a side effect
 *
 * @return {Promise} that resolves once all images have finished loading,
 *         whether they did so successfully or not (or that resolves instantly
 *         if there are no images to load).
 */
Artist.prototype.preloadAllStickerImages = function () {
  this.stickers = {};

  const loadSticker = name => new Promise(resolve => {
    const img = new Image();

    img.onload = () => resolve();
    img.onerror = () => resolve();

    img.src = this.skin.stickers[name];
    this.stickers[name] = img;
  });

  const stickers = (this.skin && this.skin.stickers) || {};
  const stickerNames = Object.keys(stickers);

  if (stickerNames.length) {
    return Promise.all(stickerNames.map(loadSticker));
  } else {
    return Promise.resolve();
  }
};

/**
 * Initializes all pattern images as defined in
 * this.skin.lineStylePatternOptions, if any, storing the created images in
 * this.loadedPathPatterns.
 *
 * @return {Promise} that resolves once all images have finished loading,
 *         whether they did so successfully or not (or that resolves instantly
 *         if there are no images to load).
 */
Artist.prototype.preloadAllPatternImages = function () {
  const loadPattern = patternOption => new Promise(resolve => {
    const pattern = patternOption[1];

    if (this.linePatterns[pattern] && !this.loadedPathPatterns[pattern]) {
      const img = new Image();

      img.onload = () => resolve();
      img.onerror = () => resolve();

      img.src = this.linePatterns[pattern];
      this.loadedPathPatterns[pattern] = img;
    } else {
      resolve();
    }
  });

  const patternOptions = (this.skin && this.skin.lineStylePatternOptions);
  if (patternOptions.length) {
    return Promise.all(patternOptions.map(loadPattern));
  } else {
    return Promise.resolve();
  }
};

Artist.prototype.isFrozenSkin = function () {
  return this.skin.id === "anna" || this.skin.id === "elsa";
};

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Artist.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("Artist requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  if (this.isFrozenSkin()) {
    // let's try adding a background image
    this.level.images = [{}];
    this.level.images[0].filename = 'background.jpg';

    this.level.images[0].position = [0, 0];
    this.level.images[0].scale = 1;
  }

  this.linePatterns = config.skin.linePatterns;

  this.visualization = new Visualization({
    avatar: config.skin.avatarSettings,
    isK1: config.level.isK1,
    isFrozenSkin: this.isFrozenSkin(),
    decorationAnimationImage: this.decorationAnimationImage,
    showDecoration: () => this.skin.id === "elsa",
  });

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';
  config.dropletConfig = dropletConfig;
  config.prepareForRemix = Artist.prototype.prepareForRemix.bind(this);

  config.loadAudio = _.bind(this.loadAudio_, this);
  config.afterInject = _.bind(this.afterInject_, this, config);

  if (
    config.embed &&
    config.level.markdownInstructions &&
    !config.level.instructions
  ) {
    // if we are an embedded level with markdown instructions but no regular
    // instructions, we want to display CSP-style instructions and not be
    // centered
    config.noInstructionsWhenCollapsed = true;
    config.centerEmbedded = false;
  }

  // Push initial level properties into the Redux store
  const appSpecificConstants = {};
  if (config.skin.avatarAllowedScripts &&
      !config.skin.avatarAllowedScripts.includes(config.scriptName)) {
    appSpecificConstants.smallStaticAvatar = config.skin.blankAvatar;
    appSpecificConstants.failureAvatar = config.skin.blankAvatar;
  }
  this.studioApp_.setPageConstants(config, appSpecificConstants);

  var iconPath = '/blockly/media/turtle/' +
    (config.isLegacyShare && config.hideSource ? 'icons_white.png' : 'icons.png');
  var visualizationColumn = (
    <ArtistVisualizationColumn
      showFinishButton={!!config.level.freePlay && !config.level.isProjectLevel}
      iconPath={iconPath}
    />
  );

  function onMount() {
    this.studioApp_.init(config);
    const finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, this.checkAnswer.bind(this));
    }
  }

  return Promise.all([
    this.preloadAllStickerImages(),
    this.preloadAllPatternImages()
  ]).then(() => {
    ReactDOM.render(
      <Provider store={getStore()}>
        <AppView
          visualizationColumn={visualizationColumn}
          onMount={onMount.bind(this)}
        />
      </Provider>,
      document.getElementById(config.containerId)
    );
  });
};

/**
 * Add blocks that mimic level properties that are set on the current level
 * but not set by default, in this case the artist's starting position and
 * orientation.
 */
Artist.prototype.prepareForRemix = function () {
  const blocksDom = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  const blocksDocument = blocksDom.ownerDocument;
  const remix_props = REMIX_PROPS_BY_SKIN[this.skin.id] || REMIX_PROPS;
  let next = false;
  if (remix_props.every(group => Object.keys(group.defaultValues).every(prop =>
        this.level[prop] === undefined ||
            this.level[prop] === group.defaultValues[prop]))) {
    // If all of the level props we need to worry about are undefined or equal
    // to the default value, we don't need to insert any new blocks.
    return Promise.resolve();
  }

  let whenRun = blocksDom.querySelector('block[type="when_run"]');
  if (!whenRun) {
    whenRun = blocksDocument.createElement('block');
    whenRun.setAttribute('type', 'when_run');
    blocksDom.appendChild(whenRun);
  }
  next = whenRun.querySelector('next');
  if (next) {
    whenRun.removeChild(next);
  }

  const insertBeforeNext = block => {
    if (next) {
      block.appendChild(next);
    }
    next = blocksDocument.createElement('next');
    next.appendChild(block);
  };

  for (let group of remix_props) {
    let customized = false;
    for (let prop in group.defaultValues) {
      const value = this.level[prop];
      if (value !== undefined && value !== group.defaultValues[prop]) {
        customized = true;
        break;
      }
    }
    if (!customized) {
      continue;
    }
    const blockArgs = {};
    for (let prop in group.defaultValues) {
      blockArgs[prop] = this.level[prop] !== undefined ?
          this.level[prop] :
          group.defaultValues[prop];
    }
    insertBeforeNext(group.generateBlock(blockArgs));
  }

  whenRun.appendChild(next);

  cleanBlocks(blocksDom);

  Blockly.mainBlockSpace.clear();
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, blocksDom);
  return Promise.resolve();
};

Artist.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * We only attempt normalization for blockly levels, for two reasons;
 *
 * First, the blocks that we normalize (sticker and pattern) only exist in
 * blockly land.
 *
 * Second, the way we retrieve the user code in droplet does not use
 * this.api.log, so we'd have to make an alternate pathway for that use
 * case.
 *
 * @return {boolean}
 */
Artist.prototype.shouldSupportNormalization = function () {
  return this.studioApp_.isUsingBlockly();
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

  // Do not animate drawing, used for tests
  if (config.level.instant) {
    this.instant_ = true;
  }

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('Turtle,code');
  }

  var visualization = document.getElementById('visualization');
  visualization.appendChild(this.visualization.displayCanvas);

  if (this.studioApp_.isUsingBlockly() && this.isFrozenSkin()) {
    // Override colour_random to only generate random colors from within our frozen
    // palette
    Blockly.JavaScript.colour_random = function () {
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
  this.loadTurtle(true /* initializing */);
  this.drawImages();

  // Draw the answer twice; once to the display canvas and once again in a
  // normalized version to the validation canvas
  this.drawAnswer(this.visualization.ctxAnswer);
  this.visualization.shouldDrawNormalized_ = true;
  this.drawAnswer(this.visualization.ctxNormalizedAnswer);
  this.visualization.shouldDrawNormalized_ = false;

  if (this.level.predrawBlocks) {
    this.visualization.isPredrawing_ = true;
    this.drawBlocksOnCanvas(this.level.predrawBlocks, this.visualization.ctxPredraw);
    this.visualization.isPredrawing_ = false;
  }

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = '400px';
};

/**
 * On startup draw the expected answer and save it to the given canvas.
 */
Artist.prototype.drawAnswer = function (canvas) {
  if (this.level.solutionBlocks) {
    this.drawBlocksOnCanvas(this.level.solutionBlocks, canvas);
  } else {
    this.drawLogOnCanvas(this.level.answer.slice(), canvas);
  }
};

/**
 * Given a set of commands and a canvas, draws the commands onto the canvas
 * composited over the scratch canvas.
 */
Artist.prototype.drawLogOnCanvas = function (log, canvas) {
  this.studioApp_.reset();
  while (log.length) {
    var tuple = log.shift();
    this.step(tuple[0], tuple.slice(1), {smoothAnimate: false});
    this.resetStepInfo_();
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(this.visualization.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

/**
 * Evaluates blocks or code, and draws onto given canvas.
 */
Artist.prototype.drawBlocksOnCanvas = function (blocksOrCode, canvas) {
  var code;
  if (this.studioApp_.isUsingBlockly()) {
    var domBlocks = Blockly.Xml.textToDom(blocksOrCode);
    code = Blockly.Generator.xmlToCode('JavaScript', domBlocks);
  } else {
    code = blocksOrCode;
  }
  this.evalCode(code);
  this.drawCurrentBlocksOnCanvas(canvas);
};

/**
 * Draws the results of block evaluation (stored on api.log) onto the given
 * canvas.
 */
Artist.prototype.drawCurrentBlocksOnCanvas = function (canvas) {
  this.drawLogOnCanvas(this.api.log, canvas);
};

/**
 * Place an image at the specified coordinates.
 * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
 * @param {string} filename Relative path to image.
 * @param {!Array} position An x-y pair.
 * @param {number} optional scale at which image is drawn
 */
Artist.prototype.placeImage = function (filename, position, scale) {
  var img = new Image();
  img.onload = _.bind(function () {
    if (img.width !== 0) {
      if (scale) {
        this.visualization.ctxImages.drawImage(img, position[0], position[1], img.width,
          img.height, 0, 0, img.width * scale, img.height * scale);
      } else  {
        this.visualization.ctxImages.drawImage(img, position[0], position[1]);
      }
    }
    this.visualization.display();
  }, this);

  if (this.isFrozenSkin()) {
    img.src = this.skin.assetUrl(filename);
  } else {
    // This is necessary when loading images from image.code.org to
    // request the image with ACAO headers so that canvas will not flag
    // it as tainted
    img.crossOrigin = "anonymous";
    img.src = filename.startsWith('http') ?
        filename :
        this.studioApp_.assetUrl('media/turtle/' + filename);
  }
};

/**
 * Draw the images for this page and level onto this.visualization.ctxImages.
 */
Artist.prototype.drawImages = function () {
  if (!this.level.images) {
    return;
  }
  for (var i = 0; i < this.level.images.length; i++) {
    var image = this.level.images[i];
    this.placeImage(image.filename, image.position, image.scale);
  }
  this.visualization.ctxImages.globalCompositeOperation = 'copy';
  this.visualization.ctxImages.drawImage(this.visualization.ctxScratch.canvas, 0, 0);
  this.visualization.ctxImages.globalCompositeOperation = 'source-over';
};

/**
 * Initialize the turtle image on load.
 */
Artist.prototype.loadTurtle = function (initializing = true) {
  const onloadCallback = initializing ? () => this.visualization.display() : () => this.visualization.drawTurtle();
  this.visualization.avatar.image = new Image();
  this.visualization.avatar.image.onload = _.bind(onloadCallback, this);

  this.visualization.avatar.image.src = this.skin.avatar;
};

/**
 * Initial the turtle animation deocration on load.
 */
Artist.prototype.loadDecorationAnimation = function () {
  if (this.skin.id === "elsa") {
    this.decorationAnimationImage.src = this.skin.decorationAnimation;
  }
};

/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
Artist.prototype.reset = function (ignore) {
  this.visualization.reset(this.level.startDirection, this.level.initialX, this.level.initialY);

  this.selectPattern();

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

Artist.prototype.evalCode = function (code) {
  try {
    CustomMarshalingInterpreter.evalWith(code, {
      Turtle: this.api
    });
  } catch (e) {
    // Infinity is thrown if we detect an infinite loop. In that case we'll
    // stop further execution, animate what occurred before the infinite loop,
    // and analyze success/failure based on what was drawn.
    // Otherwise, abnormal termination is a user error.
    if (e !== 'Infinity') {
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
Artist.prototype.handleExecutionError = function (err, lineNumber, outputString) {
  this.consoleLogger_.log(outputString);

  this.executionError = { err: err, lineNumber: lineNumber };

  if (err instanceof SyntaxError) {
    this.testResults = TestResults.SYNTAX_ERROR_FAIL;
  }

  this.finishExecution_();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Artist.prototype.execute = function () {
  this.api.log = [];

  // Reset the graphic.
  this.studioApp_.reset();

  if (this.studioApp_.hasUnwantedExtraTopBlocks() ||
      this.studioApp_.hasDuplicateVariablesInForLoops()) {
    // immediately check answer, which will fail and report top level blocks
    this.checkAnswer();
    return;
  }

  if (this.level.editCode) {
    this.initInterpreter();
  } else {
    let codeBlocks = Blockly.mainBlockSpace.getTopBlocks(true);
    if (this.studioApp_.initializationBlocks) {
      codeBlocks = this.studioApp_.initializationBlocks.concat(codeBlocks);
    }

    this.code = Blockly.Generator.blocksToCode('JavaScript', codeBlocks);
    this.evalCode(this.code);
  }

  // api.log now contains a transcript of all the user's actions.

  // If this is a free play level, save the code every time the run button is
  // clicked rather than only on finish
  if (this.level.freePlay) {
    this.levelComplete = true;
    this.testResults = TestResults.FREE_PLAY;
    this.report(false);
  }

  if (this.shouldSupportNormalization()) {
    // First, draw a normalized version of the user's actions (ie, one which
    // doesn't vary patterns or stickers) to a dedicated context. Note that we
    // clone this.api.log so the real log doesn't get mutated
    this.visualization.shouldDrawNormalized_ = true;
    this.drawLogOnCanvas(this.api.log.slice(), this.visualization.ctxNormalizedScratch);
    this.visualization.shouldDrawNormalized_ = false;

    // Then, reset our state and draw the user's actions in a visible, animated
    // way
    this.studioApp_.reset();
  }

  this.studioApp_.playAudio('start', {loop : true});

  // animate the transcript.

  if (this.instant_) {
    while (this.animate()) {}
  } else {
    this.pid = window.setTimeout(_.bind(this.animate, this), 100);
  }

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
    this.visualization.display();

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
  this.studioApp_.stopLoopingAudio('start');

  document.getElementById('spinner').style.visibility = 'hidden';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.highlightBlock(null);
  }

  captureThumbnailFromCanvas(this.getThumbnailCanvas_());

  if (this.level.freePlay) {
    window.dispatchEvent(new Event('artistDrawingComplete'));
  } else {
    this.checkAnswer();
  }
};

/**
 * Iterate through the recorded path and animate the turtle's actions.
 * @return boolean true if there is more to animate, false if finished
 */
Artist.prototype.animate = function () {

  // All tasks should be complete now.  Clean up the PID list.
  this.pid = 0;

  // Scale the speed non-linearly, to give better precision at the fast end.
  var stepSpeed = 1000 * Math.pow(1 - this.speedSlider.getValue(), 2) / this.skin.speedModifier;

  // when smoothAnimate is true, we divide long steps into partitions of this
  // size.
  this.visualization.smoothAnimateStepSize = (stepSpeed === 0 ?
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
      return false;
    }
  } else {
    if (!this.executeTuple_()) {
      this.finishExecution_();
      return false;
    }
  }

  if (!this.instant_) {
    this.pid = window.setTimeout(_.bind(this.animate, this), stepSpeed);
  }
  return true;
};

Artist.prototype.calculateSmoothAnimate = function (options, distance) {
  var tupleDone = true;
  var stepDistanceCovered = this.visualization.stepDistanceCovered;

  if (options && options.smoothAnimate) {
    var fullDistance = distance;
    var smoothAnimateStepSize = this.visualization.smoothAnimateStepSize;

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
      // Going forward.
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

  this.visualization.stepDistanceCovered = stepDistanceCovered;

  return { tupleDone: tupleDone, distance: distance };
};

/**
 * Execute one step.
 * @param {string} command Logo-style command (e.g. 'FD' or 'RT').
 * @param {!Array} values List of arguments for the command.
 * @param {number} fraction How much of this step's distance do we draw?
 * @param {object} single option for now: smoothAnimate (true/false)
 */
Artist.prototype.step = function (command, values, options) {
  var tupleDone = true;
  var result;
  var distance;
  var heading;

  switch (command) {
    case 'FD':  // Forward
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.visualization.moveForward(result.distance);
      break;
    case 'JF':  // Jump forward
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.visualization.jumpForward(result.distance);
      break;
    case 'MV':  // Move (direction)
      distance = values[0];
      heading = values[1];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.visualization.setHeading(heading);
      this.visualization.moveForward(result.distance);
      break;
    case 'JT':  // Jump To Location
      if (Array.isArray(values[0])) {
        this.visualization.jumpTo(values[0]);
      } else {
        this.visualization.jumpTo([
          utils.xFromPosition(values[0], CANVAS_WIDTH),
          utils.yFromPosition(values[0], CANVAS_HEIGHT),
        ]);
      }
      break;
    case 'MD':  // Move diagonally (use longer steps if showing joints)
      distance = values[0];
      heading = values[1];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.visualization.setHeading(heading);
      this.visualization.moveForward(result.distance, true);
      break;
    case 'JD':  // Jump (direction)
      distance = values[0];
      heading = values[1];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.visualization.setHeading(heading);
      this.visualization.jumpForward(result.distance);
      break;
    case 'RT':  // Right Turn
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.visualization.turnByDegrees(result.distance);
      break;
    case 'PT': // Point To
      this.visualization.pointTo(values[0]);
      break;
    case 'GA':  // Global Alpha
      var alpha = values[0];
      alpha = Math.max(0, alpha);
      alpha = Math.min(100, alpha);
      this.visualization.ctxScratch.globalAlpha = alpha / 100;
      break;
    case 'PU':  // Pen Up
      this.visualization.penDownValue = false;
      break;
    case 'PD':  // Pen Down
      this.visualization.penDownValue = true;
      break;
    case 'PW':  // Pen Width
      this.visualization.ctxScratch.lineWidth = values[0];
      break;
    case 'PC':  // Pen Colour
      this.visualization.ctxScratch.strokeStyle = values[0];
      this.visualization.ctxScratch.fillStyle = values[0];
      if (!this.isFrozenSkin()) {
        this.visualization.isDrawingWithPattern = false;
      }
      break;
    case 'PS':  // Pen style with image
      if (!values[0] || values[0] === 'DEFAULT') {
          this.setPattern(null);
      } else {
        this.setPattern(values[0]);
      }
      break;
    case 'HT':  // Hide Turtle
      this.visualization.avatar.visible = false;
      break;
    case 'ST':  // Show Turtle
      this.visualization.avatar.visible = true;
      break;
    case 'sticker': {
      let size = MAX_STICKER_SIZE;

      if (typeof values[1] === 'number') {
        size = values[1];
      }

      if (this.visualization.shouldDrawNormalized_) {
        values = Object.keys(this.stickers);
      }

      var img = this.stickers[values[0]];

      var dimensions = scaleToBoundingBox(size, img.width, img.height);
      var width = dimensions.width;
      var height = dimensions.height;

      // Rotate the image such the the turtle is at the center of the bottom of
      // the image and the image is pointing (from bottom to top) in the same
      // direction as the turtle.
      this.visualization.ctxScratch.save();
      this.visualization.ctxScratch.translate(this.visualization.x, this.visualization.y);
      this.visualization.ctxScratch.rotate(this.visualization.degreesToRadians_(this.visualization.heading));
      this.visualization.ctxScratch.drawImage(img, 0, 0, img.width, img.height, -width / 2, -height, width, height);

      this.visualization.ctxScratch.restore();

      break;
    }
    case 'setArtist':
      if (this.skin.id !== values[0]) {
        this.skin = ArtistSkins.load(this.studioApp_.assetUrl, values[0]);
        this.visualization.avatar = this.skin.avatarSettings;
        this.linePatterns = this.skin.linePatterns;
        this.loadTurtle(false /* initializing */);
        this.preloadAllPatternImages().then(() => this.selectPattern());
      }
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

Artist.prototype.selectPattern = function () {
  if (this.skin.id === "anna") {
    this.setPattern("annaLine");
  } else if (this.skin.id === "elsa") {
    this.setPattern("elsaLine");
  } else {
    // Reset to empty pattern
    this.setPattern(null);
  }
};

Artist.prototype.setPattern = function (pattern) {
  if (this.visualization.shouldDrawNormalized_) {
    pattern = null;
  }

  if (this.loadedPathPatterns[pattern]) {
    this.visualization.currentPathPattern = this.loadedPathPatterns[pattern];
    this.visualization.isDrawingWithPattern = true;
  } else if (pattern === null) {
    this.visualization.currentPathPattern = new Image();
    this.visualization.isDrawingWithPattern = false;
  }
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
Artist.prototype.displayFeedback_ = function () {
  var level = this.level;
  // Don't save impressive levels as projects, because this would create too
  // many projects. Instead store them as /c/ links, which are much more
  // space-efficient since they store only one copy of identical projects made
  // by different users.
  const saveToProjectGallery = !level.impressive &&
    PUBLISHABLE_SKINS.includes(this.skin.id);
  const isSignedIn = getStore().getState().progress.signInState === SignInState.SignedIn;

  this.studioApp_.displayFeedback({
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    feedbackImage: this.getFeedbackImage_(180, 180),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay || level.impressive),
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToLegacyGalleryUrl: level.freePlay && this.response && this.response.save_to_gallery_url,
    // save to the project gallery instead of the legacy gallery
    saveToProjectGallery: saveToProjectGallery,
    disableSaveToGallery: !isSignedIn,
    appStrings: {
      reinfFeedbackMsg: turtleMsg.reinfFeedbackMsg(),
      sharingText: turtleMsg.shareDrawing()
    }
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {MilestoneResponse} response - JSON response (if available)
 */
Artist.prototype.onReportComplete = function (response) {
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
var removeK1Lengths = function (s) {
  return s.replace(removeK1Lengths.regex, '">');
};

removeK1Lengths.regex = /_length"><title name="length">.*?<\/title>/;

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
Artist.prototype.checkAnswer = function () {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.

  var userCanvas = this.shouldSupportNormalization() ?
      this.visualization.ctxNormalizedScratch :
      this.visualization.ctxScratch;

  var userImage = userCanvas.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var answerImage =
      this.visualization.ctxNormalizedAnswer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

  // Test whether the student can progress to the next level. There can be no
  // errors, and this either needs to be a free play/preidction level, or they
  // need to have met success conditions.
  this.levelComplete = (!level.editCode || !this.executionError) &&
      (level.freePlay ||
      this.studioApp_.hasContainedLevels ||
      this.isCorrect_(delta, permittedErrors));
  this.testResults = this.studioApp_.getTestResults(this.levelComplete);

  var program = this.getUserCode();

  // Make sure we don't reuse an old message, since not all paths set one.
  this.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !this.levelComplete && !this.studioApp_.editCode &&
      level.solutionBlocks &&
      removeK1Lengths(program) === removeK1Lengths(level.solutionBlocks)) {
    this.testResults = TestResults.APP_SPECIFIC_ERROR;
    this.message = turtleMsg.lengthFeedback();
  }

  // For levels where using too many blocks would allow students
  // to miss the point, convert that feedback to a failure.
  if (level.failForTooManyBlocks &&
      this.testResults === TestResults.TOO_MANY_BLOCKS_FAIL) {
    this.testResults = TestResults.TOO_MANY_BLOCKS_FAIL;

  } else if ((this.testResults ===
      TestResults.TOO_MANY_BLOCKS_FAIL) ||
      (this.testResults === TestResults.ALL_PASS)) {
    // Check that they didn't use a crazy large repeat value when drawing a
    // circle.  This complains if the limit doesn't start with 3.
    // Note that this level does not use colour, so no need to check for that.
    if (level.failForCircleRepeatValue && this.studioApp_.isUsingBlockly()) {
      var code = Blockly.Generator.blockSpaceToCode('JavaScript');
      if (code.indexOf('count < 3') === -1) {
        this.testResults =
            TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        this.message = commonMsg.tooMuchWork();
      }
    }
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    this.testResults = TestResults.FREE_PLAY;
  }

  // Play sound
  if (this.testResults === TestResults.FREE_PLAY ||
      this.testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
    this.studioApp_.playAudioOnWin();
  } else {
    this.studioApp_.playAudioOnFailure();
  }

  if (this.studioApp_.hasContainedLevels && !level.edit_blocks) {
    postContainedLevelAttempt(this.studioApp_);
    runAfterPostContainedLevel(() => {
      this.message = getContainedLevelResultInfo().feedback;
      this.onReportComplete();
    });
  } else {
    this.report();
  }

  if (this.studioApp_.isUsingBlockly()) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

  // The call to displayFeedback() will happen later in onReportComplete()
};

Artist.prototype.getUserCode = function () {
  if (this.studioApp_.isUsingBlockly()) {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    return Blockly.Xml.domToText(xml);
  } else if (this.level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version
    return this.studioApp_.editor.getValue();
  }
};

/**
 * Send the milestone post, including level progress (result and testResults)
 * and saved user code.
 *
 * @param {boolean} [enableOnComplete=true] whether or not to attach the
 *        onComplete handler to the StudioApp.report call
 */
Artist.prototype.report = function (enableOnComplete = true) {
  let reportData = {
    app: 'turtle',
    level: this.level.id,
    result: this.levelComplete,
    testResult: this.testResults,
    program: encodeURIComponent(this.getUserCode()),
    save_to_gallery: !!this.level.impressive
  };

  if (enableOnComplete) {
    reportData.onComplete = this.onReportComplete.bind(this);
  }

  reportData = this.setReportDataImage_(this.level, reportData);

  this.studioApp_.report(reportData);
};

/**
 * Adds the feedback image to the report data if indicated by the level config.
 * @param {Object} level Level config.
 * @param {Object} reportData Original reportData.
 * @returns {Object} Updated reportData, or original report data if not updated.
 * @private
 */
Artist.prototype.setReportDataImage_ = function (level, reportData) {
  // https://www.pivotaltracker.com/story/show/84171560
  // Never send up frozen images for now.
  var isFrozen = (this.skin.id === 'anna' || this.skin.id === 'elsa');

  // Include the feedback image whenever a levelbuilder edits solution blocks.
  const isEditingSolution = (level.editBlocks === 'solution_blocks');

  const didPassLevel = this.testResults >= TestResults.TOO_MANY_BLOCKS_FAIL;

  // Get the canvas data for feedback.
  if (
    isEditingSolution ||
    (didPassLevel && !isFrozen && (level.freePlay || level.impressive))
  ) {
    const image = isEditingSolution ?
      this.getFeedbackImage_(CANVAS_WIDTH, CANVAS_HEIGHT) :
      this.getFeedbackImage_();
    const encodedImage = encodeURIComponent(image.split(',')[1]);
    return {
      ...reportData,
      image: encodedImage,
    };
  }
  return reportData;
};

Artist.prototype.getFeedbackImage_ = function (width, height) {

  var origWidth = this.visualization.ctxFeedback.canvas.width;
  var origHeight = this.visualization.ctxFeedback.canvas.height;

  this.visualization.ctxFeedback.canvas.width = width || origWidth;
  this.visualization.ctxFeedback.canvas.height = height || origHeight;

  // Clear the feedback layer
  this.clearImage_(this.visualization.ctxFeedback);

  if (this.isFrozenSkin() && this.level.impressive) {
    // For impressive levels in frozen skins, show everything - including
    // background, characters, and pattern - along with drawing.
    this.visualization.ctxFeedback.globalCompositeOperation = 'copy';
    this.visualization.ctxFeedback.drawImage(this.visualization.ctxDisplay.canvas, 0, 0,
        this.visualization.ctxFeedback.canvas.width, this.visualization.ctxFeedback.canvas.height);
  } else {
    // Frozen free play levels must not show the character, since we don't know
    // how the drawing will look, and it could be off-brand.
    this.drawImage_(this.visualization.ctxFeedback);
  }

  // Save the canvas as a png
  var image = this.visualization.ctxFeedback.canvas.toDataURL("image/png");

  // Restore the canvas' original size
  this.visualization.ctxFeedback.canvas.width = origWidth;
  this.visualization.ctxFeedback.canvas.height = origHeight;

  return image;
};

/**
 * Renders the artist's image onto a canvas. Relies on this.visualization.ctxImages,
 * this.visualization.ctxPredraw, and this.visualization.ctxScratch to have already been drawn.
 * @returns {HTMLCanvasElement} A canvas containing the thumbnail.
 * @private
 */
Artist.prototype.getThumbnailCanvas_ = function () {
  this.clearImage_(this.visualization.ctxThumbnail);
  this.drawImage_(this.visualization.ctxThumbnail);
  return this.visualization.ctxThumbnail.canvas;
};

Artist.prototype.clearImage_ = function (context) {
  var style = context.fillStyle;
  context.fillStyle = color.white;
  context.clearRect(0, 0, context.canvas.width,
    context.canvas.height);
  context.fillStyle = style;
};

Artist.prototype.drawImage_ = function (context) {
  // Draw the images layer.
  if (!this.level.discardBackground) {
    context.globalCompositeOperation = 'source-over';
    context.drawImage(this.visualization.ctxImages.canvas, 0, 0,
      context.canvas.width, context.canvas.height);
  }

  // Draw the predraw layer.
  context.globalCompositeOperation = 'source-over';
  context.drawImage(this.visualization.ctxPredraw.canvas, 0, 0,
    context.canvas.width, context.canvas.height);

  // Draw the user layer.
  context.globalCompositeOperation = 'source-over';
  context.drawImage(this.visualization.ctxScratch.canvas, 0, 0,
    context.canvas.width, context.canvas.height);
};

/**
* When smooth animate is true, steps can be broken up into multiple animations.
* At the end of each step, we want to reset any incremental information, which
* is what this does.
*/
Artist.prototype.resetStepInfo_ = function () {
  this.visualization.stepStartX = this.visualization.x;
  this.visualization.stepStartY = this.visualization.y;
  this.visualization.stepDistanceCovered = 0;
};
