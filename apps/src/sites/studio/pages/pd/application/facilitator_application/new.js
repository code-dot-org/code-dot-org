import React from 'react';
import ReactDOM from 'react-dom';
import FacilitatorApplication1819 from '@cdo/apps/code-studio/pd/application/facilitator1819/FacilitatorApplication1819';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <FacilitatorApplication1819
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});

