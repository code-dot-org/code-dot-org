import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import LockoutPanel from '@cdo/apps/templates/sessions/LockoutPanel';

$(document).ready(function () {
  const element = document.getElementById('lockout-container');
  ReactDOM.render(
    <Provider store={getStore()}>
      <LockoutPanel
        apiURL={element.getAttribute('data-api-url')}
        pendingEmail={element.getAttribute('data-pending-email')}
        requestDate={
          new Date(Date.parse(element.getAttribute('data-request-date')))
        }
        deleteDate={
          new Date(Date.parse(element.getAttribute('data-delete-date')))
        }
        disallowedEmail={element.getAttribute('data-disallowed-email')}
        permissionStatus={element.getAttribute('data-permission-status')}
        inSection={'true' === element.getAttribute('data-in-section')}
      />
    </Provider>,
    element
  );
});
