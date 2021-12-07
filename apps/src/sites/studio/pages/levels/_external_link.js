import {processResults} from '@cdo/apps/code-studio/levels/dialogHelper';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {getStore} from '@cdo/apps/code-studio/redux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';

registerGetResult();

$(document).on('click', '.submitButton', () => {
  const submitButton = $('.submitButton');
  if (submitButton.attr('disabled')) {
    return;
  }
  // Avoid multiple simultaneous submissions.
  submitButton.attr('disabled', true);
  processResults();

  const data = getScriptData('externallink');
  const store = getStore();
  if (data.is_instructor || data.is_instructor_in_training) {
    store.dispatch(setViewType(ViewType.Instructor));
  }
});
