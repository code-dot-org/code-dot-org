import React from 'react';
import {createRoot} from 'react-dom/client';

import DatasetList from '@cdo/apps/storage/levelbuilder/DatasetList';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const datasets = getScriptData('datasets');
  const liveDatasets = getScriptData('liveDatasets');
  const root = createRoot(document.querySelector('.datasets'));
  root.render(<DatasetList datasets={datasets} liveDatasets={liveDatasets} />);
});
