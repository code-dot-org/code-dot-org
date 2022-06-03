import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import CourseOverviewTopRow from '@cdo/apps/templates/courseOverview/CourseOverviewTopRow';

const defaultProps = {
  sectionsForDropdown: [],
  id: 30,
  title: 'Computer Science Principles',
  migratedTeacherResources: [
    {
      key: 'key1',
      name: 'Curriculum',
      url: '/link/to/curriculum'
    },
    {
      key: 'key2',
      name: 'Professional Learning',
      url: '/link/to/professional/learning'
    },
    {
      key: 'key2',
      name: 'Teacher Forum',
      url: 'https://forum.code.org/'
    }
  ],
  studentResources: [],
  showAssignButton: true,
  isInstructor: true
};

describe('CourseOverviewTopRow', () => {
  it('contains a SectionAssigner for a teacher', () => {
    const wrapper = shallow(<CourseOverviewTopRow {...defaultProps} />);
    assert.equal(wrapper.find('Connect(SectionAssigner)').length, 1);
  });

  it('does not contain a SectionAssigner for a student', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow {...defaultProps} isInstructor={false} />
    );
    assert.equal(wrapper.find('Connect(SectionAssigner)').length, 0);
  });

  it('renders migrated teacher resource dropdown', () => {
    const wrapper = shallow(<CourseOverviewTopRow {...defaultProps} />);
    assert.equal(wrapper.find('ResourcesDropdown').length, 1);
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources.length,
      3
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[0].name,
      'Curriculum'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[0].url,
      '/link/to/curriculum'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[1].name,
      'Professional Learning'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[1].url,
      '/link/to/professional/learning'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[2].name,
      'Teacher Forum'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[2].url,
      'https://forum.code.org/'
    );
  });

  it('doesnt render migrated teacher resource dropdown for students', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow
        {...defaultProps}
        migratedTeacherResources={[
          {
            key: 'key1',
            name: 'Curriculum',
            url: '/link/to/curriculum'
          },
          {
            key: 'key2',
            name: 'Professional Learning',
            url: '/link/to/professional/learning'
          },
          {
            key: 'key2',
            name: 'Teacher Forum',
            url: 'https://forum.code.org/'
          }
        ]}
        useMigratedResources
        isInstructor={false}
      />
    );
    assert.equal(wrapper.find('ResourcesDropdown').length, 0);
  });

  it('renders student resource dropdown for students', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow
        {...defaultProps}
        studentResources={[
          {
            key: 'key1',
            name: 'Curriculum',
            url: '/link/to/curriculum'
          },
          {
            key: 'key2',
            name: 'Professional Learning',
            url: '/link/to/professional/learning'
          },
          {
            key: 'key2',
            name: 'Teacher Forum',
            url: 'https://forum.code.org/'
          }
        ]}
        useMigratedResources
        isInstructor={false}
      />
    );
    assert.equal(wrapper.find('ResourcesDropdown').length, 1);
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources.length,
      3
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[0].name,
      'Curriculum'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[0].url,
      '/link/to/curriculum'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[1].name,
      'Professional Learning'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[1].url,
      '/link/to/professional/learning'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[2].name,
      'Teacher Forum'
    );
    assert.equal(
      wrapper.find('ResourcesDropdown').props().migratedResources[2].url,
      'https://forum.code.org/'
    );
  });
});
