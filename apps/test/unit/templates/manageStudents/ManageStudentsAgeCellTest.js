import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedManageStudentAgeCell as ManageStudentAgeCell} from '@cdo/apps/templates/manageStudents/ManageStudentsAgeCell';



const DEFAULT_PROPS = {
  id: 2,
  isEditing: false,
  editedValue: 13,
};

describe('ManageStudentAgeCell', () => {
  let editStudent, setSharingDefault;

  beforeEach(() => {
    editStudent = jest.fn();
    setSharingDefault = jest.fn();
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
    expect(wrapper).toContain(10);
    expect(wrapper.find('select').exists()).toBe(false);
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
    expect(wrapper.find('option')).toHaveLength(19);
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
    expect(editStudent).toHaveBeenCalledTimes(0);
    expect(setSharingDefault).toHaveBeenCalledTimes(0);
    wrapper.find('select').simulate('change', {target: {value: '21+'}});
    expect(editStudent).toHaveBeenCalledTimes(1);
    // setSharing default should not be called because the age was changed from
    // 10 to  21+ and we only call setSharingDefault if initial age is ''.
    expect(setSharingDefault).toHaveBeenCalledTimes(0);
  });

  it('selecting an initial age from the dropdown calls editStudent and setSharingDefault', () => {
    const wrapper = mount(
      <ManageStudentAgeCell
        {...DEFAULT_PROPS}
        age={''}
        isEditing={true}
        editStudent={editStudent}
        setSharingDefault={setSharingDefault}
      />
    );
    expect(editStudent).toHaveBeenCalledTimes(0);
    expect(setSharingDefault).toHaveBeenCalledTimes(0);
    wrapper.find('select').simulate('change', {target: {value: 13}});
    expect(editStudent).toHaveBeenCalledTimes(1);
    // setSharing default should be called because initial age was ''.
    expect(setSharingDefault).toHaveBeenCalledTimes(1);
  });
});
