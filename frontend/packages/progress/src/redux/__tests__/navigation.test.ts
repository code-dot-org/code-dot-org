// navigateToLevelId and the back/forward handler, with the host's hooks.

import {configureStore} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {Lesson} from '@code-dot-org/core/api';

import {
  configureLevelNavigation,
  resetLevelNavigation,
} from '../../levelNavigation';
import {installLevelNavigationHandler} from '../levelNavigationHandler';
import progressSlice, {
  initProgress,
  navigateToLevelId,
  setCurrentLessonId,
} from '../progressSlice';
import {
  BUBBLE_CHOICE_LEVEL_ID,
  initPayload,
  lessonData,
  lessonOneLevels,
  level,
} from './fixtures';

// Lesson 1 plus a legacy level at the end, which cannot share the page.
const LEGACY_LEVEL_ID = 324;
const lessons = lessonData.map((lesson, i) =>
  i === 0
    ? ({
        ...lesson,
        levels: [
          ...lessonOneLevels,
          level({
            id: 104,
            activeId: LEGACY_LEVEL_ID,
            position: 4,
            kind: 'puzzle',
            title: 3,
            lesson: 1,
            usesLab2: false,
          }),
        ],
      } as Lesson)
    : lesson,
);

function storeOn(currentLevelId: number) {
  const store = configureStore({reducer: {progress: progressSlice.reducer}});
  store.dispatch(initProgress(initPayload({currentLevelId, lessons})));
  store.dispatch(setCurrentLessonId(lessonData[0].id));
  const dispatch = (action: unknown) =>
    store.dispatch(action as never) as unknown as Promise<void>;
  const current = () => store.getState().progress.currentLevelId;
  return {store, dispatch, current};
}

let pushState: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  window.history.replaceState({}, '', '/start?section_id=5&version=abc');
  pushState = vi.spyOn(window.history, 'pushState');
});

afterEach(() => {
  resetLevelNavigation();
  vi.restoreAllMocks();
});

describe('navigateToLevelId', () => {
  it('changes level in page and tells the host', async () => {
    const onLevelChange = vi.fn();
    configureLevelNavigation({onLevelChange});
    const {dispatch, current} = storeOn(323);
    await dispatch(navigateToLevelId(BUBBLE_CHOICE_LEVEL_ID));
    expect(onLevelChange).toHaveBeenCalledWith(323, BUBBLE_CHOICE_LEVEL_ID);
    expect(current()).toBe(BUBBLE_CHOICE_LEVEL_ID);
    expect(pushState).toHaveBeenCalled();
  });

  it('does nothing when the host declines', async () => {
    const confirmNavigation = vi.fn().mockResolvedValue(false);
    configureLevelNavigation({confirmNavigation});
    const {dispatch, current} = storeOn(323);
    await dispatch(navigateToLevelId(BUBBLE_CHOICE_LEVEL_ID));
    expect(confirmNavigation).toHaveBeenCalled();
    expect(current()).toBe(323);
    expect(pushState).not.toHaveBeenCalled();
  });

  it('continues when the host confirms', async () => {
    configureLevelNavigation({confirmNavigation: async () => true});
    const {dispatch, current} = storeOn(323);
    await dispatch(navigateToLevelId(BUBBLE_CHOICE_LEVEL_ID));
    expect(current()).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });

  it('does not ask for the current level', async () => {
    const confirmNavigation = vi.fn().mockResolvedValue(true);
    configureLevelNavigation({confirmNavigation});
    const {dispatch} = storeOn(323);
    await dispatch(navigateToLevelId(323));
    expect(confirmNavigation).not.toHaveBeenCalled();
  });

  it('leaves the page for a level that cannot share it', async () => {
    const calls: string[] = [];
    const beforeLeavingPage = vi.fn(async () => {
      calls.push('beforeLeavingPage');
    });
    const leavePage = vi.fn(() => calls.push('leavePage'));
    const onLevelChange = vi.fn();
    configureLevelNavigation({beforeLeavingPage, leavePage, onLevelChange});
    const {dispatch, current} = storeOn(BUBBLE_CHOICE_LEVEL_ID);

    await dispatch(navigateToLevelId(LEGACY_LEVEL_ID));

    expect(beforeLeavingPage).toHaveBeenCalledWith(
      expect.objectContaining({id: BUBBLE_CHOICE_LEVEL_ID}),
    );
    expect(leavePage).toHaveBeenCalledWith(
      '/courses/course3/units/1/lessons/1/levels/4?section_id=5',
    );
    expect(calls).toEqual(['beforeLeavingPage', 'leavePage']);
    expect(onLevelChange).not.toHaveBeenCalled();
    expect(pushState).not.toHaveBeenCalled();
    expect(current()).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });

  it("follows the host's own in-page rule", async () => {
    const leavePage = vi.fn();
    configureLevelNavigation({canNavigateInPage: () => false, leavePage});
    const {dispatch} = storeOn(323);
    await dispatch(navigateToLevelId(BUBBLE_CHOICE_LEVEL_ID));
    expect(leavePage).toHaveBeenCalled();
    expect(pushState).not.toHaveBeenCalled();
  });
});

describe('installLevelNavigationHandler', () => {
  const pop = async (state: unknown) => {
    window.dispatchEvent(new PopStateEvent('popstate', {state}));
    // The handler awaits the confirmation hook.
    await new Promise(resolve => setTimeout(resolve, 0));
  };

  it('records the initial level on the current history entry', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const {store} = storeOn(323);
    const uninstall = installLevelNavigationHandler(store, 323);
    expect(replaceState).toHaveBeenCalledWith({levelId: 323}, '');
    uninstall();
  });

  it('switches to the level the browser returned to', async () => {
    const onLevelChange = vi.fn();
    configureLevelNavigation({onLevelChange});
    const {store, current} = storeOn(BUBBLE_CHOICE_LEVEL_ID);
    const uninstall = installLevelNavigationHandler(store, 323);

    await pop({levelId: 323});
    expect(current()).toBe(323);
    expect(onLevelChange).toHaveBeenCalledWith(BUBBLE_CHOICE_LEVEL_ID, 323);
    uninstall();
  });

  it('ignores entries without a level', async () => {
    const {store, current} = storeOn(BUBBLE_CHOICE_LEVEL_ID);
    const uninstall = installLevelNavigationHandler(store, 323);
    await pop(null);
    expect(current()).toBe(BUBBLE_CHOICE_LEVEL_ID);
    uninstall();
  });

  it('puts the current URL back when the host declines', async () => {
    configureLevelNavigation({confirmNavigation: async () => false});
    const {store, current} = storeOn(BUBBLE_CHOICE_LEVEL_ID);
    const uninstall = installLevelNavigationHandler(store, 323);

    await pop({levelId: 323});
    expect(current()).toBe(BUBBLE_CHOICE_LEVEL_ID);
    expect(pushState).toHaveBeenCalledWith(
      {levelId: BUBBLE_CHOICE_LEVEL_ID},
      '',
      '/courses/course3/units/1/lessons/1/levels/3?section_id=5&version=abc',
    );
    uninstall();
  });

  it('stops following the browser once uninstalled', async () => {
    const {store, current} = storeOn(BUBBLE_CHOICE_LEVEL_ID);
    installLevelNavigationHandler(store, 323)();
    await pop({levelId: 323});
    expect(current()).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });
});
