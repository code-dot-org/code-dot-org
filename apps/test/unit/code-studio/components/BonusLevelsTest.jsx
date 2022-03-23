import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/reconfiguredChai';
import {bonusLevels} from './lessonExtrasTestHelpers';
import BonusLevels from '@cdo/apps/code-studio/components/lessonExtras/BonusLevels';

const DEFAULT_PROPS = {
  bonusLevels: bonusLevels,
  sectionId: null,
  userId: null
};

const setUp = () => {
  return shallow(<BonusLevels {...DEFAULT_PROPS} />);
};

describe('BonusLevels', () => {
  it('renders correct number of bonus levels', () => {
    const wrapper = setUp();
    assert.equal(7, wrapper.find('SublevelCard').length);
  });

  it('renders the correct header on load', () => {
    const wrapper = setUp();
    assert(wrapper.contains('Lesson 3 Challenges'));
  });

  it('updates the lesson header when arrows are toggled', () => {
    const wrapper = setUp();
    const leftArrow = wrapper.find('FontAwesome').first();
    leftArrow.simulate('click');
    assert(wrapper.contains('Lesson 2 Challenges'));
  });
});
