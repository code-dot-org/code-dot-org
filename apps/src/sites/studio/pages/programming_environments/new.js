import React from 'react';

import NewProgrammingEnvironmentForm from '@cdo/apps/levelbuilder/code-docs-editor/NewProgrammingEnvironmentForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  createReactRoot(
    <NewProgrammingEnvironmentForm />,
    document.getElementById('form')
  );
});
