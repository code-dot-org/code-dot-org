/* global appOptions */

/**
 * A set of helpers used for cases where we want to make our milestone post
 * when clicking 'Continue'.
 *
 * Note: There is similar (but more complex) functionality in levels/_dialog.js.
 * Consider merging the two implementations at some point.
 */

import {getResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {
  sendReport,
  getLastServerResponse
} from '@cdo/apps/code-studio/reporting';
import {TestResults} from '@cdo/apps/constants';

/**
 * Make our milestone post with some simple configuration. Note, this assumes
 * the level is a type that will always post "success".
 */
export function onContinue() {
  // prevent multiple milestone reports
  const submitButton = $('.submitButton');
  if (submitButton.attr('disabled')) {
    return;
  }
  submitButton.attr('disabled', true);

  // In cases where this is used, we register the default getResult function, so
  // this will just be { response: 'ok', result: true }
  const result = getResult();

  // callback here really means "url that we post to"
  const postUrl = appOptions.dialog.callback;
  if (!postUrl) {
    // Don't bother trying to post if we don't have a url to post to. One known
    // case where this happens is if I go to a /levels/<levelnum> page
    return;
  }

  sendReport({
    program: result.response,
    fallbackResponse: appOptions.dialog.fallbackResponse,
    callback: postUrl,
    // expect this to always be standalone_video here
    app: appOptions.dialog.app,
    level: appOptions.dialog.level,
    result: result.result,
    pass: true,
    testResult: TestResults.ALL_PASS,
    onComplete: function() {
      const lastServerResponse = getLastServerResponse();
      let url = lastServerResponse && lastServerResponse.nextRedirect;
      if (!url) {
        const fallback = JSON.parse(appOptions.dialog.fallbackResponse);
        url = fallback.success.redirect;
      }

      window.location.href = url;
    }
  });
}
