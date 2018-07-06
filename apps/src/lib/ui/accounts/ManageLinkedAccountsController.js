import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import manageLinkedAccounts, {initializeState} from './manageLinkedAccountsRedux';
import ManageLinkedAccounts from './ManageLinkedAccounts';

export default class ManageLinkedAccountsController {
  constructor(mountPoint, userType, authenticationOptions, userHasPassword, isGoogleClassroomStudent, isCleverStudent) {
    registerReducers({manageLinkedAccounts});
    const store = getStore();
    store.dispatch(initializeState({
      userType,
      authenticationOptions,
      userHasPassword,
      isGoogleClassroomStudent,
      isCleverStudent,
    }));

    ReactDOM.render(
      <Provider store={store}>
        <ManageLinkedAccounts />
      </Provider>,
      mountPoint
    );
  }
}
