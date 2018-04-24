import { assert } from '../../../util/configuredChai';
import Immutable from 'immutable';
import { fakeLesson, fakeLevels } from '@cdo/apps/templates/progress/progressTestHelpers';
import { LevelKind, LevelStatus } from '@cdo/apps/util/sharedConstants';
import {
  lessonIsVisible,
  lessonIsLockedForAllStudents,
  getIconForLevel,
  stageLocked,
} from '@cdo/apps/templates/progress/progressHelpers';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

describe('progressHelpers', () => {
  describe('lessonIsVisible', () => {
    const visibleLesson = fakeLesson('visible lesson', '2', false);
    const hiddenLesson = fakeLesson('hidden lesson', '3', false);
    const lockableLesson = fakeLesson('lockable lesson', '4', true);

    const state = {
      teacherSections: {
        selectedSectionId: '11',
      },
      hiddenStage: Immutable.fromJS({
        stagesBySection: {
          '11': { '3': true }
        }
      })
    };

    it('returns false for hidden lessons while viewing as student', () => {
      assert.strictEqual(lessonIsVisible(hiddenLesson, state, ViewType.Student), false);
    });

    it('returns true for hidden lessons while viewing as a teacher', () => {
      assert.strictEqual(lessonIsVisible(hiddenLesson, state, ViewType.Teacher), true);
    });

    it('returns true for non-hidden lessons while viewing as a student', () => {
      assert.strictEqual(lessonIsVisible(visibleLesson, state, ViewType.Student), true);
    });

    it('returns true for non-hidden lessons while viewing as a teacher', () => {
      assert.strictEqual(lessonIsVisible(visibleLesson, state, ViewType.Teacher), true);
    });

    it('returns false for a lockable stage when not authorized', () => {
      const localState = {
        ...state,
        stageLock: {
          lockableAuthorized: false
        }
      };
      assert.strictEqual(lessonIsVisible(lockableLesson, localState, ViewType.Teacher), false);
    });

    it('returns true for a lockable stage when authorized', () => {
      const localState = {
        ...state,
        stageLock: {
          lockableAuthorized: true
        }
      };
      assert.strictEqual(lessonIsVisible(lockableLesson, localState, ViewType.Teacher), true);
    });
  });

  describe('lessonIsLockedForAllStudents', () => {
    const unlockedStageId = 1000;
    const lockedStageId = 1111;

    const stateForSelectedSection = sectionId => ({
      teacherSections: {
        selectedSectionId: sectionId
      },
      stageLock: {
        stagesBySectionId: {
          11: {
            [lockedStageId]: [{
              locked: true,
              name: 'student1'
            }, {
              locked: true,
              name: 'student2'
            }],
            [unlockedStageId]: [{
              locked: true,
              name: 'student1'
            }, {
              locked: false,
              name: 'student2'
            }],
          },
        }
      }
    });

    it('returns false when we have no selected section', () => {
      const state = stateForSelectedSection(null);
      assert.strictEqual(lessonIsLockedForAllStudents(lockedStageId, state), false);
      assert.strictEqual(lessonIsLockedForAllStudents(unlockedStageId, state), false);
    });

    it('returns false when the selected section has an unlocked student', () => {
      const state = stateForSelectedSection(11);
      assert.strictEqual(lessonIsLockedForAllStudents(unlockedStageId, state), false);
    });

    it('returns true when the selected section has no unlocked students', () => {
      const state = stateForSelectedSection(11);
      assert.strictEqual(lessonIsLockedForAllStudents(lockedStageId, state), true);
    });
  });

  describe('stageLocked', () => {
    it('returns true when we only have a level group and it is locked', () => {
      const levels = fakeLevels(3).map(level => ({
        ...level,
        kind: LevelKind.assessment,
        status: LevelStatus.locked
      }));
      assert.strictEqual(true, stageLocked(levels));
    });

    describe('level group preceeded by another level', () => {
      // simulate case where we have a single level, followed by a 3 page level group
      const baseLevels = fakeLevels(4).map((level, index) => ({
        ...level,
        kind: index === 0 ? LevelKind.puzzle : LevelKind.assessment
      }));

      it('returns true when level group is locked', () => {
        const levels = baseLevels.map(level => ({
          ...level,
          // lock assessment levels/pages
          status: level.kind === LevelKind.assessment ? LevelStatus.locked : level.status
        }));
        assert.strictEqual(true, stageLocked(levels));
      });

      it('returns false when level group is not locked', () => {
        assert.strictEqual(false, stageLocked(baseLevels));
      });
    });
  });

  describe('getIconForLevel', () => {
    it('strips fa- from level.icon if one is provided', () => {
      const level = {
        icon: 'fa-file-text'
      };
      assert.equal(getIconForLevel(level), 'file-text');
    });

    it('uses desktop icon if no icon on level', () => {
      const level = {};
      assert.equal(getIconForLevel(level), 'desktop');
    });

    it('uses scissors icon if unplugged level', () => {
      const level1 = {kind: 'unplugged'};
      assert.equal(getIconForLevel(level1), 'scissors');

      const level2 = {isUnplugged: true};
      assert.equal(getIconForLevel(level2), 'scissors');
    });

    it('throws if icon is invalid', () => {
      assert.throws(function () {
        const level = {
          icon: 'asdf'
        };
        getIconForLevel(level);
      }, /Unknown iconType: /);
    });
  });
});
