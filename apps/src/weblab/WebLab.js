'use strict';

/* global dashboard */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
// var commonMsg = require('../locale');
// var msg = require('./locale');
// var levels = require('./levels');
// var api = require('./api');
// var apiJavascript = require('./apiJavascript');
var consoleApi = require('../consoleApi');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var utils = require('../utils');
var _ = require('lodash');
var assetPrefix = require('../assetManagement/assetPrefix');
var errorHandler = require('../errorHandler');
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;
var dom = require('../dom');
var experiments = require('../experiments');

var WebLabView = require('./WebLabView');
var Provider = require('react-redux').Provider;

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
  // BUGBUG - use or remove this
  this.studioApp_.reset = this.reset.bind(this);
};

/**
 * Initialize this WebLab instance.  Called on page load.
 */

window.getWebLab = function () {
  return window.__mostRecentWebLabInstance;
};

WebLab.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("WebLab requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  // BUGBUG
  config.level.isProjectLevel = true;

  this.brambleHost = null;

  if (this.level.lastAttempt) {
    this.startSources = this.level.lastAttempt;
  } else if (this.level.startSources && this.level.startSources.length > 0) {
    try {
      this.startSources = JSON.parse(this.level.startSources);
    } catch (err) {
      console.error("Unable to parse startSources list", err);
    }
  }

  // BUGBUG use or remove this
  config.usesAssets = true;


  // BUGBUG are the below correct?
  // hide makeYourOwn on the share page
  config.makeYourOwn = false;
  config.centerEmbedded = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  config.getCodeAsync = this.getCodeAsync.bind(this);

  /*
  config.shareWarningInfo = {
    hasDataAPIs: function () {
      return this.hasDataStoreAPIs(this.studioApp_.getCode());
    }.bind(this),
    onWarningsComplete: function () {
      window.setTimeout(this.studioApp_.runButtonClick, 0);
    }.bind(this)
  };
  */

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.showInstructionsInTopPane = true;
  config.noInstructionsWhenCollapsed = true;

  var onMount = function () {
    this.setupReduxSubscribers(this.studioApp_.reduxStore);

    config.afterInject = this.afterInject_.bind(this, config);
    config.afterEditorReady = this.afterEditorReady_.bind(this, false /* breakpointsEnabled */);

    // BUGBUG
    window.Blockly = null;
    // BUGBUG should we init here? (I had it commented out)
   // this.studioApp_.init(config);

    var webEditorIFrame = document.getElementById('web-editor-iframe');
//    var webEditorWindow = webEditorIFrame.contentWindow;
//    frameSetStartSource(this.initialSource);
//    webEditorWindow.setStartSource(this.initialSource);
//    webEditorWindow.postMessage(this.initialSource, "*");
  }.bind(this);

  ReactDOM.render((
    <Provider store={this.studioApp_.reduxStore}>
      <WebLabView
        onMount={onMount}
      />
    </Provider>
  ), document.getElementById(config.containerId));

  this.studioApp_.notifyInitialRenderComplete(config);
};

WebLab.prototype.getCodeAsync = function () {
  return new Promise (function (resolve,reject) {
    if (this.brambleHost !== null) {
      this.brambleHost.getBrambleCode(function (code) {
        resolve(code);
      });
    } else {
      console.warn("getCodeAsync called before Bramble installed");
      // BUGBUG for the moment return empty string - if we return null autosave will never work
      // fix by delaying events.appInitialized until after Bramble is loaded
      resolve("");
    }
  }.bind(this));
};

WebLab.prototype.getStartSources = function () {
  return this.startSources;
};

WebLab.prototype.onProjectChanged = function () {
  // dashboard.project.projectChanged();
  // $(window).trigger('appModeChanged');
  dashboard.project.save();
};

WebLab.prototype.setBrambleHost = function (obj) {
  this.brambleHost = obj;
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
