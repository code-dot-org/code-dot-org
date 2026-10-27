import $ from 'jquery';
import React from 'react';

import EditWidget2 from '@cdo/apps/lab2/levelEditors/levelData/EditWidget2';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialValue = getScriptData('widget2') || undefined;
  const widget2Ids = getScriptData('widget2ids') || [];
  createReactRoot(
    <EditWidget2 initialValue={initialValue} widget2Ids={widget2Ids} />,
    document.getElementById('widget2_editor')
  );
});
