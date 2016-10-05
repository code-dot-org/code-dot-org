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
var filesApi = require('@cdo/apps/clientApi').files;
var assetListStore = require('../code-studio/assets/assetListStore');


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
  config.versionHistoryInInstructionsHeader = true;

  config.afterClearPuzzle = config => {
    return new Promise((resolve, reject) => {
      // Reset startSources to the original value (ignoring lastAttempt)
      try {
        this.startSources = JSON.parse(this.level.startSources);
      } catch (e) {
        this.startSources = null;
        reject(e);
        return;
      }
      // TODO: (cpirich) reload currentAssets once those are versioned

      // Force brambleHost to reload based on startSources
      this.brambleHost.loadStartSources(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  config.getCodeAsync = this.getCodeAsync.bind(this);

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.showInstructionsInTopPane = true;
  config.noInstructionsWhenCollapsed = true;

  config.pinWorkspaceToBottom = true;

  config.useFilesApi = true;

  this.loadCurrentAssets();

  const onMount = () => {
    this.setupReduxSubscribers(this.studioApp_.reduxStore);

    // TODO: understand if we need to call studioApp
    // Other apps call studioApp.init(). That sets up UI that is not present Web Lab (run, show code, etc) and blows up
    // if we call it. It's not clear there's anything in there we need, although we may discover there is and need to refactor it
    // this.studioApp_.init(config);

    // NOTE: if we called studioApp_.init(), the code here would be executed
    // automatically since pinWorkspaceToBottom is true...
    var container = document.getElementById(config.containerId);
    var bodyElement = document.body;
    bodyElement.style.overflow = "hidden";
    bodyElement.className = bodyElement.className + " pin_bottom";
    container.className = container.className + " pin_bottom";

    // NOTE: if we called studioApp_.init(), this call would not be needed...
    this.studioApp_.initVersionHistoryUI(config);
  };

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    isProjectLevel: !!config.level.isProjectLevel,
  });

  function onAddFileHTML() {
    this.brambleHost.addFileHTML();
  }

  function onAddFileCSS() {
    this.brambleHost.addFileCSS();
  }

  function onAddFileImage() {
    dashboard.assets.showAssetManager(null, 'image', this.loadCurrentAssets.bind(this), {
      showUnderageWarning: !this.studioApp_.reduxStore.getState().pageConstants.is13Plus,
      useFilesApi: true
    });
  }

  function onUndo() {
    this.brambleHost.undo();
  }

  function onRedo() {
    this.brambleHost.redo();
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
        onAddFileHTML={onAddFileHTML.bind(this)}
        onAddFileCSS={onAddFileCSS.bind(this)}
        onAddFileImage={onAddFileImage.bind(this)}
        onUndo={onUndo.bind(this)}
        onRedo={onRedo.bind(this)}
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
      this.brambleHost.syncAssets(err => {
        this.brambleHost.getBrambleCode(function (err, code) {
          if (err) {
            reject(err);
          } else {
            resolve(code);
          }
        });
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

// Called by Bramble to get the current assets
WebLab.prototype.getCurrentAssets = function () {
  return this.currentAssets;
};

WebLab.prototype.getCurrentFilesVersionId = function () {
  return dashboard.project.filesVersionId || this.initialFilesVersionId;
};

// Called by Bramble when a file has been deleted
WebLab.prototype.deleteProjectFile = function (filename, callback) {
  let queryString = '';
  if (dashboard.project.filesVersionId) {
    queryString = `?files-version=${dashboard.project.filesVersionId}`;
  }
  filesApi.ajax(
    'DELETE',
    `${filename}${queryString}`,
    (err, result) => {
      if (!err) {
        dashboard.project.filesVersionId = result.filesVersionId;
      }
      callback(err, dashboard.project.filesVersionId);
    },
    (jqXHR, textStatus, errorThrown) => {
      console.warn(`WebLab: error file ${filename} not deleted`);
      callback(errorThrown);
    }
  );
};

// Called by Bramble when a file has been renamed
WebLab.prototype.renameProjectFile = function (filename, newFilename, callback) {
  filesApi.renameFile(
    filename,
    newFilename,
    dashboard.project.filesVersionId,
    (err, result) => {
      if (!err) {
        dashboard.project.filesVersionId = result.filesVersionId;
      }
      callback(err, dashboard.project.filesVersionId);
    },
    (jqXHR, textStatus, errorThrown) => {
      console.warn(`WebLab: error file ${filename} not renamed`);
      callback(errorThrown);
    }
  );
};

// Called by Bramble when project has changed
WebLab.prototype.onProjectChanged = function () {
  // let dashboard project object know project has changed, which will trigger autosave
  dashboard.project.projectChanged();
};

// Called by Bramble host to set our reference to its interfaces
WebLab.prototype.setBrambleHost = function (obj) {
  this.brambleHost = obj;
  this.brambleHost.onProjectChanged(this.onProjectChanged.bind(this));
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

WebLab.prototype.onIsRunningChange = function () {
};

/**
 * Load the asset list and store it as this.currentAssets
 */
WebLab.prototype.loadCurrentAssets = function () {
  filesApi.ajax('GET', '', xhr => {
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(xhr.responseText);
    } catch (e) {
      console.error('assets API parse failed, error: ' + e);
      this.currentAssets = null;
      return;
    }
    assetListStore.reset(parsedResponse.files);
    this.currentAssets = assetListStore.list().map(asset => ({
      name: asset.filename,
      url: `/v3/files/${dashboard.project.getCurrentId()}/${asset.filename}`
    }));
    if (!this.initialFilesVersionId) {
      this.initialFilesVersionId = parsedResponse.filesVersionId;
    } else {
      // After the first load, we store this version id so that subsequent
      // writes will continue to replace the current version
      dashboard.project.filesVersionId = parsedResponse.filesVersionId;
    }
    if (this.brambleHost) {
      this.brambleHost.syncAssets(() => {});
    }
  }, xhr => {
    console.error('assets API failed, status: ' +  xhr.status);
    this.currentAssets = null;
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
