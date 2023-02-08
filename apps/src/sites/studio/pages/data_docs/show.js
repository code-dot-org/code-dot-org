import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import DataDocView from '@cdo/apps/templates/dataDocs/DataDocView';

$(() => {
  const {dataDocName, dataDocContent} = getScriptData('dataDoc');
  ReactDOM.render(
    <DataDocView dataDocName={dataDocName} dataDocContent={dataDocContent} />,
    document.getElementById('view-data-doc')
  );
});
