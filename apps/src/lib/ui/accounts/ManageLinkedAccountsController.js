import React from 'react';
import ReactDOM from 'react-dom';
import ManageLinkedAccounts from './ManageLinkedAccounts';

export default class ManageLinkedAccountsController {
  constructor(mountPoint) {
    ReactDOM.render(
      <ManageLinkedAccounts/>,
      mountPoint
    );
  }
}
