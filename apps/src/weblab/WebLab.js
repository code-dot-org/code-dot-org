'use strict';

/* global dashboard */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
// var commonMsg = require('../locale');
// var msg = require('./locale');
// var levels = require('./levels');
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

  config.usesAssets = true;

  config.makeYourOwn = false;
  config.centerEmbedded = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  config.getCodeAsync = this.getCodeAsync.bind(this);

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.showInstructionsInTopPane = true;
  config.noInstructionsWhenCollapsed = true;

  var onMount = function () {
    this.setupReduxSubscribers(this.studioApp_.reduxStore);

    // BUGBUG
    window.Blockly = null;

    // BUGBUG should we init here? (I had it commented out)
   // this.studioApp_.init(config);

  }.bind(this);

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    isProjectLevel: !!config.level.isProjectLevel,
  });

  function onUndo() {
      this.brambleHost.undo();
  }

  function onRedo() {
    this.brambleHost.redo();
  }

  function onShowPreview() {
    this.brambleHost.hideTutorial();
  }

  function onShowTutorial() {
    this.brambleHost.showTutorial();
  }

  var inspectorOn = false;
  function onToggleInspector() {
    inspectorOn = !inspectorOn;
    if (inspectorOn) {
      this.brambleHost.enableInspector();
    } else {
      this.brambleHost.disableInspector();
    }
  }

  ReactDOM.render((
    <Provider store={this.studioApp_.reduxStore}>
      <WebLabView
        onUndo={onUndo.bind(this)}
        onRedo={onRedo.bind(this)}
        onShowPreview={onShowPreview.bind(this)}
        onShowTutorial={onShowTutorial.bind(this)}
        onToggleInspector={onToggleInspector.bind(this)}
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
      // Bramble not installed yet - we have no code to return
      resolve("");
    }
  }.bind(this));
};

// Called by Bramble to get source files to initialize with
WebLab.prototype.getStartSources = function () {
  return this.startSources;
};

// Called by Bramble when project has changed
WebLab.prototype.onProjectChanged = function () {
  // let dashboard project object know project has changed, which will trigger autosave
  dashboard.project.projectChanged();
};

// Called by Bramble host to set our reference to its interfaces
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
 * Reset WebLab to its initial state.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
WebLab.prototype.reset = function (ignore) {
  // TODO - implement
};
