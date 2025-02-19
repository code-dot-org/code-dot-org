import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditValidations from '@cdo/apps/lab2/levelEditors/validations/EditValidations';
import ExemplarValidation from '@cdo/apps/lab2/levelEditors/validations/ExemplarValidation';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const validations = getScriptData('validations');
  const levelName = document.querySelector('script[data-levelname]').dataset
    .levelname;
  const appName = document.querySelector('script[data-levelname]').dataset
    .appname;
  const exemplarValidation = getScriptData('exemplarvalidation');
  const exemplarSources = getScriptData('exemplarsources');

  ReactDOM.render(
    <div>
      <EditValidations
        initialValidations={validations}
        levelName={levelName}
        appName={appName}
      />
      <ExemplarValidation
        initialExemplarValidation={exemplarValidation}
        exemplarSources={exemplarSources}
        appName={appName}
      />
    </div>,
    document.getElementById('validations-editor')
  );
});
