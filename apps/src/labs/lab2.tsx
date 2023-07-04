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

interface AppProperties {
  name: string;
  usesChannel: boolean;
  usesProgressManager: boolean;
  backgroundMode: boolean;
  node: React.ReactNode;
}

const appsProperties: AppProperties[] = [
  {
    name: 'music',
    usesChannel: true,
    usesProgressManager: true,
    backgroundMode: true,
    node: <MusicView />,
  },
  {
    name: 'standalone_video',
    usesChannel: false,
    usesProgressManager: true,
    backgroundMode: false,
    node: <StandaloneVideo />,
  },
];

const Lab2: React.FunctionComponent = () => {
  const currentLessonLevels = useSelector((state: {progress: ProgressState}) =>
    levelsForLessonId(state.progress, state.progress.currentLessonId)
  );
  const currentAppName: string = currentLessonLevels.find(
    (level: LevelWithProgress) => level.isCurrentLevel
  ).app;
  const currentLessonAppNames: string[] = Array.from(
    new Set(currentLessonLevels.map((level: LevelWithProgress) => level.app))
  );
  const currentLessonAppProperties: AppProperties[] = appsProperties.filter(
    appProperties => currentLessonAppNames.includes(appProperties.name)
  );
  const currentAppProperties: AppProperties | undefined = appsProperties.find(
    appProperties => appProperties.name === currentAppName
  );

  const channelId: string | undefined = currentAppProperties?.usesChannel
    ? getStandaloneProjectId()
    : undefined;

  return (
    <ProjectContainer channelId={channelId}>
      {currentLessonAppProperties.map(appProperty => {
        if (appProperty.backgroundMode && appProperty.usesProgressManager) {
          return (
            <div
              id={`lab2-${appProperty.name}`}
              key={appProperty.name}
              style={{
                width: '100%',
                height: '100%',
                visibility: currentAppName === 'music' ? 'visible' : 'hidden',
              }}
            >
              <ProgressContainer appType={appProperty.name}>
                {appProperty.node}
              </ProgressContainer>
            </div>
          );
        } else if (appProperty.name === currentAppName) {
          return (
            <div
              id={`lab2-${appProperty.name}`}
              key={appProperty.name}
              style={{width: '100%', height: '100%'}}
            >
              {appProperty.node}
            </div>
          );
        }
      })}
    </ProjectContainer>
  );
};

export default Lab2;
