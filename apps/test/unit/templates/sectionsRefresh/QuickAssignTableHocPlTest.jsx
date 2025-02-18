import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {MARKETING_AUDIENCE} from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';
import QuickAssignTableHocPl from '@cdo/apps/templates/sectionsRefresh/QuickAssignTableHocPl';
import i18n from '@cdo/locale';

import {hocCourseOfferings, plCourseOfferings} from './CourseOfferingsTestData';

const DEFAULT_PROPS = {
  marketingAudience: MARKETING_AUDIENCE.HOC,
  courseOfferings: hocCourseOfferings,
  setSelectedCourseOffering: () => {},
  updateCourse: () => {},
  sectionCourse: {},
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<QuickAssignTableHocPl {...props} />);
};

describe('QuickAssignTable', () => {
  it('renders Hour of Code as the first and only table/column header', () => {
    const wrapper = setUp();
    expect(wrapper.find('table').length).toBe(3);
    expect(wrapper.contains(i18n.courseOfferingHOC())).toBe(true);
  });

  it('renders extra two headers in the first and second tables', () => {
    const wrapper = setUp();
    expect(wrapper.find('table').length).toBe(3);
    // First header displays in table 0
    expect(wrapper.find('table').at(0).contains('Favorites')).toBe(true);
    // Fourth header displays in table 0
    expect(wrapper.find('table').at(0).contains('Popular Media')).toBe(true);
    // Fifth header displays in table 1
    expect(wrapper.find('table').at(1).contains('Sports')).toBe(true);
  });

  it('renders Professional Learning as the first and only table/column header', () => {
    const wrapper = setUp({
      marketingAudience: MARKETING_AUDIENCE.PL,
      courseOfferings: plCourseOfferings,
    });
    expect(wrapper.find('table').length).toBe(3);
    expect(wrapper.contains(i18n.professionalLearning())).toBe(true);
  });

  it('renders one header in each of the first two columns', () => {
    const wrapper = setUp({
      marketingAudience: MARKETING_AUDIENCE.PL,
      courseOfferings: plCourseOfferings,
    });
    expect(wrapper.find('table').length).toBe(3);
    // First header displays in table 0
    expect(
      wrapper
        .find('table')
        .at(0)
        .contains('6–12 Virtual Academic Year Workshops')
    ).toBe(true);
    // Second header displays in table 1
    expect(wrapper.find('table').at(1).contains('Self-Paced')).toBe(true);
  });
});
