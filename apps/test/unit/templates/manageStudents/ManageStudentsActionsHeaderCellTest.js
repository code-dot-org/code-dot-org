import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedManageStudentsActionsHeaderCell as ManageStudentsActionsHeaderCell} from '@cdo/apps/templates/manageStudents/ManageStudentsActionsHeaderCell';
import i18n from '@cdo/locale';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

function optionLabels(wrapper) {
  return wrapper
    .find(ActionDropdown)
    .prop('options')
    .map(opt => opt.label);
}

describe('ManageStudentsActionsCell', () => {
  it('renders the edit all option', () => {
    const wrapper = shallow(<ManageStudentsActionsHeaderCell />);
    expect(optionLabels(wrapper)).to.include(i18n.editAll());
  });

  it('renders the control project sharing option if the share column is hidden', () => {
    const wrapper = shallow(
      <ManageStudentsActionsHeaderCell isShareColumnVisible={false} />
    );
    expect(optionLabels(wrapper)).to.include(i18n.controlProjectSharing());
  });

  it('renders the hide project sharing option if the share column is visible', () => {
    const wrapper = shallow(
      <ManageStudentsActionsHeaderCell isShareColumnVisible={true} />
    );
    expect(optionLabels(wrapper)).to.include(i18n.hideProjectSharingColumn());
  });
});
