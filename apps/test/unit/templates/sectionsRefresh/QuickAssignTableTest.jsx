import {fireEvent, render, screen} from '@testing-library/react';
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

const setUpRtl = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return render(<QuickAssignTable {...props} />);
};

describe('QuickAssignTable', () => {
  it('renders Course as the first and only table/column header', () => {
    setUpRtl({
      marketingAudience: MARKETING_AUDIENCE.ELEMENTARY,
      courseOfferings: elementarySchoolCourseOffering,
    });
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBe(1);
    expect(screen.getByText(i18n.courses())).toBeInTheDocument();
  });

  it('renders two tables with correct headers', () => {
    setUpRtl();
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBe(2);
    expect(screen.getByText(i18n.courses())).toBeInTheDocument();
    expect(screen.getByText(i18n.standaloneUnits())).toBeInTheDocument();
  });

  it('calls updateSection when a radio button is pressed', () => {
    const updateSpy = jest.fn();
    setUpRtl({updateCourse: updateSpy});

    const radio = screen.getByLabelText('Computer Science A');
    expect(updateSpy).not.toHaveBeenCalled();
    fireEvent.click(radio);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('correctly falls back when a course has no recommended version', () => {
    const updateSpy = jest.fn();
    setUpRtl({
      updateCourse: updateSpy,
      courseOfferings: noRecommendedVersionsOfferings,
    });

    const radio = screen.getByLabelText('Computer Science A');
    expect(updateSpy).not.toHaveBeenCalled();
    fireEvent.click(radio);
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
    render(<QuickAssignTable {...props} />);
    const radio = screen.getByLabelText('Computer Science A');
    expect(radio).toBeChecked();
  });

  it('shows TA icon when course offering has TA enabled', () => {
    setUpRtl();
    const taIcon = screen.getByAltText('AI Teaching Assistant available');
    expect(taIcon.previousSibling).toHaveTextContent(
      'Computer Science Discoveries'
    );
  });
});
