import React from 'react';

import DataDocIndex from '@cdo/apps/templates/dataDocs/DataDocIndex';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  createReactRoot(
    <DataDocIndex dataDocs={dataDocs} />,
    document.getElementById('see-data-docs')
  );
});
