import React from 'react';
import {createRoot} from 'react-dom/client';

import NewCourseForm from '@cdo/apps/lib/levelbuilder/course-editor/NewCourseForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const root = createRoot(document.getElementById('form'));

  root.render(
    <NewCourseForm
      families={getScriptData('families')}
      versionYearOptions={getScriptData('versionYearOptions')}
      familiesCourseTypes={getScriptData('familiesCourseTypes')}
    />
  );
});
