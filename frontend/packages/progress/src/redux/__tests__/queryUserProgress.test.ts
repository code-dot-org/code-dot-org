// Ported from the userProgressFromServer block of
// apps/test/unit/code-studio/progressReduxTest.js. The apps list of expected
// actions also held verifiedInstructor/SET_VERIFIED, whose slice is not
// under frontend/ yet.
// The request itself is DashboardApiClient's; its wire format is tested in
// core.

import {ApiError, DashboardApiClient} from '@code-dot-org/core/api';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {UserProgressResponse} from '../../types';
import progressSlice, {queryUserProgress} from '../progressSlice';

const fullResponse: UserProgressResponse = {
  signedIn: true,
  isVerifiedInstructor: true,
  teacherViewingStudent: true,
  deeperLearningCourse: false,
  focusAreaLessonIds: [1, 2],
  lockableAuthorized: true,
  completed: true,
  progress: {},
  peerReviewsPerformed: [],
  current_lesson: 1,
};

let getUserProgress: ReturnType<typeof vi.spyOn>;

function respond(body: UserProgressResponse) {
  getUserProgress.mockResolvedValue(body);
}

function run(
  userId: string,
  mergeProgress?: boolean,
  progress: object = {scriptName: 'my-script'},
) {
  const actions: string[] = [];
  const dispatch = vi.fn((action: {type: string}) => {
    actions.push(action.type);
    return action;
  });
  const getState = () => ({
    progress: {...progressSlice.getInitialState(), ...progress},
  });
  const thunk = queryUserProgress(userId, mergeProgress);
  // A recording dispatch and a partial root state; the thunk reads only
  // state.progress.
  const promise = thunk(dispatch as never, getState as never, undefined);
  return {actions, promise};
}

beforeEach(() => {
  getUserProgress = vi.spyOn(DashboardApiClient.progress, 'getUserProgress');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('queryUserProgress', () => {
  it('asks for the unit, and for the user when there is one', async () => {
    respond({});
    await run('42').promise;
    expect(getUserProgress).toHaveBeenCalledWith({
      scriptName: 'my-script',
      userId: '42',
    });
  });

  it('asks for the signed-in user when there is no user id', async () => {
    respond({});
    await run('').promise;
    expect(getUserProgress).toHaveBeenCalledWith({
      scriptName: 'my-script',
      userId: undefined,
    });
  });

  it('requests user progress and does not set new progress with no data', async () => {
    respond({});
    const {actions, promise} = run('1');
    await expect(promise).resolves.toEqual({});
    expect(actions).toEqual(['progress/clearResults']);
  });

  it('does not clear progress with no userId', async () => {
    respond({});
    const {actions, promise} = run('');
    await expect(promise).resolves.toEqual({});
    expect(actions).toEqual([]);
  });

  it('requests user progress and dispatches appropriate actions (default)', async () => {
    respond(fullResponse);
    const {actions, promise} = run('1', true);
    await expect(promise).resolves.toEqual(fullResponse);
    expect(actions).toEqual([
      'progress/clearResults',
      'progress/setIsSummaryView',
      'progress/updateFocusArea',
      'lessonLock/authorizeLockable',
      'progress/setScriptCompleted',
      'progress/setScriptProgress',
      'progress/mergeResults',
      'progress/mergePeerReviewProgress',
      'progress/setCurrentLessonId',
    ]);
  });

  it('requests user progress and dispatches appropriate actions (no merge)', async () => {
    respond(fullResponse);
    const {actions, promise} = run('1', false);
    await expect(promise).resolves.toEqual(fullResponse);
    expect(actions).toEqual([
      'progress/clearResults',
      'progress/setIsSummaryView',
      'progress/updateFocusArea',
      'lessonLock/authorizeLockable',
      'progress/setScriptCompleted',
      'progress/setScriptProgress',
      'progress/mergePeerReviewProgress',
      'progress/setCurrentLessonId',
    ]);
  });

  it('resolves when the unit is not completed', async () => {
    const body = {...fullResponse, completed: false};
    respond(body);
    await expect(run('1').promise).resolves.toEqual(body);
  });

  it('resolves for a signed-out user', async () => {
    respond({signedIn: false});
    const {actions, promise} = run('');
    await expect(promise).resolves.toEqual({signedIn: false});
    // As in apps, a signed-out user is told lockable lessons are unauthorized.
    expect(actions).toEqual(['lessonLock/authorizeLockable']);
  });

  it('rejects with the client error on a failed response', async () => {
    const error = new ApiError('Request failed', {
      status: 403,
      url: '/api/user_progress/my-script',
      method: 'GET',
    });
    getUserProgress.mockRejectedValue(error);
    await expect(run('1').promise).rejects.toBe(error);
  });

  it('rejects when the network fails', async () => {
    getUserProgress.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(run('1').promise).rejects.toThrow('Failed to fetch');
  });

  it('rejects without a request when scriptName is missing', async () => {
    await expect(
      run('1', true, {scriptName: undefined}).promise,
    ).rejects.toThrow(/scriptName must be present/);
    expect(getUserProgress).not.toHaveBeenCalled();
  });

  it('parses server progress into unitProgress, including a bare lock', async () => {
    const progress = {
      7: {status: 'perfect' as const, result: 100 as const},
      8: {locked: true},
      9: {status: 'attempted' as const, pages_completed: [30 as const, null]},
    };
    const state = progressSlice.reducer(
      undefined,
      progressSlice.actions.setScriptProgress(progress),
    );
    expect(state.unitProgress[7]).toMatchObject({
      status: 'perfect',
      result: 100,
    });
    expect(state.unitProgress[8]).toMatchObject({
      status: 'not_tried',
      locked: true,
    });
    expect(state.unitProgress[9].pages?.map(p => p.status)).toEqual([
      'perfect',
      'not_tried',
    ]);
    expect(state.unitProgressHasLoaded).toBe(true);
  });
});
