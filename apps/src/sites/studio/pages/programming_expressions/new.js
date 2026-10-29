import React from 'react';

import NewProgrammingExpressionForm from '@cdo/apps/levelbuilder/code-docs-editor/NewProgrammingExpressionForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironmentsForSelect = getScriptData(
    'programmingEnvironmentsForSelect'
  );
  createReactRoot(
    <NewProgrammingExpressionForm
      programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
    />,
    document.getElementById('form')
  );
});
