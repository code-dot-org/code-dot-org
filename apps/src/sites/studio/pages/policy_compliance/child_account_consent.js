import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import ChildAccountConsent from '@cdo/apps/templates/policy_compliance/ChildAccountConsent';

$(document).ready(function () {
  const element = document.getElementById('child-account-consent-container');
  const permissionGranted = element.hasAttribute('data-permission-granted');
  const permissionGrantedDateString = element.getAttribute(
    'data-permission-granted-date'
  );
  const permissionGrantedDate = permissionGrantedDateString
    ? new Date(permissionGrantedDateString)
    : undefined;
  const studentId = element.getAttribute('data-student-id');
  const root = createRoot(element);

  root.render(
    <ChildAccountConsent
      permissionGranted={permissionGranted}
      permissionGrantedDate={permissionGrantedDate}
      studentId={studentId}
    />
  );
});
