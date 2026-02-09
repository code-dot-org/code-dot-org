import {useEffect, useState} from 'react';

import DCDO from '@cdo/apps/dcdo';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {setPageError} from '../lab2Redux';
import {LevelPropertiesMapValidator} from '../responseValidators';
import {LevelPropertiesMap} from '../types';

const useLessonIdPath = DCDO.get(
  'lab2-fetch-level-properties-by-lesson-id',
  true
);

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
      return useLessonIdPath
        ? `/lessons/${currentLessonId}/level_properties`
        : `/s/${scriptName}/lessons/${lessonPosition}/level_properties`;
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
