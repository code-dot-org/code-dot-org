import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditMusicLevelData from '@cdo/apps/lab2/levelEditors/levelData/EditMusicLevelData';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialLevelData = getScriptData('musicleveldata');
  const root = createRoot(document.getElementById('music-level-data-editor'));
  root.render(<EditMusicLevelData initialLevelData={initialLevelData} />);
});
