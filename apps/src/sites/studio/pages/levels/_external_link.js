import {processResults} from '@cdo/apps/code-studio/levels/dialogHelper';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {reportTeacherReviewingStudentDslLevel} from '@cdo/apps/lib/util/analyticsUtils';

registerGetResult();

reportTeacherReviewingStudentDslLevel();

$(document).on('click', '.submitButton', () => {
  const submitButton = $('.submitButton');
  if (submitButton.attr('disabled')) {
    return;
  }
  // Avoid multiple simultaneous submissions.
  submitButton.attr('disabled', true);
  processResults();
});
