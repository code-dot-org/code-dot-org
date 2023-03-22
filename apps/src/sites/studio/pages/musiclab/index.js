import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MusicLabView from '@cdo/apps/music/views/MusicView';

$(document).ready(function() {
  const channelId = document.querySelector('script[data-channelid]').dataset
    .channelid;

  ReactDOM.render(
    <MusicLabView channelId={channelId} />,
    document.getElementById('musiclab-container')
  );
});
