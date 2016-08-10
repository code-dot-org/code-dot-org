/* globals appOptions, Dialog, getResult, CDOSounds, showVideoDialog, dashboard */
import $ from 'jquery';
import React from 'react';
import PlayZone from '../components/playzone';
import ReactDOM from 'react-dom';


/*
 * This file contains general logic for displaying modal dialogs and handling
 * submit button interactions.
 */

window.dashboard = window.dashboard || {};
window.dashboard.dialog = (function () {
  var dialogType = null;
  var adjustedScroll = false;

  $(document).ready(function () {
    if (appOptions.dialog.preTitle) {
      window.setTimeout(function () {
        showDialog("pre");
      }, 1000);
    }
  });

  // Are we read-only?  This can be because we're a teacher OR because an answer
  // has been previously submitted.
  if (appOptions.readonlyWorkspace) {
    // hide the Submit button.
    $('.submitButton').hide();

    // Are we a student viewing their own previously-submitted work?
    if (appOptions.submitted) {
      // show the Unsubmit button.
      $('.unsubmitButton').show();
    }

    // Set the entire page background to be light grey.
    $('.full_container').addClass('submitted_readonly');
  }

  // Unsubmit button should only be available when this is a standalone level.
  $('.unsubmitButton').click(function () {
    showDialog('unsubmit', function () {
      $.post(window.appOptions.unsubmitUrl,
        {"_method": 'PUT', user_level: {submitted: false}},
        function () {
          // Just reload so that the progress in the header is shown correctly.
          location.reload();
        }
      );
    });
  });

  function dialogHidden() {
    var lastServerResponse = window.dashboard.reporting.getLastServerResponse();
    if (dialogType === "success" && lastServerResponse.nextRedirect) {
      window.location.href = lastServerResponse.nextRedirect;
    }

    if (dialogType === "error") {
      adjustScroll();
    }

    if (dialogType === "instructions") {
      // Momentarily flash the instruction block white then back to regular.
      $('#bubble').css({backgroundColor: "rgba(255,255,255,1)"})
          .delay(500)
          .animate({backgroundColor: "rgba(0,0,0,0)"}, 1000);
    }
  }

  function showDialog(type, callback) {
    dialogType = type;

    // Use our prefabricated dialog content.
    var content = document.querySelector("#" + type + "-dialogcontent").cloneNode(true);
    var dialog = new window.Dialog({
      body: content,
      onHidden: dialogHidden,
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

    if (dialogType === "instructions") {
      dialog.show({hideOptions: {endTarget: "#bubble"}});
    } else {
      dialog.show();
    }
  }

  var showStartOverDialog = function (callback) {
    showDialog('startover', callback);
  };

  var showInstructionsDialog = function () {
    showDialog('instructions', null);
    $('details').details();
  };

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

  // TODO(dave): Dashboard shouldn't be reaching into the internal implementation of
  // individual levels. Instead levels should call appOptions.onAttempt.
  $(document).on('click', '.submitButton', function () {
    var submitButton = $('.submitButton');
    if (submitButton.attr('disabled')) {
      return;
    }

    var result = getResult();
    var showConfirmationDialog = result.showConfirmationDialog || false;
    if (showConfirmationDialog) {
      showDialog(showConfirmationDialog, function () {
        processResults(onComplete, result.beforeProcessResultsHook);
      });
    } else {
      // Avoid multiple simultaneous submissions.
      submitButton.attr('disabled', true);

      var onComplete = function (willRedirect) {
        if (!willRedirect) {
          $('.submitButton').attr('disabled', false);
        }
      };

      processResults(onComplete, result.beforeProcessResultsHook);
    }
  });

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
  var processResults = function (onComplete, beforeHook) {
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
          CDOSounds.play('failure');
        }
      } else {
        if (!appOptions.dialog.skipSound) {
          CDOSounds.play('success');
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
            const dialog = new Dialog({
              body: body,
              width: 800,
              redirect: lastServerResponse.nextRedirect
            });
            dialog.show();
          } else if (lastServerResponse.nextRedirect) {
            if (appOptions.dialog.shouldShowDialog) {
              showDialog("success");
            } else {
              window.location.href = lastServerResponse.nextRedirect;
            }
          }
        }
      });
    }
  };

  return {
    showStartOverDialog: showStartOverDialog,
    showInstructionsDialog: showInstructionsDialog,
    processResults: processResults
  };
})();
