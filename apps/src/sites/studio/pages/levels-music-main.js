/*
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';
import loadMusic from './init/loadMusic';

loadAppOptions().then(loadMusic);
*/

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MusicLabView from '@cdo/apps/music/views/MusicView';

$(document).ready(function () {
  ReactDOM.render(
    <MusicLabView />,
    document.getElementById('musiclab-container')
  );
});
