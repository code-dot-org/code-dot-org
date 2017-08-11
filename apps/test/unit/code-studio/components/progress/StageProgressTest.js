import React from 'react';
import { assert } from 'chai';
import { UnconnectedStageProgress as StageProgress } from
  '@cdo/apps/code-studio/components/progress/StageProgress';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import experiments from '@cdo/apps/util/experiments';
import { shallow } from 'enzyme';

describe('StageProgress', () => {
  const defaultProps = {
    levels: [{
      status: LevelStatus.not_tried
    }],
    stageId: 1,
    stageExtrasUrl: '/extras',
    onStageExtras: false
  };

  it('uses progress bubbles', () => {
    const wrapper = shallow(
      <StageProgress {...defaultProps}/>
    );
    assert.equal(wrapper.find('Connect(StatusProgressDot)').length, 0);
    assert.equal(wrapper.find('ProgressBubble').length, 1);
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
