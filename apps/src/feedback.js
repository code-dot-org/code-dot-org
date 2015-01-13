var trophy = require('./templates/trophy.html');
var utils = require('./utils');
var codegen = require('./codegen');
var msg = require('../locale/current/common');
var dom = require('./dom');
var xml = require('./xml');
var _ = utils.getLodash();

var FeedbackBlocks = require('./feedbackBlocks');

// TODO (br-pair): This is a hack. We initially set our studioAppSingleton to
// be the global StudioApp. This will be the case for all apps other than Artist.
// However, that global is not necessarily set yet at the point where we load
// feedback, and requiring base here introduces a circular dependency. Instead,
// we depend on base apply the singleton to the feedback object i required.
var studioAppSingleton;
exports.applySingleton = function (singleton) {
  studioAppSingleton = singleton;
};

var TestResults = require('./constants').TestResults;

// NOTE: These must be kept in sync with activity_hint.rb in dashboard.
var HintRequestPlacement = {
  NONE: 0,  // This value must not be changed.
  LEFT: 1,  // Hint request button is on left.
  RIGHT: 2  // Hint request button is on right.
};

exports.displayFeedback = function(options) {
  options.hintRequestExperiment = options.response &&
      options.response.hint_request_placement;
  options.level = options.level || {};
  options.numTrophies = numTrophiesEarned(options);

  // Tracking event for level newly completed
  if (options.response && options.response.new_level_completed) {
    trackEvent('Puzzle', 'Completed', options.response.level_path, options.response.level_attempts);
  }

  var hadShareFailure = (options.response && options.response.share_failure);
  var showingSharing = options.showingSharing && !hadShareFailure;

  var canContinue = exports.canContinueToNextLevel(options.feedbackType);
  var displayShowCode = studioAppSingleton.enableShowCode && canContinue && !showingSharing;
  var feedback = document.createElement('div');
  var sharingDiv = (canContinue && showingSharing) ? exports.createSharingDiv(options) : null;
  var showCode = displayShowCode ? getShowCodeElement(options) : null;
  var shareFailureDiv = hadShareFailure ? getShareFailure(options) : null;
  if (hadShareFailure) {
    trackEvent('Share', 'Failure', options.response.share_failure.type);
  }
  var feedbackBlocks = new FeedbackBlocks(options, exports.getMissingRequiredBlocks_(),
    studioAppSingleton);
  // feedbackMessage must be initialized after feedbackBlocks
  // because FeedbackBlocks can mutate options.response.hint.
  var feedbackMessage = getFeedbackMessage(options);

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
    var trophies = getTrophiesElement(options);
    feedback.appendChild(trophies);
  }
  if (feedbackBlocks.div) {
    if (feedbackMessage && useSpecialFeedbackDesign(options)) {
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
    getFeedbackButtons({
      feedbackType: options.feedbackType,
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
  var icon = canContinue ? studioAppSingleton.winIcon : studioAppSingleton.failureIcon;
  var defaultBtnSelector = onlyContinue ? '#continue-button' : '#again-button';

  var feedbackDialog = exports.createModalDialogWithIcon({
    Dialog: options.Dialog,
    contentDiv: feedback,
    icon: icon,
    defaultBtnSelector: defaultBtnSelector,
    onHidden: onHidden,
    id: 'feedback-dialog'
  });

  // Update the background color if it is set to be in special design.
  if (useSpecialFeedbackDesign(options)) {
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
    var genericFeedback = getFeedbackMessage({message: msg.genericFeedback()});
    var parentNode = feedbackMessage.parentNode;
    parentNode.replaceChild(genericFeedback, feedbackMessage);

    // If there are feedback blocks, temporarily remove them.
    // Get pointers to the parent and next sibling so we can re-insert
    // the feedback blocks into the correct location if needed.
    var feedbackBlocksParent = null;
    var feedbackBlocksNextSib = null;
    if (feedbackBlocks.div) {
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
      if (feedbackBlocks.div && feedbackBlocksParent) {
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

  if (feedbackBlocks.div) {
    feedbackBlocks.show();
  }
};

/**
 * Counts the number of blocks used.  Blocks are only counted if they are
 * not disabled, are deletable.
 * @return {number} Number of blocks used.
 */
exports.getNumBlocksUsed = function() {
  var i;
  if (studioAppSingleton.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = getGeneratedCodeString().split("\n");
    for (i = 0; i < lines.length; i++) {
      if ((lines[i].length > 1) && (lines[i][0] != '/' || lines[i][1] != '/')) {
        codeLines++;
      }
    }
    return codeLines;
  }
  return getUserBlocks().length;
};

/**
 * Counts the total number of blocks. Blocks are only counted if they are
 * not disabled.
 * @return {number} Total number of blocks.
 */
exports.getNumCountableBlocks = function() {
  var i;
  if (studioAppSingleton.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = getGeneratedCodeString().split("\n");
    for (i = 0; i < lines.length; i++) {
      if ((lines[i].length > 1) && (lines[i][0] != '/' || lines[i][1] != '/')) {
        codeLines++;
      }
    }
    return codeLines;
  }
  return getCountableBlocks().length;
};

var getFeedbackButtons = function(options) {
  var buttons = document.createElement('div');
  buttons.id = 'feedbackButtons';
  buttons.innerHTML = require('./templates/buttons.html')({
    data: {
      previousLevel:
        !exports.canContinueToNextLevel(options.feedbackType) &&
        options.showPreviousButton,
      tryAgain: options.feedbackType !== TestResults.ALL_PASS,
      nextLevel: exports.canContinueToNextLevel(options.feedbackType),
      isK1: options.isK1,
      hintRequestExperiment: options.hintRequestExperiment &&
          (options.hintRequestExperiment === HintRequestPlacement.LEFT ?
              'left' : 'right'),
      assetUrl: studioAppSingleton.assetUrl,
      freePlay: options.freePlay
    }
  });

  return buttons;
};

var getShareFailure = function(options) {
  var shareFailure = options.response.share_failure;
  var shareFailureDiv = document.createElement('div');
  shareFailureDiv.innerHTML = require('./templates/shareFailure.html')({shareFailure: shareFailure});
  return shareFailureDiv;
};

var useSpecialFeedbackDesign = function (options) {
 return options.response &&
        options.response.design &&
        options.response.hint;
};

// This returns a document element with the appropriate feedback message.
// The message will be one of the following, from highest to lowest precedence:
// 1. Message passed in by caller (options.message).
// 2. Message from dashboard database (options.response.hint).
// 3. Header message due to dashboard text check fail (options.response.share_failure).
// 4. Level-specific message (e.g., options.level.emptyBlocksErrorMsg) for
//    specific result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
// 5. System-wide message (e.g., msg.emptyBlocksErrorMsg()) for specific
//    result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
var getFeedbackMessage = function(options) {
  var feedback = document.createElement('p');
  feedback.className = 'congrats';
  var message;

  // If a message was explicitly passed in, use that.
  if (options.message) {
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
        message = options.level.extraTopBlocks || msg.extraTopBlocks();
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
          numBlocks: studioAppSingleton.IDEAL_BLOCK_NUM,
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
  if (useSpecialFeedbackDesign(options)) {
    // Setup a new div
    var feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-callout';
    feedbackDiv.id = 'feedback-content';

    // Insert an image
    var imageDiv = document.createElement('img');
    imageDiv.className = "hint-image";
    imageDiv.src = studioAppSingleton.assetUrl(
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

exports.createSharingDiv = function(options) {
  if (!options.response || !options.response.level_source) {
    // don't even try if our caller didn't give us something that can be shared
    // options.response.level_source is the url that we are sharing
    return null;
  }

  if (studioAppSingleton.disableSocialShare) {
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

  options.assetUrl = studioAppSingleton.assetUrl;

  var sharingDiv = document.createElement('div');
  sharingDiv.setAttribute('style', 'display:inline-block');
  sharingDiv.innerHTML = require('./templates/sharing.html')({
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
        phone.mask('(000) 000-0000',{
            onComplete:function(){if(!submitted) submitButton.disabled=false;},
            onChange: function(){submitButton.disabled=true;}
        });
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


var numTrophiesEarned = function(options) {
  if (options.response && options.response.trophy_updates) {
    return options.response.trophy_updates.length;
  } else {
    return 0;
  }
};

var getTrophiesElement = function(options) {
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

var getShowCodeElement = function(options) {
  var showCodeDiv = document.createElement('div');
  showCodeDiv.setAttribute('id', 'show-code');

  var numLinesWritten = exports.getNumBlocksUsed();
  var shouldShowTotalLines =
    (options.response &&
      options.response.total_lines &&
      (options.response.total_lines !== numLinesWritten));
  var totalNumLinesWritten = shouldShowTotalLines ? options.response.total_lines : 0;

  showCodeDiv.innerHTML = require('./templates/showCode.html')({
    numLinesWritten: numLinesWritten,
    totalNumLinesWritten: totalNumLinesWritten
  });

  var showCodeButton = showCodeDiv.querySelector('#show-code-button');
  showCodeButton.addEventListener('click', function () {
    showCodeDiv.appendChild(getGeneratedCodeElement());
    showCodeButton.style.display = 'none';
  });

  return showCodeDiv;
};

/**
 * Determines whether the user can proceed to the next level, based on the level feedback
 * @param {number} feedbackType A constant property of TestResults,
 *     typically produced by studioAppSingleton.getTestResults().
 */
exports.canContinueToNextLevel = function(feedbackType) {
  return (feedbackType === TestResults.ALL_PASS ||
    feedbackType === TestResults.TOO_MANY_BLOCKS_FAIL ||
    feedbackType ===  TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL ||
    feedbackType ===  TestResults.FREE_PLAY);
};

/**
 * Retrieve a string containing the user's generated Javascript code.
 */
var getGeneratedCodeString = function() {
  if (studioAppSingleton.editCode) {
    return studioAppSingleton.editor ? studioAppSingleton.editor.getValue() : '';
  }
  else {
    return codegen.workspaceCode(Blockly);
  }
};

var getGeneratedCodeElement = function() {
  var codeInfoMsgParams = {
    berkeleyLink: "<a href='http://bjc.berkeley.edu/' target='_blank'>Berkeley</a>",
    harvardLink: "<a href='https://cs50.harvard.edu/' target='_blank'>Harvard</a>"
  };

  var infoMessage = studioAppSingleton.editCode ?  "" : msg.generatedCodeInfo(codeInfoMsgParams);
  var code = getGeneratedCodeString();

  var codeDiv = document.createElement('div');
  codeDiv.innerHTML = require('./templates/code.html')({
    message: infoMessage,
    code: code
  });

  return codeDiv;
};

exports.showGeneratedCode = function(Dialog) {
  var codeDiv = getGeneratedCodeElement();

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html')({
    data: {
      ok: true
    }
  });
  codeDiv.appendChild(buttons);

  var dialog = exports.createModalDialogWithIcon({
      Dialog: Dialog,
      contentDiv: codeDiv,
      icon: studioAppSingleton.icon,
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

exports.showToggleBlocksError = function(Dialog) {
  var contentDiv = document.createElement('div');
  contentDiv.innerHTML = msg.toggleBlocksErrorMsg();

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html')({
    data: {
      ok: true
    }
  });
  contentDiv.appendChild(buttons);

  var dialog = exports.createModalDialogWithIcon({
      Dialog: Dialog,
      contentDiv: contentDiv,
      icon: studioAppSingleton.icon,
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
 * Check user's code for empty container blocks, such as "repeat".
 * @return {boolean} true if a block is empty (no blocks are nested inside).
 */
var hasEmptyContainerBlocks = function() {
  var code = codegen.workspaceCode(Blockly);
  return (/\{\s*\}/).test(code);
};

/**
 * Get an empty container block, if any are present.
 * @return {Blockly.Block} an empty container block, or null if none exist.
 */
var getEmptyContainerBlock = function() {
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
 * Check whether the user code has all the blocks required for the level.
 * @return {boolean} true if all blocks are present, false otherwise.
 */
var hasAllRequiredBlocks = function() {
  return exports.getMissingRequiredBlocks_().blocksToDisplay.length === 0;
};

/**
 * Get blocks that the user intends in the program. These are the blocks that
 * are used when checking for required blocks and when determining lines of code
 * written.
 * @return {Array<Object>} The blocks.
 */
var getUserBlocks = function() {
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
var getCountableBlocks = function() {
  var allBlocks = Blockly.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled;
  });
  return blocks;
};

/**
 * Check to see if the user's code contains the required blocks for a level.
 * This never returns more than studioAppSingleton.NUM_REQUIRED_BLOCKS_TO_FLAG.
 * @return {{blocksToDisplay:!Array, message:?string}} 'missingBlocks' is an
 * array of array of strings where each array of strings is a set of blocks that
 * at least one of them should be used. Each block is represented as the prefix
 * of an id in the corresponding template.soy. 'message' is an optional message
 * to override the default error text.
 */
exports.getMissingRequiredBlocks_ = function () {
  var missingBlocks = [];
  var customMessage = null;
  var code = null;  // JavaScript code, which is initialized lazily.
  // TODO (br-pair) : we should probably just pass required_blocks
  if (studioAppSingleton.REQUIRED_BLOCKS && studioAppSingleton.REQUIRED_BLOCKS.length) {
    var userBlocks = getUserBlocks();
    // For each list of required blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than studioAppSingleton.NUM_REQUIRED_BLOCKS_TO_FLAG
    var missingBlockNum = 0;
    for (var i = 0;
         i < studioAppSingleton.REQUIRED_BLOCKS.length &&
             missingBlockNum < studioAppSingleton.NUM_REQUIRED_BLOCKS_TO_FLAG;
         i++) {
      var requiredBlock = studioAppSingleton.REQUIRED_BLOCKS[i];
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
        missingBlocks = missingBlocks.concat(studioAppSingleton.REQUIRED_BLOCKS[i][0]);
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
exports.hasExtraTopBlocks = function () {
  if (studioAppSingleton.editCode) {
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
 * @param  Did the user successfully complete the level
 * @return {number} The appropriate property of TestResults.
 */
exports.getTestResults = function(levelComplete, options) {
  options = options || {};
  if (studioAppSingleton.editCode) {
    // TODO (cpirich): implement better test results for editCode
    return levelComplete ?
      studioAppSingleton.TestResults.ALL_PASS :
      studioAppSingleton.TestResults.TOO_FEW_BLOCKS_FAIL;
  }
  if (studioAppSingleton.CHECK_FOR_EMPTY_BLOCKS && hasEmptyContainerBlocks()) {
    var type = getEmptyContainerBlock().type;
    if (type === 'procedures_defnoreturn' || type === 'procedures_defreturn') {
      return TestResults.EMPTY_FUNCTION_BLOCK_FAIL;
    }
    // Block is assumed to be "if" or "repeat" if we reach here.
    // This is where to add checks if you want a different TestResult
    // for "controls_for_counter" blocks, for example.
    return TestResults.EMPTY_BLOCK_FAIL;
  }
  if (!options.allowTopBlocks && exports.hasExtraTopBlocks()) {
    return TestResults.EXTRA_TOP_BLOCKS_FAIL;
  }
  if (Blockly.useContractEditor || Blockly.useModalFunctionEditor) {
    if (hasUnusedParam()) {
      return TestResults.UNUSED_PARAM;
    }
    if (hasUnusedFunction()) {
      return TestResults.UNUSED_FUNCTION;
    }
    if (hasParamInputUnattached()) {
      return TestResults.PARAM_INPUT_UNATTACHED;
    }
    if (hasIncompleteBlockInFunction()) {
      return TestResults.INCOMPLETE_BLOCK_IN_FUNCTION;
    }
  }
  if (hasQuestionMarksInNumberField()) {
    return TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
  }
  if (!hasAllRequiredBlocks()) {
    return levelComplete ? TestResults.MISSING_BLOCK_FINISHED :
      TestResults.MISSING_BLOCK_UNFINISHED;
  }
  var numEnabledBlocks = exports.getNumCountableBlocks();
  if (!levelComplete) {
    if (studioAppSingleton.IDEAL_BLOCK_NUM && studioAppSingleton.IDEAL_BLOCK_NUM !== Infinity &&
        numEnabledBlocks < studioAppSingleton.IDEAL_BLOCK_NUM) {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
    return TestResults.LEVEL_INCOMPLETE_FAIL;
  }
  if (studioAppSingleton.IDEAL_BLOCK_NUM &&
      numEnabledBlocks > studioAppSingleton.IDEAL_BLOCK_NUM) {
    return TestResults.TOO_MANY_BLOCKS_FAIL;
  } else {
    return TestResults.ALL_PASS;
  }
};

var Keycodes = {
  ENTER: 13,
  SPACE: 32
};

exports.createModalDialogWithIcon = function(options) {
  var imageDiv = document.createElement('img');
  imageDiv.className = "modal-image";
  imageDiv.src = options.icon;

  var modalBody = document.createElement('div');
  modalBody.appendChild(imageDiv);
  options.contentDiv.className += ' modal-content';
  modalBody.appendChild(options.contentDiv);

  var btn = options.contentDiv.querySelector(options.defaultBtnSelector);
  var keydownHandler = function(e) {
    if (e.keyCode == Keycodes.ENTER || e.keyCode == Keycodes.SPACE) {
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
function hasQuestionMarksInNumberField() {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(block) {
    return block.getTitles().some(function(title) {
      return title.value_ === '???';
    });
  });
}

/**
 * Ensure that all procedure definitions actually use the parameters they define
 * inside the procedure.
 */
function hasUnusedParam() {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    var params = userBlock.parameterNames_;
    // Only search procedure definitions
    return params && params.some(function(paramName) {
      // Unused param if there's no parameters_get descendant with the same name
      return !hasMatchingDescendant(userBlock, function(block) {
        return (block.type === 'parameters_get' ||
            block.type === 'functional_parameters_get' ||
            block.type === 'variables_get') &&
            block.getTitleValue('VAR') === paramName;
      });
    });
  });
}

/**
 * Ensure that all procedure calls have each parameter input connected.
 */
function hasParamInputUnattached() {
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
}

/**
 * Ensure that all user-declared procedures have associated call blocks.
 */
function hasUnusedFunction() {
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
}

/**
 * Ensure there are no incomplete blocks inside any function definitions.
 */
function hasIncompleteBlockInFunction() {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only search procedure definitions
    if (!userBlock.parameterNames_) {
      return false;
    }
    return hasMatchingDescendant(userBlock, function(block) {
      // Incomplete block if any input connection target is null
      return block.inputList.some(function(input) {
        return input.type === Blockly.INPUT_VALUE &&
            !input.connection.targetConnection;
      });
    });
  });
}

/**
 * Returns true if any descendant (inclusive) of the given node matches the
 * given filter.
 */
function hasMatchingDescendant(node, filter) {
  if (filter(node)) {
    return true;
  }
  return node.childBlocks_.some(function (child) {
    return hasMatchingDescendant(child, filter);
  });
}
