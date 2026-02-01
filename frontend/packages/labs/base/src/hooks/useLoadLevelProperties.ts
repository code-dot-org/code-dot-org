import {useEffect} from 'react';

import {useLevelProperties, useApiClient} from '@code-dot-org/core/api';
import {progressActions} from '@code-dot-org/progress/redux';

import {setPageError} from '../redux/labSlice';
import {useAppDispatch, useAppSelector} from '../redux/store';

/**
 * Loads all level properties for all levels in the current lesson,
 * or current level if not in a lesson.
 */
export function useLoadLevelProperties() {
  const dispatch = useAppDispatch();

  const {
    scriptName,
    currentLevelId,
    standaloneProjectType,
    lessons,
    currentLessonId,
  } = useAppSelector(({progress}) => progress);

  const lessonPosition = lessons?.find(
    lesson => lesson.id === currentLessonId,
  )?.relativePosition;

  const api = useApiClient();
  const {data: mapData, error} = useLevelProperties(api, {
    levelId: currentLevelId,
    standaloneProjectType,
    scriptName,
    lessonPosition,
  });

  useEffect(() => {
    if (mapData) {
      // If this is a standalone project, set the current level
      if (standaloneProjectType) {
        dispatch(
          progressActions.setCurrentLevelId(parseInt(Object.keys(mapData)[0])),
        );
      }
    } else if (error) {
      dispatch(
        setPageError({
          errorMessage: 'Error loading level properties',
          error,
          details: {},
        }),
      );
    }
  }, [standaloneProjectType, dispatch, error, mapData]);

  return mapData;
}
