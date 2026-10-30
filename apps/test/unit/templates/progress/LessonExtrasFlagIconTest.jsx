import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonExtrasFlagIcon from '@cdo/apps/templates/progress/LessonExtrasFlagIcon';

describe('LessonExtrasFlagIcon', () => {
  it('has a grey flag icon when not selected, not perfect', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon />);
    expect(wrapper.find('i').at(1).props().style.color).toEqual(
      'var(--text-neutral-tertiary)'
    );
  });

  it('has a charcoal flag icon when selected, not perfect', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon isSelected={true} />);
    expect(wrapper.find('i').at(1).props().style.color).toEqual(
      'var(--text-neutral-primary)'
    );
  });

  it('has a green flag icon when level result is perfect', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon isPerfect={true} />);
    expect(wrapper.find('i').at(1).props().style.color).toEqual(
      'var(--text-success-primary)'
    );
  });

  it('has an orange flag icon when hovered', () => {
    const wrapper = shallow(<LessonExtrasFlagIcon />);
    wrapper.find('span').simulate('mouseEnter');
    expect(wrapper.find('i').at(1).props().style.color).toEqual(
      'var(--text-accent-orange-primary)'
    );
  });
});
