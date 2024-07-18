import React from 'react';
import {createRoot} from 'react-dom/client';

import NewProgrammingEnvironmentForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingEnvironmentForm';

$(document).ready(() => {
  const root = createRoot(document.getElementById('form'));
  root.render(<NewProgrammingEnvironmentForm />);
});
