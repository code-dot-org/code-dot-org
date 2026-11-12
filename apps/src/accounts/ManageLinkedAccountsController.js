import React from 'react';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

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
    personalAccountLinkingEnabled,
    lmsName
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
        lmsName,
      })
    );

    createReactRoot(
      <Provider store={store}>
        <ManageLinkedAccounts />
      </Provider>,
      mountPoint
    );
  }
}
