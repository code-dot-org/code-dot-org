import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import NewStudentAccountConsent from '@cdo/apps/templates/policy_compliance/NewStudentAccountConsent';

$(document).ready(function () {
  const element = document.getElementById(
    'new-student-account-consent-container'
  );
  const permissionGranted = element.hasAttribute('data-permission-granted');
  const permissionGrantedDateString = element.getAttribute(
    'data-permission-granted-date'
  );
  const permissionGrantedDate = permissionGrantedDateString
    ? new Date(permissionGrantedDateString)
    : undefined;
  ReactDOM.render(
    <NewStudentAccountConsent
      permissionGranted={permissionGranted}
      permissionGrantedDate={permissionGrantedDate}
    />,
    element
  );
});
