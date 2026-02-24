import $ from 'jquery';
import React from 'react';

import EditPanels from '@cdo/apps/lab2/levelEditors/panels/EditPanels';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialPanels = getScriptData('panels');
  const levelName = document.querySelector('script[data-levelname]')?.dataset
    ?.levelname;

  createReactRoot(
    <EditPanels initialPanels={initialPanels} levelName={levelName} />,
    document.getElementById('panels-editor')
  );
});
