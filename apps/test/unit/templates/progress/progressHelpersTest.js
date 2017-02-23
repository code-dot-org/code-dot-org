import { assert } from '../../../util/configuredChai';
import Immutable from 'immutable';
import sinon from 'sinon';
import { fakeLesson } from './progressTestUtils';
import { lessonIsHidden } from '@cdo/apps/templates/progress/progressHelpers';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

describe('progressHelpers', () => {
  describe('lessonIsHidden', () => {
    const hiddenStageProps = {
      sectionId: '11',
      lesson: fakeLesson('lesson1', 3),
      hiddenStageState: Immutable.fromJS({
        bySection: {
          '11': { '3': true }
        }
      })
    };

    const noHiddenStageProps = {
      sectionId: '11',
      lesson: fakeLesson('lesson1', 3),
      hiddenStageState: Immutable.fromJS({
        bySection: {
          '11': {  }
        }
      })
    };

    it('returns true for hidden lessons if we view as a student', () => {
      const props = {
        ...hiddenStageProps,
        viewAs: ViewType.Student
      };
      assert.strictEqual(lessonIsHidden(props), true);
    });

    it('returns false for hidden lessons if we view as a teacher', () => {
      const props = {
        ...hiddenStageProps,
        viewAs: ViewType.Teacher
      };
      assert.strictEqual(lessonIsHidden(props), false);
    });

    it('returns false for non-hidden lessons if we view as a student', () => {
      const props = {
        ...noHiddenStageProps,
        viewAs: ViewType.Student
      };
      assert.strictEqual(lessonIsHidden(props), false);
    });

    it('returns false for non-hidden lessons if we view as a teacher', () => {
      const props = {
        ...noHiddenStageProps,
        viewAs: ViewType.Teacher
      };
      assert.strictEqual(lessonIsHidden(props), false);
    });

  });
});
