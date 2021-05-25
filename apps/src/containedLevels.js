import * as codeStudioLevels from './code-studio/levels/codeStudioLevels';
import {TestResults} from './constants';
import * as callouts from '@cdo/apps/code-studio/callouts';
import {getStore} from './redux';
import {setAwaitingContainedResponse} from './redux/runState';
import locale from '@cdo/locale';
import $ from 'jquery';
import queryString from 'query-string';

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
export function postContainedLevelAttempt({
  hasContainedLevels,
  attempts,
  onAttempt
}) {
  if (!hasContainedLevels || attempts !== 1) {
    return;
  }

  const isTeacher = getStore().getState().currentUser?.userType === 'teacher';
  if (isTeacher) {
    if (!!queryString.parse(window.location.search).user_id) {
      // if we have a user_id in the search params, we are a viewing student
      // work and should not post a milestone.
      return;
    }
  }

  // Track the fact that we're currently submitting
  postState = PostState.Started;

  /**
   * Get report info for our contained level. *Note:* If we are currently editing blocks,
   * some of the report info will be overwritten in onAttempt() in order to allow levelbuilders
   * to update blocks (rather than submit the contained level).
   */
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
    throw new Error(
      'Shouldnt call runAfterPostContainedLevel before postContainedLevelAttempt'
    );
  }
  if (postState === PostState.Finished) {
    fn();
    return;
  }
  callOnPostCompletion = fn;
}

export function initializeContainedLevel() {
  const store = getStore();
  if (!store.getState().instructions.hasContainedLevels) {
    return;
  }
  if (codeStudioLevels.hasValidContainedLevelResult()) {
    // We already have an answer, don't allow it to be changed, but allow Run
    // to be pressed so the code can be run again.
    codeStudioLevels.lockContainedLevelAnswers();
  } else {
    // No answers yet, disable Run button until there is an answer
    let runButton = $('#runButton');
    let stepButton = $('#stepButton');
    runButton.prop('disabled', true);
    stepButton.prop('disabled', true);
    const disabledRunButtonHandler = e => {
      $(window).trigger('attemptedRunButtonClick');
    };
    $('#runButtonWrapper').bind('click', disabledRunButtonHandler);

    callouts.addCallouts([
      {
        id: 'disabledRunButtonCallout',
        element_id: '#runButton',
        localized_text: locale.containedLevelRunDisabledTooltip(),
        qtip_config: {
          codeStudio: {
            canReappear: true
          },
          position: {
            my: 'top left',
            at: 'bottom center'
          }
        },
        on: 'attemptedRunButtonClick'
      }
    ]);
    store.dispatch(setAwaitingContainedResponse(true));

    codeStudioLevels.registerAnswerChangedFn(() => {
      // Ideally, runButton would be declaratively disabled or not based on redux
      // store state. We might be close to a point where we can do that, but
      // because runButton is also mutated outside of React (here and elsewhere)
      // we need to worry about cases where the DOM gets out of sync with the
      // React layer
      const validResult = codeStudioLevels.hasValidContainedLevelResult();
      runButton.prop('disabled', !validResult);
      stepButton.prop('disabled', !validResult);
      if (validResult) {
        runButton.qtip('hide');
        $('#runButtonWrapper').unbind('click', disabledRunButtonHandler);
      }
      getStore().dispatch(setAwaitingContainedResponse(!validResult));
    });
  }
}
