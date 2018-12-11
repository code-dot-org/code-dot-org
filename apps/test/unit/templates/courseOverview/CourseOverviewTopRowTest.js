import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import CourseOverviewTopRow from '@cdo/apps/templates/courseOverview/CourseOverviewTopRow';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';

const defaultProps = {
  sectionsInfo: [],
  id: 30,
  title: 'Computer Science Principles',
  resources: [{
    type: ResourceType.curriculum,
    link: '/link/to/curriculum',
  }, {
    type: ResourceType.professionalLearning,
    link: '/link/to/professional/learning',
  }, {
    type: ResourceType.teacherForum,
    link: 'https://forum.code.org/',
  }]
};

describe('CourseOverviewTopRow', () => {
  it('contains an AssignToSection button', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('Connect(AssignToSection)').length, 1);
  });

  it('has a button for each resource', () => {
    const wrapper = shallow(
      <CourseOverviewTopRow
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('Button').length, 3);
    assert.equal(wrapper.find('Button').at(0).props().text, 'Curriculum');
    assert.equal(wrapper.find('Button').at(1).props().text, 'Professional Learning');
    assert.equal(wrapper.find('Button').at(2).props().text, 'Teacher Forum');

    assert.equal(wrapper.find('Button').at(0).props().href, '/link/to/curriculum');
    assert.equal(wrapper.find('Button').at(1).props().href, '/link/to/professional/learning');
    assert.equal(wrapper.find('Button').at(2).props().href, 'https://forum.code.org/');
  });
});
