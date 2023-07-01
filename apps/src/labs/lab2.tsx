import React from 'react';
import {levelsForLessonId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {LevelWithProgress} from '@cdo/apps/types/progressTypes';
import {getStandaloneProjectId} from '@cdo/apps/labs/projects/utils';
import ProjectContainer from '@cdo/apps/labs/projects/ProjectContainer';
import ProgressContainer from '@cdo/apps/labs/progress/ProgressContainer';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';
import MusicView from '@cdo/apps/music/views/MusicView';
import {useSelector} from 'react-redux';

const Lab2: React.FunctionComponent = () => {
  const currentApp = useSelector(
    (state: {progress: ProgressState}) =>
      levelsForLessonId(state.progress, state.progress.currentLessonId).find(
        (level: LevelWithProgress) => level.isCurrentLevel
      ).app
  );

  const channelId: string | null =
    currentApp === 'music' ? getStandaloneProjectId() : null;

  return (
    <ProjectContainer channelId={channelId || undefined}>
      <div
        id="music-container"
        style={{
          width: '100%',
          height: '100%',
          visibility: currentApp === 'music' ? 'visible' : 'hidden',
        }}
      >
        <ProgressContainer appType={'music'}>
          <MusicView />
        </ProgressContainer>
      </div>

      {currentApp === 'standalone_video' && <StandaloneVideo />}
    </ProjectContainer>
  );
};

export default Lab2;
