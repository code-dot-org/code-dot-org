import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import JavalabView from './JavalabView';
import javalab, {
  getSources,
  getValidation,
  setAllSources,
  setAllValidation,
  setIsDarkMode,
  appendOutputLog,
  setBackpackApi,
  setIsStartMode,
  setLevelName,
  appendNewlineToConsoleLog,
  setIsRunning,
  setDisableFinishButton
} from './javalabRedux';
import {TestResults} from '@cdo/apps/constants';
import project from '@cdo/apps/code-studio/initApp/project';
import JavabuilderConnection from './JavabuilderConnection';
import {showLevelBuilderSaveButton} from '@cdo/apps/code-studio/header';
import Neighborhood from './Neighborhood';
import NeighborhoodVisualizationColumn from './NeighborhoodVisualizationColumn';
import TheaterVisualizationColumn from './TheaterVisualizationColumn';
import Theater from './Theater';
import {CsaViewMode, InputMessageType} from './constants';
import {DisplayTheme, getDisplayThemeFromString} from './DisplayTheme';
import BackpackClientApi from '../code-studio/components/backpack/BackpackClientApi';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '../containedLevels';
import {lockContainedLevelAnswers} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {initializeSubmitHelper, onSubmitComplete} from '../submitHelper';

/**
 * On small mobile devices, when in portrait orientation, we show an overlay
 * image telling the user to rotate their device to landscape mode.
 */
const MOBILE_PORTRAIT_WIDTH = 900;

/**
 * An instantiable Javalab class
 */

const Javalab = function() {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;
  this.miniApp = null;
  this.visualization = null;

  this.csrf_token = null;
};

/**
 * Inject the studioApp singleton.
 */
Javalab.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Initialize this Javalab instance.  Called on page load.
 */
Javalab.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('Javalab requires a StudioApp');
  }

  this.skin = config.skin;
  this.level = config.level;
  // Sets dark mode based on displayTheme user preference
  this.isDarkMode =
    getDisplayThemeFromString(config.displayTheme) === DisplayTheme.DARK;
  this.isStartMode = !!config.level.editBlocks;
  config.makeYourOwn = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;
  config.usesAssets = true;

  // We don't want icons in instructions
  config.skin.staticAvatar = null;
  config.skin.smallStaticAvatar = null;
  config.skin.failureAvatar = null;
  config.skin.winAvatar = null;

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.noInstructionsWhenCollapsed = true;

  config.pinWorkspaceToBottom = true;

  config.getCode = this.getCode.bind(this);
  config.afterClearPuzzle = this.afterClearPuzzle.bind(this);
  const onRun = this.onRun.bind(this);
  const onStop = this.onStop.bind(this);
  const onContinue = this.onContinue.bind(this);
  const onCommitCode = this.onCommitCode.bind(this);
  const onInputMessage = this.onInputMessage.bind(this);

  switch (this.level.csaViewMode) {
    case CsaViewMode.NEIGHBORHOOD:
      this.miniApp = new Neighborhood(
        this.onOutputMessage,
        this.onNewlineMessage,
        this.setIsRunning
      );
      config.afterInject = () =>
        this.miniApp.afterInject(
          this.level,
          this.skin,
          config,
          this.studioApp_
        );
      this.visualization = <NeighborhoodVisualizationColumn />;
      break;
    case CsaViewMode.THEATER:
    case CsaViewMode.PLAYGROUND:
      this.miniApp = new Theater(this.onOutputMessage, this.onNewlineMessage);
      this.visualization = <TheaterVisualizationColumn />;
      break;
  }

  const onMount = () => {
    // NOTE: Most other apps call studioApp.init(). Like WebLab, Ailab, and Fish, we don't.
    this.studioApp_.setConfigValues_(config);

    // NOTE: if we called studioApp_.init(), the code here would be executed
    // automatically since pinWorkspaceToBottom is true...
    const container = document.getElementById(config.containerId);
    const bodyElement = document.body;
    bodyElement.style.overflow = 'hidden';
    bodyElement.className = bodyElement.className + ' pin_bottom';
    container.className = container.className + ' pin_bottom';
    this.studioApp_.initTimeSpent();
    this.studioApp_.initProjectTemplateWorkspaceIconCallout();

    initializeSubmitHelper({
      studioApp: this.studioApp_,
      onPuzzleComplete: this.onContinue.bind(this),
      unsubmitUrl: config.level.unsubmitUrl
    });

    // Fixes viewport for small screens.  Also usually done by studioApp_.init().
    var viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.studioApp_.fixViewportForSpecificWidthForSmallScreens_(
        viewport,
        MOBILE_PORTRAIT_WIDTH
      );
    }

    config.afterInject?.();
  };

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    isProjectLevel: !!config.level.isProjectLevel,
    isEditingStartSources: this.isStartMode,
    isCodeReviewing: !!config.isCodeReviewing,
    isResponsive: true,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted
  });

  registerReducers({javalab});
  // If we're in editBlock mode (for editing start_sources) we set up the save button to save
  // the project file information into start_sources on the level.
  if (config.level.editBlocks) {
    config.level.lastAttempt = '';
    showLevelBuilderSaveButton(() => ({
      start_sources: getSources(getStore().getState()),
      validation: getValidation(getStore().getState())
    }));
  }

  const startSources = config.level.lastAttempt || config.level.startSources;
  const validation = config.level.validation || {};
  // if startSources exists and contains at least one key, use startSources
  if (
    startSources &&
    typeof startSources === 'object' &&
    Object.keys(startSources).length > 0
  ) {
    if (config.level.editBlocks) {
      Object.keys(startSources).forEach(key => {
        startSources[key].isValidation = false;
      });
      Object.keys(validation).forEach(key => {
        validation[key].isValidation = true;
        validation[key].isVisible = false;
      });
      getStore().dispatch(
        setAllSources({
          ...startSources,
          // If we're editing start sources, validation is part of the source
          ...(config.level.editBlocks && validation)
        })
      );
    } else {
      getStore().dispatch(setAllSources(startSources));
    }
  }

  // If we aren't editing start sources but we have validation code, we need to
  // store it in redux to check for naming conflicts
  if (
    !config.level.editBlocks &&
    validation &&
    typeof validation === 'object' &&
    Object.keys(validation).length > 0
  ) {
    getStore().dispatch(setAllValidation(validation));
  }

  // Set information about the current Javalab level being displayed.
  getStore().dispatch(setIsStartMode(this.isStartMode));
  getStore().dispatch(setLevelName(this.level.name));

  // Dispatches a redux update of isDarkMode
  getStore().dispatch(setIsDarkMode(this.isDarkMode));

  // ensure autosave is executed on first run by manually setting
  // projectChanged to true.
  project.projectChanged();

  getStore().dispatch(
    setBackpackApi(new BackpackClientApi(config.backpackChannel))
  );

  getStore().dispatch(
    setDisableFinishButton(
      !!config.readonlyWorkspace && !config.level.submittable
    )
  );

  fetch('/project_versions/get_token', {
    method: 'GET'
  }).then(response => (this.csrf_token = response.headers.get('csrf-token')));

  ReactDOM.render(
    <Provider store={getStore()}>
      <JavalabView
        onMount={onMount}
        onRun={onRun}
        onStop={onStop}
        onContinue={onContinue}
        onCommitCode={onCommitCode}
        onInputMessage={onInputMessage}
        visualization={this.visualization}
        viewMode={this.level.csaViewMode || CsaViewMode.CONSOLE}
        isProjectTemplateLevel={!!this.level.projectTemplateLevelName}
        handleClearPuzzle={() => {
          return this.studioApp_.handleClearPuzzle(config);
        }}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );

  window.addEventListener('beforeunload', this.beforeUnload.bind(this));
};

// Ensure project is saved before exiting
Javalab.prototype.beforeUnload = function(event) {
  if (project.hasOwnerChangedProject()) {
    // Manually trigger an autosave instead of waiting for the next autosave.
    project.autosave();

    event.preventDefault();
    event.returnValue = '';
  } else {
    delete event.returnValue;
  }
};

// Called by the Javalab app when it wants execute student code.
Javalab.prototype.onRun = function() {
  this.studioApp_.attempts++;
  if (this.studioApp_.hasContainedLevels) {
    lockContainedLevelAnswers();
    getStore().dispatch(setDisableFinishButton(false));
  }

  this.miniApp?.reset?.();
  const options = {};
  if (this.level.csaViewMode === CsaViewMode.NEIGHBORHOOD) {
    options.useNeighborhood = true;
  }
  this.javabuilderConnection = new JavabuilderConnection(
    this.level.javabuilderUrl,
    this.onOutputMessage,
    this.miniApp,
    getStore().getState().pageConstants.serverLevelId,
    options,
    this.onNewlineMessage,
    this.setIsRunning
  );
  project.autosave(() => {
    this.javabuilderConnection.connectJavabuilder();
  });
  postContainedLevelAttempt(this.studioApp_);
};

// Called by the Javalab app when it wants to stop student code execution
Javalab.prototype.onStop = function() {
  this.javabuilderConnection.closeConnection();
};

// Called by Javalab console to send a message to Javabuilder.
Javalab.prototype.onInputMessage = function(message) {
  this.onJavabuilderMessage(InputMessageType.SYSTEM_IN, message);
};

// Called by the console or mini apps to send a message to Javabuilder.
Javalab.prototype.onJavabuilderMessage = function(messageType, message) {
  this.javabuilderConnection.sendMessage(
    JSON.stringify({
      messageType,
      message
    })
  );
};

// Called by the Javalab app when it wants to go to the next level.
Javalab.prototype.onContinue = function(submit) {
  const onReportComplete = result => {
    this.studioApp_.onContinue();
  };
  const onComplete = submit ? onSubmitComplete : onReportComplete;

  const containedLevelResultsInfo = this.studioApp_.hasContainedLevels
    ? getContainedLevelResultInfo()
    : null;
  if (containedLevelResultsInfo) {
    runAfterPostContainedLevel(onComplete);
  } else {
    this.studioApp_.report({
      app: 'javalab',
      level: this.level.id,
      result: true,
      testResult: TestResults.ALL_PASS,
      program: '',
      submitted: submit,
      onComplete: result => {
        onComplete(result);
      }
    });
  }
};

Javalab.prototype.getCode = function() {
  const storeState = getStore().getState();
  return getSources(storeState);
};

Javalab.prototype.afterClearPuzzle = function() {
  getStore().dispatch(setAllSources(this.level.startSources));
  project.autosave();
};

Javalab.prototype.onCommitCode = function(commitNotes, onSuccessCallback) {
  project.save(true).then(result => {
    fetch('/project_versions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrf_token
      },
      body: JSON.stringify({
        storage_id: project.getCurrentId(),
        version_id: project.getCurrentSourceVersionId(),
        comment: commitNotes
      })
    }).then(() => onSuccessCallback());
  });
};

Javalab.prototype.onOutputMessage = function(message) {
  getStore().dispatch(appendOutputLog(message));
};

Javalab.prototype.onNewlineMessage = function() {
  getStore().dispatch(appendNewlineToConsoleLog());
};

Javalab.prototype.setIsRunning = function(isRunning) {
  getStore().dispatch(setIsRunning(isRunning));
};

export default Javalab;
