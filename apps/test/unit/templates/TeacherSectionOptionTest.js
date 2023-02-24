import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';
import sinon from 'sinon';
import TeacherSectionOption from '@cdo/apps/templates/TeacherSectionOption';

describe('TeacherSectionOption', () => {
  const assignedCourseANDUnitSection = fakeTeacherSectionsForDropdown[5];
  const changeFunction = sinon.fake();

  const defaultProps = {
    section: assignedCourseANDUnitSection,
    onChange: changeFunction,
    isChecked: true
  };
  const setUp = (overrideProps = {}) => {
    const props = {...defaultProps, ...overrideProps};
    return shallow(<TeacherSectionOption {...props} />);
  };

  it('renders checked checkbox with name of section if isChecked is true', () => {
    const wrapper = setUp();

    expect(wrapper.find('input')).to.exist;
    expect(wrapper.find('label')).to.exist;
    expect(wrapper.find('input').props().checked).to.be.true;
    expect(
      wrapper
        .find('label')
        .text()
        .includes(wrapper.instance().props.section.name)
    ).to.be.true;
  });

  it('renders unchecked checkbox with name of section if isChecked is false', () => {
    const wrapper = setUp({isChecked: false});

    expect(wrapper.find('input')).to.exist;
    expect(wrapper.find('label')).to.exist;
    expect(wrapper.find('input').props().checked).to.be.false;
    expect(
      wrapper
        .find('label')
        .text()
        .includes(wrapper.instance().props.section.name)
    ).to.be.true;
  });

  it('calls the changeFunction when changed', () => {
    const wrapper = setUp();

    expect(wrapper.find('input').props().checked).to.be.true;
    wrapper.find('input').simulate('change');
    expect(changeFunction).to.have.been.calledOnce;
  });
});
