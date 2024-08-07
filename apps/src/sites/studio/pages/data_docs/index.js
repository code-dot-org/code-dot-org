import React from 'react';
import ReactDOM from 'react-dom';

import DataDocIndex from '@cdo/apps/templates/dataDocs/DataDocIndex';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  ReactDOM.render(
    <DataDocIndex dataDocs={dataDocs} />,
    document.getElementById('see-data-docs')
  );
});
