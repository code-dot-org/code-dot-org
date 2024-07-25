import Immutable from 'immutable';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  lessonIsVisible,
  lessonIsLockedForUser,
  lessonIsLockedForAllStudents,
  getIconForLevel,
  lessonLocked,
  lessonProgressForSection,
  isLevelAssessment,
  lessonIsAllAssessment,
} from '@cdo/apps/templates/progress/progressHelpers';
import {
  fakeLesson,
  fakeLevels,
  fakeProgressForLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import {LevelKind, LevelStatus} from '@cdo/generated-scripts/sharedConstants';

describe('progressHelpers', () => {
  describe('lessonIsVisible', () => {
    const visibleLesson = fakeLesson('visible lesson', '2', false);
    const hiddenLesson = fakeLesson('hidden lesson', '3', false);
    const lockableLesson = fakeLesson('lockable lesson', '4', true);

    const state = {
      teacherSections: {
        selectedSectionId: '11',
      },
      hiddenLesson: Immutable.fromJS({
        lessonsBySection: {
          11: {3: true},
        },
      }),
    };

    it('returns false for hidden lessons while viewing as participant', () => {
      expect(lessonIsVisible(hiddenLesson, state, ViewType.Participant)).toBe(
        false
      );
    });

    it('returns true for hidden lessons while viewing as an instructor ', () => {
      expect(lessonIsVisible(hiddenLesson, state, ViewType.Instructor)).toBe(
        true
      );
    });

    it('returns true for non-hidden lessons while viewing as a participant', () => {
      expect(lessonIsVisible(visibleLesson, state, ViewType.Participant)).toBe(
        true
      );
    });

    it('returns true for non-hidden lessons while viewing as an instructor', () => {
      expect(lessonIsVisible(visibleLesson, state, ViewType.Instructor)).toBe(
        true
      );
    });

    it('returns true for a lockable lesson as instructor', () => {
      const localState = {
        ...state,
        lessonLock: {
          lockableAuthorized: true,
        },
      };
      expect(
        lessonIsVisible(lockableLesson, localState, ViewType.Instructor)
      ).toBe(true);
    });
  });

  describe('lessonIsLockedForUser', () => {
    const nonLockableLesson = fakeLesson('non-lockable lesson', '3', false);
    const lockableLesson = fakeLesson('lockable lesson', '4', true);
    const unlockedLevels = fakeLevels(3);
    const lockedLevels = fakeLevels(3).map((level, index) => ({
      ...level,
      isLocked: index === 2, // lock last level in level group
    }));

    const state = {
      currentUser: {
        userId: 1,
      },
      lessonLock: {
        lockableAuthorized: true,
      },
    };

    it('returns false for non-lockable lesson', () => {
      expect(
        lessonIsLockedForUser(
          nonLockableLesson,
          unlockedLevels,
          state,
          ViewType.Participant
        )
      ).toBe(false);
    });

    it('returns true for lockable lesson for signed out user', () => {
      const localState = {
        ...state,
        currentUser: {
          userId: null,
        },
      };
      expect(
        lessonIsLockedForUser(
          lockableLesson,
          unlockedLevels,
          localState,
          ViewType.Participant
        )
      ).toBe(true);
    });

    it('returns true for lockable lesson for non-verified instructor', () => {
      const localState = {
        ...state,
        lessonLock: {
          lockableAuthorized: false,
        },
      };
      expect(
        lessonIsLockedForUser(
          lockableLesson,
          unlockedLevels,
          localState,
          ViewType.Instructor
        )
      ).toBe(true);
    });

    it('returns true for lockable lesson for lessonLocked', () => {
      expect(
        lessonIsLockedForUser(
          lockableLesson,
          lockedLevels,
          state,
          ViewType.Participant
        )
      ).toBe(true);
    });
  });

  describe('lessonIsLockedForAllStudents', () => {
    const unlockedLessonId = 1000;
    const lockedLessonId = 1111;

    const stateForSelectedSection = sectionId => ({
      teacherSections: {
        selectedSectionId: sectionId,
      },
      lessonLock: {
        lessonsBySectionId: {
          11: {
            [lockedLessonId]: [
              {
                locked: true,
                name: 'student1',
              },
              {
                locked: true,
                name: 'student2',
              },
            ],
            [unlockedLessonId]: [
              {
                locked: true,
                name: 'student1',
              },
              {
                locked: false,
                name: 'student2',
              },
            ],
          },
        },
      },
    });

    it('returns false when we have no selected section', () => {
      const state = stateForSelectedSection(null);
      expect(lessonIsLockedForAllStudents(lockedLessonId, state)).toBe(false);
      expect(lessonIsLockedForAllStudents(unlockedLessonId, state)).toBe(false);
    });

    it('returns false when the selected section has an unlocked student', () => {
      const state = stateForSelectedSection(11);
      expect(lessonIsLockedForAllStudents(unlockedLessonId, state)).toBe(false);
    });

    it('returns true when the selected section has no unlocked students', () => {
      const state = stateForSelectedSection(11);
      expect(lessonIsLockedForAllStudents(lockedLessonId, state)).toBe(true);
    });
  });

  describe('lessonLocked', () => {
    it('returns true when we only have a level group and it is locked', () => {
      const levels = fakeLevels(3).map((level, index) => ({
        ...level,
        isLocked: index === 2, // lock last level in level group
      }));
      expect(true).toBe(lessonLocked(levels));
    });

    describe('level group preceeded by another level', () => {
      // simulate case where we have a single level, followed by a 3 page level group
      const baseLevels = fakeLevels(4).map((level, index) => ({
        ...level,
        kind: index === 0 ? LevelKind.puzzle : LevelKind.assessment,
      }));

      it('returns true when level group is locked', () => {
        // lock last level in level group
        const levels = baseLevels.map((level, index) => ({
          ...level,
          isLocked: index === 3, // lock last level in level group
        }));

        expect(true).toBe(lessonLocked(levels));
      });

      it('returns false when level group is not locked', () => {
        expect(false).toBe(lessonLocked(baseLevels));
      });
    });
  });

  describe('isLevelAssessment', () => {
    it('returns true if level kind is assessment', () => {
      const level = {
        kind: LevelKind.assessment,
      };
      expect(isLevelAssessment(level)).toEqual(true);
    });

    it('returns false if level kind is something other than assessment', () => {
      const level = {
        kind: LevelKind.puzzle,
      };
      expect(isLevelAssessment(level)).toEqual(false);
    });
  });

  describe('getIconForLevel', () => {
    it('strips fa- from level.icon if one is provided', () => {
      const level = {
        icon: 'fa-file-text',
      };
      expect(getIconForLevel(level)).toEqual('file-text');
    });

    it('uses desktop icon if no icon on level', () => {
      const level = {};
      expect(getIconForLevel(level)).toEqual('desktop');
    });

    it('uses scissors icon if unplugged level', () => {
      const level1 = {isUnplugged: true};
      expect(getIconForLevel(level1)).toEqual('scissors');
    });

    it('uses flag-checkered icon if bonus level', () => {
      const level = {bonus: true};
      expect(getIconForLevel(level)).toEqual('flag-checkered');
    });

    it('throws if icon is invalid', () => {
      expect(function () {
        const level = {
          icon: 'asdf',
        };
        getIconForLevel(level);
      }).toThrow();
    });
  });

  describe('lessonIsAllAssessment', () => {
    it('returns true if all the levels are of kind assessment', () => {
      const levels = fakeLevels(3);
      levels[0].kind = LevelKind.assessment;
      levels[1].kind = LevelKind.assessment;
      levels[2].kind = LevelKind.assessment;
      expect(lessonIsAllAssessment(levels)).toEqual(true);
    });
    it('returns false if not all the levels are of kind assessment', () => {
      const levels = fakeLevels(3);
      levels[0].kind = LevelKind.unplugged;
      levels[1].kind = LevelKind.puzzle;
      levels[2].kind = LevelKind.assessment;
      expect(lessonIsAllAssessment(levels)).toEqual(false);
    });
  });

  describe('lessonProgressForSection', () => {
    /**
     * Note: this function is only used by section progress tables, which have
     * been refactored to expect the `status` value to be in a sepaparate
     * `studentLevelProgressType` object rather than the `levelType` object.
     */
    const STUDENT_ID = 11;
    const LESSON_ID = 111;

    // helper function to get lesson progress for a single student
    const getStudentLessonProgress = (studentLevelProgress, levels) => {
      const lesson = {id: LESSON_ID, levels: levels};
      const sectionLevelProgress = {[STUDENT_ID]: studentLevelProgress};
      const sectionLessonProgress = lessonProgressForSection(
        sectionLevelProgress,
        [lesson]
      );
      return sectionLessonProgress[STUDENT_ID][LESSON_ID];
    };

    it('returns null if all levels are untried', () => {
      const levels = fakeLevels(3);
      const studentProgress = fakeProgressForLevels(levels);
      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual(null);
    });

    it('returns null if all levels are bonus', () => {
      const levels = fakeLevels(2);
      levels[0].bonus = true;
      levels[1].bonus = true;
      const studentProgress = fakeProgressForLevels(levels);

      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual(null);
    });

    it('returns null if some levels are bonus and the rest are untried', () => {
      const levels = fakeLevels(2);
      const studentProgress = fakeProgressForLevels(levels);
      studentProgress[1].status = LevelStatus.perfect;
      levels[0].bonus = true;

      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual(null);
    });

    it('summarizes all completed levels', () => {
      const levels = fakeLevels(3);
      const studentProgress = fakeProgressForLevels(levels);
      studentProgress[1].status = LevelStatus.perfect;
      studentProgress[2].status = LevelStatus.submitted;
      studentProgress[3].status = LevelStatus.free_play_complete;

      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual({
        incompletePercent: 0,
        imperfectPercent: 0,
        completedPercent: 100,
        timeSpent: 0,
        lastTimestamp: 0,
      });
    });

    it('summarizes all attempted levels', () => {
      const levels = fakeLevels(2);
      const studentProgress = fakeProgressForLevels(
        levels,
        LevelStatus.attempted
      );
      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual({
        incompletePercent: 100,
        imperfectPercent: 0,
        completedPercent: 0,
        timeSpent: 0,
        lastTimestamp: 0,
      });
    });

    it('summarizes a mix of levels', () => {
      const levels = fakeLevels(8);
      const studentProgress = fakeProgressForLevels(levels);
      studentProgress[1].status = LevelStatus.submitted;
      studentProgress[2].status = LevelStatus.perfect;
      studentProgress[3].status = LevelStatus.attempted;
      studentProgress[4].status = LevelStatus.passed;
      studentProgress[5].status = LevelStatus.free_play_complete;
      studentProgress[6].isLocked = true;
      studentProgress[7].status = 'other';

      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual({
        incompletePercent: 50,
        imperfectPercent: 12.5,
        completedPercent: 37.5,
        timeSpent: 0,
        lastTimestamp: 0,
      });
    });

    it('computes correct timeSpent', () => {
      const levels = fakeLevels(2);
      const studentProgress = fakeProgressForLevels(
        levels,
        LevelStatus.attempted
      );
      studentProgress[1].timeSpent = 1;
      studentProgress[2].timeSpent = 2;

      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual({
        incompletePercent: 100,
        imperfectPercent: 0,
        completedPercent: 0,
        timeSpent: 3,
        lastTimestamp: 0,
      });
    });

    it('computes correct lastTimestamp', () => {
      const levels = fakeLevels(2);
      const studentProgress = fakeProgressForLevels(
        levels,
        LevelStatus.attempted
      );
      studentProgress[1].lastTimestamp = 2;
      studentProgress[2].lastTimestamp = 1;

      const studentLessonProgress = getStudentLessonProgress(
        studentProgress,
        levels
      );
      expect(studentLessonProgress).toEqual({
        incompletePercent: 100,
        imperfectPercent: 0,
        completedPercent: 0,
        timeSpent: 0,
        lastTimestamp: 2,
      });
    });
  });
});
