// Lab2
//
// A React component used for a ScriptLevel that uses Lab2.  It examines the
// set of levels in the current lesson, determines the set of apps they use,
// and instantiates a React component for each app that it supports.  This
// allows level switching between those levels without a page reload.

import React from 'react';
import {Provider, useSelector} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {levelsForLessonId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {LevelWithProgress} from '@cdo/apps/types/progressTypes';
import {
  getProjectType,
  getStandaloneProjectId,
} from '@cdo/apps/lab2/projects/utils';
import {logError} from '@cdo/apps/music/utils/MusicMetrics';
import Lab2Wrapper from './Lab2Wrapper';
import ProjectContainer from '../projects/ProjectContainer';
import ProgressContainer from '../progress/ProgressContainer';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';
import MusicView from '@cdo/apps/music/views/MusicView';
import {LabState} from '../lab2Redux';

interface AppProperties {
  name: string;
  usesChannel: boolean;
  backgroundMode: boolean;
  node: React.ReactNode;
}

const appsProperties: AppProperties[] = [
  {
    name: 'music',
    usesChannel: true,
    backgroundMode: true,
    node: <MusicView />,
  },
  {
    name: 'standalone_video',
    usesChannel: false,
    backgroundMode: false,
    node: <StandaloneVideo />,
  },
];

const Lab2: React.FunctionComponent = () => {
  const currentLessonLevels = useSelector((state: {progress: ProgressState}) =>
    levelsForLessonId(state.progress, state.progress.currentLessonId)
  );
  const currentProjectType = useSelector(
    (state: {lab: LabState}) => state.lab.currentProjectType
  );
  let currentLessonAppProperties: AppProperties[];
  let currentAppName: string;

  if (currentLessonLevels) {
    currentAppName = currentLessonLevels.find(
      (level: LevelWithProgress) => level.isCurrentLevel
    ).app;
    const currentLessonAppNames: string[] = Array.from(
      new Set(currentLessonLevels.map((level: LevelWithProgress) => level.app))
    );
    currentLessonAppProperties = appsProperties.filter(appProperties =>
      currentLessonAppNames.includes(appProperties.name)
    );
  } else {
    // If we don't have a lesson, we are either on a /project or /level page.
    // The app type will either already be seeded in
    // lab2Redux (from a remix action) or it will have been sent
    // via the server (for a /project or /level page).
    currentAppName = currentProjectType || getProjectType();
    currentLessonAppProperties = appsProperties.filter(
      appProperties => appProperties.name === currentAppName
    );
  }

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
          return (
            <ProgressContainer
              key={appProperty.name}
              appType={appProperty.name}
            >
              {appProperty.backgroundMode && (
                <div
                  id={`lab2-${appProperty.name}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    visibility:
                      currentAppName === appProperty.name
                        ? 'visible'
                        : 'hidden',
                  }}
                >
                  {appProperty.node}
                </div>
              )}

              {!appProperty.backgroundMode &&
                appProperty.name === currentAppName && (
                  <div
                    id={`lab2-${appProperty.name}`}
                    style={{width: '100%', height: '100%'}}
                  >
                    {appProperty.node}
                  </div>
                )}
            </ProgressContainer>
          );
        })}
      </ProjectContainer>
    </Lab2Wrapper>
  );
};

const Lab2WithProvider: React.FunctionComponent = () => {
  return (
    <Provider store={getStore()}>
      <Lab2 />
    </Provider>
  );
};

export default Lab2WithProvider;
