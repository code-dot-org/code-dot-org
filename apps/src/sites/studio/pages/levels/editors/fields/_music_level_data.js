import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import EditMusicLevelData from '@cdo/apps/lab2/levelEditors/levelData/EditMusicLevelData';

$(document).ready(function () {
  const initialLevelData = getScriptData('musicleveldata');
  ReactDOM.render(
    <EditMusicLevelData initialLevelData={initialLevelData} />,
    document.getElementById('music-level-data-container')
  );
});
