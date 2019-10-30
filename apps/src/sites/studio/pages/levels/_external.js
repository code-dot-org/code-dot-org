import $ from 'jquery';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {
  postMilestoneForPageLoad,
  onContinue
} from '@cdo/apps/code-studio/levels/postOnLoad';

$(document).ready(() => {
  const script = document.querySelector('script[data-external]');
  const data = JSON.parse(script.dataset.external);

  // If this is in a level group, we dont need to do anything special for
  // milestone requests
  if (data.in_level_group) {
    return;
  }

  registerGetResult();

  // make milestone post
  postMilestoneForPageLoad();

  // handle click on continue (results in navigating to next puzzle)
  $('.external').on('click', '.submitButton', onContinue);
});
