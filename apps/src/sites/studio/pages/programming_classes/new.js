import React from 'react';
import ReactDOM from 'react-dom';

import NewProgrammingClassForm from '@cdo/apps/levelbuilder/code-docs-editor/NewProgrammingClassForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironmentsForSelect = getScriptData(
    'programmingEnvironmentsForSelect'
  );
  ReactDOM.render(
    <NewProgrammingClassForm
      programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
    />,
    document.getElementById('form')
  );
});
