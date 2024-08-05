import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {processResults} from '@cdo/apps/code-studio/levels/dialogHelper';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/lib/util/analyticsUtils';

registerGetResult();

reportTeacherReviewingStudentNonLabLevel();

$(document).on('click', '.submitButton', () => {
  const submitButton = $('.submitButton');
  if (submitButton.attr('disabled')) {
    return;
  }
  // Avoid multiple simultaneous submissions.
  submitButton.attr('disabled', true);
  processResults();
});
