import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {kitIcons} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';

import {ChatButtonData, SystemPromptSettings} from '@cdo/apps/aichat/types';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {ProjectSources} from '@cdo/apps/lab2/types';
import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import StudentRubricView from '@cdo/apps/lab2/views/components/rubrics/StudentRubricView';
import {commonI18n} from '@cdo/apps/types/locale';
import {getTypedKeys} from '@cdo/apps/types/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useRubric} from '../../rubrics/RubricWrapper';
import ForTeachersOnly from '../ForTeachersOnly';
import Instructions, {InstructionsProps} from '../InstructionsV2';
import NavigationArea from '../NavigationArea';

import CopyrightButton from './CopyrightButton';
import ResourcePanelExtraLinks from './ResourcePanelExtraLinks';
import SettingsPanel from './SettingsPanel';
import ValidationPanel from './ValidationPanel';
import {VersionHistoryPanel} from './VersionHistory';

import styles from './styles.module.scss';

enum Tabs {
  Instructions = 'instructions',
  AiTutor = 'aiTutor',
  TeachersOnly = 'teachersOnly',
  StudentRubric = 'studentRubric',
  VersionHistory = 'versionHistory',
  Validation = 'validation',
}

export interface Setting {
  id: string;
  label: string;
  options: {value: string; text: string}[];
  selectedValue: string | undefined;
  onChange: (value: string) => void;
}

interface VersionHistoryProps {
  startSources: ProjectSources;
}

const tabInfo: {[key in Tabs]: {title: string; icon: string}} = {
  [Tabs.Instructions]: {title: commonI18n.instructions(), icon: 'info-circle'},
  [Tabs.AiTutor]: {title: commonI18n.aiTutor(), icon: 'ai-head-solid'},
  [Tabs.TeachersOnly]: {
    title: commonI18n.teachingTips(),
    icon: 'chalkboard-teacher',
  },
  [Tabs.StudentRubric]: {
    title: commonI18n.rubric(),
    icon: 'clipboard-list',
  },
  [Tabs.VersionHistory]: {
    title: commonI18n.versionHistory_header(),
    icon: 'history',
  },
  [Tabs.Validation]: {
    title: commonI18n.validation(),
    icon: 'clipboard-check',
  },
};

type ResourcePanelProps = InstructionsProps & {
  className?: string;
  headerClassName?: string;
  hiddenContextCallback?: () => Promise<string>;
  rightHeaderContent?: React.ReactNode;
  includeFooterSpacing?: boolean;
  settings?: Setting[];
  versionHistoryProps?: VersionHistoryProps;
  aiTutorSystemPromptSettings?: SystemPromptSettings;
  aiTutorMultimodalEnabled?: boolean;
  aiTutorChatButtonData?: ChatButtonData[];
};

/**
 * Display various instructional resources for the level as tabs.
 */
const ResourcePanel: React.FC<ResourcePanelProps> = ({
  className,
  headerClassName,
  hiddenContextCallback,
  rightHeaderContent,
  includeFooterSpacing = true,
  settings,
  versionHistoryProps,
  aiTutorSystemPromptSettings,
  aiTutorMultimodalEnabled,
  aiTutorChatButtonData,
  ...instructionsProps
}) => {
  const {theme} = useTheme();
  const {showRubric} = useRubric();
  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.Instructions);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const isViewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const isWidgetView = instructionsProps.levelProperties.widgetView || false;

  const levelId = instructionsProps.levelProperties.id;
  const hasValidationConditions = useAppSelector(
    state => state.lab.validationState?.hasConditions
  );
  const levelName = instructionsProps.levelProperties.name;
  const channelId = useAppSelector(state => state.lab.channel?.id);

  // Build available tabs based on level information.
  const availableTabs = useMemo(() => {
    const tabMap: {[key in Tabs]?: React.ReactNode} = {};
    const levelProperties = instructionsProps.levelProperties;

    if (levelProperties.longInstructions) {
      tabMap[Tabs.Instructions] = (
        <Instructions {...instructionsProps} hideNavigation />
      );
    }

    if (instructionsProps.validationSettings && hasValidationConditions) {
      tabMap[Tabs.Validation] = (
        <ValidationPanel {...instructionsProps.validationSettings} />
      );
    }

    if (
      isUserTeacher &&
      (levelProperties.teacherMarkdown ||
        levelProperties.predictSettings?.solution)
    ) {
      tabMap[Tabs.TeachersOnly] = (
        <ForTeachersOnly
          levelProperties={levelProperties}
          className={styles.panelContent}
        />
      );
    }

    if (
      (levelProperties.aiTutorAvailable ||
        queryParams('show-ai-tutor2') === 'true') &&
      hiddenContextCallback
    ) {
      tabMap[Tabs.AiTutor] = (
        <AiTutor2Chat
          hiddenContextCallback={hiddenContextCallback}
          aiTutorSystemPromptSettings={aiTutorSystemPromptSettings}
          aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
          levelName={levelName}
          channelId={channelId}
          aiTutorChatButtonData={aiTutorChatButtonData}
        />
      );
    }

    // The version history tab is hidden in read only mode with two exceptions:
    // if the user is viewing an old version of the project, or if this is a teacher viewing
    // a student's project (in which case they can view old versions, but not restore them).
    // We never show the version history tab in widget view, as widget view is always read-only
    // and therefore can never have version history.
    const versionHistoryHidden =
      (isReadOnly && !isViewingOldVersion && !viewAsUserId) || isWidgetView;
    if (versionHistoryProps && !versionHistoryHidden) {
      tabMap[Tabs.VersionHistory] = (
        <VersionHistoryPanel
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          startSources={versionHistoryProps.startSources}
          appName={levelProperties.appName}
          levelId={levelId}
        />
      );
    }

    if (showRubric) {
      tabMap[Tabs.StudentRubric] = <StudentRubricView />;
    }

    return tabMap;
  }, [
    instructionsProps,
    hasValidationConditions,
    isUserTeacher,
    hiddenContextCallback,
    isReadOnly,
    isViewingOldVersion,
    viewAsUserId,
    isWidgetView,
    versionHistoryProps,
    showRubric,
    aiTutorSystemPromptSettings,
    aiTutorMultimodalEnabled,
    levelName,
    channelId,
    aiTutorChatButtonData,
    selectedVersion,
    levelId,
  ]);

  useEffect(() => {
    if (!(currentTab in availableTabs)) {
      // If the current tab is no longer available, switch to the first available tab.
      setCurrentTab(getTypedKeys(availableTabs)[0] || Tabs.Instructions);
    }
  }, [currentTab, availableTabs]);

  useEffect(() => {
    // Reset current tab to instructions when switching levels or viewAsUserId
    setCurrentTab(Tabs.Instructions);
  }, [levelId, viewAsUserId]);

  return (
    <div className={classNames(styles.resourcePanel, className)}>
      <div className={styles.sidebar}>
        <div className={styles.tabs}>
          {getTypedKeys(availableTabs).map(tab => (
            <WithTooltip
              tooltipProps={{
                text: tabInfo[tab].title,
                tooltipId: `tooltip-${tab}`,
                direction: 'onRight',
                size: 'xs',
                'data-theme': theme,
              }}
              key={`tooltip-${tab}`}
            >
              <Button
                className={classNames(
                  styles.tabButton,
                  tab === currentTab && styles.selected
                )}
                onClick={() => setCurrentTab(tab)}
                key={tab}
                color={'gray'}
                type={'tertiary'}
                isIconOnly={true}
                icon={{
                  iconName: tabInfo[tab].icon,
                  iconFamily: kitIcons.has(tabInfo[tab].icon)
                    ? 'kit'
                    : undefined,
                }}
              />
            </WithTooltip>
          ))}
        </div>
        <div className={classNames(styles.bottomTabs)}>
          <ResourcePanelExtraLinks levelId={levelId} theme={theme} />
          <CopyrightButton theme={theme} />
          <WithTooltip
            tooltipProps={{
              text: commonI18n.settings(),
              tooltipId: 'tooltip-settings',
              direction: 'onRight',
              size: 'xs',
              'data-theme': theme,
            }}
          >
            <Button
              className={styles.bottomButton}
              onClick={() => {
                setIsSettingsOpen(!isSettingsOpen);
              }}
              isIconOnly={true}
              icon={{iconName: 'gear'}}
              color={'gray'}
              type={'tertiary'}
            />
          </WithTooltip>
        </div>
      </div>
      <div className={styles.panels}>
        <PanelContainer
          id={currentTab}
          headerContent={tabInfo[currentTab].title}
          headerClassName={headerClassName}
          rightHeaderContent={rightHeaderContent}
        >
          {availableTabs[currentTab]}
          <NavigationArea isResourcePanel={true} {...instructionsProps} />
          {isSettingsOpen && (
            <SettingsPanel
              settings={settings || []}
              closePanel={() => setIsSettingsOpen(false)}
            />
          )}
        </PanelContainer>
      </div>
    </div>
  );
};

export default ResourcePanel;
