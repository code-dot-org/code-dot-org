import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import LabContainer from '@cdo/apps/code-studio/components/LabContainer';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const appOptions = getScriptData('appoptions');

  ReactDOM.render(
    <Provider store={getStore()}>
      <LabContainer>
        <MusicLabView appOptions={appOptions} />
      </LabContainer>
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
