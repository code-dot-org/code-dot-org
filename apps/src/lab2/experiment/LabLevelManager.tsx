import React, {Suspense, useEffect, useState} from 'react';

import {RootState} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';
import {getStandaloneProjectId} from '../projects/utils';
import {LevelProperties} from '../types';
import Loading from '../views/Loading';

import SourcesContainer from './SourcesContainer';

type LevelPropertiesMap = {[levelId: string]: LevelProperties};

function selectLevelPropertiesPath(state: RootState) {
  const {lessons, currentLevelId, scriptName, currentLessonId} = state.progress;
  if (lessons) {
    const currentLesson = lessons.find(lesson => lesson.id === currentLessonId);

    if (!currentLesson) {
      console.warn('No current lesson');
      return;
    }

    // TODO: TEACH-1864
    // use /courses/:course_name/units/:unit_position/... instead of /s/
    return `/s/${scriptName}/lessons/${currentLesson.relative_position}/level_properties`;
  } else if (currentLevelId !== null) {
    return `/levels/${currentLevelId}/level_properties`;
  } else {
    return undefined;
  }
}

const LabLevelManager: React.FC = () => {
  const levelPropertiesPath = useAppSelector(selectLevelPropertiesPath);

  const [isLoading, setIsLoading] = useState(true);
  const [levelPropertiesMap, setLevelPropertiesMap] =
    useState<LevelPropertiesMap>();

  useEffect(() => {
    if (!levelPropertiesPath) {
      console.warn('No level properties path available');
      return;
    }

    setIsLoading(true);
    HttpClient.fetchJson<LevelPropertiesMap>(levelPropertiesPath)
      .then(({value}) => setLevelPropertiesMap(value))
      .catch(error => {
        // Error handling, UI
        console.error('Error fetching level properties:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [levelPropertiesPath]);

  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  if (isLoading || !levelPropertiesMap) {
    return <div>Loading level properties...</div>;
  }

  if (!currentLevelId) {
    console.warn('Not on a level');
    return null;
  }

  const levelProperties = levelPropertiesMap[currentLevelId];

  if (!levelProperties) {
    console.warn(`No properties found for level ${currentLevelId}`);
    return <div>No properties available for this level.</div>;
  }
  const {appName, usesProjects, isProjectLevel} = levelProperties;

  const properties = lab2EntryPoints[appName];
  if (!properties) {
    console.warn("Don't know how to render app: " + appName);
    return null;
  }

  const LabView = properties.view;

  return (
    <div
      id={`lab2-${appName}`}
      className={'TODO_FIX:moduleStyles.labContainer'}
    >
      <SourcesContainer
        usesProjects={usesProjects || false}
        standaloneChannelId={
          (isProjectLevel && getStandaloneProjectId()) || undefined
        }
      >
        <Suspense fallback={<Loading isLoading={true} />}>
          <LabView levelProperties={levelProperties} />
        </Suspense>
      </SourcesContainer>
    </div>
  );
};

export default LabLevelManager;
