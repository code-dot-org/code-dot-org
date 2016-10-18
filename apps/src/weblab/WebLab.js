/* global dashboard */

import React from 'react';
import ReactDOM from 'react-dom';
import consoleApi from '../consoleApi';
import errorHandler from '../errorHandler';
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

  if (this.level.startSources && this.level.startSources.length > 0) {
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

  config.afterClearPuzzle = config => {
    return new Promise((resolve, reject) => {
      // Delete everything from the service and restart the initial sync
      filesApi.deleteAll((xhr, filesVersionId) => {
          this.fileEntries = null;
          // Force brambleHost to reload based on startSources
          this.brambleHost.startInitialFileSync(err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            },
            true
          );
        }, xhr => {
          console.warn(`WebLab: error deleteAll failed: ${xhr.status}`);
          reject(new Error(xhr.status));
        }
      );
    });
  };

  config.getCodeAsync = this.getCodeAsync.bind(this);

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.showInstructionsInTopPane = true;
  config.noInstructionsWhenCollapsed = true;

  config.pinWorkspaceToBottom = true;

  config.useFilesApi = true;

  this.loadFileEntries();

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
    dashboard.assets.showAssetManager(null, 'image', this.loadFileEntries.bind(this), {
      showUnderageWarning: !this.studioApp_.reduxStore.getState().pageConstants.is13Plus,
      useFilesApi: config.useFilesApi
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
};

WebLab.prototype.getCodeAsync = function () {
  return new Promise((resolve, reject) => {
    if (this.brambleHost !== null) {
      this.brambleHost.syncFiles(err => {
        // store our filesVersionId as the "sources"
        resolve(this.getCurrentFilesVersionId() || '');
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

// Called by Bramble to get the current fileEntries
WebLab.prototype.getCurrentFileEntries = function () {
  return this.fileEntries;
};

WebLab.prototype.getCurrentFilesVersionId = function () {
  return dashboard.project.filesVersionId || this.initialFilesVersionId;
};

// Called by Bramble when a file has been deleted
WebLab.prototype.deleteProjectFile = function (filename, callback) {
  filesApi.deleteFile(
    filename,
    xhr => {
      callback(null, dashboard.project.filesVersionId);
    },
    xhr => {
      console.warn(`WebLab: error file ${filename} not deleted`);
      callback(new Error(xhr.status));
    }
  );
};

// Called by Bramble when a file has been renamed
WebLab.prototype.renameProjectFile = function (filename, newFilename, callback) {
  filesApi.renameFile(
    filename,
    newFilename,
    xhr => {
      callback(null, dashboard.project.filesVersionId);
    },
    xhr => {
      console.warn(`WebLab: error file ${filename} not renamed`);
      callback(new Error(xhr.status));
    }
  );
};

// Called by Bramble when a file has been changed or created
WebLab.prototype.changeProjectFile = function (filename, fileData, callback) {
  filesApi.putFile(
    filename,
    fileData,
    xhr => {
      callback(null, dashboard.project.filesVersionId);
    },
    xhr => {
      console.warn(`WebLab: error file ${filename} not renamed`);
      callback(new Error(xhr.status));
    }
  );
};

/*
 * Called by Bramble when a file has been changed or created
 * @param {Function} hook to be called once before a filesApi write.
 *   hook should be hook(callback) and callback is callback(err)
 */
WebLab.prototype.registerBeforeFirstWriteHook = function (hook) {
  filesApi.registerBeforeFirstWriteHook(hook);
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
 * Load the file entry list and store it as this.fileEntries
 */
WebLab.prototype.loadFileEntries = function () {
  filesApi.getFiles(result => {
    assetListStore.reset(result.files);
    this.fileEntries = assetListStore.list().map(fileEntry => ({
      name: fileEntry.filename,
      url: filesApi.basePath(fileEntry.filename)
    }));
    var latestFilesVersionId = result.filesVersionId;
    this.initialFilesVersionId = this.initialFilesVersionId || latestFilesVersionId;

    if (latestFilesVersionId !== this.initialFilesVersionId) {
      // After we've detected the first change to the version, we store this
      // version id so that subsequent writes will continue to replace the
      // current version (until the browser page reloads)
      dashboard.project.filesVersionId = result.filesVersionId;
    }
    if (this.brambleHost) {
      this.brambleHost.syncFiles(() => {});
    }
  }, xhr => {
    console.error('files API failed, status: ' +  xhr.status);
    this.fileEntries = null;
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
