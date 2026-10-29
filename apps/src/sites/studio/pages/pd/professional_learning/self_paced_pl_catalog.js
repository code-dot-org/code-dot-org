import $ from 'jquery';
import React from 'react';

import SelfPacedPLCatalog from '@cdo/apps/code-studio/pd/professional_learning/courses/SelfPacedPLCatalog';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const selfPacedPLCourseOfferings = getScriptData(
    'selfPacedPLCourseOfferings'
  );
  const studentsCourseOfferings = getScriptData('studentsCourseOfferings');

  createReactRoot(
    <SelfPacedPLCatalog
      selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
      studentsCourseOfferings={studentsCourseOfferings}
    />,
    document.getElementById('self-paced-pl-catalog')
  );
});
