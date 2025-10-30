import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';

import {
  getCurrentLesson,
  getCurrentLevel,
  levelById,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import {setIsLoading} from '@cdo/apps/lab2/lab2Redux';
import {useMultiProject} from '@cdo/apps/lab2/projects/MultiProjectContainer';
import {LevelPropertiesValidator} from '@cdo/apps/lab2/responseValidators';
import {
  BubbleChoiceLevelData,
  BubbleChoiceSublevel,
  LevelProperties,
} from '@cdo/apps/lab2/types';
import LevelPropertiesCache from '@cdo/apps/lab2/utils/LevelPropertiesCache';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {BubbleChoiceCustomModes} from '@cdo/generated-scripts/sharedConstants';

import {BubbleChoiceLevelProperties} from '../../types';
import useNavigateToSublevel from '../../useNavigateToSublevel';

import styles from './styles.module.scss';

// This is somewhat redundant with how Lab2 already loads level properties,
// but we need a way to verify the parent's level properties and pre-load
// all child level properties so we know which level is which.
// Ideally, Lab2 should just pre-load level properties for all levels in a
// lesson progression since it's all static.
async function loadLevelProperties(
  levelId: string,
  pathPrefix?: string,
  sublevelPosition?: number
) {
  const cached = LevelPropertiesCache.getById(parseInt(levelId));
  if (cached) {
    return cached;
  }
  const path = pathPrefix
    ? `${pathPrefix}${
        sublevelPosition ? `/sublevel/${sublevelPosition}` : ''
      }/level_properties`
    : `/levels/${levelId}/level_properties`;
  const {value} = await HttpClient.fetchJson<LevelProperties>(
    path,
    {},
    LevelPropertiesValidator
  );
  LevelPropertiesCache.set(path, value);
  return value;
}

enum Tab {
  Dancer = 'Dancer',
  Music = 'Music',
  Dance = 'Dance',
}

const labels: {[tab in Tab]: string} = {
  [Tab.Dancer]: 'Create Dancer',
  [Tab.Music]: 'Create Music',
  [Tab.Dance]: 'Dance Party',
};

/**
 * A custom component used for the custom Music Dance AI mode in BubbleChoice levels.
 * It pre-loads level properties for all sublevels, and displays a mode switcher bar
 * that allows users to switch between different sublevels without navigating back
 * to the parent bubble choice project.
 * Note that this could be genericized if we'd like to reuse it for other custom bubble choice modes.
 */
const ModeSwitchBar: React.FC<{levelId: number}> = ({levelId}) => {
  const dispatch = useAppDispatch();
  const multiProject = useMultiProject();
  const progressParentLevelId: string | undefined = useAppSelector(
    state => getCurrentLevel(state)?.parentLevelId
  );

  const parentLevelId =
    (progressParentLevelId && progressParentLevelId) ||
    multiProject?.parentLevelId?.toString();

  const [sublevelMap, setSublevelMap] =
    useState<{[tab in Tab]?: BubbleChoiceSublevel}>();

  const levelPropertiesPathPrefix = useAppSelector(state => {
    if (parentLevelId && state.progress.lessons) {
      const scriptName = state.progress.scriptName;
      const lessonPosition = getCurrentLesson(state)?.relative_position;
      const currentLevel = levelById(
        state.progress,
        state.progress.currentLessonId,
        parentLevelId
      );
      return `/s/${scriptName}/lessons/${lessonPosition}/levels/${currentLevel.levelNumber}`;
    }
  });

  const setupLevels = useCallback(async () => {
    if (parentLevelId === undefined) {
      setSublevelMap(undefined);
      return;
    }

    dispatch(setIsLoading(true));

    // Fetch parent level properties first
    const parentProperties = await loadLevelProperties(
      parentLevelId,
      levelPropertiesPathPrefix
    );

    if (
      parentProperties.appName === 'bubble_choice' &&
      (parentProperties as BubbleChoiceLevelProperties).customMode ===
        BubbleChoiceCustomModes.MUSIC_DANCE_AI
    ) {
      const sublevels = (parentProperties.levelData as BubbleChoiceLevelData)
        ?.sublevels;

      if (!sublevels) {
        dispatch(setIsLoading(false));
        return;
      }

      const sublevelMap: {[tab in Tab]?: BubbleChoiceSublevel} = {};
      // Go ahead and fetch all child level properties so we know which level is which.
      // In subsequent navigations, these should be cached.
      for (const sublevel of sublevels) {
        const properties = await loadLevelProperties(
          sublevel.level_id,
          levelPropertiesPathPrefix,
          sublevel.position
        );
        if (properties.appName === 'music') {
          sublevelMap[Tab.Music] = sublevel;
        }
        if (properties.appName === 'dance') {
          sublevelMap[
            (properties as DanceLevelProperties).guideMode === 'aiCodeGenerate'
              ? Tab.Dance
              : Tab.Dancer
          ] = sublevel;
        }
      }
      setSublevelMap(sublevelMap);
    }
    dispatch(setIsLoading(false));
  }, [dispatch, parentLevelId, levelPropertiesPathPrefix]);

  useEffect(() => {
    setupLevels();
  }, [setupLevels]);

  const navigateToSublevel = useNavigateToSublevel();

  if (!parentLevelId || !sublevelMap) {
    return null;
  }

  const parentLevelProperties = LevelPropertiesCache.getById(
    parseInt(parentLevelId)
  );
  if (!parentLevelProperties) {
    console.error('Invalid state: missing parent level properties');
    return null;
  }

  return (
    <div className={styles.container}>
      {Object.values(Tab).map(tab => {
        const sublevel = sublevelMap[tab];
        return (
          <button
            type="button"
            className={classNames(
              styles.button,
              !sublevel && styles.locked,
              levelId.toString() === sublevel?.level_id && styles.selected
            )}
            key={tab}
            onClick={() =>
              !sublevel
                ? undefined
                : navigateToSublevel(parentLevelProperties, sublevel)
            }
            disabled={!sublevel}
          >
            <BodyThreeText>
              {!sublevel && <FontAwesomeV6Icon iconName={'lock'} />}
              {labels[tab]}
            </BodyThreeText>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSwitchBar;
