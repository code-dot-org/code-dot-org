import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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

  it('renders teacher resource dropdown', () => {
    const wrapper = shallow(<CourseOverviewTopRow {...defaultProps} />);
    expect(wrapper.find('ResourcesDropdown').length).toEqual(1);
    expect(wrapper.find('ResourcesDropdown').props().resources.length).toEqual(
      3
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[0].name).toEqual(
      'Curriculum'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[0].url).toEqual(
      '/link/to/curriculum'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[1].name).toEqual(
      'Professional Learning'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[1].url).toEqual(
      '/link/to/professional/learning'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[2].name).toEqual(
      'Teacher Forum'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[2].url).toEqual(
      'https://forum.code.org/'
    );
  });

  it('doesnt render teacher resource dropdown for students', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow
        {...defaultProps}
        teacherResources={[
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
        ]}
        isInstructor={false}
      />
    );
    expect(wrapper.find('ResourcesDropdown').length).toEqual(0);
  });

  it('renders student resource dropdown for students', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow
        {...defaultProps}
        studentResources={[
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
        ]}
        isInstructor={false}
      />
    );
    expect(wrapper.find('ResourcesDropdown').length).toEqual(1);
    expect(wrapper.find('ResourcesDropdown').props().resources.length).toEqual(
      3
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[0].name).toEqual(
      'Curriculum'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[0].url).toEqual(
      '/link/to/curriculum'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[1].name).toEqual(
      'Professional Learning'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[1].url).toEqual(
      '/link/to/professional/learning'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[2].name).toEqual(
      'Teacher Forum'
    );
    expect(wrapper.find('ResourcesDropdown').props().resources[2].url).toEqual(
      'https://forum.code.org/'
    );
  });
});
