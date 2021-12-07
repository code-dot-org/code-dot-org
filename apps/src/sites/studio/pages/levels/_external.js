import $ from 'jquery';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {onContinue} from '@cdo/apps/code-studio/levels/postOnContinue';
import {getStore} from '@cdo/apps/code-studio/redux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';

$(document).ready(() => {
  const script = document.querySelector('script[data-external]');
  const data = JSON.parse(script.dataset.external);

  // If this is in a level group, we dont need to do anything special for
  // milestone requests
  if (data.in_level_group) {
    return;
  }

  const store = getStore();

  if (data.is_instructor || data.is_instructor_in_training) {
    store.dispatch(setViewType(ViewType.Instructor));
  }

  registerGetResult();

  // Handle click on the continue button (results in navigating to next puzzle)
  // Note: We're using this pattern instead of
  //   $('.submitButton').click(...)
  // on purpose, because .submitButton may not exist yet when this code is run.
  // By using a static ancestor jQuery will automatically bind the event handler later
  // when .submitButton is added to the DOM.
  // @see https://stackoverflow.com/q/203198
  $('.full_container').on('click', '.submitButton', function() {
    onContinue();
  });
});
