import { assert } from '../../../util/configuredChai';
import Immutable from 'immutable';
import sinon from 'sinon';
import { fakeLesson } from './progressTestUtils';
import { lessonIsHidden } from '@cdo/apps/templates/progress/progressHelpers';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

describe('progressHelpers', () => {
  describe('lessonIsHidden', () => {
    const hiddenLessonId = '3';
    const visibleLessonId = '2';

    const stateWithViewAs = viewAs => ({
      sections: {
        selectedSectionId: '11',
      },
      lesson: fakeLesson('lesson1', 3),
      stageLock: { viewAs },
      hiddenStage: Immutable.fromJS({
        bySection: {
          '11': { '3': true }
        }
      })
    });

    it('returns true for hidden lessons while viewing as student', () => {
      const state = stateWithViewAs(ViewType.Student);
      assert.strictEqual(lessonIsHidden(hiddenLessonId, state, undefined), true);
    });

    it('returns false for hidden lessons while viewing as a teacher', () => {
      const state = stateWithViewAs(ViewType.Teacher);
      assert.strictEqual(lessonIsHidden(hiddenLessonId, state, undefined), false);
    });

    it('returns true for hidden lessons while viewing as a teacher, if we ask about students', () => {
      const state = stateWithViewAs(ViewType.Teacher);
      assert.strictEqual(lessonIsHidden(hiddenLessonId, state, ViewType.Student), true);
    });

    it('returns false for non-hidden lessons while viewing as a student', () => {
      const state = stateWithViewAs(ViewType.Student);
      assert.strictEqual(lessonIsHidden(visibleLessonId, state, undefined), false);
    });

    it('returns false for non-hidden lessons while viewing as a teacher', () => {
      const state = stateWithViewAs(ViewType.Teacher);
      assert.strictEqual(lessonIsHidden(visibleLessonId, state, undefined), false);
    });

  });
});
