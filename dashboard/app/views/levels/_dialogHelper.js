/* global $ appOptions lastServerResponse Dialog getResult CDOSounds sendReport showVideoDialog */

/*
 * This file contains general logic for displaying modal dialogs and handling
 * submit button interactions.
 */

var dialogType = null;
var adjustedScroll = false;

$(function () {
  if (appOptions.dialog.preTitle != "") {
    window.setTimeout(function () {
      showDialog("pre");
    }, 1000);
  }
});

function dialogHidden() {
  if (dialogType == "success" && lastServerResponse.nextRedirect) {
    window.location.href = lastServerResponse.nextRedirect;
  }

  if (dialogType == "error") {
    adjustScroll();
  }
}

function showDialog(type) {
  dialogType = type;

  var dialog = new Dialog({ body: "", onHidden: dialogHidden });

  // Use our prefabricated dialog content.
  $(".modal-body").append($("#" + type + "-dialogcontent").clone(true));

  // Clicking the okay button in the dialog box dismisses it.
  $(".modal-body #ok-button").click(function () {
    dialog.hide();
  });

  dialog.show();
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

// TODO(dave): Dashboard shouldn't be reaching into the internal implementation of
// individual levels. Instead levels should call appOptions.onAttempt.
$('.submitButton').click(function () {
  var submitButton = $('.submitButton');
  if (submitButton.attr('disabled')) {
    return;
  }

  // Avoid multiple simultaneous submissions.
  submitButton.attr('disabled', true);

  var onComplete = function(willRedirect) {
    if (!willRedirect) {
      $('.submitButton').attr('disabled', false);
    }
  };

  processResults(onComplete);
});

/**
 * Process the solution to the puzzle submitted by the user.
 * @param {function(boolean)} onComplete Optional callback function to call when
 *     the server call completes, which receives a boolean indicating whether
 *     the browser will redirect to a new location after it is called.
 */
// TODO(dave): move this logic into appOptions.onAttempt for levels of type
// external (including pixelation), multi, match, and any others
// which render 'levels/dialog'.
function processResults(onComplete) {
  var results = getResult();
  var response = results['response'];
  var result = results['result'];
  var errorType = results['errorType'];

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

  sendReport({
    program: response,
    fallbackResponse: appOptions.dialog.fallbackResponse,
    callback: appOptions.dialog.callback,
    app: appOptions.dialog.app,
    level: appOptions.dialog.level,
    result: result,
    testResult: result ? 100 : 0,
    onComplete: function () {
      var willRedirect = !!lastServerResponse.nextRedirect;
      onComplete && onComplete(willRedirect);

      if (lastServerResponse.videoInfo)
      {
        showVideoDialog(lastServerResponse.videoInfo);
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

