import React from 'react';
import ReactDOM from 'react-dom';

import DatasetList from '@cdo/apps/storage/levelbuilder/DatasetList';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const datasets = getScriptData('datasets');
  const liveDatasets = getScriptData('liveDatasets');
  ReactDOM.render(
    <DatasetList datasets={datasets} liveDatasets={liveDatasets} />,
    document.querySelector('.datasets')
  );
});
