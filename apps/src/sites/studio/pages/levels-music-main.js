import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {getStandaloneProjectId} from '@cdo/apps/lab2/projects/utils';
import Lab2Wrapper from '@cdo/apps/lab2/views/Lab2Wrapper';
import ProjectContainer from '@cdo/apps/lab2/projects/ProjectContainer';
import ProgressContainer from '@cdo/apps/lab2/progress/ProgressContainer';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import {logError} from '@cdo/apps/music/utils/MusicMetrics';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <Lab2Wrapper
        onError={(error, componentStack) =>
          logError({error: error.toString(), componentStack})
        }
      >
        <ProjectContainer channelId={getStandaloneProjectId()}>
          <ProgressContainer appType={'music'}>
            <MusicLabView />
          </ProgressContainer>
        </ProjectContainer>
      </Lab2Wrapper>
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
