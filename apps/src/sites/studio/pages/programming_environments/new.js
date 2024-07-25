import React from 'react';
import ReactDOM from 'react-dom';

import NewProgrammingEnvironmentForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingEnvironmentForm';

$(document).ready(() => {
  ReactDOM.render(
    <NewProgrammingEnvironmentForm />,
    document.getElementById('form')
  );
});
