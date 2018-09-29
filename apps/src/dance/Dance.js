import React from 'react';
import ReactDOM from 'react-dom';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';

var GameLabP5 = require('./GameLabP5');
var dom = require('../dom');
import {getStore} from '../redux';
var GameLabView = require('./GameLabView');
var Provider = require('react-redux').Provider;
import Sounds from '../Sounds';
import {TestResults, ResultType} from '../constants';
import {createDanceAPI} from './DanceLabP5';
import initDance from './p5.dance';

/**
 * An instantiable GameLab class
 * @constructor
 * @implements LogTarget
 */
var Dance = function () {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  /** @type {JSInterpreter} */
  this.JSInterpreter = null;

  this.eventHandlers = {};
  this.gameLabP5 = new GameLabP5();
};

module.exports = Dance;

/**
 * Inject the studioApp singleton.
 */
Dance.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = this.reset.bind(this);
  this.studioApp_.runButtonClick = this.runButtonClick.bind(this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

/**
 * Initialize Blockly and this GameLab instance.  Called on page load.
 * @param {!AppOptionsConfig} config
 * @param {!GameLabLevel} config.level
 */
Dance.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("GameLab requires a StudioApp");
  }

  this.level = config.level;
  this.skin = config.skin;

  const MEDIA_URL = '/blockly/media/spritelab/';
  this.skin.smallStaticAvatar = MEDIA_URL + 'avatar.png';
  this.skin.staticAvatar = MEDIA_URL + 'avatar.png';
  this.skin.winAvatar = MEDIA_URL + 'avatar.png';
  this.skin.failureAvatar = MEDIA_URL + 'avatar.png';

  this.studioApp_.labUserId = config.labUserId;

  this.gameLabP5.init({
    onPreload: this.onP5Preload.bind(this),
    onSetup: this.onP5Setup.bind(this),
    onDraw: this.onP5Draw.bind(this)
  });

  config.afterClearPuzzle = function () {
    this.studioApp_.resetButtonClick();
  }.bind(this);

  config.enableShowCode = true;
  config.enableShowLinesCount = false;

  const onMount = () => {
    config.loadAudio = this.loadAudio_.bind(this);
    config.afterInject = this.afterInject_.bind(this);
    config.valueTypeTabShapeMap = Dance.valueTypeTabShapeMap(Blockly);

    this.studioApp_.init(config);

    const finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, () => this.onPuzzleComplete());
    }
  };

  const showFinishButton = !this.level.isProjectLevel && !this.level.validationCode;

  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    isProjectLevel: !!config.level.isProjectLevel,
  });

  ReactDOM.render((
    <Provider store={getStore()}>
      <GameLabView
        showFinishButton={showFinishButton}
        onMount={onMount}
        danceLab={true}
      />
    </Provider>
  ), document.getElementById(config.containerId));
};

Dance.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
Dance.prototype.afterInject_ = function () {
  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, local variables in execution environment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords([
      'code',
      'validationState',
      'validationResult',
      'validationProps',
      'levelSuccess',
      'levelFailure',
    ].join(','));

    // Don't add infinite loop protection
    Blockly.JavaScript.INFINITE_LOOP_TRAP = '';
  }
};

/**
 * Reset Dance to its initial state.
 */
Dance.prototype.reset = function () {
  this.eventHandlers = {};

  Sounds.getSingleton().stopAllAudio();

  this.gameLabP5.resetExecution();
};

Dance.prototype.onPuzzleComplete = function (testResult) {
  // Stop everything on screen.
  this.reset();

  if (testResult) {
    this.testResults = testResult;
  } else {
    this.testResults = TestResults.FREE_PLAY;
  }

  // If we know they succeeded, mark `levelComplete` true.
  const levelComplete = (this.result === ResultType.SUCCESS);

  // We're using blockly, report the program as xml.
  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  let program = encodeURIComponent(Blockly.Xml.domToText(xml));

  if (this.testResults >= TestResults.FREE_PLAY) {
    this.studioApp_.playAudio('win');
  } else {
    this.studioApp_.playAudio('failure');
  }

  const sendReport = () => {
    this.studioApp_.report({
      app: 'dance',
      level: this.level.id,
      result: levelComplete,
      testResult: this.testResults,
      program: program,
      onComplete: this.onReportComplete.bind(this),
    });
  };

  sendReport();
};

/**
 * Function to be called when the service report call is complete
 * @param {MilestoneResponse} response - JSON response (if available)
 */
Dance.prototype.onReportComplete = function (response) {
  this.response = response;
  this.studioApp_.onReportComplete(response);
  this.displayFeedback_();
};

/**
 * Click the run button.  Start the program.
 */
Dance.prototype.runButtonClick = function () {
  this.studioApp_.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  this.studioApp_.attempts++;
  this.execute();

  // Enable the Finish button if is present:
  const shareCell = document.getElementById('share-cell');
  if (shareCell && !this.level.validationCode) {
    shareCell.className = 'share-cell-enabled';

    // Adding completion button changes layout.  Force a resize.
    this.studioApp_.onResize();
  }
};

Dance.prototype.execute = function () {
  this.result = ResultType.UNSET;
  this.testResults = TestResults.NO_TESTS_RUN;
  this.response = null;

  // Reset all state.
  this.reset();
  this.studioApp_.clearAndAttachRuntimeAnnotations();

  if (this.studioApp_.hasUnwantedExtraTopBlocks() || this.studioApp_.hasDuplicateVariablesInForLoops()) {
    // Immediately check answer, which will fail and report top level blocks.
    this.onPuzzleComplete();
    return;
  }

  this.gameLabP5.startExecution();
};

Dance.prototype.initInterpreter = function () {
  const Dance = createDanceAPI(this.gameLabP5.p5);
  const nativeAPI = initDance(this.gameLabP5.p5, Dance);
  this.currentFrameEvents = nativeAPI.currentFrameEvents;
  const sprites = [];

  const api = {
    setBackground: color => {
      nativeAPI.setBackground(color.toString());
    },
    setBackgroundEffect: effect => {
      nativeAPI.setBackgroundEffect(effect.toString());
    },
    setForegroundEffect: effect => {
      nativeAPI.setForegroundEffect(effect.toString());
    },
    makeNewDanceSprite: (costume, name, location) => {
      return Number(sprites.push(nativeAPI.makeNewDanceSprite(costume, name, location)) - 1);
    },
    changeMoveLR: (spriteIndex, move, dir) => nativeAPI.changeMoveLR(sprites[spriteIndex], move, dir),
    doMoveLR: (spriteIndex, move, dir) => nativeAPI.doMoveLR(sprites[spriteIndex], move, dir),
    // TODO: ifDanceIs: function ifDanceIs(sprite, dance, ifStatement, elseStatement),

    // changeMoveEachLR: function changeMoveEachLR(group, move, dir),
    // doMoveEachLR: function doMoveEachLR(group, move, dir),
    // layoutSprites: function layoutSprites(group, format),
    // setTint: function setTint(sprite, val),

    setProp: (spriteIndex, property, val) => {
      nativeAPI.setProp(sprites[spriteIndex], property, val);
    },
    getProp: (spriteIndex, property, val) => {
      return nativeAPI.setProp(sprites[spriteIndex], property, val);
    },
    changePropBy: (spriteIndex, property, val) => {
      nativeAPI.changePropBy(sprites[spriteIndex], property, val);
    },
    jumpTo: (sprite, location) => {
      nativeAPI.jumpTo(sprite, location);
    },
    setDanceSpeed: (sprite, speed) => {
      nativeAPI.setDanceSpeed(sprite, speed);
    },
    getEnergy: range => {
      return Number(nativeAPI.getEnergy(range));
    },
    nMeasures: n => {
      return Number(nativeAPI.nMeasures(n));
    },
    getTime: unit => {
      return Number(nativeAPI.getTime(unit));
    },
    startMapping: (spriteIndex, property, val) => {
      return nativeAPI.startMapping(sprites[spriteIndex], property, val);
    },
    stopMapping: (spriteIndex, property, val) => {
      return nativeAPI.stopMapping(sprites[spriteIndex], property, val);
    },
    changeColorBy: () => {}, // TODO: function changeColorBy(input, method, amount),
    mixColors: () => {}, // TODO: function mixColors(color1, color2),
    randomColor: () => {}, // TODO: function randomColor(),
  };

  let code = require('!!raw-loader!./p5.dance.interpreted');
  code += this.studioApp_.getCode();

  const events = {
    runUserSetup: {code: 'runUserSetup();'},
    runUserEvents: {code: 'runUserEvents(events);', args: ['events']},
  };

  this.hooks = CustomMarshalingInterpreter.evalWithEvents(api, events, code).hooks;

  this.gameLabP5.p5specialFunctions.forEach(function (eventName) {
    this.eventHandlers[eventName] = nativeAPI[eventName];
  }, this);
};

/**
 * This is called while this.gameLabP5 is in the preload phase. Do the following:
 *
 * - load animations into the P5 engine
 * - initialize the interpreter
 * - start its execution
 * - (optional) execute global code
 * - call the user's preload function
 */
Dance.prototype.onP5Preload = function () {
    this.initInterpreter();

    // In addition, execute the global function called preload()
    if (this.eventHandlers.preload) {
      this.eventHandlers.preload.apply(null);
    }
};

/**
 * This is called while this.gameLabP5 is in the setup phase. We restore the
 * interpreter methods that were modified during preload, then call the user's
 * setup function.
 */
Dance.prototype.onP5Setup = function () {
  if (this.eventHandlers.setup) {
    this.eventHandlers.setup.apply(null);
  }
  this.hooks.find(v => v.name === 'runUserSetup').func();
};

/**
 * This is called while this.gameLabP5 is in a draw() call. We call the user's
 * draw function.
 */
Dance.prototype.onP5Draw = function () {
  if (this.eventHandlers.draw) {
    if (this.currentFrameEvents.any) {
      this.hooks.find(v => v.name === 'runUserEvents').func(this.currentFrameEvents);
    }
    this.eventHandlers.draw.apply(null);
  }
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
Dance.prototype.displayFeedback_ = function () {
  var level = this.level;

  this.studioApp_.displayFeedback({
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    showingSharing: level.freePlay,
    appStrings: {
      reinfFeedbackMsg: 'TODO: localized feedback message.',
    },
  });
};

Dance.valueTypeTabShapeMap = function (blockly) {
  return {
    [blockly.BlockValueType.SPRITE]: 'angle',
    [blockly.BlockValueType.BEHAVIOR]: 'rounded',
    [blockly.BlockValueType.LOCATION]: 'square',
  };
};
