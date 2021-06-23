/* global Blockly, droplet */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {EventEmitter} from 'events';
import _ from 'lodash';
import url from 'url';
import {Provider} from 'react-redux';
import trackEvent from './util/trackEvent';

// Make sure polyfills are available in all code studio apps and level tests.
import './polyfills';
import * as aceMode from './acemode/mode-javascript_codeorg';
import * as assetPrefix from './assetManagement/assetPrefix';
import * as assets from './code-studio/assets';
import * as blockUtils from './block_utils';
var codegen = require('./lib/tools/jsinterpreter/codegen');
import * as dom from './dom';
import * as dropletUtils from './dropletUtils';
import * as shareWarnings from './shareWarnings';
import * as utils from './utils';
import AbuseError from './code-studio/components/AbuseError';
import Alert from './templates/alert';
import AuthoredHints from './authoredHints';
import ChallengeDialog from './templates/ChallengeDialog';
import DialogButtons from './templates/DialogButtons';
import DialogInstructions from './templates/instructions/DialogInstructions';
import DropletTooltipManager from './blockTooltips/DropletTooltipManager';
import FeedbackUtils from './feedback';
import InstructionsDialogWrapper from './templates/instructions/InstructionsDialogWrapper';
import SmallFooter from './code-studio/components/SmallFooter';
import Sounds from './Sounds';
import VersionHistory from './templates/VersionHistory';
import WireframeButtons from './lib/ui/WireframeButtons';
import annotationList from './acemode/annotationList';
import color from './util/color';
import firehoseClient from './lib/util/firehose';
import getAchievements from './achievements';
import logToCloud from './logToCloud';
import msg from '@cdo/locale';
import project from './code-studio/initApp/project';
import puzzleRatingUtils from './puzzleRatingUtils';
import userAgentParser from './code-studio/initApp/userAgentParser';
import {
  KeyCodes,
  TestResults,
  TOOLBOX_EDIT_MODE,
  NOTIFICATION_ALERT_TYPE
} from './constants';
import {assets as assetsApi} from './clientApi';
import {
  configCircuitPlayground,
  configMicrobit
} from './lib/kits/maker/dropletConfig';
import {closeDialog as closeInstructionsDialog} from './redux/instructionsDialog';
import {getStore} from './redux';
import {getValidatedResult, initializeContainedLevel} from './containedLevels';
import {lockContainedLevelAnswers} from './code-studio/levels/codeStudioLevels';
import {parseElement as parseXmlElement} from './xml';
import {resetAniGif} from '@cdo/apps/utils';
import {setIsRunning, setIsEditWhileRun, setStepSpeed} from './redux/runState';
import {isEditWhileRun} from './lib/tools/jsdebugger/redux';
import {setPageConstants} from './redux/pageConstants';
import {setVisualizationScale} from './redux/layout';
import {createLibraryClosure} from '@cdo/apps/code-studio/components/libraries/libraryParser';
import {
  setAchievements,
  setBlockLimit,
  setFeedbackData,
  showFeedback
} from './redux/feedback';
import experiments from '@cdo/apps/util/experiments';
import {
  determineInstructionsConstants,
  setInstructionsConstants,
  setFeedback
} from './redux/instructions';
import {addCallouts} from '@cdo/apps/code-studio/callouts';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {RESIZE_VISUALIZATION_EVENT} from './lib/ui/VisualizationResizeBar';
import {userAlreadyReportedAbuse} from '@cdo/apps/reportAbuse';
import {setArrowButtonDisabled} from '@cdo/apps/templates/arrowDisplayRedux';
import {workspace_running_background, white} from '@cdo/apps/util/color';
import WorkspaceAlert from '@cdo/apps/code-studio/components/WorkspaceAlert';
var copyrightStrings;

/**
 * The minimum width of a playable whole blockly game.
 */
var MIN_WIDTH = 1200;
var DEFAULT_MOBILE_NO_PADDING_SHARE_WIDTH = 400;
var MAX_VISUALIZATION_WIDTH = 400;
var MIN_VISUALIZATION_WIDTH = 200;

/**
 * Treat mobile devices with screen.width less than the value below as phones.
 */
var MAX_PHONE_WIDTH = 500;

class StudioApp extends EventEmitter {
  constructor() {
    super();
    this.feedback_ = new FeedbackUtils(this);
    this.authoredHintsController_ = new AuthoredHints(this);

    /**
     * The parent directory of the apps. Contains common.js.
     */
    this.BASE_URL = undefined;

    this.enableShowCode = true;
    this.editCode = false;
    this.usingBlockly_ = true;

    /**
     * @type {?Droplet.Editor}
     */
    this.editor = null;
    /**
     * @type {?DropletTooltipManager}
     */
    this.dropletTooltipManager = null;

    // @type {string} for all of these
    this.icon = undefined;
    this.winIcon = undefined;
    this.failureIcon = undefined;

    // The following properties get their non-default values set by the application.

    /**
     * Whether to alert user to empty blocks, short-circuiting all other tests.
     * @member {boolean}
     */
    this.checkForEmptyBlocks_ = false;

    /**
     * The ideal number of blocks to solve this level.  Users only get 2
     * stars if they use more than this number.
     * @type {number}
     */
    this.IDEAL_BLOCK_NUM = undefined;

    /**
     * @type {!TestableBlock[]}
     */
    this.requiredBlocks_ = [];

    /**
     * The number of required blocks to give hints about at any one time.
     * Set this to Infinity to show all.
     * @type {number}
     */
    this.maxRequiredBlocksToFlag_ = 1;

    /**
     * @type {!TestableBlock[]}
     */
    this.recommendedBlocks_ = [];

    /**
     * The number of recommended blocks to give hints about at any one time.
     * Set this to Infinity to show all.
     * @type {number}
     */
    this.maxRecommendedBlocksToFlag_ = 1;

    /**
     * The number of attempts (how many times the run button has been pressed)
     * @type {?number}
     */
    this.attempts = 0;

    /**
     * Stores the time at init. The delta to current time is used for logging
     * and reporting to capture how long it took to arrive at an attempt.
     * @type {?number}
     */
    this.initTime = undefined;

    /**
     * The time the last milestone was recorded. Used for recording the time a
     * student has spent on a level.
     * @type {?number}
     */
    this.milestoneStartTime = undefined;

    /**
     * Whether we've reported a milestone yet for this run/reset cycle
     * @type {boolean}
     */
    this.hasReported = false;

    /**
     * If true, we don't show blockspace. Used when viewing shared levels
     */
    this.hideSource = false;

    /**
     * If true, we're viewing a shared level.
     */
    this.share = false;

    this.onAttempt = undefined;
    this.onContinue = undefined;
    this.onResetPressed = undefined;
    this.backToPreviousLevel = undefined;
    this.isUS = undefined;
    this.enableShowBlockCount = true;

    this.disableSocialShare = false;
    this.noPadding = false;

    this.MIN_WORKSPACE_HEIGHT = undefined;

    /**
     * Levelbuilder-defined helper libraries.
     */
    this.libraries = {};

    /*
     * Stores the alert that appears if the user edits code while its running. It will be unmounted and set to undefined on reset.
     */
    this.editDuringRunAlert = undefined;

    /*
     * Stores whether we should display the alert above. Will be set to false and stored in localStorage if the user has already dismissed this alert.
     */
    this.showEditDuringRunAlert = true;

    /*
     * Stores the code at run. It's undefined if the code is not running.
     */
    this.executingCode = undefined;
  }
}
/**
 * Configure StudioApp options
 */
StudioApp.prototype.configure = function(options) {
  this.BASE_URL = options.baseUrl;
  // NOTE: editCode (which currently implies droplet) and usingBlockly_ are
  // currently mutually exclusive.
  this.editCode = options.level && options.level.editCode;
  this.usingBlockly_ = !this.editCode;

  if (options.isEditorless) {
    this.editCode = false;
    this.usingBlockly_ = false;
  }

  // Bind assetUrl to the instance so that we don't need to depend on callers
  // binding correctly as they pass this function around.
  this.assetUrl = _.bind(this.assetUrl_, this);

  this.maxVisualizationWidth =
    options.maxVisualizationWidth || MAX_VISUALIZATION_WIDTH;
  this.minVisualizationWidth =
    options.minVisualizationWidth || MIN_VISUALIZATION_WIDTH;

  // Set default speed
  if (options.level) {
    getStore().dispatch(setStepSpeed(options.level.sliderSpeed));
  }
};

/**
 * @param {AppOptionsConfig}
 */
StudioApp.prototype.hasInstructionsToShow = function(config) {
  return !!(
    config.level.shortInstructions ||
    config.level.longInstructions ||
    config.level.aniGifURL
  );
};

/**
 * Given the studio app config object, show shared app warnings.
 */
function showWarnings(config) {
  shareWarnings.checkSharedAppWarnings({
    channelId: config.channel,
    isSignedIn: config.isSignedIn,
    isTooYoung: config.isTooYoung,
    isOwner: project.isOwner(),
    hasDataAPIs: config.shareWarningInfo.hasDataAPIs,
    onWarningsComplete: config.shareWarningInfo.onWarningsComplete,
    onTooYoung: config.shareWarningInfo.onTooYoung
  });
}

/**
 * Common startup tasks for all blockly and droplet apps. Happens
 * after configure.
 * @param {AppOptionsConfig}
 */
StudioApp.prototype.init = function(config) {
  if (!config) {
    config = {};
  }
  this.config = config;

  this.hasContainedLevels = config.hasContainedLevels;

  config.getCode = this.getCode.bind(this);
  copyrightStrings = config.copyrightStrings;

  if (config.legacyShareStyle && config.hideSource) {
    $('body').addClass('legacy-share-view');
    if (dom.isMobile()) {
      $('body').addClass('legacy-share-view-mobile');
      $('#main-logo').hide();
    }
  }

  this.setConfigValues_(config);

  this.configureDom(config);

  if (!config.level.iframeEmbedAppAndCode) {
    ReactDOM.render(
      <Provider store={getStore()}>
        <div>
          <InstructionsDialogWrapper
            showInstructionsDialog={autoClose => {
              this.showInstructionsDialog_(config.level, autoClose);
            }}
          />
        </div>
      </Provider>,
      document.body.appendChild(document.createElement('div'))
    );
  }

  if (config.usesAssets && config.channel) {
    assetPrefix.init(config);

    // Pre-populate asset list
    assetsApi.getFiles(
      result => {
        assets.listStore.reset(result.files);
      },
      xhr => {
        // Unable to load asset list
      }
    );
  }

  if (config.hideSource) {
    this.handleHideSource_({
      containerId: config.containerId,
      embed: config.embed,
      level: config.level,
      noHowItWorks: config.noHowItWorks,
      isLegacyShare: config.isLegacyShare,
      legacyShareStyle: config.legacyShareStyle,
      wireframeShare: config.wireframeShare
    });
  }

  if (config.level.iframeEmbedAppAndCode) {
    StudioApp.prototype.handleIframeEmbedAppAndCode_({
      containerId: config.containerId,
      embed: config.embed,
      level: config.level,
      noHowItWorks: config.noHowItWorks,
      isLegacyShare: config.isLegacyShare,
      legacyShareStyle: config.legacyShareStyle,
      wireframeShare: config.wireframeShare
    });
  }

  if (config.share) {
    this.handleSharing_({
      makeUrl: config.makeUrl,
      makeString: config.makeString,
      makeImage: config.makeImage,
      makeYourOwn: config.makeYourOwn
    });
  }

  if (!config.level.iframeEmbedAppAndCode) {
    const hintsUsedIds = utils.valueOr(config.authoredHintsUsedIds, []);
    this.authoredHintsController_.init(
      config.level.authoredHints,
      hintsUsedIds,
      config.scriptId,
      config.serverLevelId
    );
  }
  if (config.authoredHintViewRequestsUrl && config.isSignedIn) {
    this.authoredHintsController_.submitHints(
      config.authoredHintViewRequestsUrl
    );
  }

  if (config.puzzleRatingsUrl) {
    puzzleRatingUtils.submitCachedPuzzleRatings(config.puzzleRatingsUrl);
  }

  // Record time at initialization.
  this.initTime = new Date().getTime();
  this.initTimeSpent();

  // Fixes viewport for small screens.
  var viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    this.fixViewportForSmallScreens_(viewport, config);
  }

  var blockCount = document.getElementById('blockCounter');
  if (blockCount && !this.enableShowBlockCount) {
    blockCount.style.display = 'none';
  }

  this.setIconsFromSkin(config.skin);

  if (config.level.instructionsIcon) {
    this.icon = config.skin[config.level.instructionsIcon];
    this.winIcon = config.skin[config.level.instructionsIcon];
  }

  if (config.showInstructionsWrapper) {
    config.showInstructionsWrapper(() => {});
  }

  var orientationHandler = function() {
    window.scrollTo(0, 0); // Browsers like to mess with scroll on rotate.
  };
  window.addEventListener('orientationchange', orientationHandler);
  orientationHandler();

  if (config.loadAudio) {
    config.loadAudio();
  }

  if (this.editCode) {
    this.handleEditCode_(config);
  }

  if (this.isUsingBlockly()) {
    this.handleUsingBlockly_(config);
  } else {
    // handleUsingBlockly_ already does an onResize. We still want that goodness
    // if we're not blockly
    utils.fireResizeEvent();
  }

  this.alertIfAbusiveProject();
  this.alertIfProfaneOrPrivacyViolatingProject();

  // make sure startIFrameEmbeddedApp has access to the config object
  // so it can decide whether or not to show a warning.
  this.startIFrameEmbeddedApp = this.startIFrameEmbeddedApp.bind(this, config);

  // config.shareWarningInfo is set on a per app basis (in applab and gamelab)
  // shared apps that are embedded in an iframe handle warnings in
  // startIFrameEmbeddedApp since they don't become "active" until the user
  // clicks on them.
  if (config.shareWarningInfo && !config.level.iframeEmbed) {
    showWarnings(config);
  }

  this.initProjectTemplateWorkspaceIconCallout();

  this.alertIfCompletedWhilePairing(config);

  // If we are in a non-english locale using our english-specific app
  // (the Spelling Bee), display a warning.
  if (config.locale !== 'en_us' && config.skinId === 'letters') {
    this.displayWorkspaceAlert(
      'error',
      <div>
        {msg.englishOnlyWarning({nextStage: config.lessonPosition + 1})}
      </div>
    );
  }

  window.addEventListener('resize', this.onResize.bind(this));
  window.addEventListener(RESIZE_VISUALIZATION_EVENT, e => {
    this.resizeVisualization(e.detail);
  });

  this.reset(true);

  // Add display of blocks used.
  this.setIdealBlockNumber_();

  // TODO (cpirich): implement block count for droplet (for now, blockly only)
  if (this.isUsingBlockly()) {
    Blockly.mainBlockSpaceEditor.addUnusedBlocksHelpListener(function(e) {
      utils.showUnusedBlockQtip(e.target);
    });
    // Store result so that we can cleanup later in tests
    this.changeListener = Blockly.mainBlockSpaceEditor.addChangeListener(
      _.bind(function() {
        this.updateBlockCount();
      }, this)
    );

    if (config.level.openFunctionDefinition) {
      this.openFunctionDefinition_(config);
    }
  }

  // Bind listener to 'Clear Puzzle' button
  var hideIcon = utils.valueOr(config.skin.hideIconInClearPuzzle, false);
  var clearPuzzleHeader = document.getElementById('clear-puzzle-header');
  if (clearPuzzleHeader) {
    dom.addClickTouchEvent(
      clearPuzzleHeader,
      function() {
        this.feedback_.showClearPuzzleConfirmation(
          hideIcon,
          function() {
            this.handleClearPuzzle(config);
          }.bind(this)
        );
      }.bind(this)
    );
  }

  this.initVersionHistoryUI(config);

  if (this.isUsingBlockly() && Blockly.contractEditor) {
    Blockly.contractEditor.registerTestsFailedOnCloseHandler(
      function() {
        this.feedback_.showSimpleDialog({
          headerText: undefined,
          bodyText: msg.examplesFailedOnClose(),
          cancelText: msg.ignore(),
          confirmText: msg.tryAgain(),
          onConfirm: null,
          onCancel: function() {
            Blockly.contractEditor.hideIfOpen();
          }
        });

        // return true to indicate to blockly-core that we'll own closing the
        // contract editor
        return true;
      }.bind(this)
    );
  }

  if (config.legacyShareStyle && config.hideSource) {
    this.setupLegacyShareView();
  }

  initializeContainedLevel();

  if (config.isChallengeLevel) {
    const startDialogDiv = document.createElement('div');
    document.body.appendChild(startDialogDiv);
    const progress = getStore().getState().progress;
    const isComplete =
      progress.levelResults[progress.currentLevelId] >=
      TestResults.MINIMUM_OPTIMAL_RESULT;
    ReactDOM.render(
      <ChallengeDialog
        isOpen={true}
        avatar={this.icon}
        handleCancel={() => {
          this.skipLevel();
        }}
        cancelButtonLabel={msg.challengeLevelSkip()}
        complete={isComplete}
        isIntro={true}
        primaryButtonLabel={msg.challengeLevelStart()}
        text={msg.challengeLevelIntro()}
        title={msg.challengeLevelTitle()}
      />,
      startDialogDiv
    );
  }

  if (!config.readonlyWorkspace) {
    this.addChangeHandler(this.editDuringRunAlertHandler.bind(this));
  }

  this.emit('afterInit');
};

/*
 * If the code has changed (other than whitespace at the beginning or end) and the code is running,
 * tell redux the code has changed, disable block highlighting, and conditionally display an alert.
 * Note: We trim the whitespace because droplet sometimes adds an extra newline when switching from block to code mode.
 */
StudioApp.prototype.editDuringRunAlertHandler = function() {
  const hasEditedDuringRun =
    this.isRunning() && this.getCode().trim() !== this.executingCode.trim();
  if (!hasEditedDuringRun || this.editDuringRunAlert !== undefined) {
    return;
  }

  getStore().dispatch(setIsEditWhileRun(true));
  this.clearHighlighting();

  // Check if the user has already dismissed this alert. Don't check localStorage again
  // if showEditDuringRunAlert has already been set to false.
  if (this.showEditDuringRunAlert) {
    this.showEditDuringRunAlert =
      utils.tryGetLocalStorage('hideEditDuringRunAlert', null) === null;
  }

  // Display the alert if the user hasn't previously dismissed it.
  if (this.showEditDuringRunAlert) {
    const onClose = () => {
      utils.trySetLocalStorage('hideEditDuringRunAlert', true);
      this.editDuringRunAlert = undefined;
      this.showEditDuringRunAlert = false;
    };
    this.editDuringRunAlert = this.displayWorkspaceAlert(
      'warning',
      React.createElement('div', {}, msg.editDuringRunMessage()),
      true /* bottom */,
      onClose
    );
  }
};

StudioApp.prototype.initProjectTemplateWorkspaceIconCallout = function() {
  if (getStore().getState().pageConstants.showProjectTemplateWorkspaceIcon) {
    // The callouts can't appear until the DOM is 100% rendered by react. The
    // safest method is to kick off a requestAnimationFrame from an async
    // setTimeout()
    setTimeout(() => {
      requestAnimationFrame(() => {
        addCallouts([
          {
            id: 'projectTemplateWorkspaceIconCallout',
            element_id: '.projectTemplateWorkspaceIcon:visible',
            localized_text: msg.workspaceProjectTemplateLevel(),
            qtip_config: {
              position: {
                my: 'top center',
                at: 'bottom center'
              }
            }
          }
        ]);
      });
    }, 0);
  }
};

StudioApp.prototype.alertIfCompletedWhilePairing = function(config) {
  if (!!config.level.pairingDriver) {
    this.displayWorkspaceAlert(
      'warning',
      <div>
        {msg.pairingNavigatorWarning({driver: config.level.pairingDriver})}{' '}
        {config.level.pairingAttempt && (
          <a href={config.level.pairingAttempt}>{msg.pairingNavigatorLink()}</a>
        )}
        {config.level.pairingChannelId && (
          <a href={project.getPathName('view', config.level.pairingChannelId)}>
            {msg.pairingNavigatorLink()}
          </a>
        )}
      </div>
    );
  }
};

StudioApp.prototype.getVersionHistoryHandler = function(config) {
  return () => {
    var contentDiv = document.createElement('div');
    var dialog = this.createModalDialog({
      contentDiv: contentDiv,
      defaultBtnSelector: 'again-button',
      id: 'showVersionsModal'
    });
    ReactDOM.render(
      React.createElement(VersionHistory, {
        handleClearPuzzle: this.handleClearPuzzle.bind(this, config),
        isProjectTemplateLevel: !!config.level.projectTemplateLevelName,
        useFilesApi: !!config.useFilesApi
      }),
      contentDiv
    );

    dialog.show();
  };
};

StudioApp.prototype.initTimeSpent = function() {
  this.milestoneStartTime = new Date().getTime();
  this.debouncedSilentlyReport = _.debounce(
    this.silentlyReport.bind(this),
    1000
  );
};

StudioApp.prototype.initVersionHistoryUI = function(config) {
  // Bind listener to 'Version History' button
  var versionsHeader = document.getElementById('versions-header');
  if (versionsHeader) {
    dom.addClickTouchEvent(
      versionsHeader,
      this.getVersionHistoryHandler(config)
    );
  }
};

StudioApp.prototype.startIFrameEmbeddedApp = function(config, onTooYoung) {
  if (this.share && config.shareWarningInfo) {
    config.shareWarningInfo.onTooYoung = onTooYoung;
    showWarnings(config);
  } else {
    this.runButtonClick();
  }
};

/**
 * Create a phone frame and container. Scale shared content (everything currently inside the visualization column)
 * to container width, fit container to the phone frame and add share footer.
 */
StudioApp.prototype.setupLegacyShareView = function() {
  var vizContainer = document.createElement('div');
  vizContainer.id = 'visualizationContainer';
  var vizColumn = document.getElementById('visualizationColumn');
  if (dom.isMobile()) {
    $(vizContainer).width($(vizColumn).width());
  }
  $(vizContainer).append(vizColumn.children);

  var phoneFrameScreen = document.createElement('div');
  phoneFrameScreen.id = 'phoneFrameScreen';
  $(phoneFrameScreen).append(vizContainer);
  $(vizColumn).append(phoneFrameScreen);

  this.renderShareFooter_(phoneFrameScreen);
  if (dom.isMobile) {
    // re-scale on resize events to adjust to orientation and navbar changes
    $(window).resize(this.scaleLegacyShare);
  }
  this.scaleLegacyShare();
};

StudioApp.prototype.scaleLegacyShare = function() {
  var vizContainer = document.getElementById('visualizationContainer');
  var vizColumn = document.getElementById('visualizationColumn');
  var phoneFrameScreen = document.getElementById('phoneFrameScreen');
  var vizWidth = $(vizContainer).width();

  // On mobile, scale up phone frame to full screen (portrait) as needed.
  // Otherwise use given dimensions from css.
  if (dom.isMobile()) {
    const {clientHeight, clientWidth} = document.documentElement;
    const screenWidth = Math.min(clientHeight, clientWidth);
    const screenHeight = Math.max(clientWidth, clientHeight);
    // Choose the larger of the document client size and the existing
    // phoneFrameScreen size:
    const newWidth = Math.max(screenWidth, $(phoneFrameScreen).width());
    const newHeight = Math.max(screenHeight, $(phoneFrameScreen).height());

    $(phoneFrameScreen).width(newWidth);
    $(phoneFrameScreen).height(newHeight);
    $(vizColumn).width(newWidth);
  }

  var frameWidth = $(phoneFrameScreen).width();
  var scale = frameWidth / vizWidth;
  if (scale !== 1) {
    applyTransformOrigin(vizContainer, 'left top');
    applyTransformScale(vizContainer, 'scale(' + scale + ')');
  }
};

StudioApp.prototype.getCode = function() {
  if (!this.editCode) {
    return codegen.workspaceCode(Blockly);
  }
  if (this.hideSource) {
    return this.startBlocks_;
  } else {
    return this.editor.getValue();
  }
};

StudioApp.prototype.setIconsFromSkin = function(skin) {
  this.icon = skin.staticAvatar;
  this.winIcon = skin.winAvatar;
  this.failureIcon = skin.failureAvatar;
};

/**
 * Reset the puzzle back to its initial state.
 * Search aliases: "Start Over", startOver
 * @param {AppOptionsConfig}- same config object passed to studioApp.init().
 * @return {Promise} to express that the async operation is complete.
 */
StudioApp.prototype.handleClearPuzzle = function(config) {
  var promise;
  if (this.isUsingBlockly()) {
    if (Blockly.functionEditor) {
      Blockly.functionEditor.hideIfOpen();
    }
    Blockly.mainBlockSpace.clear();
    this.setStartBlocks_(config, false);
    if (config.level.openFunctionDefinition) {
      this.openFunctionDefinition_(config);
    }
  } else if (this.editCode) {
    var resetValue = '';
    if (config.level.startBlocks) {
      // Don't pass CRLF pairs to droplet until they fix CR handling:
      resetValue = config.level.startBlocks.replace(/\r\n/g, '\n');
    }
    // This getValue() call is a workaround for a Droplet bug,
    // See https://github.com/droplet-editor/droplet/issues/137
    // Calling getValue() updates the cached ace editor value, which can be
    // out-of-date in droplet and cause an incorrect early-out.
    // Could remove this line once that bug is fixed and Droplet is updated.
    this.editor.getValue();
    this.editor.setValue(resetValue);

    annotationList.clearRuntimeAnnotations();
  }
  if (config.afterClearPuzzle) {
    promise = config.afterClearPuzzle(config);
  }
  if (!promise) {
    // If a promise wasn't returned from config.afterClearPuzzle(), we create
    // on here that returns immediately since the operation must have completed
    // synchronously.
    promise = new Promise(function(resolve, reject) {
      resolve();
    });
  }
  return promise;
};

/**
 * TRUE if the current app uses blockly (as opposed to editCode or another
 * editor)
 * @return {boolean}
 */
StudioApp.prototype.isUsingBlockly = function() {
  return this.usingBlockly_;
};

/**
 *
 */
StudioApp.prototype.handleSharing_ = function(options) {
  // 1. Move the buttons, 2. Hide the slider in the share page for mobile.
  var belowVisualization = document.getElementById('belowVisualization');
  if (dom.isMobile()) {
    var sliderCell = document.getElementById('slider-cell');
    if (sliderCell) {
      sliderCell.style.display = 'none';
    }
    if (belowVisualization) {
      var visualization = document.getElementById('visualization');
      belowVisualization.style.display = 'none';
      visualization.style.marginBottom = '0px';
    }
  }

  // Show flappy upsale on desktop and mobile.  Show learn upsale only on desktop
  var upSale = document.createElement('div');
  if (options.makeYourOwn) {
    upSale.innerHTML = require('./templates/makeYourOwn.html.ejs')({
      data: {
        makeUrl: options.makeUrl,
        makeString: options.makeString,
        makeImage: options.makeImage
      }
    });
    if (this.noPadding) {
      upSale.style.marginLeft = '10px';
    }
    belowVisualization.appendChild(upSale);
  } else if (typeof options.makeYourOwn === 'undefined') {
    upSale.innerHTML = require('./templates/learn.html.ejs')({
      assetUrl: this.assetUrl
    });
    belowVisualization.appendChild(upSale);
  }
};

export function makeFooterMenuItems() {
  const footerMenuItems = [
    {
      key: 'try-hoc',
      text: msg.tryHourOfCode(),
      link: 'https://code.org/learn',
      newWindow: true
    },
    {
      key: 'how-it-works',
      text: msg.howItWorks(),
      link: project.getProjectUrl('/edit'),
      newWindow: false
    },
    {
      key: 'report-abuse',
      text: msg.reportAbuse(),
      link: '/report_abuse',
      newWindow: true
    },
    {
      text: msg.copyright(),
      link: 'javascript:void(0)',
      copyright: true
    },
    {
      text: msg.tos(),
      link: 'https://code.org/tos',
      newWindow: true
    },
    {
      text: msg.privacyPolicy(),
      link: 'https://code.org/privacy',
      newWindow: true
    }
  ];

  //Removes 'Try-HOC' from only gamelab footer menu
  if (project.getStandaloneApp() === 'gamelab') {
    footerMenuItems.shift();
  }

  const channelId = project.getCurrentId();
  const alreadyReportedAbuse = userAlreadyReportedAbuse(channelId);
  if (alreadyReportedAbuse) {
    _.remove(footerMenuItems, function(menuItem) {
      return menuItem.key === 'report-abuse';
    });
  }

  return footerMenuItems;
}

StudioApp.prototype.renderShareFooter_ = function(container) {
  var footerDiv = document.createElement('div');
  footerDiv.setAttribute('id', 'footerDiv');
  container.appendChild(footerDiv);

  var reactProps = {
    i18nDropdown: '',
    privacyPolicyInBase: false,
    copyrightInBase: false,
    copyrightStrings: copyrightStrings,
    baseMoreMenuString: msg.builtOnCodeStudio(),
    baseStyle: {
      paddingLeft: 0,
      width: $('#visualization').width()
    },
    className: 'dark',
    menuItems: makeFooterMenuItems(),
    phoneFooter: true,
    channel: project.getCurrentId()
  };

  ReactDOM.render(<SmallFooter {...reactProps} />, footerDiv);
};

/**
 * Get the url of path appended to BASE_URL
 */
StudioApp.prototype.assetUrl_ = function(path) {
  if (this.BASE_URL === undefined) {
    throw new Error(
      'StudioApp BASE_URL has not been set. ' + 'Call configure() first'
    );
  }
  return this.BASE_URL + path;
};

/**
 * Reset the playing field to the start position and kill any pending
 * animation tasks.  This will typically be replaced by an application.
 * @param {boolean} shouldPlayOpeningAnimation True if an opening animation is
 *   to be played.
 */
StudioApp.prototype.reset = function(shouldPlayOpeningAnimation) {
  // Override in app subclass
};

/**
 * Override to change run behavior.
 */
StudioApp.prototype.runButtonClick = function() {};

StudioApp.prototype.addChangeHandler = function(newHandler) {
  if (!this.changeHandlers) {
    this.changeHandlers = [];
  }
  this.changeHandlers.push(newHandler);
};

StudioApp.prototype.runChangeHandlers = function() {
  if (!this.changeHandlers) {
    return;
  }
  this.changeHandlers.forEach(handler => handler());
};

StudioApp.prototype.setupChangeHandlers = function() {
  const runAllHandlers = this.runChangeHandlers.bind(this);
  if (this.isUsingBlockly()) {
    const blocklyCanvas = Blockly.mainBlockSpace.getCanvas();
    blocklyCanvas.addEventListener('blocklyBlockSpaceChange', runAllHandlers);
  } else {
    this.editor.on('change', runAllHandlers);
    // Droplet doesn't automatically bubble up aceEditor changes
    this.editor.aceEditor.on('change', runAllHandlers);
  }
};

/**
 * Toggle whether run button or reset button is shown
 * @param {string} button Button to show, either "run" or "reset"
 */
StudioApp.prototype.toggleRunReset = function(button) {
  var showRun = button === 'run';
  if (button !== 'run' && button !== 'reset') {
    throw 'Unexpected input';
  }

  getStore().dispatch(setIsRunning(!showRun));

  if (showRun) {
    if (this.editDuringRunAlert !== undefined) {
      ReactDOM.unmountComponentAtNode(this.editDuringRunAlert);
      this.editDuringRunAlert = undefined;
    }
    getStore().dispatch(setIsEditWhileRun(false));
  } else {
    this.executingCode = this.getCode().trim();
  }

  if (this.hasContainedLevels) {
    lockContainedLevelAnswers();
  }

  var run = document.getElementById('runButton');
  if (run) {
    // Note: Checking alwaysHideRunButton is necessary because are some levels where we never
    // want to show the "run" button (e.g., maze levels that are "stepOnly").
    run.style.display =
      showRun && !this.config.alwaysHideRunButton ? 'inline-block' : 'none';
    run.disabled = !showRun;
  }

  var reset = document.getElementById('resetButton');
  if (reset) {
    reset.style.display = !showRun ? 'inline-block' : 'none';
    reset.disabled = showRun;
  }

  if (this.isUsingBlockly() && !this.config.readonlyWorkspace) {
    // craft has a darker color scheme than other blockly labs. It needs to
    // toggle between different colors on run/reset or else, on run, the workspace
    // would get lighter than the default.
    if (showRun && this.config.app === 'craft') {
      $('#codeWorkspace > .blocklySvg').css('background-color', '#A1A1A1');
    } else if (showRun) {
      $('#codeWorkspace > .blocklySvg').css('background-color', white);
    } else if (this.config.app === 'craft') {
      $('#codeWorkspace > .blocklySvg').css('background-color', '#7D7D7D');
    } else {
      $('#codeWorkspace > .blocklySvg').css(
        'background-color',
        workspace_running_background
      );
    }
  }

  // Toggle soft-buttons (all have the 'arrow' class set):
  getStore().dispatch(setArrowButtonDisabled(showRun));
};

StudioApp.prototype.isRunning = function() {
  return getStore().getState().runState.isRunning;
};

/**
 * Attempts to associate a set of audio files to a given name
 * @param {Object} audioConfig sound configuration
 */
StudioApp.prototype.registerAudio = function(audioConfig) {
  Sounds.getSingleton().register(audioConfig);
};

/**
 * Attempts to associate a set of audio files to a given name
 * @param {Array.<string>} filenames file paths for sounds
 * @param {string} name ID to associate sound effect with
 */
StudioApp.prototype.loadAudio = function(filenames, name) {
  Sounds.getSingleton().registerByFilenamesAndID(filenames, name);
};

/**
 * Attempts to play a sound effect
 * @param {string} name sound ID
 * @param {Object} options for sound playback
 * @param {number} options.volume value between 0.0 and 1.0 specifying volume
 * @param {boolean} options.noOverlap if true, will not start playing if the sound is already playing
 * @param {function} [options.onEnded]
 */
StudioApp.prototype.playAudio = function(name, options) {
  if (options && options.noOverlap && Sounds.getSingleton().isPlaying(name)) {
    return;
  }
  options = options || {};
  var defaultOptions = {volume: 0.5};
  var newOptions = utils.extend(defaultOptions, options);
  Sounds.getSingleton().play(name, newOptions);
};

/**
 * Play a win sound, unless there's a contained level. In that case, match
 * the sound to the correctness of the answer to the contained level.
 */
StudioApp.prototype.playAudioOnWin = function() {
  if (this.hasContainedLevels) {
    this.playAudio(getValidatedResult() ? 'win' : 'failure');
    return;
  }
  this.playAudio('win');
};

/**
 * Play a failure sound, unless there's a contained level. In that case, match
 * the sound to the correctness of the answer to the contained level.
 */
StudioApp.prototype.playAudioOnFailure = function() {
  if (this.hasContainedLevels) {
    this.playAudio(getValidatedResult() ? 'win' : 'failure');
    return;
  }
  this.playAudio('failure');
};

/**
 * Stops looping a given sound
 * @param {string} name ID of sound
 */
StudioApp.prototype.stopLoopingAudio = function(name) {
  Sounds.getSingleton().stopLoopingAudio(name);
};

/**
 * @param {Object} options Configuration parameters for Blockly. Parameters are
 * optional and include:
 *  - {string} path The root path to the /apps directory, defaults to the
 *    the directory in which this script is located.
 *  - {boolean} rtl True if the current language right to left.
 *  - {DomElement} toolbox The element in which to insert the toolbox,
 *    defaults to the element with 'toolbox'.
 *  - {boolean} trashcan True if the trashcan should be displayed, defaults to
 *    true.
 * @param {Element} div The parent div in which to insert Blockly.
 */
StudioApp.prototype.inject = function(div, options) {
  var defaults = {
    assetUrl: this.assetUrl,
    rtl: options.isBlocklyRtl, // Set to false for RTL
    toolbox: document.getElementById('toolbox'),
    trashcan: true,
    customSimpleDialog: this.feedback_.showSimpleDialog.bind(this.feedback_)
  };
  Blockly.inject(div, utils.extend(defaults, options), Sounds.getSingleton());
};

StudioApp.prototype.showNextHint = function() {
  return this.authoredHintsController_.showNextHint();
};

/**
 * Initialize Blockly for a readonly iframe.  Called on page load. No sounds.
 * XML argument may be generated from the console with:
 * Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)).slice(5, -6)
 */
StudioApp.prototype.initReadonly = function(options) {
  Blockly.inject(document.getElementById('codeWorkspace'), {
    assetUrl: this.assetUrl,
    readOnly: true,
    rtl: getStore().getState().isRtl,
    scrollbars: false
  });
  this.loadBlocks(options.blocks);
};

/**
 * Load the editor with blocks.
 * @param {string} blocksXml Text representation of blocks.
 */
StudioApp.prototype.loadBlocks = function(blocksXml) {
  var xml = parseXmlElement(blocksXml);
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xml);
};

/**
 * Applies the specified arrangement to top startBlocks. If any
 * individual blocks have x or y properties set in the XML, those values
 * take priority. If no arrangement for a particular block type is
 * specified, blocks are automatically positioned by Blockly.
 *
 * Note that, currently, only bounce and flappy use arrangements.
 *
 * @param {string} startBlocks String representation of start blocks xml.
 * @param {Object.<Object>} arrangement A map from block type to position.
 * @return {string} String representation of start blocks xml, including
 *    block position.
 */
StudioApp.prototype.arrangeBlockPosition = function(startBlocks, arrangement) {
  var type, xmlChild;

  var xml = parseXmlElement(startBlocks);

  var xmlChildNodes = xml.childNodes || [];
  arrangement = arrangement || {};

  for (var i = 0; i < xmlChildNodes.length; i++) {
    xmlChild = xmlChildNodes[i];

    // Only look at element nodes
    if (xmlChild.nodeType === 1) {
      // look to see if we have a predefined arrangement for this type
      type = xmlChild.getAttribute('type');
      if (arrangement[type]) {
        if (arrangement[type].x && !xmlChild.hasAttribute('x')) {
          xmlChild.setAttribute('x', arrangement[type].x);
        }
        if (arrangement[type].y && !xmlChild.hasAttribute('y')) {
          xmlChild.setAttribute('y', arrangement[type].y);
        }
      }
    }
  }
  return Blockly.Xml.domToText(xml);
};

StudioApp.prototype.createModalDialog = function(options) {
  return this.feedback_.createModalDialog(options);
};

StudioApp.prototype.showToggleBlocksError = function() {
  this.feedback_.showToggleBlocksError(this.Dialog);
};

StudioApp.prototype.showGeneratedCode = function() {
  this.feedback_.showGeneratedCode(this.Dialog, this.config.appStrings);
};

/**
 * Simple passthrough to AuthoredHints.displayMissingBlockHints
 * @param {String[]} blocks An array of XML strings representing the
 *        missing recommended Blockly Blocks for which we want to
 *        display hints.
 */
StudioApp.prototype.displayMissingBlockHints = function(blocks) {
  this.authoredHintsController_.displayMissingBlockHints(blocks);
};

/**
 * @param {LiveMilestoneResponse} response
 */
StudioApp.prototype.onReportComplete = function(response) {
  this.authoredHintsController_.finishHints(response);

  if (!response) {
    return;
  }
  this.lastShareUrl = response.level_source;

  // Track GA events
  if (response.new_level_completed) {
    trackEvent(
      'Puzzle',
      'Completed',
      response.level_path,
      response.level_attempts
    );
  }

  if (response.share_failure) {
    trackEvent('Share', 'Failure', response.share_failure.type);
  }
};

/**
 * Show our instructions dialog. This should never be called directly, and will
 * instead be called when the state of our redux store changes.
 * @param {object} level
 * @param {boolean} autoClose - closes instructions after 32s if true
 */
StudioApp.prototype.showInstructionsDialog_ = function(level, autoClose) {
  const reduxState = getStore().getState();
  const isMarkdownMode =
    !!reduxState.instructions.longInstructions &&
    !reduxState.instructionsDialog.imgOnly;

  var instructionsDiv = document.createElement('div');
  instructionsDiv.className = isMarkdownMode
    ? 'markdown-instructions-container'
    : 'instructions-container';

  var headerElement;

  var puzzleTitle = msg.puzzleTitle({
    stage_total: level.lesson_total,
    puzzle_number: level.puzzle_number
  });

  if (isMarkdownMode) {
    headerElement = document.createElement('h1');
    headerElement.className = 'markdown-level-header-text dialog-title';
    headerElement.innerHTML = puzzleTitle;
    if (!this.icon) {
      headerElement.className += ' no-modal-icon';
    }
  }

  // Create a div to eventually hold this content, and add it to the
  // overall container. We don't want to render directly into the
  // container just yet, because our React component could contain some
  // elements that don't want to be rendered until they are in the DOM
  var instructionsReactContainer = document.createElement('div');
  instructionsReactContainer.className = 'instructions-content';
  instructionsDiv.appendChild(instructionsReactContainer);

  var buttons = document.createElement('div');
  instructionsDiv.appendChild(buttons);
  ReactDOM.render(<DialogButtons ok={true} />, buttons);

  // If there is an instructions block on the screen, we want the instructions dialog to
  // shrink down to that instructions block when it's dismissed.
  // We then want to flash the instructions block.
  var hideOptions = null;
  var endTargetSelector = '#bubble';

  if ($(endTargetSelector).length) {
    hideOptions = {};
    hideOptions.endTarget = endTargetSelector;
  }

  var hideFn = _.bind(function() {
    // Set focus to ace editor when instructions close:
    if (this.editCode && this.currentlyUsingBlocks()) {
      this.editor.aceEditor.focus();
    }

    // update redux
    getStore().dispatch(closeInstructionsDialog());
  }, this);

  this.instructionsDialog = this.createModalDialog({
    markdownMode: isMarkdownMode,
    contentDiv: instructionsDiv,
    icon: this.icon,
    defaultBtnSelector: '#ok-button',
    onHidden: hideFn,
    scrollContent: true,
    scrollableSelector: '.instructions-content',
    header: headerElement
  });

  // Now that our elements are guaranteed to be in the DOM, we can
  // render in our react components
  $(this.instructionsDialog.div).on('show.bs.modal', () => {
    ReactDOM.render(
      <Provider store={getStore()}>
        <DialogInstructions />
      </Provider>,
      instructionsReactContainer
    );
    resetAniGif(this.instructionsDialog.div.find('img.aniGif').get(0));
  });

  if (autoClose) {
    setTimeout(
      _.bind(function() {
        this.instructionsDialog.hide();
      }, this),
      32000
    );
  }

  var okayButton = buttons.querySelector('#ok-button');
  if (okayButton) {
    dom.addClickTouchEvent(
      okayButton,
      _.bind(function() {
        if (this.instructionsDialog) {
          this.instructionsDialog.hide();
        }
      }, this)
    );
  }

  this.instructionsDialog.show({hideOptions: hideOptions});
};

/**
 *  Resizes the blockly workspace.
 */
StudioApp.prototype.onResize = function() {
  const codeWorkspace = document.getElementById('codeWorkspace');
  if (codeWorkspace && $(codeWorkspace).is(':visible')) {
    var workspaceWidth = codeWorkspace.clientWidth;

    // Keep blocks static relative to the right edge in RTL mode
    if (this.isUsingBlockly() && Blockly.RTL) {
      if (
        this.lastWorkspaceWidth &&
        this.lastWorkspaceWidth !== workspaceWidth
      ) {
        var blockOffset = workspaceWidth - this.lastWorkspaceWidth;
        Blockly.mainBlockSpace.getTopBlocks().forEach(function(topBlock) {
          topBlock.moveBy(blockOffset, 0);
        });
      }
    }
    this.lastWorkspaceWidth = workspaceWidth;

    // Droplet toolbox width varies as the window size changes, so refresh:
    this.resizeToolboxHeader();

    // Content below visualization is a resizing scroll area in pinned mode
    onResizeSmallFooter();
  }
};

/**
 * Resizes the content area below the visualization in pinned (viewport height)
 * view mode.
 */
function resizePinnedBelowVisualizationArea() {
  const pinnedBelowVisualization = document.querySelector(
    '#visualizationColumn.pin_bottom #belowVisualization'
  );
  if (!pinnedBelowVisualization) {
    return;
  }

  let top = 0;

  const possibleElementsAbove = [
    'playSpaceHeader',
    'spelling-table-wrapper',
    'gameButtons',
    'gameButtonExtras',
    'song-selector-wrapper'
  ];
  possibleElementsAbove.forEach(id => {
    let element = document.getElementById(id);
    if (element) {
      top += $(element).outerHeight(true);
    }
  });

  const visualization = document.getElementById('visualization');
  if (visualization) {
    const parent = $(visualization).parent();
    if (parent.attr('id') === 'phoneFrameWrapper') {
      // Phone frame itself doesnt have height. Loop through children
      parent.children().each(function() {
        top += $(this).outerHeight(true);
      });
    } else {
      top += $(visualization).outerHeight(true);
    }
  }

  let bottom = 0;
  const smallFooter = document.querySelector(
    '#page-small-footer .small-footer-base'
  );
  if (smallFooter) {
    const codeApp = $('#codeApp');
    bottom += $(smallFooter).outerHeight(true);
    // Footer is relative to the document, not codeApp, so we need to
    // remove the codeApp bottom offset to get the correct margin.
    bottom -= parseInt(codeApp.css('bottom'), 10);
  }

  pinnedBelowVisualization.style.top = top + 'px';
  pinnedBelowVisualization.style.bottom = bottom + 'px';
}

/**
 * Debounced onResize operations that update the layout to support sizing
 * to viewport height and using the small footer.
 * @type {Function}
 */
var onResizeSmallFooter = _.debounce(function() {
  resizePinnedBelowVisualizationArea();
}, 10);

/**
 * Passthrough to local static resizePinnedBelowVisualizationArea, which needs
 * to be static so it can be statically debounced as onResizeSmallFooter
 */
StudioApp.prototype.resizePinnedBelowVisualizationArea = function() {
  resizePinnedBelowVisualizationArea();
};

function applyTransformScaleToChildren(element, scale) {
  for (var i = 0; i < element.children.length; i++) {
    if (!$(element.children[i]).hasClass('ignore-transform')) {
      applyTransformScale(element.children[i], scale);
    }
  }
}
function applyTransformScale(element, scale) {
  element.style.transform = scale;
  element.style.msTransform = scale;
  element.style.webkitTransform = scale;
}
function applyTransformOrigin(element, origin) {
  element.style.transformOrigin = origin;
  element.style.msTransformOrigin = origin;
  element.style.webkitTransformOrigin = origin;
}

/**
 * Resize the visualization to the given width. If no width is provided, the
 * scale of child elements is updated to the current width.
 */
StudioApp.prototype.resizeVisualization = function(width) {
  if ($('#visualizationColumn').hasClass('wireframeShare')) {
    return;
  }

  // We set styles on each of the elements directly, overriding the normal
  // responsive classes that would typically adjust width and scale.
  var editorColumn = $('.editor-column');
  var visualization = document.getElementById('visualization');
  var visualizationResizeBar = document.getElementById(
    'visualizationResizeBar'
  );
  var visualizationColumn = document.getElementById('visualizationColumn');
  if (!visualization || !visualizationResizeBar || !visualizationColumn) {
    // In unit tests, this event may be receieved when the DOM isn't fully
    // configured.  In those cases there's no visualization to resize, so
    // stop here.  In production we don't expect to need this early-out.
    return;
  }

  var oldVizWidth = $(visualizationColumn).width();
  var newVizWidth = Math.max(
    this.minVisualizationWidth,
    Math.min(this.maxVisualizationWidth, width || oldVizWidth)
  );
  var newVizWidthString = newVizWidth + 'px';
  var newVizHeightString = newVizWidth / this.vizAspectRatio + 'px';
  var vizSideBorderWidth =
    visualization.offsetWidth - visualization.clientWidth;

  if (getStore().getState().isRtl) {
    visualizationResizeBar.style.right = newVizWidthString;
    editorColumn.css('right', newVizWidthString);
  } else {
    visualizationResizeBar.style.left = newVizWidthString;
    editorColumn.css('left', newVizWidthString);
  }
  visualizationResizeBar.style.lineHeight = newVizHeightString;
  // Add extra width to visualizationColumn if visualization has a border:
  visualizationColumn.style.maxWidth = newVizWidth + vizSideBorderWidth + 'px';
  visualization.style.maxWidth = newVizWidthString;
  visualization.style.maxHeight = newVizHeightString;

  var scale = newVizWidth / this.nativeVizWidth;
  getStore().dispatch(setVisualizationScale(scale));

  const cssScale = `scale(${scale})`;
  applyTransformScaleToChildren(visualization, cssScale);
  const dpadContainer = document.getElementById('studio-dpad-container');
  if (dpadContainer) {
    applyTransformScaleToChildren(dpadContainer, cssScale);
  }

  if (oldVizWidth < 230 && newVizWidth >= 230) {
    $('#soft-buttons').removeClass('soft-buttons-compact');
  } else if (oldVizWidth > 230 && newVizWidth <= 230) {
    $('#soft-buttons').addClass('soft-buttons-compact');
  }

  var smallFooter = document.querySelector(
    '#page-small-footer .small-footer-base'
  );
  if (smallFooter) {
    smallFooter.style.maxWidth = newVizWidthString;
  }

  // Fire resize so blockly and droplet handle this type of resize properly:
  utils.fireResizeEvent();
};

/**
 *  Updates the width of the toolbox-header to match the width of the toolbox
 *  or palette in the workspace below the header.
 */
StudioApp.prototype.resizeToolboxHeader = function() {
  var toolboxWidth = 0;
  if (
    this.editCode &&
    this.editor &&
    this.editor.session &&
    this.editor.session.paletteEnabled
  ) {
    // If in the droplet editor, set toolboxWidth based on the block palette width:
    var categories = document.querySelector('.droplet-palette-wrapper');
    toolboxWidth = categories.getBoundingClientRect().width;
  } else if (this.isUsingBlockly()) {
    toolboxWidth = Blockly.mainBlockSpaceEditor.getToolboxWidth();
  }
  document.getElementById('toolbox-header').style.width = toolboxWidth + 'px';
};

/**
 * Highlight the block (or clear highlighting) unless the user has edited their
 * code during this run.
 * @param {?string} id ID of block that triggered this action.
 * @param {boolean} spotlight Optional.  Highlight entire block if true
 */
StudioApp.prototype.highlight = function(id, spotlight) {
  if (this.isUsingBlockly() && !isEditWhileRun(getStore().getState())) {
    if (id) {
      var m = id.match(/^block_id_(\d+)$/);
      if (m) {
        id = m[1];
      }
    }

    Blockly.mainBlockSpace.highlightBlock(id, spotlight);
  }
};

/**
 * Remove highlighting from all blocks
 */
StudioApp.prototype.clearHighlighting = function() {
  if (this.isUsingBlockly()) {
    this.highlight(null);
  } else if (this.editCode && this.editor) {
    // Clear everything (step highlighting, errors, etc.)
    codegen.clearDropletAceHighlighting(this.editor, true);
  }
};

/**
 * Display feedback based on test results.  The test results must be
 * explicitly provided.
 * @param {FeedbackOptions} options
 */
StudioApp.prototype.displayFeedback = function(options) {
  // Special test code for edit blocks.
  if (options.level.edit_blocks) {
    options.feedbackType = TestResults.EDIT_BLOCKS;
  }

  if (experiments.isEnabled(experiments.BUBBLE_DIALOG)) {
    // Track whether this experiment is in use. If not, delete this and similar
    // sections of code. If it is, create a non-experiment flag.
    trackEvent(
      'experiment',
      'Feedback bubbleDialog',
      `AppType ${this.config.app}. Level ${this.config.serverLevelId}`
    );
    const {response, preventDialog, feedbackType, feedbackImage} = options;

    const newFinishDialogApps = {
      turtle: true,
      karel: true,
      maze: true,
      studio: true,
      flappy: true,
      bounce: true
    };
    const hasNewFinishDialog = newFinishDialogApps[this.config.app];

    if (hasNewFinishDialog && !this.hasContainedLevels) {
      const store = getStore();
      const generatedCodeProperties = this.feedback_.getGeneratedCodeProperties(
        this.config.appStrings
      );
      const studentCode = {
        message: generatedCodeProperties.shortMessage,
        code: generatedCodeProperties.code
      };
      const canShare = !this.disableSocialShare && !options.disableSocialShare;
      store.dispatch(
        setFeedbackData({
          isChallenge: this.config.isChallengeLevel,
          isPerfect: feedbackType >= TestResults.MINIMUM_OPTIMAL_RESULT,
          blocksUsed: this.feedback_.getNumCountableBlocks(),
          displayFunometer: response && response.puzzle_ratings_enabled,
          studentCode,
          feedbackImage: canShare && feedbackImage
        })
      );
      store.dispatch(setAchievements(getAchievements(store.getState())));
      if (this.shouldDisplayFeedbackDialog_(preventDialog, feedbackType)) {
        store.dispatch(showFeedback());
        this.onFeedback(options);
        return;
      }
    }
  }
  options.onContinue = this.onContinue;
  options.backToPreviousLevel = this.backToPreviousLevel;
  options.isUS = this.isUS;
  options.channelId = project.getCurrentId();

  try {
    options.shareLink =
      (options.response && options.response.level_source) ||
      project.getShareUrl();
  } catch (e) {}

  options.useDialog = this.shouldDisplayFeedbackDialog_(
    options.preventDialog,
    options.feedbackType
  );
  if (options.useDialog) {
    // let feedback handle creating the dialog
    this.feedback_.displayFeedback(
      options,
      this.requiredBlocks_,
      this.maxRequiredBlocksToFlag_,
      this.recommendedBlocks_,
      this.maxRecommendedBlocksToFlag_
    );
  } else {
    // update the block hints lightbulb
    const missingBlockHints = this.feedback_.getMissingBlockHints(
      this.requiredBlocks_.concat(this.recommendedBlocks_),
      options.level.isK1
    );
    this.displayMissingBlockHints(missingBlockHints);

    // communicate the feedback message to the top instructions via
    // redux
    const message = this.feedback_.getFeedbackMessage(options);
    const isFailure = options.feedbackType < TestResults.MINIMUM_PASS_RESULT;
    getStore().dispatch(setFeedback({message, isFailure}));
  }

  // If this level is enabled with a hint prompt threshold, check it and some
  // other state values to see if we should show the hint prompt
  if (this.config && this.config.level.hintPromptAttemptsThreshold) {
    this.authoredHintsController_.considerShowingOnetimeHintPrompt();
  }

  this.onFeedback(options);
};

/**
 * Whether feedback should be displayed as a modal dialog or integrated
 * into the top instructions
 * @param {boolean} preventDialog
 * @param {TestResult} feedbackType
 */
StudioApp.prototype.shouldDisplayFeedbackDialog_ = function(
  preventDialog,
  feedbackType
) {
  if (preventDialog) {
    return false;
  }

  // If we show instructions when collapsed, we only use dialogs for
  // success feedback.
  const constants = getStore().getState().pageConstants;
  if (!constants.noInstructionsWhenCollapsed) {
    return this.feedback_.canContinueToNextLevel(feedbackType);
  }
  return true;
};

/**
 * Runs the tests and returns results.
 * @param {boolean} levelComplete Was the level completed successfully?
 * @param {{executionError: ExecutionError, allowTopBlocks: boolean}} options
 * @return {number} The appropriate property of TestResults.
 */
StudioApp.prototype.getTestResults = function(levelComplete, options) {
  return this.feedback_.getTestResults(
    levelComplete,
    this.requiredBlocks_,
    this.recommendedBlocks_,
    this.checkForEmptyBlocks_,
    options
  );
};

// Builds the dom to get more info from the user. After user enters info
// and click "create level" onAttemptCallback is called to deliver the info
// to the server.
StudioApp.prototype.builderForm_ = function(onAttemptCallback) {
  var builderDetails = document.createElement('div');
  builderDetails.innerHTML = require('./templates/builder.html.ejs')();
  var dialog = this.createModalDialog({
    contentDiv: builderDetails,
    icon: this.icon
  });
  var createLevelButton = document.getElementById('create-level-button');
  dom.addClickTouchEvent(createLevelButton, function() {
    var instructions = builderDetails.querySelector('[name="instructions"]')
      .value;
    var name = builderDetails.querySelector('[name="level_name"]').value;
    var query = url.parse(window.location.href, true).query;
    onAttemptCallback(
      utils.extend(
        {
          instructions: instructions,
          name: name
        },
        query
      )
    );
  });

  dialog.show({backdrop: 'static'});
};

/**
 * Report back to the server, if available.
 * @param {MilestoneReport} options
 */
StudioApp.prototype.report = function(options) {
  // We don't need to report again on reset.
  this.hasReported = true;
  const currentTime = new Date().getTime();
  // copy from options: app, level, result, testResult, program, onComplete
  var report = Object.assign({}, options, {
    pass: this.feedback_.canContinueToNextLevel(options.testResult),
    time: currentTime - this.initTime,
    timeSinceLastMilestone: currentTime - this.milestoneStartTime,
    attempt: this.attempts,
    lines: this.feedback_.getNumBlocksUsed()
  });

  // After we log the reported time we should update the start time of the milestone
  // otherwise if we don't leave the page we are compounding the total time
  this.milestoneStartTime = currentTime;

  this.lastTestResult = options.testResult;

  const readOnly = getStore().getState().pageConstants.isReadOnlyWorkspace;

  // If hideSource is enabled, the user is looking at a shared level that
  // they cannot have modified. In that case, don't report it to the service
  // or call the onComplete() callback expected. The app will just sit
  // there with the Reset button as the only option.
  var self = this;
  if (!(this.hideSource && this.share) && !readOnly) {
    var onAttemptCallback = (function() {
      return function(builderDetails) {
        for (var option in builderDetails) {
          report[option] = builderDetails[option];
        }
        self.onAttempt(report);
      };
    })();

    // If this is the level builder, go to builderForm to get more info from
    // the level builder.
    if (options.builder) {
      this.builderForm_(onAttemptCallback);
    } else {
      onAttemptCallback();
    }
  }
};

/**
 * Set up the runtime annotation system as appropriate. Typically called
 * during an app's execute() immediately after calling reset().
 */
StudioApp.prototype.clearAndAttachRuntimeAnnotations = function() {
  if (this.editCode && !this.hideSource) {
    // Our ace worker also calls attachToSession, but it won't run on IE9:
    var session = this.editor.aceEditor.getSession();
    annotationList.attachToSession(session, this.editor);
    annotationList.clearRuntimeAnnotations();
    this.editor.aceEditor.session.on('change', function() {
      // clear any runtime annotations whenever a change is made
      annotationList.clearRuntimeAnnotations();
    });
  }
};

/**
 * Report milestones but don't trigger the success callback when
 * the server responds.
 */
StudioApp.prototype.silentlyReport = function(level = this.config.level.id) {
  var options = {
    app: getStore().getState().pageConstants.appType,
    level: level,
    skipSuccessCallback: true
  };

  // Some DB-backed levels (such as craft) only save the user's code when the user
  // successfully finishes the level. Opening the level in a new tab will make the level
  // appear freshly started. Therefore, we mark only channel-backed levels "started" here.
  if (getStore().getState().pageConstants.channelId) {
    options.testResult = TestResults.LEVEL_STARTED;
  }
  this.report(options);
  this.hasReported = false;
};

/**
 * Click the reset button. Reset the application.
 */
StudioApp.prototype.resetButtonClick = function() {
  // First, abort any reports in progress - the server call will
  // still complete, but we'll skip the success callback.
  this.onResetPressed();
  // Then, check if any reports happened this cycle. If not, trigger a report.
  if (!this.hasReported) {
    this.debouncedSilentlyReport();
  }
  this.hasReported = false;
  this.toggleRunReset('run');
  this.clearHighlighting();
  getStore().dispatch(setFeedback(null));
  if (this.isUsingBlockly()) {
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
    Blockly.mainBlockSpace.traceOn(false);
  }
  this.reset(false);
};

/**
 * Add count of blocks used.
 */
StudioApp.prototype.updateBlockCount = function() {
  const element = document.getElementById('blockUsed');
  if (element) {
    // If the number of block used is bigger than the ideal number of blocks,
    // set it to be yellow, otherwise, keep it as black.
    if (this.IDEAL_BLOCK_NUM < this.feedback_.getNumCountableBlocks()) {
      element.className = 'block-counter-overflow';
    } else {
      element.className = 'block-counter-default';
    }

    // Update number of blocks used.
    element.innerHTML = ''; // Remove existing children or text.
    element.appendChild(
      document.createTextNode(this.feedback_.getNumCountableBlocks())
    );
  }
};

/**
 * Set the ideal Number of blocks.
 */
StudioApp.prototype.setIdealBlockNumber_ = function() {
  var element = document.getElementById('idealBlockNumber');
  if (!element) {
    return;
  }

  var idealBlockNumberMsg =
    this.IDEAL_BLOCK_NUM === Infinity ? msg.infinity() : this.IDEAL_BLOCK_NUM;
  element.innerHTML = ''; // Remove existing children or text.
  element.appendChild(document.createTextNode(idealBlockNumberMsg));
};

/**
 *
 */
StudioApp.prototype.fixViewportForSmallScreens_ = function(viewport, config) {
  var deviceWidth;
  var desiredWidth;
  var width;
  var scale;

  if (this.share && dom.isMobile()) {
    var mobileNoPaddingShareWidth =
      config.mobileNoPaddingShareWidth || DEFAULT_MOBILE_NO_PADDING_SHARE_WIDTH;
    // for mobile sharing, favor portrait mode, so width is the shorter of the two
    deviceWidth = desiredWidth = Math.min(screen.width, screen.height);
    if (this.noPadding && deviceWidth < MAX_PHONE_WIDTH) {
      desiredWidth = Math.min(desiredWidth, mobileNoPaddingShareWidth);
    }
    var minWidth = mobileNoPaddingShareWidth;
    width = Math.max(minWidth, desiredWidth);
    scale = deviceWidth / width;
  } else {
    // We want the longer edge, the width in landscape, to get MIN_WIDTH.
    let screenWidth = Math.max(screen.width, screen.height);

    width = MIN_WIDTH;
    scale = screenWidth / width;
  }

  // Setting `minimum-scale=scale` means that we are unable to shrink the
  // entire playspace area down to fit on a portrait iPhone, even though
  // it's technically not visible because of the RotateContainer on top.
  // But setting `maximum-scale=scale` was preventing an Android from starting
  // in the desired zoom level in landscape, so we removed that but left
  // `minimum-scale=scale`.
  var content = [
    'width=' + width,
    'minimal-ui',
    'initial-scale=' + scale,
    'minimum-scale=' + scale,
    'target-densityDpi=device-dpi',
    'viewport-fit=cover'
  ];
  viewport.setAttribute('content', content.join(', '));
};

/**
 *
 */
StudioApp.prototype.fixViewportForSpecificWidthForSmallScreens_ = function(
  viewport,
  width
) {
  // iOS sets the screen width to the min of width and height. Android sets the
  // screen width to the landscape width. We take the min of width and height
  // here to enforce consistent behavior.
  let screenWidth = Math.min(screen.width, screen.height);
  const scale = screenWidth / width;

  var content = [
    'width=' + width,
    'minimal-ui',
    'initial-scale=' + scale,
    'maximum-scale=' + scale,
    'minimum-scale=' + scale,
    'target-densityDpi=device-dpi',
    'user-scalable=no'
  ];
  viewport.setAttribute('content', content.join(', '));
};

/**
 * @param {AppOptionsConfig}
 */
StudioApp.prototype.setConfigValues_ = function(config) {
  this.share = config.share;

  // If set to true, we use our wireframe share (or chromeless share on mobile).
  config.wireframeShare = utils.valueOr(config.wireframeShare, false);

  // if true, dont provide links to share on fb/twitter
  this.disableSocialShare = config.disableSocialShare;
  this.isUS = config.isUS;
  this.noPadding = config.noPadding;

  // contract editor requires more vertical space. set height to 1250 unless
  // explicitly specified
  if (config.level.useContractEditor) {
    config.level.minWorkspaceHeight = config.level.minWorkspaceHeight || 1250;
  }

  this.appMsg = config.appMsg;
  this.IDEAL_BLOCK_NUM = config.level.ideal || Infinity;
  if (experiments.isEnabled(experiments.BUBBLE_DIALOG)) {
    // This seems to break levels that start in the animation/costume tab.
    // If this feature comes out from behind the experiment, make sure not to
    // regress those levels.
    getStore().dispatch(setBlockLimit(this.IDEAL_BLOCK_NUM));
  }
  this.MIN_WORKSPACE_HEIGHT = config.level.minWorkspaceHeight || 800;
  this.requiredBlocks_ = config.level.requiredBlocks || [];
  this.recommendedBlocks_ = config.level.recommendedBlocks || [];

  // Always use the source code from the level definition for contained levels,
  // so that changes made in levelbuilder will show up for users who have
  // already run the level.
  if (config.ignoreLastAttempt || config.hasContainedLevels) {
    config.level.lastAttempt = '';
  }

  this.startBlocks_ =
    config.level.lastAttempt || config.level.startBlocks || '';
  this.vizAspectRatio = config.vizAspectRatio || 1.0;
  this.nativeVizWidth = config.nativeVizWidth || this.maxVisualizationWidth;

  if (config.level.initializationBlocks) {
    var xml = parseXmlElement(config.level.initializationBlocks);
    this.initializationBlocks = Blockly.Generator.xmlToBlocks(
      'JavaScript',
      xml
    );
  }

  // enableShowCode defaults to true if not defined
  this.enableShowCode = config.enableShowCode !== false;
  this.enableShowLinesCount =
    config.enableShowLinesCount !== false && !config.hasContainedLevels;

  // If the level has no ideal block count, don't show a block count. If it does
  // have an ideal, show block count unless explicitly configured not to.
  if (
    config.level &&
    (config.level.ideal === undefined || config.level.ideal === Infinity)
  ) {
    this.enableShowBlockCount = false;
  } else {
    this.enableShowBlockCount = config.enableShowBlockCount !== false;
  }

  // Store configuration.
  this.onAttempt = config.onAttempt || function() {};
  this.onContinue = config.onContinue || function() {};
  this.onFeedback = config.onFeedback || function() {};
  this.onInitialize = config.onInitialize
    ? config.onInitialize.bind(config)
    : function() {};
  this.onResetPressed = config.onResetPressed || function() {};
  this.backToPreviousLevel = config.backToPreviousLevel || function() {};
  this.skin = config.skin;
  this.polishCodeHook = config.polishCodeHook;
};

// Overwritten by applab.
function runButtonClickWrapper(callback) {
  if (window.$) {
    $(window).trigger('run_button_pressed');
    $(window).trigger('appModeChanged');
  }

  // inform Blockly that the run button has been pressed
  if (window.Blockly && Blockly.mainBlockSpace) {
    var customEvent = utils.createEvent(
      Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED
    );
    Blockly.mainBlockSpace.getCanvas().dispatchEvent(customEvent);
  }

  callback();
}

StudioApp.prototype.skipLevel = function() {
  this.report({
    app: this.config.app,
    level: this.config.level.id,
    result: false,
    testResult: TestResults.SKIPPED,
    onComplete() {
      const newUrl = getStore().getState().pageConstants.nextLevelUrl;
      if (newUrl) {
        window.location.href = newUrl;
      } else {
        throw new Error('No next level url available to skip to');
      }
    }
  });
};

/**
 * Begin modifying the DOM based on config.
 * Note: Has side effects on config
 * @param {AppOptionsConfig}
 */
StudioApp.prototype.configureDom = function(config) {
  var container = document.getElementById(config.containerId);
  var codeWorkspace = container.querySelector('#codeWorkspace');

  var runButton = container.querySelector('#runButton');
  var resetButton = container.querySelector('#resetButton');
  var runClick = this.runButtonClick.bind(this);
  var clickWrapper = config.runButtonClickWrapper || runButtonClickWrapper;
  var throttledRunClick = _.debounce(clickWrapper.bind(null, runClick), 250, {
    leading: true,
    trailing: false
  });
  if (runButton && resetButton) {
    dom.addClickTouchEvent(runButton, _.bind(throttledRunClick, this));
    dom.addClickTouchEvent(resetButton, _.bind(this.resetButtonClick, this));
  }
  var skipButton = container.querySelector('#skipButton');
  if (skipButton) {
    dom.addClickTouchEvent(skipButton, this.skipLevel.bind(this));
  }

  // TODO (cpirich): make conditional for applab
  var belowViz = document.getElementById('belowVisualization');
  var referenceArea = document.getElementById('reference_area');
  // noInstructionsWhenCollapsed is used in TopInstructions to determine when to use if in CSP/CSD (in which case
  // display videos in the top instructions) or InstructionsCSF (in which case the videos are appended here).

  const referenceAreaInTopInstructions = config.noInstructionsWhenCollapsed;
  if (!referenceAreaInTopInstructions && referenceArea) {
    belowViz.appendChild(referenceArea);
  }

  var visualizationColumn = document.getElementById('visualizationColumn');

  if (!config.hideSource || config.embed || config.level.iframeEmbed) {
    var vizHeight = this.MIN_WORKSPACE_HEIGHT;
    if (this.isUsingBlockly() && config.level.edit_blocks) {
      // Set a class on the main blockly div so CSS can style blocks differently
      $(codeWorkspace).addClass('edit');
      // If in level builder editing blocks, make workspace extra tall
      vizHeight = 3000;
      // Modify the arrangement of toolbox blocks so categories align left
      if (config.level.edit_blocks === TOOLBOX_EDIT_MODE) {
        this.blockYCoordinateInterval = 80;
        config.blockArrangement = {category: {x: 20}};
      }
      // Enable if/else, param & var editing in levelbuilder, regardless of level setting
      config.level.disableIfElseEditing = false;
      config.level.disableParamEditing = false;
      config.level.disableVariableEditing = false;
    }

    if (config.level.iframeEmbed) {
      document.body.className += ' embedded_iframe';
    }

    if (config.pinWorkspaceToBottom && !config.level.iframeEmbedAppAndCode) {
      var bodyElement = document.body;
      bodyElement.style.overflow = 'hidden';
      bodyElement.className = bodyElement.className + ' pin_bottom';
      container.className = container.className + ' pin_bottom';
    } else {
      visualizationColumn.style.minHeight = vizHeight + 'px';
      container.style.minHeight = vizHeight + 'px';
    }
  }

  if (config.readonlyWorkspace) {
    $(codeWorkspace).addClass('readonly');
  }

  var smallFooter = document.querySelector(
    '#page-small-footer .small-footer-base'
  );
  if (smallFooter) {
    if (config.noPadding) {
      // The small footer's padding should not increase its size when not part
      // of a larger page.
      smallFooter.style.boxSizing = 'border-box';
    }
    if (getStore().getState().pageConstants.isResponsive) {
      smallFooter.className += ' responsive';
    }
  }
};

/**
 *
 */
StudioApp.prototype.handleHideSource_ = function(options) {
  var container = document.getElementById(options.containerId);
  this.hideSource = true;
  var workspaceDiv = document.getElementById('codeWorkspace');
  if (!options.embed || options.level.skipInstructionsPopup) {
    container.className = 'hide-source';
  }
  workspaceDiv.style.display = 'none';

  // Chrome-less share page.
  if (this.share) {
    if (options.legacyShareStyle || options.wireframeShare) {
      document.body.style.backgroundColor = '#202B34';
      if (options.level.iframeEmbed) {
        // so help me god.
        document.body.style.backgroundColor = 'transparent';
      }

      $('.header-wrapper').hide();
      var vizColumn = document.getElementById('visualizationColumn');
      if (dom.isMobile() && (options.legacyShareStyle || !dom.isIPad())) {
        $(vizColumn).addClass('chromelessShare');
      } else {
        $(vizColumn).addClass('wireframeShare');

        // Set the document to use flex.
        document.body.className += ' WireframeButtons_container';

        // Create an empty div on the left for padding
        var div = document.createElement('div');
        div.className = 'WireframeButtons_containerLeft';
        document.body.insertBefore(div, document.body.firstChild);

        // Add 'withWireframeButtons' class to top level div that wraps app.
        // This will add necessary styles.
        div = document.getElementsByClassName('wrapper')[0];
        if (div) {
          div.className = 'wrapper withWireframeButtons';
        }

        // Create div for buttons on the right
        div = document.createElement('div');
        div.className = 'WireframeButtons_containerRight';
        document.body.appendChild(div);
        if (!options.level.iframeEmbed) {
          ReactDOM.render(
            React.createElement(WireframeButtons, {
              channelId: project.getCurrentId(),
              appType: project.getStandaloneApp(),
              isLegacyShare: !!options.isLegacyShare
            }),
            div
          );
        }
      }

      if (!options.embed && !options.noHowItWorks) {
        const buttonRow = document.getElementById('gameButtons');
        const openWorkspace = document.createElement('button');
        openWorkspace.setAttribute('id', 'open-workspace');
        openWorkspace.appendChild(document.createTextNode(msg.openWorkspace()));

        dom.addClickTouchEvent(openWorkspace, function() {
          // /c/ URLs go to /edit when we click open workspace.
          // /project/ URLs we want to go to /view (which doesnt require login)
          if (/^\/c\//.test(location.pathname)) {
            location.pathname += '/edit';
          } else {
            location.pathname += '/view';
          }
        });

        buttonRow.appendChild(openWorkspace);
      }
    }
  }
};

StudioApp.prototype.handleIframeEmbedAppAndCode_ = function() {
  document.body.style.backgroundColor = 'transparent';
  document.body.className += 'iframe_embed_app_and_code';
  var vizColumn = document.getElementById('visualizationColumn');
  $(vizColumn).addClass('chromelessShare');
};

/**
 * Adds any library blocks in the project to the toolbox.
 * @param {object} config The object containing all metadata about the project
 */
StudioApp.prototype.loadLibraryBlocks = function(config) {
  if (!config.level.libraries && config.level.startLibraries) {
    config.level.libraries = JSON.parse(config.level.startLibraries);
  }
  if (!config.level.libraries) {
    return;
  }

  config.level.projectLibraries = [];
  config.level.libraries.forEach(library => {
    config.dropletConfig.additionalPredefValues.push(library.name);
    config.level.projectLibraries.push({
      name: library.name,
      code: createLibraryClosure(library)
    });
    // TODO: add category management for libraries (blocked on spec)
    // config.dropletConfig.categories['libraryName'] = {
    //   id: 'libraryName',
    //   color: 'colorName',
    //   rgb: 'colorHexCode',
    //   blocks: []
    // };

    library.dropletConfig.forEach(dropletConfig => {
      config.dropletConfig.blocks.push(dropletConfig);
      config.level.codeFunctions[dropletConfig.func] = null;
    });
  });
};

/**
 * Move the droplet cursor to the first token at a specific line number.
 * @param {Number} line zero-based line index
 */
StudioApp.prototype.setDropletCursorToLine_ = function(line) {
  var dropletDocument = this.editor.getCursor().getDocument();
  var docToken = dropletDocument.start;
  var curLine = 0;
  while (docToken && curLine < line) {
    docToken = docToken.next;
    if (docToken.type === 'newline') {
      curLine++;
    }
  }
  if (docToken) {
    this.editor.setCursor(docToken);
  }
};

/**
 * Whether we are currently using droplet in block mode rather than text mode.
 */
StudioApp.prototype.currentlyUsingBlocks = function() {
  return (
    this.editor &&
    this.editor.session &&
    this.editor.session.currentlyUsingBlocks
  );
};

StudioApp.prototype.handleEditCode_ = function(config) {
  if (this.hideSource) {
    // In hide source mode, just call afterInject and exit immediately
    if (config.afterInject) {
      config.afterInject();
    }
    return;
  }

  // Remove maker API blocks from palette, unless maker APIs are enabled.
  if (!project.getMakerAPIs()) {
    // Remove maker blocks from the palette
    if (config.level.codeFunctions) {
      configCircuitPlayground.blocks.forEach(block => {
        delete config.level.codeFunctions[block.func];
      });
      configMicrobit.blocks.forEach(block => {
        delete config.level.codeFunctions[block.func];
      });
    }
  }

  var fullDropletPalette = dropletUtils.generateDropletPalette(
    config.level.codeFunctions,
    config.dropletConfig
  );

  // Create a child element of codeTextbox to instantiate droplet on, because
  // droplet sets css properties on its wrapper that would interfere with our
  // layout otherwise.

  const codeTextbox = document.getElementById('codeTextbox');
  const dropletCodeTextbox = document.createElement('div');
  dropletCodeTextbox.setAttribute('id', 'dropletCodeTextbox');
  codeTextbox.appendChild(dropletCodeTextbox);

  this.editor = new droplet.Editor(dropletCodeTextbox, {
    mode: 'javascript',
    modeOptions: dropletUtils.generateDropletModeOptions(config),
    palette: fullDropletPalette,
    showPaletteInTextMode: true,
    showDropdownInPalette: config.showDropdownInPalette,
    allowFloatingBlocks: false,
    dropIntoAceAtLineStart: config.dropIntoAceAtLineStart,
    enablePaletteAtStart: !config.readonlyWorkspace,
    textModeAtStart:
      config.level.textModeAtStart === 'blocks'
        ? false
        : config.level.textModeAtStart === false
        ? config.usingTextModePref
        : !!config.level.textModeAtStart
  });
  this.setupChangeHandlers();

  if (config.level.paletteCategoryAtStart) {
    this.editor.changePaletteGroup(config.level.paletteCategoryAtStart);
  }

  this.editor.aceEditor.setShowPrintMargin(false);

  // Init and define our custom ace mode:
  aceMode.defineForAce(
    config.dropletConfig,
    config.unusedConfig,
    this.editor,
    config.levelGameName
  );
  // Now set the editor to that mode:
  var aceEditor = this.editor.aceEditor;
  aceEditor.session.setMode('ace/mode/javascript_codeorg');

  // Extend the command list on the ace Autocomplete object to include the period:
  var Autocomplete = window.ace.require('ace/autocomplete').Autocomplete;
  Autocomplete.prototype.commands['.'] = function(editor) {
    // First, insert the period and update the completions:
    editor.insert('.');
    editor.completer.updateCompletions(true);
    var filtered =
      editor.completer.completions && editor.completer.completions.filtered;
    for (var i = 0; i < (filtered && filtered.length); i++) {
      // If we have any exact maches in our filtered completions that include
      // this period, allow the completer to stay active:
      if (filtered[i].exactMatch) {
        return;
      }
    }
    // Otherwise, detach the completer:
    editor.completer.detach();
  };

  var langTools = window.ace.require('ace/ext/language_tools');

  // We don't want to include the textCompleter. langTools doesn't give us a way
  // to remove base completers (note: it does in newer versions of ace), so
  // we set aceEditor.completers manually
  aceEditor.completers = [
    langTools.snippetCompleter,
    langTools.keyWordCompleter
  ];
  // make setCompleters fail so that attempts to use it result in clear failure
  // instead of just silently not working
  langTools.setCompleters = function() {
    throw new Error(
      'setCompleters disabled. set aceEditor.completers directly'
    );
  };

  // Add an ace completer for the API functions exposed for this level
  if (config.dropletConfig) {
    var functionsFilter = null;
    if (config.level.autocompletePaletteApisOnly) {
      functionsFilter = config.level.codeFunctions;
    }

    aceEditor.completers.push(
      dropletUtils.generateAceApiCompleter(
        functionsFilter,
        config.dropletConfig
      )
    );
  }

  this.editor.aceEditor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true
  });

  this.dropletTooltipManager = new DropletTooltipManager(
    this.appMsg,
    config.dropletConfig,
    config.level.codeFunctions,
    config.level.autocompletePaletteApisOnly,
    config.app
  );
  if (config.level.dropletTooltipsDisabled) {
    this.dropletTooltipManager.setTooltipsEnabled(false);
  }
  this.dropletTooltipManager.registerBlocks();

  // Bind listener to palette/toolbox 'Hide' and 'Show' links
  const hideToolboxIcon = document.getElementById('hide-toolbox-icon');
  const showToolboxHeader = document.getElementById('show-toolbox-header');
  const showToolboxClickTarget = document.getElementById(
    'show-toolbox-click-target'
  );
  if (hideToolboxIcon && showToolboxHeader) {
    hideToolboxIcon.style.display = 'inline-block';
    const handleTogglePalette = () => {
      if (this.editor && this.editor.session) {
        this.editor.enablePalette(!this.editor.session.paletteEnabled);
        showToolboxHeader.style.display = this.editor.session.paletteEnabled
          ? 'none'
          : 'inline-block';
        hideToolboxIcon.style.display = !this.editor.session.paletteEnabled
          ? 'none'
          : 'inline-block';
        this.resizeToolboxHeader();
      }
    };
    dom.addClickTouchEvent(hideToolboxIcon, handleTogglePalette);
    dom.addClickTouchEvent(showToolboxClickTarget, handleTogglePalette);
  }

  this.resizeToolboxHeader();

  var startBlocks = config.level.lastAttempt || config.level.startBlocks;
  if (startBlocks) {
    try {
      // Don't pass CRLF pairs to droplet until they fix CR handling:
      this.editor.setValue(startBlocks.replace(/\r\n/g, '\n'));
      // When adding content via setValue, the aceEditor cursor gets set to be
      // at the end of the file. For mysterious reasons we've been unable to
      // understand, we end up with some pretty funky render issues if the first
      // time we switch to text mode the cursor is out of view beyond the bottom
      // of the editor. Navigate to the start so that this doesn't happen.
      this.editor.aceEditor.navigateFileStart();
    } catch (err) {
      // catch errors without blowing up entirely. we may still not be in a
      // great state
      console.error(err.message);
    }
    // Reset droplet Undo stack:
    this.editor.clearUndoStack();
    // Reset ace Undo stack:
    var UndoManager = window.ace.require('ace/undomanager').UndoManager;
    this.editor.aceEditor.getSession().setUndoManager(new UndoManager());
  }

  if (config.readonlyWorkspace) {
    // When in readOnly mode, show source, but do not allow editing,
    // disable the palette, and hide the UI to show the palette:
    this.editor.setReadOnly(true);
    showToolboxHeader.style.display = 'none';
  }

  // droplet may now be in code mode if it couldn't parse the code into
  // blocks, so update the UI based on the current state (don't autofocus
  // if we have already created an instructionsDialog at this stage of init)
  this.onDropletToggle(!this.instructionsDialog);

  this.dropletTooltipManager.registerDropletBlockModeHandlers(this.editor);

  this.editor.on('palettetoggledone', function(e) {
    $(window).trigger('droplet_change', ['togglepalette']);
  });

  this.editor.on('selectpalette', function(e) {
    $(window).trigger('droplet_change', ['selectpalette']);
  });

  $('.droplet-palette-scroller').on('scroll', function(e) {
    $(window).trigger('droplet_change', ['scrollpalette']);
  });

  $('.droplet-main-scroller').on('scroll', function(e) {
    $(window).trigger('droplet_change', ['scrolleditor']);
  });

  this.editor.aceEditor.getSession().on('changeScrollTop', function() {
    $(window).trigger('droplet_change', ['scrollace']);
  });

  $.expr[':'].textEquals = function(el, i, m) {
    var searchText = m[3];
    var match = $(el)
      .text()
      .trim()
      .match('^' + searchText + '$');
    return match && match.length > 0;
  };

  $(window).on(
    'prepareforcallout',
    function(e, options) {
      // qtip_config's codeStudio options block is available in options
      if (options.dropletPaletteCategory) {
        this.editor.changePaletteGroup(options.dropletPaletteCategory);
        var scrollContainer = $('.droplet-palette-scroller');
        var scrollTo = $(options.selector);
        if (scrollTo.length > 0) {
          scrollContainer.scrollTop(
            scrollTo.offset().top -
              scrollContainer.offset().top +
              scrollContainer.scrollTop()
          );
        }
      } else if (options.codeString) {
        var range = this.editor.aceEditor.find(options.codeString, {
          caseSensitive: true,
          range: null,
          preventScroll: true
        });
        if (range) {
          var lineIndex = range.start.row;
          var line = lineIndex + 1; // 1-based line number
          if (this.currentlyUsingBlocks()) {
            options.selector =
              '.droplet-gutter-line:textEquals("' + line + '")';
            this.setDropletCursorToLine_(lineIndex);
            this.editor.scrollCursorIntoPosition();
            this.editor.redrawGutter();
          } else {
            options.selector = '.ace_gutter-cell:textEquals("' + line + '")';
            this.editor.aceEditor.scrollToLine(lineIndex);
            this.editor.aceEditor.renderer.updateFull(true);
          }
        }
      }
    }.bind(this)
  );

  // Prevent the backspace key from navigating back. Make sure it's still
  // allowed on other elements.
  // Based on http://stackoverflow.com/a/2768256/2506748
  $(document).on('keydown', function(event) {
    var doPrevent = false;
    if (event.keyCode !== KeyCodes.BACKSPACE) {
      return;
    }
    var d = event.srcElement || event.target;
    if (
      (d.tagName.toUpperCase() === 'INPUT' &&
        (d.type.toUpperCase() === 'TEXT' ||
          d.type.toUpperCase() === 'PASSWORD' ||
          d.type.toUpperCase() === 'FILE' ||
          d.type.toUpperCase() === 'EMAIL' ||
          d.type.toUpperCase() === 'SEARCH' ||
          d.type.toUpperCase() === 'NUMBER' ||
          d.type.toUpperCase() === 'DATE')) ||
      d.tagName.toUpperCase() === 'TEXTAREA'
    ) {
      doPrevent = d.readOnly || d.disabled;
    } else {
      doPrevent = !d.isContentEditable;
    }

    if (doPrevent) {
      event.preventDefault();
    }
  });

  if (this.instructionsDialog) {
    // Initializing the droplet editor in text mode (ace) can steal the focus
    // from our visible instructions dialog. Restore focus where it belongs:
    this.instructionsDialog.focus();
  }

  if (config.afterEditorReady) {
    config.afterEditorReady();
  }

  if (config.afterInject) {
    config.afterInject();
  }
};

/**
 * Enable adding/removing breakpoints by clicking in the gutter of the editor.
 * Prerequisites: Droplet editor must be in use and initialized (e.g. you have
 * to call handleEditCode_ first).
 */
StudioApp.prototype.enableBreakpoints = function() {
  if (!this.editor) {
    throw new Error('Droplet editor must be in use to enable breakpoints.');
  }

  // Set up an event handler to create breakpoints when clicking in the gutter:
  this.editor.on(
    'guttermousedown',
    function(e) {
      const bps = this.editor.getBreakpoints();
      const activeBreakpoint = bps[e.line];
      if (activeBreakpoint) {
        this.editor.clearBreakpoint(e.line);
      } else {
        this.editor.setBreakpoint(e.line);
      }

      // Log breakpoints usage to firehose. This is part of the work to add
      // inline teacher comments; we want to get a sense of how much
      // breakpoints are used and in what scenarios, so we can reason about the
      // feasibility of repurposing line number clicks for this feature.
      const currentUser = getStore().getState().currentUser;
      const userType = currentUser && currentUser.userType;
      firehoseClient.putRecord(
        {
          study: 'droplet-breakpoints',
          study_group: userType,
          event: 'guttermousedown',
          data_json: JSON.stringify({
            levelId: this.config.serverLevelId,
            lineNumber: e.line,
            activeBreakpoint,
            projectLevelId: this.config.serverProjectLevelId,
            scriptId: this.config.scriptId,
            scriptName: this.config.scriptName,
            studentUserId: queryParams('user_id'),
            url: window.location.toString()
          })
        },
        {includeUserId: true}
      );
    }.bind(this)
  );
};

/**
 * Checks whether the code has been changed from the original level code as
 * specified in levelbuilder. If the level has disabled this functionality,
 * by turning `validationEnabled` off, this will always return true.
 */
StudioApp.prototype.validateCodeChanged = function() {
  const level = this.config.level;
  if (!level.validationEnabled) {
    return true;
  }

  return project.isCurrentCodeDifferent(level.startBlocks);
};

/**
 * Set whether to alert user to empty blocks, short-circuiting all other tests.
 * @param {boolean} checkBlocks Whether to check for empty blocks.
 */
StudioApp.prototype.setCheckForEmptyBlocks = function(checkBlocks) {
  this.checkForEmptyBlocks_ = checkBlocks;
};

/**
 * Add the starting block(s).  Don't load lastAttempt for Jigsaw levels or the
 * level will advance as soon as it's loaded.
 * @param loadLastAttempt If true, try to load config.lastAttempt.
 */
StudioApp.prototype.setStartBlocks_ = function(config, loadLastAttempt) {
  if (config.level.edit_blocks) {
    loadLastAttempt = false;
  }
  var startBlocks = config.level.startBlocks || '';
  if (loadLastAttempt && config.levelGameName !== 'Jigsaw') {
    startBlocks = config.level.lastAttempt || startBlocks;
  }
  if (config.forceInsertTopBlock) {
    startBlocks = blockUtils.forceInsertTopBlock(
      startBlocks,
      config.forceInsertTopBlock
    );
  }
  if (config.level.sharedFunctions) {
    startBlocks = blockUtils.appendNewFunctions(
      startBlocks,
      config.level.sharedFunctions
    );
  }
  startBlocks = this.arrangeBlockPosition(startBlocks, config.blockArrangement);
  try {
    this.loadBlocks(startBlocks);
  } catch (e) {
    if (loadLastAttempt) {
      try {
        Blockly.mainBlockSpace.clear();
        // Try loading the default start blocks instead.
        this.setStartBlocks_(config, false);
      } catch (otherException) {
        // re-throw the original exception
        throw e;
      }
    } else {
      throw e;
    }
  }
};

/**
 * Show the configured starting function definition.
 * @param {AppOptionsConfig}
 */
StudioApp.prototype.openFunctionDefinition_ = function(config) {
  if (Blockly.contractEditor) {
    Blockly.contractEditor.autoOpenWithLevelConfiguration({
      autoOpenFunction: config.level.openFunctionDefinition,
      contractCollapse: config.level.contractCollapse,
      contractHighlight: config.level.contractHighlight,
      examplesCollapse: config.level.examplesCollapse,
      examplesHighlight: config.level.examplesHighlight,
      definitionCollapse: config.level.definitionCollapse,
      definitionHighlight: config.level.definitionHighlight
    });
  } else {
    Blockly.functionEditor.autoOpenFunction(
      config.level.openFunctionDefinition
    );
  }
};

/**
 * @param {AppOptionsConfig} config
 */
StudioApp.prototype.handleUsingBlockly_ = function(config) {
  // Allow empty blocks if editing blocks.
  if (config.level.edit_blocks) {
    this.checkForEmptyBlocks_ = false;
    if (
      config.level.edit_blocks === 'required_blocks' ||
      config.level.edit_blocks === TOOLBOX_EDIT_MODE ||
      config.level.edit_blocks === 'recommended_blocks'
    ) {
      // Don't show when run block for toolbox/required/recommended block editing
      config.forceInsertTopBlock = null;
    }
  }

  // If levelbuilder provides an empty toolbox, some apps (like artist)
  // replace it with a full toolbox. I think some levels may depend on this
  // behavior. We want a way to specify no toolbox, which is <xml></xml>
  if (config.level.toolbox) {
    var toolboxWithoutWhitespace = config.level.toolbox.replace(/\s/g, '');
    if (
      toolboxWithoutWhitespace === '<xml></xml>' ||
      toolboxWithoutWhitespace === '<xml/>'
    ) {
      config.level.toolbox = undefined;
    }
  }

  var div = document.getElementById('codeWorkspace');
  var options = {
    toolbox: config.level.toolbox,
    disableIfElseEditing: utils.valueOr(
      config.level.disableIfElseEditing,
      false
    ),
    disableParamEditing: utils.valueOr(config.level.disableParamEditing, true),
    disableVariableEditing: utils.valueOr(
      config.level.disableVariableEditing,
      false
    ),
    disableProcedureAutopopulate: utils.valueOr(
      config.level.disableProcedureAutopopulate,
      false
    ),
    topLevelProcedureAutopopulate: utils.valueOr(
      config.level.topLevelProcedureAutopopulate,
      false
    ),
    useModalFunctionEditor:
      config.level.edit_blocks !== TOOLBOX_EDIT_MODE &&
      !!config.level.useModalFunctionEditor,
    useContractEditor: utils.valueOr(config.level.useContractEditor, false),
    disableExamples: utils.valueOr(config.level.disableExamples, false),
    defaultNumExampleBlocks: utils.valueOr(
      config.level.defaultNumExampleBlocks,
      2
    ),
    scrollbars: config.level.scrollbars,
    hasVerticalScrollbars: config.hasVerticalScrollbars,
    hasHorizontalScrollbars:
      config.hasHorizontalScrollbars ||
      experiments.isEnabled('horizontalScroll'),
    editBlocks: utils.valueOr(config.level.edit_blocks, false),
    showUnusedBlocks: utils.valueOr(config.showUnusedBlocks, true),
    readOnly: utils.valueOr(config.readonlyWorkspace, false),
    showExampleTestButtons: utils.valueOr(config.showExampleTestButtons, false),
    valueTypeTabShapeMap: utils.valueOr(config.valueTypeTabShapeMap, {}),
    typeHints: utils.valueOr(config.level.showTypeHints, false),
    isBlocklyRtl:
      getStore().getState().isRtl && config.levelGameName !== 'Jigsaw' // disable RTL for blockly on jigsaw
  };

  // Never show unused blocks in edit mode. Procedure autopopulate should always
  // be enabled in edit mode. Except in toolbox mode where functions/behaviors
  // should never be created (and therefore the autopopulated blocks would be
  // confusing).
  if (options.editBlocks) {
    options.showUnusedBlocks = false;
    options.disableProcedureAutopopulate =
      options.editBlocks === TOOLBOX_EDIT_MODE;
  }

  [
    'trashcan',
    'varsInGlobals',
    'grayOutUndeletableBlocks',
    'disableParamEditing'
  ].forEach(function(prop) {
    if (config[prop] !== undefined) {
      options[prop] = config[prop];
    }
  });
  this.inject(div, options);
  this.onResize();
  this.setupChangeHandlers();

  if (config.afterInject) {
    config.afterInject();
  }
  this.setStartBlocks_(config, true);

  if (userAgentParser.isMobile() && userAgentParser.isSafari()) {
    // Mobile Safari resize events fire too early, see:
    // https://openradar.appspot.com/31725316
    // Rerun the blockly resize handler after 500ms when clientWidth/Height
    // should be correct
    window.setTimeout(() => Blockly.fireUiEvent(window, 'resize'), 500);
  }
};

/**
 * Handle updates after a droplet toggle between blocks/code has taken place
 */
StudioApp.prototype.onDropletToggle = function(autoFocus) {
  autoFocus = utils.valueOr(autoFocus, true);
  if (!this.currentlyUsingBlocks()) {
    if (autoFocus) {
      this.editor.aceEditor.focus();
    }
    this.dropletTooltipManager.registerDropletTextModeHandlers(this.editor);
  }
};

/**
 * Do we have any floating blocks not attached to an event block or function block?
 */
StudioApp.prototype.hasExtraTopBlocks = function() {
  return this.feedback_.hasExtraTopBlocks();
};

/**
 * Do we have any floating blocks that are not going to be handled
 * gracefully?
 */
StudioApp.prototype.hasUnwantedExtraTopBlocks = function() {
  return this.hasExtraTopBlocks() && !Blockly.showUnusedBlocks;
};

/**
 *
 */
StudioApp.prototype.hasQuestionMarksInNumberField = function() {
  return this.feedback_.hasQuestionMarksInNumberField();
};

/**
 * @returns true if any non-example block in the workspace has an unfilled input
 */
StudioApp.prototype.hasUnfilledFunctionalBlock = function() {
  return !!this.getUnfilledFunctionalBlock();
};

/**
 * @returns {Block} The first block that has an unfilled input, or undefined
 *   if there isn't one.
 */
StudioApp.prototype.getUnfilledFunctionalBlock = function() {
  return this.getFilteredUnfilledFunctionalBlock_(function(rootBlock) {
    return rootBlock.type !== 'functional_example';
  });
};

/**
 * @returns {Block} The first example block that has an unfilled input, or
 *   undefined if there isn't one. Ignores example blocks that don't have a
 *   call portion, as these are considered invalid.
 */
StudioApp.prototype.getUnfilledFunctionalExample = function() {
  return this.getFilteredUnfilledFunctionalBlock_(function(rootBlock) {
    if (rootBlock.type !== 'functional_example') {
      return false;
    }
    var actual = rootBlock.getInputTargetBlock('ACTUAL');
    return actual && actual.getTitleValue('NAME');
  });
};

/**
 * @param {function} filter Run against root block in chain. Returns true if
 *   this is a block we care about
 */
StudioApp.prototype.getFilteredUnfilledFunctionalBlock_ = function(filter) {
  var unfilledBlock;
  Blockly.mainBlockSpace.getAllUsedBlocks().some(function(block) {
    // Get the root block in the chain
    var rootBlock = block.getRootBlock();
    if (!filter(rootBlock)) {
      return false;
    }

    if (block.hasUnfilledFunctionalInput()) {
      unfilledBlock = block;
      return true;
    }
  });

  return unfilledBlock;
};

/**
 * @returns {string} The name of a function that doesn't have any examples, or
 *   undefined if all have at least one.
 */
StudioApp.prototype.getFunctionWithoutTwoExamples = function() {
  var definitionNames = Blockly.mainBlockSpace
    .getTopBlocks()
    .filter(function(block) {
      return block.type === 'functional_definition' && !block.isVariable();
    })
    .map(function(definitionBlock) {
      return definitionBlock.getProcedureInfo().name;
    });

  var exampleNames = Blockly.mainBlockSpace
    .getTopBlocks()
    .filter(function(block) {
      if (block.type !== 'functional_example') {
        return false;
      }

      // Only care about functional_examples that have an ACTUAL input (i.e. it's
      // clear which function they're for
      var actual = block.getInputTargetBlock('ACTUAL');
      return actual && actual.getTitleValue('NAME');
    })
    .map(function(exampleBlock) {
      return exampleBlock.getInputTargetBlock('ACTUAL').getTitleValue('NAME');
    });

  var definitionWithLessThanTwoExamples;
  definitionNames.forEach(function(def) {
    var definitionExamples = exampleNames.filter(function(example) {
      return def === example;
    });

    if (definitionExamples.length < 2) {
      definitionWithLessThanTwoExamples = def;
    }
  });
  return definitionWithLessThanTwoExamples;
};

/**
 * Get the error message when we have an unfilled block
 * @param {string} topLevelType The block.type For our expected top level block
 */
StudioApp.prototype.getUnfilledFunctionalBlockError = function(topLevelType) {
  var unfilled = this.getUnfilledFunctionalBlock();

  if (!unfilled) {
    return null;
  }

  var topParent = unfilled;
  while (topParent.getParent()) {
    topParent = topParent.getParent();
  }

  if (unfilled.type === topLevelType) {
    return msg.emptyTopLevelBlock({
      topLevelBlockName: unfilled.getTitleValue()
    });
  }

  if (topParent.type !== 'functional_definition') {
    return msg.emptyFunctionalBlock();
  }

  var procedureInfo = topParent.getProcedureInfo();
  if (topParent.isVariable()) {
    return msg.emptyBlockInVariable({name: procedureInfo.name});
  } else {
    return msg.emptyBlockInFunction({name: procedureInfo.name});
  }
};

/**
 * Looks for failing examples, and updates the result text for them if they're
 * open in the contract editor
 * @param {function} failureChecker Apps example tester that takes in an example
 *   block, and outputs a failure string (or null if success)
 * @returns {string} Name of block containing first failing example we found, or
 *   empty string if no failures.
 */
StudioApp.prototype.checkForFailingExamples = function(failureChecker) {
  var failingBlockName = '';
  Blockly.mainBlockSpace.findFunctionExamples().forEach(function(exampleBlock) {
    var failure = failureChecker(exampleBlock, false);

    // Update the example result. No-op if we're not currently editing this
    // function.
    Blockly.contractEditor.updateExampleResult(exampleBlock, failure);

    if (failure) {
      failingBlockName = exampleBlock
        .getInputTargetBlock('ACTUAL')
        .getTitleValue('NAME');
    }
  });
  return failingBlockName;
};

/**
 * @returns {boolean} True if we have a function or variable named "" (empty string)
 */
StudioApp.prototype.hasEmptyFunctionOrVariableName = function() {
  return Blockly.mainBlockSpace.getTopBlocks().some(function(block) {
    if (block.type !== 'functional_definition') {
      return false;
    }

    return !block.getProcedureInfo().name;
  });
};

StudioApp.prototype.createCoordinateGridBackground = function(options) {
  var svgName = options.svg;
  var origin = options.origin;
  var firstLabel = options.firstLabel;
  var lastLabel = options.lastLabel;
  var increment = options.increment;

  var CANVAS_HEIGHT = 400;

  var svg = document.getElementById(svgName);

  var bbox, text, rect;
  for (var label = firstLabel; label <= lastLabel; label += increment) {
    // create x axis labels
    text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.appendChild(document.createTextNode(label));
    svg.appendChild(text);
    bbox = text.getBBox();
    text.setAttribute('x', label - origin - bbox.width / 2);
    text.setAttribute('y', CANVAS_HEIGHT);
    text.setAttribute('font-weight', 'bold');
    rect = rectFromElementBoundingBox(text);
    rect.setAttribute('fill', color.white);
    svg.insertBefore(rect, text);

    // create y axis labels
    text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.appendChild(document.createTextNode(label));
    svg.appendChild(text);
    bbox = text.getBBox();
    text.setAttribute('x', 0);
    text.setAttribute('y', CANVAS_HEIGHT - (label - origin));
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-weight', 'bold');
    rect = rectFromElementBoundingBox(text);
    rect.setAttribute('fill', color.white);
    svg.insertBefore(rect, text);
  }
};

function rectFromElementBoundingBox(element) {
  var bbox = element.getBBox();
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', bbox.x);
  rect.setAttribute('y', bbox.y);
  rect.setAttribute('width', bbox.width);
  rect.setAttribute('height', bbox.height);
  return rect;
}

/**
 * Displays a small alert box inside the workspace
 * @param {string} type - Alert type (error, warning, or notification)
 * @param {React.Component} alertContents
 */
StudioApp.prototype.displayWorkspaceAlert = function(
  type,
  alertContents,
  bottom = false,
  onClose = () => {}
) {
  var parent = $(bottom && this.editCode ? '#codeTextbox' : '#codeWorkspace');
  var container = $('<div/>');
  parent.append(container);
  const workspaceAlert = React.createElement(
    WorkspaceAlert,
    {
      type: type,
      onClose: () => {
        onClose();
        ReactDOM.unmountComponentAtNode(container[0]);
      },
      isBlockly: this.usingBlockly_,
      isCraft: this.config && this.config.app === 'craft',
      displayBottom: bottom
    },
    alertContents
  );
  ReactDOM.render(workspaceAlert, container[0]);

  return container[0];
};

/**
 * Displays a small alert box inside the playspace
 * @param {string} type - Alert type (error, warning, or notification)
 * @param {React.Component} alertContents
 */
StudioApp.prototype.displayPlayspaceAlert = function(type, alertContents) {
  var parent = $('#visualization');
  var container = parent.children('.react-alert');
  if (container.length === 0) {
    container = $("<div class='react-alert ignore-transform'/>").css({
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      zIndex: 1000,
      transform: 'scale(1.0)'
    });
    parent.append(container);
  }
  var renderElement = container[0];

  let alertProps = {
    onClose: () => {
      ReactDOM.unmountComponentAtNode(renderElement);
    },
    type: type
  };

  if (type === NOTIFICATION_ALERT_TYPE) {
    alertProps.closeDelayMillis = 5000;
    alertProps.childPadding = '8px 14px';
  } else {
    alertProps.sideMargin = 20;
  }

  const playspaceAlert = React.createElement(Alert, alertProps, alertContents);
  ReactDOM.render(playspaceAlert, renderElement);
};

/**
 * If the current project is considered abusive, display a small alert box
 */
StudioApp.prototype.alertIfAbusiveProject = function() {
  if (project.exceedsAbuseThreshold()) {
    this.displayWorkspaceAlert(
      'error',
      <AbuseError
        i18n={{
          tos: msg.tosLong({url: 'http://code.org/tos'}),
          contact_us: msg.contactUs({url: 'https://code.org/contact'})
        }}
      />
    );
  }
};

/**
 * If the current project violates privacy policy or contains profanity,
 * display a small alert box.
 */
StudioApp.prototype.alertIfProfaneOrPrivacyViolatingProject = function() {
  if (project.hasPrivacyProfanityViolation()) {
    this.displayWorkspaceAlert(
      'error',
      <AbuseError
        i18n={{
          tos: msg.policyViolation(),
          contact_us: msg.contactUs({url: 'https://code.org/contact'})
        }}
      />
    );
  }
};

/**
 * Searches for cases where we have two (or more) nested for loops in which
 * both loops use the same variable. This can cause infinite loops.
 * @returns {boolean} True if we detect an instance of this.
 */
StudioApp.prototype.hasDuplicateVariablesInForLoops = function() {
  if (this.editCode) {
    return false;
  }
  return Blockly.mainBlockSpace
    .getAllUsedBlocks()
    .some(this.forLoopHasDuplicatedNestedVariables_);
};

/**
 * Looks to see if a particular block is (a) a for loop and (b) has a descendant
 * for loop using the same variable.
 * @returns {boolean} True if that is true of this block
 */
StudioApp.prototype.forLoopHasDuplicatedNestedVariables_ = function(block) {
  if (
    !block ||
    (block.type !== 'controls_for' && block.type !== 'controls_for_counter')
  ) {
    return;
  }

  var innerBlock = block.getInput('DO').connection.targetBlock();

  // Not the most efficient of algo's, but we shouldn't have enough blocks for
  // it to matter.
  return (
    innerBlock &&
    Blockly.Variables.allVariablesFromBlock(block).some(function(varName) {
      return innerBlock.getDescendants().some(function(descendant) {
        if (
          descendant.type !== 'controls_for' &&
          descendant.type !== 'controls_for_counter'
        ) {
          return false;
        }
        return (
          Blockly.Variables.allVariablesFromBlock(descendant).indexOf(
            varName
          ) !== -1
        );
      });
    })
  );
};

/**
 * Polishes the generated code string before displaying it to the user. If the
 * app provided a polishCodeHook function, it will be called.
 * @returns {string} code string that may/may not have been modified.
 */
StudioApp.prototype.polishGeneratedCodeString = function(code) {
  if (this.polishCodeHook) {
    return this.polishCodeHook(code);
  } else {
    return code;
  }
};

/**
 * Returns whether this view should be responsive based on level options.
 * Responsive means that the visualizationColumn should resize as the
 * window width changes, and that a grippy is available to manually resize
 * the visualizationColumn.
 */
StudioApp.prototype.isResponsiveFromConfig = function(config) {
  const isWorkspaceView = !config.hideSource;
  return config.embed || isWorkspaceView;
};

/**
 * Checks if the level a teacher is viewing of a students has
 * not been started.
 * For contained levels and project levels don't show the banner ever.
 * Otherwise check if the teacher is viewing (readonlyWorkspace) and if
 * the level has been started.
 */
StudioApp.prototype.displayNotStartedBanner = function(config) {
  if (config.hasContainedLevels || config.level.isProjectLevel) {
    return false;
  } else {
    return config.readonlyWorkspace && !config.level.isStarted;
  }
};

/**
 * Sets a bunch of common page constants used by all of our apps in our redux
 * store based on our app options config.
 * @param {AppOptionsConfig} config
 * @param {object} appSpecificConstants - Optional additional constants that
 *   are app specific.
 */
StudioApp.prototype.setPageConstants = function(config, appSpecificConstants) {
  const level = config.level;
  const combined = _.assign(
    {
      ttsShortInstructionsUrl: level.ttsShortInstructionsUrl,
      ttsLongInstructionsUrl: level.ttsLongInstructionsUrl,
      skinId: config.skinId,
      showNextHint: this.showNextHint.bind(this),
      locale: config.locale,
      assetUrl: this.assetUrl,
      isReadOnlyWorkspace: !!config.readonlyWorkspace,
      isDroplet: !!level.editCode,
      isBlockly: this.isUsingBlockly(),
      isBramble: config.app && config.app === 'weblab',
      hideSource: !!config.hideSource,
      isChallengeLevel: !!config.isChallengeLevel,
      isEmbedView: !!config.embed,
      isResponsive: this.isResponsiveFromConfig(config),
      displayNotStartedBanner: this.displayNotStartedBanner(config),
      isShareView: !!config.share,
      pinWorkspaceToBottom: !!config.pinWorkspaceToBottom,
      noInstructionsWhenCollapsed: !!config.noInstructionsWhenCollapsed,
      hasContainedLevels: config.hasContainedLevels,
      puzzleNumber: level.puzzle_number,
      lessonTotal: level.lesson_total,
      noVisualization: false,
      visualizationInWorkspace: false,
      smallStaticAvatar: config.skin.smallStaticAvatar,
      failureAvatar: config.skin.failureAvatar,
      aniGifURL: config.level.aniGifURL,
      inputOutputTable: config.level.inputOutputTable,
      is13Plus: config.is13Plus,
      isSignedIn: config.isSignedIn,
      userId: config.userId,
      verifiedTeacher: config.verifiedTeacher,
      textToSpeechEnabled: config.textToSpeechEnabled,
      isK1: config.level.isK1,
      appType: config.app,
      nextLevelUrl: config.nextLevelUrl,
      showProjectTemplateWorkspaceIcon:
        !!config.level.projectTemplateLevelName &&
        !config.level.isK1 &&
        !config.readonlyWorkspace,
      serverScriptId: config.serverScriptId,
      serverLevelId: config.serverLevelId
    },
    appSpecificConstants
  );

  getStore().dispatch(setPageConstants(combined));

  const instructionsConstants = determineInstructionsConstants(config);
  getStore().dispatch(setInstructionsConstants(instructionsConstants));
};

StudioApp.prototype.showRateLimitAlert = function() {
  // only show the alert once per session
  if (this.hasSeenRateLimitAlert_) {
    return false;
  }
  this.hasSeenRateLimitAlert_ = true;

  var alert = <div>{msg.dataLimitAlert()}</div>;
  if (this.share) {
    this.displayPlayspaceAlert('error', alert);
  } else {
    this.displayWorkspaceAlert('error', alert);
  }

  logToCloud.addPageAction(logToCloud.PageAction.FirebaseRateLimitExceeded, {
    isEditing: project.isEditing(),
    isOwner: project.isOwner(),
    share: !!this.share
  });
};

/** @return Promise */
StudioApp.prototype.loadLibraries = function(helperLibraryNames = []) {
  if (!this.libraryPreload_) {
    this.libraryPreload_ = Promise.all(
      helperLibraryNames.map(this.loadLibrary_.bind(this))
    );
  }
  return this.libraryPreload_;
};

/** @return Promise */
StudioApp.prototype.loadLibrary_ = async function(name) {
  if (this.libraries[name]) {
    return;
  }

  const response = await fetch('/libraries/' + name);
  this.libraries[name] = await response.text();
};

let instance;

/** @return StudioApp */
export function singleton() {
  if (!instance) {
    instance = new StudioApp();
  }
  return instance;
}

if (IN_UNIT_TEST) {
  let __oldInstance;

  module.exports.stubStudioApp = function() {
    if (__oldInstance) {
      throw new Error(
        'StudioApp has already been stubbed. Did you forget to call restore?'
      );
    }
    __oldInstance = instance;
    instance = null;
  };

  module.exports.restoreStudioApp = function() {
    instance.removeAllListeners();
    instance.libraries = {};
    if (instance.changeListener) {
      Blockly.removeChangeListener(instance.changeListener);
    }
    instance = __oldInstance;
    __oldInstance = null;
  };
}
