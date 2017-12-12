/* globals appOptions */
import $ from 'jquery';
import React from 'react';
import PlayZone from '../components/playzone';
import ReactDOM from 'react-dom';
import { getResult } from './codeStudioLevels';
import LegacyDialog from '@cdo/apps/code-studio/LegacyDialog';
import Sounds from '../../Sounds';

/*
 * This file contains general logic for displaying modal dialogs
 */

var adjustedScroll = false;

/**
 * @param {string|Component} typeOrComponent - Either a string identifying the DOM
 *   to use in this dialog, or a ReactComponent representing the contents. Of the
 *   two, the latter is preferable.
 * @param {function} callback - Method to call when OK is clicked
 * @param {function} onHidden - Method called when dialog is hidden/closed
 */
export function showDialog(typeOrComponent, callback, onHidden) {
  let content;
  if (typeof(typeOrComponent) === 'string') {
    // Use our prefabricated dialog content.
    content = document.querySelector("#" + typeOrComponent + "-dialogcontent").cloneNode(true);
  } else {
    const div = document.createElement('div');
    ReactDOM.render(typeOrComponent, div);
    content = div.childNodes[0];
  }
  const dialog = new LegacyDialog({
    // Content is a div with a specific expected structure. See LegacyDialog.
    body: content,
    onHidden,
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
  return dialog;
}

export function showStartOverDialog(callback) {
  showDialog('startover', callback);
}

export function showInstructionsDialog() {
  showDialog('instructions', null);
  $('details').details();
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
    var errorDialog = results.errorDialog;
    var testResult = results.testResult ? results.testResult : (result ? 100 : 0);
    var submitted = results.submitted || false;

    if (!result) {
      // errorType is set by multi and by contract_match. In the case of multi,
      // it's either "toofew" or null.
      // contract_match generates its DOM for the possible error values here:
      // https://github.com/code-dot-org/code-dot-org/blob/536da331a97b36824ac433ed667786c0b1e79ba2/dashboard/app/views/levels/_contract_match.html.haml#L24
      if (errorDialog) {
        // In this case, errorDialog should be an instance of a React class.
        showDialog(errorDialog);
      } else {
        showDialog('error', null, adjustScroll);
      }

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
            showDialog("success", null, () => {
              var lastServerResponse = window.dashboard.reporting.getLastServerResponse();
              if (lastServerResponse.nextRedirect) {
                window.location.href = lastServerResponse.nextRedirect;
              }
            });
          } else {
            window.location.href = lastServerResponse.nextRedirect;
          }
        }
      }
    });
  }
}
