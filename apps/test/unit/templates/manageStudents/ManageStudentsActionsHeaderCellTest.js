import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedManageStudentsActionsHeaderCell as ManageStudentsActionsHeaderCell} from '@cdo/apps/templates/manageStudents/ManageStudentsActionsHeaderCell';
import i18n from '@cdo/locale';



describe('ManageStudentsActionsCell', () => {
  it('renders the edit all option', () => {
    const wrapper = shallow(<ManageStudentsActionsHeaderCell />);
    const editAllString = i18n.editAll();
    expect(wrapper).toEqual(expect.arrayContaining([editAllString]));
  });

  it('renders the control project sharing option if the share column is hidden', () => {
    const wrapper = shallow(
      <ManageStudentsActionsHeaderCell isShareColumnVisible={false} />
    );
    const controlProjectSharing = i18n.controlProjectSharing();
    expect(wrapper).toEqual(expect.arrayContaining([controlProjectSharing]));
  });

  it('renders the hide project sharing option if the share column is visible', () => {
    const wrapper = shallow(
      <ManageStudentsActionsHeaderCell isShareColumnVisible={true} />
    );
    const hideProjectSharing = i18n.hideProjectSharingColumn();
    expect(wrapper).toEqual(expect.arrayContaining([hideProjectSharing]));
  });
});
