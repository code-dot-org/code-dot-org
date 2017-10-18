import { processResults } from  '@cdo/apps/code-studio/levels/dialogHelper';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';

// TODO - see if i need anything else from submissionHelper
registerGetResult();

$(document).on('click', '.submitButton', function () {
  var submitButton = $('.submitButton');
  if (submitButton.attr('disabled')) {
    return;
  }
  // Avoid multiple simultaneous submissions.
  submitButton.attr('disabled', true);
  processResults();
});
