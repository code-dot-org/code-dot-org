import React from 'react';

import DatasetList from '@cdo/apps/storage/levelbuilder/DatasetList';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const datasets = getScriptData('datasets');
  const liveDatasets = getScriptData('liveDatasets');
  createReactRoot(
    <DatasetList datasets={datasets} liveDatasets={liveDatasets} />,
    document.querySelector('.datasets')
  );
});
