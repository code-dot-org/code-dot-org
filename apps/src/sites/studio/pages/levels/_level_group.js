/* global appOptions */

import $ from 'jquery';
import throttle from 'lodash/throttle';
import getScriptData from '@cdo/apps/util/getScriptData';
import * as codeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {IncompleteDialog, CompleteDialog} from '@cdo/apps/lib/ui/LegacyDialogContents';
window.Multi = require('@cdo/apps/code-studio/levels/multi.js');
window.TextMatch = require('@cdo/apps/code-studio/levels/textMatch.js');
var saveAnswers = require('@cdo/apps/code-studio/levels/saveAnswers.js').saveAnswers;

$(document).ready(() => {
  const levelData = getScriptData('levelData');
  const initData = getScriptData('initData');
  window.levelData = levelData;

  if (initData) {
    window.initLevelGroup(
      initData.total_level_count,
      initData.page,
      initData.last_attempt
    );
  }
});

window.initLevelGroup = function (levelCount, currentPage, lastAttempt) {

  // Whenever an embedded level notifies us that the user has made a change,
  // check for any changes in the response set, and if so, attempt to save
  // these answers.  Saving is throttled to not occur more than once every 20
  // seconds, and is done as soon as possible ("leading edge"), as well as at
  // the end of a 20 second period if a change was made before then ("trailing
  // edge").  Any pending throttled calls are cancelled when we go to a new page
  // and save for that reason.

  codeStudioLevels.registerGetResult(getAggregatedResults);

  function submitSublevelResults(completion, subLevelIdChanged) {
    const levelIds = codeStudioLevels.getLevelIds();
    var sendReportCompleteCount = 0;
    var subLevelCount = levelIds.length;
    if (subLevelCount === 0) {
      return completion();
    }
    function handleSublevelComplete() {
      sendReportCompleteCount++;
      if (sendReportCompleteCount === subLevelCount) {
        completion();
      }
    }
    for (var subLevelId of levelIds) {
      if (typeof subLevelIdChanged !== 'undefined' && subLevelIdChanged !== parseInt(subLevelId)) {
        // Only one sublevel changed and this is not the one, so skip the post and
        // call the completion function immediately
        handleSublevelComplete();
        continue;
      }
      const subLevel = codeStudioLevels.getLevel(subLevelId);
      var subLevelResult = subLevel.getResult(true);
      var response = encodeURIComponent(replaceEmoji(subLevelResult.response.toString()));
      var result = subLevelResult.result;
      var testResult = subLevelResult.testResult ? subLevelResult.testResult : (result ? 100 : 0);
      var submitted = subLevelResult.submitted || false;

      window.dashboard.reporting.sendReport({
        program: response,
        fallbackResponse: appOptions.dialog.fallbackResponse,
        callback: appOptions.dialog.sublevelCallback + subLevelId,
        app: subLevel.getAppName(),
        allowMultipleSends: true,
        level: subLevelId,
        result: subLevelResult,
        pass: subLevelResult,
        testResult: testResult,
        submitted: submitted,
        onComplete: handleSublevelComplete
      });
    }
  }

  var throttledSaveAnswers = throttle(
    subLevelId => {
      submitSublevelResults(saveAnswers, subLevelId);
    }, 20 * 1000);

  var lastResponse = getAggregatedResults().response;

  codeStudioLevels.registerAnswerChangedFn(
    (levelId, saveThisAnswer) => {
      // LevelGroup is only interested in changes that should result in a save
      if (!saveThisAnswer) {
        return;
      }
      const currentResponse = getAggregatedResults().response;
      if (lastResponse !== currentResponse) {
        throttledSaveAnswers(levelId);
      }
      lastResponse = currentResponse;
    }
  );

  /**
   * Construct an array of all the level results. When submitted it's something
   * like this:
   *
   * {"1977": {"result": "0", "valid": true},
   *  "2007": {"result": "-1", "valid": false},
   *  "1939": {"result": "2,1", "valid": true}}
   */
  function getAggregatedResults() {
    // Add any new results to the existing lastAttempt results.
    const levelIds = codeStudioLevels.getLevelIds();
    levelIds.forEach(function (levelId) {
      const subLevel = codeStudioLevels.getLevel(levelId);
      const currentAnswer = subLevel.getResult(true);
      const levelResult = replaceEmoji(currentAnswer.response.toString());
      const valid = currentAnswer.valid;
      lastAttempt[levelId] = {
        result: levelResult,
        valid: valid
      };
    });

    var validCount = 0;
    for (var level in lastAttempt) {
      if (lastAttempt[level].valid) {
        validCount ++;
      }
    }

    const confirmationDialog = (validCount === levelCount) ? CompleteDialog : IncompleteDialog;

    return {
      response: encodeURIComponent(JSON.stringify(lastAttempt)),
      result: true,
      submitted: window.appOptions.level.submittable,
      confirmationDialog: confirmationDialog,
      beforeProcessResultsHook: submitSublevelResults
    };
  }

  // Called by gotoPage when it's ready to actually change the page.
  function changePage(targetPage) {
    var newLocation = window.location.href.replace("/page/" + currentPage, "/page/" + targetPage);
    window.location.href = newLocation;
  }

  // Called by previous/next button handlers.
  // Goes to a new page, first saving current answers if necessary.
  function gotoPage(targetPage) {
    // Are we read-only?  This can be because we're a teacher OR because an answer
    // has been previously submitted.
    if (window.appOptions.readonlyWorkspace) {
      changePage(targetPage);
    } else {
      // Submit what we have, and when that's done, go to the next page of the
      // long assessment.  Cancel any pending throttled attempts at saving state.
      throttledSaveAnswers.cancel();
      const afterSave = () => changePage(targetPage);
      submitSublevelResults(() => saveAnswers(afterSave));
    }
  }

  // Replaces emoji in a string with a blank character.
  // (In fact, it's replacing all supplementary, i.e. non-BMP, characters.)
  // Returns the updated string.
  //
  // More information:
  //   http://dev.mysql.com/doc/refman/5.7/en/charset-unicode-utf8mb4.html
  //     describes the database's inability to store supplementary characters, which
  //     are those outside of the BMP (Basic Multilingual Plane).
  //   https://mathiasbynens.be/notes/javascript-encoding
  //     describes how characters outside the BMP can only be encoded in UTF-16
  //     using a surrogate pair, which is what we use to detect such characters.
  //
  function replaceEmoji(source) {
    const blankCharacter = "\u25A1";

    // Build the range for the supplementary pair in a way that works with Babel
    // (which currently handles \u encoding in a string incorrectly).
    var range =
      '[' + String.fromCharCode(0xD800) + '-' + String.fromCharCode(0xDBFF) + '][' +
            String.fromCharCode(0xDC00) + '-' + String.fromCharCode(0xDFFF) + ']';

    return source.replace(new RegExp(range, 'g'), blankCharacter);
  }

  $(".nextPageButton").click(function (event) {
    gotoPage(currentPage+1);
  });

  $(".previousPageButton").click(function (event) {
    gotoPage(currentPage-1);
  });
};
