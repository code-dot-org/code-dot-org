import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Checkbox} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {UnconnectedManageStudentsSharingCell as ManageStudentsSharingCell} from '@cdo/apps/templates/manageStudents/ManageStudentsSharingCell';



describe('ManageStudentsSharingCell', () => {
  it('renders a checked Checkbox if editing and can share', () => {
    const wrapper = shallow(
      <ManageStudentsSharingCell
        id={123}
        isEditing={true}
        checked={true}
        editedValue={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <input type="checkbox" checked={true} />
    );
  });

  it('renders an unchecked Checkbox if editing and can not share', () => {
    const wrapper = shallow(
      <ManageStudentsSharingCell
        id={123}
        isEditing={true}
        checked={false}
        editedValue={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <input type="checkbox" checked={false} />
    );
  });

  it('renders nothing if not editing and can not share', () => {
    const wrapper = shallow(
      <ManageStudentsSharingCell
        id={123}
        isEditing={false}
        checked={false}
        editedValue={true}
      />
    );
    expect(wrapper.containsMatchingElement(<Checkbox />)).toBe(false);
    expect(
      wrapper.containsMatchingElement(<FontAwesome icon="check" />)
    ).toBe(false);
  });

  it('renders a FontAwesome checkmark if not editing and can share', () => {
    const wrapper = shallow(
      <ManageStudentsSharingCell
        id={123}
        isEditing={false}
        checked={true}
        editedValue={true}
      />
    );
    expect(wrapper).to.containMatchingElement(<FontAwesome icon="check" />);
  });
});
