import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import AllCodeDocs from '@cdo/apps/levelbuilder/code-docs-editor/AllCodeDocs';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  const allCategories = getScriptData('allCategories');

  const root = createRoot(document.getElementById('container'));

  root.render(<AllCodeDocs
    programmingEnvironments={programmingEnvironments}
    allCategories={allCategories}
  />);
});
