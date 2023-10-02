import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import ManageStudentFamilyNameCell from '@cdo/apps/templates/manageStudents/ManageStudentsFamilyNameCell';

const DEFAULT_PROPS = {
  id: 2,
  isEditing: false,
  editedValue: 'EditedFamName',
};

describe('ManageStudentFamilyNameCell', () => {
  it('renders the family name set for the student, when not editing', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <ManageStudentFamilyNameCell
          {...DEFAULT_PROPS}
          familyName={'FamName'}
        />
      </Provider>
    );
    expect(wrapper).to.contain('FamName');
    expect(wrapper.find('input').exists()).to.be.false;
  });

  it('renders family name input, when editing', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <ManageStudentFamilyNameCell
          {...DEFAULT_PROPS}
          familyName={'FamName'}
          isEditing={true}
        />
      </Provider>
    );
    expect(wrapper.find('input').exists());
  });

  it('renders disabled family name input when inputDisabled is true', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <ManageStudentFamilyNameCell
          {...DEFAULT_PROPS}
          familyName={'FamName'}
          isEditing={true}
          inputDisabled={true}
        />
      </Provider>
    );
    const input = wrapper.find('input');
    expect(input.exists());
    expect(input.prop('disabled')).to.be.true;
  });
});
