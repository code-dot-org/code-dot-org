/* global trackEvent, $, jQuery */

// NOTE: These must be kept in sync with activity_hint.rb in dashboard.
var HINT_REQUEST_PLACEMENT = {
  NONE: 0,  // This value must not be changed.
  LEFT: 1,  // Hint request button is on left.
  RIGHT: 2  // Hint request button is on right.
};

/**
 * Bag of utility functions related to building and displaying feedback
 * to students.
 * @class
 * @param {StudioApp} studioApp A studioApp instance used to pull
 *   configuration and perform operations.
 */
var FeedbackUtils = function (studioApp) {
  this.studioApp_ = studioApp;
};
module.exports = FeedbackUtils;

// Globals used in this file:
//   Blockly

var trophy = require('./templates/trophy.html.ejs');
var utils = require('./utils');
var _ = utils.getLodash();
var codegen = require('./codegen');
var msg = require('../locale/current/common');
var dom = require('./dom');
var xml = require('./xml');
var FeedbackBlocks = require('./feedbackBlocks');
var constants = require('./constants');
var TestResults = constants.TestResults;
var KeyCodes = constants.KeyCodes;

/**
 * @param {Object} options
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 * @param {number} maxRequiredBlocksToFlag The number of required blocks to
 *   give hints about at any one time.  Set this to Infinity to show all.
 */
FeedbackUtils.prototype.displayFeedback = function(options, requiredBlocks,
    maxRequiredBlocksToFlag) {
  options.hintRequestExperiment = options.response &&
      options.response.hint_request_placement;
  options.level = options.level || {};
  options.numTrophies = this.numTrophiesEarned_(options);

  // Tracking event for level newly completed
  if (options.response && options.response.new_level_completed) {
    trackEvent('Puzzle', 'Completed', options.response.level_path, options.response.level_attempts);
  }

  var hadShareFailure = (options.response && options.response.share_failure);
  var showingSharing = options.showingSharing && !hadShareFailure;

  var canContinue = this.canContinueToNextLevel(options.feedbackType);
  var displayShowCode = this.studioApp_.enableShowCode && canContinue && !showingSharing;
  var feedback = document.createElement('div');
  var sharingDiv = (canContinue && showingSharing) ? this.createSharingDiv(options) : null;
  var showCode = displayShowCode ? this.getShowCodeElement_(options) : null;
  var shareFailureDiv = hadShareFailure ? this.getShareFailure_(options) : null;
  if (hadShareFailure) {
    trackEvent('Share', 'Failure', options.response.share_failure.type);
  }
  var feedbackBlocks;
  if (this.studioApp_.isUsingBlockly()) {
    feedbackBlocks = new FeedbackBlocks(
        options,
        this.getMissingRequiredBlocks_(requiredBlocks, maxRequiredBlocksToFlag),
        this.studioApp_);
  }
  // feedbackMessage must be initialized after feedbackBlocks
  // because FeedbackBlocks can mutate options.response.hint.
  var feedbackMessage = this.getFeedbackMessage_(options);

  if (feedbackMessage) {
    feedback.appendChild(feedbackMessage);
  }
  if (options.numTrophies) {
    // Tracking event for new trophy earned
    if (options.numTrophies > 0) {
      for (var i = 0; i < options.numTrophies; i++) {
        var concept_name = options.response.trophy_updates[i][0];
        var trophy_name = options.response.trophy_updates[i][1];
        trackEvent('Trophy', concept_name, trophy_name);
      }
    }
    var trophies = this.getTrophiesElement_(options);
    feedback.appendChild(trophies);
  }
  if (feedbackBlocks && feedbackBlocks.div) {
    if (feedbackMessage && this.useSpecialFeedbackDesign_(options)) {
      // put the blocks iframe inside the feedbackMessage for this special case:
      feedbackMessage.appendChild(feedbackBlocks.div);
    } else {
      feedback.appendChild(feedbackBlocks.div);
    }
  }
  if (sharingDiv) {
    feedback.appendChild(sharingDiv);
  }
  if (showingSharing) {
    var shareCodeSpacer = document.createElement('div');
    shareCodeSpacer.className = "share-code-spacer";
    feedback.appendChild(shareCodeSpacer);
  }
  if (shareFailureDiv) {
    feedback.appendChild(shareFailureDiv);
  }
  if (showCode) {
    feedback.appendChild(showCode);
  }
  if (options.level.isK1) {
    feedback.className += " k1";
  }
  if (options.appDiv) {
    feedback.appendChild(options.appDiv);
  }

  feedback.appendChild(
    this.getFeedbackButtons_({
      feedbackType: options.feedbackType,
      tryAgainText: options.tryAgainText,
      continueText: options.continueText,
      showPreviousButton: options.level.showPreviousLevelButton,
      isK1: options.level.isK1,
      hintRequestExperiment: options.hintRequestExperiment,
      freePlay: options.level.freePlay
    })
  );

  var againButton = feedback.querySelector('#again-button');
  var hintRequestButton = feedback.querySelector('#hint-request-button');
  var previousLevelButton = feedback.querySelector('#back-button');
  var continueButton = feedback.querySelector('#continue-button');

  var onlyContinue = continueButton && !againButton && !previousLevelButton;

  var onHidden = onlyContinue ? options.onContinue : null;
  var icon = canContinue ? this.studioApp_.winIcon : this.studioApp_.failureIcon;
  var defaultBtnSelector = onlyContinue ? '#continue-button' : '#again-button';

  var feedbackDialog = this.createModalDialogWithIcon({
    Dialog: options.Dialog,
    contentDiv: feedback,
    icon: icon,
    defaultBtnSelector: defaultBtnSelector,
    onHidden: onHidden,
    id: 'feedback-dialog'
  });

  // Update the background color if it is set to be in special design.
  if (this.useSpecialFeedbackDesign_(options)) {
    if (options.response.design == "white_background") {
      document.getElementById('feedback-dialog')
          .className += " white-background";
      document.getElementById('feedback-content')
          .className += " light-yellow-background";
    }
  }

  if (againButton) {
    dom.addClickTouchEvent(againButton, function() {
      feedbackDialog.hide();
    });
  }

  if (previousLevelButton) {
    dom.addClickTouchEvent(previousLevelButton, function() {
      feedbackDialog.hide();
      options.backToPreviousLevel();
    });
  }

  // If there is a hint request button, hide the hint that would ordinarily
  // be shown (including any feedback blocks), and add code to restore the
  // hint if the button gets pressed.
  if (hintRequestButton) {
    // Swap out the specific feedback message with a generic one.
    var genericFeedback = this.getFeedbackMessage_({message: msg.genericFeedback()});
    var parentNode = feedbackMessage.parentNode;
    parentNode.replaceChild(genericFeedback, feedbackMessage);

    // If there are feedback blocks, temporarily remove them.
    // Get pointers to the parent and next sibling so we can re-insert
    // the feedback blocks into the correct location if needed.
    var feedbackBlocksParent = null;
    var feedbackBlocksNextSib = null;
    if (feedbackBlocks && feedbackBlocks.div) {
      feedbackBlocksParent = feedbackBlocks.div.parentNode;
      feedbackBlocksNextSib = feedbackBlocks.div.nextSibling;
      feedbackBlocksParent.removeChild(feedbackBlocks.div);
    }

    // If the user requests the hint...
    dom.addClickTouchEvent(hintRequestButton, function() {
      // Swap the specific feedback message back in.
      parentNode.replaceChild(feedbackMessage, genericFeedback);

      // Remove "Show hint" button.  Making it invisible isn't enough,
      // because it will still take up space.
      hintRequestButton.parentNode.removeChild(hintRequestButton);

      // Restore feedback blocks, if present.
      if (feedbackBlocks && feedbackBlocks.div && feedbackBlocksParent) {
        feedbackBlocksParent.insertBefore(feedbackBlocks.div, feedbackBlocksNextSib);
        feedbackBlocks.show();
      }

      // Report hint request to server.
      if (options.response.hint_requested_url) {
        $.ajax({url: options.response.hint_requested_url, type: 'PUT'});
      }
    });
  }

  if (continueButton) {
    dom.addClickTouchEvent(continueButton, function() {
      feedbackDialog.hide();
      // onContinue will fire already if there was only a continue button
      if (!onlyContinue) {
        options.onContinue();
      }
    });
  }

  // set up the Save To Gallery button if necessary
  var saveToGalleryButton = feedback.querySelector('#save-to-gallery-button');
  if (saveToGalleryButton && options.response && options.response.save_to_gallery_url) {
    dom.addClickTouchEvent(saveToGalleryButton, function() {
      $.post(options.response.save_to_gallery_url,
             function() { $('#save-to-gallery-button').prop('disabled', true).text("Saved!"); });
    });
  }

  function createHiddenPrintWindow(src) {
    var iframe = $('<iframe id="print_frame" style="display: none"></iframe>'); // Created a hidden iframe with just the desired image as its contents
    iframe.appendTo("body");
    iframe[0].contentWindow.document.write("<img src='" + src + "'/>");
    iframe[0].contentWindow.document.write("<script>if (document.execCommand('print', false, null)) {  } else { window.print();  } </script>");
    $("#print_frame").remove(); // Remove the iframe when the print dialogue has been launched
  }

  var printButton = feedback.querySelector('#print-button');
  if (printButton) {
    dom.addClickTouchEvent(printButton, function() {
      createHiddenPrintWindow(options.feedbackImage);
    });
  }

  feedbackDialog.show({
    backdrop: (options.app === 'flappy' ? 'static' : true)
  });

  if (feedbackBlocks && feedbackBlocks.div) {
    feedbackBlocks.show();
  }
};

/**
 * Counts the number of blocks used.  Blocks are only counted if they are
 * not disabled, are deletable.
 * @return {number} Number of blocks used.
 */
FeedbackUtils.prototype.getNumBlocksUsed = function() {
  var i;
  if (this.studioApp_.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = this.getGeneratedCodeString_().split("\n");
    for (i = 0; i < lines.length; i++) {
      if ((lines[i].length > 1) && (lines[i][0] != '/' || lines[i][1] != '/')) {
        codeLines++;
      }
    }
    return codeLines;
  }
  return this.getUserBlocks_().length;
};

/**
 * Counts the total number of blocks. Blocks are only counted if they are
 * not disabled.
 * @return {number} Total number of blocks.
 */
FeedbackUtils.prototype.getNumCountableBlocks = function() {
  var i;
  if (this.studioApp_.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = this.getGeneratedCodeString_().split("\n");
    for (i = 0; i < lines.length; i++) {
      if ((lines[i].length > 1) && (lines[i][0] != '/' || lines[i][1] != '/')) {
        codeLines++;
      }
    }
    return codeLines;
  }
  return this.getCountableBlocks_().length;
};

/**
 *
 */
FeedbackUtils.prototype.getFeedbackButtons_ = function(options) {
  var buttons = document.createElement('div');
  buttons.id = 'feedbackButtons';

  var tryAgainText = '';
  if (options.feedbackType !== TestResults.ALL_PASS) {
    tryAgainText = utils.valueOr(options.tryAgainText, msg.tryAgain());
  }

  buttons.innerHTML = require('./templates/buttons.html.ejs')({
    data: {
      previousLevel:
        !this.canContinueToNextLevel(options.feedbackType) &&
        options.showPreviousButton,
      tryAgain: tryAgainText,
      continueText: options.continueText || msg.continue(),
      nextLevel: this.canContinueToNextLevel(options.feedbackType),
      isK1: options.isK1,
      hintRequestExperiment: options.hintRequestExperiment &&
          (options.hintRequestExperiment === HINT_REQUEST_PLACEMENT.LEFT ?
              'left' : 'right'),
      assetUrl: this.studioApp_.assetUrl,
      freePlay: options.freePlay
    }
  });

  return buttons;
};

/**
 *
 */
FeedbackUtils.prototype.getShareFailure_ = function(options) {
  var shareFailure = options.response.share_failure;
  var shareFailureDiv = document.createElement('div');
  shareFailureDiv.innerHTML = require('./templates/shareFailure.html.ejs')({shareFailure: shareFailure});
  return shareFailureDiv;
};

/**
 *
 */
FeedbackUtils.prototype.useSpecialFeedbackDesign_ = function (options) {
 return options.response &&
        options.response.design &&
        options.response.hint;
};

// This returns a document element with the appropriate feedback message.
// The message will be one of the following, from highest to lowest precedence:
// 0. Failure override message specified on level (options.level.failureMessageOverride)
// 1. Message passed in by caller (options.message).
// 2. Message from dashboard database (options.response.hint).
// 3. Header message due to dashboard text check fail (options.response.share_failure).
// 4. Level-specific message (e.g., options.level.emptyBlocksErrorMsg) for
//    specific result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
// 5. System-wide message (e.g., msg.emptyBlocksErrorMsg()) for specific
//    result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
FeedbackUtils.prototype.getFeedbackMessage_ = function(options) {
  var feedback = document.createElement('p');
  feedback.className = 'congrats';
  var message;

  // If a message was explicitly passed in, use that.
  if (options.feedbackType !== TestResults.ALL_PASS &&
      options.level.failureMessageOverride) {
    message = options.level.failureMessageOverride;
  } else  if (options.message) {
    message = options.message;
  } else if (options.response && options.response.share_failure) {
    message = msg.shareFailure();
  } else if (options.response && options.response.hint) {
    // Otherwise, if there's a dashboard database hint, use that.
    message = options.response.hint;
  } else {
    // Otherwise, the message will depend on the test result.
    switch (options.feedbackType) {
      case TestResults.EMPTY_BLOCK_FAIL:
        message = options.level.emptyBlocksErrorMsg ||
            msg.emptyBlocksErrorMsg();
        break;
      case TestResults.EMPTY_FUNCTION_BLOCK_FAIL:
        if (options.level.emptyFunctionBlocksErrorMsg) {
          message = options.level.emptyFunctionBlocksErrorMsg;
        } else if (Blockly.useContractEditor || Blockly.useModalFunctionEditor) {
          message = msg.errorEmptyFunctionBlockModal();
        } else {
          message = msg.emptyFunctionBlocksErrorMsg();
        }
        break;
      case TestResults.TOO_FEW_BLOCKS_FAIL:
        message = options.level.tooFewBlocksMsg || msg.tooFewBlocksMsg();
        break;
      case TestResults.LEVEL_INCOMPLETE_FAIL:
        message = options.level.levelIncompleteError ||
            msg.levelIncompleteError();
        break;
      case TestResults.EXTRA_TOP_BLOCKS_FAIL:
        var hasWhenRun = Blockly.mainBlockSpace.getTopBlocks().some(function (block) {
          return block.type === 'when_run' && block.isUserVisible();
        });

        var defaultMessage = hasWhenRun ?
          msg.extraTopBlocksWhenRun() : msg.extraTopBlocks();
        message = options.level.extraTopBlocks || defaultMessage;
        break;
      case TestResults.APP_SPECIFIC_FAIL:
        message = options.level.appSpecificFailError;
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
      case TestResults.TOO_MANY_BLOCKS_FAIL:
        message = msg.numBlocksNeeded({
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
        message = options.level.missingBlocksErrorMsg ||
            msg.missingBlocksErrorMsg();
        break;

      // Success.
      case TestResults.ALL_PASS:
      case TestResults.FREE_PLAY:
        var finalLevel = (options.response &&
            (options.response.message == "no more levels"));
        var stageCompleted = null;
        if (options.response && options.response.stage_changing) {
          stageCompleted = options.response.stage_changing.previous.name;
        }
        var msgParams = {
          numTrophies: options.numTrophies,
          stageNumber: 0, // TODO: remove once localized strings have been fixed
          stageName: stageCompleted,
          puzzleNumber: options.level.puzzle_number || 0
        };
        if (options.feedbackType === TestResults.FREE_PLAY && !options.level.disableSharing) {
          message = options.appStrings.reinfFeedbackMsg;
        } else if (options.numTrophies > 0) {
          message = finalLevel ? msg.finalStageTrophies(msgParams) :
                                 stageCompleted ?
                                    msg.nextStageTrophies(msgParams) :
                                    msg.nextLevelTrophies(msgParams);
        } else {
          message = finalLevel ? msg.finalStage(msgParams) :
                                 stageCompleted ?
                                     msg.nextStage(msgParams) :
                                     msg.nextLevel(msgParams);
        }
        break;
    }
  }

  dom.setText(feedback, message);

  // Update the feedback box design, if the hint message came from server.
  if (this.useSpecialFeedbackDesign_(options)) {
    // Setup a new div
    var feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-callout';
    feedbackDiv.id = 'feedback-content';

    // Insert an image
    var imageDiv = document.createElement('img');
    imageDiv.className = "hint-image";
    imageDiv.src = this.studioApp_.assetUrl(
      'media/lightbulb_for_' + options.response.design + '.png');
    feedbackDiv.appendChild(imageDiv);
    // Add new text
    var hintHeader = document.createElement('p');
    dom.setText(hintHeader, msg.hintHeader());
    feedbackDiv.appendChild(hintHeader);
    hintHeader.className = 'hint-header';
    // Append the original text
    feedbackDiv.appendChild(feedback);
    return feedbackDiv;
  }
  return feedback;
};

/**
 *
 */
FeedbackUtils.prototype.createSharingDiv = function(options) {
  if (!options.response || !options.response.level_source) {
    // don't even try if our caller didn't give us something that can be shared
    // options.response.level_source is the url that we are sharing
    return null;
  }

  if (this.studioApp_.disableSocialShare) {
    // Clear out our urls so that we don't display any of our social share links
    options.twitterUrl = undefined;
    options.facebookUrl = undefined;
    options.sendToPhone = false;
  } else {

    // set up the twitter share url
    var twitterUrl = "https://twitter.com/intent/tweet?url=" +
                     options.response.level_source;

    if (options.twitter && options.twitter.text !== undefined) {
      twitterUrl += "&text=" + encodeURI(options.twitter.text);
    }
    else {
      twitterUrl += "&text=" + encodeURI(msg.defaultTwitterText() + " @codeorg");
    }

    if (options.twitter  && options.twitter.hashtag !== undefined) {
      twitterUrl += "&hashtags=" + options.twitter.hashtag;
    }
    else {
      twitterUrl += "&hashtags=" + 'HourOfCode';
    }

    if (options.twitter && options.twitter.related !== undefined) {
      twitterUrl += "&related=" + options.twitter.related;
    }
    else {
      twitterUrl += "&related=codeorg";
    }

    options.twitterUrl = twitterUrl;

    // set up the facebook share url
    var facebookUrl = "https://www.facebook.com/sharer/sharer.php?u=" +
                      options.response.level_source;
    options.facebookUrl = facebookUrl;
  }

  options.assetUrl = this.studioApp_.assetUrl;

  var sharingDiv = document.createElement('div');
  sharingDiv.setAttribute('style', 'display:inline-block');
  sharingDiv.innerHTML = require('./templates/sharing.html.ejs')({
    options: options
  });

  var sharingInput = sharingDiv.querySelector('#sharing-input');
  if (sharingInput) {
    dom.addClickTouchEvent(sharingInput, function() {
      sharingInput.focus();
      sharingInput.select();
    });
  }

  var sharingShapeways = sharingDiv.querySelector('#sharing-shapeways');
  if (sharingShapeways) {
    dom.addClickTouchEvent(sharingShapeways, function() {
      $('#send-to-phone').hide();
      $('#shapeways-message').show();
    });
  }

  //  SMS-to-phone feature
  var sharingPhone = sharingDiv.querySelector('#sharing-phone');
  if (sharingPhone && options.sendToPhone) {
    dom.addClickTouchEvent(sharingPhone, function() {
      var sendToPhone = sharingDiv.querySelector('#send-to-phone');
      if ($(sendToPhone).is(':hidden')) {
        $('#shapeways-message').hide();
        sendToPhone.setAttribute('style', 'display:inline-block');
        var phone = $(sharingDiv.querySelector("#phone"));
        var submitted = false;
        var submitButton = sharingDiv.querySelector('#phone-submit');
        submitButton.disabled = true;
        phone.mask('(000) 000-0000', {
            onComplete:function(){
              if (!submitted) {
                submitButton.disabled = false;
              }
            },
            onChange: function () {
              submitButton.disabled = true;
            }
          }
        );
        phone.focus();
        dom.addClickTouchEvent(submitButton, function() {
          var phone = $(sharingDiv.querySelector("#phone"));
          var params = jQuery.param({
            level_source: options.response.level_source_id,
            phone: phone.val()
          });
          $(submitButton).val("Sending..");
          phone.prop('readonly', true);
          submitButton.disabled = true;
          submitted = true;
          jQuery.post(options.response.phone_share_url, params)
            .done(function (response) {
              $(submitButton).text("Sent!");
              trackEvent("SendToPhone", "success");
            })
            .fail(function (xhr) {
              $(submitButton).text("Error!");
              trackEvent("SendToPhone", "error");
            });
        });
      }
    });
  }

  return sharingDiv;
};

/**
 *
 */
FeedbackUtils.prototype.numTrophiesEarned_ = function(options) {
  if (options.response && options.response.trophy_updates) {
    return options.response.trophy_updates.length;
  } else {
    return 0;
  }
};

/**
 *
 */
FeedbackUtils.prototype.getTrophiesElement_ = function(options) {
  var html = "";
  for (var i = 0; i < options.numTrophies; i++) {
    html += trophy({
      img_url: options.response.trophy_updates[i][2],
      concept_name: options.response.trophy_updates[i][0]
    });
  }
  var trophies = document.createElement('div');
  trophies.innerHTML = html;
  return trophies;
};

/**
 *
 */
FeedbackUtils.prototype.getShowCodeElement_ = function(options) {
  var showCodeDiv = document.createElement('div');
  showCodeDiv.setAttribute('id', 'show-code');

  var numLinesWritten = this.getNumBlocksUsed();
  var shouldShowTotalLines =
    (options.response &&
      options.response.total_lines &&
      (options.response.total_lines !== numLinesWritten));
  var totalNumLinesWritten = shouldShowTotalLines ? options.response.total_lines : 0;

  showCodeDiv.innerHTML = require('./templates/showCode.html.ejs')({
    numLinesWritten: numLinesWritten,
    totalNumLinesWritten: totalNumLinesWritten
  });

  var showCodeButton = showCodeDiv.querySelector('#show-code-button');
  showCodeButton.addEventListener('click', _.bind(function () {
    showCodeDiv.appendChild(this.getGeneratedCodeElement_());
    showCodeButton.style.display = 'none';
  }, this));

  return showCodeDiv;
};

/**
 * Determines whether the user can proceed to the next level, based on the level feedback
 * @param {number} feedbackType A constant property of TestResults,
 *     typically produced by StudioApp.getTestResults().
 */
FeedbackUtils.prototype.canContinueToNextLevel = function(feedbackType) {
  return (feedbackType === TestResults.ALL_PASS ||
    feedbackType === TestResults.TOO_MANY_BLOCKS_FAIL ||
    feedbackType ===  TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL ||
    feedbackType ===  TestResults.FREE_PLAY);
};

/**
 * Retrieve a string containing the user's generated Javascript code.
 */
FeedbackUtils.prototype.getGeneratedCodeString_ = function() {
  if (this.studioApp_.editCode) {
    return this.studioApp_.editor ? this.studioApp_.editor.getValue() : '';
  }
  else {
    return codegen.workspaceCode(Blockly);
  }
};

/**
 *
 */
FeedbackUtils.prototype.getGeneratedCodeElement_ = function() {
  var codeInfoMsgParams = {
    berkeleyLink: "<a href='http://bjc.berkeley.edu/' target='_blank'>Berkeley</a>",
    harvardLink: "<a href='https://cs50.harvard.edu/' target='_blank'>Harvard</a>"
  };

  var infoMessage = this.studioApp_.editCode ?  "" : msg.generatedCodeInfo(codeInfoMsgParams);
  var code = this.getGeneratedCodeString_();

  var codeDiv = document.createElement('div');
  codeDiv.innerHTML = require('./templates/code.html.ejs')({
    message: infoMessage,
    code: code
  });

  return codeDiv;
};

/**
 * Display the 'Show Code' modal dialog.
 */
FeedbackUtils.prototype.showGeneratedCode = function(Dialog) {
  var codeDiv = this.getGeneratedCodeElement_();

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html.ejs')({
    data: {
      ok: true
    }
  });
  codeDiv.appendChild(buttons);

  var dialog = this.createModalDialogWithIcon({
      Dialog: Dialog,
      contentDiv: codeDiv,
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
 * Display the "Clear Puzzle" confirmation dialog.  Calls `callback` if the user
 * confirms they want to clear the puzzle.
 */
FeedbackUtils.prototype.showClearPuzzleConfirmation = function(Dialog, callback) {
  var codeDiv = document.createElement('div');
  codeDiv.innerHTML = '<p class="dialog-title">' + msg.clearPuzzleConfirmHeader() + '</p>' +
      '<p>' + msg.clearPuzzleConfirm() + '</p>';

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html.ejs')({
    data: {
      clearPuzzle: true,
      cancel: true
    }
  });
  codeDiv.appendChild(buttons);

  var dialog = this.createModalDialogWithIcon({
    Dialog: Dialog,
    contentDiv: codeDiv,
    icon: this.studioApp_.icon,
    defaultBtnSelector: '#again-button'
  });

  var cancelButton = buttons.querySelector('#again-button');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function() {
      dialog.hide();
    });
  }

  var clearPuzzleButton = buttons.querySelector('#continue-button');
  if (clearPuzzleButton) {
    dom.addClickTouchEvent(clearPuzzleButton, function() {
      callback();
      dialog.hide();
    });
  }

  dialog.show();
};

/**
 *
 */
FeedbackUtils.prototype.showToggleBlocksError = function(Dialog) {
  var contentDiv = document.createElement('div');
  contentDiv.innerHTML = msg.toggleBlocksErrorMsg();

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html.ejs')({
    data: {
      ok: true
    }
  });
  contentDiv.appendChild(buttons);

  var dialog = this.createModalDialogWithIcon({
      Dialog: Dialog,
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
  var blocks = Blockly.mainBlockSpace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    for (var j = 0; j < block.inputList.length; j++) {
      var input = block.inputList[j];
      if (input.type == Blockly.NEXT_STATEMENT &&
          !input.connection.targetConnection) {
        return block;
      }
    }
  }
  return null;
};

/**
 * Check for empty container blocks, and return an appropriate failure
 * code if any are found.
 * @return {TestResults} ALL_PASS if no empty blocks are present, or
 *   EMPTY_BLOCK_FAIL or EMPTY_FUNCTION_BLOCK_FAIL if empty blocks
 *   are found.
 */
FeedbackUtils.prototype.checkForEmptyContainerBlockFailure_ = function() {
  var emptyBlock = this.getEmptyContainerBlock_();
  if (!emptyBlock) {
    return TestResults.ALL_PASS;
  }

  var type = emptyBlock.type;
  if (type === 'procedures_defnoreturn' || type === 'procedures_defreturn') {
    return TestResults.EMPTY_FUNCTION_BLOCK_FAIL;
  }

  // Block is assumed to be "if" or "repeat" if we reach here.
  // This is where to add checks if you want a different TestResult
  // for "controls_for_counter" blocks, for example.
  return TestResults.EMPTY_BLOCK_FAIL;
};

/**
 * Check whether the user code has all the blocks required for the level.
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 * @return {boolean} true if all blocks are present, false otherwise.
 */
FeedbackUtils.prototype.hasAllRequiredBlocks_ = function(requiredBlocks) {
  // It's okay (maybe faster) to pass 1 for maxBlocksToFlag, since in the end
  // we want to check that there are zero blocks missing.
  var maxBlocksToFlag = 1;
  return this.getMissingRequiredBlocks_(requiredBlocks, maxBlocksToFlag).blocksToDisplay.length === 0;
};

/**
 * Get blocks that the user intends in the program. These are the blocks that
 * are used when checking for required blocks and when determining lines of code
 * written.
 * @return {Array<Object>} The blocks.
 */
FeedbackUtils.prototype.getUserBlocks_ = function() {
  var allBlocks = Blockly.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled && block.isEditable() && block.type !== 'when_run';
  });
  return blocks;
};

/**
 * Get countable blocks in the program, namely any that are not disabled.
 * These are used when determined the number of blocks relative to the ideal
 * block count.
 * @return {Array<Object>} The blocks.
 */
FeedbackUtils.prototype.getCountableBlocks_ = function() {
  var allBlocks = Blockly.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled;
  });
  return blocks;
};

/**
 * Check to see if the user's code contains the required blocks for a level.
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 * @param {number} maxBlocksToFlag The maximum number of blocks to return.
 * @return {{blocksToDisplay:!Array, message:?string}} 'missingBlocks' is an
 *   array of array of strings where each array of strings is a set of blocks
 *   that at least one of them should be used. Each block is represented as the
 *   prefix of an id in the corresponding template.soy. 'message' is an
 *   optional message to override the default error text.
 */
FeedbackUtils.prototype.getMissingRequiredBlocks_ = function (requiredBlocks,
    maxBlocksToFlag) {
  var missingBlocks = [];
  var customMessage = null;
  var code = null;  // JavaScript code, which is initialized lazily.
  if (requiredBlocks && requiredBlocks.length) {
    var userBlocks = this.getUserBlocks_();
    // For each list of required blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than the maxBlocksToFlag param.
    var missingBlockNum = 0;
    for (var i = 0;
         i < requiredBlocks.length &&
             missingBlockNum < maxBlocksToFlag;
         i++) {
      var requiredBlock = requiredBlocks[i];
      // For each of the test
      // If at least one of the tests succeeded, we consider the required block
      // is used
      var usedRequiredBlock = false;
      for (var testId = 0; testId < requiredBlock.length; testId++) {
        var test = requiredBlock[testId].test;
        if (typeof test === 'string') {
          code = code || Blockly.Generator.blockSpaceToCode('JavaScript');
          if (code.indexOf(test) !== -1) {
            // Succeeded, moving to the next list of tests
            usedRequiredBlock = true;
            break;
          }
        } else if (typeof test === 'function') {
          if (userBlocks.some(test)) {
            // Succeeded, moving to the next list of tests
            usedRequiredBlock = true;
            break;
          } else {
            customMessage = requiredBlock[testId].message || customMessage;
          }
        } else {
          throw new Error('Bad test: ' + test);
        }
      }
      if (!usedRequiredBlock) {
        missingBlockNum++;
        missingBlocks = missingBlocks.concat(requiredBlocks[i][0]);
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
 */
FeedbackUtils.prototype.hasExtraTopBlocks = function () {
  if (this.studioApp_.editCode) {
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
    // None of our top level blocks should have a previous connection.
    if (topBlocks[i].previousConnection) {
      return true;
    }
  }
  return false;
};

/**
 * Runs the tests and returns results.
 * @param {boolean} levelComplete Did the user successfully complete the level?
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 * @param {boolean} shouldCheckForEmptyBlocks Whether empty blocks should cause
 *   a test fail result.
 * @param {Object} options
 * @return {number} The appropriate property of TestResults.
 */
FeedbackUtils.prototype.getTestResults = function(levelComplete, requiredBlocks,
    shouldCheckForEmptyBlocks, options) {
  options = options || {};
  if (this.studioApp_.editCode) {
    // TODO (cpirich): implement better test results for editCode
    return levelComplete ?
        this.studioApp_.TestResults.ALL_PASS :
        this.studioApp_.TestResults.TOO_FEW_BLOCKS_FAIL;
  }
  if (shouldCheckForEmptyBlocks) {
    var emptyBlockFailure = this.checkForEmptyContainerBlockFailure_();
    if (emptyBlockFailure !== TestResults.ALL_PASS) {
      return emptyBlockFailure;
    }
  }
  if (!options.allowTopBlocks && this.hasExtraTopBlocks()) {
    return TestResults.EXTRA_TOP_BLOCKS_FAIL;
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
  if (!this.hasAllRequiredBlocks_(requiredBlocks)) {
    return levelComplete ?
        TestResults.MISSING_BLOCK_FINISHED :
        TestResults.MISSING_BLOCK_UNFINISHED;
  }
  var numEnabledBlocks = this.getNumCountableBlocks();
  if (!levelComplete) {
    if (this.studioApp_.IDEAL_BLOCK_NUM &&
        this.studioApp_.IDEAL_BLOCK_NUM !== Infinity &&
        numEnabledBlocks < this.studioApp_.IDEAL_BLOCK_NUM) {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
    return TestResults.LEVEL_INCOMPLETE_FAIL;
  }
  if (this.studioApp_.IDEAL_BLOCK_NUM &&
      numEnabledBlocks > this.studioApp_.IDEAL_BLOCK_NUM) {
    return TestResults.TOO_MANY_BLOCKS_FAIL;
  } else {
    return TestResults.ALL_PASS;
  }
};

/**
 *
 */
FeedbackUtils.prototype.createModalDialogWithIcon = function(options) {
  var imageDiv = document.createElement('img');
  imageDiv.className = "modal-image";
  imageDiv.src = options.icon;

  var modalBody = document.createElement('div');
  modalBody.appendChild(imageDiv);
  options.contentDiv.className += ' modal-content';
  modalBody.appendChild(options.contentDiv);

  var btn = options.contentDiv.querySelector(options.defaultBtnSelector);
  var keydownHandler = function(e) {
    if (e.keyCode == KeyCodes.ENTER || e.keyCode == KeyCodes.SPACE) {
      // Simulate a 'click':
      var event = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true
      });
      btn.dispatchEvent(event);

      e.stopPropagation();
      e.preventDefault();
    }
  };

  return new options.Dialog({
    body: modalBody,
    onHidden: options.onHidden,
    onKeydown: btn ? keydownHandler : undefined,
    id: options.id
  });
};

/**
 * Check for '???' instead of a value in block fields.
 */
FeedbackUtils.prototype.hasQuestionMarksInNumberField = function () {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(block) {
    return block.getTitles().some(function(title) {
      return title.value_ === '???' || title.text_ === '???';
    });
  });
};

/**
 * Ensure that all procedure definitions actually use the parameters they define
 * inside the procedure.
 */
FeedbackUtils.prototype.hasUnusedParam_ = function () {
  var self = this;
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    var params = userBlock.parameterNames_;
    // Only search procedure definitions
    return params && params.some(function(paramName) {
      // Unused param if there's no parameters_get descendant with the same name
      return !self.hasMatchingDescendant_(userBlock, function(block) {
        return (block.type === 'parameters_get' ||
            block.type === 'functional_parameters_get' ||
            block.type === 'variables_get') &&
            block.getTitleValue('VAR') === paramName;
      });
    });
  });
};

/**
 * Ensure that all procedure calls have each parameter input connected.
 */
FeedbackUtils.prototype.hasParamInputUnattached_ = function () {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only check procedure_call* blocks
    if (!/^procedures_call/.test(userBlock.type)) {
      return false;
    }
    return userBlock.inputList.filter(function(input) {
      return (/^ARG/.test(input.name));
    }).some(function(argInput) {
      // Unattached param input if any ARG* connection target is null
      return !argInput.connection.targetConnection;
    });
  });
};

/**
 * Ensure that all user-declared procedures have associated call blocks.
 */
FeedbackUtils.prototype.hasUnusedFunction_ = function () {
  var userDefs = [];
  var callBlocks = {};
  Blockly.mainBlockSpace.getAllBlocks().forEach(function (block) {
    var name = block.getTitleValue('NAME');
    if (/^procedures_def/.test(block.type) && block.userCreated) {
      userDefs.push(name);
    } else if (/^procedures_call/.test(block.type)) {
      callBlocks[name] = true;
    }
  });
  // Unused function if some user def doesn't have a matching call
  return userDefs.some(function(name) { return !callBlocks[name]; });
};

/**
 * Ensure there are no incomplete blocks inside any function definitions.
 */
FeedbackUtils.prototype.hasIncompleteBlockInFunction_ = function () {
  var self = this;
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only search procedure definitions
    if (!userBlock.parameterNames_) {
      return false;
    }
    return self.hasMatchingDescendant_(userBlock, function(block) {
      // Incomplete block if any input connection target is null
      return block.inputList.some(function(input) {
        return input.type === Blockly.INPUT_VALUE &&
            !input.connection.targetConnection;
      });
    });
  });
};

/**
 * Returns true if any descendant (inclusive) of the given node matches the
 * given filter.
 */
FeedbackUtils.prototype.hasMatchingDescendant_ = function (node, filter) {
  if (filter(node)) {
    return true;
  }
  var self = this;
  return node.childBlocks_.some(function (child) {
    return self.hasMatchingDescendant_(child, filter);
  });
};
