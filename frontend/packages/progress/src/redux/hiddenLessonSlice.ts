// Which lessons, and which units, each section hides. Ported from
// apps/src/code-studio/hiddenLessonRedux.js; Immutable maps became plain
// objects.

import {createSlice} from '@reduxjs/toolkit';
import type {
  AnyAction,
  PayloadAction,
  Slice,
  SliceCaseReducers,
  ThunkAction,
} from '@reduxjs/toolkit';

import type {HiddenLessonsResponse} from '@code-dot-org/core/api';
import {DashboardApiClient} from '@code-dot-org/core/api';
import {logger} from '@code-dot-org/core/plugins/observability';

/**
 * The section a participant's hidden lessons are filed under: the server
 * folds all of a student's sections into one list.
 */
export const STUDENT_SECTION_ID = 'STUDENT';

/** By section id, the ids hidden in it. */
type HiddenBySection = {[sectionId: string]: {[itemId: string]: boolean}};

export interface HiddenLessonState {
  hiddenLessonsInitialized: boolean;
  /** Whether this user may hide and show lessons. */
  hideableLessonsAllowed: boolean;
  lessonsBySection: HiddenBySection;
  scriptsBySection: HiddenBySection;
}

const initialState: HiddenLessonState = {
  hiddenLessonsInitialized: false,
  hideableLessonsAllowed: false,
  lessonsBySection: {},
  scriptsBySection: {},
};

type Id = number | string;

function setHidden(
  bySection: HiddenBySection,
  sectionId: Id,
  itemId: Id,
  hidden: boolean,
) {
  const section = (bySection[String(sectionId)] ||= {});
  section[String(itemId)] = hidden;
}

// A participant's list stands for all their sections, so it can never sit
// beside a teacher's sections.
function validateSectionIds(state: HiddenLessonState) {
  if (
    state.lessonsBySection[STUDENT_SECTION_ID] &&
    Object.keys(state.lessonsBySection).length > 1
  ) {
    throw new Error(
      'Should never have STUDENT_SECTION_ID alongside other sectionIds',
    );
  }
}

const _hiddenLessonSlice = createSlice({
  name: 'hiddenLesson',
  initialState,
  reducers: {
    setHiddenLessons(
      state,
      action: PayloadAction<{
        hiddenLessonsPerSection: {[sectionId: string]: Id[]};
        hideableLessonsAllowed: boolean;
      }>,
    ) {
      const {hiddenLessonsPerSection, hideableLessonsAllowed} = action.payload;
      Object.entries(hiddenLessonsPerSection).forEach(([sectionId, ids]) =>
        ids.forEach(lessonId =>
          setHidden(state.lessonsBySection, sectionId, lessonId, true),
        ),
      );
      validateSectionIds(state);
      state.hiddenLessonsInitialized = true;
      state.hideableLessonsAllowed = hideableLessonsAllowed;
    },
    updateHiddenLesson(
      state,
      action: PayloadAction<{sectionId: Id; lessonId: Id; hidden: boolean}>,
    ) {
      const {sectionId, lessonId, hidden} = action.payload;
      setHidden(state.lessonsBySection, sectionId, lessonId, hidden);
      validateSectionIds(state);
    },
    updateHiddenScript(
      state,
      action: PayloadAction<{sectionId: Id; scriptId: Id; hidden: boolean}>,
    ) {
      const {sectionId, scriptId, hidden} = action.payload;
      setHidden(state.scriptsBySection, sectionId, scriptId, hidden);
      validateSectionIds(state);
    },
  },
});

// The literal name keys the state as hiddenLesson; see progressSlice.
const hiddenLessonSlice: Slice<
  HiddenLessonState,
  SliceCaseReducers<HiddenLessonState>,
  'hiddenLesson'
> = _hiddenLessonSlice;

export const {setHiddenLessons, updateHiddenLesson, updateHiddenScript} =
  _hiddenLessonSlice.actions;

type HiddenLessonThunk<R = void> = ThunkAction<
  R,
  {hiddenLesson: HiddenLessonState},
  undefined,
  AnyAction
>;

function postToggleHidden(
  scriptName: string,
  sectionId: Id,
  hidden: boolean,
  lessonId?: Id,
) {
  return DashboardApiClient.progress
    .toggleHidden({scriptName, sectionId, lessonId, hidden})
    .catch((error: unknown) =>
      // The local change stands, as in apps; the next load corrects it.
      logger.warn('Failed to toggle hidden', {
        scriptName,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
}

/** Hides or shows a lesson for a section, locally at once, then on the server. */
export function toggleHiddenLesson(
  scriptName: string,
  sectionId: Id,
  lessonId: Id,
  hidden: boolean,
): HiddenLessonThunk<Promise<void>> {
  return dispatch => {
    dispatch(updateHiddenLesson({sectionId, lessonId, hidden}));
    return postToggleHidden(scriptName, sectionId, hidden, lessonId);
  };
}

/** Hides or shows a whole unit for a section. */
export function toggleHiddenScript(
  scriptName: string,
  sectionId: Id,
  scriptId: Id,
  hidden: boolean,
): HiddenLessonThunk<Promise<void>> {
  return dispatch => {
    dispatch(updateHiddenScript({sectionId, scriptId, hidden}));
    return postToggleHidden(scriptName, sectionId, hidden);
  };
}

/**
 * Loads the unit's hidden lessons. canHideLessons says whether this user may
 * change them.
 */
export function getHiddenLessons(
  scriptName: string,
  canHideLessons: boolean,
): HiddenLessonThunk<Promise<void>> {
  return dispatch =>
    DashboardApiClient.progress
      .getHiddenLessons({scriptName})
      .then(response =>
        dispatch(initializeHiddenLessons(response, canHideLessons)),
      )
      .catch((error: unknown) =>
        logger.warn('Failed to load hidden lessons', {
          scriptName,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
}

/**
 * Stores hidden lessons from the server: an instructor's map of section to
 * lesson ids, or a participant's list, filed under STUDENT_SECTION_ID.
 */
export function initializeHiddenLessons(
  data: HiddenLessonsResponse,
  canHideLessons: boolean,
): HiddenLessonThunk {
  return dispatch => {
    const hiddenLessonsPerSection = Array.isArray(data)
      ? {[STUDENT_SECTION_ID]: data}
      : data;
    dispatch(
      setHiddenLessons({
        hiddenLessonsPerSection,
        hideableLessonsAllowed: !!canHideLessons,
      }),
    );
  };
}

/**
 * Stores the units hidden for this user, from page data: an instructor's map
 * of section to unit ids, or a participant's list.
 */
export function initializeHiddenScripts(
  data: Id[] | {[sectionId: string]: Id[]} | null | undefined,
): HiddenLessonThunk {
  return dispatch => {
    if (!data) {
      return;
    }
    const bySection = Array.isArray(data) ? {[STUDENT_SECTION_ID]: data} : data;
    Object.entries(bySection).forEach(([sectionId, scriptIds]) =>
      scriptIds.forEach(scriptId =>
        dispatch(updateHiddenScript({sectionId, scriptId, hidden: true})),
      ),
    );
  };
}

function isHiddenForSection(
  bySection: HiddenBySection,
  sectionId: Id | null | undefined,
  itemId: Id | null | undefined,
): boolean {
  if (!itemId) {
    return false;
  }
  // Without a section, this is a participant.
  const section = sectionId ? String(sectionId) : STUDENT_SECTION_ID;
  return !!bySection[section]?.[String(itemId)];
}

/** Whether the lesson is hidden in the section; no section means a participant. */
export const isLessonHiddenForSection = (
  state: HiddenLessonState,
  sectionId: Id | null | undefined,
  lessonId: Id | null | undefined,
) => isHiddenForSection(state.lessonsBySection, sectionId, lessonId);

/** Whether the unit is hidden in the section; no section means a participant. */
export const isScriptHiddenForSection = (
  state: HiddenLessonState,
  sectionId: Id | null | undefined,
  scriptId: Id | null | undefined,
) => isHiddenForSection(state.scriptsBySection, sectionId, scriptId);

export default hiddenLessonSlice;
