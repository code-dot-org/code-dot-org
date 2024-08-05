import React from 'react';
import {createRoot} from 'react-dom/client';

import ProgrammingEnvironmentIndex from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentIndex';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  const root = createRoot(document.getElementById('container'));

  root.render(
    <ProgrammingEnvironmentIndex
      programmingEnvironments={programmingEnvironments}
    />
  );
});
