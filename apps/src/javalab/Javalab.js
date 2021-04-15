import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '../redux';
import JavalabView from './JavalabView';
import javalab from './javalabRedux';
import {TestResults} from '@cdo/apps/constants';
import project from '@cdo/apps/code-studio/initApp/project';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {onSave} from './JavalabFileManagement';
import runCode from './javalabRunner';

/**
 * On small mobile devices, when in portrait orientation, we show an overlay
 * image telling the user to rotate their device to landscape mode.
 */
const MOBILE_PORTRAIT_WIDTH = 600;

/**
 * An instantiable Javalab class
 */

const Javalab = function() {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;
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

  config.makeYourOwn = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  // We don't want icons in instructions
  config.skin.staticAvatar = null;
  config.skin.smallStaticAvatar = null;
  config.skin.failureAvatar = null;
  config.skin.winAvatar = null;

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.noInstructionsWhenCollapsed = true;

  config.pinWorkspaceToBottom = true;

  config.useFilesApi = true;

  config.getCodeAsync = this.getCodeAsync.bind(this);
  const onRun = this.onRun.bind(this);
  const onContinue = this.onContinue.bind(this);
  const onCommitCode = this.onCommitCode.bind(this);

  // if a version is provided in the url, use that version for files.
  const suppliedFilesVersionId = queryParams('version');

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

    // Fixes viewport for small screens.  Also usually done by studioApp_.init().
    var viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.studioApp_.fixViewportForSpecificWidthForSmallScreens_(
        viewport,
        MOBILE_PORTRAIT_WIDTH
      );
    }
  };

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    noVisualization: true,
    visualizationInWorkspace: true,
    isProjectLevel: !!config.level.isProjectLevel
  });

  registerReducers({javalab});

  ReactDOM.render(
    <Provider store={getStore()}>
      <JavalabView
        onMount={onMount}
        onRun={onRun}
        onContinue={onContinue}
        onCommitCode={onCommitCode}
        suppliedFilesVersionId={suppliedFilesVersionId}
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
  runCode();
};

// Called by the Javalab app when it wants to go to the next level.
Javalab.prototype.onContinue = function() {
  const onReportComplete = result => {
    this.studioApp_.onContinue();
  };

  this.studioApp_.report({
    app: 'javalab',
    level: this.level.id,
    result: true,
    testResult: TestResults.ALL_PASS,
    program: '',
    onComplete: result => {
      onReportComplete(result);
    }
  });
};

Javalab.prototype.getCodeAsync = function() {
  return new Promise((resolve, reject) => {
    onSave(
      /* success */
      () => resolve(this.getCurrentFilesVersionId() || ''),
      /* failure - couldn't save files, don't try to overwrite any sources */
      reject
    );
  });
};

Javalab.prototype.getCurrentFilesVersionId = function() {
  return project.filesVersionId;
};

Javalab.prototype.onCommitCode = function() {
  project.autosave();
};

export default Javalab;
