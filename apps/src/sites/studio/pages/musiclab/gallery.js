import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';

$(document).ready(function () {
  const channelIds = JSON.parse(
    document.querySelector('script[data-channelids]').dataset.channelids
  );

  ReactDOM.render(
    <MiniMusicPlayer projects={channelIds} libraryName="default" />,
    document.getElementById('musiclab-container')
  );
});
