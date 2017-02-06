import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import { StatusProgressDot } from
  '@cdo/apps/code-studio/components/progress/StatusProgressDot';
import * as stageLockRedux from '@cdo/apps/code-studio/stageLockRedux';
import { LevelStatus } from '@cdo/apps/code-studio/activityUtils';

const ViewType = stageLockRedux.ViewType;

function statusFromWrapper(wrapper) {
  // StatusProgressDot returns a (connected) ProgressDot. This represents the
  // prop passed to ProgressDot
  return wrapper.node.props.status;
}

describe('StatusProgressDot', () => {
  const fullyLockedStageId = 123;
  const partiallyLockedStageId = 321;

  before(() => {
    sinon.stub(stageLockRedux, 'fullyLockedStageMapping', () => ({
      [fullyLockedStageId]: true,
      [partiallyLockedStageId]: false
    }));
  });
  after(() => {
    stageLockRedux.fullyLockedStageMapping.restore();
  });

  describe('handling lockable assessments', () => {
    it('overrides status to be locked when viewing fully locked section as student', () => {
      const wrapper = shallow(
        <StatusProgressDot
          level={{
            icon: null,
            ids: [5275],
            kind: 'assessment',
            next: [2, 1],
            position: 1,
            previous: false,
            status: LevelStatus.perfect,
            title: 1,
            uid: '5275_0',
            url: '/test-url'
          }}
          courseOverviewPage={true}
          stageId={fullyLockedStageId}
          viewAs={ViewType.Student}
          showProgress={true}
          saveAnswersBeforeNavigation={false}
        />
      );
      assert.equal(statusFromWrapper(wrapper), LevelStatus.locked);
    });

    it('does not override lock status when viewing as teacher', () => {
      const wrapper = shallow(
        <StatusProgressDot
          level={{
            icon: null,
            ids: [5275],
            kind: 'assessment',
            next: [2, 1],
            position: 1,
            previous: false,
            status: LevelStatus.perfect,
            title: 1,
            uid: '5275_0',
            url: '/test-url'
          }}
          courseOverviewPage={true}
          stageId={fullyLockedStageId}
          viewAs={ViewType.Teacher}
          showProgress={true}
          saveAnswersBeforeNavigation={false}
        />
      );
      assert.equal(statusFromWrapper(wrapper), LevelStatus.perfect);
    });

    it('does not override lock status when stage is not fully locked', () => {
      const wrapper = shallow(
        <StatusProgressDot
          level={{
            icon: null,
            ids: [5275],
            kind: 'assessment',
            next: [2, 1],
            position: 1,
            previous: false,
            status: LevelStatus.perfect,
            title: 1,
            uid: '5275_0',
            url: '/test-url'
          }}
          courseOverviewPage={true}
          stageId={partiallyLockedStageId}
          viewAs={ViewType.Student}
          showProgress={true}
          saveAnswersBeforeNavigation={false}
        />
      );

      assert.equal(statusFromWrapper(wrapper), LevelStatus.perfect);
    });
  });

  describe('progress overrides', () => {
    it('sets status to not_tried if not showing progress', () => {
      const wrapper = shallow(
        <StatusProgressDot
          level={{
            icon: null,
            ids: [5275],
            kind: 'assessment',
            next: [2, 1],
            position: 1,
            previous: false,
            status: LevelStatus.perfect,
            title: 1,
            uid: '5275_0',
            url: '/test-url'
          }}
          courseOverviewPage={true}
          stageId={partiallyLockedStageId}
          viewAs={ViewType.Student}
          showProgress={false}
          grayProgress={false}
          saveAnswersBeforeNavigation={false}
        />
      );
      assert.equal(statusFromWrapper(wrapper), LevelStatus.not_tried);
    });

    it('sets status to disabled if grayProgress is true', () => {
      const wrapper = shallow(
        <StatusProgressDot
          level={{
            icon: null,
            ids: [5275],
            kind: 'assessment',
            next: [2, 1],
            position: 1,
            previous: false,
            status: LevelStatus.perfect,
            title: 1,
            uid: '5275_0',
            url: '/test-url'
          }}
          courseOverviewPage={true}
          stageId={partiallyLockedStageId}
          viewAs={ViewType.Student}
          showProgress={true}
          grayProgress={true}
          saveAnswersBeforeNavigation={false}
        />
      );
      assert.equal(statusFromWrapper(wrapper), LevelStatus.dots_disabled);
    });

    it('doesnt override status if initial status was locked', () => {
      const wrapper = shallow(
        <StatusProgressDot
          level={{
            icon: null,
            ids: [5275],
            kind: 'assessment',
            next: [2, 1],
            position: 1,
            previous: false,
            status: LevelStatus.locked,
            title: 1,
            uid: '5275_0',
            url: '/test-url'
          }}
          courseOverviewPage={true}
          stageId={partiallyLockedStageId}
          viewAs={ViewType.Student}
          showProgress={true}
          grayProgress={true}
          saveAnswersBeforeNavigation={false}
        />
      );
      assert.equal(statusFromWrapper(wrapper), LevelStatus.locked);
    });
  });
});
