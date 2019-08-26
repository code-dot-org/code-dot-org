import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedManageStudentActionsCell as ManageStudentsActionsCell} from '@cdo/apps/templates/manageStudents/ManageStudentsActionsCell';

const DEFAULT_PROPS = {
  id: 2,
  sectionId: 10,
  isEditing: false,
  studentName: 'Clark Kent',
  startEditingStudent: () => {},
  cancelEditingStudent: () => {},
  removeStudent: () => {},
  canEdit: true
};

describe('ManageStudentsActionsCell', () => {
  it('renders the edit and remove option when a picture login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'picture'} />
    );
    expect(wrapper).to.contain('Remove student');
    expect(wrapper).to.contain('Edit');
  });

  it('renders the edit and remove option when a word login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'word'} />
    );
    expect(wrapper).to.contain('Remove student');
    expect(wrapper).to.contain('Edit');
  });

  it('renders the edit and remove option when a email login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'email'} />
    );
    expect(wrapper).to.contain('Remove student');
    expect(wrapper).to.contain('Edit');
  });

  it('renders the edit option when a clever login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'clever'} />
    );
    expect(wrapper).to.contain('Edit');
  });

  it('renders the edit option when a google login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'google'} />
    );
    expect(wrapper).to.contain('Edit');
  });

  it('does not render the edit option when canEdit is false', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} canEdit={false} />
    );
    expect(wrapper).not.to.contain('Edit');
  });
});
