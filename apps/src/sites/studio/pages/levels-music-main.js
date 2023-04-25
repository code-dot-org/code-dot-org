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
  // Some Music Lab-specific configuration.
  const appConfig = {
    'load-progression': 'true',
    'local-progression': 'true',
  };

  ReactDOM.render(
    <Provider store={getStore()}>
      <LabContainer>
        <MusicLabView appConfig={appConfig} appOptions={appOptions} />
      </LabContainer>
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
