import React from 'react';
import ReactDOM from 'react-dom';
import AilabView from './AilabView';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {setAssetPath} from '@code-dot-org/ml-playground/dist/assetPath';
import {TestResults} from '@cdo/apps/constants';
import ailabMsg from './locale';
import $ from 'jquery';
import firehoseClient from '@cdo/apps/lib/util/firehose';

import {
  setDynamicInstructionsDefaults,
  setDynamicInstructionsKey,
  setDynamicInstructionsOverlayDismissCallback
} from '../redux/instructions';

/**
 * This is used to set the viewport width in portrait mode, and will become
 * the viewport height in landscape mode.  On a 1024x768 screen in landscape
 * it will set the same viewport scale as Applab (which does it by requesting
 * 1200 pixels' width), which is roughly 0.85, since 1200 / 1024 * 768 = 900.
 */
const MOBILE_PORTRAIT_WIDTH = 900;

function getInstructionsDefaults() {
  var instructions = {
    selectDataset: 'Select the data set you would like to use.',
    uploadedDataset: 'You just uploaded a dataset.',
    selectedDataset: 'You just selected a dataset.',
    dataDisplayLabel: 'Choose one column to predict.',
    dataDisplayFeatures:
      'Choose one or more columns as inputs to help make the prediction.',
    selectedFeatureNumerical: 'You just selected a numerical feature.',
    selectedFeatureCategorical: 'You just selected a categorical feature.',
    trainModel: 'Your model is being trained.',
    generateResults: 'Your model is being tested.',
    results: 'Review the results.',
    resultsDetails: 'Details of results are being shown.',
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

Ailab.prototype.setInstructionsKey = function(instructionsKey, options) {
  getStore().dispatch(setDynamicInstructionsKey(instructionsKey, options));
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

  const logMetric = (eventName, details) => {
    firehoseClient.putRecord(
      {
        study: 'ai-ml',
        study_group: 'ai-lab',
        event: eventName,
        data_json: JSON.stringify(details)
      },
      {includeUserId: true}
    );
  };

  setAssetPath('/blockly/media/skins/ailab/');

  const {
    initAll,
    instructionsDismissed
  } = require('@code-dot-org/ml-playground');

  // Set initial state for UI elements.
  initAll({
    mode,
    onContinue,
    setInstructionsKey,
    i18n: ailabMsg,
    saveTrainedModel,
    logMetric
  });

  if (instructionsDismissed) {
    getStore().dispatch(
      setDynamicInstructionsOverlayDismissCallback(instructionsDismissed)
    );
  }
};

export default Ailab;
