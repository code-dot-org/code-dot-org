import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';

import ManageLinkedAccounts from './ManageLinkedAccounts';
import manageLinkedAccounts, {
  convertServerAuthOptions,
  initializeState,
} from './manageLinkedAccountsRedux';

export default class ManageLinkedAccountsController {
  constructor(
    mountPoint,
    authenticationOptions,
    userHasPassword,
    isGoogleClassroomStudent,
    isCleverStudent,
    personalAccountLinkingEnabled
  ) {
    registerReducers({manageLinkedAccounts});
    const store = getStore();
    authenticationOptions = convertServerAuthOptions(authenticationOptions);
    store.dispatch(
      initializeState({
        authenticationOptions,
        userHasPassword,
        isGoogleClassroomStudent,
        isCleverStudent,
        personalAccountLinkingEnabled,
      })
    );

    ReactDOM.render(
      <Provider store={store}>
        <ManageLinkedAccounts />
      </Provider>,
      mountPoint
    );
  }
}
