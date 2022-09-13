import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import DataDocView from '@cdo/apps/templates/dataDocs/DataDocView';

$(() => {
  const dataDocName = getScriptData('dataDocName');
  const dataDocContent = getScriptData('dataDocContent');
  ReactDOM.render(
    <DataDocView dataDocName={dataDocName} dataDocContent={dataDocContent} />,
    document.getElementById('show-container')
  );
});
