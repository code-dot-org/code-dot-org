import React from 'react';

import NewCourseForm from '@cdo/apps/levelbuilder/course-editor/NewCourseForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  createReactRoot(
    <NewCourseForm
      families={getScriptData('families')}
      versionYearOptions={getScriptData('versionYearOptions')}
      familiesCourseTypes={getScriptData('familiesCourseTypes')}
    />,
    document.getElementById('form')
  );
});
