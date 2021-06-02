import $ from 'jquery';
import {getStore} from './redux';
import React from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import LegacyDialog from './code-studio/LegacyDialog';
import project from './code-studio/initApp/project';
import {dataURIToBlob} from './imageUtils';
import trackEvent from './util/trackEvent';
import {getValidatedResult} from './containedLevels';
import PublishDialog from './templates/projects/publishDialog/PublishDialog';
import DownloadReplayVideoButton from './code-studio/components/DownloadReplayVideoButton';
import {
  showPublishDialog,
  PUBLISH_REQUEST,
  PUBLISH_SUCCESS,
  PUBLISH_FAILURE
} from './templates/projects/publishDialog/publishDialogRedux';
import {createHiddenPrintWindow} from './utils';
import testImageAccess from './code-studio/url_test';
import {TestResults, KeyCodes} from './constants';
import QRCode from 'qrcode.react';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import experiments from '@cdo/apps/util/experiments';
import clientState from '@cdo/apps/code-studio/clientState';

// Types of blocks that do not count toward displayed block count. Used
// by FeedbackUtils.blockShouldBeCounted_
var UNCOUNTED_BLOCK_TYPES = ['draw_colour', 'alpha', 'comment'];

/**
 * Bag of utility functions related to building and displaying feedback
 * to students.
 * @class
 * @param {StudioApp} studioApp A studioApp instance used to pull
 *   configuration and perform operations.
 */
var FeedbackUtils = function(studioApp) {
  this.studioApp_ = studioApp;
};
module.exports = FeedbackUtils;

// Globals used in this file:
//   Blockly

var codegen = require('./lib/tools/jsinterpreter/codegen');
/** @type {Object<string, function>} */
var msg = require('@cdo/locale');
var dom = require('./dom');
var FeedbackBlocks = require('./feedbackBlocks');
var puzzleRatingUtils = require('./puzzleRatingUtils');
var DialogButtons = require('./templates/DialogButtons');
var CodeWritten = require('./templates/feedback/CodeWritten');
var GeneratedCode = require('./templates/feedback/GeneratedCode');

import ChallengeDialog from './templates/ChallengeDialog';

const FIREHOSE_STUDY = 'feedback_dialog';
let dialog_type = 'default';

/**
 * @typedef {Object} FeedbackOptions
 * @property {LiveMilestoneResponse} response
 * @property {TestResult} feedbackType
 * @property {string} message
 * @property {Level} level
 * @property {boolean} showingSharing
 * @property {Object<string, string>} appStrings
 * @property {string} feedbackImage
 * @property {boolean} defaultToContinue
 * @property {boolean} preventDialog
 * @property {ExecutionError} executionError
 * @property {boolean} hideXButton
 * @property {string} shareLink
 */

/**
 * @typedef {{ err, lineNumber: number}} ExecutionError
 */

/**
 * @typedef {Object} TestableBlock
 * @property {string|function} test - A test whether the block is
 *           present, either:
 *           - A string, in which case the string is searched for in
 *             the generated code.
 *           - A single-argument function is called on each user-added
 *             block individually.  If any call returns true, the block
 *             is deemed present.  "User-added" blocks are ones that are
 *             neither disabled or undeletable.
 * @property {string} type - The type of block to be produced for
 *           display to the user if the test failed.
 * @property {Object<string,string>} [titles] - A dictionary, where, for each
 *           KEY-VALUE pair, this is added to the block definition:
 *           <title name="KEY">VALUE</title>.
 * @property {Object<string,string>} [value] - A dictionary, where, for each
 *           KEY-VALUE pair, this is added to the block definition:
 *           <value name="KEY">VALUE</value>
 * @property {string} [extra] - A string that should be blacked
 *           between the "block" start and end tags.
 * @property {string} blockDisplayXML - XML string representing the block.
 */

/**
 * @param {FeedbackOptions} options
 * @param {!TestableBlock[]} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 * @param {number} maxRequiredBlocksToFlag The number of required blocks to
 *   give hints about at any one time.  Set this to Infinity to show all.
 * @param {!TestableBlock[]} recommendedBlocks The blocks that are recommended to be used in
 *   the solution to this level.
 * @param {number} maxRecommendedBlocksToFlag The number of recommended blocks to
 *   give hints about at any one time.  Set this to Infinity to show all.
 */
FeedbackUtils.prototype.displayFeedback = function(
  options,
  requiredBlocks,
  maxRequiredBlocksToFlag,
  recommendedBlocks,
  maxRecommendedBlocksToFlag
) {
  options.level = options.level || {};

  const {onContinue, shareLink} = options;
  const hadShareFailure = options.response && options.response.share_failure;
  const showingSharing =
    options.showingSharing && !hadShareFailure && shareLink;

  var canContinue = this.canContinueToNextLevel(options.feedbackType);
  var displayShowCode =
    this.studioApp_.enableShowCode &&
    this.studioApp_.enableShowLinesCount &&
    canContinue &&
    !showingSharing;
  var feedback = document.createElement('div');
  var sharingDiv =
    canContinue && showingSharing ? this.createSharingDiv(options) : null;
  var showCode = displayShowCode ? this.getShowCodeElement_(options) : null;
  var shareFailureDiv = hadShareFailure ? this.getShareFailure_(options) : null;
  var feedbackBlocks;
  if (this.studioApp_.isUsingBlockly()) {
    feedbackBlocks = new FeedbackBlocks(
      options,
      this.getMissingBlocks_(requiredBlocks, maxRequiredBlocksToFlag),
      this.getMissingBlocks_(recommendedBlocks, maxRecommendedBlocksToFlag)
    );
  }
  // feedbackMessage must be initialized after feedbackBlocks
  // because FeedbackBlocks can mutate options.response.hint.
  var feedbackMessage = this.getFeedbackMessageElement_(options);

  if (feedbackMessage) {
    feedback.appendChild(feedbackMessage);
  }
  if (feedbackBlocks && feedbackBlocks.div) {
    feedback.appendChild(feedbackBlocks.div);
  }
  if (sharingDiv) {
    feedback.appendChild(sharingDiv);
  }
  if (showingSharing) {
    var shareCodeSpacer = document.createElement('div');
    shareCodeSpacer.className = 'share-code-spacer';
    feedback.appendChild(shareCodeSpacer);
  }
  if (shareFailureDiv) {
    feedback.appendChild(shareFailureDiv);
  }
  if (showCode) {
    feedback.appendChild(showCode);
  }
  if (options.level.isK1) {
    feedback.className += ' k1';
  }
  if (options.appDiv) {
    feedback.appendChild(options.appDiv);
  }

  feedback.className += canContinue ? ' win-feedback' : ' failure-feedback';

  var finalLevel =
    options.response && options.response.message === 'no more levels';

  feedback.appendChild(
    this.getFeedbackButtons_({
      feedbackType: options.feedbackType,
      tryAgainText: options.tryAgainText,
      hideTryAgain: options.hideTryAgain,
      keepPlayingText: options.keepPlayingText,
      continueText: options.continueText,
      isK1: options.level.isK1,
      freePlay: options.level.freePlay,
      finalLevel: finalLevel
    })
  );

  var againButton = feedback.querySelector('#again-button');
  var hintRequestButton = feedback.querySelector('#hint-request-button');
  var continueButton = feedback.querySelector('#continue-button');

  // Don't show the continue button on share pages.
  if (this.studioApp_.share) {
    continueButton.style.display = 'none';
  }

  const onlyContinue = continueButton && !againButton;
  const defaultContinue = onlyContinue || options.defaultToContinue;

  /**
   * get the topmost missing recommended block, if it exists, to be
   * added to the queue of contextual hints. If the user views the block
   * in the dialog, mark it as seen and add it to the list as such.
   * @type !BlockHint[]
   */
  var missingRecommendedBlockHints = this.getMissingBlockHints(
    recommendedBlocks,
    options.level.isK1
  );
  var markContextualHintsAsSeen = function() {
    missingRecommendedBlockHints
      .filter(function(hint) {
        return (
          feedbackBlocks &&
          feedbackBlocks.xml &&
          feedbackBlocks.xml.indexOf(hint.blockDisplayXML) > -1
        );
      })
      .forEach(function(hint) {
        hint.alreadySeen = true;
      });
  };

  // If we're showing a share link, fire-and-forget a project save right before showing the dialog
  // so that any changes made since the last Run are reflected in the shared project.
  if (showingSharing) {
    project.saveIfSourcesChanged();
  }

  var onHidden = onlyContinue
    ? onContinue
    : function() {
        if (!continueButton || feedbackDialog.hideButDontContinue) {
          this.studioApp_.displayMissingBlockHints(
            missingRecommendedBlockHints
          );
        } else {
          onContinue();
        }
      }.bind(this);

  var icon;
  if (!options.hideIcon) {
    if (
      canContinue &&
      (!this.studioApp_.hasContainedLevels || getValidatedResult())
    ) {
      icon = this.studioApp_.winIcon;
    } else {
      icon = this.studioApp_.failureIcon;
    }
  }
  const defaultBtnSelector = defaultContinue
    ? '#continue-button'
    : '#again-button';

  const actualBlocks = this.getNumCountableBlocks();
  const idealBlocks = this.studioApp_.IDEAL_BLOCK_NUM;
  const isPerfect = actualBlocks <= idealBlocks;
  const showPuzzleRatingButtons =
    options.response && options.response.puzzle_ratings_enabled;

  if (showingSharing) {
    dialog_type = 'share';
    if (idealBlocks !== Infinity) {
      dialog_type += '_validate';
    }
  } else if (idealBlocks !== Infinity) {
    dialog_type = 'validate';
  }

  if (getStore().getState().pageConstants.isChallengeLevel) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let onChallengeContinue = onContinue;
    if (showPuzzleRatingButtons) {
      onChallengeContinue = () => {
        puzzleRatingUtils.cachePuzzleRating(container, {
          script_id: options.response.script_id,
          level_id: options.response.level_id
        });
        onContinue();
      };
    }
    if (isPerfect) {
      ReactDOM.render(
        <ChallengeDialog
          title={msg.challengeLevelPerfectTitle()}
          avatar={icon}
          complete
          handlePrimary={onChallengeContinue}
          primaryButtonLabel={msg.continue()}
          cancelButtonLabel={msg.tryAgain()}
          showPuzzleRatingButtons={showPuzzleRatingButtons}
        >
          {displayShowCode && this.getShowCodeComponent_(options, true)}
        </ChallengeDialog>,
        container
      );
    } else {
      ReactDOM.render(
        <ChallengeDialog
          title={msg.challengeLevelPassTitle()}
          avatar={icon}
          handlePrimary={onChallengeContinue}
          primaryButtonLabel={msg.continue()}
          cancelButtonLabel={msg.tryAgain()}
          showPuzzleRatingButtons={showPuzzleRatingButtons}
          text={msg.challengeLevelPassText({idealBlocks})}
        >
          {displayShowCode && this.getShowCodeComponent_(options, true)}
        </ChallengeDialog>,
        container
      );
    }
    return;
  }

  $('#feedback-dialog').remove();

  var feedbackDialog = this.createModalDialog({
    contentDiv: feedback,
    icon: icon,
    defaultBtnSelector: defaultBtnSelector,
    onHidden: onHidden,
    id: 'feedback-dialog',
    showXButton: !options.hideXButton
  });

  if (againButton) {
    dom.addClickTouchEvent(againButton, function() {
      logDialogActions(
        'replay_level',
        options,
        idealBlocks === Infinity ? null : isPerfect
      );
      feedbackDialog.hideButDontContinue = true;
      feedbackDialog.hide();
      feedbackDialog.hideButDontContinue = false;
    });
  }

  // If there is a hint request button, hide the hint that would ordinarily
  // be shown (including any feedback blocks), and add code to restore the
  // hint if the button gets pressed.
  if (hintRequestButton) {
    var alreadySeen =
      options.response &&
      options.response.hint_view_requests &&
      options.response.hint_view_requests.some(function(request) {
        var requestMatchesFeedback =
          request.feedback_type === options.feedbackType;
        if (feedbackBlocks && feedbackBlocks.xml) {
          requestMatchesFeedback =
            requestMatchesFeedback &&
            request.feedback_xml === feedbackBlocks.xml;
        }
        return requestMatchesFeedback;
      });

    if (alreadySeen) {
      // Remove "Show hint" button.  Making it invisible isn't enough,
      // because it will still take up space.
      hintRequestButton.parentNode.removeChild(hintRequestButton);

      // mark the corresponding block hint as seen
      markContextualHintsAsSeen();
    } else {
      // Generate a generic feedback message to display when we show the
      // feedback block
      var genericFeedback = this.getFeedbackMessageElement_({
        message: msg.tryBlocksBelowFeedback()
      });

      // If there are feedback blocks, temporarily hide them.
      if (feedbackBlocks && feedbackBlocks.div) {
        feedbackBlocks.hide();
      }

      // If the user requests the hint...
      dom.addClickTouchEvent(hintRequestButton, function() {
        // mark the corresponding block hint as seen
        markContextualHintsAsSeen();

        // Swap out the specific feedback message with a generic one.
        var parentNode = feedbackMessage.parentNode;
        parentNode.replaceChild(genericFeedback, feedbackMessage);

        // Remove "Show hint" button.  Making it invisible isn't enough,
        // because it will still take up space.
        hintRequestButton.parentNode.removeChild(hintRequestButton);

        // Restore feedback blocks, if present.
        if (feedbackBlocks && feedbackBlocks.div) {
          feedbackBlocks.show();
        }

        // Report hint request to server.
        if (options.response.hint_view_request_url) {
          $.ajax({
            url: options.response.hint_view_request_url,
            type: 'POST',
            data: {
              script_id: options.response.script_id,
              level_id: options.response.level_id,
              feedback_type: options.feedbackType,
              feedback_xml: feedbackBlocks ? feedbackBlocks.xml : undefined
            }
          });
        }
      });
    }
  }

  if (continueButton) {
    if (options.response && options.response.puzzle_ratings_enabled) {
      feedback.appendChild(puzzleRatingUtils.buildPuzzleRatingButtons());
    }

    dom.addClickTouchEvent(continueButton, function() {
      logDialogActions(
        'continue',
        options,
        idealBlocks === Infinity ? null : isPerfect
      );
      feedbackDialog.hide();

      if (options.response && options.response.puzzle_ratings_enabled) {
        puzzleRatingUtils.cachePuzzleRating(feedback, {
          script_id: options.response.script_id,
          level_id: options.response.level_id
        });
      }
    });
  }

  // Remember the project between when we save and when we publish
  // while the dialog is open, but not between dialog openings.
  let projectId = null;
  let projectType = null;

  const saveButtonSelector = '#save-to-project-gallery-button';
  const saveButton = feedback.querySelector(saveButtonSelector);
  if (saveButton) {
    dom.addClickTouchEvent(saveButton, () => {
      $(saveButtonSelector)
        .prop('disabled', true)
        .text(msg.addingToProjects());
      project
        .copy(project.getNewProjectName())
        .then(() => FeedbackUtils.saveThumbnail(options.feedbackImage))
        .then(() => {
          projectId = project.getCurrentId();
          projectType = project.getStandaloneApp();
          $(saveButtonSelector)
            .prop('disabled', true)
            .text(msg.addedToProjects());
        })
        .catch(err => console.log(err));
    });
  }

  const publishButtonSelector = '#publish-to-project-gallery-button';
  const publishButton = feedback.querySelector(publishButtonSelector);
  if (publishButton) {
    dom.addClickTouchEvent(publishButton, () => {
      // Hide the current dialog since we're about to show the publish dialog
      feedbackDialog.hideButDontContinue = true;
      feedbackDialog.hide();
      feedbackDialog.hideButDontContinue = false;

      const store = getStore();

      if (projectId && projectType) {
        // The user previously saved and is now publishing. Publish the project
        // which we just saved, rather than creating a new one and publishing it.
        store.dispatch(showPublishDialog(projectId, projectType));
        let publishDialog = FeedbackUtils.getPublishDialogElement();
        ReactDOM.render(
          <Provider store={store}>
            <PublishDialog afterPublish={() => showFeedbackDialog(true)} />
          </Provider>,
          publishDialog
        );
        return;
      }

      // project.copy relies on state not in redux, and we want to keep this
      // badness out of our redux code. Therefore, define what happens when
      // publish dialog publish button is clicked here, outside of the publish
      // dialog redux.
      //
      // Once project.js is moved onto redux, the remix-and-publish operation
      // should be moved inside the publish dialog redux.

      FeedbackUtils.showConfirmPublishDialog(() => {
        store.dispatch({type: PUBLISH_REQUEST});
        let didPublish = false;
        project
          .copy(project.getNewProjectName(), {shouldPublish: true})
          .then(() => FeedbackUtils.saveThumbnail(options.feedbackImage))
          .then(() => {
            store.dispatch({type: PUBLISH_SUCCESS});
            didPublish = true;
          })
          .catch(err => {
            console.log(err);
            store.dispatch({type: PUBLISH_FAILURE});
          })
          .then(() => {
            if (didPublish) {
              // Only show feedback dialog again if publishing succeeded,
              // because we keep the publish dialog open if it failed.
              showFeedbackDialog(true);
            }
          });
      });
    });
  }

  var printButton = feedback.querySelector('#print-button');
  if (printButton) {
    dom.addClickTouchEvent(printButton, function() {
      createHiddenPrintWindow(options.feedbackImage);
    });
  }

  function showFeedbackDialog(isPublished) {
    feedbackDialog.show({
      backdrop:
        getStore().getState().pageConstants.appType === 'flappy'
          ? 'static'
          : true
    });

    if (isPublished) {
      $(publishButtonSelector)
        .prop('disabled', true)
        .text(msg.published());
      $(saveButtonSelector)
        .prop('disabled', true)
        .text(msg.savedToGallery());
    }
  }

  showFeedbackDialog();

  if (feedbackBlocks && feedbackBlocks.div) {
    feedbackBlocks.render();
  }
};

function logDialogActions(event, options, isPerfect) {
  if (experiments.isEnabled(experiments.FINISH_DIALOG_METRICS)) {
    firehoseClient.putRecord({
      study: FIREHOSE_STUDY,
      study_group: dialog_type,
      event: event,
      data_json: JSON.stringify({
        level_type: options.level ? options.level.skin : null,
        level_id: options.response ? options.response.level_id : null,
        level_path: options.response ? options.response.level_path : null,
        isPerfectBlockCount: isPerfect
      })
    });
  }
}

FeedbackUtils.showConfirmPublishDialog = onConfirmPublish => {
  const store = getStore();
  store.dispatch(showPublishDialog());
  let publishDialog = FeedbackUtils.getPublishDialogElement();
  ReactDOM.render(
    <Provider store={store}>
      <PublishDialog onConfirmPublishOverride={onConfirmPublish} />
    </Provider>,
    publishDialog
  );
};

FeedbackUtils.getPublishDialogElement = function() {
  let publishDialog = document.getElementById('legacy-share-publish-dialog');
  if (!publishDialog) {
    publishDialog = document.createElement('div');
    publishDialog.id = 'legacy-share-publish-dialog';
    document.body.appendChild(publishDialog);
  }
  return publishDialog;
};

/**
 * Converts the image data uri to a blob, then saves it to the server as the
 * thumbnail for the current project.
 * @param {string} image Image encoded as a data URI.
 * @returns {Promise} A promise which resolves if successful.
 */
FeedbackUtils.saveThumbnail = function(image) {
  if (!image) {
    return Promise.resolve();
  }
  return dataURIToBlob(image)
    .then(project.saveThumbnail)
    .then(() => project.saveIfSourcesChanged());
};

FeedbackUtils.isLastLevel = function() {
  const lesson = getStore().getState().progress.stages[0];
  return (
    lesson.levels[lesson.levels.length - 1].ids.indexOf(
      window.appOptions.serverLevelId
    ) !== -1
  );
};

/**
 * Counts the number of blocks used.  Blocks are only counted if they are
 * not disabled, are deletable.
 * @return {number} Number of blocks used.
 */
FeedbackUtils.prototype.getNumBlocksUsed = function() {
  if (this.studioApp_.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = this.getGeneratedCodeString_().split('\n');
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length > 1 && (lines[i][0] !== '/' || lines[i][1] !== '/')) {
        codeLines++;
      }
    }
    return codeLines;
  } else if (this.studioApp_.isUsingBlockly()) {
    return this.getUserBlocks_().length;
  } else {
    return 0;
  }
};

/**
 * Counts the total number of blocks. Blocks are only counted if they are
 * not disabled.
 * @return {number} Total number of blocks.
 */
FeedbackUtils.prototype.getNumCountableBlocks = function() {
  var i;
  if (getStore().getState().pageConstants.isBramble) {
    return 0;
  } else if (this.studioApp_.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = this.getGeneratedCodeString_().split('\n');
    for (i = 0; i < lines.length; i++) {
      if (lines[i].length > 1 && (lines[i][0] !== '/' || lines[i][1] !== '/')) {
        codeLines++;
      }
    }
    return codeLines;
  } else {
    return this.getCountableBlocks_().length;
  }
};

/**
 *
 */
FeedbackUtils.prototype.getFeedbackButtons_ = function(options) {
  var buttons = document.createElement('div');
  buttons.id = 'feedbackButtons';

  let tryAgainText = undefined;
  if (!options.hideTryAgain) {
    if (options.tryAgainText) {
      tryAgainText = options.tryAgainText;
    } else if (this.studioApp_.hasContainedLevels) {
      tryAgainText = msg.reviewCode();
    } else if (options.feedbackType === TestResults.FREE_PLAY) {
      tryAgainText = msg.keepPlaying();
    } else if (options.feedbackType === TestResults.FREE_PLAY_UNCHANGED_FAIL) {
      tryAgainText = msg.keepWorking();
    } else if (options.feedbackType < TestResults.MINIMUM_OPTIMAL_RESULT) {
      tryAgainText = msg.tryAgain();
    } else {
      tryAgainText = msg.replayButton();
    }
  }

  ReactDOM.render(
    React.createElement(DialogButtons, {
      tryAgain: tryAgainText,
      continueText:
        options.continueText ||
        (options.finalLevel ? msg.finish() : msg.continue()),
      nextLevel: this.canContinueToNextLevel(options.feedbackType),
      shouldPromptForHint: this.shouldPromptForHint(options.feedbackType),
      userId: options.userId,
      isK1: options.isK1,
      assetUrl: this.studioApp_.assetUrl,
      freePlay: options.freePlay
    }),
    buttons
  );

  return buttons;
};

/**
 *
 */
FeedbackUtils.prototype.getShareFailure_ = function(options) {
  var shareFailure = options.response.share_failure;
  var shareFailureDiv = document.createElement('div');
  shareFailureDiv.innerHTML = require('./templates/shareFailure.html.ejs')({
    shareFailure: shareFailure
  });
  return shareFailureDiv;
};

/**
 * Generates an appropriate feedback message
 * The message will be one of the following, from highest to lowest precedence:
 * 0. Failure override message specified on level (options.level.failureMessageOverride)
 * 1. Message passed in by caller (options.message).
 * 2. Header message due to dashboard text check fail (options.response.share_failure).
 * 3. Level-specific message (e.g., options.level.emptyBlocksErrorMsg) for
 *    specific result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
 * 4. System-wide message (e.g., msg.emptyBlocksErrorMsg()) for specific
 *    result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
 * @param {FeedbackOptions} options
 * @return {string} message
 */
FeedbackUtils.prototype.getFeedbackMessage = function(options) {
  var message;

  // If a message was explicitly passed in, use that.
  if (
    options.feedbackType < TestResults.ALL_PASS &&
    options.level &&
    options.level.failureMessageOverride
  ) {
    message = options.level.failureMessageOverride;
  } else if (options.message) {
    message = options.message;
  } else if (options.response && options.response.share_failure) {
    message = msg.shareFailure();
  } else {
    // Otherwise, the message will depend on the test result.
    switch (options.feedbackType) {
      case TestResults.FREE_PLAY_UNCHANGED_FAIL:
        logDialogActions('level_unchanged_failure', options, null);
        message = options.useDialog
          ? msg.freePlayUnchangedFail()
          : msg.freePlayUnchangedFailInline();
        break;
      case TestResults.RUNTIME_ERROR_FAIL:
        message = msg.runtimeErrorMsg({
          lineNumber: options.executionError.lineNumber
        });
        break;
      case TestResults.SYNTAX_ERROR_FAIL:
        message = msg.syntaxErrorMsg({
          lineNumber: options.executionError.lineNumber
        });
        break;
      case TestResults.EMPTY_BLOCK_FAIL:
        message =
          options.level.emptyBlocksErrorMsg || msg.emptyBlocksErrorMsg();
        break;
      case TestResults.EMPTY_FUNCTION_BLOCK_FAIL:
        if (options.level.emptyFunctionBlocksErrorMsg) {
          message = options.level.emptyFunctionBlocksErrorMsg;
        } else if (
          Blockly.useContractEditor ||
          Blockly.useModalFunctionEditor
        ) {
          message = msg.errorEmptyFunctionBlockModal();
        } else {
          message = msg.emptyFunctionBlocksErrorMsg();
        }
        break;
      case TestResults.TOO_FEW_BLOCKS_FAIL:
        // This should be replaced by the LEVEL_INCOMPLETE_FAIL case, but some
        // levels still override tooFewBlocksMsg.
        message =
          options.level.tooFewBlocksMsg ||
          options.level.levelIncompleteError ||
          msg.levelIncompleteError();
        break;
      case TestResults.LEVEL_INCOMPLETE_FAIL:
      case TestResults.LOG_CONDITION_FAIL:
        message =
          options.level.levelIncompleteError || msg.levelIncompleteError();
        break;
      case TestResults.EXTRA_TOP_BLOCKS_FAIL:
        var hasWhenRun = Blockly.mainBlockSpace
          .getTopBlocks()
          .some(function(block) {
            return block.type === 'when_run' && block.isUserVisible();
          });

        var defaultMessage = hasWhenRun
          ? msg.extraTopBlocksWhenRun()
          : msg.extraTopBlocks();
        message = options.level.extraTopBlocks || defaultMessage;
        break;
      case TestResults.APP_SPECIFIC_FAIL:
        message = options.level.appSpecificFailError;
        break;
      case TestResults.GENERIC_LINT_FAIL:
        message = msg.errorGenericLintError();
        break;
      case TestResults.UNUSED_PARAM:
        message = msg.errorUnusedParam();
        break;
      case TestResults.UNUSED_FUNCTION:
        message = msg.errorUnusedFunction();
        break;
      case TestResults.PARAM_INPUT_UNATTACHED:
        message = msg.errorParamInputUnattached();
        break;
      case TestResults.INCOMPLETE_BLOCK_IN_FUNCTION:
        message = msg.errorIncompleteBlockInFunction();
        break;
      case TestResults.QUESTION_MARKS_IN_NUMBER_FIELD:
        message = msg.errorQuestionMarksInNumberField();
        break;
      case TestResults.BLOCK_LIMIT_FAIL:
        var exceededBlockType = this.hasExceededLimitedBlocks_();
        var limit = Blockly.mainBlockSpace.blockSpaceEditor.blockLimits.getLimit(
          exceededBlockType
        );
        var block = `<xml><block type='${exceededBlockType}'></block></xml>`;
        message = msg.errorExceededLimitedBlocks({limit}) + block;
        break;
      case TestResults.TOO_MANY_BLOCKS_FAIL:
        // Allow apps to override the "too many blocks" failure message
        // Passed as a msg function to allow the parameters to be passed in.
        var messageFunction =
          (options.appStrings &&
            options.appStrings.tooManyBlocksFailMsgFunction) ||
          msg.numBlocksNeeded;
        message = messageFunction({
          numBlocks: this.studioApp_.IDEAL_BLOCK_NUM,
          puzzleNumber: options.level.puzzle_number || 0
        });
        break;
      case TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL:
        message = options.level.appSpecificAcceptableFailError;
        break;
      case TestResults.EDIT_BLOCKS:
        message = options.level.edit_blocks_success;
        break;
      case TestResults.MISSING_BLOCK_UNFINISHED:
      /* fallthrough */
      case TestResults.MISSING_BLOCK_FINISHED:
        message =
          options.level.missingRequiredBlocksErrorMsg ||
          msg.missingRequiredBlocksErrorMsg();
        break;
      case TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED:
        message = msg.missingRecommendedBlocksErrorMsg();
        break;
      case TestResults.MISSING_RECOMMENDED_BLOCK_FINISHED:
        var numEnabledBlocks = this.getNumCountableBlocks();
        if (
          this.studioApp_.IDEAL_BLOCK_NUM &&
          numEnabledBlocks > this.studioApp_.IDEAL_BLOCK_NUM
        ) {
          message = msg.numBlocksNeeded({
            numBlocks: this.studioApp_.IDEAL_BLOCK_NUM,
            puzzleNumber: options.level.puzzle_number || 0
          });
        } else {
          message = msg.completedWithoutRecommendedBlock({
            puzzleNumber: options.level.puzzle_number || 0
          });
        }
        break;
      case TestResults.NESTED_FOR_SAME_VARIABLE:
        message = msg.nestedForSameVariable();
        break;

      // Success.
      case TestResults.ALL_PASS:
      case TestResults.FREE_PLAY:
      case TestResults.BETTER_THAN_IDEAL:
      case TestResults.PASS_WITH_EXTRA_TOP_BLOCKS:
        var finalLevel =
          options.response && options.response.message === 'no more levels';
        var lessonCompleted = null;
        if (options.response && options.response.lesson_changing) {
          lessonCompleted = options.response.lesson_changing.previous.name;
        }
        var msgParams = {
          lessonNumber: 0, // TODO: remove once localized strings have been fixed
          lessonName: lessonCompleted,
          puzzleNumber: options.level.puzzle_number || 0
        };
        if (
          options.feedbackType === TestResults.FREE_PLAY &&
          !options.level.disableSharing
        ) {
          var reinfFeedbackMsg =
            (options.appStrings && options.appStrings.reinfFeedbackMsg) || '';

          if (options.level.disableFinalLessonMessage) {
            message = reinfFeedbackMsg;
          } else {
            message = finalLevel ? msg.finalStage(msgParams) + ' ' : '';
            message = message + reinfFeedbackMsg;
          }
        } else {
          var nextLevelMsg =
            (options.appStrings && options.appStrings.nextLevelMsg) ||
            msg.nextLevel(msgParams);
          message = finalLevel
            ? msg.finalStage(msgParams)
            : lessonCompleted
            ? msg.nextStage(msgParams)
            : nextLevelMsg;
        }
        break;
    }
  }
  return message;
};

/**
 * @returns {element} a document element with the appropriate feedback message.
 * @see FeedbackUtils.prototype.getFeedbackMessage
 */
FeedbackUtils.prototype.getFeedbackMessageElement_ = function(options) {
  var feedback = document.createElement('p');
  feedback.className = 'congrats';

  let message = this.getFeedbackMessage(options);
  $(feedback).text(message);

  return feedback;
};

/**
 * @param {Object} options
 * @param {MilestoneResponse} options.response
 */
FeedbackUtils.prototype.createSharingDiv = function(options) {
  // TODO: this bypasses the config encapsulation to ensure we have the most up-to-date value.
  if (
    this.studioApp_.disableSocialShare ||
    window.appOptions.disableSocialShare ||
    options.disableSocialShare
  ) {
    // Clear out our urls so that we don't display any of our social share links
    options.twitterUrl = undefined;
    options.facebookUrl = undefined;
  } else {
    // set up the twitter share url
    var twitterUrl =
      'https://twitter.com/intent/tweet?url=' + options.shareLink;

    if (options.twitter && options.twitter.text !== undefined) {
      twitterUrl += '&text=' + encodeURI(options.twitter.text);
    } else {
      twitterUrl +=
        '&text=' + encodeURI(msg.defaultTwitterText() + ' @codeorg');
    }

    if (options.twitter && options.twitter.hashtag !== undefined) {
      twitterUrl += '&hashtags=' + options.twitter.hashtag;
    } else {
      twitterUrl += '&hashtags=' + 'HourOfCode';
    }

    if (options.twitter && options.twitter.related !== undefined) {
      twitterUrl += '&related=' + options.twitter.related;
    } else {
      twitterUrl += '&related=codeorg';
    }

    options.twitterUrl = twitterUrl;

    // set up the facebook share url
    var facebookUrl =
      'https://www.facebook.com/sharer/sharer.php?u=' + options.shareLink;
    options.facebookUrl = facebookUrl;
  }

  options.assetUrl = this.studioApp_.assetUrl;

  // An early optimization; only render the container for
  // DownloadReplayVideoButton if we think we're actually going to use it.
  // @see DownloadReplayVideoButton.hasReplayVideo
  options.downloadReplayVideo =
    getStore().getState().pageConstants.appType === 'dance' &&
    window.appOptions.signedReplayLogUrl;

  var sharingDiv = document.createElement('div');
  sharingDiv.setAttribute('id', 'sharing');
  sharingDiv.innerHTML = require('./templates/sharing.html.ejs')({
    options: options
  });

  // Note: We have a dependency on dashboard here. This dependency has always
  // been here (we used to mysteriously just always bubble clicks on body to
  // a.popup-window if it existed), but it is now more explicit
  if (window.dashboard && window.dashboard.popupWindow) {
    $(sharingDiv)
      .find('a.popup-window')
      .click(window.dashboard.popupWindow);
  }

  var sharingInput = sharingDiv.querySelector('#sharing-input');
  if (sharingInput) {
    dom.addClickTouchEvent(sharingInput, function() {
      sharingInput.focus();
      sharingInput.select();
      sharingInput.setSelectionRange(0, 9999);
    });
  }

  var sharingFacebook = sharingDiv.querySelector('#sharing-facebook');
  if (sharingFacebook) {
    testImageAccess(
      'https://facebook.com/favicon.ico' + '?' + Math.random(),
      () => $(sharingFacebook).show()
    );
  }

  var sharingTwitter = sharingDiv.querySelector('#sharing-twitter');
  if (sharingTwitter) {
    testImageAccess(
      'https://twitter.com/favicon.ico' + '?' + Math.random(),
      () => $(sharingTwitter).show()
    );
  }

  //  QR Code & SMS-to-phone feature
  var sharingPhone = sharingDiv.querySelector('#sharing-phone');
  dom.addClickTouchEvent(sharingPhone, function() {
    var sendToPhone = sharingDiv.querySelector('#send-to-phone');
    if ($(sendToPhone).is(':hidden')) {
      $(sendToPhone).show();

      var qrCode = sharingDiv.querySelector('#send-to-phone-qr-code');
      var annotatedShareLink = options.shareLink + '?qr=true';
      ReactDOM.render(<QRCode value={annotatedShareLink} size={90} />, qrCode);

      if (sharingPhone && options.isUS) {
        var phone = $(sharingDiv.querySelector('#phone'));
        var submitted = false;
        var submitButton = sharingDiv.querySelector('#phone-submit');
        submitButton.disabled = true;
        phone.mask('(000) 000-0000', {
          onComplete: function() {
            if (!submitted) {
              submitButton.disabled = false;
            }
          },
          onChange: function() {
            submitButton.disabled = true;
          }
        });
        phone.focus();
        dom.addClickTouchEvent(submitButton, function() {
          var phone = $(sharingDiv.querySelector('#phone'));
          var params = $.param({
            level_source: options.response.level_source_id,
            channel_id: options.channelId,
            type: project.getStandaloneApp(),
            phone: phone.val()
          });
          $(submitButton).val('Sending..');
          phone.prop('readonly', true);
          submitButton.disabled = true;
          submitted = true;
          $.post(options.response.phone_share_url, params)
            .done(function(response) {
              $(submitButton).text('Sent!');
              trackEvent('SendToPhone', 'success');
            })
            .fail(function(xhr) {
              $(submitButton).text('Error!');
              trackEvent('SendToPhone', 'error');
            });
        });
      }
    } else {
      // not hidden, hide
      $(sendToPhone).hide();
    }
  });

  var downloadReplayVideoContainer = sharingDiv.querySelector(
    '#download-replay-video-container'
  );
  if (downloadReplayVideoContainer) {
    const onDownloadError = () => $('#download-replay-video-error').show();
    ReactDOM.render(
      <Provider store={getStore()}>
        <DownloadReplayVideoButton onError={onDownloadError} />
      </Provider>,
      downloadReplayVideoContainer
    );
  }

  return sharingDiv;
};

FeedbackUtils.prototype.getShowCodeElement_ = function(options) {
  const showCodeDiv = document.createElement('div');
  showCodeDiv.setAttribute('id', 'show-code');
  ReactDOM.render(this.getShowCodeComponent_(options), showCodeDiv);

  // If the jQuery details polyfill is available, use it on the
  // newly-created details element. If the details polyfill is not
  // available - either because it failed to load or was removed - then
  // the browser-specified details functionality will be applied.
  if ($.fn.details) {
    $(showCodeDiv)
      .find('details')
      .details();
  }

  return showCodeDiv;
};

FeedbackUtils.prototype.getShowCodeComponent_ = function(
  options,
  challenge = false
) {
  const numLinesWritten = this.getNumBlocksUsed();
  // Use the response from the server if we have one. Otherwise use the client's data.
  const totalLines =
    (options.response && options.response.total_lines) || clientState.lines();

  const generatedCodeProperties = this.getGeneratedCodeProperties({
    generatedCodeDescription:
      options.appStrings && options.appStrings.generatedCodeDescription
  });

  return (
    <CodeWritten
      numLinesWritten={numLinesWritten}
      totalNumLinesWritten={totalLines}
      useChallengeStyles={challenge}
    >
      <GeneratedCode
        message={generatedCodeProperties.message}
        code={generatedCodeProperties.code}
      />
    </CodeWritten>
  );
};

/**
 * Determines whether the user can proceed to the next level, based on the level feedback.
 * @param {TestResult} feedbackType
 * @return {boolean}
 */
FeedbackUtils.prototype.canContinueToNextLevel = function(feedbackType) {
  return feedbackType >= TestResults.MINIMUM_PASS_RESULT;
};

/**
 * Determines whether we should prompt the user to show the given
 * feedback, rather than showing it to them automatically. Currently
 * only used for missing block feedback; may expand in the future
 * @param {TestResult} feedbackType
 */
FeedbackUtils.prototype.shouldPromptForHint = function(feedbackType) {
  return (
    feedbackType === TestResults.MISSING_BLOCK_UNFINISHED ||
    feedbackType === TestResults.MISSING_BLOCK_FINISHED ||
    feedbackType === TestResults.MISSING_RECOMMENDED_BLOCK_FINISHED ||
    feedbackType === TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED
  );
};

/**
 * Retrieve a string containing the user's generated Javascript code.
 */
FeedbackUtils.prototype.getGeneratedCodeString_ = function() {
  if (getStore().getState().pageConstants.isBramble) {
    return '';
  } else if (this.studioApp_.editCode) {
    return this.studioApp_.editor ? this.studioApp_.editor.getValue() : '';
  } else {
    return codegen.workspaceCode(Blockly);
  }
};

/**
 * Generates a "show code" React component with a description of what
 * code is.
 * @param {Object} [options] - optional
 * @param {string} [options.generatedCodeDescription] - optional
 *        description of code to put in place instead of the default
 * @returns {React}
 * @private
 */
FeedbackUtils.prototype.getGeneratedCodeProperties = function(options) {
  options = options || {};

  const codeInfoMsgParams = {
    berkeleyLink:
      "<a href='http://bjc.berkeley.edu/' target='_blank'>Berkeley</a>",
    harvardLink:
      "<a href='https://cs50.harvard.edu/' target='_blank'>Harvard</a>"
  };

  const {message, shortMessage} = this.getGeneratedCodeDescriptions_(
    codeInfoMsgParams,
    options.generatedCodeDescription
  );
  const code = this.studioApp_.polishGeneratedCodeString(
    this.getGeneratedCodeString_()
  );

  return {
    message,
    shortMessage,
    code
  };
};

/**
 * Generates explanation of what code is.
 * @param {Object} codeInfoMsgParams - params for generatedCodeInfo msg function
 * @param {String} [generatedCodeDescription] - optional description to use
 *        instead of the default
 * @returns {string}
 */
FeedbackUtils.prototype.getGeneratedCodeDescriptions_ = function(
  codeInfoMsgParams,
  generatedCodeDescription
) {
  if (this.studioApp_.editCode) {
    return {
      message: '',
      shortMessage: ''
    };
  }

  if (generatedCodeDescription) {
    return {
      message: generatedCodeDescription,
      shortMessage: generatedCodeDescription
    };
  }

  return {
    message: msg.generatedCodeInfo(codeInfoMsgParams),
    shortMessage: msg.shortGeneratedCodeInfo(codeInfoMsgParams)
  };
};

/**
 * Display the 'Show Code' modal dialog.
 * @param {Object} [appStrings] - optional app strings to override
 * @param {string} [appStrings.generatedCodeDescription] - string
 *        to display instead of the usual show code description
 */
FeedbackUtils.prototype.showGeneratedCode = function(appStrings) {
  var codeDiv = document.createElement('div');

  var generatedCodeProperties = this.getGeneratedCodeProperties({
    generatedCodeDescription: appStrings && appStrings.generatedCodeDescription
  });

  ReactDOM.render(
    <div>
      <GeneratedCode
        message={generatedCodeProperties.message}
        code={generatedCodeProperties.code}
      />
      <DialogButtons ok={true} />
    </div>,
    codeDiv
  );

  var dialog = this.createModalDialog({
    contentDiv: codeDiv,
    icon: this.studioApp_.icon,
    defaultBtnSelector: '#ok-button'
  });

  var okayButton = codeDiv.querySelector('#ok-button');
  if (okayButton) {
    dom.addClickTouchEvent(okayButton, function() {
      dialog.hide();
    });
  }

  dialog.show();
};

/**
 * Display the "Clear Puzzle" confirmation dialog.  Takes a parameter to hide
 * the icon.  Calls `callback` if the user confirms they want to clear the puzzle.
 */
FeedbackUtils.prototype.showClearPuzzleConfirmation = function(
  hideIcon,
  callback
) {
  this.showSimpleDialog({
    headerText: msg.clearPuzzleConfirmHeader(),
    bodyText: msg.clearPuzzleConfirm(),
    confirmText: msg.clearPuzzle(),
    cancelText: msg.dialogCancel(),
    onConfirm: callback,
    onCancel: null,
    hideIcon: hideIcon
  });
};

/**
 * @callback onConfirmCallback
 */

/**
 * @callback onCancelCallback
 * @param {string} [text] Textbox value if prompting, otherwise omitted
 */

/**
 * Shows a simple dialog that has a header, body, continue button, and cancel
 * button
 * @param {object} options Configurable options.
 * @param {string} [options.headerText] Text for header portion
 * @param {string} [options.bodyText] Text for body portion
 * @param {boolean} [options.prompt=false] Whether to prompt for a string value
 * @param {string} [options.promptPrefill] If prompting, textbox prefill value
 * @param {string} options.cancelText Text for cancel button
 * @param {string} options.confirmText Text for confirm button
 * @param {boolean} [options.hideIcon=false] Whether to hide the icon
 * @param {onConfirmCallback} [options.onConfirm] Function to be called after clicking confirm
 * @param {onCancelCallback} [options.onCancel] Function to be called after clicking cancel
 */
FeedbackUtils.prototype.showSimpleDialog = function(options) {
  var textBoxStyle = {
    marginBottom: 10
  };
  var contentDiv = ReactDOM.render(
    <div>
      {options.headerText && (
        <p className="dialog-title">{options.headerText}</p>
      )}
      {options.bodyText && <p>{options.bodyText}</p>}
      {options.prompt && (
        <input style={textBoxStyle} defaultValue={options.promptPrefill} />
      )}
      <DialogButtons
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        cancelButtonClass={options.cancelButtonClass}
      />
    </div>,
    document.createElement('div')
  );

  var dialog = this.createModalDialog({
    contentDiv: contentDiv,
    icon: options.hideIcon ? null : this.studioApp_.icon,
    defaultBtnSelector: '#again-button'
  });

  var cancelButton = contentDiv.querySelector('#again-button');
  var textBox = contentDiv.querySelector('input');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function() {
      if (options.onCancel) {
        if (textBox) {
          options.onCancel(textBox.value);
        } else {
          options.onCancel();
        }
      }
      dialog.hide();
    });
  }

  var confirmButton = contentDiv.querySelector('#confirm-button');
  if (confirmButton) {
    dom.addClickTouchEvent(confirmButton, function() {
      if (options.onConfirm) {
        options.onConfirm();
      }
      dialog.hide();
    });
  }

  dialog.show();
  if (textBox) {
    textBox.focus();
    textBox.select();
  }
};

/**
 *
 */
FeedbackUtils.prototype.showToggleBlocksError = function() {
  var contentDiv = document.createElement('div');
  contentDiv.innerHTML = msg.toggleBlocksErrorMsg();

  var buttons = document.createElement('div');
  ReactDOM.render(
    React.createElement(DialogButtons, {
      ok: true
    }),
    buttons
  );
  contentDiv.appendChild(buttons);

  var dialog = this.createModalDialog({
    contentDiv: contentDiv,
    icon: this.studioApp_.icon,
    defaultBtnSelector: '#ok-button'
  });

  var okayButton = buttons.querySelector('#ok-button');
  if (okayButton) {
    dom.addClickTouchEvent(okayButton, function() {
      dialog.hide();
    });
  }

  dialog.show();
};

/**
 * Get an empty container block, if any are present.
 * @return {Blockly.Block} an empty container block, or null if none exist.
 */
FeedbackUtils.prototype.getEmptyContainerBlock_ = function() {
  var blocks = Blockly.mainBlockSpace.getAllUsedBlocks();
  return Blockly.findEmptyContainerBlock(blocks);
};

/**
 * Check for empty container blocks, and return an appropriate failure
 * code if any are found.
 * @return {TestResult} ALL_PASS if no empty blocks are present, or
 *   EMPTY_BLOCK_FAIL or EMPTY_FUNCTION_BLOCK_FAIL if empty blocks
 *   are found.
 */
FeedbackUtils.prototype.checkForEmptyContainerBlockFailure_ = function() {
  const emptyBlock = this.getEmptyContainerBlock_();
  if (!emptyBlock) {
    return TestResults.ALL_PASS;
  }

  const type = emptyBlock.type;
  if (type === 'procedures_defnoreturn' || type === 'procedures_defreturn') {
    const emptyBlockInfo = emptyBlock.getProcedureInfo();
    const findUsages = block =>
      block.type === emptyBlockInfo.callType &&
      block.getTitleValue('NAME') === emptyBlockInfo.name;

    if (Blockly.mainBlockSpace.getAllUsedBlocks().filter(findUsages).length) {
      return TestResults.EMPTY_FUNCTION_BLOCK_FAIL;
    } else {
      return TestResults.ALL_PASS;
    }
  }

  // Block is assumed to be "if" or "repeat" if we reach here.
  // This is where to add checks if you want a different TestResult
  // for "controls_for_counter" blocks, for example.
  return TestResults.EMPTY_BLOCK_FAIL;
};

/**
 * Throws errors with descriptive messages when example call or result blocks
 * don't exist or have unfilled functional inputs.
 * @param {Blockly.Block} callBlock
 * @param {Blockly.Block} resultBlock
 */
FeedbackUtils.prototype.throwOnInvalidExampleBlocks = function(
  callBlock,
  resultBlock
) {
  if (!callBlock) {
    throw new Error('Invalid Call Block');
  }

  if (!resultBlock) {
    throw new Error('Invalid Result Block');
  }

  if (resultBlock.hasUnfilledFunctionalInput()) {
    throw new Error('Result has unfilled inputs');
  }

  if (callBlock.hasUnfilledFunctionalInput()) {
    throw new Error('Call has unfilled inputs');
  }
};

/**
 * Check whether the user code has all the given blocks
 * @param {!TestableBlock[]} blocks
 * @return {boolean} true if all blocks are present, false otherwise.
 */
FeedbackUtils.prototype.hasAllBlocks_ = function(blocks) {
  // It's okay (maybe faster) to pass 1 for maxBlocksToFlag, since in the end
  // we want to check that there are zero blocks missing.
  var maxBlocksToFlag = 1;
  return (
    this.getMissingBlocks_(blocks, maxBlocksToFlag).blocksToDisplay.length === 0
  );
};

/**
 * Get blocks that the user intends in the program. These are the blocks
 * that are used when checking for required and recommended blocks and
 * when determining lines of code written.
 * @return {Array<Object>} The blocks.
 */
FeedbackUtils.prototype.getUserBlocks_ = function() {
  var allBlocks = Blockly.mainBlockSpace.getAllUsedBlocks();
  var blocks = allBlocks.filter(function(block) {
    var blockValid = !block.disabled && block.type !== 'when_run';
    // If Blockly is in readOnly mode, then all blocks are uneditable
    // so this filter would be useless. Ignore uneditable blocks only if
    // Blockly is in edit mode.
    if (!Blockly.mainBlockSpace.isReadOnly()) {
      blockValid = blockValid && block.isEditable();
    }
    return blockValid;
  });
  return blocks;
};

/**
 * Determine if a given block should count toward the displayed lines of
 * code. A valid block is one that is enabled, not of one of the
 * discounted block types, and not a child of one of the discounted
 * block types.
 * @param {Object} block
 * @return {boolean}
 */
FeedbackUtils.blockShouldBeCounted_ = function(block) {
  // disabled blocks are not counted
  if (block.disabled) {
    return false;
  }

  // blocks that are of one of the uncounted block types are not
  // counted, and neither are any of their children
  while (block !== null) {
    if (UNCOUNTED_BLOCK_TYPES.indexOf(block.type) > -1) {
      return false;
    }
    block = block.getSurroundParent();
  }

  return true;
};

/**
 * Get countable blocks in the program
 * These are used when determined the number of blocks relative to the ideal
 * block count.
 * @return {Array<Object>} The blocks.
 */
FeedbackUtils.prototype.getCountableBlocks_ = function() {
  var allBlocks = Blockly.mainBlockSpace.getAllUsedBlocks();
  var blocks = allBlocks.filter(FeedbackUtils.blockShouldBeCounted_);
  return blocks;
};

/**
 * @typedef {TestableBlock} BlockHint
 * @property {boolean} alreadySeen
 */
/**
 * Returns a list of zero or one objects representing blocks from the
 * set of passed blocks that are missing from the user's code and should
 * be presented to the user as hints.
 * @param {!TestableBlock[]} blocks
 * @param {boolean} [isK1=false]
 * @return {!BlockHint[]}
 */
FeedbackUtils.prototype.getMissingBlockHints = function(blocks, isK1 = false) {
  return this.getMissingBlocks_(blocks, 1).blocksToDisplay.map(function(
    /*BlockHint*/ block
  ) {
    // in K1, we default to already seen
    block.alreadySeen = isK1;
    return block;
  });
};

/**
 * Check to see if the user's code contains the given blocks for a level.
 * @param {!TestableBlock[]} blocks
 * @param {number} maxBlocksToFlag The maximum number of blocks to
 *   return. We most often only care about a single block at a time
 * @return {DisplayBlocks} 'missingBlocks' is an
 *   array of array of strings where each array of strings is a set of blocks
 *   that at least one of them should be used. Each block is represented as the
 *   prefix of an id in the corresponding template.soy.
 */
FeedbackUtils.prototype.getMissingBlocks_ = function(blocks, maxBlocksToFlag) {
  var missingBlocks = [];
  var customMessage = null;
  var code = null; // JavaScript code, which is initialized lazily.
  if (blocks && blocks.length) {
    var userBlocks = this.getUserBlocks_();
    // For each list of blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than the maxBlocksToFlag param.
    var missingBlockNum = 0;
    for (
      var i = 0;
      i < blocks.length && missingBlockNum < maxBlocksToFlag;
      i++
    ) {
      var block = blocks[i];
      // For each of the test
      // If at least one of the tests succeeded, we consider the block
      // is used
      var usedBlock = false;
      for (var testId = 0; testId < block.length; testId++) {
        var test = block[testId].test;
        if (typeof test === 'string') {
          code = code || Blockly.Generator.blockSpaceToCode('JavaScript');
          if (code.indexOf(test) !== -1) {
            // Succeeded, moving to the next list of tests
            usedBlock = true;
            break;
          }
        } else if (typeof test === 'function') {
          if (userBlocks.some(test)) {
            // Succeeded, moving to the next list of tests
            usedBlock = true;
            break;
          } else {
            customMessage = block[testId].message || customMessage;
          }
        } else {
          throw new Error('Bad test: ' + test);
        }
      }
      if (!usedBlock) {
        missingBlockNum++;
        missingBlocks = missingBlocks.concat(blocks[i][0]);
      }
    }
  }
  return {
    blocksToDisplay: missingBlocks,
    message: customMessage
  };
};

/**
 * Do we have any floating blocks not attached to an event block or function block?
 * @return {boolean}
 */
FeedbackUtils.prototype.hasExtraTopBlocks = function() {
  if (
    this.studioApp_.editCode ||
    getStore().getState().pageConstants.isBramble
  ) {
    return false;
  }
  var topBlocks = Blockly.mainBlockSpace.getTopBlocks();
  for (var i = 0; i < topBlocks.length; i++) {
    // ignore disabled top blocks. we have a level turtle:2_7 that depends on
    // having disabled top level blocks
    if (topBlocks[i].disabled) {
      continue;
    }
    // Ignore top blocks which are functional definitions.
    if (topBlocks[i].type === 'functional_definition') {
      continue;
    }
    // None of our top level blocks should have a previous or output connection
    // (they should only have a next)
    if (topBlocks[i].previousConnection || topBlocks[i].outputConnection) {
      return true;
    }
  }
  return false;
};

/**
 * Runs the tests and returns results.
 * @param {boolean} levelComplete Did the user successfully complete the level?
 * @param {!TestableBlock[]} requiredBlocks The blocks that are required
 *   to be used in the solution to this level.
 * @param {!TestableBlock[]} recommendedBlocks The blocks that are
 *   recommended to be used in the solution to this level.
 * @param {boolean} shouldCheckForEmptyBlocks Whether empty blocks should cause
 *   a test fail result.
 * @param {{executionError: ExecutionError, allowTopBlocks: boolean}} options
 * @return {number} The appropriate property of TestResults.
 */
FeedbackUtils.prototype.getTestResults = function(
  levelComplete,
  requiredBlocks,
  recommendedBlocks,
  shouldCheckForEmptyBlocks,
  options
) {
  options = options || {};
  if (getStore().getState().pageConstants.isBramble) {
    return TestResults.FREE_PLAY;
  }
  if (this.studioApp_.editCode) {
    if (levelComplete) {
      return TestResults.ALL_PASS;
    } else if (
      options.executionError &&
      options.executionError.err instanceof SyntaxError
    ) {
      return TestResults.SYNTAX_ERROR_FAIL;
    } else if (options.executionError) {
      return TestResults.RUNTIME_ERROR_FAIL;
    } else {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
  }
  if (shouldCheckForEmptyBlocks) {
    var emptyBlockFailure = this.checkForEmptyContainerBlockFailure_();
    if (emptyBlockFailure !== TestResults.ALL_PASS) {
      return emptyBlockFailure;
    }
  }
  if (
    !Blockly.showUnusedBlocks &&
    !options.allowTopBlocks &&
    this.hasExtraTopBlocks()
  ) {
    return TestResults.EXTRA_TOP_BLOCKS_FAIL;
  }
  if (this.studioApp_.hasDuplicateVariablesInForLoops()) {
    return TestResults.NESTED_FOR_SAME_VARIABLE;
  }
  if (Blockly.useContractEditor || Blockly.useModalFunctionEditor) {
    if (this.hasUnusedParam_()) {
      return TestResults.UNUSED_PARAM;
    }
    if (this.hasUnusedFunction_()) {
      return TestResults.UNUSED_FUNCTION;
    }
    if (this.hasParamInputUnattached_()) {
      return TestResults.PARAM_INPUT_UNATTACHED;
    }
    if (this.hasIncompleteBlockInFunction_()) {
      return TestResults.INCOMPLETE_BLOCK_IN_FUNCTION;
    }
  }
  if (this.hasQuestionMarksInNumberField()) {
    return TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
  }
  if (!this.hasAllBlocks_(requiredBlocks)) {
    return levelComplete
      ? TestResults.MISSING_BLOCK_FINISHED
      : TestResults.MISSING_BLOCK_UNFINISHED;
  }
  if (!this.hasAllBlocks_(recommendedBlocks)) {
    return levelComplete
      ? TestResults.MISSING_RECOMMENDED_BLOCK_FINISHED
      : TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED;
  }
  var numEnabledBlocks = this.getNumCountableBlocks();
  if (!levelComplete) {
    if (
      this.studioApp_.IDEAL_BLOCK_NUM &&
      this.studioApp_.IDEAL_BLOCK_NUM !== Infinity &&
      numEnabledBlocks < this.studioApp_.IDEAL_BLOCK_NUM
    ) {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
    return TestResults.LEVEL_INCOMPLETE_FAIL;
  }
  if (this.hasExceededLimitedBlocks_()) {
    return TestResults.BLOCK_LIMIT_FAIL;
  }
  if (
    this.studioApp_.IDEAL_BLOCK_NUM &&
    numEnabledBlocks > this.studioApp_.IDEAL_BLOCK_NUM
  ) {
    return TestResults.TOO_MANY_BLOCKS_FAIL;
  } else if (this.hasExtraTopBlocks() && Blockly.showUnusedBlocks) {
    return TestResults.PASS_WITH_EXTRA_TOP_BLOCKS;
  } else if (
    isFinite(this.studioApp_.IDEAL_BLOCK_NUM) &&
    numEnabledBlocks < this.studioApp_.IDEAL_BLOCK_NUM
  ) {
    return TestResults.BETTER_THAN_IDEAL;
  } else {
    return TestResults.ALL_PASS;
  }
};

/**
 * Fire off a click event in a cross-browser supported manner. This code is
 * similar to Blockly.fireUIEvent (without taking a Blockly dependency).
 */
function simulateClick(element) {
  if (document.createEvent) {
    // W3
    const evt = document.createEvent('UIEvents');
    evt.initEvent('click', true, true); // event type, bubbling, cancelable
    element.dispatchEvent(evt);
  } else if (document.createEventObject) {
    // MSIE
    element.fireEvent('onClick', document.createEventObject());
  } else {
    throw 'FireEvent: No event creation mechanism.';
  }
}

/**
 * Show a modal dialog without an icon.
 * @param {Object} options
 * @param {string} options.icon
 * @param {HTMLElement} options.contentDiv
 * @param {string} options.defaultBtnSelector
 * @param {boolean} options.markdownMode
 * @param {boolean} options.scrollContent
 * @param {boolean} options.scrollableSelector
 * @param {function} options.onHidden
 * @param {string} options.id
 * @param {HTMLElement} options.header
 * @param {boolean} options.showXButton
 */
FeedbackUtils.prototype.createModalDialog = function(options) {
  var modalBody = document.createElement('div');
  if (options.icon) {
    var imageDiv;
    imageDiv = document.createElement('img');
    imageDiv.className = 'modal-image';
    imageDiv.src = options.icon;
    modalBody.appendChild(imageDiv);
  } else {
    options.contentDiv.className += ' no-modal-icon';
  }

  if (options.markdownMode) {
    modalBody.className += ' markdown';
  }

  options.contentDiv.className += ' modal-content';
  modalBody.appendChild(options.contentDiv);

  var btn = options.contentDiv.querySelector(options.defaultBtnSelector);
  var keydownHandler = function(e) {
    if (e.keyCode === KeyCodes.ENTER || e.keyCode === KeyCodes.SPACE) {
      simulateClick(btn);

      e.stopPropagation();
      e.preventDefault();
    }
  };

  var scrollableSelector = options.scrollableSelector || '.modal-content';
  var elementToScroll = options.scrollContent ? scrollableSelector : null;
  return new LegacyDialog({
    body: modalBody,
    onHidden: options.onHidden,
    onKeydown: btn ? keydownHandler : undefined,
    autoResizeScrollableElement: elementToScroll,
    id: options.id,
    header: options.header,
    close: options.showXButton
  });
};

/**
 * Check for '???' instead of a value in block fields.
 */
FeedbackUtils.prototype.hasQuestionMarksInNumberField = function() {
  return Blockly.mainBlockSpace.getAllUsedBlocks().some(function(block) {
    return block.getTitles().some(function(title) {
      return title.value_ === '???' || title.text_ === '???';
    });
  });
};

/**
 * Ensure that all procedure definitions actually use the parameters they define
 * inside the procedure.
 */
FeedbackUtils.prototype.hasUnusedParam_ = function() {
  var self = this;
  return Blockly.mainBlockSpace.getAllUsedBlocks().some(function(userBlock) {
    var params = userBlock.parameterNames_;
    // Only search procedure definitions
    return (
      params &&
      params.some(function(paramName) {
        // Unused param if there's no parameters_get descendant with the same name
        return !self.hasMatchingDescendant_(userBlock, function(block) {
          return (
            (block.type === 'parameters_get' ||
              block.type === 'functional_parameters_get' ||
              block.type === 'variables_get') &&
            block.getTitleValue('VAR') === paramName
          );
        });
      })
    );
  });
};

/**
 * Ensure that all procedure calls have each parameter input connected.
 */
FeedbackUtils.prototype.hasParamInputUnattached_ = function() {
  return Blockly.mainBlockSpace.getAllUsedBlocks().some(function(userBlock) {
    // Only check procedure_call* blocks
    if (!/^procedures_call/.test(userBlock.type)) {
      return false;
    }
    return userBlock.inputList
      .filter(function(input) {
        return /^ARG/.test(input.name);
      })
      .some(function(argInput) {
        // Unattached param input if any ARG* connection target is null
        return !argInput.connection.targetConnection;
      });
  });
};

/**
 * Ensure that all user-declared procedures have associated call blocks.
 */
FeedbackUtils.prototype.hasUnusedFunction_ = function() {
  var userDefs = [];
  var callBlocks = {};
  Blockly.mainBlockSpace.getAllUsedBlocks().forEach(function(block) {
    var name = block.getTitleValue('NAME');
    if (/^procedures_def/.test(block.type) && block.userCreated) {
      userDefs.push(name);
    } else if (/^procedures_call/.test(block.type)) {
      callBlocks[name] = true;
    }
  });
  // Unused function if some user def doesn't have a matching call
  return userDefs.some(function(name) {
    return !callBlocks[name];
  });
};

/**
 * Ensure there are no incomplete blocks inside any function definitions.
 */
FeedbackUtils.prototype.hasIncompleteBlockInFunction_ = function() {
  var self = this;
  return Blockly.mainBlockSpace.getAllUsedBlocks().some(function(userBlock) {
    // Only search procedure definitions
    if (!userBlock.parameterNames_) {
      return false;
    }
    return self.hasMatchingDescendant_(userBlock, function(block) {
      // Incomplete block if any input connection target is null
      return block.inputList.some(function(input) {
        return (
          input.type === Blockly.INPUT_VALUE &&
          !input.connection.targetConnection
        );
      });
    });
  });
};

/**
 * Returns true if any descendant (inclusive) of the given node matches the
 * given filter.
 */
FeedbackUtils.prototype.hasMatchingDescendant_ = function(node, filter) {
  if (filter(node)) {
    return true;
  }
  var self = this;
  return node.childBlocks_.some(function(child) {
    return self.hasMatchingDescendant_(child, filter);
  });
};

/**
 * Ensure that all limited toolbox blocks aren't exceeded.
 */
FeedbackUtils.prototype.hasExceededLimitedBlocks_ = function() {
  const blockLimits = Blockly.mainBlockSpace.blockSpaceEditor.blockLimits;
  return blockLimits.blockLimitExceeded && blockLimits.blockLimitExceeded();
};
