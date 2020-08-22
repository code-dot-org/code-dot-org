import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import CourseOverviewTopRow from '@cdo/apps/templates/courseOverview/CourseOverviewTopRow';

const defaultProps = {
  sectionsForDropdown: [],
  id: 30,
  title: 'Computer Science Principles',
  resources: [
    {
      type: 'Curriculum',
      link: '/link/to/curriculum'
    },
    {
      type: 'Professional Learning',
      link: '/link/to/professional/learning'
    },
    {
      type: 'Teacher Forum',
      link: 'https://forum.code.org/'
    }
  ],
  showAssignButton: true
};

describe('CourseOverviewTopRow', () => {
  it('contains a SectionAssigner', () => {
    const wrapper = shallow(<CourseOverviewTopRow {...defaultProps} />);
    assert.equal(wrapper.find('Connect(SectionAssigner)').length, 1);
  });

  it('renders teacher resource dropdown', () => {
    const wrapper = shallow(<CourseOverviewTopRow {...defaultProps} />);
    assert.equal(wrapper.find('TeacherResourcesDropdown').length, 1);
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().resources[0].type,
      'Curriculum'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().resources[0].link,
      '/link/to/curriculum'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().resources[1].type,
      'Professional Learning'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().resources[1].link,
      '/link/to/professional/learning'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().resources[2].type,
      'Teacher Forum'
    );
    assert.equal(
      wrapper.find('TeacherResourcesDropdown').props().resources[2].link,
      'https://forum.code.org/'
    );
  });
});
