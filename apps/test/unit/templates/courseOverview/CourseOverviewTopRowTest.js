import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import DCDO from '@cdo/apps/dcdo';
import CourseOverviewTopRow from '@cdo/apps/templates/courseOverview/CourseOverviewTopRow';

const defaultProps = {
  sectionsForDropdown: [],
  id: 30,
  title: 'Computer Science Principles',
  teacherResources: [
    {
      key: 'key1',
      name: 'Curriculum',
      url: '/link/to/curriculum',
    },
    {
      key: 'key2',
      name: 'Professional Learning',
      url: '/link/to/professional/learning',
    },
    {
      key: 'key2',
      name: 'Teacher Forum',
      url: 'https://forum.code.org/',
    },
  ],
  studentResources: [],
  showAssignButton: true,
  isInstructor: true,
};

describe('CourseOverviewTopRow', () => {
  it('contains a SectionAssigner for a teacher', () => {
    const wrapper = shallow(<CourseOverviewTopRow {...defaultProps} />);
    expect(wrapper.find('Connect(SectionAssigner)').length).toEqual(1);
  });

  it('does not contain a SectionAssigner for a student', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow {...defaultProps} isInstructor={false} />
    );
    expect(wrapper.find('Connect(SectionAssigner)').length).toEqual(0);
  });

  it('does not contain a SectionAssigner if showV2TeacherDashboard is true', () => {
    DCDO.set('teacher-local-nav-v2', true);
    const wrapper = shallow(
      <CourseOverviewTopRow {...defaultProps} isInstructor={false} />
    );
    expect(wrapper.find('Connect(SectionAssigner)').length).toEqual(0);
    DCDO.set('teacher-local-nav-v2', false);
  });
});
