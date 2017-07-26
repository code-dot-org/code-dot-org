import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import AssignCourse from '@cdo/apps/templates/courseOverview/AssignCourse';

const defaultProps = {
  courseId: 30,
  courseName: 'Computer Science Principles',
  sectionsInfo: [
    {
      id: 11,
      name: "brent_section"
    },
    {
      id: 12,
      name: "section2"
    },
    {
      id: 307,
      name: "plc"
    },
    {
      id: 338,
      name: "section_with_course"
    }
  ]
};

describe('AssignCourse', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  let windowDashboard;
  before(() => {
    windowDashboard = window.dashboard;
    window.dashboard = {
      CODE_ORG_URL: '//test.code.org'
    };
  });

  after(() => {
    window.dashboard = windowDashboard;
  });

  it('is initially just a button', () => {
    const wrapper = shallow(
      <AssignCourse {...defaultProps}/>
    );
    assert.strictEqual(wrapper.children().length, 1);
    assert.strictEqual(wrapper.childAt(0).name(), 'Button');
  });

  it('shows a new section option when clicked', () => {
    const wrapper = shallow(
      <AssignCourse {...defaultProps}/>
    );
    wrapper.find('Button').simulate('click');
    const newSectionLink = wrapper.find('a').at(0);
    assert.strictEqual(newSectionLink.props().href,
      '//test.code.org/teacher-dashboard?newSection=30#/sections');
    assert.strictEqual(newSectionLink.text(), 'New section...');
  });

  it('shows each of the sections when clicked', () => {
    const wrapper = shallow(
      <AssignCourse {...defaultProps}/>
    );
    wrapper.find('Button').simulate('click');
    const sections = defaultProps.sectionsInfo;
    assert.strictEqual(wrapper.find('a').length, 1 + sections.length);
    sections.forEach((section, index) => {
      const link = wrapper.find('a').at(1 + index);
      assert.strictEqual(link.text(), section.name);
    });
  });

  it('shows a confirmation dialog when clicking a section', () => {
    const wrapper = shallow(
      <AssignCourse {...defaultProps}/>
    );
    wrapper.find('Button').simulate('click');
    const firstSection = wrapper.find('a').at(1);
    assert.equal(firstSection.props()['data-section-index'], 0);
    // Enzyme simulate doesn't set target for us automatically, so we fake one.
    const target = {
      getAttribute: () => 0
    };
    firstSection.simulate('click', {target});

    assert.strictEqual(wrapper.state().sectionIndexToAssign, 0);
    const confirm = wrapper.find('AssignCourseConfirm');
    assert(confirm.props().courseName, 'Computer Science Principles');
    assert(confirm.props().sectionName, 'brent_section');
  });

  it('shows an error dialog when we have an error', () => {
    const wrapper = shallow(
      <AssignCourse {...defaultProps}/>
    );
    wrapper.setState({errorString: 'Error'});
    assert(wrapper.find('BaseDialog').length, 1);
    assert(wrapper.find('BaseDialog').text(), 'Error');
  });
});
