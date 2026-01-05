import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {memo, Suspense, useCallback, useEffect, useState} from 'react';

import {
  getCurrentLesson,
  levelById,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {GENERATED_DANCER_STORAGE_KEY} from '@cdo/apps/dance/ai/constants';
import {DanceProjectSources} from '@cdo/apps/dance/types';
import {setIsLoading} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import ProjectManagerFactory from '@cdo/apps/lab2/projects/ProjectManagerFactory';
import {getIsShareView} from '@cdo/apps/lab2/projects/utils';
import {LevelPropertiesValidator} from '@cdo/apps/lab2/responseValidators';
import {
  BubbleChoiceLevelData,
  BubbleChoiceSublevel,
  Channel,
  LevelProperties,
} from '@cdo/apps/lab2/types';
import LevelPropertiesCache from '@cdo/apps/lab2/utils/LevelPropertiesCache';
import Loading from '@cdo/apps/lab2/views/Loading';
import {getTypedKeys} from '@cdo/apps/types/utils';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {trySetSessionStorage} from '@cdo/apps/utils';
import DancerIcon from '@cdo/static/dance/mixMoveAi/design.svg';
import MusicIcon from '@cdo/static/dance/mixMoveAi/mix.svg';
import DanceIcon from '@cdo/static/dance/mixMoveAi/move.svg';

import {lab2EntryPoints} from '../../../../lab2EntryPoints';
import {BubbleChoiceLevelProperties} from '../../types';

import {MusicProjectContext} from './MusicProjectContext';
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

const icons: {[tab in Tab]: string} = {
  [Tab.Dancer]: DancerIcon,
  [Tab.Music]: MusicIcon,
  [Tab.Dance]: DanceIcon,
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

interface LabData {
  levelProperties: LevelProperties;
  // We pass down a dedicated ProjectManager for each sublevel, so each lab is writing
  // and reading the correct project (instead accessing the singleton from Lab2Registry).
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
  const [tabDataMap, setTabDataMap] = useState<{[tab in Tab]?: LabData}>();
  const userId = useAppSelector(state => state.progress.viewAsUserId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
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
    if (tabDataMap) {
      // Already loaded; return.
      return;
    }
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
      const appName = sublevelProperties.appName;
      let tab: Tab | undefined;
      if (appName === 'music') {
        tab = Tab.Music;
      } else if (appName === 'dance' && 'guideMode' in sublevelProperties) {
        const guideMode = sublevelProperties.guideMode;
        tab = guideMode === 'aiCodeGenerate' ? Tab.Dance : Tab.Dancer;
      }

      if (!tab) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logWarning('Invalid level type ' + sublevelProperties.appName);
        continue;
      }

      const data: LabData = {levelProperties: sublevelProperties};

      let projectManager: ProjectManager | null = null;

      if (levelProperties.isProjectLevel) {
        let channelId: string | undefined;
        // Check subprojects first.
        if (channel.subprojects) {
          channelId = channel.subprojects.find(
            ({level_id}) => level_id.toString() === sublevel.level_id
          )?.channel_id;
        } else if (channel.labConfig) {
          // Otherwise, check labConfig for cases where we've transitioned from a script level.
          channelId = channel.labConfig[tab]?.channelId;
        }

        if (!channelId) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logWarning(
              'Expected to find subproject channel ID for standalone project.'
            );
          continue;
        }

        projectManager = ProjectManagerFactory.getProjectManager(channelId);
      } else {
        projectManager = await ProjectManagerFactory.getProjectManagerForLevel(
          parseInt(sublevel.level_id),
          userId || undefined,
          scriptId || undefined
        );
      }

      if (projectManager) {
        const {sources} = await projectManager.load();
        data.projectManager = projectManager;
        // If present, load the generated dancer metadata into local storage so it's available for the Dance tab.
        if (
          tab === Tab.Dancer &&
          (sources as DanceProjectSources)?.generatedDancer
        ) {
          trySetSessionStorage(
            GENERATED_DANCER_STORAGE_KEY,
            JSON.stringify((sources as DanceProjectSources).generatedDancer)
          );
        }
      }
      map[tab] = data;
    }

    setTabDataMap(map);
    dispatch(setIsLoading(false));
  }, [
    levelProperties,
    channel.labConfig,
    channel.subprojects,
    userId,
    scriptId,
    getLevelPropertiesPath,
    dispatch,
    tabDataMap,
  ]);

  // Set the initial tab once data is loaded if we haven't already.
  useEffect(() => {
    if (!currentTab && tabDataMap) {
      setCurrentTab(getIsShareView() ? Tab.Dance : getTypedKeys(tabDataMap)[0]);
    }
  }, [currentTab, tabDataMap]);

  // Clear out tab data when switching levels or view as user.
  useEffect(() => {
    setTabDataMap(undefined);
  }, [levelProperties.id, userId]);

  useEffect(() => {
    if (!tabDataMap) {
      return;
    }
    // Update the parent channel with sublevel channel IDs once we've loaded everything.
    const updatedLabConfig: {[key: string]: {channelId: string}} = {};
    const updatedSubprojects: {level_id: number; channel_id: string}[] = [];

    for (const tab of getTypedKeys(tabDataMap)) {
      const data = tabDataMap[tab];
      if (!data?.projectManager) {
        continue;
      }
      updatedLabConfig[tab] = {channelId: data.projectManager.getChannelId()};
      updatedSubprojects.push({
        level_id: data.levelProperties.id,
        channel_id: data.projectManager.getChannelId(),
      });
      data.projectManager?.addSaveSuccessListener(() => {
        Lab2Registry.getInstance()
          .getProjectManager()
          ?.updateChannel({updatedAt: new Date().toISOString()}, true);
      });
    }
    const channelUpdate: Partial<Channel> = {
      labConfig: updatedLabConfig,
    };
    if (levelProperties.isProjectLevel && !channel.subprojects) {
      // Also update the subprojects in the specific case where we're
      // viewing a project created from a script level in a standalone context.
      channelUpdate.subprojects = updatedSubprojects;
    }
    Lab2Registry.getInstance()
      .getProjectManager()
      ?.updateChannel(channelUpdate, true);
  }, [tabDataMap, channel.subprojects, levelProperties.isProjectLevel]);

  // Default to dark mode for this experience.
  const {setTheme} = useTheme();
  useEffect(() => {
    setTheme('Dark');
  }, [setTheme]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!tabDataMap || !currentTab) {
    return null;
  }

  const tabData = tabDataMap[currentTab];
  const LabView =
    tabData && lab2EntryPoints[tabData?.levelProperties.appName]?.view;

  if (!LabView) {
    console.error('Invalid state: selected tab without data');
    return null;
  }

  const musicData = tabDataMap[Tab.Music];

  const labProps = {
    ...tabData,
    initialSources: tabData.projectManager?.getLastSource(),
    channel: tabData.projectManager?.getLastChannel(),
  };

  return (
    <ParentLevelPropertiesContext.Provider value={levelProperties}>
      <MusicProjectContext.Provider
        value={musicData?.projectManager?.getChannelId()}
      >
        <div className={styles.container}>
          {!getIsShareView() && (
            <div className={styles.tabSwitcher}>
              {Object.values(Tab).map(tab => {
                const disabled = !tabDataMap[tab];
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
                    {disabled && <FontAwesomeV6Icon iconName={'lock'} />}
                    {!disabled && (
                      <img
                        src={icons[tab]}
                        alt=""
                        className={classNames(
                          styles.tabIcon,
                          tab !== currentTab && styles.tabIconUnselected
                        )}
                      />
                    )}
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          )}
          <div className={styles.labsContainer}>
            <div className={classNames(styles.labContainer)}>
              <Suspense fallback={<Loading isLoading={true} />}>
                <LabView {...labProps} key={currentTab} />
              </Suspense>
            </div>
          </div>
        </div>
      </MusicProjectContext.Provider>
    </ParentLevelPropertiesContext.Provider>
  );
};

export default memo(MusicDanceAi);
