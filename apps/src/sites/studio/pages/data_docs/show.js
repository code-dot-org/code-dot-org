import React from 'react';

import DataDocView from '@cdo/apps/templates/dataDocs/DataDocView';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const {dataDocName, dataDocContent} = getScriptData('dataDoc');
  createReactRoot(
    <DataDocView dataDocName={dataDocName} dataDocContent={dataDocContent} />,
    document.getElementById('view-data-doc')
  );
});
