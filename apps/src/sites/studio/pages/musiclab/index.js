import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MusicLabView from '@cdo/apps/music/MusicView';

$(document).ready(function() {
  ReactDOM.render(
    <MusicLabView />,
    document.getElementById('musiclab-container')
  );
});
