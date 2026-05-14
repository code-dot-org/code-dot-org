/**
 * @vitest-environment jsdom
 */

import {configureStore} from '@reduxjs/toolkit';
import {describe, expect, it, vi} from 'vitest';

import type {
  ApiClient,
  Lesson,
  QueryClient,
  UserProgressResponse,
} from '@code-dot-org/core/api';

// The currentUser slice pulls singletons from analytics + gates at module
// load. Stub them so the slice's reducer loads cleanly in tests.
vi.mock('@code-dot-org/core/plugins/analytics', () => ({
  setUser: vi.fn(),
}));
vi.mock('@code-dot-org/core/gates', () => ({
  experiments: {getEnabledExperiments: () => []},
}));

import currentUserSlice from '../../user/redux/currentUserSlice';
import {LevelStatuses, PUZZLE_PAGE_NONE, TestResults} from '../constants';
import progressSlice, {
  queryUserProgress,
  sendPredictLevelReport,
  sendSubmitReport,
  sendSuccessReport,
  type AppDispatch,
  type ProgressThunkExtra,
} from '../redux/progressSlice';
import type {ProgressState} from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Fake apiClient whose `progress.*` methods are vi.fn()s the tests inspect. */
function makeApi(overrides: Partial<UserProgressResponse> = {}) {
  const reportMilestone = vi.fn().mockResolvedValue(undefined);
  const getUserProgress = vi.fn().mockResolvedValue(overrides);
  return {
    api: {
      progress: {reportMilestone, getUserProgress},
    } as unknown as ApiClient,
    reportMilestone,
    getUserProgress,
  };
}

function makeQueryClient(): QueryClient {
  return {} as unknown as QueryClient;
}

/**
 * Build a store with the slices and the thunk `extra` argument wired up.
 * `progressOverrides` overlay onto the slice's initialState — enough to
 * drive the lessons-tree lookup in `getCurrentScriptLevelId`.
 */
function makeStore(opts: {
  api: ApiClient;
  query?: QueryClient;
  progress?: Partial<ProgressState>;
}) {
  const extra: ProgressThunkExtra = {
    apiClient: opts.api,
    queryClient: opts.query ?? makeQueryClient(),
  };

  const baseProgress: ProgressState = {
    isLessonExtras: false,
    unitProgress: {},
    unitProgressHasLoaded: false,
    levelResults: {},
    focusAreaLessonIds: [],
    peerReviewsPerformed: [],
    postMilestoneDisabled: false,
    isAge13Required: false,
    studentDefaultsSummaryView: true,
    isSummaryView: true,
    isMiniView: false,
    hasFullProgress: false,
    lessonExtrasEnabled: false,
    usingDbProgress: false,
    currentPageNumber: PUZZLE_PAGE_NONE,
    unitHasUnnumberedLessons: false,
    ...opts.progress,
  };

  const store = configureStore({
    reducer: {
      progress: progressSlice.reducer,
      currentUser: currentUserSlice.reducer,
    },
    preloadedState: {progress: baseProgress},
    middleware: getDefault =>
      getDefault({thunk: {extraArgument: extra}, serializableCheck: false}),
  });

  // configureStore's inferred dispatch type doesn't always pick up the
  // ThunkExtra when supplied inline via `middleware: getDefault(...)`.
  // Re-expose `dispatch` with the slice's own `AppDispatch` typing so
  // plain ThunkActions (queryUserProgress, sendSuccessReport) typecheck.
  const typedDispatch = store.dispatch as AppDispatch;
  return {
    ...store,
    dispatch: typedDispatch,
    getState: store.getState,
  };
}

/**
 * Build a one-lesson, one-level lessons tree that makes
 * `getCurrentScriptLevelId` resolve to `levelId`. Only the fields read
 * by `levelsForLessonId` / `processedLevel` are populated.
 */
function makeLessonsWith(
  levelId: number,
  extras: Partial<{
    sublevelId: number;
    sublevelParentLevelId: number;
  }> = {},
): Lesson[] {
  const sublevels = extras.sublevelId
    ? [
        {
          id: extras.sublevelId,
          parentLevelId: extras.sublevelParentLevelId ?? levelId,
          letter: 'a',
          path: `/s/${extras.sublevelId}`,
          kind: 'puzzle',
        },
      ]
    : undefined;
  return [
    {
      id: 1,
      levels: [
        {
          id: levelId,
          ids: [levelId],
          activeId: levelId,
          kind: 'puzzle',
          title: 1,
          path: `/p/${levelId}`,
          sublevels,
        },
      ],
    },
  ] as unknown as Lesson[];
}

// ─── sendSubmitReport ───────────────────────────────────────────────────────

describe('sendSubmitReport', () => {
  // The three no-op tests below provide a `scriptName` even though the
  // tested behavior doesn't depend on it. Reason: sendSubmitReport
  // unconditionally dispatches `queryUserProgress` after the milestone
  // helper returns (to force the bubble UI to refresh), and that thunk
  // throws when scriptName is missing. Production callers always have a
  // scriptName loaded by the time submit is reachable, so this matches
  // the realistic state.

  it('no-ops when currentLessonId is absent', async () => {
    const {api, reportMilestone} = makeApi();
    const store = makeStore({
      api,
      progress: {currentLevelId: 42, scriptName: 'csd-1'},
    });

    await store.dispatch(
      sendSubmitReport({appType: 'pythonlab', submitted: true}),
    );

    expect(reportMilestone).not.toHaveBeenCalled();
  });

  it('no-ops when currentLevelId is absent', async () => {
    const {api, reportMilestone} = makeApi();
    const store = makeStore({
      api,
      progress: {currentLessonId: 1, scriptName: 'csd-1'},
    });

    await store.dispatch(
      sendSubmitReport({appType: 'pythonlab', submitted: true}),
    );

    expect(reportMilestone).not.toHaveBeenCalled();
  });

  it('no-ops when the lessons tree cannot resolve a scriptLevelId', async () => {
    // currentLessonId + currentLevelId set, but no `lessons` array — so
    // getCurrentLevel returns undefined → getCurrentScriptLevelId returns
    // undefined → the helper bails out.
    const {api, reportMilestone} = makeApi();
    const store = makeStore({
      api,
      progress: {
        currentLessonId: 1,
        currentLevelId: 42,
        scriptName: 'csd-1',
      },
    });

    await store.dispatch(
      sendSubmitReport({appType: 'pythonlab', submitted: true}),
    );

    expect(reportMilestone).not.toHaveBeenCalled();
  });

  it('reports SUBMITTED_RESULT when submitted=true with submitted:"true" in extraData', async () => {
    const {api, reportMilestone, getUserProgress} = makeApi();
    // queryUserProgress fires after the report; give it a state with
    // scriptName so it can run without throwing.
    const store = makeStore({
      api,
      progress: {
        currentLessonId: 1,
        currentLevelId: 42,
        lessons: makeLessonsWith(42),
        scriptName: 'csd-1',
      },
    });

    await store.dispatch(
      sendSubmitReport({appType: 'pythonlab', submitted: true}),
    );

    expect(reportMilestone).toHaveBeenCalledWith({
      userId: 0,
      scriptLevelId: 42,
      levelId: 42,
      app: 'pythonlab',
      testResult: TestResults.SUBMITTED_RESULT,
      extraData: {submitted: 'true'},
    });
    // sendSubmitReport always re-queries to force the bubble to update.
    expect(getUserProgress).toHaveBeenCalledWith(
      expect.objectContaining({scriptName: 'csd-1'}),
    );
  });

  it('reports UNSUBMITTED_ATTEMPT when submitted=false', async () => {
    const {api, reportMilestone} = makeApi();
    const store = makeStore({
      api,
      progress: {
        currentLessonId: 1,
        currentLevelId: 42,
        lessons: makeLessonsWith(42),
        scriptName: 'csd-1',
      },
    });

    await store.dispatch(
      sendSubmitReport({appType: 'pythonlab', submitted: false}),
    );

    expect(reportMilestone).toHaveBeenCalledWith(
      expect.objectContaining({
        testResult: TestResults.UNSUBMITTED_ATTEMPT,
        extraData: {submitted: 'false'},
      }),
    );
  });

  it('merges the result into redux levelResults after a successful report', async () => {
    const {api} = makeApi();
    const store = makeStore({
      api,
      progress: {
        currentLessonId: 1,
        currentLevelId: 42,
        lessons: makeLessonsWith(42),
        scriptName: 'csd-1',
      },
    });

    await store.dispatch(
      sendSubmitReport({appType: 'pythonlab', submitted: true}),
    );

    expect(store.getState().progress.levelResults).toEqual({
      42: TestResults.SUBMITTED_RESULT,
    });
  });
});

// ─── sendSuccessReport ──────────────────────────────────────────────────────

describe('sendSuccessReport', () => {
  it('posts ALL_PASS for the current level without extraData', async () => {
    const {api, reportMilestone} = makeApi();
    const store = makeStore({
      api,
      progress: {
        currentLessonId: 1,
        currentLevelId: 42,
        lessons: makeLessonsWith(42),
      },
    });

    await store.dispatch(sendSuccessReport('pythonlab'));

    expect(reportMilestone).toHaveBeenCalledWith({
      userId: 0,
      scriptLevelId: 42,
      levelId: 42,
      app: 'pythonlab',
      testResult: TestResults.ALL_PASS,
      extraData: undefined,
    });
    expect(store.getState().progress.levelResults).toEqual({
      42: TestResults.ALL_PASS,
    });
  });
});

// ─── sendPredictLevelReport ─────────────────────────────────────────────────

describe('sendPredictLevelReport', () => {
  it('forwards the predict response as program in extraData', async () => {
    const {api, reportMilestone} = makeApi();
    const store = makeStore({
      api,
      progress: {
        currentLessonId: 1,
        currentLevelId: 42,
        lessons: makeLessonsWith(42),
      },
    });

    await store.dispatch(
      sendPredictLevelReport({
        appType: 'pythonlab',
        predictResponse: 'return 1',
      }),
    );

    expect(reportMilestone).toHaveBeenCalledWith({
      userId: 0,
      scriptLevelId: 42,
      levelId: 42,
      app: 'pythonlab',
      testResult: TestResults.CONTAINED_LEVEL_RESULT,
      extraData: {program: 'return 1'},
    });
  });
});

// ─── queryUserProgress ──────────────────────────────────────────────────────

describe('queryUserProgress', () => {
  it('throws when scriptName is missing', async () => {
    const {api} = makeApi();
    const store = makeStore({api, progress: {}});

    await expect(store.dispatch(queryUserProgress('42'))).rejects.toThrow(
      /scriptName must be present/,
    );
  });

  it('clears redux level results before fetching when userId is provided', async () => {
    const {api} = makeApi({});
    const store = makeStore({
      api,
      progress: {
        scriptName: 'csd-1',
        levelResults: {42: TestResults.ALL_PASS},
      },
    });

    await store.dispatch(queryUserProgress('42'));

    expect(store.getState().progress.levelResults).toEqual({});
  });

  it('calls api.progress.getUserProgress with scriptName + userId', async () => {
    const {api, getUserProgress} = makeApi({});
    const store = makeStore({
      api,
      progress: {scriptName: 'csd-1'},
    });

    await store.dispatch(queryUserProgress('42'));

    expect(getUserProgress).toHaveBeenCalledWith({
      scriptName: 'csd-1',
      userId: '42',
    });
  });

  it('forwards an empty-string userId as undefined', async () => {
    const {api, getUserProgress} = makeApi({});
    const store = makeStore({
      api,
      progress: {scriptName: 'csd-1'},
    });

    await store.dispatch(queryUserProgress(''));

    expect(getUserProgress).toHaveBeenCalledWith({
      scriptName: 'csd-1',
      userId: undefined,
    });
  });

  it('dispatches setIsSummaryView=true when a teacher is viewing a student on the overview page', async () => {
    const {api} = makeApi({
      teacherViewingStudent: true,
      isInstructor: true,
    });
    const store = makeStore({
      api,
      progress: {
        scriptName: 'csd-1',
        // currentLevelId undefined → "we're on the overview page"
        isSummaryView: false,
      },
    });

    await store.dispatch(queryUserProgress('42'));

    expect(store.getState().progress.isSummaryView).toBe(true);
  });

  it('skips the summary-view dispatch when on a level page (currentLevelId is set)', async () => {
    const {api} = makeApi({
      isInstructor: true,
      teacherViewingStudent: true,
    });
    const store = makeStore({
      api,
      progress: {
        scriptName: 'csd-1',
        currentLevelId: 42, // on a level page
        isSummaryView: false,
      },
    });

    await store.dispatch(queryUserProgress('42'));

    expect(store.getState().progress.isSummaryView).toBe(false);
  });

  it('updates the focus-area lesson list when the server provides one', async () => {
    const {api} = makeApi({
      focusAreaLessonIds: [3, 4, 5],
      changeFocusAreaPath: '/path',
    });
    const store = makeStore({api, progress: {scriptName: 'csd-1'}});

    await store.dispatch(queryUserProgress('42'));

    expect(store.getState().progress.focusAreaLessonIds).toEqual([3, 4, 5]);
    expect(store.getState().progress.changeFocusAreaPath).toBe('/path');
  });

  it('marks the unit completed and short-circuits when completed=true', async () => {
    // When `completed: true`, the implementation dispatches
    // setScriptCompleted and returns — so even if `progress` is present,
    // it doesn't get loaded into unitProgress.
    const {api} = makeApi({
      completed: true,
      progress: {100: {status: 'perfect', result: 100}},
    });
    const store = makeStore({api, progress: {scriptName: 'csd-1'}});

    await store.dispatch(queryUserProgress('42'));

    expect(store.getState().progress.unitCompleted).toBe(true);
    expect(store.getState().progress.unitProgress).toEqual({});
  });

  it('writes the progress map through levelProgressFromServer normalization', async () => {
    // The mock stands in for the api call's *return value*, which has
    // already been through `camelcaseKeys` via the response schema. So
    // the fixture mirrors the post-transform camelCase shape rather
    // than the raw snake_case wire shape.
    const {api} = makeApi({
      progress: {
        100: {status: 'perfect', result: 100, timeSpent: 30},
      },
    });
    const store = makeStore({api, progress: {scriptName: 'csd-1'}});

    await store.dispatch(queryUserProgress('42'));

    const stored = store.getState().progress.unitProgress[100];
    expect(stored.status).toBe(LevelStatuses.Perfect);
    expect(stored.result).toBe(TestResults.ALL_PASS);
    expect(stored.timeSpent).toBe(30);
  });

  it('also mirrors the progress map into levelResults when mergeProgress=true', async () => {
    const {api} = makeApi({
      progress: {
        100: {status: 'perfect', result: 100},
      },
    });
    const store = makeStore({api, progress: {scriptName: 'csd-1'}});

    await store.dispatch(queryUserProgress('42'));

    expect(store.getState().progress.levelResults[100]).toBe(
      TestResults.ALL_PASS,
    );
  });

  it('skips the levelResults mirror when mergeProgress=false', async () => {
    const {api} = makeApi({
      progress: {
        100: {status: 'perfect', result: 100},
      },
    });
    const store = makeStore({api, progress: {scriptName: 'csd-1'}});

    await store.dispatch(queryUserProgress('42', false));

    expect(store.getState().progress.levelResults).toEqual({});
    // unitProgress still gets the full set.
    expect(store.getState().progress.unitProgress[100]).toBeDefined();
  });

  it('sets currentLessonId from the camelCased currentLesson field', async () => {
    // This is one of the pins from the snake→camel migration — the
    // legacy code read `current_lesson`, the new path reads
    // `currentLesson` post-transform.
    const {api} = makeApi({
      progress: {100: {status: 'perfect', result: 100}},
      currentLesson: 7,
    });
    const store = makeStore({api, progress: {scriptName: 'csd-1'}});

    await store.dispatch(queryUserProgress('42'));

    expect(store.getState().progress.currentLessonId).toBe(7);
  });
});
