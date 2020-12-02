import React from 'react';
import ReactDOM from 'react-dom';
import FishView from './FishView';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {setAssetPath} from '@code-dot-org/ml-activities/dist/assetPath';
import {TestResults} from '@cdo/apps/constants';
import fishMsg from './locale';

/**
 * On small mobile devices, when in portrait orientation, we show an overlay
 * image telling the user to rotate their device to landscape mode.  Because
 * the fish app is able to render at a minimum width of 480px, we set this
 * width to be somewhat larger.  We will use this width to set the viewport
 * on the mobile device, and correspondingly to scale up the overlay image to
 * properly fit on the mobile device for that viewport.
 */
const MOBILE_PORTRAIT_WIDTH = 600;

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
    this.studioApp_.initTimeSpent();

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

  setAssetPath('/blockly/media/skins/fish/');

  const {initAll} = require('@code-dot-org/ml-activities');

  // Set initial state for UI elements.
  initAll({
    canvas,
    backgroundCanvas,
    appMode: mode,
    onContinue,
    registerSound: this.studioApp_.registerAudio.bind(this.studioApp_),
    playSound: this.studioApp_.playAudio.bind(this.studioApp_),
    i18n: fishMsg
  });
};

export default Fish;
