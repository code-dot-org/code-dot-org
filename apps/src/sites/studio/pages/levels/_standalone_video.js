import $ from 'jquery';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { postMilestoneForPageLoad, onContinue } from '@cdo/apps/code-studio/levels/postOnLoad';

$(document).ready(() => {
  registerGetResult();

  // make milestone post
  postMilestoneForPageLoad();

  // handle click on continue (results in navigating to next puzzle)
  $(".submitButton").click(onContinue);
});
