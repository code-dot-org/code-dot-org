import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import NewProgrammingEnvironmentForm from '@cdo/apps/levelbuilder/code-docs-editor/NewProgrammingEnvironmentForm';

$(document).ready(() => {
  const root = createRoot(document.getElementById('form'));
  root.render(<NewProgrammingEnvironmentForm />);
});
