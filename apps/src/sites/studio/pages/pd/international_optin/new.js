import React from 'react';
import ReactDOM from 'react-dom';
import InternationalOptin from '@cdo/apps/code-studio/pd/international_optin/InternationalOptin';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <InternationalOptin
      {...getScriptData('props')}
    />, document.getElementById('application-container')
  );
});
