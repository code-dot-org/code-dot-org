import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import {navigateToHref} from '@cdo/apps/utils';
import ManageLinkedAccounts from './ManageLinkedAccounts';

export default class ManageLinkedAccountsController {
  constructor(mountPoint, userType, authenticationOptions) {
    this.mountPoint = mountPoint;
    this.userType = userType;
    this.authenticationOptions = authenticationOptions;
    this.renderManageLinkedAccounts();
  }

  renderManageLinkedAccounts = () => {
    ReactDOM.render(
      <ManageLinkedAccounts
        userType={this.userType}
        authenticationOptions={this.authenticationOptions}
        connect={this.connect}
        disconnect={this.disconnect}
      />,
      this.mountPoint
    );
  };

  connect = (provider) => {
    navigateToHref(`/users/auth/${provider}/connect`);
  };

  disconnect = (authOptionId) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/users/auth/${authOptionId}/disconnect`,
        method: 'DELETE'
      }).done(result => {
        this.authenticationOptions = this.authenticationOptions.filter(option => option.id !== authOptionId);
        this.renderManageLinkedAccounts();
        resolve();
      }).fail((jqXhr, _) => {
        let error;
        if (jqXhr.responseText) {
          error = new Error(jqXhr.responseText);
        } else {
          error = new Error('Unexpected failure: ' + jqXhr.status);
        }
        reject(error);
      });
    });
  };
}
