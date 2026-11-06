import {AnyAction, ThunkAction, ThunkDispatch} from '@reduxjs/toolkit';

import {
  navigateToNextLevel,
  sendSuccessReport,
} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {shareLab2Project} from '@cdo/apps/lab2/header/lab2HeaderShare';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {
  isFinishDialogId,
  showFinishDialog,
} from '@cdo/apps/lab2/views/dialogs/finishDialogs/showFinishDialog';
import {RootState} from '@cdo/apps/types/redux';

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

    // If there are no validation conditions and the level is not submittable, predict, or bubble choice level,
    // go ahead and send a success report when we continue.
    // For validated levels, success reports are managed by the ProgressContainer and ProgressManager.
    // For submittable levels, success reports are handled by the submit button.
    // For predict levels, success reports are handled by clicking run after writing a prediction.
    // For bubble choice levels, we only record progress on sublevels.
    if (
      !getState().lab.validationState.hasConditions &&
      !levelProperties.submittable &&
      !levelProperties.predictSettings?.isPredictLevel &&
      levelProperties.appName !== 'bubble_choice'
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

// The navigation half of continueOrFinishLesson, for a level that has
// already sent its own success report.
export const navigateToNextLevelOrFinish =
  (): ThunkAction<void, RootState, undefined, AnyAction> =>
  (dispatch, getState) => {
    const levelProperties = getState().lab.levelProperties;
    if (!levelProperties) {
      return;
    }
    handleNavigation(levelProperties, dispatch, getState);
  };

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
  // A finish dialog of its own keeps the student on the level; the unit's
  // finish URL is where its certificate offer leads.
  if (isFinishDialogId(finishDialog)) {
    showFinishDialog(finishDialog, finishUrl);
    return;
  }
  // If we have a finish URL, show the finish dialog if present, or redirect to the finish URL.
  if (finishUrl) {
    if (finishDialog) {
      shareLab2Project(finishDialog, finishUrl);
    } else {
      window.location.href = finishUrl;
    }
  }
}
