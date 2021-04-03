import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonStandards, {
  ExpandMode
} from '@cdo/apps/templates/lessonOverview/LessonStandards';
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

    const frameworks = wrapper.find('Framework');
    expect(frameworks.length).to.equal(2);
    frameworks.forEach(framework => {
      expect(isOpen(framework)).to.be.false;
    });

    const parentCategories = wrapper.find('ParentCategory');
    expect(parentCategories.length > 0).to.be.true;
    parentCategories.forEach(parentCategory => {
      expect(isOpen(parentCategory)).to.be.false;
    });
    const categories = wrapper.find('Category');
    expect(categories.length > 0).to.be.true;
    categories.forEach(category => {
      expect(isOpen(category)).to.be.false;
    });
  });

  it('renders many standards with first standard expanded', () => {
    const standards = cspStandards.concat(cstaStandards);
    const wrapper = mount(
      <LessonStandards standards={standards} expandMode={ExpandMode.FIRST} />
    );
    const frameworks = wrapper.find('Framework');
    expect(frameworks.length).to.equal(2);
    expect(isOpen(frameworks.at(0))).to.be.true;
    expect(isOpen(frameworks.at(1))).to.be.false;

    const parentCategories = frameworks.at(0).find('ParentCategory');
    expect(parentCategories.length).to.equal(1);
    expect(isOpen(parentCategories.at(0))).to.be.true;

    const categories = parentCategories.at(0).find('Category');
    expect(categories.length).to.equal(2);
    expect(isOpen(categories.at(0))).to.be.true;
    expect(isOpen(categories.at(1))).to.be.false;
  });

  it('renders many standards with all standards expanded', () => {
    const standards = cspStandards.concat(cstaStandards);
    const wrapper = mount(
      <LessonStandards standards={standards} expandMode={ExpandMode.ALL} />
    );
    const frameworks = wrapper.find('Framework');
    expect(frameworks.length).to.equal(2);
    frameworks.forEach(framework => {
      expect(isOpen(framework)).to.be.true;
    });

    const parentCategories = wrapper.find('ParentCategory');
    expect(parentCategories.length > 0).to.be.true;
    parentCategories.forEach(parentCategory => {
      expect(isOpen(parentCategory)).to.be.true;
    });

    const categories = wrapper.find('Category');
    expect(categories.length > 0).to.be.true;
    categories.forEach(category => {
      expect(isOpen(category)).to.be.true;
    });
  });
});

function isOpen(wrapper) {
  const details = wrapper.find('details').first();
  return details.prop('open');
}
