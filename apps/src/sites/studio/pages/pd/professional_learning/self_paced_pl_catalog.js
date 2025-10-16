import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import SelfPacedPLCatalog from '@cdo/apps/code-studio/pd/professional_learning/courses/SelfPacedPLCatalog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const selfPacedPLCourseOfferings = getScriptData(
    'selfPacedPLCourseOfferings'
  );
  const studentsCourseOfferings = getScriptData('studentsCourseOfferings');

  ReactDOM.render(
    <SelfPacedPLCatalog
      selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
      studentsCourseOfferings={studentsCourseOfferings}
    />,
    document.getElementById('self-paced-pl-catalog')
  );
});
