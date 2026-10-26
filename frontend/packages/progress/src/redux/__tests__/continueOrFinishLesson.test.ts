import {DashboardApiClient} from '@code-dot-org/core/api';
import {configureStore} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {getInitialValidationState} from '../../ProgressManager';
import type {ContinueLevelProperties} from '../continueOrFinishLesson';
import {
  continueOrFinishLesson,
  continueReportsSuccess,
} from '../continueOrFinishLesson';
import progressSlice, {
  initProgress,
  setCurrentLessonId,
  setValidationState,
} from '../progressSlice';
import {BUBBLE_CHOICE_LEVEL_ID, initPayload, lessonData} from './fixtures';

const level = (
  overrides: Partial<ContinueLevelProperties> = {},
): ContinueLevelProperties =>
  ({appName: 'music', ...overrides}) as ContinueLevelProperties;

function storeOn(currentLevelId: number, hasConditions = false) {
  const store = configureStore({reducer: {progress: progressSlice.reducer}});
  store.dispatch(initProgress(initPayload({currentLevelId})));
  store.dispatch(setCurrentLessonId(lessonData[0].id));
  store.dispatch(
    setValidationState({...getInitialValidationState(), hasConditions}),
  );
  const dispatch = (action: unknown) =>
    store.dispatch(action as never) as unknown as Promise<void>;
  return {store, dispatch};
}

let reportMilestone: ReturnType<typeof vi.spyOn>;
let pushState: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  reportMilestone = vi
    .spyOn(DashboardApiClient.activities, 'reportMilestone')
    .mockResolvedValue(undefined);
  pushState = vi.spyOn(window.history, 'pushState');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('continueReportsSuccess', () => {
  it('is true for a plain level without validations', () => {
    expect(continueReportsSuccess(level(), false)).toBe(true);
  });

  it('is false where another path reports success', () => {
    expect(continueReportsSuccess(level(), true)).toBe(false);
    expect(continueReportsSuccess(level({submittable: true}), false)).toBe(
      false,
    );
    expect(
      continueReportsSuccess(
        level({predictSettings: {isPredictLevel: true}}),
        false,
      ),
    ).toBe(false);
    expect(
      continueReportsSuccess(level({appName: 'bubble_choice'}), false),
    ).toBe(false);
  });
});

describe('continueOrFinishLesson', () => {
  it('reports success, then moves to the next level', async () => {
    const {store, dispatch} = storeOn(323);
    await dispatch(continueOrFinishLesson(level()));
    expect(reportMilestone).toHaveBeenCalledWith(
      expect.objectContaining({levelId: 323, app: 'music'}),
    );
    expect(store.getState().progress.currentLevelId).toBe(
      BUBBLE_CHOICE_LEVEL_ID,
    );
    expect(pushState).toHaveBeenCalled();
  });

  it('moves on without reporting on a validated level', async () => {
    const {store, dispatch} = storeOn(323, true);
    await dispatch(continueOrFinishLesson(level()));
    expect(reportMilestone).not.toHaveBeenCalled();
    expect(store.getState().progress.currentLevelId).toBe(
      BUBBLE_CHOICE_LEVEL_ID,
    );
  });

  it('shows the finish dialog on the last level', async () => {
    const showFinishDialog = vi.fn();
    const {dispatch} = storeOn(BUBBLE_CHOICE_LEVEL_ID);
    await dispatch(
      continueOrFinishLesson(
        level({finishUrl: '/s/course3', finishDialog: 'share'}),
        {showFinishDialog},
      ),
    );
    expect(showFinishDialog).toHaveBeenCalledWith('share', '/s/course3');
    expect(pushState).not.toHaveBeenCalled();
  });

  it('does nothing more on the last level without a finish URL', async () => {
    const showFinishDialog = vi.fn();
    const {store, dispatch} = storeOn(BUBBLE_CHOICE_LEVEL_ID);
    await dispatch(continueOrFinishLesson(level(), {showFinishDialog}));
    expect(reportMilestone).toHaveBeenCalledTimes(1);
    expect(showFinishDialog).not.toHaveBeenCalled();
    expect(store.getState().progress.currentLevelId).toBe(
      BUBBLE_CHOICE_LEVEL_ID,
    );
  });
});
