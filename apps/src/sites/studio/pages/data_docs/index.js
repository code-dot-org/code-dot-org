import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import DataDocIndex from '@cdo/apps/templates/dataDocs/DataDocIndex';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  ReactDOM.render(
    <DataDocIndex dataDocs={dataDocs} />,
    document.getElementById('see-data-docs')
  );
});
