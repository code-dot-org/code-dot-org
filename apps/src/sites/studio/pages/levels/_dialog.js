/* globals appOptions */

import { showDialog, processResults } from  '@cdo/apps/code-studio/levels/dialogHelper';
import { getResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';

/**
 * This file does some handling of submit button interactions.
 */

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
