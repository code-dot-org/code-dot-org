/* global dashboard */

import React from 'react';
import ReactDOM from 'react-dom';
import consoleApi from '../consoleApi';
import WebLabView from './WebLabView';
import {Provider} from 'react-redux';
import weblabMsg from '@cdo/weblab/locale';
import {initializeSubmitHelper, onSubmitComplete} from '../submitHelper';
import dom from '../dom';
import reducers from './reducers';
import * as actions from './actions';
var filesApi = require('@cdo/apps/clientApi').files;
var assetListStore = require('../code-studio/assets/assetListStore');
import project from '@cdo/apps/code-studio/initApp/project';
import {getStore} from '../redux';
import {TestResults} from '../constants';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {makeEnum} from '../utils';
import logToCloud from '../logToCloud';
import firehoseClient from '../lib/util/firehose';
import {getCurrentId} from '../code-studio/initApp/project';

export const WEBLAB_FOOTER_HEIGHT = 30;

/**
 * An instantiable WebLab class
 */

// Global singleton
let webLab_ = null;

const WebLab = function() {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  consoleApi.setLogMethod(this.log.bind(this));

  // store reference to singleton
  webLab_ = this;
};

/**
 * Forward a log message to both logger objects.
 * @param {?} object
 */
WebLab.prototype.log = function(object) {
  this.consoleLogger_.log(object);
};

/**
 * Inject the studioApp singleton.
 */
WebLab.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = this.reset.bind(this);
};

/**
 * Returns the global singleton. For use by Bramble host to get the Web Lab interface.
 * Set on the window object so that Bramble host can get to it from inside its iframe.
 */
window.getWebLab = function() {
  return webLab_;
};

/**
 * Initialize this WebLab instance.  Called on page load.
 */
WebLab.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('WebLab requires a StudioApp');
  }

  this.skin = config.skin;
  this.level = config.level;
  this.suppliedFilesVersionId = queryParams('version');
  this.initialFilesVersionId = this.suppliedFilesVersionId;

  this.brambleHost = null;

  if (this.level.startSources && this.level.startSources.length > 0) {
    try {
      this.startSources = JSON.parse(this.level.startSources);
    } catch (err) {
      console.error('Unable to parse startSources list', err);
    }
  }

  config.usesAssets = true;

  config.makeYourOwn = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  config.afterClearPuzzle = config => {
    return new Promise((resolve, reject) => {
      // Delete everything from the service and restart the initial sync
      filesApi.deleteAll(
        (xhr, filesVersionId) => {
          this.fileEntries = null;
          if (!this.brambleHost) {
            reject(new Error('no bramble host'));
            return;
          }
          // Force brambleHost to reload based on startSources
          this.brambleHost.startInitialFileSync(err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }, true);
          firehoseClient.putRecord(
            {
              study: 'weblab_loading_investigation',
              study_group: 'empty_manifest',
              event: 'clear_puzzle_success',
              project_id: getCurrentId(),
              data_json: JSON.stringify({
                responseText: xhr.responseText
              })
            },
            {includeUserId: true}
          );
        },
        xhr => {
          console.warn(`WebLab: error deleteAll failed: ${xhr.status}`);
          reject(new Error(xhr.status));
        }
      );
    });
  };

  config.getCodeAsync = this.getCodeAsync.bind(this);

  config.prepareForRemix = this.prepareForRemix.bind(this);

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.noInstructionsWhenCollapsed = true;

  config.pinWorkspaceToBottom = true;

  config.useFilesApi = true;

  this.loadFileEntries();

  const onMount = () => {
    this.setupReduxSubscribers(getStore());

    // TODO: understand if we need to call studioApp
    // Other apps call studioApp.init(). That sets up UI that is not present Web Lab (run, show code, etc) and blows up
    // if we call it. It's not clear there's anything in there we need, although we may discover there is and need to refactor it
    // this.studioApp_.init(config);

    this.studioApp_.setConfigValues_(config);

    // NOTE: if we called studioApp_.init(), the code here would be executed
    // automatically since pinWorkspaceToBottom is true...
    var container = document.getElementById(config.containerId);
    var bodyElement = document.body;
    bodyElement.style.overflow = 'hidden';
    bodyElement.className = bodyElement.className + ' pin_bottom';
    container.className = container.className + ' pin_bottom';

    // NOTE: if we called studioApp_.init(), these calls would not be needed...
    this.studioApp_.initProjectTemplateWorkspaceIconCallout();
    this.studioApp_.alertIfCompletedWhilePairing(config);
    this.studioApp_.initVersionHistoryUI(config);

    let finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, this.onFinish.bind(this, false));
    }

    initializeSubmitHelper({
      studioApp: this.studioApp_,
      onPuzzleComplete: this.onFinish.bind(this),
      unsubmitUrl: this.level.unsubmitUrl
    });
  };

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    noVisualization: true,
    visualizationInWorkspace: true,
    documentationUrl: 'https://docs.code.org/weblab/',
    isProjectLevel: !!config.level.isProjectLevel,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted
  });

  this.readOnly = config.readonlyWorkspace;

  function onAddFileHTML() {
    if (this.brambleHost) {
      this.brambleHost.addFileHTML();
    }
  }

  function onAddFileCSS() {
    if (this.brambleHost) {
      this.brambleHost.addFileCSS();
    }
  }

  function onAddFileImage() {
    project.autosave(() => {
      dashboard.assets.showAssetManager(
        null,
        'image',
        this.loadFileEntries.bind(this),
        {
          showUnderageWarning: !getStore().getState().pageConstants.is13Plus,
          useFilesApi: config.useFilesApi,
          disableAudioRecording: true
        }
      );
    });
  }

  function onUndo() {
    if (this.brambleHost) {
      this.brambleHost.undo();
    }
  }

  function onRedo() {
    if (this.brambleHost) {
      this.brambleHost.redo();
    }
  }

  function onRefreshPreview() {
    project.autosave(() => {
      if (this.brambleHost) {
        this.brambleHost.refreshPreview();
      }
    });
  }

  function onStartFullScreenPreview() {
    if (this.brambleHost) {
      this.brambleHost.enableFullscreenPreview(() => {
        // We always want to disable the inspector as we enter fullscreen preview,
        // as it interferes with the preview display...
        if (getStore().getState().inspectorOn) {
          this.brambleHost.disableInspector();
        }
        getStore().dispatch(actions.changeFullScreenPreviewOn(true));
      });
    }
  }

  function onEndFullScreenPreview() {
    if (this.brambleHost) {
      this.brambleHost.disableFullscreenPreview(() => {
        getStore().dispatch(actions.changeFullScreenPreviewOn(false));
      });
    }
  }

  function onToggleInspector() {
    if (this.brambleHost) {
      if (getStore().getState().inspectorOn) {
        this.brambleHost.disableInspector();
      } else {
        this.brambleHost.enableInspector();
      }
    }
  }

  ReactDOM.render(
    <Provider store={getStore()}>
      <WebLabView
        onAddFileHTML={onAddFileHTML.bind(this)}
        onAddFileCSS={onAddFileCSS.bind(this)}
        onAddFileImage={onAddFileImage.bind(this)}
        onUndo={onUndo.bind(this)}
        onRedo={onRedo.bind(this)}
        onRefreshPreview={onRefreshPreview.bind(this)}
        onStartFullScreenPreview={onStartFullScreenPreview.bind(this)}
        onEndFullScreenPreview={onEndFullScreenPreview.bind(this)}
        onToggleInspector={onToggleInspector.bind(this)}
        onMount={onMount}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );

  window.onbeforeunload = evt => {
    if (project.hasOwnerChangedProject()) {
      return weblabMsg.confirmExitWithUnsavedChanges();
    }
  };
};

WebLab.prototype.onFinish = function(submit) {
  const onComplete = submit
    ? onSubmitComplete
    : this.studioApp_.onContinue.bind(this.studioApp_);

  project.autosave(() => {
    this.studioApp_.report({
      app: 'weblab',
      level: this.level.id,
      result: true,
      testResult: TestResults.FREE_PLAY,
      program: this.getCurrentFilesVersionId() || '',
      submitted: submit,
      onComplete: onComplete
    });
  });
};

WebLab.prototype.getCodeAsync = function() {
  return new Promise((resolve, reject) => {
    if (this.brambleHost !== null) {
      this.brambleHost.syncFiles(err => {
        // store our filesVersionId as the "sources"
        resolve(this.getCurrentFilesVersionId() || '');
      });
    } else {
      // Bramble not installed yet - we have no code to return
      resolve('');
    }
  });
};

WebLab.prototype.prepareForRemix = function() {
  return new Promise((resolve, reject) => {
    filesApi.prepareForRemix(resolve);
  });
};

// Called by Bramble to get source files to initialize with
WebLab.prototype.getStartSources = function() {
  return this.startSources;
};

// Called by Bramble to get the current fileEntries
WebLab.prototype.getCurrentFileEntries = function() {
  return this.fileEntries;
};

WebLab.prototype.getCurrentFilesVersionId = function() {
  return project.filesVersionId || this.initialFilesVersionId;
};

// Called by Bramble when a file has been deleted
WebLab.prototype.deleteProjectFile = function(filename, callback) {
  filesApi.deleteFile(
    filename,
    xhr => {
      callback(null, project.filesVersionId);
    },
    xhr => {
      console.warn(`WebLab: error file ${filename} not deleted`);
      callback(new Error(xhr.status));
    }
  );
};

// Called by Bramble when a file has been renamed
WebLab.prototype.renameProjectFile = function(filename, newFilename, callback) {
  filesApi.renameFile(
    filename,
    newFilename,
    xhr => {
      callback(null, project.filesVersionId);
    },
    xhr => {
      console.warn(`WebLab: error file ${filename} not renamed`);
      callback(new Error(xhr.status));
    }
  );
};

// Called by Bramble when a file has been changed or created
WebLab.prototype.changeProjectFile = function(filename, fileData, callback) {
  filesApi.putFile(
    filename,
    fileData,
    xhr => {
      callback(null, project.filesVersionId);
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
WebLab.prototype.registerBeforeFirstWriteHook = function(hook) {
  filesApi.registerBeforeFirstWriteHook(hook);
};

// Called by Bramble when project has changed
WebLab.prototype.onProjectChanged = function() {
  if (!this.readOnly) {
    // let dashboard project object know project has changed, which will trigger autosave
    project.projectChanged();
  }
};

// Called by Bramble when the inspector mode has changed
WebLab.prototype.onInspectorChanged = function(inspectorOn) {
  getStore().dispatch(actions.changeInspectorOn(inspectorOn));
};

/*
 * Called by Bramble host to set our reference to its interfaces
 * @param {!Object} brambleHost host interfaces
 * @return {String} current project path (project id plus initial version)
 */
WebLab.prototype.setBrambleHost = function(brambleHost) {
  // Make brambleHost available for file sync operations as soon as it's
  // initialized far enough to start building its UI.
  // This makes operations like "Start Over" available even in cases where
  // the mount operation throws an uncaught exception (like the missing
  // index.html error).
  brambleHost.onBrambleMountable(() => {
    this.brambleHost = brambleHost;
  });

  brambleHost.onBrambleReady(() => {
    brambleHost.onProjectChanged(this.onProjectChanged.bind(this));
    brambleHost.onInspectorChanged(this.onInspectorChanged.bind(this));
    // Enable the Finish/Submit/Unsubmit button if it is present:
    let shareCell = document.getElementById('share-cell');
    if (shareCell) {
      shareCell.className = 'share-cell-enabled';
    }
    this.brambleHost.syncFiles(() => {});
  });
  if (this.suppliedFilesVersionId) {
    return `${project.getCurrentId()}-${this.suppliedFilesVersionId}`;
  } else {
    return project.getCurrentId();
  }
};

// Called by Bramble host to get page constants
WebLab.prototype.getPageConstants = function() {
  return getStore().getState().pageConstants;
};

/**
 * Subscribe to state changes on the store.
 * @param {!Store} store
 */
WebLab.prototype.setupReduxSubscribers = function(store) {
  let state = {};
  store.subscribe(() => {
    let lastState = state;
    state = store.getState();

    if (
      !lastState.runState ||
      state.runState.isRunning !== lastState.runState.isRunning
    ) {
      this.onIsRunningChange(state.runState.isRunning);
    }
  });
};

WebLab.prototype.onIsRunningChange = function() {};

/**
 * Load the file entry list and store it as this.fileEntries
 */
WebLab.prototype.loadFileEntries = function() {
  filesApi.getFiles(
    result => {
      // Gather information when the weblab manifest is empty but should
      // contain references to files (i.e. after changes have been made to the project)
      if (
        result.filesVersionId &&
        result.filesVersionId !== '' &&
        result.files &&
        result.files.length === 0
      ) {
        firehoseClient.putRecord(
          {
            study: 'weblab_loading_investigation',
            study_group: 'empty_manifest',
            event: 'get_empty_manifest',
            project_id: getCurrentId()
          },
          {includeUserId: true}
        );
      }
      assetListStore.reset(result.files);
      this.fileEntries = assetListStore.list().map(fileEntry => ({
        name: fileEntry.filename,
        url: filesApi.basePath(fileEntry.filename),
        versionId: fileEntry.versionId
      }));
      var latestFilesVersionId = result.filesVersionId;
      this.initialFilesVersionId =
        this.initialFilesVersionId || latestFilesVersionId;

      if (latestFilesVersionId !== this.initialFilesVersionId) {
        // After we've detected the first change to the version, we store this
        // version id so that subsequent writes will continue to replace the
        // current version (until the browser page reloads)
        project.filesVersionId = result.filesVersionId;
      }
      if (this.brambleHost) {
        this.brambleHost.syncFiles(() => {});
      }
    },
    xhr => {
      console.error('files API failed, status: ' + xhr.status);
      this.fileEntries = null;
    },
    this.getCurrentFilesVersionId()
  );
};

/**
 * Reset WebLab to its initial state.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
WebLab.prototype.reset = function(ignore) {
  // TODO - implement
};

WebLab.prototype.getAppReducers = function() {
  return reducers;
};

/**
 * Expose New Relic page action hook for use by the enclosed Bramble application.
 */
WebLab.prototype.addPageAction = function(...args) {
  logToCloud.addPageAction(...args);
};

WebLab.prototype.PageAction = makeEnum(
  logToCloud.PageAction.BrambleError,
  logToCloud.PageAction.BrambleFilesystemResetSuccess,
  logToCloud.PageAction.BrambleFilesystemResetFailed
);

export default WebLab;
