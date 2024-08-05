import React from 'react';
import {createRoot} from 'react-dom/client';

import RegionalPartnerMiniContact from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<RegionalPartnerMiniContact {...getScriptData('props')} />);
});
