import DanceAPI from '@code-dot-org/dance-party/src/api';
import DanceParty from '@code-dot-org/dance-party/src/p5.dance';
import danceCode from '@code-dot-org/dance-party/src/p5.dance.interpreted.js';
import ResourceLoader from '@code-dot-org/dance-party/src/ResourceLoader';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import ErrorBoundary from '@cdo/apps/lab2/ErrorBoundary';
import {ErrorFallbackPage} from '@cdo/apps/lab2/views/ErrorFallbackPage';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {showArrowButtons} from '@cdo/apps/templates/arrowDisplayRedux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

import {saveReplayLog} from '../code-studio/components/shareDialogRedux';
import {SongTitlesToArtistTwitterHandle} from '../code-studio/dancePartySongArtistTags';
import project from '../code-studio/initApp/project';
import {TestResults} from '../constants';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {EVENTS} from '../lib/util/AnalyticsConstants';
import analyticsReporter from '../lib/util/AnalyticsReporter';
import {commands as audioCommands} from '../lib/util/audioApi';
import logToCloud from '../logToCloud';
import {getStore} from '../redux';
import Sounds from '../Sounds';
import AppView from '../templates/AppView';
import {
  captureThumbnailFromCanvas,
  setThumbnailBlobFromCanvas,
} from '../util/thumbnail';
import trackEvent from '../util/trackEvent';

import {DANCE_AI_SOUNDS} from './ai/constants';
import {ASSET_BASE, DancelabReservedWords} from './constants';
import danceMetricsReporter from './danceMetricsReporter';
import {
  reducers,
  setRunIsStarting,
  initSongs,
  setSong,
  setAiOutput,
} from './danceRedux';
import DanceVisualizationColumn from './DanceVisualizationColumn';
import danceMsg from './locale';
import {loadSongMetadata} from './songs';
import utils from './utils';

var dom = require('../dom');

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

  const state = getStore().getState();
  danceMetricsReporter.updateProperties({
    channelId: state.pageConstants.channelId,
    currentLevelId: state.progress.currentLevelId,
    scriptId: state.progress.scriptId,
    userId: state.currentUser.userId,
  });

  ReactDOM.render(
    <Provider store={getStore()}>
      <ErrorBoundary
        // this is actually the Lab2 Error Fallback page. We may want to refactor this after Hour of Code.
        fallback={<ErrorFallbackPage />}
        onError={(error, componentStack) => {
          danceMetricsReporter.logError('Uncaught React Error', error, {
            componentStack,
          });
        }}
      >
        <AppView
          visualizationColumn={
            <DanceVisualizationColumn
              showFinishButton={showFinishButton}
              setSong={this.setSongCallback.bind(this)}
              resetProgram={this.reset.bind(this)}
              playSound={this.playSound.bind(this)}
            />
          }
          onMount={onMount}
        />
      </ErrorBoundary>
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
      onSongUnavailable: songId => {
        this.songUnavailableAlert = this.studioApp_.displayPlayspaceAlert(
          'warning',
          React.createElement('div', {}, danceMsg.danceSongNoLongerSupported())
        );

        const {isReadOnlyWorkspace, channelId} =
          getStore().getState().pageConstants;
        analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_SONG_UNAVAILABLE, {
          songId,
          viewerOwnsProject: !isReadOnlyWorkspace,
          channelId,
        });
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
        if (this.songUnavailableAlert) {
          this.studioApp_.closeAlert(this.songUnavailableAlert);
          this.songUnavailableAlert = undefined;
        }

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

  DANCE_AI_SOUNDS.forEach(soundId => {
    const soundPath = this.studioApp_.assetUrl(
      `media/skins/dance/${soundId}.mp3`
    );
    this.studioApp_.loadAudio([soundPath], soundId);
  });
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
    resourceLoader: new ResourceLoader(ASSET_BASE),
    logger: danceMetricsReporter,
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
  if (Sounds.getSingleton().isPlaying(url)) {
    // Prevent playing the same song twice simultaneously.
    audioCommands.stopSound({url: url});
  }

  audioCommands.playSound({
    url: url,
    callback: callback,
    onEnded: () => {
      onEnded();
      this.studioApp_.toggleRunReset('run');
    },
  });
};

Dance.prototype.playSound = function (soundName, options) {
  var defaultOptions = {volume: 0.5};
  var newOptions = {...defaultOptions, ...options};
  Sounds.getSingleton().play(soundName, newOptions);
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

  const previewDraw = () => {
    this.nativeAPI.setEffectsInPreviewMode(true);

    // Calls each effect's init() step.
    this.hooks.find(v => v.name === 'runUserSetup').func();

    // redraw() (rather than draw()) is p5's recommended way
    // of drawing once.
    this.nativeAPI.p5_.redraw();

    this.nativeAPI.setEffectsInPreviewMode(false);
  };

  // This is the mechanism p5 uses to queue draws,
  // so we use the same mechanism to ensure that
  // this preview is drawn after any queued draw calls.
  window.requestAnimationFrame(previewDraw);
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
  const state = getStore().getState();
  const validationResult = result ? 'PASSED' : 'FAILED';
  analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_VALIDATION, {
    levelPath: state.pageConstants.currentScriptLevelUrl,
    result: validationResult,
    message, // feedback message key
    userId: state.currentUser.userId,
  });

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

  if (this.songUnavailableAlert) {
    this.studioApp_.closeAlert(this.songUnavailableAlert);
    this.songUnavailableAlert = undefined;
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
