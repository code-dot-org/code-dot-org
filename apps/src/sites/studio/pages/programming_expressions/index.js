import React from 'react';
import ReactDOM from 'react-dom';

import AllCodeDocs from '@cdo/apps/levelbuilder/code-docs-editor/AllCodeDocs';
import getScriptData from '@cdo/apps/util/getScriptData';

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
