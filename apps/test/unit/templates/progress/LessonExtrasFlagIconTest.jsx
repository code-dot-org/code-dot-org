import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LessonExtrasFlagIcon from '@cdo/apps/templates/progress/LessonExtrasFlagIcon';
import color from '@cdo/apps/util/color';

const defaultProps = {
  perfect: false
};

describe('LessonExtrasFlagIcon', () => {
  it('has a grey flag icon when not current level', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon {...defaultProps} />);
    assert.equal(
      wrapper
        .find('i')
        .at(1)
        .props().style.color,
      color.lighter_gray
    );
  });

  it('has a green flag icon when level result is perfect', () => {
    const wrapper = shallow(
      <LessonExtrasFlagIcon {...defaultProps} perfect={true} />
    );
    assert.equal(
      wrapper
        .find('i')
        .at(1)
        .props().style.color,
      color.level_perfect
    );
  });
});
