var trophy = require('./templates/trophy.html');
var utils = require('./utils');
var readonly = require('./templates/readonly.html');
var codegen = require('./codegen');
var msg = require('../locale/current/common');
var dom = require('./dom');

var TestResults = require('./constants').TestResults;

exports.HintRequestPlacement = {
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

  var canContinue = exports.canContinueToNextLevel(options.feedbackType);
  var displayShowCode = BlocklyApps.enableShowCode && canContinue;
  var feedback = document.createElement('div');
  var sharingDiv = (canContinue && options.showingSharing) ? exports.createSharingDiv(options) : null;
  var showCode = displayShowCode ? getShowCodeElement(options) : null;
  var feedbackBlocks = new FeedbackBlocks(options);
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
  if (options.showingSharing) {
    var shareCodeSpacer = document.createElement('div');
    shareCodeSpacer.className = "share-code-spacer";
    feedback.appendChild(shareCodeSpacer);
  }
  if (showCode) {
    feedback.appendChild(showCode);
  }
  if (options.level.isK1) {
    feedback.className += " k1";
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
  var icon = canContinue ? BlocklyApps.WIN_ICON : BlocklyApps.FAILURE_ICON;
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
  if (BlocklyApps.editCode) {
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
  if (BlocklyApps.editCode) {
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
          (options.hintRequestExperiment === exports.HintRequestPlacement.LEFT ?
              'left' : 'right'),
      assetUrl: BlocklyApps.assetUrl,
      freePlay: options.freePlay
    }
  });

  return buttons;
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
// 3. Level-specific message (e.g., options.level.emptyBlocksErrorMsg) for
//    specific result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
// 4. System-wide message (e.g., msg.emptyBlocksErrorMsg()) for specific
//    result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
var getFeedbackMessage = function(options) {
  var feedback = document.createElement('p');
  feedback.className = 'congrats';
  var message;

  // If a message was explicitly passed in, use that.
  if (options.message) {
    message = options.message;
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
        message = options.level.emptyFunctionBlocksErrorMsg ||
            msg.emptyFunctionBlocksErrorMsg();
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
      case TestResults.TOO_MANY_BLOCKS_FAIL:
        message = msg.numBlocksNeeded({
          numBlocks: BlocklyApps.IDEAL_BLOCK_NUM,
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
        if (options.numTrophies > 0) {
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

      // Free plays
      case TestResults.FREE_PLAY:
        message = options.appStrings.reinfFeedbackMsg;
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
    imageDiv.src = BlocklyApps.assetUrl(
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

  if (BlocklyApps.disableSocialShare) {
    // Clear out our urls so that we don't display any of our social share links
    options.twitterUrl = undefined;
    options.facebookUrl = undefined;
    options.saveToGalleryUrl = undefined;
    options.sendToPhone = false;
  } else {

    // set up the twitter share url
    var twitterUrl = "https://twitter.com/intent/tweet?url=" +
                     options.response.level_source;

    if (options.twitter && options.twitter.text !== undefined) {
      twitterUrl += "&text=" + encodeURI(options.twitter.text);
    }
    if (options.twitter  && options.twitter.hashtag !== undefined) {
      twitterUrl += "&button_hashtag=" + options.twitter.hashtag;
    }
    options.twitterUrl = twitterUrl;


    // set up the facebook share url
    var facebookUrl = "https://www.facebook.com/sharer/sharer.php?u=" +
                      options.response.level_source;
    options.facebookUrl = facebookUrl;
    options.sendToPhone = true;
  }

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

//  SMS-to-phone feature
  var sharingPhone = sharingDiv.querySelector('#sharing-phone');
  if (sharingPhone) {
    dom.addClickTouchEvent(sharingPhone, function() {
      var sendToPhone = sharingDiv.querySelector('#send-to-phone');
      if ($(sendToPhone).is(':hidden')) {
        sendToPhone.setAttribute('style', 'display:inline-block');
        var phone = $("#phone");
        phone.mask("(999) 999-9999");
        phone.focus();
        var submitButton = sharingDiv.querySelector('#phone-submit');
        dom.addClickTouchEvent(submitButton, function() {
          var phone = $("#phone");
          var params = jQuery.param({
            level_source: options.response.level_source_id,
            phone: phone.val()
          });
          $(submitButton).val("Sending..");
          phone.prop('readonly', true);
          submitButton.disabled = true;
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
 *     typically produced by BlocklyApps.getTestResults().
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
  if (BlocklyApps.editCode) {
    return BlocklyApps.editor ? BlocklyApps.editor.getValue() : '';
  }
  else {
    return codegen.workspaceCode(Blockly);
  }
};

var FeedbackBlocks = function(options) {
  // Check whether blocks are embedded in the hint returned from dashboard.
  // See below comment for format.
  var embeddedBlocks = options.response && options.response.hint &&
      options.response.hint.indexOf("[{") !== 0;
  if (!embeddedBlocks &&
      options.feedbackType !==
      TestResults.MISSING_BLOCK_UNFINISHED &&
      options.feedbackType !==
      TestResults.MISSING_BLOCK_FINISHED) {
      return;
  }

  var blocksToDisplay = [];
  if (embeddedBlocks) {
    // Hint should be of the form: SOME TEXT [{..}, {..}, ..] IGNORED.
    // Example: 'Try the following block: [{"type": "maze_moveForward"}]'
    // Note that double quotes are required by the JSON parser.
    var parts = options.response.hint.match(/(.*)(\[.*\])/);
    if (!parts) {
      return;
    }
    options.response.hint = parts[1].trim();  // Remove blocks from hint.
    try {
      blocksToDisplay = JSON.parse(parts[2]);
    } catch(err) {
      // The blocks could not be parsed.  Ignore them.
      return;
    }
  } else {
    blocksToDisplay = getMissingRequiredBlocks();
  }

  if (blocksToDisplay.length === 0) {
    return;
  }

  this.div = document.createElement('div');
  this.html = readonly({
    app: options.app,
    assetUrl: BlocklyApps.assetUrl,
    options: {
      readonly: true,
      locale: BlocklyApps.LOCALE,
      localeDirection: BlocklyApps.localeDirection(),
      baseUrl: BlocklyApps.BASE_URL,
      cacheBust: BlocklyApps.CACHE_BUST,
      skinId: options.skin,
      level: options.level,
      blocks: generateXMLForBlocks(blocksToDisplay)
    }
  });
  this.iframe = document.createElement('iframe');
  this.iframe.setAttribute('id', 'feedbackBlocks');
  this.iframe.setAttribute('allowtransparency', 'true');
  this.div.appendChild(this.iframe);
};

FeedbackBlocks.prototype.show = function() {
  var iframe = document.getElementById('feedbackBlocks');
  if (iframe) {
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(this.html);
    doc.close();
  }
};

var getGeneratedCodeElement = function() {
  var codeInfoMsgParams = {
    berkeleyLink: "<a href='http://bjc.berkeley.edu/' target='_blank'>Berkeley</a>",
    harvardLink: "<a href='https://cs50.harvard.edu/' target='_blank'>Harvard</a>"
  };

  var infoMessage = BlocklyApps.editCode ?  "" : msg.generatedCodeInfo(codeInfoMsgParams);
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
      icon: BlocklyApps.ICON,
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
  var blocks = Blockly.mainWorkspace.getAllBlocks();
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
  return getMissingRequiredBlocks().length === 0;
};

/**
 * Get blocks that the user intends in the program. These are the blocks that
 * are used when checking for required blocks and when determining lines of code
 * written.
 * @return {Array<Object>} The blocks.
 */
var getUserBlocks = function() {
  var allBlocks = Blockly.mainWorkspace.getAllBlocks();
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
  var allBlocks = Blockly.mainWorkspace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled;
  });
  return blocks;
};

/**
 * Check to see if the user's code contains the required blocks for a level.
 * This never returns more than BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG.
 * @return {!Array} array of array of strings where each array of strings is
 * a set of blocks that at least one of them should be used. Each block is
 * represented as the prefix of an id in the corresponding template.soy.
 */
var getMissingRequiredBlocks = function () {
  var missingBlocks = [];
  var code = null;  // JavaScript code, which is initalized lazily.
  if (BlocklyApps.REQUIRED_BLOCKS && BlocklyApps.REQUIRED_BLOCKS.length) {
    var userBlocks = getUserBlocks();
    // For each list of required blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG
    var missingBlockNum = 0;
    for (var i = 0;
         i < BlocklyApps.REQUIRED_BLOCKS.length &&
             missingBlockNum < BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG;
         i++) {
      var requiredBlock = BlocklyApps.REQUIRED_BLOCKS[i];
      // For each of the test
      // If at least one of the tests succeeded, we consider the required block
      // is used
      var usedRequiredBlock = false;
      for (var testId = 0; testId < requiredBlock.length; testId++) {
        var test = requiredBlock[testId].test;
        if (typeof test === 'string') {
          code = code || Blockly.Generator.workspaceToCode('JavaScript');
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
          }
        } else {
          throw new Error('Bad test: ' + test);
        }
      }
      if (!usedRequiredBlock) {
        missingBlockNum++;
        missingBlocks = missingBlocks.concat(BlocklyApps.REQUIRED_BLOCKS[i][0]);
      }
    }
  }
  return missingBlocks;
};

/**
 * Do we have any floating blocks not attached to an event block or function block?
 */
exports.hasExtraTopBlocks = function () {
  var topBlocks = Blockly.mainWorkspace.getTopBlocks();
  for (var i = 0; i < topBlocks.length; i++) {
    // ignore disabled top blocks. we have a level turtle:2_7 that depends on
    // having disabled top level blocks
    if (topBlocks[i].disabled) {
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
  if (BlocklyApps.CHECK_FOR_EMPTY_BLOCKS && hasEmptyContainerBlocks()) {
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
  if (!hasAllRequiredBlocks()) {
    return levelComplete ? TestResults.MISSING_BLOCK_FINISHED :
      TestResults.MISSING_BLOCK_UNFINISHED;
  }
  var numEnabledBlocks = exports.getNumCountableBlocks();
  if (!levelComplete) {
    if (BlocklyApps.IDEAL_BLOCK_NUM && BlocklyApps.IDEAL_BLOCK_NUM !== Infinity &&
        numEnabledBlocks < BlocklyApps.IDEAL_BLOCK_NUM) {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
    return TestResults.LEVEL_INCOMPLETE_FAIL;
  }
  if (BlocklyApps.IDEAL_BLOCK_NUM &&
      numEnabledBlocks > BlocklyApps.IDEAL_BLOCK_NUM) {
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
      Blockly.fireUiEvent(btn, 'click');
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
 * Creates the XML for blocks to be displayed in a read-only frame.
 * @param {Array} blocks An array of blocks to display (with optional args).
 * @return {string} The generated string of XML.
 */
var generateXMLForBlocks = function(blocks) {
  var blockXMLStrings = [];
  var blockX = 10;  // Prevent left output plugs from being cut off.
  var blockY = 0;
  var blockXPadding = 200;
  var blockYPadding = 120;
  var blocksPerLine = 2;
  var k, name;
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.blockDisplayXML) {
      blockXMLStrings.push(block.blockDisplayXML);
      continue;
    }
    blockXMLStrings.push('<block', ' type="', block.type, '" x="',
                        blockX.toString(), '" y="', blockY, '">');
    if (block.titles) {
      var titleNames = Object.keys(block.titles);
      for (k = 0; k < titleNames.length; k++) {
        name = titleNames[k];
        blockXMLStrings.push('<title name="', name, '">',
                            block.titles[name], '</title>');
      }
    }
    if (block.values) {
      var valueNames = Object.keys(block.values);
      for (k = 0; k < valueNames.length; k++) {
        name = valueNames[k];
        blockXMLStrings.push('<value name="', name, '">',
                            block.values[name], '</value>');
      }
    }
    if (block.extra) {
      blockXMLStrings.push(block.extra);
    }
    blockXMLStrings.push('</block>');
    if ((i + 1) % blocksPerLine === 0) {
      blockY += blockYPadding;
      blockX = 0;
    } else {
      blockX += blockXPadding;
    }
  }
  return blockXMLStrings.join('');
};

/* start-test-block */
  // export private function(s) to expose to unit testing
  exports.__testonly__ = {
    getMissingRequiredBlocks: getMissingRequiredBlocks
  };
/* end-test-block */
