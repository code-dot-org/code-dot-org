import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import AppView from '../templates/AppView';
import {getStore} from "../redux";
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {commands as audioCommands} from '../lib/util/audioApi';
var dom = require('../dom');
import DanceVisualizationColumn from './DanceVisualizationColumn';
import Sounds from '../Sounds';
import {TestResults} from '../constants';
import {DanceParty} from '@code-dot-org/dance-party';
import {reducers, setSong} from './redux';
import trackEvent from '../util/trackEvent';
import {SignInState} from '../code-studio/progressRedux';

const ButtonState = {
  UP: 0,
  DOWN: 1,
};

const ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton',
};

/**
 * An instantiable GameLab class
 * @constructor
 * @implements LogTarget
 */
var Dance = function () {
  this.skin = null;
  this.level = null;
  this.btnState = {};

  /** @type {StudioApp} */
  this.studioApp_ = null;
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
Dance.prototype.init = async function (config) {
  if (!this.studioApp_) {
    throw new Error("GameLab requires a StudioApp");
  }

  this.level = config.level;
  this.skin = config.skin;
  this.share = config.share;
  this.danceReadyPromise = new Promise(resolve => {
    this.danceReadyPromiseResolve = resolve;
  });

  this.studioApp_.labUserId = config.labUserId;

  this.level.softButtons = this.level.softButtons || {};

  config.afterClearPuzzle = function () {
    this.studioApp_.resetButtonClick();
  }.bind(this);

  config.enableShowCode = true;
  config.enableShowLinesCount = false;
  config.noHowItWorks = true;

  const onMount = () => {
    config.loadAudio = this.loadAudio_.bind(this);
    config.afterInject = this.afterInject_.bind(this);
    config.valueTypeTabShapeMap = {[Blockly.BlockValueType.SPRITE]: 'angle'};

    this.studioApp_.init(config);

    const finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, () => this.onPuzzleComplete(true));
    }
  };

  const showFinishButton = this.level.freePlay || (!this.level.isProjectLevel && !this.level.validationCode);

  const songManifest = await getSongManifest(config.useRestrictedSongs);

  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    isProjectLevel: !!config.level.isProjectLevel,
    songManifest,
  });

  // Pre-register all audio preloads with our Sounds API, which will load
  // them into memory so they can play immediately:
  $("link[as=fetch][rel=preload]").each((i, { href }) => {
    const soundConfig = { id: href };
    soundConfig[Sounds.getExtensionFromUrl(href)] = href;
    Sounds.getSingleton().register(soundConfig);
  });

  const selectedSong = getSelectedSong(songManifest, config);
  getStore().dispatch(setSong(selectedSong));

  this.updateSongMetadata(getStore().getState().selectedSong);

  ReactDOM.render((
    <Provider store={getStore()}>
      <AppView
        visualizationColumn={
          <DanceVisualizationColumn
            showFinishButton={showFinishButton}
            retrieveMetadata={this.updateSongMetadata.bind(this)}
          />
        }
        onMount={onMount}
      />
    </Provider>
  ), document.getElementById(config.containerId));
};

function getSelectedSong(songManifest, config) {
  // The selectedSong and defaultSong might not be present in the songManifest
  // in development mode, so just select the first song in the list instead.
  const songs = songManifest.map(song => song.id);
  const {selectedSong, defaultSong, isProjectLevel, freePlay} = config.level;
  if ((isProjectLevel || freePlay) && selectedSong && songs.includes(selectedSong)) {
    return selectedSong;
  } else if (defaultSong && songs.includes(defaultSong)) {
    return defaultSong;
  } else if (songManifest[0]) {
    return songManifest[0].id;
  }
}

async function getSongManifest(useRestrictedSongs) {
  const manifestFilename = useRestrictedSongs ? 'songManifest.json' : 'testManifest.json';
  const songManifestPromise = fetch(`/api/v1/sound-library/hoc_song_meta/${manifestFilename}`)
    .then(response => response.json());
  const promises = [songManifestPromise];

  // We must obtain signed cookies before accessing restricted content.
  if (useRestrictedSongs) {
    const signedCookiesPromise = fetch('/dashboardapi/sign_cookies', {credentials: 'same-origin'});
    promises.push(signedCookiesPromise);
  }

  const result = await Promise.all(promises);
  const songManifest = result[0].songs;

  const songPathPrefix = useRestrictedSongs ?
    '/restricted/' : 'https://curriculum.code.org/media/uploads/';

  return songManifest.map(song => ({
    ...song,
    url: `${songPathPrefix}${song.url}.mp3`,
  }));
}

Dance.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

const KeyCodes = {
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
};

function keyCodeFromArrow(idBtn) {
  switch (idBtn) {
    case ArrowIds.LEFT:
      return KeyCodes.LEFT_ARROW;
    case ArrowIds.RIGHT:
      return KeyCodes.RIGHT_ARROW;
    case ArrowIds.UP:
      return KeyCodes.UP_ARROW;
    case ArrowIds.DOWN:
      return KeyCodes.DOWN_ARROW;
  }
}

Dance.prototype.onArrowButtonDown = function (buttonId, e) {
  // Store the most recent event type per-button
  this.btnState[buttonId] = ButtonState.DOWN;
  e.preventDefault();  // Stop normal events so we see mouseup later.

  this.nativeAPI.onKeyDown(keyCodeFromArrow(buttonId));
};

Dance.prototype.onArrowButtonUp = function (buttonId, e) {
  // Store the most recent event type per-button
  this.btnState[buttonId] = ButtonState.UP;

  this.nativeAPI.onKeyUp(keyCodeFromArrow(buttonId));
};

Dance.prototype.onMouseUp = function (e) {
  // Reset all arrow buttons on "global mouse up" - this handles the case where
  // the mouse moved off the arrow button and was released somewhere else

  if (e.touches && e.touches.length > 0) {
    return;
  }

  for (const buttonId in this.btnState) {
    if (this.btnState[buttonId] === ButtonState.DOWN) {
      this.onArrowButtonUp(buttonId, e);
    }
  }
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
Dance.prototype.afterInject_ = function () {

  // Connect up arrow button event handlers
  for (const btn in ArrowIds) {
    dom.addMouseUpTouchEvent(document.getElementById(ArrowIds[btn]),
        this.onArrowButtonUp.bind(this, ArrowIds[btn]));
    dom.addMouseDownTouchEvent(document.getElementById(ArrowIds[btn]),
        this.onArrowButtonDown.bind(this, ArrowIds[btn]));
  }
  // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
  // all touchend events on the page, breaking click events...
  document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
  const mouseUpTouchEventName = dom.getTouchEventName('mouseup');
  if (mouseUpTouchEventName) {
    document.body.addEventListener(mouseUpTouchEventName, this.onMouseUp.bind(this));
  }

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, validation variables.
    Blockly.JavaScript.addReservedWords([
      'code',
      'validationState',
      'validationResult',
      'validationProps',
      'levelSuccess',
      'levelFailure',
    ].join(','));
  }

  this.nativeAPI = new DanceParty({
    onPuzzleComplete: this.onPuzzleComplete.bind(this),
    playSound: audioCommands.playSound,
    recordReplayLog: this.shouldShowSharing(),
    onHandleEvents: this.onHandleEvents.bind(this),
    onInit: () => {
      const spriteConfig = new Function('World', this.level.customHelperLibrary);
      this.nativeAPI.init(spriteConfig);
      this.danceReadyPromiseResolve();
    },
    container: 'divDance',
  });
};

/**
 * Reset Dance to its initial state.
 */
Dance.prototype.reset = function () {
  Sounds.getSingleton().stopAllAudio();

  this.nativeAPI.reset();

  var softButtonCount = 0;
  for (var i = 0; i < this.level.softButtons.length; i++) {
    document.getElementById(this.level.softButtons[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    $('#soft-buttons').removeClass('soft-buttons-none').addClass('soft-buttons-' + softButtonCount);
  }
};

Dance.prototype.onPuzzleComplete = function (result, message) {
  // Stop everything on screen.
  this.reset();

  if (result === true) {
    this.testResults = TestResults.ALL_PASS;
    this.message = message;
  } else if (result === false) {
    this.testResults = TestResults.APP_SPECIFIC_FAIL;
    this.message = message;
  } else {
    this.testResults = TestResults.FREE_PLAY;
  }

  // If we know they succeeded, mark `levelComplete` true.
  const levelComplete = result;

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
Dance.prototype.runButtonClick = async function () {
  await this.danceReadyPromise;

  //Log song count in Dance Lab
  trackEvent('HoC_Song', 'Play', getStore().getState().selectedSong);

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

Dance.prototype.execute = async function () {
  this.testResults = TestResults.NO_TESTS_RUN;
  this.response = null;

  if (this.studioApp_.hasUnwantedExtraTopBlocks() || this.studioApp_.hasDuplicateVariablesInForLoops()) {
    // Immediately check answer, which will fail and report top level blocks.
    this.onPuzzleComplete();
    return;
  }

  this.initInterpreter();

  this.hooks.find(v => v.name === 'runUserSetup').func();
  const timestamps = this.hooks.find(v => v.name === 'getCueList').func();
  this.nativeAPI.addCues(timestamps);

  const validationCallback = new Function('World', 'nativeAPI', 'sprites', this.level.validationCode);
  this.nativeAPI.registerValidation(validationCallback);

  const songData = await this.songMetadataPromise;
  this.nativeAPI.play(songData);
};

Dance.prototype.initInterpreter = function () {
  const nativeAPI = this.nativeAPI;
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
    makeNewDanceSpriteGroup: (n, costume, layout) => {
      nativeAPI.makeNewDanceSpriteGroup(n, costume, layout);
    },
    getCurrentDance: (spriteIndex) => {
      return nativeAPI.getCurrentDance(sprites[spriteIndex]);
    },
    changeMoveLR: (spriteIndex, move, dir) => {
      nativeAPI.changeMoveLR(sprites[spriteIndex], move, dir);
    },
    doMoveLR: (spriteIndex, move, dir) => {
      nativeAPI.doMoveLR(sprites[spriteIndex], move, dir);
    },
    changeMoveEachLR: (group, move, dir) => {
      nativeAPI.changeMoveEachLR(group, move, dir);
    },
    doMoveEachLR: (group, move, dir) => {
      nativeAPI.doMoveEachLR(group, move, dir);
    },
    layoutSprites: (group, format) => {
      nativeAPI.layoutSprites(group, format);
    },
    setTint: (spriteIndex, val) => {
      nativeAPI.setTint(sprites[spriteIndex], val);
    },
    setProp: (spriteIndex, property, val) => {
      nativeAPI.setProp(sprites[spriteIndex], property, val);
    },
    setPropEach: (group, property, val) => {
      nativeAPI.setPropEach(group, property, val);
    },
    setPropRandom: (spriteIndex, property) => {
      nativeAPI.setPropRandom(sprites[spriteIndex], property);
    },
    getProp: (spriteIndex, property, val) => {
      return nativeAPI.setProp(sprites[spriteIndex], property, val);
    },
    changePropBy: (spriteIndex, property, val) => {
      nativeAPI.changePropBy(sprites[spriteIndex], property, val);
    },
    jumpTo: (spriteIndex, location) => {
      nativeAPI.jumpTo(sprites[spriteIndex], location);
    },
    setDanceSpeed: (spriteIndex, speed) => {
      nativeAPI.setDanceSpeed(sprites[spriteIndex], speed);
    },
    getEnergy: range => {
      return Number(nativeAPI.getEnergy(range));
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
    changeColorBy: (input, method, amount) => {
      return nativeAPI.changeColorBy(input, method, amount);
    },
    mixColors: (color1, color2) => {
      return nativeAPI.mixColors(color1, color2);
    },
    randomColor: () => {
      return nativeAPI.randomColor();
    },
    getCurrentTime: () => {
      return nativeAPI.getCurrentTime();
    },
  };

  let code = require('!!raw-loader!./p5.dance.interpreted');
  code += this.studioApp_.getCode();

  const events = {
    runUserSetup: {code: 'runUserSetup();'},
    runUserEvents: {code: 'runUserEvents(events);', args: ['events']},
    getCueList: {code: 'return getCueList();'},
  };

  this.hooks = CustomMarshalingInterpreter.evalWithEvents(api, events, code).hooks;
};

Dance.prototype.shouldShowSharing = function () {
  return !!this.level.freePlay;
};

Dance.prototype.updateSongMetadata = function (id) {
  this.songMetadataPromise = this.loadSongMetadata(id);
};

Dance.prototype.loadSongMetadata = async function (id) {
  let songDataPath = '/api/v1/sound-library/hoc_song_meta';
  const response = await fetch(`${songDataPath}/${id}.json`);
  return await response.json();
};

/**
 * This is called while DanceParty is in a draw() call.
 */
Dance.prototype.onHandleEvents = function (currentFrameEvents) {
  this.hooks.find(v => v.name === 'runUserEvents').func(currentFrameEvents);
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
Dance.prototype.displayFeedback_ = function () {
  const isSignedIn = getStore().getState().progress.signInState === SignInState.SignedIn;
  this.studioApp_.displayFeedback({
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: this.level,
    showingSharing: this.shouldShowSharing(),
    saveToProjectGallery: true,
    disableSaveToGallery: !isSignedIn,
    appStrings: {
      reinfFeedbackMsg: 'TODO: localized feedback message.',
    },
  });
};

Dance.prototype.getAppReducers = function () {
  return reducers;
};
