/*
import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Fish from '@cdo/apps/fish/Fish';
import skins from '@cdo/apps/skins';
import levels from '@cdo/apps/fish/levels';

export default function loadFish(options) {
  options.skinsModule = skins;
  options.isEditorless = true;
  options.skinId = 'fish';
  const fish = new Fish();

  fish.injectStudioApp(studioApp());
  appMain(fish, levels, options);
}
*/

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import LabContainer from '@cdo/apps/code-studio/components/LabContainer';

$(document).ready(function() {
  ReactDOM.render(
    <LabContainer labType="music" />,
    document.getElementById('musiclab-container')
  );
});
