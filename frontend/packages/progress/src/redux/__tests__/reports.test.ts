// Milestone reporting and in-page navigation, run against a real store. The
// request itself is DashboardApiClient's; its wire format is tested in core.

import {ApiError, DashboardApiClient} from '@code-dot-org/core/api';
import {logger} from '@code-dot-org/core/plugins/observability';
import {configureStore} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {TestResults} from '../../constants';
import {milestoneTimer} from '../../MilestoneTimer';
import progressSlice, {
  getCurrentLevels,
  initProgress,
  navigateToLevelId,
  sendProgressReport,
  sendStartedReportIfNotStarted,
  sendSubmitReport,
  sendSuccessReport,
  sendSuccessReportForLevel,
  setCurrentLessonId,
  setScriptProgress,
} from '../progressSlice';
import {BUBBLE_CHOICE_LEVEL_ID, initPayload, lessonData} from './fixtures';

function storeOn(currentLevelId: number, courseId?: number) {
  const store = configureStore({reducer: {progress: progressSlice.reducer}});
  store.dispatch(initProgress(initPayload({currentLevelId, courseId})));
  store.dispatch(setCurrentLessonId(lessonData[0].id));
  // The thunks are typed against the full app state; this store holds only
  // the part they read.
  const dispatch = (action: unknown) => store.dispatch(action as never);
  const levels = () => getCurrentLevels(store.getState() as never);
  return {store, dispatch, levels};
}

// What the transport throws for an HTTP error status.
const declined = () =>
  new ApiError('Request failed', {status: 503, url: '', method: 'POST'});

let reportMilestone: ReturnType<typeof vi.spyOn>;
const sent = (call = 0) => reportMilestone.mock.calls[call][0];

beforeEach(() => {
  vi.useFakeTimers({toFake: ['Date']});
  milestoneTimer.resetMilestoneTimer();
  reportMilestone = vi
    .spyOn(DashboardApiClient.activities, 'reportMilestone')
    .mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('sendSuccessReport', () => {
  it('reports the current level under its script level', async () => {
    const {dispatch} = storeOn(323);
    await dispatch(sendSuccessReport('maze'));
    expect(sent()).toEqual({
      userId: 0,
      scriptLevelId: 102,
      levelId: 323,
      app: 'maze',
      result: true,
      testResult: TestResults.ALL_PASS,
      timeSinceLastMilestone: 0,
    });
  });

  it('sends the time since the last milestone, less idle time', async () => {
    const {dispatch} = storeOn(323);
    vi.advanceTimersByTime(90_000);
    milestoneTimer.startIdle();
    vi.advanceTimersByTime(30_000);
    milestoneTimer.endIdle();
    await dispatch(sendSuccessReport('maze'));
    expect(sent().timeSinceLastMilestone).toBe(90_000);
  });

  it('restarts the time after a successful post', async () => {
    const {dispatch} = storeOn(323);
    vi.advanceTimersByTime(90_000);
    await dispatch(sendSuccessReport('maze'));
    vi.advanceTimersByTime(5_000);
    await dispatch(sendSuccessReport('maze'));
    expect(sent(1).timeSinceLastMilestone).toBe(5_000);
  });

  it('keeps counting after a declined post', async () => {
    reportMilestone.mockRejectedValue(declined());
    const {dispatch} = storeOn(323);
    vi.advanceTimersByTime(90_000);
    await dispatch(sendSuccessReport('maze'));
    vi.advanceTimersByTime(5_000);
    await dispatch(sendSuccessReport('maze'));
    expect(sent(1).timeSinceLastMilestone).toBe(95_000);
  });

  it('sends courseId when the unit belongs to a course', async () => {
    const {dispatch} = storeOn(323, 17);
    await dispatch(sendSuccessReport('maze'));
    expect(sent().courseId).toBe(17);
  });

  it('omits courseId when the unit belongs to no course', async () => {
    const {dispatch} = storeOn(323);
    await dispatch(sendSuccessReport('maze'));
    expect(sent()).not.toHaveProperty('courseId');
  });

  it('updates a level the server already reported (#70881)', async () => {
    const {dispatch, levels} = storeOn(323);
    dispatch(
      setScriptProgress({323: {status: 'attempted', result: 3 as never}}),
    );
    expect(levels()[1].status).toBe('attempted');

    await dispatch(sendSuccessReport('maze'));
    expect(levels()[1].status).toBe('perfect');
  });

  it('updates a sublevel and its bubble choice parent', async () => {
    const {store, dispatch, levels} = storeOn(10301);
    dispatch(
      setScriptProgress({
        10301: {status: 'attempted', result: 3 as never},
        [BUBBLE_CHOICE_LEVEL_ID]: {status: 'attempted', result: 3 as never},
      }),
    );

    await dispatch(sendSuccessReport('maze'));
    expect(sent()).toMatchObject({scriptLevelId: 103, levelId: 10301});
    const {unitProgress, levelResults} = store.getState().progress;
    expect(unitProgress[10301].status).toBe('perfect');
    expect(unitProgress[BUBBLE_CHOICE_LEVEL_ID].status).toBe('perfect');
    expect(levelResults[BUBBLE_CHOICE_LEVEL_ID]).toBe(TestResults.ALL_PASS);
    expect(levels()[2].status).toBe('perfect');
  });

  it('leaves progress alone, silently, when the server declines', async () => {
    reportMilestone.mockRejectedValue(declined());
    const warn = vi.spyOn(logger, 'warn');
    const {store, dispatch} = storeOn(323);
    await expect(dispatch(sendSuccessReport('maze'))).resolves.toBeUndefined();
    expect(store.getState().progress.unitProgress[323]).toBeUndefined();
    expect(store.getState().progress.levelResults[323]).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('logs a post that never completes, and does not reject', async () => {
    reportMilestone.mockRejectedValue(new TypeError('Failed to fetch'));
    const warn = vi.spyOn(logger, 'warn');
    const {store, dispatch} = storeOn(323);
    await expect(dispatch(sendSuccessReport('maze'))).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith('Failed to send milestone report', {
      url: '/milestone/0/102/323',
      error: 'Failed to fetch',
    });
    expect(store.getState().progress.unitProgress[323]).toBeUndefined();
  });
});

describe('sendSuccessReportForLevel', () => {
  it('reports a bubble choice sublevel under its parent script level', async () => {
    const {store, dispatch} = storeOn(323);
    await dispatch(sendSuccessReportForLevel(10302, 'maze'));
    expect(sent()).toMatchObject({
      scriptLevelId: 103,
      levelId: 10302,
      testResult: TestResults.ALL_PASS,
    });
    const {levelResults} = store.getState().progress;
    expect(levelResults[10302]).toBe(TestResults.ALL_PASS);
    expect(levelResults[BUBBLE_CHOICE_LEVEL_ID]).toBe(TestResults.ALL_PASS);
    // The current level is not the one reported.
    expect(levelResults[323]).toBeUndefined();
  });

  it('reports nothing for a level outside the current lesson', async () => {
    const {dispatch} = storeOn(323);
    await dispatch(sendSuccessReportForLevel(999, 'maze'));
    expect(reportMilestone).not.toHaveBeenCalled();
  });
});

describe('sendProgressReport', () => {
  it('reports the given result for the current level', async () => {
    const {dispatch, levels} = storeOn(323);
    await dispatch(sendProgressReport('maze', TestResults.LEVEL_STARTED));
    expect(sent()).toMatchObject({
      levelId: 323,
      testResult: TestResults.LEVEL_STARTED,
    });
    expect(levels()[1].status).toBe('attempted');
  });
});

describe('sendStartedReportIfNotStarted', () => {
  beforeEach(() => {
    // lodash's debounce keeps a setTimeout between calls.
    vi.useFakeTimers();
  });

  afterEach(async () => {
    // Let the debounce window close so the next test starts fresh.
    await vi.advanceTimersByTimeAsync(1000);
  });

  it('reports an untried level as started, once per burst', async () => {
    const {dispatch} = storeOn(323);
    dispatch(sendStartedReportIfNotStarted('maze'));
    dispatch(sendStartedReportIfNotStarted('maze'));
    await vi.advanceTimersByTimeAsync(0);
    expect(reportMilestone).toHaveBeenCalledTimes(1);
    expect(sent().testResult).toBe(TestResults.LEVEL_STARTED);
  });

  it('does not report again once the level has been started', async () => {
    const {dispatch} = storeOn(323);
    dispatch(sendStartedReportIfNotStarted('maze'));
    await vi.advanceTimersByTimeAsync(500);
    dispatch(sendStartedReportIfNotStarted('maze'));
    await vi.advanceTimersByTimeAsync(0);
    expect(reportMilestone).toHaveBeenCalledTimes(1);
  });

  it('does not report a level that has progress', async () => {
    const {dispatch} = storeOn(323);
    dispatch(
      setScriptProgress({323: {status: 'perfect', result: 100 as never}}),
    );
    dispatch(sendStartedReportIfNotStarted('maze'));
    await vi.advanceTimersByTimeAsync(0);
    expect(reportMilestone).not.toHaveBeenCalled();
  });
});

describe('sendSubmitReport', () => {
  it('sends submitted as a boolean with the submit result', async () => {
    vi.spyOn(DashboardApiClient.progress, 'getUserProgress').mockResolvedValue(
      {},
    );
    const {dispatch} = storeOn(323);
    await dispatch(sendSubmitReport({appType: 'music', submitted: true}));
    expect(sent()).toMatchObject({
      submitted: true,
      testResult: TestResults.SUBMITTED_RESULT,
    });
  });
});

describe('navigateToLevelId', () => {
  it('pushes the level path, keeping the query string', async () => {
    window.history.replaceState({}, '', '/start?viewAs=Instructor');
    const pushState = vi.spyOn(window.history, 'pushState');
    const {store, dispatch} = storeOn(323);

    await dispatch(navigateToLevelId(BUBBLE_CHOICE_LEVEL_ID));

    expect(pushState).toHaveBeenCalledWith(
      {levelId: BUBBLE_CHOICE_LEVEL_ID},
      '',
      '/courses/course3/units/1/lessons/1/levels/3?viewAs=Instructor',
    );
    expect(store.getState().progress.currentLevelId).toBe(
      BUBBLE_CHOICE_LEVEL_ID,
    );
  });

  it('sets the title levels_helper.rb would have set', async () => {
    const {dispatch} = storeOn(323);
    await dispatch(navigateToLevelId(BUBBLE_CHOICE_LEVEL_ID));
    expect(document.title).toBe(
      'Computational Thinking #3 | Course 3 - CodeAI',
    );
  });

  it('restarts the milestone time', async () => {
    const {dispatch} = storeOn(323);
    vi.advanceTimersByTime(90_000);
    await dispatch(navigateToLevelId(BUBBLE_CHOICE_LEVEL_ID));
    expect(milestoneTimer.getTimeSinceLastMilestone()).toBe(0);
  });

  it('does nothing for the current level', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    const {dispatch} = storeOn(323);
    await dispatch(navigateToLevelId(323));
    expect(pushState).not.toHaveBeenCalled();
  });
});
