import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const projects = JSON.parse(
    document.querySelector('script[data-projects]').dataset.projects
  );

  createReactRoot(
    <Provider store={getStore()}>
      <MiniMusicPlayer projects={projects} libraryName="launch2024" />
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
