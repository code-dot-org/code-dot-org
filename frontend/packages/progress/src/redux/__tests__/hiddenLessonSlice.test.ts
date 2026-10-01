// Ported from apps/test/unit/code-studio/hiddenLessonReduxTest.js.

import {DashboardApiClient} from '@code-dot-org/core/api';
import {configureStore} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import hiddenLessonSlice, {
  STUDENT_SECTION_ID,
  getHiddenLessons,
  initializeHiddenScripts,
  isLessonHiddenForSection,
  isScriptHiddenForSection,
  toggleHiddenLesson,
  toggleHiddenScript,
  updateHiddenLesson,
  updateHiddenScript,
} from '../hiddenLessonSlice';

const reducer = hiddenLessonSlice.reducer;

function store() {
  const s = configureStore({reducer: {hiddenLesson: reducer}});
  const dispatch = (action: unknown) =>
    s.dispatch(action as never) as unknown as Promise<void>;
  return {state: () => s.getState().hiddenLesson, dispatch};
}

let toggleHidden: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  toggleHidden = vi
    .spyOn(DashboardApiClient.progress, 'toggleHidden')
    .mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const serves = (response: unknown) =>
  vi
    .spyOn(DashboardApiClient.progress, 'getHiddenLessons')
    .mockResolvedValue(response as never);

describe('getHiddenLessons', () => {
  it('files a student list under STUDENT_SECTION_ID', async () => {
    serves([123, 456]);
    const {state, dispatch} = store();
    await dispatch(getHiddenLessons('scriptName', true));
    expect(state()).toEqual({
      hiddenLessonsInitialized: true,
      hideableLessonsAllowed: true,
      lessonsBySection: {STUDENT: {123: true, 456: true}},
      scriptsBySection: {},
    });
  });

  it('keeps a teacher map of section to lessons', async () => {
    serves({10: [123, 456], 11: [123]});
    const {state, dispatch} = store();
    await dispatch(getHiddenLessons('scriptName', true));
    expect(state().lessonsBySection).toEqual({
      10: {123: true, 456: true},
      11: {123: true},
    });
  });

  it('is initialized even with no hidden lessons', async () => {
    serves({});
    const {state, dispatch} = store();
    await dispatch(getHiddenLessons('scriptName', false));
    expect(state()).toMatchObject({
      hiddenLessonsInitialized: true,
      hideableLessonsAllowed: false,
      lessonsBySection: {},
    });
  });
});

describe('toggling', () => {
  it('toggles a lesson locally, then posts it', async () => {
    const {state, dispatch} = store();
    await dispatch(toggleHiddenLesson('scriptName', 10, 123, true));
    expect(isLessonHiddenForSection(state(), 10, 123)).toBe(true);
    expect(toggleHidden).toHaveBeenLastCalledWith({
      scriptName: 'scriptName',
      sectionId: 10,
      lessonId: 123,
      hidden: true,
    });
    await dispatch(toggleHiddenLesson('scriptName', 10, 123, false));
    expect(isLessonHiddenForSection(state(), 10, 123)).toBe(false);
  });

  it('toggles a unit, posting without a lesson', async () => {
    const {state, dispatch} = store();
    await dispatch(toggleHiddenScript('scriptName', 10, 55, true));
    expect(isScriptHiddenForSection(state(), 10, 55)).toBe(true);
    expect(toggleHidden).toHaveBeenLastCalledWith({
      scriptName: 'scriptName',
      sectionId: 10,
      lessonId: undefined,
      hidden: true,
    });
  });

  it('keeps the local change when the post fails', async () => {
    toggleHidden.mockRejectedValue(new TypeError('Failed to fetch'));
    const {state, dispatch} = store();
    await dispatch(toggleHiddenLesson('scriptName', 10, 123, true));
    expect(isLessonHiddenForSection(state(), 10, 123)).toBe(true);
  });
});

describe('reducers', () => {
  it('updateHiddenLesson and updateHiddenScript set one entry', () => {
    let state = reducer(
      undefined,
      updateHiddenLesson({sectionId: 10, lessonId: 123, hidden: true}),
    );
    state = reducer(
      state,
      updateHiddenScript({sectionId: 10, scriptId: 55, hidden: true}),
    );
    expect(state.lessonsBySection).toEqual({10: {123: true}});
    expect(state.scriptsBySection).toEqual({10: {55: true}});
  });

  it('never mixes a student list with teacher sections', () => {
    const student = reducer(
      undefined,
      updateHiddenLesson({
        sectionId: STUDENT_SECTION_ID,
        lessonId: 1,
        hidden: true,
      }),
    );
    expect(() =>
      reducer(
        student,
        updateHiddenLesson({sectionId: 10, lessonId: 1, hidden: true}),
      ),
    ).toThrow(
      'Should never have STUDENT_SECTION_ID alongside other sectionIds',
    );
  });
});

describe('initializeHiddenScripts', () => {
  it('hides each unit for each teacher section', () => {
    const {state, dispatch} = store();
    dispatch(initializeHiddenScripts({10: [55, 56], 11: [55]}));
    expect(state().scriptsBySection).toEqual({
      10: {55: true, 56: true},
      11: {55: true},
    });
  });

  it('files a student list under STUDENT_SECTION_ID', () => {
    const {state, dispatch} = store();
    dispatch(initializeHiddenScripts([55]));
    expect(state().scriptsBySection).toEqual({STUDENT: {55: true}});
  });

  it('does nothing without data', () => {
    const {state, dispatch} = store();
    dispatch(initializeHiddenScripts(undefined));
    expect(state().scriptsBySection).toEqual({});
  });
});

describe('isLessonHiddenForSection and isScriptHiddenForSection', () => {
  const state = reducer(
    reducer(
      undefined,
      updateHiddenLesson({sectionId: 11, lessonId: 3, hidden: true}),
    ),
    updateHiddenScript({sectionId: 11, scriptId: 7, hidden: true}),
  );
  const studentState = reducer(
    undefined,
    updateHiddenLesson({
      sectionId: STUDENT_SECTION_ID,
      lessonId: 3,
      hidden: true,
    }),
  );

  it('returns false without an id', () => {
    expect(isLessonHiddenForSection(state, 11, null)).toBe(false);
    expect(isScriptHiddenForSection(state, 11, undefined)).toBe(false);
  });

  it('reads the given section', () => {
    expect(isLessonHiddenForSection(state, 11, 3)).toBe(true);
    expect(isLessonHiddenForSection(state, 11, 4)).toBe(false);
    expect(isLessonHiddenForSection(state, 12, 3)).toBe(false);
    expect(isScriptHiddenForSection(state, 11, 7)).toBe(true);
  });

  it('uses STUDENT_SECTION_ID when no section is given', () => {
    expect(isLessonHiddenForSection(studentState, null, 3)).toBe(true);
  });
});
