import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedProgressBubbleSet as ProgressBubbleSet} from '@cdo/apps/templates/progress/ProgressBubbleSet';
import {fakeLevels} from '@cdo/apps/templates/progress/progressTestHelpers';

const defaultProps = {
  levels: fakeLevels(5),
  disabled: false,
  lessonExtrasEnabled: true,
};

describe('ProgressBubbleSet', () => {
  it('we have a bubble for each level', () => {
    const wrapper = shallow(<ProgressBubbleSet {...defaultProps} />);
    expect(wrapper.find('ProgressBubble').length).toEqual(
      defaultProps.levels.length
    );
  });

  it('renders a disabled ProgressBubble if this.props.disabled is true', () => {
    const additionalProps = {
      levels: fakeLevels(1),
      disabled: true,
    };
    const wrapper = shallow(
      <ProgressBubbleSet {...defaultProps} {...additionalProps} />
    );
    expect(wrapper.find('ProgressBubble').length).toEqual(1);
    const progressBubble = wrapper.find('ProgressBubble').at(0);
    expect(progressBubble.prop('disabled')).toEqual(true);
  });

  it('renders an enabled ProgressBubble if this.props.lessonExtrasEnabled is true and level is bonus', () => {
    let bonusLevel = fakeLevels(1)[0];
    bonusLevel.bonus = true;
    const wrapper = shallow(
      <ProgressBubbleSet {...defaultProps} levels={[bonusLevel]} />
    );
    expect(wrapper.find('ProgressBubble').length).toEqual(1);
    const progressBubble = wrapper.find('ProgressBubble').at(0);
    expect(progressBubble.prop('disabled')).toEqual(false);
  });
});
