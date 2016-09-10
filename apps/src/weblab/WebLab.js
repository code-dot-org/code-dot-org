/* global dashboard */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import consoleApi from '../consoleApi';
import utils from '../utils';
import _ from 'lodash';
import assetPrefix from '../assetManagement/assetPrefix';
import errorHandler from '../errorHandler';
import dom from '../dom';
import experiments from '../experiments';
import WebLabView from './WebLabView';
import { Provider } from 'react-redux';

/**
 * An instantiable WebLab class
 */

// Global singleton
let webLab_ = null;

const WebLab = function () {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  consoleApi.setLogMethod(this.log.bind(this));
  errorHandler.setLogMethod(this.log.bind(this));

  // store reference to singleton
  webLab_ = this;
};

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
 * Returns the global singleton. For use by Bramble host to get the Web Lab interface.
 * Set on the window object so that Bramble host can get to it from inside its iframe.
 */
window.getWebLab = function () {
  return webLab_;
};

/**
 * Initialize this WebLab instance.  Called on page load.
 */
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

  const onMount = () => {
    this.setupReduxSubscribers(this.studioApp_.reduxStore);

    // TODO: understand if we need to call studioApp
    // Other apps call studioApp.init(). That sets up UI that is not present Web Lab (run, show code, etc) and blows up
    // if we call it. It's not clear there's anything in there we need, although we may discover there is and need to refactor it
    // this.studioApp_.init(config);
  };

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
    // temporarily, register a "change" when the preview or tutorial buttons are pressed. TODO: hook up onProjectChanged to Bramble
    this.onProjectChanged();
  }

  function onShowTutorial() {
    this.brambleHost.showTutorial();
    // temporarily, register a "change" when the preview or tutorial buttons are pressed. TODO: hook up onProjectChanged to Bramble
    this.onProjectChanged();
  }

  let inspectorOn = false;
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
  return new Promise((resolve, reject) => {
    if (this.brambleHost !== null) {
      this.brambleHost.getBrambleCode(function (code) {
        resolve(code);
      });
    } else {
      // Bramble not installed yet - we have no code to return
      resolve("");
    }
  });
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
  let state = {};
  store.subscribe(() => {
    let lastState = state;
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

export default WebLab;
