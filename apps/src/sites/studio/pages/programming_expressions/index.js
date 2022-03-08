import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import AllCodeDocs from '@cdo/apps/lib/levelbuilder/code-docs-editor/AllCodeDocs';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  const programmingEnvironmentsForSelect = getScriptData(
    'programmingEnvironmentsForSelect'
  );
  const categoriesForSelect = getScriptData('categoriesForSelect');

  ReactDOM.render(
    <AllCodeDocs
      programmingEnvironments={programmingEnvironments}
      programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
      categoriesForSelect={categoriesForSelect}
    />,
    document.getElementById('container')
  );
});
