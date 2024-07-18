import React from 'react';
import {createRoot} from 'react-dom/client';

import getScriptData from '@cdo/apps/util/getScriptData';

import DataDocEditAll from '../../../../lib/levelbuilder/data-docs-editor/DataDocEditAll';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  const root = createRoot(document.getElementById('edit-all-data-docs'));
  root.render(<DataDocEditAll dataDocs={dataDocs} />);
});
