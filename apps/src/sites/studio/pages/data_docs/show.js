import React from 'react';
import ReactDOM from 'react-dom';

import DataDocView from '@cdo/apps/templates/dataDocs/DataDocView';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const {dataDocName, dataDocContent} = getScriptData('dataDoc');
  ReactDOM.render(
    <DataDocView dataDocName={dataDocName} dataDocContent={dataDocContent} />,
    document.getElementById('view-data-doc')
  );
});
