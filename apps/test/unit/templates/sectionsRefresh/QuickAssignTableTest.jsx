import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {MARKETING_AUDIENCE} from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';
import QuickAssignTable from '@cdo/apps/templates/sectionsRefresh/QuickAssignTable';
import i18n from '@cdo/locale';

import {
  elementarySchoolCourseOffering,
  highSchoolCourseOfferings,
  noRecommendedVersionsOfferings,
} from './CourseOfferingsTestData';

const DEFAULT_PROPS = {
  marketingAudience: MARKETING_AUDIENCE.HIGH,
  courseOfferings: highSchoolCourseOfferings,
  setSelectedCourseOffering: () => {},
  updateCourse: () => {},
  sectionCourse: {},
};

const setUpShallow = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<QuickAssignTable {...props} />);
};

const setUpMount = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<QuickAssignTable {...props} />);
};

describe('QuickAssignTable', () => {
  it('renders Course as the first and only table/column header', () => {
    const wrapper = setUpShallow({
      marketingAudience: MARKETING_AUDIENCE.ELEMENTARY,
      courseOfferings: elementarySchoolCourseOffering,
    });

    expect(wrapper.find('table').length).toBe(1);
    expect(wrapper.contains(i18n.courses())).toBe(true);
  });

  it('renders two tables with correct headers', () => {
    const wrapper = setUpShallow();
    expect(wrapper.find('table').length).toBe(2);
    expect(wrapper.contains(i18n.courses())).toBe(true);
    expect(wrapper.contains(i18n.standaloneUnits())).toBe(true);
  });

  it('calls updateSection when a radio button is pressed', () => {
    const updateSpy = jest.fn();
    const wrapper = setUpMount({updateCourse: updateSpy});

    const radio = wrapper.find("input[value='Computer Science A']");
    expect(updateSpy).not.toHaveBeenCalled();
    radio.simulate('change', {
      target: {value: 'Computer Science A', checked: true},
    });
    expect(updateSpy).toHaveBeenCalled();
  });

  it('correctly falls back when a course has no recommended version', () => {
    const updateSpy = jest.fn();
    const wrapper = setUpMount({
      updateCourse: updateSpy,
      courseOfferings: noRecommendedVersionsOfferings,
    });

    const radio = wrapper.find('input');
    expect(updateSpy).not.toHaveBeenCalled();
    radio.simulate('change', {
      target: {value: 'Computer Science A', checked: true},
    });
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({versionId: 373})
    );
  });

  it('automatically checks correct radio button if course is already assigned', () => {
    const props = {
      marketingAudience: MARKETING_AUDIENCE.HIGH,
      courseOfferings: highSchoolCourseOfferings,
      setSelectedCourseOffering: () => {},
      updateCourse: () => {},
      sectionCourse: {displayName: 'Computer Science A', courseOfferingId: 73},
    };
    const wrapper = mount(<QuickAssignTable {...props} />);
    const radio = wrapper.find("input[value='Computer Science A']");
    expect(radio.props().checked).toBe(true);
  });
});
