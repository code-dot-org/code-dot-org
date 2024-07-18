import React from 'react';
import {createRoot} from 'react-dom/client';

import DataDocIndex from '@cdo/apps/templates/dataDocs/DataDocIndex';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  const root = createRoot(document.getElementById('see-data-docs'));
  root.render(<DataDocIndex dataDocs={dataDocs} />);
});
