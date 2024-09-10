import React from 'react';
import ReactDOM from 'react-dom';

import NewUnitForm from '@cdo/apps/levelbuilder/unit-editor/NewUnitForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  ReactDOM.render(
    <NewUnitForm
      families={getScriptData('families')}
      versionYearOptions={getScriptData('versionYearOptions')}
      familiesCourseTypes={getScriptData('familiesCourseTypes')}
    />,
    document.getElementById('form')
  );
});
