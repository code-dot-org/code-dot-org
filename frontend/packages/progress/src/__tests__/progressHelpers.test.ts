// Ported from the lessonLocked, isLevelAssessment, getIconForLevel,
// lessonIsAllAssessment and lessonProgressForSection blocks of
// apps/test/unit/templates/progress/progressHelpersTest.js, plus the helpers
// apps left untested. The lessonIsVisible and lessonIsLocked* blocks test
// helpers not ported.

import {describe, expect, it} from 'vitest';

import {LevelStatuses} from '../constants';
import {
  commentLeft,
  getIconForLevel,
  isLevelAssessment,
  isLevelStatusCompleted,
  lessonHasLevels,
  lessonIsAllAssessment,
  lessonLocked,
  lessonProgressForSection,
  processServerSectionProgress,
  shouldShowReviewStates,
  studentNeedsFeedback,
} from '../progressHelpers';
import {levelProgressFromServer} from '../redux/progressSlice';
import type {LevelStatus, UnitProgress} from '../types';

// apps' progressTestHelpers fakeLevels and fakeProgressForLevels.
interface FakeLevel {
  id: number;
  kind?: string;
  bonus?: boolean;
  isLocked?: boolean;
  status: LevelStatus;
}
const fakeLevels = (count: number): FakeLevel[] =>
  Array.from({length: count}, (_, i) => ({
    id: i + 1,
    status: LevelStatuses.NotTried,
    isLocked: false,
  }));
const fakeProgressForLevels = (
  levels: FakeLevel[],
  status: LevelStatus = LevelStatuses.NotTried,
) =>
  Object.fromEntries(
    levels.map(level => [level.id, levelProgressFromServer({status})]),
  ) as {[levelId: number]: UnitProgress & {isLocked?: boolean}};

describe('lessonLocked', () => {
  it('returns true when we only have a level group and it is locked', () => {
    const levels = fakeLevels(3).map((level, index) => ({
      ...level,
      isLocked: index === 2,
    }));
    expect(lessonLocked(levels)).toBe(true);
  });

  describe('level group preceded by another level', () => {
    const baseLevels = fakeLevels(4).map((level, index) => ({
      ...level,
      kind: index === 0 ? 'puzzle' : 'assessment',
    }));

    it('returns true when level group is locked', () => {
      const levels = baseLevels.map((level, index) => ({
        ...level,
        isLocked: index === 3,
      }));
      expect(lessonLocked(levels)).toBe(true);
    });

    it('returns false when level group is not locked', () => {
      expect(lessonLocked(baseLevels)).toBe(false);
    });
  });
});

describe('isLevelAssessment', () => {
  it('is true only for assessment levels', () => {
    expect(isLevelAssessment({kind: 'assessment'})).toBe(true);
    expect(isLevelAssessment({kind: 'puzzle'})).toBe(false);
  });
});

describe('getIconForLevel', () => {
  it('strips fa- from level.icon if one is provided', () => {
    expect(getIconForLevel({icon: 'fa-file-text'})).toBe('file-text');
  });

  it('uses desktop icon if no icon on level', () => {
    expect(getIconForLevel({})).toBe('desktop');
  });

  it('uses scissors icon if unplugged level', () => {
    expect(getIconForLevel({isUnplugged: true})).toBe('scissors');
  });

  it('uses lock icon if locked level', () => {
    expect(getIconForLevel({isLocked: true})).toBe('lock');
  });

  it('uses flag-checkered icon if bonus level', () => {
    expect(getIconForLevel({bonus: true})).toBe('flag-checkered');
  });

  it('uses star for an assessment in the progress view', () => {
    expect(getIconForLevel({kind: 'assessment'}, true)).toBe('star');
    expect(getIconForLevel({kind: 'assessment'})).toBe('desktop');
  });

  it('throws if icon is invalid', () => {
    expect(() => getIconForLevel({icon: 'asdf'})).toThrow();
  });
});

describe('lessonIsAllAssessment', () => {
  it('returns true if all the levels are of kind assessment', () => {
    const levels = fakeLevels(3).map(l => ({...l, kind: 'assessment'}));
    expect(lessonIsAllAssessment(levels)).toBe(true);
  });

  it('returns false if not all the levels are of kind assessment', () => {
    const levels = fakeLevels(3).map((l, i) => ({
      ...l,
      kind: ['unplugged', 'puzzle', 'assessment'][i],
    }));
    expect(lessonIsAllAssessment(levels)).toBe(false);
  });
});

describe('lessonProgressForSection', () => {
  const STUDENT_ID = 11;
  const LESSON_ID = 111;

  const lessonProgress = (
    studentLevelProgress: ReturnType<typeof fakeProgressForLevels>,
    levels: FakeLevel[],
  ) =>
    lessonProgressForSection({[STUDENT_ID]: studentLevelProgress}, [
      {id: LESSON_ID, levels},
    ])[STUDENT_ID][LESSON_ID];

  it('returns null if all levels are untried', () => {
    const levels = fakeLevels(3);
    expect(lessonProgress(fakeProgressForLevels(levels), levels)).toBeNull();
  });

  it('returns null if all levels are bonus', () => {
    const levels = fakeLevels(2).map(l => ({...l, bonus: true}));
    expect(lessonProgress(fakeProgressForLevels(levels), levels)).toBeNull();
  });

  it('returns null if some levels are bonus and the rest are untried', () => {
    const levels = fakeLevels(2);
    const progress = fakeProgressForLevels(levels);
    progress[1].status = LevelStatuses.Perfect;
    levels[0].bonus = true;
    expect(lessonProgress(progress, levels)).toBeNull();
  });

  it('summarizes all completed levels', () => {
    const levels = fakeLevels(3);
    const progress = fakeProgressForLevels(levels);
    progress[1].status = LevelStatuses.Perfect;
    progress[2].status = LevelStatuses.Submitted;
    progress[3].status = LevelStatuses.FreePlayComplete;
    expect(lessonProgress(progress, levels)).toEqual({
      incompletePercent: 0,
      completedPercent: 100,
      timeSpent: 0,
      lastTimestamp: 0,
    });
  });

  it('summarizes all attempted levels', () => {
    const levels = fakeLevels(2);
    expect(
      lessonProgress(
        fakeProgressForLevels(levels, LevelStatuses.Attempted),
        levels,
      ),
    ).toEqual({
      incompletePercent: 100,
      completedPercent: 0,
      timeSpent: 0,
      lastTimestamp: 0,
    });
  });

  it('summarizes a mix of levels', () => {
    const levels = fakeLevels(8);
    const progress = fakeProgressForLevels(levels);
    progress[1].status = LevelStatuses.Submitted;
    progress[2].status = LevelStatuses.Perfect;
    progress[3].status = LevelStatuses.Attempted;
    // "Too many blocks" counts as completed.
    progress[4].status = LevelStatuses.Passed;
    progress[5].status = LevelStatuses.FreePlayComplete;
    progress[6].isLocked = true;
    progress[7].status = 'other' as LevelStatus;
    expect(lessonProgress(progress, levels)).toEqual({
      incompletePercent: 50,
      completedPercent: 50,
      timeSpent: 0,
      lastTimestamp: 0,
    });
  });

  it('counts "too many blocks" (passed) as completed, not imperfect', () => {
    const levels = fakeLevels(3);
    const progress = fakeProgressForLevels(levels, LevelStatuses.Passed);
    expect(lessonProgress(progress, levels)?.completedPercent).toBe(100);
  });

  it('computes correct timeSpent', () => {
    const levels = fakeLevels(2);
    const progress = fakeProgressForLevels(levels, LevelStatuses.Attempted);
    progress[1].timeSpent = 1;
    progress[2].timeSpent = 2;
    expect(lessonProgress(progress, levels)?.timeSpent).toBe(3);
  });

  it('computes correct lastTimestamp', () => {
    const levels = fakeLevels(2);
    const progress = fakeProgressForLevels(levels, LevelStatuses.Attempted);
    progress[1].lastTimestamp = 2;
    progress[2].lastTimestamp = 1;
    expect(lessonProgress(progress, levels)?.lastTimestamp).toBe(2);
  });
});

describe('isLevelStatusCompleted', () => {
  it('counts finished work, not attempts', () => {
    expect(isLevelStatusCompleted(LevelStatuses.Perfect)).toBe(true);
    expect(isLevelStatusCompleted(LevelStatuses.CompletedAssessment)).toBe(
      true,
    );
    expect(isLevelStatusCompleted(LevelStatuses.Attempted)).toBe(false);
    expect(isLevelStatusCompleted(undefined)).toBe(false);
  });
});

describe('lessonHasLevels', () => {
  it('is true only for a lesson with levels', () => {
    expect(lessonHasLevels({levels: [{}]})).toBe(true);
    expect(lessonHasLevels({levels: []})).toBe(false);
    expect(lessonHasLevels({})).toBe(false);
  });
});

describe('teacher feedback', () => {
  it('commentLeft wants a new comment', () => {
    expect(
      commentLeft({teacherFeedbackCommented: true, teacherFeedbackNew: true}),
    ).toBe(true);
    expect(
      commentLeft({teacherFeedbackCommented: true, teacherFeedbackNew: false}),
    ).toBe(false);
  });

  it('studentNeedsFeedback wants an attempted assessment with no new feedback', () => {
    const level = {kind: 'assessment', canHaveFeedback: true};
    expect(studentNeedsFeedback({status: LevelStatuses.Attempted}, level)).toBe(
      true,
    );
    expect(studentNeedsFeedback({status: LevelStatuses.NotTried}, level)).toBe(
      false,
    );
    expect(
      studentNeedsFeedback(
        {status: LevelStatuses.Attempted, teacherFeedbackNew: true},
        level,
      ),
    ).toBe(false);
    expect(
      studentNeedsFeedback({status: LevelStatuses.Attempted}, {kind: 'puzzle'}),
    ).toBe(false);
  });
});

describe('shouldShowReviewStates', () => {
  it('is true for CSD and CSP only', () => {
    expect(shouldShowReviewStates({isCsd: true})).toBe(true);
    expect(shouldShowReviewStates({isCsp: true})).toBe(true);
    expect(shouldShowReviewStates({})).toBe(false);
  });
});

describe('processServerSectionProgress', () => {
  it('parses each student', () => {
    const parsed = processServerSectionProgress({
      1: {7: {status: 'perfect', result: 100}},
      2: {7: {locked: true}},
    });
    expect(parsed[1][7]).toMatchObject({status: 'perfect', result: 100});
    expect(parsed[2][7]).toMatchObject({status: 'not_tried', locked: true});
  });
});
