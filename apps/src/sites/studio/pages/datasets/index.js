import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import DatasetList from '@cdo/apps/storage/levelbuilder/DatasetList';

$(document).ready(function() {
  const datasets = getScriptData('datasets');
  const liveDatasets = getScriptData('liveDatasets');
  ReactDOM.render(
    <DatasetList datasets={datasets} liveDatasets={liveDatasets} />,
    document.querySelector('.datasets')
  );
});
