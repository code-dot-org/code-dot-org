import React from 'react';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

import DataDocEditAll from '../../../../levelbuilder/data-docs-editor/DataDocEditAll';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  createReactRoot(
    <DataDocEditAll dataDocs={dataDocs} />,
    document.getElementById('edit-all-data-docs')
  );
});
