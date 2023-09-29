import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import LockoutPanel from '@cdo/apps/templates/sessions/LockoutPanel';

$(document).ready(function () {
  const element = document.getElementById('lockout-container');
  ReactDOM.render(
    <LockoutPanel
      apiURL={element.getAttribute('data-api-url')}
      pendingEmail={element.getAttribute('data-pending-email')}
      requestDate={
        new Date(Date.parse(element.getAttribute('data-request-date')))
      }
      deleteDate={
        new Date(Date.parse(element.getAttribute('data-delete-date')))
      }
      studentEmail={element.getAttribute('data-student-email')}
    />,
    element
  );
});
