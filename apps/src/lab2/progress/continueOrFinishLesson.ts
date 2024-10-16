import {AnyAction, ThunkAction} from '@reduxjs/toolkit';

import {
  navigateToNextLevel,
  sendSuccessReport,
} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {RootState} from '@cdo/apps/types/redux';

import {shareLab2Project} from '../header/lab2HeaderShare';

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

    // If there are no validation conditions, go ahead and send a success report when we continue.
    // Otherwise, success reports are managed by the ProgressContainer and ProgressManager.
    if (!getState().lab.validationState.hasConditions) {
      dispatch(sendSuccessReport(levelProperties.appName));
    }

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
  };
