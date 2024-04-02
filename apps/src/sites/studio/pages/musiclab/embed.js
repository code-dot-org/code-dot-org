import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';

$(document).ready(function () {
  const projects = JSON.parse(
    document.querySelector('script[data-projects]').dataset.projects
  );

  ReactDOM.render(
    <MiniMusicPlayer projects={projects} libraryName="launch2024" />,
    document.getElementById('musiclab-container')
  );
});
