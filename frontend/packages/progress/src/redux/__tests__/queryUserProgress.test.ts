// Ported from the userProgressFromServer block of
// apps/test/unit/code-studio/progressReduxTest.js. The apps list of expected
// actions also held verifiedInstructor/SET_VERIFIED and
// lessonLock/AUTHORIZE_LOCKABLE; neither slice exists under frontend/ yet.

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

let fetchMock: ReturnType<typeof vi.fn>;

function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: {'Content-Type': 'application/json'},
    }),
  );
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
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('queryUserProgress', () => {
  it('sends a GET with user_id in the query string and no body', async () => {
    respond({});
    await run('42').promise;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/user_progress/my-script?user_id=42');
    expect(init?.method ?? 'GET').toBe('GET');
    expect(init?.body).toBeUndefined();
    // The real fetch rejects a GET that carries a body.
    expect(() => new Request(`http://localhost${url}`, init)).not.toThrow();
  });

  it('omits user_id when there is none', async () => {
    respond({});
    await run('').promise;
    expect(fetchMock.mock.calls[0][0]).toBe('/api/user_progress/my-script');
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
    expect(actions).toEqual([]);
  });

  it('rejects with an error on a failed response', async () => {
    respond({}, 403);
    await expect(run('1').promise).rejects.toThrow(/HTTP 403/);
  });

  it('rejects when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(run('1').promise).rejects.toThrow('Failed to fetch');
  });

  it('rejects without a request when scriptName is missing', async () => {
    await expect(
      run('1', true, {scriptName: undefined}).promise,
    ).rejects.toThrow(/scriptName must be present/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('parses server progress into unitProgress', async () => {
    const progress = {7: {status: 'perfect' as const, result: 100 as const}};
    respond({...fullResponse, progress});
    const {promise} = run('1');
    await promise;
    const state = progressSlice.reducer(
      undefined,
      progressSlice.actions.setScriptProgress(progress),
    );
    expect(state.unitProgress[7]).toMatchObject({
      status: 'perfect',
      result: 100,
    });
    expect(state.unitProgressHasLoaded).toBe(true);
  });
});
