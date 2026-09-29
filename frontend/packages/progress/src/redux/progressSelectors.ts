// Selectors over the progress slice for the unit overview, the progress
// table, the header's lesson progress and the teacher panel. Ported from
// apps/src/code-studio/progressReduxSelectors.js; the level-page ones live
// with the slice.

import _ from 'lodash';

import type {Lesson} from '@code-dot-org/core/api';

import {
  LevelStatuses,
  MINIMUM_OPTIMAL_RESULT,
  ProgressLevelTypes,
} from '../constants';
import type {NumberedLevel, PeerReviewLevelInfo, ProgressState} from '../types';
import type {LevelProgressState, ProgressRootState} from './progressSlice';
import {
  getCurrentLevels,
  getProgressLevelType,
  levelsForLesson,
} from './progressSlice';

/** Stands in for peer review lessons and levels, which have no real id. */
export const PEER_REVIEW_ID = -1;

/** The lesson fields the overview shows. */
export interface LessonSummary {
  id: number;
  name?: string;
  title?: string;
  lockable: boolean;
  lessonNumber?: number;
  lessonStartUrl?: string;
  hasLessonPlan?: boolean;
  lessonTutorPath?: string | null;
  assessment?: boolean;
  lessonPlanHtmlUrl?: string;
  lessonFeedbackUrl?: string;
  studentLessonPlanHtmlUrl?: string;
  descriptionStudent?: string;
  descriptionTeacher?: string;
  isFocusArea: boolean;
}

export interface LessonGroupView {
  id: number | null;
  userFacing?: boolean;
  displayName: string;
  description: string | null;
  bigQuestions: string | null;
}

export interface GroupedLessons {
  lessonGroup: LessonGroupView;
  lessons: LessonSummary[];
  levelsByLesson: NumberedLevel[][];
}

export interface Progression {
  start: number;
  name?: string;
  displayName?: string;
  levels: NumberedLevel[];
}

type LessonProgressState = Pick<
  ProgressState,
  'lessons' | 'focusAreaLessonIds'
> &
  LevelProgressState;

const lessonFromLesson = (
  lesson: Partial<Lesson> & {lessonNumber?: number},
): Omit<LessonSummary, 'isFocusArea'> =>
  _.pick(lesson, [
    'name',
    'id',
    'lockable',
    'lessonNumber',
    'lessonStartUrl',
    'hasLessonPlan',
    'lessonTutorPath',
    'assessment',
    'lessonPlanHtmlUrl',
    'lessonFeedbackUrl',
    'studentLessonPlanHtmlUrl',
    'title',
    'descriptionStudent',
    'descriptionTeacher',
  ]) as Omit<LessonSummary, 'isFocusArea'>;

const lessonAtIndex = (
  state: Pick<ProgressState, 'lessons' | 'focusAreaLessonIds'>,
  index: number,
): LessonSummary => {
  const lesson = (state.lessons || [])[index];
  return {
    ...lessonFromLesson(lesson),
    isFocusArea: state.focusAreaLessonIds.includes(lesson.id),
  };
};

/** Whether any lesson is lockable. */
export const hasLockableLessons = (state: Pick<ProgressState, 'lessons'>) =>
  (state.lessons || []).some(lesson => lesson.lockable);

/** The lesson the current level belongs to. */
export const getCurrentLesson = (state: ProgressRootState) =>
  state.progress.lessons?.find(
    lesson => lesson.id === state.progress.currentLessonId,
  );

/** Every lesson, reduced to the fields the overview shows. */
export const lessons = (
  state: Pick<ProgressState, 'lessons' | 'focusAreaLessonIds'>,
): LessonSummary[] =>
  (state.lessons || []).map((_lesson, index) => lessonAtIndex(state, index));

/** The peer review lesson, shaped like the other lessons. */
export const peerReviewLesson = (
  state: Pick<ProgressState, 'peerReviewLessonInfo'>,
): LessonSummary => ({
  ...lessonFromLesson(
    (state.peerReviewLessonInfo || {}) as unknown as Partial<Lesson>,
  ),
  id: PEER_REVIEW_ID,
  lockable: false,
  isFocusArea: false,
});

/**
 * The peer review levels, shaped like the other levels. They have no entry
 * in levelResults, so every one takes PEER_REVIEW_ID.
 */
export const peerReviewLevels = (
  state: Pick<ProgressState, 'peerReviewLessonInfo'>,
): NumberedLevel[] =>
  (state.peerReviewLessonInfo?.levels || []).map(
    (level: PeerReviewLevelInfo, index: number) =>
      ({
        ...level,
        id: PEER_REVIEW_ID,
        isLocked: level.locked,
        status: level.status || LevelStatuses.NotTried,
        levelNumber: index + 1,
      }) as unknown as NumberedLevel,
  );

/** Every lesson's levels, with status. */
export const levelsByLesson = (
  state: Pick<ProgressState, 'lessons'> & LevelProgressState,
): NumberedLevel[][] =>
  (state.lessons || []).map(lesson => levelsForLesson(state, lesson));

/**
 * The lessons grouped by lesson group, with their levels; bonus levels only
 * if asked. Peer reviews form a group of their own.
 */
export const groupedLessons = (
  state: LessonProgressState &
    Pick<ProgressState, 'lessonGroups' | 'peerReviewLessonInfo'>,
  includeBonusLevels: boolean = false,
): GroupedLessons[] => {
  const byGroup: {[displayName: string]: GroupedLessons} = {};
  const allLevels = levelsByLesson(state);

  (state.lessonGroups || []).forEach(lessonGroup => {
    byGroup[lessonGroup.displayName] = {
      lessonGroup: {
        id: lessonGroup.id,
        userFacing: lessonGroup.userFacing,
        displayName: lessonGroup.displayName,
        description: lessonGroup.description,
        bigQuestions: lessonGroup.bigQuestions,
      },
      lessons: [],
      levelsByLesson: [],
    };
  });

  (state.lessons || []).forEach((lesson, index) => {
    const group = byGroup[lesson.lessonGroupDisplayName || ''];
    if (!group) {
      return;
    }
    const levels = includeBonusLevels
      ? allLevels[index]
      : allLevels[index].filter(level => !(level as {bonus?: boolean}).bonus);
    group.lessons.push(lessonAtIndex(state, index));
    group.levelsByLesson.push(levels);
  });

  if (state.peerReviewLessonInfo) {
    const displayName = state.peerReviewLessonInfo.lesson_group_display_name;
    byGroup[displayName] = {
      lessonGroup: {
        // Peer reviews have no description or big questions to track.
        id: null,
        displayName,
        description: null,
        bigQuestions: null,
      },
      lessons: [peerReviewLesson(state)],
      levelsByLesson: [peerReviewLevels(state)],
    };
  }

  return Object.values(byGroup);
};

/** Whether the lessons fall into more than one group. */
export const hasGroups = (
  state: Parameters<typeof groupedLessons>[0],
): boolean => groupedLessons(state).length > 1;

/**
 * Splits levels into runs of adjacent levels that share a progression name:
 * the level's `progression` if the server gave one, else its name.
 */
export const progressionsFromLevels = (
  levels: NumberedLevel[],
): Progression[] => {
  const progressions: Progression[] = [];
  if (levels.length === 0) {
    return progressions;
  }
  const nameOf = (level: NumberedLevel) =>
    (level as {progression?: string}).progression || level.name || undefined;
  const displayNameOf = (level: NumberedLevel) =>
    (level as {progressionDisplayName?: string}).progressionDisplayName ||
    level.name ||
    undefined;

  let current: Progression = {
    start: 0,
    name: nameOf(levels[0]),
    displayName: displayNameOf(levels[0]),
    levels: [levels[0]],
  };
  levels.slice(1).forEach((level, index) => {
    if (nameOf(level) === current.name) {
      current.levels.push(level);
    } else {
      progressions.push(current);
      current = {
        // + 1 because the first level was sliced off.
        start: index + 1,
        name: nameOf(level),
        displayName: displayNameOf(level),
        levels: [level],
      };
    }
  });
  progressions.push(current);
  return progressions;
};

/** The number of levels in the current progression: 1 for a standalone level. */
export const levelCount = (state: ProgressRootState): number => {
  const levelType = getProgressLevelType(state);
  if (levelType === ProgressLevelTypes.Level) {
    return 1;
  }
  if (levelType === ProgressLevelTypes.ScriptLevel) {
    return getCurrentLevels(state).length;
  }
  return 0;
};

/** The number of lessons in the unit: 1 for a standalone level. */
export const getLessonCount = (state: ProgressRootState): number =>
  state.progress.lessons?.[0]?.numScriptLessons || 1;

const lessonById = (state: Pick<ProgressState, 'lessons'>, lessonId: number) =>
  state.lessons?.find(lesson => lesson.id === lessonId);

/** The lesson's extras URL, or '' when lesson extras are off. */
export const lessonExtrasUrl = (
  state: Pick<ProgressState, 'lessons' | 'lessonExtrasEnabled'>,
  lessonId: number,
): string =>
  state.lessonExtrasEnabled
    ? lessonById(state, lessonId)?.lessonExtrasLevelUrl || ''
    : '';

export const lessonTutorPath = (
  state: Pick<ProgressState, 'lessons'>,
  lessonId: number,
): string => lessonById(state, lessonId)?.lessonTutorPath || '';

export const hasLessonPlan = (
  state: Pick<ProgressState, 'lessons'>,
  lessonId: number,
): boolean => !!lessonById(state, lessonId)?.hasLessonPlan;

/** Whether the level was solved optimally. */
export const isPerfect = (
  state: Partial<Pick<ProgressState, 'levelResults'>>,
  levelId: number,
): boolean =>
  !!state.levelResults &&
  (state.levelResults[levelId] ?? 0) >= MINIMUM_OPTIMAL_RESULT;
