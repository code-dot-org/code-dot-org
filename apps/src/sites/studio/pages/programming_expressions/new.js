import React from 'react';
import {createRoot} from 'react-dom/client';

import NewProgrammingExpressionForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingExpressionForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironmentsForSelect = getScriptData(
    'programmingEnvironmentsForSelect'
  );
  const root = createRoot(document.getElementById('form'));

  root.render(
    <NewProgrammingExpressionForm
      programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
    />
  );
});
