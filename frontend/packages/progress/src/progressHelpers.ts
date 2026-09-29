// Pure helpers over levels, lessons and level progress, for progress bubbles
// and progress tables. Ported from apps/src/templates/progress/
// progressHelpers.js. lessonIsVisible, lessonIsLockedForUser and
// lessonIsLockedForAllStudents are not here: they read the hidden-lesson,
// lesson-lock and teacher-section slices, which frontend/ does not have yet.

import _ from 'lodash';

import {LevelStatuses} from './constants';
import type {LevelStatus, UnitProgress, UnitProgressDefinition} from './types';
import {processServerStudentProgress} from './redux/progressSlice';

interface LevelLike {
  id?: number;
  kind?: string;
  icon?: string | null;
  bonus?: boolean;
  isLocked?: boolean;
  isUnplugged?: boolean;
  canHaveFeedback?: boolean;
}

interface LevelProgressLike {
  status?: LevelStatus | string;
  timeSpent?: number;
  lastTimestamp?: number;
  teacherFeedbackCommented?: boolean;
  teacherFeedbackNew?: boolean;
}

/** A student's progress through one lesson, as a progress table shows it. */
export interface LessonProgressSummary {
  incompletePercent: number;
  completedPercent: number;
  timeSpent: number;
  lastTimestamp: number;
}

export const defaultBubbleIcon = 'desktop';

/**
 * A lockable lesson holds exactly one level group, as its last level, and
 * every page of it shares one lock state; so the last level decides.
 */
export function lessonLocked(levels: LevelLike[]): boolean {
  return !!levels[levels.length - 1].isLocked;
}

/** The Font Awesome icon name for a level's bubble. */
export function getIconForLevel(
  level: LevelLike,
  inProgressView: boolean = false,
): string {
  if (inProgressView && isLevelAssessment(level)) {
    return 'star';
  }
  if (level.isUnplugged) {
    return 'scissors';
  }
  if (level.isLocked) {
    return 'lock';
  }
  if (level.icon) {
    // The server sends a CSS class, fa-<name>.
    const match = /fa-(.*)/.exec(level.icon);
    if (!match || !match[1]) {
      throw new Error('Unknown iconType: ' + level.icon);
    }
    return match[1];
  }
  if (level.bonus) {
    return 'flag-checkered';
  }
  return defaultBubbleIcon;
}

export function isLevelAssessment(level: LevelLike): boolean {
  return level.kind === 'assessment';
}

// Statuses that count as completed work, as opposed to merely attempted.
const completedStatuses: string[] = [
  LevelStatuses.Perfect,
  LevelStatuses.Passed,
  LevelStatuses.Submitted,
  LevelStatuses.FreePlayComplete,
  LevelStatuses.CompletedAssessment,
];

/** Whether a level status represents completed work. */
export function isLevelStatusCompleted(status: string | undefined): boolean {
  return !!status && completedStatuses.includes(status);
}

export function lessonIsAllAssessment(levels: LevelLike[]): boolean {
  return levels.every(level => level.kind === 'assessment');
}

export function lessonHasLevels(lesson: {levels?: unknown[]}): boolean {
  return !!lesson.levels?.length;
}

/** Whether a teacher has left a comment the student has not seen. */
export const commentLeft = (progress: LevelProgressLike | undefined) =>
  progress?.teacherFeedbackCommented && progress?.teacherFeedbackNew;

/** Whether an attempted assessment still waits on teacher feedback. */
export const studentNeedsFeedback = (
  progress: LevelProgressLike | undefined,
  level: LevelLike,
) =>
  !!progress &&
  progress.status !== LevelStatuses.NotTried &&
  !progress.teacherFeedbackNew &&
  level.kind === 'assessment' &&
  !!level.canHaveFeedback;

/** "Keep working" and "Needs review" states are shown only in CSD and CSP. */
export function shouldShowReviewStates(unit: {
  isCsd?: boolean;
  isCsp?: boolean;
}): boolean {
  return !!(unit.isCsd || unit.isCsp);
}

function lessonProgressForStudent(
  studentLevelProgress: {[levelId: number]: LevelProgressLike},
  lessonLevels: LevelLike[],
): LessonProgressSummary | null {
  // Bonus levels do not count toward progress.
  const levels = lessonLevels.filter(level => !level.bonus);
  if (!levels.length) {
    return null;
  }

  let attempted = 0;
  let completed = 0;
  let timeSpent = 0;
  let lastTimestamp = 0;
  levels.forEach(level => {
    const levelProgress = studentLevelProgress[level.id ?? 0];
    if (levelProgress) {
      attempted += levelProgress.status === LevelStatuses.Attempted ? 1 : 0;
      completed += isLevelStatusCompleted(levelProgress.status) ? 1 : 0;
      timeSpent += levelProgress.timeSpent || 0;
      lastTimestamp = Math.max(lastTimestamp, levelProgress.lastTimestamp || 0);
    }
  });

  if (attempted + completed === 0) {
    return null;
  }

  const percent = (count: number) => (100 * count) / levels.length;
  return {
    incompletePercent: percent(levels.length - completed),
    completedPercent: percent(completed),
    timeSpent,
    lastTimestamp,
  };
}

/**
 * Summarizes each student's progress through each lesson: by student id,
 * then lesson id; null for a lesson the student has not started.
 */
export function lessonProgressForSection(
  sectionLevelProgress: {
    [studentId: number]: {[levelId: number]: LevelProgressLike};
  },
  lessons: {id: number; levels: LevelLike[]}[] | undefined,
): {[studentId: number]: {[lessonId: number]: LessonProgressSummary | null}} {
  return _.mapValues(sectionLevelProgress, studentLevelProgress => {
    const studentLessonProgress: {
      [lessonId: number]: LessonProgressSummary | null;
    } = {};
    lessons?.forEach(lesson => {
      studentLessonProgress[lesson.id] = lessonProgressForStudent(
        studentLevelProgress,
        lesson.levels,
      );
    });
    return studentLessonProgress;
  });
}

/**
 * Parses section progress from the server, keyed by student id and then
 * level id, into UnitProgress.
 */
export const processServerSectionProgress = (serverSectionProgress: {
  [studentId: number]: {[levelId: number]: UnitProgressDefinition};
}): {[studentId: number]: {[levelId: number]: UnitProgress}} =>
  _.mapValues(serverSectionProgress, student =>
    processServerStudentProgress(student),
  );
