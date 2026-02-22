import {useEffect, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';
import {WIDGET2_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
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
  const isWidget2SourcesMode = getAppOptionsEditBlocks() === WIDGET2_SOURCES;
  const widget2Id = isWidget2SourcesMode ? queryParams('widget2') : null;
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
      return `/levels/${currentLevelId}/level_properties${
        widget2Id ? `?widget2=${widget2Id}` : ''
      }`;
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
