import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact').then(
  ({default: RegionalPartnerMiniContact}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <RegionalPartnerMiniContact {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
