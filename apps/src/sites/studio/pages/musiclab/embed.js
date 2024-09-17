import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';
import {getStore} from '@cdo/apps/redux';

$(document).ready(function () {
  const projects = JSON.parse(
    document.querySelector('script[data-projects]').dataset.projects
  );

  ReactDOM.render(
    <Provider store={getStore()}>
      <MiniMusicPlayer projects={projects} libraryName="launch2024" />
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
