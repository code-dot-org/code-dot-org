import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import project from '@cdo/apps/code-studio/initApp/project';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {FatalErrorType} from '@cdo/apps/weblab/constants';
import {
  DisallowedHtmlWarningDialog,
  FatalErrorDialog,
  ResetSuccessDialog,
  UploadErrorDialog,
} from '@cdo/apps/weblab/dialogs/';
import weblabI18n from '@cdo/weblab/locale';

import {getCurrentId} from '../code-studio/initApp/project';
import consoleApi from '../consoleApi';
import {TestResults} from '../constants';
import dom from '../dom';
import logToCloud from '../logToCloud';
import firehoseClient from '../metrics/firehose';
import {getStore} from '../redux';
import {initializeSubmitHelper, onSubmitComplete} from '../submitHelper';
import {reload} from '../utils';

import * as actions from './actions';
import reducers from './reducers';
import WebLabView from './WebLabView';

var filesApi = require('@cdo/apps/clientApi').files;

var assetListStore = require('../code-studio/assets/assetListStore');

export const WEBLAB_FOOTER_HEIGHT = 30;

/**
 * An instantiable WebLab class
 */

// Global singleton
let webLab_ = null;

// The max size in bytes for a WebLab project. 20 megabytes == 20971520 bytes
const MAX_PROJECT_CAPACITY = 20971520;

const WebLab = function () {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  consoleApi.setLogMethod(this.log.bind(this));
  consoleApi.setClearMethod(this.clear.bind(this));

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
 * Clear logs for both logger objects.
 */
WebLab.prototype.clear = function () {
  this.consoleLogger_.clear;
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
    throw new Error('WebLab requires a StudioApp');
  }

  this.skin = config.skin;
  this.level = config.level;
  this.suppliedFilesVersionId = queryParams('version');
  this.initialFilesVersionId = this.suppliedFilesVersionId;
  this.disallowedHtmlTags = config.disallowedHtmlTags;
  getStore().dispatch(actions.changeMaxProjectCapacity(MAX_PROJECT_CAPACITY));

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
    return new Promise((_, reject) => {
      // Delete everything from the service and restart the initial sync
      filesApi.deleteAll(
        xhr => {
          this.fileEntries = null;
          firehoseClient.putRecord(
            {
              study: 'weblab_loading_investigation',
              study_group: 'empty_manifest',
              event: 'clear_puzzle_success',
              project_id: getCurrentId(),
              data_json: JSON.stringify({
                responseText: xhr.responseText,
              }),
            },
            {includeUserId: true}
          );
          // The project has been reset, reload() the page now - don't resolve
          // the promise, because that will lead to a project.save() that we
          // don't want or need in this scenario.
          reload();
          reject(
            new Error(
              'deleteAll succeeded, weblab handling reload to avoid saving'
            )
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

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    noVisualization: true,
    visualizationInWorkspace: true,
    documentationUrl: 'https://studio.code.org/docs/weblab/',
    isProjectLevel: !!config.level.isProjectLevel,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted,
    validationEnabled: !!config.level.validationEnabled,
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
          disableAudioRecording: true,
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
    this.studioApp_.debouncedSilentlyReport(this.level.id);
    project.autosave(() => {
      if (this.brambleHost) {
        this.brambleHost.refreshPreview();
      }
    });
  }

  function onEndFullScreenPreview() {
    if (this.brambleHost) {
      this.brambleHost.disableFullscreenPreview(() => {
        getStore().dispatch(actions.changeFullScreenPreviewOn(false));
      });
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
        onStartFullScreenPreview={this.onStartFullScreenPreview.bind(this)}
        onEndFullScreenPreview={onEndFullScreenPreview.bind(this)}
        onToggleInspector={this.onToggleInspector.bind(this)}
        onMount={() => this.onMount(config)}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );

  window.addEventListener('beforeunload', this.beforeUnload.bind(this));
};

WebLab.prototype.onMount = function (config) {
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
  this.studioApp_.initTimeSpent();

  let finishButton = document.getElementById('finishButton');
  if (finishButton) {
    dom.addClickTouchEvent(finishButton, this.onFinish.bind(this, false));
  }

  initializeSubmitHelper({
    studioApp: this.studioApp_,
    onPuzzleComplete: this.onFinish.bind(this),
    unsubmitUrl: this.level.unsubmitUrl,
  });
};

WebLab.prototype.onToggleInspector = function () {
  if (this.brambleHost) {
    if (getStore().getState().inspectorOn) {
      this.brambleHost.disableInspector();
    } else {
      this.brambleHost.enableInspector();
    }
  }
};

WebLab.prototype.onStartFullScreenPreview = function () {
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
};

WebLab.prototype.beforeUnload = function (event) {
  if (project.hasOwnerChangedProject()) {
    // Manually trigger an autosave instead of waiting for the next autosave.
    project.autosave();

    event.preventDefault();
    event.returnValue = '';
  } else {
    delete event.returnValue;
  }
};

WebLab.prototype.reportResult = function (submit, validated) {
  let onComplete, testResult;

  if (validated) {
    testResult = TestResults.FREE_PLAY;
    onComplete = submit
      ? onSubmitComplete
      : this.studioApp_.onContinue.bind(this.studioApp_);
  } else {
    testResult = TestResults.FREE_PLAY_UNCHANGED_FAIL;
    onComplete = submit
      ? onSubmitComplete
      : () => {
          this.studioApp_.displayFeedback({
            feedbackType: testResult,
            level: this.level,
          });
        };
  }

  project.autosave(() => {
    this.studioApp_.report({
      app: 'weblab',
      level: this.level.id,
      result: validated,
      testResult: testResult,
      program: this.getCurrentFilesVersionId() || '',
      submitted: submit,
      onComplete: onComplete,
    });
  });
};

WebLab.prototype.onFinish = function (submit) {
  if (this.level.validationEnabled) {
    this.brambleHost.validateProjectChanged(validated =>
      this.reportResult(submit, validated)
    );
  } else {
    this.reportResult(submit, true /* validated */);
  }
};

WebLab.prototype.getCodeAsync = function () {
  return new Promise((resolve, reject) => {
    if (this.brambleHost) {
      this.syncBrambleFiles(err => {
        if (err) {
          reject(err);
        } else {
          // store our filesVersionId as the "sources"
          resolve(this.getCurrentFilesVersionId() || '');
        }
      });
    } else {
      // Bramble not installed yet - we have no code to return
      resolve('');
    }
  });
};

WebLab.prototype.prepareForRemix = function () {
  return new Promise((resolve, reject) => {
    filesApi.prepareForRemix(resolve);
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
  return project.filesVersionId || this.initialFilesVersionId;
};

// Called by Bramble when a file has been deleted
WebLab.prototype.deleteProjectFile = function (filename, callback) {
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
WebLab.prototype.renameProjectFile = function (
  filename,
  newFilename,
  callback
) {
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
WebLab.prototype.changeProjectFile = function (
  filename,
  fileData,
  callback,
  skipPreWriteHook
) {
  filesApi.putFile(
    filename,
    fileData,
    xhr => {
      callback(null, project.filesVersionId);
    },
    xhr => {
      console.warn(`WebLab: error file ${filename} not saved`);
      callback(new Error(xhr.status));
    },
    skipPreWriteHook
  );
};

/*
 * Called by Bramble when a file has been changed or created
 * @param {Function} hook to be called once before a filesApi write.
 *   hook should be hook(callback) and callback is callback(err)
 */
WebLab.prototype.registerBeforeFirstWriteHook = function (hook) {
  filesApi.registerBeforeFirstWriteHook(hook);
  filesApi.registerErrorAction(() => {
    dashboard.assets.hideAssetManager();
    this.openUploadErrorDialog();
  });
};

// Called by Bramble when project has changed
WebLab.prototype.onProjectChanged = function () {
  if (!this.readOnly) {
    // let dashboard project object know project has changed, which will trigger autosave
    project.projectChanged();
  }
};

/**
 * @returns {String} current project path (project id plus initial version)
 */
WebLab.prototype.getProjectId = function () {
  if (this.suppliedFilesVersionId) {
    return `${project.getCurrentId()}-${this.suppliedFilesVersionId}`;
  } else {
    return project.getCurrentId();
  }
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

    if (
      !lastState.runState ||
      state.runState.isRunning !== lastState.runState.isRunning
    ) {
      this.onIsRunningChange(state.runState.isRunning);
    }
  });
};

WebLab.prototype.onIsRunningChange = function () {};

WebLab.prototype.onFilesReady = function (files, filesVersionId) {
  // Gather information when the weblab manifest is empty but should
  // contain references to files (i.e. after changes have been made to the project)
  if (filesVersionId && files && files.length === 0) {
    firehoseClient.putRecord(
      {
        study: 'weblab_loading_investigation',
        study_group: 'empty_manifest',
        event: 'get_empty_manifest',
        project_id: getCurrentId(),
      },
      {includeUserId: true}
    );
  }
  assetListStore.reset(files);
  this.fileEntries = assetListStore.list().map(fileEntry => ({
    name: fileEntry.filename,
    url: filesApi.basePath(fileEntry.filename),
    versionId: fileEntry.versionId,
  }));
  this.initialFilesVersionId = this.initialFilesVersionId || filesVersionId;

  if (filesVersionId !== this.initialFilesVersionId) {
    // After we've detected the first change to the version, we store this
    // version id so that subsequent writes will continue to replace the
    // current version (until the browser page reloads)
    project.filesVersionId = filesVersionId;
  }

  this.syncBrambleFiles(this.brambleHost?.fileRefresh);
};

/**
 * Load the file entry list and store it as this.fileEntries
 */
WebLab.prototype.loadFileEntries = function () {
  filesApi.getFiles(
    result => this.onFilesReady(result.files, result.filesVersionId),
    xhr => {
      if (xhr.status === 404) {
        // No files in this project yet, proceed with an empty file
        // list and no start version id
        this.onFilesReady([], null);
      } else {
        console.error('files API failed, status: ' + xhr.status);
        this.fileEntries = null;
      }
    },
    this.getCurrentFilesVersionId()
  );
};

/**
 * Reset WebLab to its initial state.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
WebLab.prototype.reset = function (ignore) {
  // TODO - implement
};

WebLab.prototype.openFatalErrorDialog = function (
  message,
  type = FatalErrorType.Default
) {
  const handleResetProject = () => {
    this.closeDialog();
    this.brambleHost?.resetFilesystem(err => {
      if (err) {
        this.openFatalErrorDialog(err.message, FatalErrorType.ResetFailure);
      } else {
        this.openResetSuccessDialog();
        reload();
      }
    });
  };

  let errorMessage = weblabI18n.fatalError({message});
  if (type === FatalErrorType.LoadFailure) {
    errorMessage = weblabI18n.loadFailure({message});
  } else if (type === FatalErrorType.ResetFailure) {
    errorMessage = weblabI18n.resetFailure({message});
  }

  actions.openDialog(
    <FatalErrorDialog
      isOpen
      errorMessage={errorMessage}
      handleClose={this.closeDialog}
      handleResetProject={handleResetProject}
    />
  );
};

WebLab.prototype.openDisallowedHtmlDialog = function (
  filename,
  disallowedTags,
  onClose
) {
  const handleClose = () => {
    this.closeDialog();
    onClose();
  };

  actions.openDialog(
    <DisallowedHtmlWarningDialog
      isOpen
      filename={filename}
      disallowedTags={disallowedTags}
      handleClose={handleClose}
    />
  );
};

WebLab.prototype.openUploadErrorDialog = function () {
  actions.openDialog(
    <UploadErrorDialog isOpen handleClose={this.closeDialog} />
  );
};

WebLab.prototype.openResetSuccessDialog = function () {
  actions.openDialog(
    <ResetSuccessDialog isOpen handleClose={this.closeDialog} />
  );
};

WebLab.prototype.closeDialog = function () {
  actions.closeDialog();
};

WebLab.prototype.getAppReducers = function () {
  return reducers;
};

WebLab.prototype.redux = function () {
  return {
    getStore,
    reducers,
    actions,
  };
};

/**
 * Expose New Relic page action hook for use by the enclosed Bramble application.
 * Defined here instead of in CdoBramble.js because logToCloud relies on window.newrelic
 * being set. Bramble is hosted within an iframe, so window is different in that context.
 */
WebLab.prototype.addPageAction = function (...args) {
  logToCloud.addPageAction(...args);
};

// Some temporary logging to diagnose possible loading issues.
WebLab.prototype.tempLog = function (event, data = null) {
  firehoseClient.putRecord(
    {
      study: 'weblab_loading_investigation_2022',
      event: event,
      data_json: data === null ? null : JSON.stringify(data),
    },
    {includeUserId: true}
  );
};

WebLab.prototype.syncBrambleFiles = function (callback = () => {}) {
  this.brambleHost?.syncFiles(
    this.getCurrentFileEntries(),
    this.getCurrentFilesVersionId(),
    callback
  );
};

/**
 * Make brambleHost available for file sync operations as soon as it's initialized far
 * enough to start building its UI. This makes operations like "Start Over" available
 * even in cases where the mount operation throws an uncaught exception (like the missing
 * index.html error).
 * @param {Object} brambleHost
 */
WebLab.prototype.onBrambleMountable = function (brambleHost) {
  this.brambleHost = brambleHost;
};

WebLab.prototype.onBrambleReady = function () {
  if (!this.brambleHost) {
    console.error(`No brambleHost set in WebLab.`);
    return;
  }

  // Enable the Finish/Submit/Unsubmit button if it is present.
  let shareCell = document.getElementById('share-cell');
  if (shareCell) {
    shareCell.className = 'share-cell-enabled';
  }

  this.syncBrambleFiles();
};

WebLab.prototype.brambleApi = function () {
  return {
    addPageAction: this.addPageAction.bind(this),
    changeProjectFile: this.changeProjectFile.bind(this),
    deleteProjectFile: this.deleteProjectFile.bind(this),
    getCurrentFileEntries: this.getCurrentFileEntries.bind(this),
    getCurrentFilesVersionId: this.getCurrentFilesVersionId.bind(this),
    getProjectId: this.getProjectId.bind(this),
    getStartSources: this.getStartSources.bind(this),
    onBrambleMountable: this.onBrambleMountable.bind(this),
    onBrambleReady: this.onBrambleReady.bind(this),
    onProjectChanged: this.onProjectChanged.bind(this),
    openDisallowedHtmlDialog: this.openDisallowedHtmlDialog.bind(this),
    openFatalErrorDialog: this.openFatalErrorDialog.bind(this),
    registerBeforeFirstWriteHook: this.registerBeforeFirstWriteHook.bind(this),
    redux: this.redux.bind(this),
    renameProjectFile: this.renameProjectFile.bind(this),
    tempLog: this.tempLog.bind(this),
  };
};

export default WebLab;
