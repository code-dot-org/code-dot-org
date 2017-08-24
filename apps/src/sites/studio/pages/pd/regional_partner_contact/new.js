import React from 'react';
import ReactDOM from 'react-dom';
import RegionalPartnerContact from '@cdo/apps/code-studio/pd/regional_partner_contact/RegionalPartnerContact';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <RegionalPartnerContact
      {...getScriptData('props')}
    />, document.getElementById('application-container')
  );
});
