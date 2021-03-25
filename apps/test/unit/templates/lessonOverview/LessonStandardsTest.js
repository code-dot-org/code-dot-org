import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonStandards from '@cdo/apps/templates/lessonOverview/LessonStandards';
import {cspStandards, cstaStandards} from './sampleStandardsData';

describe('LessonStandards', () => {
  it('renders standard with parent category', () => {
    const standard = cspStandards[0];
    const wrapper = mount(<LessonStandards standards={[standard]} />);
    const text = wrapper.text();
    expect(text).to.contain(standard.frameworkName);
    expect(text).to.contain(standard.parentCategoryShortcode);
    expect(text).to.contain(standard.parentCategoryDescription);
    expect(text).to.contain(standard.categoryShortcode);
    expect(text).to.contain(standard.categoryDescription);
    expect(text).to.contain(standard.shortcode);
    expect(text).to.contain(standard.description);
  });

  it('renders standard without parent category', () => {
    const standard = cstaStandards[0];
    const wrapper = mount(<LessonStandards standards={[standard]} />);
    const text = wrapper.text();
    expect(text).to.contain(standard.frameworkName);
    expect(text).to.contain(standard.categoryShortcode);
    expect(text).to.contain(standard.categoryDescription);
    expect(text).to.contain(standard.shortcode);
    expect(text).to.contain(standard.description);
  });

  it('renders many standards from different frameworks', () => {
    const standards = cspStandards.concat(cstaStandards);
    const wrapper = mount(<LessonStandards standards={standards} />);
    const text = wrapper.text();
    standards.forEach(standard => {
      expect(text).to.contain(standard.shortcode);
      expect(text).to.contain(standard.description);
    });
  });
});
