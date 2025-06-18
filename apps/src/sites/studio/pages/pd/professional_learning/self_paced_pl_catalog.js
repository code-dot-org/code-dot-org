import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import SelfPacedPLCatalog from '@cdo/apps/code-studio/pd/professional_learning/SelfPacedPLCatalog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const selfPacedPLCourseOfferings = getScriptData(
    'selfPacedPLCourseOfferings'
  );
  ReactDOM.render(
    <SelfPacedPLCatalog
      selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
    />,
    document.getElementById('self-paced-pl-catalog')
  );
});
