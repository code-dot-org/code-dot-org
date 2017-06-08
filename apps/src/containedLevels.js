import * as codeStudioLevels from './code-studio/levels/codeStudioLevels';
import { TestResults } from './constants';

const PostState = {
  None: 'None',
  Started: 'Started',
  Finished: 'Finished'
};

let postState = PostState.None;
let callOnPostCompletion = null;

/**
 * Get results from contained level that we can use to post to the server. We
 * also potentially use this to craft feedback messages that the user will see
 * when they hit finish.
 */
export function getContainedLevelResultInfo() {
  const containedResult = codeStudioLevels.getContainedLevelResult();
  return {
    app: containedResult.app,
    level: containedResult.id,
    callback: containedResult.callback,
    // We only care whether they've submitted or not, and in many cases don't even
    // know as the client if the submission was correct or not, as we're often
    // not provided correct answers (i.e. in multis).
    result: true,
    testResult: TestResults.CONTAINED_LEVEL_RESULT,
    program: containedResult.result.response,
    feedback: containedResult.feedback,
    submitted: false
  };
}

/**
 * We don't report the validated result to the server, since we always treat
 * contained levels as correct from a progress point of view. We do use it for
 * displaying feedback though.
 */
export function getValidatedResult() {
  return codeStudioLevels.getContainedLevelResult().result.result;
}

/**
 * Called when clicking run. If we have a contained level, we want to submit our
 * attempt to the server (so that on reload, we'll have the saved answer and
 * don't let the student submit again).
 * @param {boolean} hasContainedLevels - Do we actually have a contained level
 * @param {number} attempts - How many times we've clicked run for this level
 * @param {function} onAttempt - Callback provided to studioApp for when we submit
 *   contained level
 */
export function postContainedLevelAttempt({hasContainedLevels, attempts, onAttempt}) {
  if (!hasContainedLevels || attempts !== 1) {
    return;
  }

  // Track the fact that we're currently submitting
  postState = PostState.Started;

  const reportInfo = getContainedLevelResultInfo();
  onAttempt({
    ...reportInfo,
    onComplete() {
      // Finished submitting. If we scheduled a completion function during the
      // submission, call that now.
      postState = PostState.Finished;
      if (callOnPostCompletion) {
        callOnPostCompletion();
        callOnPostCompletion = null;
      }
    }
  });
}

/**
 * Register a function to call after our post has completed. If our post already
 * happened, we can just call fn immediately
 * @param {function} fn - Method to call
 */
export function runAfterPostContainedLevel(fn) {
  if (postState === PostState.None) {
    throw new Error('Shouldnt call runAfterPostContainedLevel before postContainedLevelAttempt');
  }
  if (postState === PostState.Finished) {
    fn();
    return;
  }
  callOnPostCompletion = fn;
}
