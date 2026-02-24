import React from 'react';

import AllCodeDocs from '@cdo/apps/levelbuilder/code-docs-editor/AllCodeDocs';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  const allCategories = getScriptData('allCategories');

  createReactRoot(
    <AllCodeDocs
      programmingEnvironments={programmingEnvironments}
      allCategories={allCategories}
    />,
    document.getElementById('container')
  );
});
