import React from 'react';
import ReactDOM from 'react-dom';
import FishView from './FishView';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {
  initModel,
  constants,
  Modes,
  setState,
  setSetStateCallback,
  renderCanvas,
  UI
} from '@code-dot-org/ml-activities';
import {TestResults} from '@cdo/apps/constants';

/**
 * An instantiable Fish class
 */

const Fish = function() {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;
};

/**
 * Inject the studioApp singleton.
 */
Fish.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Initialize this WebLab instance.  Called on page load.
 */
Fish.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('Fish requires a StudioApp');
  }

  this.skin = config.skin;
  this.level = config.level;

  config.makeYourOwn = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  config.pinWorkspaceToBottom = true;

  const onMount = () => {
    // NOTE: Other apps call studioApp.init(), except WebLab. Fish is imitating WebLab
    this.studioApp_.setConfigValues_(config);

    // NOTE: if we called studioApp_.init(), the code here would be executed
    // automatically since pinWorkspaceToBottom is true...
    const container = document.getElementById(config.containerId);
    const bodyElement = document.body;
    bodyElement.style.overflow = 'hidden';
    bodyElement.className = bodyElement.className + ' pin_bottom';
    container.className = container.className + ' pin_bottom';

    this.initMLActivities();
  };

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    noVisualization: true,
    visualizationInWorkspace: true,
    isProjectLevel: !!config.level.isProjectLevel
  });

  ReactDOM.render(
    <Provider store={getStore()}>
      <FishView onMount={onMount} />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

// Called by the fish app when it wants to go to the next level.
Fish.prototype.onContinue = function() {
  const onReportComplete = result => {
    this.studioApp_.onContinue();
  };

  this.studioApp_.report({
    app: 'fish',
    level: this.level.id,
    result: true,
    testResult: TestResults.ALL_PASS,
    program: '',
    onComplete: result => {
      onReportComplete(result);
    }
  });
};

Fish.prototype.initMLActivities = function() {
  const {mode} = this.level;
  const onContinue = this.onContinue.bind(this);

  // Set up initial state
  const canvas = document.getElementById('activity-canvas');
  const backgroundCanvas = document.getElementById('background-canvas');
  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  // Set initial state for UI elements.
  const state = setState({
    currentMode: Modes.Loading,
    canvas,
    backgroundCanvas,
    appMode: mode,
    onContinue
  });

  // Initialize our first model.
  initModel(state);

  // Start the canvas renderer.  It will self-perpetute by calling
  // requestAnimationFrame on itself.
  renderCanvas();

  // Render the UI.
  renderUI();

  // And have the render UI handler be called every time state is set.
  setSetStateCallback(renderUI);
};

// Tell React to explicitly render the UI.
export const renderUI = () => {
  const renderElement = document.getElementById('container-react');
  ReactDOM.render(<UI />, renderElement);
};

export default Fish;
