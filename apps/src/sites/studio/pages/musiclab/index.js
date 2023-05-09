import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import MusicLabView from '@cdo/apps/music/views/MusicView';

$(document).ready(function () {
  const channelId = document.querySelector('script[data-channelid]').dataset
    .channelid;

  ReactDOM.render(
    <Provider store={getStore()}>
      <MusicLabView appOptions={{channel: channelId, app: 'music'}} />
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
