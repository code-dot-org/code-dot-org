import $ from 'jquery';
import React from 'react';

import EditMusicLevelData from '@cdo/apps/lab2/levelEditors/levelData/EditMusicLevelData';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialLevelData = getScriptData('musicleveldata');
  createReactRoot(
    <EditMusicLevelData initialLevelData={initialLevelData} />,
    document.getElementById('music-level-data-editor')
  );
});
