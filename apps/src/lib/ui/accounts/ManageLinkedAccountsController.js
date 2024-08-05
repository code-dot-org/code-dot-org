import React from 'react';
import {createRoot} from 'react-dom/client';
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

    const root = createRoot(mountPoint);

    root.render(
      <Provider store={store}>
        <ManageLinkedAccounts />
      </Provider>
    );
  }
}
