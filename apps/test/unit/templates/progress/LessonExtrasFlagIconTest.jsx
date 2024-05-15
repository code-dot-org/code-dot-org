import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonExtrasFlagIcon from '@cdo/apps/templates/progress/LessonExtrasFlagIcon';
import color from '@cdo/apps/util/color';

import {assert} from '../../../util/reconfiguredChai';

describe('LessonExtrasFlagIcon', () => {
  it('has a grey flag icon when not selected, not perfect', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon />);
    assert.equal(
      wrapper.find('i').at(1).props().style.color,
      color.lighter_gray
    );
  });

  it('has a charcoal flag icon when selected, not perfect', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon isSelected={true} />);
    assert.equal(wrapper.find('i').at(1).props().style.color, color.charcoal);
  });

  it('has a green flag icon when level result is perfect', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon isPerfect={true} />);
    assert.equal(
      wrapper.find('i').at(1).props().style.color,
      color.level_perfect
    );
  });
});
