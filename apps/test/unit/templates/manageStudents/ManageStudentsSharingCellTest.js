import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedManageStudentsSharingCell as ManageStudentsSharingCell} from '@cdo/apps/templates/manageStudents/ManageStudentsSharingCell';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

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
    const checkbox = wrapper.find(Checkbox);
    expect(checkbox.exists()).to.equal(true);
    expect(checkbox.prop('checked')).to.equal(true);
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
    const checkbox = wrapper.find(Checkbox);
    expect(checkbox.exists()).to.equal(true);
    expect(checkbox.prop('checked')).to.equal(false);
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
    expect(wrapper.find(Checkbox).exists()).to.equal(false);
    expect(wrapper.find(FontAwesomeV6Icon).exists()).to.equal(false);
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
    const icon = wrapper.find(FontAwesomeV6Icon);
    expect(icon.exists()).to.equal(true);
    expect(icon.prop('iconName')).to.equal('check');
  });
});
