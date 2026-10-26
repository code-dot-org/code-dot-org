// Ported from apps/test/unit/code-studio/lessonLockReduxTest.js. Apps'
// selectSection cases become getLockDialogStatus with a section id.

import {DashboardApiClient} from '@code-dot-org/core/api';
import {configureStore} from '@reduxjs/toolkit';
import type {Middleware} from '@reduxjs/toolkit';
import _ from 'lodash';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import lessonLockSlice, {
  LockStatus,
  beginSave,
  closeLockDialog,
  finishSave,
  fullyLockedLessonMapping,
  getLockDialogStatus,
  loadSectionLockStatus,
  lockLesson,
  openLockDialog,
  refetchSectionLockStatus,
  saveLockDialog,
  setSectionLockStatus,
} from '../lessonLockSlice';
import fakeSectionData, {
  lesson1Id,
  section1Id,
  section2Id,
} from './fakeSectionData';

const reducer = lessonLockSlice.reducer;
const loaded = () =>
  reducer(undefined, setSectionLockStatus(fakeSectionData()));
const students = () => fakeSectionData()[section1Id].lessons[lesson1Id];

function store() {
  const actions: string[] = [];
  // Thunks dispatch through the middleware chain, so record there.
  const recorder: Middleware = () => next => action => {
    const type = (action as {type?: string}).type;
    if (type) {
      actions.push(type);
    }
    return next(action);
  };
  const s = configureStore({
    reducer: {lessonLock: reducer},
    middleware: getDefault => getDefault().concat(recorder),
  });
  const dispatch = (action: unknown) => s.dispatch(action as never);
  return {store: s, dispatch, actions};
}

let updateLockStatus: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  updateLockStatus = vi
    .spyOn(DashboardApiClient.progress, 'updateLockStatus')
    .mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('setSectionLockStatus', () => {
  it('sets section data we receive from the server', () => {
    const state = loaded();
    expect(state.lessonsBySectionId).toEqual({
      [section1Id]: fakeSectionData()[section1Id].lessons,
      [section2Id]: fakeSectionData()[section2Id].lessons,
    });
    expect(state.lessonsBySectionIdLoaded).toBe(true);
  });
});

describe('getLockDialogStatus', () => {
  it('follows the section it is given', () => {
    const state = reducer(loaded(), openLockDialog(lesson1Id));
    expect(getLockDialogStatus(state, section1Id)).toHaveLength(3);
    expect(getLockDialogStatus(state, section2Id)).toEqual([
      {
        name: 'student4',
        lockStatus: LockStatus.Locked,
        userLevelData:
          fakeSectionData()[section2Id].lessons[lesson1Id][0].user_level_data,
      },
    ]);
  });

  it('is empty without a section, or with no dialog open', () => {
    const open = reducer(loaded(), openLockDialog(lesson1Id));
    expect(getLockDialogStatus(open, undefined)).toEqual([]);
    expect(getLockDialogStatus(loaded(), section1Id)).toEqual([]);
  });
});

describe('openLockDialog', () => {
  it('shows each student with their lock status', () => {
    const state = reducer(loaded(), openLockDialog(lesson1Id));
    expect(state.lockDialogLessonId).toBe(lesson1Id);
    const [student1, student2, student3] = students();
    expect(getLockDialogStatus(state, section1Id)).toEqual([
      {
        userLevelData: student1.user_level_data,
        name: 'student1',
        lockStatus: LockStatus.Locked,
      },
      {
        userLevelData: student2.user_level_data,
        name: 'student2',
        lockStatus: LockStatus.Editable,
      },
      {
        userLevelData: student3.user_level_data,
        name: 'student3',
        lockStatus: LockStatus.ReadonlyAnswers,
      },
    ]);
  });
});

describe('closeLockDialog and beginSave', () => {
  it('closes the dialog, and marks a save in progress', () => {
    const open = reducer(loaded(), openLockDialog(lesson1Id));
    expect(reducer(open, closeLockDialog()).lockDialogLessonId).toBeNull();
    expect(reducer(open, beginSave()).saving).toBe(true);
  });
});

describe('finishSave', () => {
  it('updates the section data the dialog status derives from', () => {
    let state = reducer(loaded(), openLockDialog(lesson1Id));
    state = reducer(state, beginSave());
    const next = _.cloneDeep(getLockDialogStatus(state, section1Id));
    // Swap students two and three.
    next[1].lockStatus = LockStatus.ReadonlyAnswers;
    next[2].lockStatus = LockStatus.Editable;
    state = reducer(state, finishSave(section1Id, lesson1Id, next));

    expect(state.saving).toBe(false);
    expect(
      getLockDialogStatus(state, section1Id).map(s => s.lockStatus),
    ).toEqual([
      LockStatus.Locked,
      LockStatus.ReadonlyAnswers,
      LockStatus.Editable,
    ]);
    const saved = state.lessonsBySectionId[section1Id][lesson1Id];
    expect(saved.map(s => [s.locked, s.readonly_answers])).toEqual([
      [true, false],
      [false, true],
      [false, false],
    ]);
  });

  it('rejects a status list out of step with the section', () => {
    const state = reducer(loaded(), openLockDialog(lesson1Id));
    const reordered = getLockDialogStatus(state, section1Id).reverse();
    expect(() =>
      reducer(state, finishSave(section1Id, lesson1Id, reordered)),
    ).toThrow('Expect user ids be the same');
  });
});

describe('saveLockDialog', () => {
  it('saves only the changed students, then closes the dialog', async () => {
    const {store: s, dispatch, actions} = store();
    dispatch(setSectionLockStatus(fakeSectionData()));
    dispatch(openLockDialog(lesson1Id));
    const next = _.cloneDeep(
      getLockDialogStatus(s.getState().lessonLock, section1Id),
    );
    next[1].lockStatus = LockStatus.ReadonlyAnswers;
    next[2].lockStatus = LockStatus.Editable;
    actions.length = 0;

    await dispatch(saveLockDialog(section1Id, next));

    const [, student2, student3] = students();
    expect(updateLockStatus).toHaveBeenCalledWith({
      updates: [
        {
          user_level_data: student2.user_level_data,
          locked: false,
          readonly_answers: true,
        },
        {
          user_level_data: student3.user_level_data,
          locked: false,
          readonly_answers: false,
        },
      ],
    });
    expect(actions).toEqual([
      'lessonLock/beginSave',
      'lessonLock/finishSave',
      'lessonLock/closeLockDialog',
    ]);
  });

  it('closes without saving when nothing changed', async () => {
    const {store: s, dispatch} = store();
    dispatch(setSectionLockStatus(fakeSectionData()));
    dispatch(openLockDialog(lesson1Id));
    await dispatch(
      saveLockDialog(
        section1Id,
        getLockDialogStatus(s.getState().lessonLock, section1Id),
      ),
    );
    expect(updateLockStatus).not.toHaveBeenCalled();
    expect(s.getState().lessonLock.lockDialogLessonId).toBeNull();
  });
});

describe('lockLesson', () => {
  it('locks every student without the dialog, as apps did', async () => {
    const {dispatch, actions} = store();
    dispatch(setSectionLockStatus(fakeSectionData()));
    actions.length = 0;

    await dispatch(lockLesson(section1Id, lesson1Id));

    expect(updateLockStatus).toHaveBeenCalledWith({
      updates: students().map(student => ({
        user_level_data: student.user_level_data,
        locked: true,
        readonly_answers: false,
      })),
    });
    expect(actions).toEqual(['lessonLock/beginSave', 'lessonLock/finishSave']);
  });
});

describe('fullyLockedLessonMapping', () => {
  const section = {
    1360: [{locked: true}, {locked: true}],
    1361: [{locked: true}, {locked: false}],
  } as unknown as Parameters<typeof fullyLockedLessonMapping>[0];

  it('maps each lesson to whether every student is locked', () => {
    expect(fullyLockedLessonMapping(section)).toEqual({
      1360: true,
      1361: false,
    });
  });

  it('returns an empty object with no section', () => {
    expect(fullyLockedLessonMapping(undefined)).toEqual({});
  });
});

describe('loading lock status', () => {
  it('loads every section and resolves with the response', async () => {
    const response = fakeSectionData();
    vi.spyOn(DashboardApiClient.progress, 'getLockStatus').mockResolvedValue(
      response,
    );
    const {store: s, dispatch} = store();
    await expect(dispatch(loadSectionLockStatus())).resolves.toEqual(response);
    expect(s.getState().lessonLock.lessonsBySectionIdLoaded).toBe(true);
  });

  it('refetches, keeping the open dialog', async () => {
    const refreshed = fakeSectionData();
    refreshed[section1Id].lessons[lesson1Id][1].locked = true;
    vi.spyOn(DashboardApiClient.progress, 'getLockStatus').mockResolvedValue(
      refreshed,
    );
    const {store: s, dispatch} = store();
    dispatch(setSectionLockStatus(fakeSectionData()));
    dispatch(openLockDialog(lesson1Id));

    await dispatch(refetchSectionLockStatus());

    const state = s.getState().lessonLock;
    expect(state.lessonsBySectionId[section1Id][lesson1Id][1].locked).toBe(
      true,
    );
    expect(getLockDialogStatus(state, section1Id)[1].lockStatus).toBe(
      LockStatus.Locked,
    );
  });
});
