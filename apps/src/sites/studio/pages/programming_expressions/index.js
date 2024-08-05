import React from 'react';
import {createRoot} from 'react-dom/client';

import AllCodeDocs from '@cdo/apps/lib/levelbuilder/code-docs-editor/AllCodeDocs';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  const allCategories = getScriptData('allCategories');

  const root = createRoot(document.getElementById('container'));

  root.render(
    <AllCodeDocs
      programmingEnvironments={programmingEnvironments}
      allCategories={allCategories}
    />
  );
});
