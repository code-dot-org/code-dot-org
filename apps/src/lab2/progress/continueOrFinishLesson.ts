import {AnyAction, ThunkAction, ThunkDispatch} from '@reduxjs/toolkit';

import {
  navigateToNextLevel,
  sendSuccessReport,
} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {shareLab2Project} from '@cdo/apps/lab2/header/lab2HeaderShare';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
// NOTE TO SELF: This is where you want to call the AI Lesson Feedback Function
/**
 * Handles all logic for continuing lesson progression, either to the next level or finishing the lesson.
 */
export default (): ThunkAction<void, RootState, undefined, AnyAction> =>
  (dispatch, getState) => {
    const levelProperties = getState().lab.levelProperties;
    if (!levelProperties) {
      // Level has not been set up yet.
      return;
    }

    // Wrap all of this in a if statement that checks to see if the experiment is turned on
    const hardcodedSectionId = 735;
    const hardcodededTeacherId = 552;
    const scriptId = getState().lab.scriptId;
    const lessonId = getState().progress.currentLessonId;
    if (scriptId === undefined || lessonId === undefined) {
      // Handle the error or return early if scriptId is required
      console.error('scriptId or lessonId is undefined');
      return;
    }
    // TO DOs:
    // 1. Take prompt and send to openAi
    // 2. Get response from openAi and print to console
    // 3. Get response from openAi and save to back end
    printFeedbackPrompt(
      lessonId,
      scriptId, // Using lessonId for unitId temporarily
      getState().currentUser.userId,
      hardcodededTeacherId,
      hardcodedSectionId
    );

    // If there are no validation conditions and the level is not submittable or a predict level,
    // go ahead and send a success report when we continue.
    // For validated levels, success reports are managed by the ProgressContainer and ProgressManager.
    // For submittable levels, success reports are handled by the submit button.
    // For predict levels, success reports are handled by clicking run after writing a prediction.
    if (
      !getState().lab.validationState.hasConditions &&
      !levelProperties.submittable &&
      !levelProperties.predictSettings?.isPredictLevel
    ) {
      // Wait for the success report to complete before handling navigation,
      // as navigation could cause a page reload (either switching to a non-lab2 level
      // or redirecting to a finish URL).
      dispatch(sendSuccessReport(levelProperties.appName)).then(() =>
        handleNavigation(levelProperties, dispatch, getState)
      );
    } else {
      handleNavigation(levelProperties, dispatch, getState);
    }
  };

async function printFeedbackPrompt(
  lessonId: number,
  unitId: number,
  studentId: number,
  teacherId: number,
  sectionId: number
) {
  console.log('Fetching feedback prompt...');
  const response = await fetch(
    `/student_snapshots/lesson_feedback_prompt?lesson_id=${lessonId}&unit_id=${unitId}&student_id=${studentId}&teacher_id=${teacherId}&section_id=${sectionId}`
  );
  const data = await response.json();
  console.log(data.prompt);
}

function handleNavigation(
  levelProperties: LevelProperties,
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>,
  getState: () => RootState
) {
  // If we are not at the last level, continue to the next level.
  if (nextLevelId(getState()) !== undefined) {
    dispatch(navigateToNextLevel());
    return;
  }

  const {finishUrl, finishDialog} = levelProperties;
  // If we have a finish URL, show the finish dialog if present, or redirect to the finish URL.
  if (finishUrl) {
    if (finishDialog) {
      shareLab2Project(finishDialog, finishUrl);
    } else {
      window.location.href = finishUrl;
    }
  }
}
