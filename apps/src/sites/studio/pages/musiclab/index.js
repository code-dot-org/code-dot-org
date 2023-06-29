import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import ProjectContainer from '@cdo/apps/labs/projects/ProjectContainer';
import ErrorBoundary from '@cdo/apps/code-studio/components/ErrorBoundary';
import {logError} from '@cdo/apps/music/utils/MusicMetrics';
import {ErrorFallbackPage} from '@cdo/apps/code-studio/components/LabContainer';

$(document).ready(function () {
  const channelId = document.querySelector('script[data-channelid]').dataset
    .channelid;

  ReactDOM.render(
    <ErrorBoundary
      fallback={<ErrorFallbackPage />}
      onError={(error, componentStack) =>
        logError({error: error.toString(), componentStack})
      }
    >
      <Provider store={getStore()}>
        <ProjectContainer channelId={channelId}>
          <MusicLabView channelId={channelId} inIncubator={true} />
        </ProjectContainer>
      </Provider>
    </ErrorBoundary>,
    document.getElementById('musiclab-container')
  );
});
