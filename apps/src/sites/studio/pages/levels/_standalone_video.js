import $ from 'jquery';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { postMilestoneForPageLoad, onContinue } from '@cdo/apps/code-studio/levels/postOnLoad';

$(document).ready(() => {
  registerGetResult();

  // make milestone post
  postMilestoneForPageLoad();

  // handle click on continue, in particular think about what happens if we didnt
  // hear back
  $(".submitButton").click(onContinue);
});
