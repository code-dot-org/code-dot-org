import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditValidations from '@cdo/apps/lab2/levelEditors/validations/EditValidations';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const validations = getScriptData('validations');
  const levelName = document.querySelector('script[data-levelname]').dataset
    .levelname;
  const appName = document.querySelector('script[data-levelname]').dataset
    .appname;

  ReactDOM.render(
    <EditValidations
      initialValidations={validations}
      levelName={levelName}
      appName={appName}
    />,
    document.getElementById('validations-container')
  );
});
