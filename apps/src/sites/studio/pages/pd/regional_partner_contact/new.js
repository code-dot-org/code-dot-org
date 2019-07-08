import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/regional_partner_contact/RegionalPartnerContact').then(
  ({default: RegionalPartnerContact}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <RegionalPartnerContact {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
