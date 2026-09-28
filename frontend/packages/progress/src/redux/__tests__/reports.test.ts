// Milestone reporting and in-page navigation, run against a real store.

import {configureStore} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {TestResults} from '../../constants';
import progressSlice, {
  getCurrentLevels,
  initProgress,
  navigateToLevelId,
  sendSuccessReport,
  setCurrentLessonId,
  setScriptProgress,
} from '../progressSlice';
import {BUBBLE_CHOICE_LEVEL_ID, initPayload, lessonData} from './fixtures';

function storeOn(currentLevelId: number) {
  const store = configureStore({reducer: {progress: progressSlice.reducer}});
  store.dispatch(initProgress(initPayload({currentLevelId})));
  store.dispatch(setCurrentLessonId(lessonData[0].id));
  // The thunks are typed against the full app state; this store holds only
  // the part they read.
  const dispatch = (action: unknown) => store.dispatch(action as never);
  const levels = () => getCurrentLevels(store.getState() as never);
  return {store, dispatch, levels};
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(new Response('{}', {status: 200}));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('sendSuccessReport', () => {
  it('posts to the milestone route for the current script level', async () => {
    const {dispatch} = storeOn(323);
    await dispatch(sendSuccessReport('maze'));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/milestone/0/102/323');
    expect(JSON.parse(init.body)).toMatchObject({
      app: 'maze',
      result: true,
      testResult: TestResults.ALL_PASS,
    });
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
    expect(fetchMock.mock.calls[0][0]).toBe('/milestone/0/103/10301');
    const {unitProgress, levelResults} = store.getState().progress;
    expect(unitProgress[10301].status).toBe('perfect');
    expect(unitProgress[BUBBLE_CHOICE_LEVEL_ID].status).toBe('perfect');
    expect(levelResults[BUBBLE_CHOICE_LEVEL_ID]).toBe(TestResults.ALL_PASS);
    expect(levels()[2].status).toBe('perfect');
  });

  it('leaves progress alone when the post fails', async () => {
    fetchMock.mockResolvedValue(new Response('', {status: 503}));
    const {store, dispatch} = storeOn(323);
    await dispatch(sendSuccessReport('maze'));
    expect(store.getState().progress.unitProgress[323]).toBeUndefined();
    expect(store.getState().progress.levelResults[323]).toBeUndefined();
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

  it('does nothing for the current level', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    const {dispatch} = storeOn(323);
    await dispatch(navigateToLevelId(323));
    expect(pushState).not.toHaveBeenCalled();
  });
});
