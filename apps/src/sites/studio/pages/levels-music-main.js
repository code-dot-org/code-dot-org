import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import LabContainer from '@cdo/apps/code-studio/components/LabContainer';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import {logError} from '@cdo/apps/music/utils/MusicMetrics';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <LabContainer
        onError={(error, componentStack) =>
          logError({error: error.toString(), componentStack})
        }
      >
        <MusicLabView />
      </LabContainer>
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
