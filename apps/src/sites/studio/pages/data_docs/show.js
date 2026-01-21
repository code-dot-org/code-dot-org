import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import DataDocView from '@cdo/apps/templates/dataDocs/DataDocView';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const {dataDocName, dataDocContent} = getScriptData('dataDoc');
  const root = createRoot(document.getElementById('view-data-doc'));
  root.render(<DataDocView dataDocName={dataDocName} dataDocContent={dataDocContent} />);
});
