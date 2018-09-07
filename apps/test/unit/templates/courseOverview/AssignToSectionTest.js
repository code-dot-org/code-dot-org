import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow, mount } from 'enzyme';
import {UnconnectedAssignToSection as AssignToSection} from '@cdo/apps/templates/courseOverview/AssignToSection';
import Immutable from 'immutable';

const defaultProps = {
  courseId: 30,
  assignmentName: 'Computer Science Principles',
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
  ],
  updateHiddenScript: () => {},
};

describe('AssignToSection', () => {
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

  it('can create a new section with a courseId', () => {
    const wrapper = mount(
      <AssignToSection {...defaultProps}/>
    );
    wrapper.find('Button').simulate('click');
    const newSectionLink = wrapper.find('a').at(0);
    assert.strictEqual(newSectionLink.props().href,
      '/home?courseId=30');
    assert.strictEqual(newSectionLink.text(), 'New section...');
  });

  it('can create a new section with a courseId and scriptId', () => {
    const wrapper = mount(
      <AssignToSection
        {...defaultProps}
        scriptId={112}
      />
    );
    wrapper.find('Button').simulate('click');
    const newSectionLink = wrapper.find('a').at(0);
    assert.strictEqual(newSectionLink.props().href,
      '/home?courseId=30&scriptId=112');
    assert.strictEqual(newSectionLink.text(), 'New section...');
  });

  it('shows a confirmation dialog when clicking a section', () => {
    const wrapper = mount(
      <AssignToSection {...defaultProps}/>
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
    const confirm = wrapper.find('ConfirmAssignment');
    assert.equal(confirm.props().assignmentName, 'Computer Science Principles');
    assert.equal(confirm.props().sectionName, 'brent_section');
    assert.equal(confirm.find('Button').at(1).text(), 'Assign');
  });

  it('shows a warning when clicking a hidden section', () => {
    const scriptId = 99;
    const sectionId = defaultProps.sectionsInfo[0].id;
    const hiddenStageState = Immutable.fromJS({
      scriptsBySection: { [sectionId]: {[scriptId]: true} }
    });

    const props = {
      ...defaultProps,
      courseId: undefined,
      scriptId,
      hiddenStageState,
    };
    const wrapper = mount(
      <AssignToSection {...props}/>
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
    const confirm = wrapper.find('ConfirmAssignment');
    assert.equal(confirm.props().assignmentName, 'Computer Science Principles');
    assert.equal(confirm.props().sectionName, 'brent_section');
    assert.equal(confirm.find('Button').at(1).text(), 'Unhide unit and assign');
  });

  it('shows an error dialog when we have an error', () => {
    const wrapper = shallow(
      <AssignToSection {...defaultProps}/>
    );
    wrapper.setState({errorString: 'Error'});
    assert.equal(wrapper.find('BaseDialog').length, 1);
    assert.equal(wrapper.find('BaseDialog').childAt(0).text(), 'Error');
  });
});
