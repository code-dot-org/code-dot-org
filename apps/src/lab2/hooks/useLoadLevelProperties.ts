import {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {setPageError} from '../lab2Redux';
import {LevelPropertiesMapValidator} from '../responseValidators';
import {LevelPropertiesMap} from '../types';

async function loadLevelProperties(path: string) {
  const response = await HttpClient.fetchJson<LevelPropertiesMap>(
    path,
    undefined,
    LevelPropertiesMapValidator
  );
  return response.value;
}

/**
 * Loads all level properties for all levels in the current lesson,
 * or current level if not in a lesson.
 */
export default function useLoadLevelProperties() {
  const dispatch = useAppDispatch();
  const [propertiesMap, setPropertiesMap] = useState<LevelPropertiesMap>();

  const path = useAppSelector(({progress}) => {
    const {scriptName, currentLevelId, lessons, currentLessonId} = progress;
    const lessonPosition = lessons?.find(
      lesson => lesson.id === currentLessonId
    )?.position;
    if (scriptName && lessonPosition) {
      return `/s/${scriptName}/lessons/${lessonPosition}/level_properties`;
    }
    if (currentLevelId) {
      return `/levels/${currentLevelId}/level_properties`;
    }
  });

  useEffect(() => {
    if (path) {
      loadLevelProperties(path)
        .then(setPropertiesMap)
        .catch(error => {
          dispatch(
            setPageError({
              errorMessage: 'Error loading level properties',
              error,
              details: {path},
            })
          );
        });
    }
  }, [dispatch, path]);

  return propertiesMap;
}
