// Lab2
//
// A React component used for a ScriptLevel that uses Lab2.  It examines the
// set of levels in the current lesson, determines the set of apps they use,
// and instantiates a React component for each app that it supports.  This
// allows level switching between those levels without a page reload.

import React from 'react';
import {useSelector} from 'react-redux';
import {levelsForLessonId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {LevelWithProgress} from '@cdo/apps/types/progressTypes';
import {getStandaloneProjectId} from '@cdo/apps/labs/projects/utils';
import {logError} from '@cdo/apps/music/utils/MusicMetrics';
import Lab2Wrapper from './Lab2Wrapper';
import ProjectContainer from '../projects/ProjectContainer';
import ProgressContainer from '../progress/ProgressContainer';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';
import MusicView from '@cdo/apps/music/views/MusicView';

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
    <Lab2Wrapper
      onError={(error, componentStack) =>
        logError({error: error.toString(), componentStack})
      }
    >
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
    </Lab2Wrapper>
  );
};

export default Lab2;
