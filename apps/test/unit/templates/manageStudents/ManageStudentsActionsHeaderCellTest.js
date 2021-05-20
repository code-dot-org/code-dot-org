import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import i18n from '@cdo/locale';
import {UnconnectedManageStudentsActionsHeaderCell as ManageStudentsActionsHeaderCell} from '@cdo/apps/templates/manageStudents/ManageStudentsActionsHeaderCell';

describe('ManageStudentsActionsCell', () => {
  it('renders the edit all option', () => {
    const wrapper = shallow(<ManageStudentsActionsHeaderCell />);
    const editAllString = i18n.editAll();
    expect(wrapper).to.contain(editAllString);
  });

  it('renders the control project sharing option if the share column is hidden', () => {
    const wrapper = shallow(
      <ManageStudentsActionsHeaderCell isShareColumnVisible={false} />
    );
    const controlProjectSharing = i18n.controlProjectSharing();
    expect(wrapper).to.contain(controlProjectSharing);
  });

  it('renders the hide project sharing option if the share column is visible', () => {
    const wrapper = shallow(
      <ManageStudentsActionsHeaderCell isShareColumnVisible={true} />
    );
    const hideProjectSharing = i18n.hideProjectSharingColumn();
    expect(wrapper).to.contain(hideProjectSharing);
  });
});
