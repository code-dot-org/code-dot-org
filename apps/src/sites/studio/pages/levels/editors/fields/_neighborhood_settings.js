import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditNeighborhoodSettings from '@cdo/apps/lab2/levelEditors/neighborhood/EditNeighborhoodSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialMaze = getScriptData('serializedmaze');

  ReactDOM.render(
    <EditNeighborhoodSettings initialMaze={initialMaze} />,
    document.getElementById('neighborhood-settings-editor')
  );
});
