import React from 'react';
import {createRoot} from 'react-dom/client';

import NewUnitForm from '@cdo/apps/lib/levelbuilder/unit-editor/NewUnitForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const root = createRoot(document.getElementById('form'));

  root.render(
    <NewUnitForm
      families={getScriptData('families')}
      versionYearOptions={getScriptData('versionYearOptions')}
      familiesCourseTypes={getScriptData('familiesCourseTypes')}
    />
  );
});
