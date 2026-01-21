import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import NewProgrammingExpressionForm from '@cdo/apps/levelbuilder/code-docs-editor/NewProgrammingExpressionForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironmentsForSelect = getScriptData(
    'programmingEnvironmentsForSelect'
  );
  const root = createRoot(document.getElementById('form'));

  root.render(<NewProgrammingExpressionForm
    programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
  />);
});
