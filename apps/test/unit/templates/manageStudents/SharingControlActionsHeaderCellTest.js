import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import SharingControlActionsHeaderCell from '@cdo/apps/templates/manageStudents/SharingControlActionsHeaderCell';

describe('SharingControlActionsHeaderCell', () => {
  it('renders enable all, disable all and learn more options', () => {
    const wrapper = shallow(
        <SharingControlActionsHeaderCell/>
    );
    const enableAllString = i18n.projectSharingEnableAll();
    const disableAllString = i18n.projectSharingDisableAll();
    const learnMoreString = i18n.learnMore();
    expect(wrapper).to.contain(enableAllString);
    expect(wrapper).to.contain(disableAllString);
    expect(wrapper).to.contain(learnMoreString);
  });
});
