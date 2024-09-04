import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {showLevelBuilderSaveButton} from '@cdo/apps/code-studio/header';
import project from '@cdo/apps/code-studio/initApp/project';
import {lockContainedLevelAnswers} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {TestResults} from '@cdo/apps/constants';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore, registerReducers} from '@cdo/apps/redux';
import javalabMsg from '@cdo/javalab/locale';

import BackpackClientApi from '../code-studio/components/backpack/BackpackClientApi';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel,
} from '../containedLevels';
import {initializeSubmitHelper, onSubmitComplete} from '../submitHelper';

import {BackpackAPIContext} from './BackpackAPIContext';
import {CsaViewMode, ExecutionType, InputMessageType} from './constants';
import {getDisplayThemeFromString} from './DisplayTheme';
import JavabuilderConnection from './JavabuilderConnection';
import JavalabView from './JavalabView';
import Neighborhood from './neighborhood/Neighborhood';
import NeighborhoodVisualizationColumn from './neighborhood/NeighborhoodVisualizationColumn';
import javalabConsole, {
  appendOutputLog,
  appendNewlineToConsoleLog,
  appendMarkdownLog,
  closePhotoPrompter,
  openPhotoPrompter,
} from './redux/consoleRedux';
import {
  getSources,
  getValidation,
  setAllSourcesAndFileMetadata,
  setAllValidation,
  setHasCompilationError,
} from './redux/editorRedux';
import javalab, {
  setIsStartMode,
  setLevelName,
  setIsRunning,
  setIsTesting,
  setBackpackEnabled,
  setIsReadOnlyWorkspace,
  setHasOpenCodeReview,
  setValidationPassed,
  setHasRunOrTestedCode,
  setIsJavabuilderConnecting,
  setIsCaptchaDialogOpen,
} from './redux/javalabRedux';
import javalabView, {setDisplayTheme} from './redux/viewRedux';
import Theater from './theater/Theater';
import TheaterVisualizationColumn from './theater/TheaterVisualizationColumn';

/**
 * On small mobile devices, when in portrait orientation, we show an overlay
 * image telling the user to rotate their device to landscape mode.
 */
const MOBILE_PORTRAIT_WIDTH = 900;

/**
 * An instantiable Javalab class
 */

const Javalab = function () {
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
Javalab.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Initialize this Javalab instance.  Called on page load.
 */
Javalab.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error('Javalab requires a StudioApp');
  }

  this.skin = config.skin;
  this.level = config.level;
  this.levelIdForAnalytics = config.serverLevelId;
  // Sets display theme based on displayTheme user preference
  this.displayTheme = getDisplayThemeFromString(config.displayTheme);
  this.isStartMode = !!config.level.editBlocks;
  this.isEditingExemplar = !!config.level.isEditingExemplar;
  this.isViewingExemplar = !!config.level.isViewingExemplar;
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
  const onTest = this.onTest.bind(this);
  const onContinue = this.onContinue.bind(this);
  const onCommitCode = this.onCommitCode.bind(this);
  const onInputMessage = this.onInputMessage.bind(this);
  const onJavabuilderMessage = this.onJavabuilderMessage.bind(this);
  const onPhotoPrompterFileSelected =
    this.onPhotoPrompterFileSelected.bind(this);

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
      this.miniApp = new Theater(
        this.onOutputMessage,
        this.onNewlineMessage,
        this.openPhotoPrompter,
        this.closePhotoPrompter,
        onJavabuilderMessage
      );
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
      unsubmitUrl: config.level.unsubmitUrl,
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
    isViewingOwnProject: !!config.isViewingOwnProject,
    isResponsive: true,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted,
    recaptchaSiteKey: config.level.recaptchaSiteKey,
  });

  registerReducers({javalab, javalabConsole, javalabView});
  // If we're in editBlock mode (for editing start_sources) we set up the save button to save
  // the project file information into start_sources on the level.
  if (this.isStartMode) {
    config.level.lastAttempt = '';
    showLevelBuilderSaveButton(() => ({
      start_sources: getSources(getStore().getState()),
      validation: getValidation(getStore().getState()),
    }));
  }
  if (this.isEditingExemplar) {
    showLevelBuilderSaveButton(
      () => ({
        exemplar_sources: getSources(getStore().getState()),
      }),
      'Levelbuilder: edit exemplar',
      `/levels/${
        getStore().getState().pageConstants.serverLevelId
      }/update_exemplar_code`
    );
  }

  const startSources = config.level.lastAttempt || config.level.startSources;
  const validation = config.level.validation || {};
  if (config.level.exemplarSources) {
    // If we have exemplar sources (either for editing or viewing), set initial sources
    // with the exemplar code saved to the level definition.
    getStore().dispatch(
      setAllSourcesAndFileMetadata(config.level.exemplarSources)
    );
  } else if (
    startSources &&
    typeof startSources === 'object' &&
    Object.keys(startSources).length > 0
  ) {
    // Otherwise, if startSources exists and contains at least one key, use startSources.

    if (this.isStartMode) {
      Object.keys(startSources).forEach(key => {
        startSources[key].isValidation = false;
      });
      Object.keys(validation).forEach(key => {
        validation[key].isValidation = true;
        validation[key].isVisible = false;
      });
      getStore().dispatch(
        setAllSourcesAndFileMetadata(
          {
            ...startSources,
            ...validation,
          },
          this.isStartMode
        )
      );
    } else {
      getStore().dispatch(setAllSourcesAndFileMetadata(startSources));
    }
  }

  // If we aren't editing start sources but we have validation code, we need to
  // store it in redux to check for naming conflicts.
  let hasValidation = false;
  if (
    !this.isStartMode &&
    validation &&
    typeof validation === 'object' &&
    Object.keys(validation).length > 0
  ) {
    hasValidation = true;
    getStore().dispatch(setAllValidation(validation));
  }

  // If validation exists and the level is not passing, validationPassed
  // should be false. Otherwise it is true.
  if (hasValidation && !config.level.isPassing) {
    getStore().dispatch(setValidationPassed(false));
  } else {
    getStore().dispatch(setValidationPassed(true));
  }

  // Set information about the current Javalab level being displayed.
  getStore().dispatch(setIsStartMode(this.isStartMode));
  getStore().dispatch(setLevelName(this.level.name));

  // For javalab, we don't use pageConstants.isReadOnlyWorkspace because
  // the readOnly state can change when a code review is opened or closed
  getStore().dispatch(setIsReadOnlyWorkspace(!!config.readonlyWorkspace));
  getStore().dispatch(setHasOpenCodeReview(!!config.hasOpenCodeReview));

  // Dispatches a redux update of display theme
  getStore().dispatch(setDisplayTheme(this.displayTheme));

  const backpackEnabled = !!config.backpackEnabled;
  getStore().dispatch(setBackpackEnabled(backpackEnabled));

  let backpackApi = null;
  if (backpackEnabled) {
    backpackApi = new BackpackClientApi(config.backpackChannel);
  }

  // Used for some post requests made in Javalab, namely
  // when providing overrideSources or commiting code.
  // Code review manages a csrf token separately.
  fetch('/project_commits/get_token', {
    method: 'GET',
  }).then(response => (this.csrf_token = response.headers.get('csrf-token')));

  ReactDOM.render(
    <Provider store={getStore()}>
      <BackpackAPIContext.Provider value={backpackApi}>
        <JavalabView
          onMount={onMount}
          onRun={onRun}
          onStop={onStop}
          onTest={onTest}
          onContinue={onContinue}
          onCommitCode={onCommitCode}
          onInputMessage={onInputMessage}
          visualization={this.visualization}
          viewMode={this.level.csaViewMode || CsaViewMode.CONSOLE}
          isProjectTemplateLevel={!!this.level.projectTemplateLevelName}
          handleClearPuzzle={() => {
            return this.studioApp_.handleClearPuzzle(config);
          }}
          onPhotoPrompterFileSelected={onPhotoPrompterFileSelected}
        />
      </BackpackAPIContext.Provider>
    </Provider>,
    document.getElementById(config.containerId)
  );

  window.addEventListener('beforeunload', this.beforeUnload.bind(this));
};

// Ensure project is saved before exiting
Javalab.prototype.beforeUnload = function (event) {
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
Javalab.prototype.onRun = function () {
  if (this.studioApp_.hasContainedLevels) {
    lockContainedLevelAnswers();
  }

  this.miniApp?.reset?.();
  analyticsReporter.sendEvent(EVENTS.JAVALAB_RUN_BUTTON_CLICK, {
    levelId: this.levelIdForAnalytics,
  });
  this.executeJavabuilder(ExecutionType.RUN);
};

Javalab.prototype.onTest = function () {
  analyticsReporter.sendEvent(EVENTS.JAVALAB_TEST_BUTTON_CLICK, {
    levelId: this.levelIdForAnalytics,
  });
  this.executeJavabuilder(ExecutionType.TEST);
};

Javalab.prototype.executeJavabuilder = function (executionType) {
  if (this.studioApp_.attempts === 0) {
    // ensure we save to S3 on the first run.
    // Javabuilder requires code to be saved to S3.
    project.projectChanged();
  }

  getStore().dispatch(setHasRunOrTestedCode(true));
  getStore().dispatch(setIsJavabuilderConnecting(true));

  this.studioApp_.attempts++;

  const options = {};
  if (this.level.csaViewMode === CsaViewMode.NEIGHBORHOOD) {
    options.useNeighborhood = true;
  }

  this.javabuilderConnection = new JavabuilderConnection(
    this.onOutputMessage,
    this.miniApp,
    getStore().getState().pageConstants.serverLevelId,
    options,
    this.onNewlineMessage,
    this.setIsRunning,
    this.setIsTesting,
    executionType,
    this.level.csaViewMode,
    getStore().getState().currentUser,
    this.onMarkdownMessage,
    this.csrf_token,
    () => this.onValidationPassed(this.studioApp_),
    () => this.onValidationFailed(this.studioApp_),
    () => getStore().dispatch(setIsJavabuilderConnecting(false)),
    () => getStore().dispatch(setIsCaptchaDialogOpen(true))
  );

  let connectToJavabuilder;
  // If in exemplar or preview mode, use the sources currently on the page
  // (as opposed to the sources saved on the backend).
  if (
    this.isEditingExemplar ||
    this.isViewingExemplar ||
    getStore().getState().pageConstants.isReadOnlyWorkspace
  ) {
    const overrideSources = getSources(getStore().getState());
    connectToJavabuilder = () =>
      this.javabuilderConnection.connectJavabuilderWithOverrideSources(
        overrideSources
      );
  } else if (this.isStartMode && executionType === ExecutionType.TEST) {
    // we only need to override validation if we are in start mode and running tests.
    const overrideValidation = getValidation(getStore().getState());
    connectToJavabuilder = () =>
      this.javabuilderConnection.connectJavabuilderWithOverrideValidation(
        overrideValidation
      );
  } else {
    connectToJavabuilder = () =>
      this.javabuilderConnection.connectJavabuilder();
  }

  project.autosave(connectToJavabuilder);
  postContainedLevelAttempt(this.studioApp_);
};

// Called by the Javalab app when it wants to stop student code execution
Javalab.prototype.onStop = function () {
  this.miniApp?.onStop?.();
  this.javabuilderConnection.closeConnection();
};

// Called by Javalab console to send a message to Javabuilder.
Javalab.prototype.onInputMessage = function (message) {
  this.onJavabuilderMessage(InputMessageType.SYSTEM_IN, message);
};

// Called by the console or mini apps to send a message to Javabuilder.
Javalab.prototype.onJavabuilderMessage = function (messageType, message) {
  this.javabuilderConnection.sendMessage(
    JSON.stringify({
      messageType,
      message,
    })
  );
};

// Called by the Javalab app when it wants to go to the next level.
Javalab.prototype.onContinue = function (submit) {
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
      },
    });
  }
};

Javalab.prototype.getCode = function () {
  const storeState = getStore().getState();
  return getSources(storeState);
};

Javalab.prototype.afterClearPuzzle = function () {
  getStore().dispatch(setAllSourcesAndFileMetadata(this.level.startSources));
  project.autosave();
};

Javalab.prototype.onCommitCode = function (commitNotes, onSuccessCallback) {
  project.save(true).then(result => {
    fetch('/project_commits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrf_token,
      },
      body: JSON.stringify({
        storage_id: project.getCurrentId(),
        version_id: project.getCurrentSourceVersionId(),
        comment: commitNotes,
      }),
    }).then(() => onSuccessCallback());
  });
};

Javalab.prototype.onOutputMessage = function (message) {
  if (message.includes(javalabMsg.compilerError())) {
    getStore().dispatch(setHasCompilationError(true));
  } else if (message.includes(javalabMsg.compilationSuccess())) {
    getStore().dispatch(setHasCompilationError(false));
  }
  getStore().dispatch(appendOutputLog(message));
};

Javalab.prototype.onNewlineMessage = function () {
  getStore().dispatch(appendNewlineToConsoleLog());
};

Javalab.prototype.setIsRunning = function (isRunning) {
  getStore().dispatch(setIsRunning(isRunning));
};

Javalab.prototype.setIsTesting = function (isTesting) {
  getStore().dispatch(setIsTesting(isTesting));
};

Javalab.prototype.openPhotoPrompter = function (promptText) {
  getStore().dispatch(openPhotoPrompter(promptText));
};

Javalab.prototype.closePhotoPrompter = function () {
  getStore().dispatch(closePhotoPrompter());
};

Javalab.prototype.onPhotoPrompterFileSelected = function (photo) {
  // Only pass the selected photo to the mini-app if it supports the photo prompter
  this.miniApp?.onPhotoPrompterFileSelected?.(photo);
};

Javalab.prototype.onMarkdownMessage = function (message) {
  getStore().dispatch(appendMarkdownLog(message));
};

Javalab.prototype.onValidationPassed = function (studioApp) {
  studioApp.report({
    app: 'javalab',
    level: this.level.id,
    result: true,
    testResult: TestResults.ALL_PASS,
    program: '',
    submitted: getStore().getState().pageConstants.isSubmitted,
    onComplete: () => {},
  });
  getStore().dispatch(setValidationPassed(true));
};

Javalab.prototype.onValidationFailed = function (studioApp) {
  studioApp.report({
    app: 'javalab',
    level: this.level.id,
    result: false,
    testResult: TestResults.APP_SPECIFIC_FAIL,
    program: '',
    submitted: getStore().getState().pageConstants.isSubmitted,
    onComplete: () => {},
  });
};

export default Javalab;
