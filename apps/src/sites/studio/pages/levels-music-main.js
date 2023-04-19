import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import getScriptData from '../../../util/getScriptData';

$(document).ready(function () {
  const appOptions = getScriptData('appoptions');

  ReactDOM.render(
    <MusicLabView appOptions={appOptions} />,
    document.getElementById('musiclab-container')
  );
});
