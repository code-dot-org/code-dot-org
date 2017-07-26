import React from 'react';
import { assert } from 'chai';
import { UnconnectedStageProgress as StageProgress } from
  '@cdo/apps/code-studio/components/progress/StageProgress';
  import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import experiments from '@cdo/apps/util/experiments';
import { shallow } from 'enzyme';

describe('StageProgress', () => {
  describe('with progressBubbles enabled', () => {
    const defaultProps = {
      levels: [{
        status: LevelStatus.not_tried
      }],
      stageId: 1,
      stageExtrasUrl: '/extras',
      onStageExtras: false
    };

    before(() => experiments.setEnabled('progressBubbles', true));
    after(() => experiments.setEnabled('progressBubbles', false));

    it('uses progress bubbles', () => {
      const wrapper = shallow(
        <StageProgress {...defaultProps}/>
      );
      assert.equal(wrapper.find('Connect(StatusProgressDot)').length, 0);
      assert.equal(wrapper.find('NewProgressBubble').length, 1);
    });

    describe('stage extras experiment', () => {
      before(() => experiments.setEnabled('stageExtras', true));
      after(() => experiments.setEnabled('stageExtras', false));

      it('includes stage extras', () => {
        const wrapper = shallow(
          <StageProgress {...defaultProps}/>
        );
        assert.equal(wrapper.find('StageExtrasProgressBubble').length, 1);
      });
    });
  });

  describe('with progressBubbles disabled', () => {
    const defaultProps = {
      levels: [{
        ids: [123],
        uid: '123',
        title: 1,
        name: 'Test Level',
        kind: LevelKind.puzzle,
        url: '/test-url'
      }],
      stageId: 1,
      stageExtrasUrl: '',
      onStageExtras: false
    };
    it('uses progress dots', () => {
      const wrapper = shallow(
        <StageProgress {...defaultProps}/>
      );
      assert.equal(wrapper.find('Connect(StatusProgressDot)').length, 1);
      assert.equal(wrapper.find('NewProgressBubble').length, 0);
    });
  });
});
