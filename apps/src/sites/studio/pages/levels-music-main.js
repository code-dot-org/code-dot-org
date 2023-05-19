import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import LabContainer from '@cdo/apps/code-studio/components/LabContainer';
import MusicLabView from '@cdo/apps/music/views/MusicView';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <LabContainer>
        <MusicLabView />
      </LabContainer>
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
