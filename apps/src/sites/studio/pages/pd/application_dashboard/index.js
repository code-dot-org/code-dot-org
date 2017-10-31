import React from 'react';
import ReactDOM from 'react-dom';
import ApplicationDashboard from '@cdo/apps/code-studio/pd/application_dashboard/application_dashboard';
import getScriptData from '@cdo/apps/util/getScriptData';


document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <ApplicationDashboard
      regionalPartnerName={getScriptData("props")['regionalPartnerName']}
    />,
    document.getElementById('application-container')
  );
});
