import React from 'react';
import ReactDOM from 'react-dom';

import InternationalOptIn from '@cdo/apps/code-studio/pd/international_opt_in/InternationalOptIn';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  ReactDOM.render(
    <InternationalOptIn {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
