import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';

$(document).ready(function () {
  const channelIds = JSON.parse(
    document.querySelector('script[data-channelids]').dataset.channelids
  );

  const root = createRoot(document.getElementById('musiclab-container'));
  root.render(
    <MiniMusicPlayer projects={channelIds} libraryName="launch2024" />
  );
});
