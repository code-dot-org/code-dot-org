import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {Suspense, useCallback, useEffect, useState} from 'react';

import {
  getCurrentLesson,
  getCurrentScriptLevelId,
  levelById,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import {setIsLoading} from '@cdo/apps/lab2/lab2Redux';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import ProjectManagerFactory from '@cdo/apps/lab2/projects/ProjectManagerFactory';
import {LevelPropertiesValidator} from '@cdo/apps/lab2/responseValidators';
import {
  BubbleChoiceLevelData,
  BubbleChoiceSublevel,
  Channel,
  LabProps,
  LevelProperties,
} from '@cdo/apps/lab2/types';
import LevelPropertiesCache from '@cdo/apps/lab2/utils/LevelPropertiesCache';
import Loading from '@cdo/apps/lab2/views/Loading';
import {getTypedKeys} from '@cdo/apps/types/utils';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../../lab2EntryPoints';
import {BubbleChoiceLevelProperties} from '../../types';

import {ParentLevelPropertiesContext} from './ParentLevelPropertiesContext';

import styles from './styles.module.scss';

enum Tab {
  Dancer = 'Dancer',
  Music = 'Music',
  Dance = 'Dance',
}

const labels: {[tab in Tab]: string} = {
  [Tab.Dancer]: 'Design',
  [Tab.Music]: 'Mix',
  [Tab.Dance]: 'Move',
};

interface MusicDanceAiProps {
  levelProperties: BubbleChoiceLevelProperties;
  channel: Channel;
}

async function loadLevelProperties(path: string): Promise<LevelProperties> {
  const cached = LevelPropertiesCache.get(path);
  if (cached) {
    return cached;
  }
  const {value} = await HttpClient.fetchJson<LevelProperties>(
    path,
    {},
    LevelPropertiesValidator
  );
  LevelPropertiesCache.set(path, value);
  return value;
}

interface LabData extends LabProps {
  // In addition to LabProps, we'll also pass down a dedicated ProjectManager for each sublevel,
  // so each lab is writing and reading the correct project (instead accessing the singleton from Lab2Registry).
  // Note that this requires the LabView to accept a ProjectManager prop, which is currently only supported by Music and Dance.
  projectManager?: ProjectManager;
}

/**
 * View for the custom Music Dance AI mode in Bubble Choice levels.
 * Displays tabs for each of the three sublevel types and renders the appropriate Lab view for each.
 * Note that the Lab switching logic is effectively a mini-reimplementation of ProjectContainer+LabViewsRenderer
 * and this could be made generic for reuse in other multi-project scenarios.
 */
const MusicDanceAi: React.FC<MusicDanceAiProps> = ({
  levelProperties,
  channel,
}) => {
  const [currentTab, setCurrentTab] = useState<Tab>();
  const [propsMap, setPropsMap] = useState<{[tab in Tab]?: LabData}>({});
  const userId = useAppSelector(state => state.progress.viewAsUserId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const scriptLevelId = useAppSelector(getCurrentScriptLevelId);
  const dispatch = useAppDispatch();

  const levelPropertiesPathPrefix = useAppSelector(state => {
    if (state.progress.lessons) {
      const scriptName = state.progress.scriptName;
      const lessonPosition = getCurrentLesson(state)?.relative_position;
      const currentLevel = levelById(
        state.progress,
        state.progress.currentLessonId,
        levelProperties.id.toString()
      );
      return `/s/${scriptName}/lessons/${lessonPosition}/levels/${currentLevel.levelNumber}`;
    }
  });

  const getLevelPropertiesPath = useCallback(
    (sublevel: BubbleChoiceSublevel) => {
      if (!levelPropertiesPathPrefix) {
        return `/levels/${sublevel.level_id}/level_properties`;
      }

      return `${levelPropertiesPathPrefix}/sublevel/${sublevel.position}/level_properties`;
    },
    [levelPropertiesPathPrefix]
  );

  // Load level properties and project data for each sublevel.
  const loadData = useCallback(async () => {
    const sublevels = (
      levelProperties.levelData as BubbleChoiceLevelData | undefined
    )?.sublevels;
    if (!sublevels) {
      return;
    }

    const map: {[tab in Tab]?: LabData} = {};
    dispatch(setIsLoading(true));
    for (const sublevel of sublevels) {
      const sublevelProperties = await loadLevelProperties(
        getLevelPropertiesPath(sublevel)
      );
      const data: LabData = {levelProperties: sublevelProperties};

      let projectManager: ProjectManager | null = null;

      if (levelProperties.isProjectLevel && channel.subprojects) {
        const channelId = channel.subprojects.find(
          ({level_id}) => level_id.toString() === sublevel.level_id
        )?.project_id;
        if (channelId) {
          projectManager = ProjectManagerFactory.getProjectManager(channelId);
        }
      } else {
        projectManager = await ProjectManagerFactory.getProjectManagerForLevel(
          parseInt(sublevel.level_id),
          userId || undefined,
          scriptId || undefined,
          scriptLevelId
        );
      }

      if (projectManager) {
        const {sources, channel} = await projectManager.load();
        data.initialSources = sources;
        data.channel = channel;
        data.projectManager = projectManager;
      }
      if (sublevelProperties.appName === 'music') {
        map[Tab.Music] = data;
      } else if (sublevelProperties.appName === 'dance') {
        map[
          (sublevelProperties as DanceLevelProperties).guideMode ===
          'aiCodeGenerate'
            ? Tab.Dance
            : Tab.Dancer
        ] = data;
      }
    }
    setPropsMap(map);
    setCurrentTab(getTypedKeys(map)[0]);
    dispatch(setIsLoading(false));
  }, [
    levelProperties,
    channel.subprojects,
    userId,
    scriptId,
    scriptLevelId,
    getLevelPropertiesPath,
    dispatch,
  ]);

  // Default to dark mode for this experience.
  const {setTheme} = useTheme();
  useEffect(() => {
    setTheme('Dark');
  }, [setTheme]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Delay rendering each tab until we see it for the first time to avoid UI issues (ex: Music Lab pack dialog locking focus while hidden).
  const [seenTabs, setSeenTabs] = useState<Set<Tab>>(new Set());
  useEffect(() => {
    if (currentTab) {
      setSeenTabs(prevSeenTabs => new Set(prevSeenTabs).add(currentTab));
    }
  }, [currentTab]);

  if (!currentTab) {
    return null;
  }

  return (
    <ParentLevelPropertiesContext.Provider value={levelProperties}>
      <div className={styles.container}>
        <div className={styles.tabSwitcher}>
          {Object.values(Tab).map(tab => {
            const disabled = !propsMap[tab];
            return (
              <button
                type="button"
                className={classNames(
                  styles.button,
                  disabled && styles.locked,
                  tab === currentTab && styles.selected
                )}
                key={tab}
                onClick={() => (disabled ? undefined : setCurrentTab(tab))}
                disabled={disabled}
              >
                <BodyThreeText>
                  {disabled && <FontAwesomeV6Icon iconName={'lock'} />}
                  {labels[tab]}
                </BodyThreeText>
              </button>
            );
          })}
        </div>
        <div className={styles.labsContainer}>
          {Array.from(seenTabs).map(tab => {
            const sublevelProps = propsMap[tab];
            const LabView =
              sublevelProps &&
              lab2EntryPoints[sublevelProps?.levelProperties.appName]?.view;
            const hidden = tab !== currentTab;
            return (
              LabView && (
                <div
                  className={classNames(
                    styles.labContainer,
                    hidden && styles.hidden
                  )}
                  key={tab}
                  ref={el => {
                    if (el) {
                      el.inert = hidden;
                    }
                  }}
                >
                  <Suspense fallback={<Loading isLoading={true} />}>
                    <LabView {...sublevelProps} />
                  </Suspense>
                </div>
              )
            );
          })}
        </div>
      </div>
    </ParentLevelPropertiesContext.Provider>
  );
};

export default MusicDanceAi;
