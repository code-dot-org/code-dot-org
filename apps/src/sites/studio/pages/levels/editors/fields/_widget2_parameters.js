import $ from 'jquery';
import React from 'react';

import EditWidget2Parameters from '@cdo/apps/lab2/levelEditors/levelData/EditWidget2Parameters';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialValue = getScriptData('widget2parameters');
  createReactRoot(
    <EditWidget2Parameters initialValue={initialValue} />,
    document.getElementById('widget2_parameters_editor')
  );
});
