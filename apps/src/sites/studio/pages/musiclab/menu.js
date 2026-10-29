import $ from 'jquery';
import React from 'react';

import MusicMenu from '@cdo/apps/musicMenu/MusicMenu';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  createReactRoot(
    <MusicMenu />,
    document.getElementById('musiclab-menu-container')
  );
});
