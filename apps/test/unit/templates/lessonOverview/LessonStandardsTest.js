import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonStandards from '@cdo/apps/templates/lessonOverview/LessonStandards';
import {cspStandards, cstaStandards} from './sampleStandardsData';

describe('LessonStandards', () => {
  it('renders standard with parent category', () => {
    const standard = cspStandards[0];
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
    const standard = cstaStandards[0];
    const wrapper = mount(<LessonStandards standards={[standard]} />);
    expect(wrapper.text()).to.contain(standard.frameworkName);
    expect(wrapper.text()).to.contain(standard.categoryShortcode);
    expect(wrapper.text()).to.contain(standard.categoryDescription);
    expect(wrapper.text()).to.contain(standard.shortcode);
    expect(wrapper.text()).to.contain(standard.description);
  });
});
