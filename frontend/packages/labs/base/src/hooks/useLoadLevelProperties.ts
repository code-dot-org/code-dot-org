import {useEffect, useState} from 'react';

import {HttpClient} from '@code-dot-org/api';
import {
  getEnvironmentFromHostname,
  getDashboardApiUrl,
} from '@code-dot-org/core';
import {progressActions} from '@code-dot-org/progress/redux';

import {setPageError} from '../redux/labSlice';
import {useAppDispatch, useAppSelector} from '../redux/store';
import {LevelPropertiesMapValidator} from '../responseValidators';
import type {LevelPropertiesMap} from '../types';

async function loadLevelProperties(path: string) {
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

  const standaloneProjectType = useAppSelector(
    state => state.progress.standaloneProjectType,
  );

  const path = useAppSelector(({progress}) => {
    const {
      scriptName,
      currentLevelId,
      standaloneProjectType,
      lessons,
      currentLessonId,
    } = progress;
    const lessonPosition = lessons?.find(
      lesson => lesson.id === currentLessonId,
    )?.relativePosition;
    if (standaloneProjectType) {
      return `${host}/projects/${standaloneProjectType}/level_properties`;
    }
    if (scriptName && lessonPosition) {
      return `${host}/s/${scriptName}/lessons/${lessonPosition}/level_properties`;
    }
    if (currentLevelId) {
      return `${host}/levels/${currentLevelId}/level_properties`;
    }
  });

  useEffect(() => {
    if (path) {
      loadLevelProperties(path)
        .then(propertiesMap => {
          setPropertiesMap(propertiesMap);

          // If this is a standalone project, set the current level
          if (standaloneProjectType) {
            dispatch(
              progressActions.setCurrentLevelId(
                parseInt(Object.keys(propertiesMap)[0]),
              ),
            );
          }
        })
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
  }, [standaloneProjectType, dispatch, path]);

  return propertiesMap;
}
