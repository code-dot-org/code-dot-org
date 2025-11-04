import React from 'react';

import RegionalPartnerMiniContact from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <RegionalPartnerMiniContact {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
