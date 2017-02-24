import { assert } from '../../../util/configuredChai';
import Immutable from 'immutable';
import sinon from 'sinon';
import { fakeLesson } from './progressTestUtils';
import { lessonIsVisible } from '@cdo/apps/templates/progress/progressHelpers';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

describe('progressHelpers', () => {
  describe('lessonIsVisible', () => {
    const visibleLesson = fakeLesson('visible lesson', '2', false);
    const hiddenLesson = fakeLesson('hidden lesson', '3', false);
    const lockableLesson = fakeLesson('lockable lesson', '4', true);

    const stateWithViewAs = viewAs => ({
      sections: {
        selectedSectionId: '11',
      },
      stageLock: { viewAs },
      hiddenStage: Immutable.fromJS({
        bySection: {
          '11': { '3': true }
        }
      })
    });

    it('returns false for hidden lessons while viewing as student', () => {
      const state = stateWithViewAs(ViewType.Student);
      assert.strictEqual(lessonIsVisible(hiddenLesson, state, undefined), false);
    });

    it('returns true for hidden lessons while viewing as a teacher', () => {
      const state = stateWithViewAs(ViewType.Teacher);
      assert.strictEqual(lessonIsVisible(hiddenLesson, state, undefined), true);
    });

    it('returns false for hidden lessons while viewing as a teacher, if we ask about students', () => {
      const state = stateWithViewAs(ViewType.Teacher);
      assert.strictEqual(lessonIsVisible(hiddenLesson, state, ViewType.Student), false);
    });

    it('returns true for non-hidden lessons while viewing as a student', () => {
      const state = stateWithViewAs(ViewType.Student);
      assert.strictEqual(lessonIsVisible(visibleLesson, state, undefined), true);
    });

    it('returns true for non-hidden lessons while viewing as a teacher', () => {
      const state = stateWithViewAs(ViewType.Teacher);
      assert.strictEqual(lessonIsVisible(visibleLesson, state, undefined), true);
    });

    it('returns false for a lockable stage when not authorized', () => {
      let state = stateWithViewAs(ViewType.Teacher);
      state.stageLock.lockableAuthorized = false;
      assert.strictEqual(lessonIsVisible(lockableLesson, state, undefined), false);
    });

    it('returns true for a lockable stage when not authorized', () => {
      let state = stateWithViewAs(ViewType.Teacher);
      state.stageLock.lockableAuthorized = true;
      assert.strictEqual(lessonIsVisible(lockableLesson, state, undefined), true);
    });

  });
});
