import $ from 'jquery';
import React from 'react';

import EditNeighborhoodSettings from '@cdo/apps/lab2/levelEditors/neighborhood/EditNeighborhoodSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialMaze = getScriptData('serializedmaze');

  createReactRoot(
    <EditNeighborhoodSettings initialMaze={initialMaze} />,
    document.getElementById('neighborhood-settings-editor')
  );
});
