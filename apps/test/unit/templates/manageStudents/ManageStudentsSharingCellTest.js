import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedManageStudentsSharingCell as ManageStudentsSharingCell} from '@cdo/apps/templates/manageStudents/ManageStudentsSharingCell';
import {Checkbox} from 'react-bootstrap';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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
    expect(wrapper.containsMatchingElement(<Checkbox />)).to.equal(false);
    expect(
      wrapper.containsMatchingElement(<FontAwesome icon="check" />)
    ).to.equal(false);
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
