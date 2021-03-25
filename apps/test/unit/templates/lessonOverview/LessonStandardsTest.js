import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonStandards from '@cdo/apps/templates/lessonOverview/LessonStandards';

describe('LessonStandards', () => {
  it('renders standard with parent category', () => {
    const standard = {
      frameworkName: 'ngss',
      parentCategoryShortcode: 'ESS',
      parentCategoryDescription: 'Earth and Space Science',
      categoryShortcode: 'ESS1',
      categoryDescription: "Earth's Place in the Universe",
      shortcode: '1-ESS1-1',
      description:
        'Use observations of the sun, moon, and stars to describe patterns that can be predicted.'
    };
    const wrapper = mount(<LessonStandards standards={[standard]} />);
    expect(wrapper.text()).to.contain(standard.frameworkName);
    expect(wrapper.text()).to.contain(standard.parentCategoryShortcode);
    expect(wrapper.text()).to.contain(standard.parentCategoryDescription);
    expect(wrapper.text()).to.contain(standard.categoryShortcode);
    expect(wrapper.text()).to.contain(standard.categoryDescription);
    expect(wrapper.text()).to.contain(standard.shortcode);
    expect(wrapper.text()).to.contain(standard.description);
  });

  it('renders standard without parent category', () => {
    const standard = {
      frameworkName: 'csta',
      parentCategoryShortcode: null,
      parentCategoryDescription: null,
      categoryShortcode: 'AP',
      categoryDescription: 'Algorithms & Programming',
      shortcode: '1B-AP-09',
      description:
        'Create programs that use variables to store and modify data.'
    };
    const wrapper = mount(<LessonStandards standards={[standard]} />);
    expect(wrapper.text()).to.contain(standard.frameworkName);
    expect(wrapper.text()).to.contain(standard.categoryShortcode);
    expect(wrapper.text()).to.contain(standard.categoryDescription);
    expect(wrapper.text()).to.contain(standard.shortcode);
    expect(wrapper.text()).to.contain(standard.description);
  });
});
