import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import CourseOverviewTopRow from '@cdo/apps/templates/courseOverview/CourseOverviewTopRow';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';

const defaultProps = {
  sectionsForDropdown: [],
  id: 30,
  title: 'Computer Science Principles',
  teacherResources: [],
  showAssignButton: true,
  useMigratedResources: false
};

describe('CourseOverviewTopRow', () => {
  it('contains a SectionAssigner', () => {
    const wrapper = shallow(<CourseOverviewTopRow {...defaultProps} />);
    assert.equal(wrapper.find('Connect(SectionAssigner)').length, 1);
  });

  it('renders unmigrated teacher resource dropdown', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow
        {...defaultProps}
        teacherResources={[
          {
            type: ResourceType.curriculum,
            link: '/link/to/curriculum'
          },
          {
            type: ResourceType.professionalLearning,
            link: '/link/to/professional/learning'
          },
          {
            type: ResourceType.teacherForum,
            link: 'https://forum.code.org/'
          }
        ]}
      />
    );
    assert.equal(wrapper.find('TeacherResourcesDropdown').length, 1);
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().teacherResources[0].type,
      ResourceType.curriculum
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().teacherResources[0].link,
      '/link/to/curriculum'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().teacherResources[1].type,
      ResourceType.professionalLearning
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().teacherResources[1].link,
      '/link/to/professional/learning'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().teacherResources[2].type,
      ResourceType.teacherForum
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().teacherResources[2].link,
      'https://forum.code.org/'
    );
  });

  it('renders migrated teacher resource dropdown', () => {
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
      />
    );
    assert.equal(wrapper.find('TeacherResourcesDropdown').length, 1);
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().migratedTeacherResources
        .length,
      3
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props()
        .migratedTeacherResources[0].name,
      'Curriculum'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props()
        .migratedTeacherResources[0].url,
      '/link/to/curriculum'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props()
        .migratedTeacherResources[1].name,
      'Professional Learning'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props()
        .migratedTeacherResources[1].url,
      '/link/to/professional/learning'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props()
        .migratedTeacherResources[2].name,
      'Teacher Forum'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props()
        .migratedTeacherResources[2].url,
      'https://forum.code.org/'
    );
  });
});
