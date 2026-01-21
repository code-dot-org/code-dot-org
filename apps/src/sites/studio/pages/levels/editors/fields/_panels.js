import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditPanels from '@cdo/apps/lab2/levelEditors/panels/EditPanels';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialPanels = getScriptData('panels');
  const levelName = document.querySelector('script[data-levelname]')?.dataset
    ?.levelname;

  const root = createRoot(document.getElementById('panels-editor'));
  root.render(<EditPanels initialPanels={initialPanels} levelName={levelName} />);
});
