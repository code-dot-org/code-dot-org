import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import sinon from 'sinon';
import {UnconnectedManageStudentFamilyNameCell as ManageStudentFamilyNameCell} from '@cdo/apps/templates/manageStudents/ManageStudentsFamilyNameCell';

const DEFAULT_PROPS = {
  id: 2,
  isEditing: false,
  editedValue: 'EditedFamName',
};

describe('ManageStudentFamilyNameCell', () => {
  let editStudent;

  beforeEach(() => {
    editStudent = sinon.spy();
  });

  it('renders the family name set for the student, when not editing', () => {
    const wrapper = shallow(
      <ManageStudentFamilyNameCell
        {...DEFAULT_PROPS}
        familyName={'FamName'}
        editStudent={editStudent}
      />
    );
    expect(wrapper).to.contain('FamName');
    expect(wrapper.find('input').exists()).to.be.false;
  });

  it('renders family name input, when editing', () => {
    const wrapper = shallow(
      <ManageStudentFamilyNameCell
        {...DEFAULT_PROPS}
        familyName={'FamName'}
        isEditing={true}
        editStudent={editStudent}
      />
    );
    expect(wrapper.find('input').exists());
  });

  it('renders disabled family name input when inputDisabled is true', () => {
    const wrapper = shallow(
      <ManageStudentFamilyNameCell
        {...DEFAULT_PROPS}
        familyName={'FamName'}
        isEditing={true}
        inputDisabled={true}
        editStudent={editStudent}
      />
    );
    const input = wrapper.find('input');
    expect(input.exists());
    expect(input.prop('disabled')).to.be.true;
  });

  it('changing the family name from one value to another calls editStudent', () => {
    const wrapper = mount(
      <ManageStudentFamilyNameCell
        {...DEFAULT_PROPS}
        familyName={'FamName'}
        isEditing={true}
        editStudent={editStudent}
      />
    );
    expect(editStudent.callCount).to.equal(0);
    wrapper.find('input').simulate('change', {target: {value: 'TestNewName'}});
    expect(editStudent.callCount).to.equal(1);
    expect(
      editStudent.calledWith(DEFAULT_PROPS.id, {familyName: 'TestNewName'})
    ).to.be.true;
  });

  it('changing the family name from a set value to empty calls editStudent with null', () => {
    const wrapper = mount(
      <ManageStudentFamilyNameCell
        {...DEFAULT_PROPS}
        familyName={'FamName'}
        isEditing={true}
        editStudent={editStudent}
      />
    );
    expect(editStudent.callCount).to.equal(0);
    wrapper.find('input').simulate('change', {target: {value: ''}});
    expect(editStudent.callCount).to.equal(1);
    expect(editStudent.calledWith(DEFAULT_PROPS.id, {familyName: null})).to.be
      .true;
  });
});
