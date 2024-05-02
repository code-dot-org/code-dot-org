import React from 'react';
import ReactDOM from 'react-dom';

import getScriptData from '@cdo/apps/util/getScriptData';
import ParentalPermissionBanner from '@cdo/apps/templates/policy_compliance/ParentalPermissionBanner';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <ParentalPermissionBanner lockoutDate={getScriptData('lockoutDate')} />,
    document.getElementById('parental-permission-banner-container')
  );
});
