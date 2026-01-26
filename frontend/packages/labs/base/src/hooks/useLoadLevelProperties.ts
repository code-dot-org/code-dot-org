import {useEffect, useState} from 'react';

import {HttpClient} from '@code-dot-org/api';
import {
  getEnvironmentFromHostname,
  getDashboardApiUrl,
} from '@code-dot-org/core';

import {setPageError} from '../redux/labSlice';
import {useAppDispatch, useAppSelector} from '../redux/store';
import {LevelPropertiesMapValidator} from '../responseValidators';
import {LevelPropertiesMap} from '../types';

async function loadLevelProperties(path: string) {
  console.log('loadLevel', path);
  const response = await HttpClient.fetchJson<LevelPropertiesMap>(
    path,
    undefined,
    LevelPropertiesMapValidator,
  );
  return response.value;
}

/**
 * Loads all level properties for all levels in the current lesson,
 * or current level if not in a lesson.
 */
export function useLoadLevelProperties() {
  const dispatch = useAppDispatch();
  const [propertiesMap, setPropertiesMap] = useState<LevelPropertiesMap>();
  const host = getDashboardApiUrl(getEnvironmentFromHostname());

  const path = useAppSelector(({progress}) => {
    console.log(progress);
    const {scriptName, currentLevelId, lessons, currentLessonId} = progress;
    const lessonPosition = lessons?.find(
      lesson => lesson.id === currentLessonId,
    )?.relativePosition;
    if (scriptName && lessonPosition) {
      return `${host}/s/${scriptName}/lessons/${lessonPosition}/level_properties`;
    }
    if (currentLevelId) {
      return `${host}/levels/${currentLevelId}/level_properties`;
    }
    // TODO: Standalone project levels
    const projectType = '';
    if (projectType) {
      return `${host}/projects/${projectType}/level_properties`;
    }
  });

  useEffect(() => {
    console.log('path?', path);
    if (path) {
      loadLevelProperties(path)
        .then(setPropertiesMap)
        .catch(error => {
          dispatch(
            setPageError({
              errorMessage: 'Error loading level properties',
              error,
              details: {path},
            }),
          );
        });
    }
  }, [dispatch, path]);

  return propertiesMap;
}
