// Lock state of lockable lessons, per student, for the sections a teacher
// instructs, and the lock dialog. Ported from
// apps/src/code-studio/lessonLockRedux.js.
//
// Apps stored the open dialog's lock status and rewrote it when the teacher
// sections slice selected another section. Here it is derived, from the
// section id the caller passes, so this slice does not depend on sections.

import {createSlice} from '@reduxjs/toolkit';
import type {
  AnyAction,
  PayloadAction,
  Slice,
  SliceCaseReducers,
  ThunkAction,
} from '@reduxjs/toolkit';
import _ from 'lodash';

import type {
  LockStatusResponse,
  StudentLockState,
  UserLevelData,
} from '@code-dot-org/core/api';
import {DashboardApiClient} from '@code-dot-org/core/api';
import {logger} from '@code-dot-org/core/plugins/observability';

export const LockStatus = {
  Locked: 'Locked',
  Editable: 'Editable',
  ReadonlyAnswers: 'ReadonlyAnswers',
} as const;
export type LockStatusValue = (typeof LockStatus)[keyof typeof LockStatus];

/** One student's row in the lock dialog. */
export interface StudentLockStatus {
  userLevelData: UserLevelData;
  name: string;
  lockStatus: LockStatusValue;
}

/** By lesson id, each student's lock state. */
export type SectionLessons = {[lessonId: string]: StudentLockState[]};

export interface LessonLockState {
  lessonsBySectionId: {[sectionId: string]: SectionLessons};
  lessonsBySectionIdLoaded: boolean;
  lockDialogLessonId: number | string | null;
  saving: boolean;
  /** Whether this user may see lockable lessons. */
  lockableAuthorized: boolean | null;
  lockableAuthorizedLoaded: boolean;
}

const initialState: LessonLockState = {
  lessonsBySectionId: {},
  lessonsBySectionIdLoaded: false,
  lockDialogLessonId: null,
  saving: false,
  lockableAuthorized: null,
  lockableAuthorizedLoaded: false,
};

type Id = number | string;

const lessonsBySection = (sections: LockStatusResponse) =>
  _.mapValues(sections, section => section.lessons);

const _lessonLockSlice = createSlice({
  name: 'lessonLock',
  initialState,
  reducers: {
    authorizeLockable(state, action: PayloadAction<boolean | undefined>) {
      state.lockableAuthorized = action.payload ?? null;
      state.lockableAuthorizedLoaded = true;
    },
    setSectionLockStatus(state, action: PayloadAction<LockStatusResponse>) {
      state.lessonsBySectionId = lessonsBySection(action.payload);
      state.lessonsBySectionIdLoaded = true;
    },
    refreshSectionLockStatus(state, action: PayloadAction<LockStatusResponse>) {
      state.lessonsBySectionId = lessonsBySection(action.payload);
    },
    openLockDialog(state, action: PayloadAction<Id>) {
      state.lockDialogLessonId = action.payload;
    },
    closeLockDialog(state) {
      state.lockDialogLessonId = null;
    },
    beginSave(state) {
      state.saving = true;
    },
    finishSave: {
      reducer(
        state,
        action: PayloadAction<{
          sectionId: Id;
          lessonId: Id;
          lockStatus: StudentLockStatus[];
        }>,
      ) {
        const {sectionId, lessonId, lockStatus} = action.payload;
        const students =
          state.lessonsBySectionId[String(sectionId)][String(lessonId)];
        students.forEach((student, index) => {
          const update = lockStatus[index];
          // The dialog lists students in the same order as the section.
          // Apps compared user_level_id, which neither side carries.
          if (
            student.user_level_data.user_id !== update.userLevelData.user_id
          ) {
            throw new Error('Expect user ids be the same');
          }
          student.locked = update.lockStatus === LockStatus.Locked;
          student.readonly_answers =
            update.lockStatus === LockStatus.ReadonlyAnswers;
        });
        state.saving = false;
      },
      prepare(sectionId: Id, lessonId: Id, lockStatus: StudentLockStatus[]) {
        return {payload: {sectionId, lessonId, lockStatus}};
      },
    },
  },
});

// The literal name keys the state as lessonLock; see progressSlice.
const lessonLockSlice: Slice<
  LessonLockState,
  SliceCaseReducers<LessonLockState>,
  'lessonLock'
> = _lessonLockSlice;

export const {
  authorizeLockable,
  setSectionLockStatus,
  refreshSectionLockStatus,
  openLockDialog,
  closeLockDialog,
  beginSave,
  finishSave,
} = _lessonLockSlice.actions;

/** Each student's lock status in a lesson of a section; [] if unknown. */
export const lockStatusForLesson = (
  section: SectionLessons | undefined,
  lessonId: Id,
): StudentLockStatus[] =>
  (section?.[String(lessonId)] || []).map(student => ({
    userLevelData: student.user_level_data,
    name: student.name,
    lockStatus: student.locked
      ? LockStatus.Locked
      : student.readonly_answers
        ? LockStatus.ReadonlyAnswers
        : LockStatus.Editable,
  }));

/**
 * The open lock dialog's lock status in the given section; [] when no dialog
 * is open or no section is selected.
 */
export const getLockDialogStatus = (
  state: LessonLockState,
  sectionId: Id | null | undefined,
): StudentLockStatus[] =>
  state.lockDialogLessonId === null || !sectionId
    ? []
    : lockStatusForLesson(
        state.lessonsBySectionId[String(sectionId)],
        state.lockDialogLessonId,
      );

/**
 * By lesson id, whether the lesson is locked for every student in the
 * section.
 */
export const fullyLockedLessonMapping = (
  section: SectionLessons | undefined,
): {[lessonId: string]: boolean} =>
  _.mapValues(section || {}, students =>
    students.every(student => student.locked),
  );

type LessonLockThunk<R = void> = ThunkAction<
  R,
  {lessonLock: LessonLockState},
  undefined,
  AnyAction
>;

/**
 * Saves the students whose status changed, compared with the open dialog;
 * with no dialog open, every student in newLockStatus is saved, as in apps.
 */
function performSave(
  sectionId: Id,
  lessonId: Id,
  newLockStatus: StudentLockStatus[],
): LessonLockThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const oldLockStatus = getLockDialogStatus(getState().lessonLock, sectionId);
    const updates = newLockStatus
      .filter((item, index) => !_.isEqual(item, oldLockStatus[index]))
      .map(item => ({
        user_level_data: item.userLevelData,
        locked: item.lockStatus === LockStatus.Locked,
        readonly_answers: item.lockStatus === LockStatus.ReadonlyAnswers,
      }));
    if (updates.length === 0) {
      return;
    }

    dispatch(beginSave());
    try {
      await DashboardApiClient.progress.updateLockStatus({updates});
      dispatch(finishSave(sectionId, lessonId, newLockStatus));
    } catch (error) {
      // Apps left saving set on failure too; the dialog closes regardless.
      logger.warn('Failed to save lock status', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

/** Saves the lock dialog's changes, then closes it. */
export function saveLockDialog(
  sectionId: Id,
  newLockStatus: StudentLockStatus[],
): LessonLockThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const lessonId = getState().lessonLock.lockDialogLessonId;
    if (lessonId !== null) {
      await dispatch(performSave(sectionId, lessonId, newLockStatus));
    }
    dispatch(closeLockDialog());
  };
}

/** Locks the lesson for every student in the section, without the dialog. */
export function lockLesson(
  sectionId: Id,
  lessonId: Id,
): LessonLockThunk<Promise<void>> {
  return (dispatch, getState) => {
    const section = getState().lessonLock.lessonsBySectionId[String(sectionId)];
    const newLockStatus = lockStatusForLesson(section, lessonId).map(
      student => ({...student, lockStatus: LockStatus.Locked}),
    );
    return dispatch(performSave(sectionId, lessonId, newLockStatus));
  };
}

/**
 * Loads lock status for every section this user instructs. Resolves with the
 * response, whose section ids and names also seed a host's sections.
 */
export function loadSectionLockStatus(): LessonLockThunk<
  Promise<LockStatusResponse | undefined>
> {
  return async dispatch => {
    try {
      const sections = await DashboardApiClient.progress.getLockStatus();
      dispatch(setSectionLockStatus(sections));
      return sections;
    } catch (error) {
      logger.warn('Failed to load lock status', {
        error: error instanceof Error ? error.message : String(error),
      });
      return undefined;
    }
  };
}

/** Reloads lock status, keeping the open dialog. */
export function refetchSectionLockStatus(): LessonLockThunk<Promise<void>> {
  return async dispatch => {
    try {
      dispatch(
        refreshSectionLockStatus(
          await DashboardApiClient.progress.getLockStatus(),
        ),
      );
    } catch (error) {
      logger.warn('Failed to load lock status', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

export default lessonLockSlice;
