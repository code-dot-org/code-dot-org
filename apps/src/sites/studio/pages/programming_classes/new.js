import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import NewProgrammingClassForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingClassForm';

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
