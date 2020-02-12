import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import DatasetList from '@cdo/apps/storage/levelbuilder/DatasetList';

$(document).ready(function() {
  const datasets = getScriptData('datasets');
  ReactDOM.render(
    <DatasetList datasets={datasets} />,
    document.querySelector('.datasets')
  );
  console.log(datasets);
});
