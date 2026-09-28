import type {AnyAction, ThunkAction} from '@reduxjs/toolkit';

import type {LevelPropertiesBase} from '@code-dot-org/core/api';

import type {ProgressRootState} from './progressSlice';
import {
  navigateToNextLevel,
  nextLevelId,
  sendSuccessReport,
} from './progressSlice';

/** The level properties the Continue decision reads. */
export type ContinueLevelProperties = Pick<
  LevelPropertiesBase,
  'appName' | 'submittable' | 'predictSettings' | 'finishUrl' | 'finishDialog'
>;

export interface ContinueOptions {
  /**
   * Shows the level's finish dialog, which then leaves for finishUrl. Without
   * it, a level with a finish dialog goes straight to finishUrl.
   */
  showFinishDialog?: (finishDialog: string, finishUrl: string) => void;
}

/**
 * Whether Continue itself records success. Other paths own it for the rest:
 * ProgressContainer for validated levels, the submit button for submittable
 * ones, running a prediction for predict levels, and a bubble choice level
 * records progress only on its sublevels.
 */
export function continueReportsSuccess(
  levelProperties: ContinueLevelProperties,
  hasConditions: boolean,
): boolean {
  return (
    !hasConditions &&
    !levelProperties.submittable &&
    !levelProperties.predictSettings?.isPredictLevel &&
    levelProperties.appName !== 'bubble_choice'
  );
}

/**
 * The Continue button: record success where Continue owns it, then go to the
 * next level in the lesson, or finish the lesson.
 */
export function continueOrFinishLesson(
  levelProperties: ContinueLevelProperties,
  options: ContinueOptions = {},
): ThunkAction<Promise<void>, ProgressRootState, undefined, AnyAction> {
  return async (dispatch, getState) => {
    if (
      continueReportsSuccess(
        levelProperties,
        getState().progress.validationState.hasConditions,
      )
    ) {
      // Navigation can reload the page (a non-Lab2 level, a finish URL), so
      // the report must land first.
      await dispatch(sendSuccessReport(levelProperties.appName));
    }

    if (nextLevelId(getState()) !== undefined) {
      dispatch(navigateToNextLevel());
      return;
    }

    const {finishUrl, finishDialog} = levelProperties;
    if (!finishUrl) {
      return;
    }
    if (finishDialog && options.showFinishDialog) {
      options.showFinishDialog(finishDialog, finishUrl);
    } else {
      window.location.href = finishUrl;
    }
  };
}
