import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

const defaultProps = {
  title: 'Computer Science Principles',
  id: 30,
  descriptionStudent: 'Desc here',
  descriptionTeacher: 'Desc here',
  sectionsInfo: [],
  teacherResources: [],
  isTeacher: true,
  viewAs: ViewType.Teacher,
  scripts: [{
    course_id: 30,
    id: 112,
    title: 'CSP Unit 1',
    name: 'csp1',
    description: 'desc'
  }, {
    course_id: 30,
    id: 113,
    title: 'CSP Unit 2',
    name: 'csp2',
    description: 'desc'
  }]
};

describe('CourseOverview', () => {
  it('renders a top row for teachers', () => {
    const wrapper = shallow(
      <CourseOverview
        {...defaultProps}
        isTeacher={true}
      />
    );
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 1);
  });

  it('renders no top row for students', () => {
    const wrapper = shallow(
      <CourseOverview
        {...defaultProps}
        isTeacher={false}
      />
    );
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 0);
  });

  it('renders a CourseScript for each script', () => {
    const wrapper = shallow(
      <CourseOverview
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('Connect(CourseScript)').length, 2);
  });
});
