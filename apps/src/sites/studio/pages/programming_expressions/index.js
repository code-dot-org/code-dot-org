import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import AllCodeDocs from '@cdo/apps/lib/levelbuilder/code-docs-editor/AllCodeDocs';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  const allCategories = getScriptData('allCategories');

  ReactDOM.render(
    <AllCodeDocs
      programmingEnvironments={programmingEnvironments}
      allCategories={allCategories}
    />,
    document.getElementById('container')
  );
});
