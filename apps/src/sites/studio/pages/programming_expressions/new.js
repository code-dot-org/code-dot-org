import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import NewProgrammingExpressionForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingExpressionForm';

$(document).ready(() => {
  const programmingEnvironmentsForSelect = getScriptData(
    'programmingEnvironmentsForSelect'
  );
  ReactDOM.render(
    <NewProgrammingExpressionForm
      programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
    />,
    document.getElementById('form')
  );
});
