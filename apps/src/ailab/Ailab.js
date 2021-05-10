import React from 'react';
import ReactDOM from 'react-dom';
import AilabView from './AilabView';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {setAssetPath} from '@code-dot-org/ml-playground/dist/assetPath';
import {TestResults} from '@cdo/apps/constants';
import ailabMsg from './locale';
import $ from 'jquery';

import {
  setDynamicInstructionsDefaults,
  setDynamicInstructionsKey
} from '../redux/instructions';

/**
 * On small mobile devices, when in portrait orientation, we show an overlay
 * image telling the user to rotate their device to landscape mode.  Because
 * the ailab app is able to render at a minimum width of 480px, we set this
 * width to be somewhat larger.  We will use this width to set the viewport
 * on the mobile device, and correspondingly to scale up the overlay image to
 * properly fit on the mobile device for that viewport.
 */
const MOBILE_PORTRAIT_WIDTH = 600;

function getInstructionsDefaults() {
  var instructions = {
    selectDataset: 'Select the data set you would like to use.',
    dataDisplayLabel: 'Choose one column to predict.',
    dataDisplayFeatures:
      'Choose one or more columns as inputs to help make the prediction.',
    selectTrainer: 'Set up the training.',
    trainModel: 'Your model is being trained.',
    results: 'Review the results.',
    saveModel: 'Save the trained model for use in App Lab.',
    modelSummary:
      "You've successfully trained and saved your model. Review your model \
      details and click Finish to use your trained model in App Lab."
  };

  return instructions;
}

/**
 * An instantiable Ailab class
 */

const Ailab = function() {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;
};

/**
 * Inject the studioApp singleton.
 */
Ailab.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Initialize this Ailab instance.  Called on page load.
 */
Ailab.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('Ailab requires a StudioApp');
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

  const onMount = () => {
    // NOTE: Most other apps call studioApp.init().  Like WebLab and Fish, we don't.
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

    this.initMLActivities();
  };

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    noVisualization: true,
    visualizationInWorkspace: true,
    isProjectLevel: !!config.level.isProjectLevel
  });

  getStore().dispatch(
    setDynamicInstructionsDefaults(getInstructionsDefaults())
  );

  ReactDOM.render(
    <Provider store={getStore()}>
      <AilabView onMount={onMount} />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

// Called by the ailab app when it wants to go to the next level.
Ailab.prototype.onContinue = function() {
  const onReportComplete = result => {
    this.studioApp_.onContinue();
  };

  this.studioApp_.report({
    app: 'ailab',
    level: this.level.id,
    result: true,
    testResult: TestResults.ALL_PASS,
    program: '',
    onComplete: result => {
      onReportComplete(result);
    }
  });
};

Ailab.prototype.setInstructionsKey = function(instructionsKey) {
  getStore().dispatch(setDynamicInstructionsKey(instructionsKey));
};

Ailab.prototype.initMLActivities = function() {
  const mode = this.level.mode ? JSON.parse(this.level.mode) : null;
  const onContinue = this.onContinue.bind(this);
  const setInstructionsKey = this.setInstructionsKey.bind(this);
  const saveTrainedModel = (dataToSave, callback) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: 'POST',
        url: '/api/v1/ml_models/save',
        type: 'json',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(dataToSave)
      })
        .then(response => {
          callback(response);
          return resolve();
        })
        .fail((jqHXhr, status) => {
          callback({status: 'failure'});
          return reject();
        });
    });
  };

  setAssetPath('/blockly/media/skins/ailab/');

  const {initAll} = require('@code-dot-org/ml-playground');

  // Set initial state for UI elements.
  initAll({
    mode,
    onContinue,
    setInstructionsKey,
    i18n: ailabMsg,
    saveTrainedModel
  });
};

export default Ailab;
