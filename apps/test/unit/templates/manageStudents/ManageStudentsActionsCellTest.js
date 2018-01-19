import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedManageStudentActionsCell as ManageStudentsActionsCell} from '@cdo/apps/templates/manageStudents/ManageStudentsActionsCell';

const DEFAULT_PROPS = {
  id: 2,
  sectionId: 10,
  isEditing: false,
  startEditingStudent: ()=>{},
  cancelEditingStudent: ()=>{},
  removeStudent: ()=>{},
};

describe('ManageStudentsActionsCell', () => {
  it('renders the edit and remove option by default', () => {
    const wrapper = shallow(
        <ManageStudentsActionsCell
          {...DEFAULT_PROPS}
        />
    );
    expect(wrapper).to.contain("Remove student");
    expect(wrapper).to.contain("Edit");
  });
});
