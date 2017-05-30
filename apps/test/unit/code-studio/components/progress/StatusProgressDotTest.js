import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';

import { StatusProgressDot } from
  '@cdo/apps/code-studio/components/progress/StatusProgressDot';
import * as stageLockRedux from '@cdo/apps/code-studio/stageLockRedux';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import { SignInState } from '@cdo/apps/code-studio/progressRedux';
import { TestResults } from '@cdo/apps/constants';

const ViewType = stageLockRedux.ViewType;

function statusFromWrapper(wrapper) {
  // StatusProgressDot returns a (connected) ProgressDot. This represents the
  // prop passed to ProgressDot
  return wrapper.node.props.status;
}

describe('StatusProgressDot', () => {
  const fullyLockedStageId = 123;
  const partiallyLockedStageId = 321;

  // Some basic properties for our component. Some of these will be overriden
  // in some tests
  const baseProps = {
    level: {
      icon: null,
      ids: [5275],
      kind: LevelKind.assessment,
      next: [2, 1],
      position: 1,
      previous: false,
      status: LevelStatus.perfect,
      title: 1,
      uid: '5275_0',
      url: '/test-url'
    },
    levelProgress: {
      // teacher has perfect status
      '5275_0': TestResults.ALL_PASS,
    },
    courseOverviewPage: true,
    postMilestoneDisabled: false,
    signInState: SignInState.SignedIn,
    saveAnswersBeforeNavigation: false,
    lessonIsLockedForAllStudents: () => false
  };

  describe('handling lockable assessments', () => {
    it('overrides status to be locked when viewing fully locked section as student', () => {
      const props = {
        ...baseProps,
        stageId: fullyLockedStageId,
        viewAs: ViewType.Student,
        lessonIsLockedForAllStudents: () => true
      };

      const wrapper = shallow(<StatusProgressDot {...props}/>);
      assert.equal(statusFromWrapper(wrapper), LevelStatus.locked);
    });

    it('does not override lock status when viewing as teacher', () => {
      const props = {
        ...baseProps,
        stageId: fullyLockedStageId,
        viewAs: ViewType.Teacher,
        lessonIsLockedForAllStudents: () => true
      };
      const wrapper = shallow(<StatusProgressDot {...props}/>);
      assert.equal(statusFromWrapper(wrapper), LevelStatus.perfect);
    });

    it('does not override lock status when stage is not fully locked', () => {
      const props = {
        ...baseProps,
        stageId: partiallyLockedStageId,
        viewAs: ViewType.Student,
        lessonIsLockedForAllStudents: () => false
      };
      const wrapper = shallow(<StatusProgressDot {...props}/>);
      assert.equal(statusFromWrapper(wrapper), LevelStatus.perfect);
    });
  });

  describe('postMilestone overrides', () => {
    it('shows as dots_disabled when postMilestone is disabled and signed in', () => {
      const props = {
        ...baseProps,
        stageId: partiallyLockedStageId,
        viewAs: ViewType.Student,
        postMilestoneDisabled: true,
      };

      const wrapper = shallow(<StatusProgressDot {...props}/>);
      assert.equal(statusFromWrapper(wrapper), LevelStatus.dots_disabled);
    });

    it('shows progress when postMilestone is disabled but signed out', () => {
      const props = {
        ...baseProps,
        stageId: partiallyLockedStageId,
        viewAs: ViewType.Student,
        postMilestoneDisabled: true,
        signInState: SignInState.SignedOut
      };

      const wrapper = shallow(<StatusProgressDot {...props}/>);
      assert.equal(statusFromWrapper(wrapper), LevelStatus.perfect);
    });

    it('when postMilestone is disabled, shows up as not_tried until signin state is known', () => {
      const props = {
        ...baseProps,
        stageId: partiallyLockedStageId,
        viewAs: ViewType.Student,
        postMilestoneDisabled: true,
        signInState: SignInState.Unknown
      };

      const wrapper = shallow(<StatusProgressDot {...props}/>);
      assert.equal(statusFromWrapper(wrapper), LevelStatus.not_tried);
    });

    it('doesnt override status if initial status was locked', () => {
      const props = {
        ...baseProps,
        level: {
          ...baseProps.level
        },
        levelProgress: {
          5275: TestResults.LOCKED_RESULT
        },
        stageId: partiallyLockedStageId,
        viewAs: ViewType.Student,
        postMilestoneDisabled: true
      };

      const wrapper = shallow(<StatusProgressDot {...props}/>);
      assert.equal(statusFromWrapper(wrapper), LevelStatus.locked);
    });
  });
});
