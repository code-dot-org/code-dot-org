import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import {UnconnectedManageStudentAgeCell as ManageStudentAgeCell} from '@cdo/apps/templates/manageStudents/ManageStudentsAgeCell';

const DEFAULT_PROPS = {
  id: 2,
  isEditing: false,
  editedValue: 13,
};

describe('ManageStudentAgeCell', () => {

  let editStudent, setSharingDefault;

  beforeEach(() => {
    editStudent = sinon.spy();
    setSharingDefault = sinon.spy();
  });

  it('renders the age set for the student, when not editing', () => {
    const wrapper = shallow(
      <ManageStudentAgeCell
        {...DEFAULT_PROPS}
        age={10}
        editStudent={editStudent}
        setSharingDefault={setSharingDefault}
      />
    );
    expect(wrapper).to.contain(10);
    expect(wrapper.find('select').exists()).to.be.false;
  });

  it('renders age select dropdown, when editing', () => {
    const wrapper = shallow(
      <ManageStudentAgeCell
        {...DEFAULT_PROPS}
        age={10}
        isEditing={true}
        editStudent={editStudent}
        setSharingDefault={setSharingDefault}
      />
    );
    expect(wrapper.find('select').exists());
    expect(wrapper.find('option')).to.have.length(19);
  });

  it('changing the age from one value to another calls editStudent', () => {
    const wrapper = mount(
      <ManageStudentAgeCell
        {...DEFAULT_PROPS}
        age={10}
        isEditing={true}
        editStudent={editStudent}
        setSharingDefault={setSharingDefault}
      />
    );
    expect(editStudent.callCount).to.equal(0);
    expect(setSharingDefault.callCount).to.equal(0);
    wrapper.find('select').simulate('change', {target: { value : '21+'}});
    expect(editStudent.callCount).to.equal(1);
    // setSharing default should not be called because the age was changed from
    // 10 to  21+ and we only call setSharingDefault if initial age is ''.
    expect(setSharingDefault.callCount).to.equal(0);
  });

  it('selecting an initial age from the dropdown calls editStudent and setSharingDefault', () => {
    const wrapper = mount(
      <ManageStudentAgeCell
        {...DEFAULT_PROPS}
        age={''}
        isEditing={true}
        editStudent={editStudent}
        setSharingDefault={setSharingDefault}
        shareColumnExperimentEnabled={true}
      />
    );
    expect(editStudent.callCount).to.equal(0);
    expect(setSharingDefault.callCount).to.equal(0);
    wrapper.find('select').simulate('change', {target: { value : 13}});
    expect(editStudent.callCount).to.equal(1);
    // setSharing default should be called because initial age was ''.
    expect(setSharingDefault.callCount).to.equal(1);
  });
});
