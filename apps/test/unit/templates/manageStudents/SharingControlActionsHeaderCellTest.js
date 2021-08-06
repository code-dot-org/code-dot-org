import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import {combineReducers, createStore} from 'redux';
import reducer from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import SharingControlActionsHeaderCell from '@cdo/apps/templates/manageStudents/SharingControlActionsHeaderCell';
import {allowConsoleWarnings} from '../../../util/throwOnConsole';

describe('SharingControlActionsHeaderCell', () => {
  allowConsoleWarnings();

  const store = createStore(combineReducers({manageStudents: reducer}));

  it('renders enable all, disable all and learn more options', () => {
    const wrapper = mount(
      <Provider store={store}>
        <SharingControlActionsHeaderCell />
      </Provider>
    );
    const enableAllString = i18n.projectSharingEnableAll();
    const disableAllString = i18n.projectSharingDisableAll();
    const learnMoreString = i18n.learnMore();
    expect(wrapper.find(enableAllString).exists);
    expect(wrapper.find(disableAllString).exists);
    expect(wrapper.find(learnMoreString).exists);
  });
});
