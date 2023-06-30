import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider, useSelector} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import LabContainer from '@cdo/apps/code-studio/components/LabContainer';
import {levelsForLessonId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {getStandaloneProjectId} from '@cdo/apps/labs/projects/utils';
import ProjectContainer from '@cdo/apps/labs/projects/ProjectContainer';
import ProgressContainer from '@cdo/apps/labs/progress/ProgressContainer';
import StandaloneVideo2 from '@cdo/apps/standaloneVideo2/StandaloneVideo2';
import MusicView from '@cdo/apps/music/views/MusicView';
import {logError} from '@cdo/apps/music/utils/MusicMetrics';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <LabContainer
        onError={(error, componentStack) =>
          logError({error: error.toString(), componentStack})
        }
      >
        <LabLab />
      </LabContainer>
    </Provider>,

    document.getElementById('lablab-container')
  );
});

const LabLab = () => {
  const currentApp = useSelector(
    state =>
      levelsForLessonId(state.progress, state.progress.currentLessonId).find(
        level => level.isCurrentLevel
      ).app
  );

  const channelId =
    currentApp === 'music' ? getStandaloneProjectId() : undefined;

  return (
    <ProjectContainer channelId={channelId}>
      <div
        id="music-container"
        style={{
          width: '100%',
          height: '100%',
          visibility: currentApp !== 'music' && 'hidden',
        }}
      >
        <ProgressContainer appType={'music'}>
          <MusicView />
        </ProgressContainer>
      </div>

      {currentApp === 'standalone_video' && <StandaloneVideo2 />}
    </ProjectContainer>
  );
};
