import { processResults } from  '@cdo/apps/code-studio/levels/dialogHelper';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';

registerGetResult();

$(document).on('click', '.submitButton', () => {
  const submitButton = $('.submitButton');
  if (submitButton.attr('disabled')) {
    return;
  }
  // Avoid multiple simultaneous submissions.
  submitButton.attr('disabled', true);
  processResults();
});
