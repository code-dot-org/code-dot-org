import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import ProjectContainer from '@cdo/apps/labs/projects/ProjectContainer';

$(document).ready(function () {
  const channelId = document.querySelector('script[data-channelid]').dataset
    .channelid;

  ReactDOM.render(
    <Provider store={getStore()}>
      <ProjectContainer channelId={channelId}>
        <MusicLabView inIncubator={true} />
      </ProjectContainer>
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
