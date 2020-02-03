import React from 'react';
import {assert} from 'chai';
import {UnconnectedStageProgress as StageProgress} from '@cdo/apps/code-studio/components/progress/StageProgress';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {shallow} from 'enzyme';

describe('StageProgress', () => {
  const defaultProps = {
    levels: [
      {
        status: LevelStatus.not_tried
      }
    ],
    stageId: 1,
    onStageExtras: false
  };

  it('uses progress bubbles', () => {
    const wrapper = shallow(<StageProgress {...defaultProps} />);
    assert.equal(wrapper.find('Connect(StatusProgressDot)').length, 0);
    assert.equal(wrapper.find('ProgressBubble').length, 1);
  });

  it('does not include stage extras when there is not a stageExtrasUrl', () => {
    const wrapper = shallow(<StageProgress {...defaultProps} />);
    assert.equal(wrapper.find('StageExtrasProgressBubble').length, 0);
  });

  it('includes stage extras when there is a stageExtrasUrl', () => {
    const wrapper = shallow(
      <StageProgress {...defaultProps} stageExtrasUrl={'/extras'} />
    );
    assert.equal(wrapper.find('StageExtrasProgressBubble').length, 1);
  });
});
