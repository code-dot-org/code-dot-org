import {AnyAction, ThunkAction, ThunkDispatch} from '@reduxjs/toolkit';

import {
  navigateToNextLevel,
  sendSuccessReport,
} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {shareLab2Project} from '@cdo/apps/lab2/header/lab2HeaderShare';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
import experiments from '@cdo/apps/util/experiments';

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

    if (experiments.isEnabled('student_snapshot')) {
      const scriptId = getState().lab.scriptId;
      const lessonId = getState().progress.currentLessonId;
      const studentId = getState().currentUser.userId;
      if (scriptId === undefined || lessonId === undefined) {
        // Handle the error or return early if scriptId is required
        console.error('scriptId or lessonId is undefined');
        return;
      }

      getAiLessonFeedback(lessonId, scriptId, studentId);

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
    }
  };

async function getAiLessonFeedback(
  lessonId: number,
  unitId: number,
  studentId: number
) {
  try {
    const response = await fetch(
      `/student_snapshots/ai_generated_lesson_feedback?lesson_id=${lessonId}&unit_id=${unitId}&student_id=${studentId}`
    );
    if (!response.ok) {
      console.error(
        'Failed to fetch AI lesson feedback:',
        response.status,
        response.statusText
      );
      return null;
    }
    const data = await response.json();
    // Optionally check for expected keys in data
    if (!data || data.error) {
      console.error('Error in AI feedback response:', data?.error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Network or parsing error:', err);
    return null;
  }
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
