import {useCallback} from 'react';

import {
  navigateToLevelId,
  setCurrentLevelId,
} from '../code-studio/progressRedux';
import {BubbleChoiceSublevel, LevelProperties} from '../lab2/types';
import notifyLevelChange from '../lab2/utils/notifyLevelChange';
import {useAppDispatch, useAppSelector} from '../util/reduxHooks';

export default function useNavigateToSublevel() {
  const dispatch = useAppDispatch();
  const currentLessonId = useAppSelector(
    state => state.progress.currentLessonId
  );
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  return useCallback(
    (
      parentLevelProperties: LevelProperties,
      sublevel: BubbleChoiceSublevel
    ) => {
      if (currentLessonId) {
        dispatch(navigateToLevelId(sublevel.level_id));
      } else if (parentLevelProperties.isProjectLevel) {
        // For BubbleChoice project levels, set the level ID in redux, and let the
        // MultiProjectContainer handle switching projects. The standard progress redux
        // system does not work for project levels since there is no progress, lesson, etc.
        dispatch(setCurrentLevelId(sublevel.level_id));
        // TODO: This is a dupe of code in navigateToLevelId(). Can we consolidate?
        notifyLevelChange(currentLevelId, sublevel.level_id);
        // TODO: Handle browser navigation.
      } else {
        window.location.href = sublevel.url;
      }
    },
    [currentLessonId, currentLevelId, dispatch]
  );
}
