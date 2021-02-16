import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '../redux';
import IdelabView from './IdelabView';
import idelab from './idelabRedux';
import {TestResults} from '@cdo/apps/constants';

/**
 * On small mobile devices, when in portrait orientation, we show an overlay
 * image telling the user to rotate their device to landscape mode.  Because
 * the ailab app is able to render at a minimum width of 480px, we set this
 * width to be somewhat larger.  We will use this width to set the viewport
 * on the mobile device, and correspondingly to scale up the overlay image to
 * properly fit on the mobile device for that viewport.
 */
const MOBILE_PORTRAIT_WIDTH = 600;

/**
 * An instantiable Idelab class
 */

const Idelab = function() {
  this.skin = null;
  this.level = null;

  /** @type {StudioApp} */
  this.studioApp_ = null;
};

/**
 * Inject the studioApp singleton.
 */
Idelab.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Initialize this Idelab instance.  Called on page load.
 */
Idelab.prototype.init = function(config) {
  console.log('in init');
  if (!this.studioApp_) {
    throw new Error('Idelab requires a StudioApp');
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
    console.log('in on Mount');
    // NOTE: Most other apps call studioApp.init().  Like WebLab and Fish, we don't.
    this.studioApp_.setConfigValues_(config);

    // NOTE: if we called studioApp_.init(), the code here would be executed
    // automatically since pinWorkspaceToBottom is true...
    const container = document.getElementById(config.containerId);
    console.log(`container id is ${config.containerId}`);
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

  registerReducers({idelab});

  ReactDOM.render(
    <Provider store={getStore()}>
      <IdelabView onMount={onMount} />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

// Called by the Idelab app when it wants to go to the next level.
Idelab.prototype.onContinue = function() {
  const onReportComplete = result => {
    this.studioApp_.onContinue();
  };

  this.studioApp_.report({
    app: 'idelab',
    level: this.level.id,
    result: true,
    testResult: TestResults.ALL_PASS,
    program: '',
    onComplete: result => {
      onReportComplete(result);
    }
  });
};

export default Idelab;
