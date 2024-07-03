import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import BonusLevels from '@cdo/apps/code-studio/components/lessonExtras/BonusLevels';

import {bonusLevels} from './lessonExtrasTestHelpers';

const DEFAULT_PROPS = {
  bonusLevels: bonusLevels,
  sectionId: null,
  userId: null,
};

const setUp = () => {
  return shallow(<BonusLevels {...DEFAULT_PROPS} />);
};

describe('BonusLevels', () => {
  it('renders correct number of bonus levels', () => {
    const wrapper = setUp();
    expect(7).toEqual(wrapper.find('SublevelCard').length);
  });

  it('renders the correct header on load', () => {
    const wrapper = setUp();
    expect(wrapper.contains('Lesson 3 Challenges')).toBeTruthy();
  });

  it('updates the lesson header when arrows are toggled', () => {
    const wrapper = setUp();
    const leftArrow = wrapper.find('FontAwesome').first();
    leftArrow.simulate('click');
    expect(wrapper.contains('Lesson 2 Challenges')).toBeTruthy();
  });
});
