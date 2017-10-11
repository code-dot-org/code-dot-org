/* global appOptions */

/**
 * A set of helpers used for cases where we want to make our milestone post on
 * page load rather than on clicking continue
 */

import { getResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { sendReport } from '@cdo/apps/code-studio/reporting';
import { TestResults } from '@cdo/apps/constants';

/**
 * Make our milestone post with some simple configuration. Note, this assumes
 * the level is a type that will always post "success".
 */
export function postMilestoneForPageLoad() {
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
    callback: postUrl,
    // expect this to always be standalone_video here
    app: appOptions.dialog.app,
    level: appOptions.dialog.level,
    result: result.result,
    pass: true,
    testResult: TestResults.ALL_PASS
  });
}

/**
 * Code to run when clicking continue on a page where we make our milestone
 * post on page load.
 */
export function onContinue() {
  let url = appOptions.report.fallback_response.success.redirect;
  if (url) {
    window.location.href = url;
  }
}
