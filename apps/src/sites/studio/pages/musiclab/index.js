import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ProjectBeats from '@cdo/apps/music/views/ProjectBeats';

$(document).ready(function () {
  const channelId = document.querySelector('script[data-channelid]').dataset
    .channelid;

  ReactDOM.render(
    <ProjectBeats channelId={channelId} />,
    document.getElementById('musiclab-container')
  );
});
