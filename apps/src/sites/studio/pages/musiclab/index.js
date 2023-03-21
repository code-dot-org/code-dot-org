import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MusicLabView from '@cdo/apps/music/views/MusicView';

$(document).ready(function() {
  ReactDOM.render(
    <MusicLabView channelId="UZhQ1Ap2xV1VwRzssldBfA" />,
    document.getElementById('musiclab-container')
  );
});
