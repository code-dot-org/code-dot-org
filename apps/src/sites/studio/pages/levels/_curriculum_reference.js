import $ from 'jquery';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {onContinue} from '@cdo/apps/code-studio/levels/postOnContinue';
import {getStore} from '@cdo/apps/code-studio/redux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerGetResult();

  // handle click on continue (results in navigating to next puzzle)
  $('.submitButton').click(onContinue);

  const data = getScriptData('curriculumreference');

  const store = getStore();

  if (data.is_instructor || data.is_instructor_in_training) {
    store.dispatch(setViewType(ViewType.Instructor));
  }
});

/**
 * Called on load of our iframe. This hides the spinner, shows the iframe, and
 * sets up a method to keep our iframe correctly sized.
 */
function onload() {
  const iframe = document.getElementById('curriculum-reference');
  // For some reaosn onload is called multiple times in Chrome. We only want to
  // start our interval once.
  if (iframe.style.display !== 'none') {
    return;
  }

  // Make iframe visible, hide spinner
  iframe.style.display = '';
  document.getElementById('iframe-loading').style.display = 'none';

  // Our iframe can resize for various reasons (initial load, images loaded on
  // iframe page, window resized). We want to keep the size of the iframe in
  // sync with the contents of the firame.
  setInterval(() => {
    resizeIFrame(iframe);
  }, 200);
}

function resizeIFrame(iframe) {
  const doc = iframe.contentWindow.document;
  const height = doc.body.scrollHeight;
  iframe.height = height;
}

window.curriculumReference = {onload};
