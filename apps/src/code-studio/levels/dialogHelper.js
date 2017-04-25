/* globals appOptions */
import * as msg from '@cdo/locale';
import $ from 'jquery';
import experiments from '@cdo/apps/util/experiments';
import React from 'react';
import PlayZone from '../components/playzone';
import ReactDOM from 'react-dom';
import AchievementDialog from '@cdo/apps/templates/AchievementDialog';
import StageAchievementDialog from '@cdo/apps/templates/StageAchievementDialog';
import Feedback from '@cdo/apps/feedback';
import { getResult } from './codeStudioLevels';
import LegacyDialog from '@cdo/apps/code-studio/LegacyDialog';
import Sounds from '../../Sounds';

/*
 * This file contains general logic for displaying modal dialogs
 */

var dialogType = null;
var adjustedScroll = false;

function dialogHidden() {
  var lastServerResponse = window.dashboard.reporting.getLastServerResponse();
  if (dialogType === "success" && lastServerResponse.nextRedirect) {
    window.location.href = lastServerResponse.nextRedirect;
  }

  if (dialogType === "error") {
    adjustScroll();
  }
}

export function showDialog(type, callback, onHidden) {
  dialogType = type;

  // Use our prefabricated dialog content.
  var content = document.querySelector("#" + type + "-dialogcontent").cloneNode(true);
  var dialog = new LegacyDialog({
    body: content,
    onHidden: onHidden || dialogHidden,
    autoResizeScrollableElement: '.scrollable-element'
  });

  // Clicking the okay button in the dialog box dismisses it, and calls the callback.
  $(content).find("#ok-button").click(function () {
    dialog.hide();
    if (callback) {
      callback();
    }
  });

  // Clicking the cancel button in the dialog box dismisses it.
  $(content).find("#cancel-button").click(function () {
    dialog.hide();
  });

  dialog.show();
}

export function showStartOverDialog(callback) {
  showDialog('startover', callback);
}

export function showInstructionsDialog() {
  showDialog('instructions', null);
  $('details').details();
}

function showAchievementDialog(onContinue, progress, assetUrl) {
  console.log(progress);
  const achievements = [{
    check: true,
    msg: msg.puzzleCompleted(),
    progress: progress.newStageProgress - progress.oldStageProgress,
  }];
  const feedbackMessage = msg.nextLevel({
    puzzleNumber: appOptions.level.puzzle_number,
  });

  const container = document.createElement('div');
  document.body.appendChild(container);
  ReactDOM.render(
    <AchievementDialog
      achievements={achievements}
      assetUrl={assetUrl}
      encourageRetry={false}
      feedbackMessage={feedbackMessage}
      oldStageProgress={progress.oldStageProgress}
      onContinue={onContinue}
      showPuzzleRatingButtons={false}
      showStageProgress={true}
    />, container);
}

function adjustScroll() {
  if (adjustedScroll) {
    return;
  }

  var win = $(window);
  var el = $('.mainblock');
  var winPos = win.scrollTop() + win.height();
  var elPos = el.offset().top + el.height() - 10;

  if (winPos < elPos) {
    $('html, body').animate({
      scrollTop: $(".submitButton:first").offset().top - 10
    }, 1000);
  }

  adjustedScroll = true;
}

/**
 * Process the solution to the puzzle submitted by the user.
 * @param {function(boolean)} onComplete Optional callback function to call when
 *     the server call completes, which receives a boolean indicating whether
 *     the browser will redirect to a new location after it is called.
 * @param {function(function)} beforeHook Optional callback function to call
 *     before processResults gets underway. This function must call the completion
 *     function passed as the parameter to complete the processResults call.
 */
// TODO(dave): move this logic into appOptions.onAttempt for levels of type
// external (including pixelation), multi, match, free_response, level_group,
// and any others which render 'levels/dialog'.
export function processResults(onComplete, beforeHook) {
  if (beforeHook) {
    beforeHook(sendResultsCompletion);
  } else {
    sendResultsCompletion();
  }
  function sendResultsCompletion() {
    var results = getResult();
    var response = results.response;
    var result = results.result;
    var errorType = results.errorType;
    var testResult = results.testResult ? results.testResult : (result ? 100 : 0);
    var submitted = results.submitted || false;

    if (!result) {
      showDialog(errorType || "error");
      if (!appOptions.dialog.skipSound) {
        Sounds.getSingleton().play('failure');
      }
    } else {
      if (!appOptions.dialog.skipSound) {
        Sounds.getSingleton().play('success');
      }
    }

    window.dashboard.reporting.sendReport({
      program: response,
      fallbackResponse: appOptions.dialog.fallbackResponse,
      callback: appOptions.dialog.callback,
      app: appOptions.dialog.app,
      level: appOptions.dialog.level,
      result: result,
      pass: result,
      testResult: testResult,
      submitted: submitted,
      onComplete: function () {
        var lastServerResponse = window.dashboard.reporting.getLastServerResponse();
        var willRedirect = !!lastServerResponse.nextRedirect;
        if (onComplete) {
          onComplete(willRedirect);
        }

        if (lastServerResponse.videoInfo) {
          window.dashboard.videos.showVideoDialog(lastServerResponse.videoInfo);
        } else if (lastServerResponse.endOfStageExperience) {
          const body = document.createElement('div');
          const stageInfo = lastServerResponse.previousStageInfo;
          const stageName = `${window.dashboard.i18n.t('stage')} ${stageInfo.position}: ${stageInfo.name}`;
          ReactDOM.render(
            <PlayZone
              stageName={stageName}
              onContinue={() => { dialog.hide(); }}
              i18n={window.dashboard.i18n}
            />,
            body
          );
          const dialog = new LegacyDialog({
            body: body,
            width: 800,
            redirect: lastServerResponse.nextRedirect
          });
          dialog.show();
        } else if (lastServerResponse.nextRedirect) {
          if (appOptions.dialog.shouldShowDialog) {
            if (experiments.isEnabled('gamification')) {
              const progress = Feedback.calculateStageProgress(
                true /* isPerfect */,
                0 /* hintsUsed */,
                appOptions.serverLevelId,
                false /* finiteIdealBlocks */);

              // This is a hack
              const assetUrl = path => '/blockly/' + path;

              let onContinue = dialogHidden;
              if (Feedback.isLastLevel()) {
                const stageInfo = lastServerResponse.previousStageInfo;
                const stageName = `${window.dashboard.i18n.t('stage')} ${stageInfo.position}: ${stageInfo.name}`;
                onContinue = () => {
                  const div = document.createElement('div');
                  document.body.appendChild(div);
                  ReactDOM.render(
                    <StageAchievementDialog
                      stageName={stageName}
                      assetUrl={assetUrl}
                      onContinue={dialogHidden}
                      showStageProgress={experiments.isEnabled('gamification')}
                      newStageProgress={progress.newStageProgress}
                      numStars={Math.min(3, Math.round((progress.newStageProgress * 3) + 0.5))}
                    />,
                    div
                  );
                };
              }

              showAchievementDialog(onContinue, progress, assetUrl);
            } else {
              showDialog("success");
            }
          } else {
            window.location.href = lastServerResponse.nextRedirect;
          }
        }
      }
    });
  }
}
