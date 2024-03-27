import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import EditPanels from '@cdo/apps/lab2/levelEditors/panels/EditPanels';

$(document).ready(function () {
  const initialPanels = getScriptData('panels');
  const levelName = document.querySelector('script[data-levelname]')?.dataset
    ?.levelname;

  ReactDOM.render(
    <EditPanels initialPanels={initialPanels} levelName={levelName} />,
    document.getElementById('panels-container')
  );
});
