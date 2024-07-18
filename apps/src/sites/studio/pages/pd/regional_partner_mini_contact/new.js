import React from 'react';
import ReactDOM from 'react-dom';

import RegionalPartnerMiniContact from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  ReactDOM.render(
    <RegionalPartnerMiniContact {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
