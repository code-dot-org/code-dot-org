import $ from 'jquery';
import React from 'react';

import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const channelIds = JSON.parse(
    document.querySelector('script[data-channelids]').dataset.channelids
  );

  createReactRoot(
    <MiniMusicPlayer projects={channelIds} libraryName="launch2024" />,
    document.getElementById('musiclab-container')
  );
});
