'use strict';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
// var commonMsg = require('../locale');
// var msg = require('./locale');
// var levels = require('./levels');
// var codegen = require('../codegen');
// var api = require('./api');
// var apiJavascript = require('./apiJavascript');
var consoleApi = require('../consoleApi');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var utils = require('../utils');
// var dropletUtils = require('../dropletUtils');
var _ = require('lodash');
var assetPrefix = require('../assetManagement/assetPrefix');
var errorHandler = require('../errorHandler');
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;
var dom = require('../dom');
var experiments = require('../experiments');

// var reducers = require('./reducers');
var WebLabView = require('./WebLabView');
var Provider = require('react-redux').Provider;
// import { shouldOverlaysBeVisible } from '../templates/VisualizationOverlay';

/**
 * An instantiable WebLab class
 */
var WebLab = function () {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  this.eventHandlers = {};
  this.Globals = {};
  this.reportPreloadEventHandlerComplete_ = null;

  consoleApi.setLogMethod(this.log.bind(this));
  errorHandler.setLogMethod(this.log.bind(this));

  /** Expose for testing **/
  window.__mostRecentWebLabInstance = this;
};

module.exports = WebLab;

/**
 * Forward a log message to both logger objects.
 * @param {?} object
 */
WebLab.prototype.log = function (object) {
  this.consoleLogger_.log(object);
};

/**
 * Inject the studioApp singleton.
 */
WebLab.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = this.reset.bind(this);
  this.studioApp_.runButtonClick = this.runButtonClick.bind(this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

/**
 * Initialize Blockly and this WebLab instance.  Called on page load.
 */
WebLab.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("GameLab requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  this.level.softButtons = this.level.softButtons || {};
  if (this.level.startAnimations && this.level.startAnimations.length > 0) {
    try {
      this.startAnimations = JSON.parse(this.level.startAnimations);
    } catch (err) {
      console.error("Unable to parse default animation list", err);
    }
  }

  config.usesAssets = true;

//  config.appMsg = msg;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.centerEmbedded = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  config.shareWarningInfo = {
    hasDataAPIs: function () {
      return this.hasDataStoreAPIs(this.studioApp_.getCode());
    }.bind(this),
    onWarningsComplete: function () {
      window.setTimeout(this.studioApp_.runButtonClick, 0);
    }.bind(this)
  };

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.showInstructionsInTopPane = true;
  config.noInstructionsWhenCollapsed = true;

  var onMount = function () {
    this.setupReduxSubscribers(this.studioApp_.reduxStore);
 //   config.loadAudio = this.loadAudio_.bind(this);
    config.afterInject = this.afterInject_.bind(this, config);
    config.afterEditorReady = this.afterEditorReady_.bind(this, false /* breakpointsEnabled */);

    // BUGBUG
    window.Blockly = null;

   // this.studioApp_.init(config);

   // var finishButton = document.getElementById('finishButton');
   // if (finishButton) {
   //   dom.addClickTouchEvent(finishButton, this.onPuzzleComplete.bind(this, false));
   // }

  }.bind(this);

  var showFinishButton = !this.level.isProjectLevel;
  var finishButtonFirstLine = _.isEmpty(this.level.softButtons);

  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
  });

  // Push project-sourced animation metadata into store
//  const initialAnimationList = config.initialAnimationList || this.startAnimations;
//  this.studioApp_.reduxStore.dispatch(setInitialAnimationList(initialAnimationList));

  ReactDOM.render((
    <Provider store={this.studioApp_.reduxStore}>
      <WebLabView
          onMount={onMount}
      />
    </Provider>
  ), document.getElementById(config.containerId));

  this.studioApp_.notifyInitialRenderComplete(config);
};

/**
 * Subscribe to state changes on the store.
 * @param {!Store} store
 */
WebLab.prototype.setupReduxSubscribers = function (store) {
  var state = {};
  store.subscribe(() => {
    var lastState = state;
    state = store.getState();

    if (!lastState.runState || state.runState.isRunning !== lastState.runState.isRunning) {
      this.onIsRunningChange(state.runState.isRunning);
    }
  });
};

WebLab.prototype.onIsRunningChange = function () {
  this.setCrosshairCursorForPlaySpace();
};

WebLab.prototype.calculateVisualizationScale_ = function () {
  var divGameLab = document.getElementById('divGameLab');
  // Calculate current visualization scale:
  return divGameLab.getBoundingClientRect().width / divGameLab.offsetWidth;
};

/**
 * @param {string} code The code to search for Data Storage APIs
 * @return {boolean} True if the code uses any data storage APIs
 */
WebLab.prototype.hasDataStoreAPIs = function (code) {
  return /createRecord/.test(code) || /updateRecord/.test(code) ||
      /setKeyValue/.test(code);
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
WebLab.prototype.afterInject_ = function (config) {

};

/**
 * Initialization to run after ace/droplet is initialized.
 * @param {!boolean} areBreakpointsEnabled
 * @private
 */
WebLab.prototype.afterEditorReady_ = function (areBreakpointsEnabled) {

};

/**
 * Reset GameLab to its initial state.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
WebLab.prototype.reset = function (ignore) {

  /*
  var divGameLab = document.getElementById('divGameLab');
  while (divGameLab.firstChild) {
    divGameLab.removeChild(divGameLab.firstChild);
  }
  */

  /*
  this.gameLabP5.resetExecution();

  // Import to reset these after this.gameLabP5 has been reset
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.reportPreloadEventHandlerComplete_ = null;
  this.globalCodeRunsDuringPreload = false;


  // Soft buttons
  var softButtonCount = 0;
  for (var i = 0; i < this.level.softButtons.length; i++) {
    document.getElementById(this.level.softButtons[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    $('#soft-buttons').removeClass('soft-buttons-none').addClass('soft-buttons-' + softButtonCount);
  }

  if (this.level.showDPad) {
    $('#studio-dpad').removeClass('studio-dpad-none');
    this.resetDPad();
  }
  */
};

WebLab.prototype.onPuzzleComplete = function (submit) {
  if (this.executionError) {
    this.result = this.studioApp_.ResultType.ERROR;
  } else {
    // In most cases, submit all results as success
    this.result = this.studioApp_.ResultType.SUCCESS;
  }

  // If we know they succeeded, mark levelComplete true
  var levelComplete = (this.result === this.studioApp_.ResultType.SUCCESS);

  if (this.executionError) {
    this.testResults = this.studioApp_.getTestResults(levelComplete, {
        executionError: this.executionError
    });
  } else if (!submit) {
    this.testResults = this.studioApp_.TestResults.FREE_PLAY;
  }

  // Stop everything on screen
  this.reset();

  var program;
  var containedLevelResultsInfo = this.studioApp_.getContainedLevelResultsInfo();

  if (containedLevelResultsInfo) {
    // Keep our this.testResults as always passing so the feedback dialog
    // shows Continue (the proper results will be reported to the service)
    this.testResults = this.studioApp_.TestResults.ALL_PASS;
    this.message = containedLevelResultsInfo.feedback;
  } else if (this.level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = encodeURIComponent(this.studioApp_.getCode());
    this.message = null;
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = encodeURIComponent(Blockly.Xml.domToText(xml));
    this.message = null;
  }

  if (this.testResults >= this.studioApp_.TestResults.FREE_PLAY) {
    this.studioApp_.playAudio('win');
  } else {
    this.studioApp_.playAudio('failure');
  }

  this.waitingForReport = true;

  var sendReport = function () {
    this.studioApp_.report({
      app: 'gamelab',
      level: this.level.id,
      result: levelComplete,
      testResult: this.testResults,
      submitted: submit,
      program: program,
      image: this.encodedFeedbackImage,
      containedLevelResultsInfo: containedLevelResultsInfo,
      onComplete: (submit ? this.onSubmitComplete.bind(this) : this.onReportComplete.bind(this))
    });

    if (this.studioApp_.isUsingBlockly()) {
      // reenable toolbox
      Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
    }
  }.bind(this);

  var divGameLab = document.getElementById('divGameLab');
  if (!divGameLab || typeof divGameLab.toDataURL === 'undefined') { // don't try it if function is not defined
    sendReport();
  } else {
    divGameLab.toDataURL("image/png", {
      callback: function (pngDataUrl) {
        this.feedbackImage = pngDataUrl;
        this.encodedFeedbackImage = encodeURIComponent(this.feedbackImage.split(',')[1]);

        sendReport();
      }.bind(this)
    });
  }
};

WebLab.prototype.onSubmitComplete = function (response) {
  window.location.href = response.redirect;
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
WebLab.prototype.onReportComplete = function (response) {
  this.response = response;
  this.waitingForReport = false;
  this.studioApp_.onReportComplete(response);
  this.displayFeedback_();
};

/**
 * Click the run button.  Start the program.
 */
WebLab.prototype.runButtonClick = function () {
  this.studioApp_.toggleRunReset('reset');
  // document.getElementById('spinner').style.visibility = 'visible';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  this.studioApp_.attempts++;
  this.execute();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell) {
    shareCell.className = 'share-cell-enabled';
  }
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
WebLab.prototype.displayFeedback_ = function () {
  var level = this.level;

  this.studioApp_.displayFeedback({
    app: 'gamelab',
    skin: this.skin.id,
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    // feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay /* || level.impressive */),
    // impressive levels are already saved
    // alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && this.response && this.response.save_to_gallery_url,
    appStrings: {
      // reinfFeedbackMsg: msg.reinfFeedbackMsg(),
      // sharingText: msg.shareGame()
    }
  });
};

/*
WebLab.prototype.getAppReducers = function () {
  return reducers;
};
*/
