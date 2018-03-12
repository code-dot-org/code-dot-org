import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import ManageStudentsActionsHeaderCell from '@cdo/apps/templates/manageStudents/ManageStudentsActionsHeaderCell';

describe('ManageStudentsActionsCell', () => {
  it('renders the edit all and control project sharing options', () => {
    const wrapper = shallow(
        <ManageStudentsActionsHeaderCell/>
    );
    const editAllString = i18n.editAll();
    const controlProjectSharing = i18n.controlProjectSharing();
    expect(wrapper).to.contain(editAllString);
    expect(wrapper).to.contain(controlProjectSharing);
  });
});
