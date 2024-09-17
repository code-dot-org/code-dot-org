import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import MusicMenu from '@cdo/apps/musicMenu/MusicMenu';

$(document).ready(function () {
  ReactDOM.render(
    <MusicMenu />,
    document.getElementById('musiclab-menu-container')
  );
});
