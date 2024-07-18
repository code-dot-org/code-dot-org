import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import MusicMenu from '@cdo/apps/musicMenu/MusicMenu';

$(document).ready(function () {
  const root = createRoot(document.getElementById('musiclab-menu-container'));
  root.render(<MusicMenu />);
});
