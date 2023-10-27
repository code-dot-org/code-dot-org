import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import AppView from '../templates/AppView';
import {getStore} from '../redux';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {commands as audioCommands} from '../lib/util/audioApi';
var dom = require('../dom');
import DanceVisualizationColumn from './DanceVisualizationColumn';
import Sounds from '../Sounds';
import {TestResults} from '../constants';
import {ASSET_BASE, DancelabReservedWords} from './constants';
import DanceParty from '@code-dot-org/dance-party/src/p5.dance';
import DanceAPI from '@code-dot-org/dance-party/src/api';
import ResourceLoader from '@code-dot-org/dance-party/src/ResourceLoader';
import danceMsg from './locale';
import {
  reducers,
  setRunIsStarting,
  initSongs,
  setSong,
  setAiOutput,
} from './danceRedux';
import trackEvent from '../util/trackEvent';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import logToCloud from '../logToCloud';
import {saveReplayLog} from '../code-studio/components/shareDialogRedux';
import {
  captureThumbnailFromCanvas,
  setThumbnailBlobFromCanvas,
} from '../util/thumbnail';
import project from '../code-studio/initApp/project';
import {loadSongMetadata} from './songs';
import {SongTitlesToArtistTwitterHandle} from '../code-studio/dancePartySongArtistTags';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {showArrowButtons} from '@cdo/apps/templates/arrowDisplayRedux';
import danceCode from '@code-dot-org/dance-party/src/p5.dance.interpreted.js';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from '@cdo/apps/aichat/constants';
import utils from './utils';

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
 * An instantiable Dance class
 * @constructor
 * @implements LogTarget
 */
var Dance = function () {
  this.skin = null;
  this.level = null;
  this.btnState = {};

  /** @type {StudioApp} */
  this.studioApp_ = null;

  this.performanceData_ = {
    // Time until Blockly is interactable
    timeToInteractive: null,
    // Time until Dance Party play() can be called (sprites and song metadata loaded)
    timeToPlayable: null,
    // Time the run button was last clicked
    lastRunButtonClick: null,
    // Time between last run click and last time the song actually started playing
    lastRunButtonDelay: null,
  };
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
 * Initialize Blockly and this Dance instance.  Called on page load.
 * @param {!AppOptionsConfig} config
 * @param {!Dancelab} config.level
 */
Dance.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error('Dance requires a StudioApp');
  }

  this.level = config.level;
  this.usesPreview = !!config.level.usesPreview;
  this.skin = config.skin;
  this.share = config.share;
  this.studioAppInitPromise = new Promise(resolve => {
    this.studioAppInitPromiseResolve = resolve;
  });
  this.danceReadyPromise = new Promise(resolve => {
    this.danceReadyPromiseResolve = resolve;
  });
  this.studioApp_.labUserId = config.labUserId;
  this.level.softButtons = this.level.softButtons || {};
  this.initialThumbnailCapture = true;

  if (config.level.aiOutput) {
    getStore().dispatch(setAiOutput(config.level.aiOutput));
  }

  config.afterClearPuzzle = function () {
    this.studioApp_.resetButtonClick();
  }.bind(this);

  config.enableShowCode = true;
  config.enableShowLinesCount = false;

  const onMount = () => {
    config.loadAudio = this.loadAudio_.bind(this);
    config.afterInject = this.afterInject_.bind(this);
    config.valueTypeTabShapeMap = {[Blockly.BlockValueType.SPRITE]: 'angle'};

    this.studioApp_.init(config);
    this.currentCode = this.studioApp_.getCode();
    if (this.usesPreview) {
      // rerender preview each time student code changes
      this.studioApp_.addChangeHandler(e => {
        if (
          e.type !== Blockly.Events.BLOCK_DRAG &&
          e.type !== Blockly.Events.BLOCK_CHANGE
        ) {
          return;
        }

        if (e.type === Blockly.Events.BLOCK_DRAG && e.isStart) {
          return;
        }

        const newCode = Blockly.getWorkspaceCode();
        // Only execute preview if the student code has changed and we are not running the program.
        if (newCode !== this.currentCode && !this.studioApp_.isRunning()) {
          this.currentCode = newCode;
          this.preview();
        }
      });
    }

    this.studioAppInitPromiseResolve();

    const finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, () => this.onPuzzleComplete(true));
    }
  };

  const showFinishButton =
    this.level.freePlay ||
    (!this.level.isProjectLevel && !this.level.validationCode);

  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    isProjectLevel: !!config.level.isProjectLevel,
  });

  this.initSongsPromise = this.initSongs(config);

  this.awaitTimingMetrics();

  ReactDOM.render(
    <Provider store={getStore()}>
      <AppView
        visualizationColumn={
          <DanceVisualizationColumn
            showFinishButton={showFinishButton}
            setSong={this.setSongCallback.bind(this)}
          />
        }
        onMount={onMount}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

/**
 * Fire-and-forget asynchronous waits to update timing metrics.
 */
Dance.prototype.awaitTimingMetrics = function () {
  $(document).one('appInitialized', () => {
    this.performanceData_.timeToInteractive = performance.now();
  });

  this.danceReadyPromise
    .then(() => this.initSongsPromise)
    .then(() => this.songMetadataPromise)
    .then(() => {
      this.performanceData_.timeToPlayable = performance.now();
    });
};

Dance.prototype.initSongs = async function (config) {
  getStore().dispatch(
    initSongs({
      useRestrictedSongs: config.useRestrictedSongs,
      selectSongOptions: config.level,
      onAuthError: () => {
        firehoseClient.putRecord(
          {
            study: 'restricted-song-auth',
            event: 'initial-auth-error',
            data_json: JSON.stringify({
              currentUrl: window.location.href,
              channelId: config.channel,
            }),
          },
          {includeUserId: true}
        );
      },
      onSongSelected: songId => {
        this.updateSongMetadata(songId);

        if (config.channel) {
          // Ensure that the selected song will be stored in the project the first
          // time we run the level. This ensures that if we are on a project-backed
          // script level, then the correct song will still be selected after we
          // share.
          config.level.selectedSong = songId;
        }
      },
    })
  );
};

Dance.prototype.setSongCallback = function (songId) {
  getStore().dispatch(
    setSong({
      songId,
      onAuthError: () => {
        firehoseClient.putRecord(
          {
            study: 'restricted-song-auth',
            event: 'repeated-auth-error',
            data_json: JSON.stringify({
              currentUrl: window.location.href,
              channelId: getStore().getState().pageConstants.channelId,
            }),
          },
          {includeUserId: true}
        );
      },
      onSongSelected: songId => {
        this.updateSongMetadata(songId);

        const hasChannel = !!getStore().getState().pageConstants.channelId;
        if (hasChannel) {
          project.saveSelectedSong(songId);
        }
      },
    })
  );
};

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
  e.preventDefault(); // Stop normal events so we see mouseup later.

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
    dom.addMouseUpTouchEvent(
      document.getElementById(ArrowIds[btn]),
      this.onArrowButtonUp.bind(this, ArrowIds[btn])
    );
    dom.addMouseDownTouchEvent(
      document.getElementById(ArrowIds[btn]),
      this.onArrowButtonDown.bind(this, ArrowIds[btn])
    );
  }
  // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
  // all touchend events on the page, breaking click events...
  document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
  const mouseUpTouchEventName = dom.getTouchEventName('mouseup');
  if (mouseUpTouchEventName) {
    document.body.addEventListener(
      mouseUpTouchEventName,
      this.onMouseUp.bind(this)
    );
  }

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, validation variables.
    Blockly.JavaScript.addReservedWords(
      [
        'code',
        'validationState',
        'validationResult',
        'validationProps',
        'levelSuccess',
        'levelFailure',
      ].join(',')
    );
    Blockly.JavaScript.addReservedWords(DancelabReservedWords.join(','));
  }

  // record a replay log (and generate a video) for both project levels and any
  // course levels that have sharing enabled
  const recordReplayLog = this.shouldShowSharing() || this.level.isProjectLevel;
  this.nativeAPI = new DanceParty({
    onPuzzleComplete: this.onPuzzleComplete.bind(this),
    playSound: this.playSong.bind(this),
    recordReplayLog,
    showMeasureLabel: !this.share,
    onHandleEvents: this.onHandleEvents.bind(this),
    onInit: async nativeAPI => {
      if (this.share) {
        // In the share scenario, we call ensureSpritesAreLoaded() early since the
        // student code can't change. This way, we can start fetching assets while
        // waiting for the user to press the Run button.
        await this.studioAppInitPromise;
        const charactersReferenced = utils.computeCharactersReferenced(
          this.studioApp_.getCode()
        );
        await nativeAPI.ensureSpritesAreLoaded(charactersReferenced);
      }
      this.danceReadyPromiseResolve();
      // Log this so we can learn about how long it is taking for DanceParty to
      // load of all of its assets in the wild (will use the timeSinceLoad attribute)
      const logSampleRate = 1;
      logToCloud.addPageAction(
        logToCloud.PageAction.DancePartyOnInit,
        {
          logSampleRate,
          share: this.share,
        },
        logSampleRate
      );
    },
    spriteConfig: new Function('World', this.level.customHelperLibrary),
    container: 'divDance',
    i18n: danceMsg,
    doAi: this.doAi.bind(this),
    resourceLoader: new ResourceLoader(ASSET_BASE),
  });

  // Expose an interface for testing
  // Composes the nativeAPI getPerformanceData with our own performance data.
  const nativeAPITestInterface = this.nativeAPI.getTestInterface();
  window.__DanceTestInterface = {
    ...nativeAPITestInterface,
    getPerformanceData: () => ({
      ...nativeAPITestInterface.getPerformanceData(),
      ...this.performanceData_,
    }),
  };

  if (recordReplayLog) {
    getStore().dispatch(saveReplayLog(this.nativeAPI.getReplayLog()));
  }
};

Dance.prototype.playSong = function (url, callback, onEnded) {
  audioCommands.playSound({
    url: url,
    callback: callback,
    onEnded: () => {
      onEnded();
      this.studioApp_.toggleRunReset('run');
    },
  });
};

/**
 * Reset Dance to its initial state.
 */
Dance.prototype.reset = function () {
  var clickToRunImage = document.getElementById('danceClickToRun');
  if (clickToRunImage) {
    clickToRunImage.style.display = 'block';
  }

  Sounds.getSingleton().stopAllAudio();

  this.nativeAPI.reset();

  var softButtonCount = 0;
  for (var i = 0; i < this.level.softButtons.length; i++) {
    document.getElementById(this.level.softButtons[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    getStore().dispatch(showArrowButtons());
    $('#soft-buttons').addClass('soft-buttons-' + softButtonCount);
  }
  if (this.usesPreview) {
    this.preview();
  }
};

/**
 * This function is called when `this.usesPreview` is set to true - only blocks
 * included in the `setup` block are drawn in the visulization column.
 * Unlike `execute`, `draw` is called only once (not in a loop) so that a static
 * image is displayed and sound is NOT played.
 */
Dance.prototype.preview = async function () {
  this.nativeAPI.setForegroundEffectsInPreviewMode(true);
  this.nativeAPI.reset();
  const api = new DanceAPI(this.nativeAPI);
  const studentCode = this.studioApp_.getCode();
  const code = danceCode + studentCode;

  const event = {
    runUserSetup: {code: 'runUserSetup();'},
  };

  this.hooks = CustomMarshalingInterpreter.evalWithEvents(
    api,
    event,
    code
  ).hooks;

  const charactersReferenced = utils.computeCharactersReferenced(studentCode);
  await this.nativeAPI.ensureSpritesAreLoaded(charactersReferenced);
  this.hooks.find(v => v.name === 'runUserSetup').func();

  // Force preview draw to occur **after** any
  // draw iterations already queued up.
  // redraw() (rather than draw()) is p5's recommended way
  // of drawing once.
  setTimeout(() => {
    this.nativeAPI.p5_.redraw();
    this.nativeAPI.setForegroundEffectsInPreviewMode(false);
  }, 0);
};

Dance.prototype.onPuzzleComplete = function (result, message) {
  // Stop everything on screen.
  this.reset();

  // Assign danceMessage the value of the message key if the key exists.
  // Otherwise, assign it an empty string.
  const danceMessage = danceMsg[message] ? danceMsg[message]() : '';
  if (result === true) {
    this.testResults = TestResults.ALL_PASS;
    this.message = danceMessage;
  } else if (result === false) {
    this.testResults = TestResults.APP_SPECIFIC_FAIL;
    // This message is a general message for users to keep coding since something is 'not quite right'.
    // This is the general validation feedback given if the validation string key is not found.
    const keepCodingMsg = danceMsg.danceFeedbackKeepCoding();
    this.message = danceMessage.length === 0 ? keepCodingMsg : danceMessage;
  } else {
    this.testResults = TestResults.FREE_PLAY;
  }

  // If we know they succeeded, mark `levelComplete` true.
  const levelComplete = result;

  let program = encodeURIComponent(
    Blockly.cdoUtils.getCode(Blockly.mainBlockSpace)
  );

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
  if (this.usesPreview) {
    this.nativeAPI.reset();
  }
  var clickToRunImage = document.getElementById('danceClickToRun');
  if (clickToRunImage) {
    clickToRunImage.style.display = 'none';
  }

  // Block re-entrancy since starting a run is async
  // (not strictly needed since we disable the run button,
  // but better to be safe)
  if (getStore().getState().dance.runIsStarting) {
    return;
  }

  this.performanceData_.lastRunButtonClick = performance.now();
  this.performanceData_.lastRunButtonDelay = null;

  // Disable the run button now to give some visual feedback
  // that the button was pressed. toggleRunReset() will
  // eventually execute down below, but there are some long-running
  // tasks that need to complete first
  const runButton = document.getElementById('runButton');
  runButton.disabled = true;
  const divDanceLoading = document.getElementById('divDanceLoading');
  divDanceLoading.style.display = 'flex';
  getStore().dispatch(setRunIsStarting(true));
  await this.danceReadyPromise;

  //Log song count in Dance Lab
  trackEvent('HoC_Song', 'Play-2019', getStore().getState().dance.selectedSong);

  Blockly.mainBlockSpace.traceOn(true);
  this.studioApp_.attempts++;

  try {
    await this.execute();
  } finally {
    this.studioApp_.toggleRunReset('reset');
    divDanceLoading.style.display = 'none';
    // Safe to allow normal run/reset behavior now
    getStore().dispatch(setRunIsStarting(false));
  }

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

  if (
    this.studioApp_.hasUnwantedExtraTopBlocks() ||
    this.studioApp_.hasDuplicateVariablesInForLoops()
  ) {
    // Immediately check answer, which will fail and report top level blocks.
    this.onPuzzleComplete();
    return;
  }

  const charactersReferenced = this.initInterpreter();

  await this.nativeAPI.ensureSpritesAreLoaded(charactersReferenced);

  this.hooks.find(v => v.name === 'runUserSetup').func();
  const timestamps = this.hooks.find(v => v.name === 'getCueList').func();
  this.nativeAPI.addCues(timestamps);

  this.nativeAPI.registerValidation(
    utils.getValidationCallback(this.level.validationCode)
  );

  // songMetadataPromise will resolve immediately if the request which populates
  // it has not yet been initiated. Therefore we must first wait for song init
  // to complete before awaiting songMetadataPromise.
  await this.initSongsPromise;

  const songMetadata = await this.songMetadataPromise;
  const userBlockTypes = Blockly.getMainWorkspace()
    .getAllBlocks()
    .map(block => block.type);
  return new Promise((resolve, reject) => {
    this.nativeAPI.play(
      songMetadata,
      success => {
        this.performanceData_.lastRunButtonDelay =
          performance.now() - this.performanceData_.lastRunButtonClick;
        success ? resolve() : reject();
      },
      userBlockTypes
    );
  });
};

Dance.prototype.initInterpreter = function () {
  const nativeAPI = this.nativeAPI;
  const api = new DanceAPI(nativeAPI);

  const studentCode = this.studioApp_.getCode();

  const code = danceCode + studentCode;

  const events = {
    runUserSetup: {code: 'runUserSetup();'},
    runUserEvents: {code: 'runUserEvents(events);', args: ['events']},
    getCueList: {code: 'return getCueList();'},
  };

  this.hooks = CustomMarshalingInterpreter.evalWithEvents(
    api,
    events,
    code
  ).hooks;

  return utils.computeCharactersReferenced(studentCode);
};

Dance.prototype.shouldShowSharing = function () {
  return !!this.level.freePlay;
};

Dance.prototype.updateSongMetadata = function (id) {
  this.songMetadataPromise = loadSongMetadata(id);
};

/**
 * This is called while DanceParty is in a draw() call.
 */
Dance.prototype.onHandleEvents = function (currentFrameEvents) {
  this.hooks.find(v => v.name === 'runUserEvents').func(currentFrameEvents);
  this.captureThumbnailImage();
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
Dance.prototype.displayFeedback_ = function () {
  const isSignedIn =
    getStore().getState().currentUser.signInState === SignInState.SignedIn;

  const artistTwitterHandle =
    SongTitlesToArtistTwitterHandle[this.level.selectedSong];

  const twitterText =
    'Check out the dance I made featuring @' +
    artistTwitterHandle +
    ' on @codeorg!';

  const comma = '%2C';
  const hashtags =
    artistTwitterHandle === 'Coldplay'
      ? ['codeplay', 'HourOfCode'].join(comma)
      : ['HourOfCode'];

  let feedbackOptions = {
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
    twitter: {text: twitterText, hashtag: hashtags},
  };

  // Disable social share for users under 13 if we have the cookie set.
  const is13PlusCookie = sessionStorage.getItem('ad_anon_over13');
  if (is13PlusCookie) {
    feedbackOptions.disableSocialShare = is13PlusCookie === 'false';
  }

  this.studioApp_.displayFeedback(feedbackOptions);
};

Dance.prototype.getAppReducers = function () {
  return reducers;
};

/**
 * Capture a thumbnail image of the play space. On initial capture, the thumbnail
 * will be saved to the server. Every thumbnail captured after the initial capture will be
 * stored in memory until the project is saved.
 */
Dance.prototype.captureThumbnailImage = function () {
  const canvas = document.getElementById('defaultCanvas0');
  if (this.initialThumbnailCapture) {
    this.initialThumbnailCapture = false;
    captureThumbnailFromCanvas(canvas);
  } else {
    setThumbnailBlobFromCanvas(canvas);
  }
};

Dance.prototype.doAi = async function (input) {
  const systemPrompt =
    'You are a helper which can accept a request for a mood or atmosphere, and you then generate JSON like the following format: {backgroundColor: "black", backgroundEffect: "splatter", foregroundEffect: "rain"}.  The only valid values for backgroundEffect are circles, color_cycle, diamonds, disco_ball, fireworks, swirl, kaleidoscope, lasers, splatter, rainbow, snowflakes, galaxy, sparkles, spiral, disco, stars.  The only valid values for backgroundColor are rave, cool, electronic, iceCream, neon, tropical, vintage, warm.  The only valid values for foregroundEffect are bubbles, confetti, hearts_red, music_notes, pineapples, pizzas, smiling_poop, rain, floating_rainbows, smile_face, spotlight, color_lights, raining_tacos.  Make sure you always generate all three of those values.  Also, if you receive a request to place a dancer somewhere, then add {setDancer: "true"} to the result JSON.  Also, add a field called "explanation" to the result JSON, which contains a single-sentence explanation of why you chose the values that you did, at the reading level of a 5th-grade school student.';

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: input,
    },
  ];

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify({messages}),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  if (response.status === 200) {
    const res = await response.json();
    return res.content;
  } else {
    return null;
  }
};
