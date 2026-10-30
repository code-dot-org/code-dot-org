import React from 'react';

import NewProgrammingClassForm from '@cdo/apps/levelbuilder/code-docs-editor/NewProgrammingClassForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironmentsForSelect = getScriptData(
    'programmingEnvironmentsForSelect'
  );
  createReactRoot(
    <NewProgrammingClassForm
      programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
    />,
    document.getElementById('form')
  );
});
