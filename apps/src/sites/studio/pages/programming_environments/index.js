import React from 'react';

import ProgrammingEnvironmentIndex from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentIndex';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  createReactRoot(
    <ProgrammingEnvironmentIndex
      programmingEnvironments={programmingEnvironments}
    />,
    document.getElementById('container')
  );
});
