import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {kitIcons} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React, {useEffect, useMemo, useState, useCallback, useRef} from 'react';

import {ChatButtonData, ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import AiChatHeaderButtons from '@cdo/apps/aichat/views/aiChatHeaderButtons/AiChatHeaderButtons';
import {shouldShowAiTutor} from '@cdo/apps/lab2/ai/shouldShowAiTutor';
import usePanelPosition from '@cdo/apps/lab2/hooks/usePanelPosition';
import lab2I18n from '@cdo/apps/lab2/locale';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setIsStandaloneCollapsed} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import StudentRubricView from '@cdo/apps/lab2/views/components/rubrics/StudentRubricView';
import {useExtraLinksButtonContext} from '@cdo/apps/lab2/views/LabViewsRenderer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {getTypedKeys} from '@cdo/apps/types/utils';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import '@cdo/apps/lab2/introjs.scss';

import {useRubric} from '../../rubrics/RubricWrapper';
import ForTeachersOnly from '../ForTeachersOnly';
import Instructions, {InstructionsProps} from '../InstructionsV2';
import NavigationArea from '../NavigationArea';

import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
} from './constants';
import CopyrightButton from './CopyrightButton';
import DisclaimerButton from './DisclaimerButton';
import OnboardingTourSteps from './OnboardingTourSteps';
import ResourcePanelExtraLinks from './ResourcePanelExtraLinks';
import setFooterVisibility from './setFooterVisibility';
import SettingsPanel from './SettingsPanel';
import {Tabs} from './types';
import ValidationPanel from './ValidationPanel';
import ValidationTourSteps from './ValidationTourSteps';
import {VersionHistoryPanel} from './VersionHistory';

import styles from './styles.module.scss';

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
  [Tabs.TeachersOnly]: {
    title: commonI18n.teachingTips(),
    icon: 'chalkboard-teacher',
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
  aiTutorMultimodalEnabled?: boolean;
  aiTutorChatButtonData?: ChatButtonData[];
  /** If the navigation area in the footer should be styled as a "bubble", like instructions content. */
  styleNavigationAsBubble?: boolean;
  isValidationTourEnabled?: boolean;
  isOnboardingTourEnabled?: boolean;
  aiTutorSystemPromptName?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
  documentationUrl?: string;
  /** Only display the sidebar and hide all tabs. */
  sidebarOnly?: boolean;
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
  aiTutorMultimodalEnabled,
  aiTutorChatButtonData,
  // Default hideNavigation to true since most labs pin the navigation area to bottom.
  hideNavigation: hideInstructionsNavigation = true,
  styleNavigationAsBubble = false,
  isValidationTourEnabled,
  isOnboardingTourEnabled,
  aiTutorSystemPromptName,
  aiTutorResponseSchemaSettings,
  documentationUrl,
  sidebarOnly = false,
  ...instructionsProps
}) => {
  const {theme} = useTheme();
  const {showRubric} = useRubric();
  const [currentTab, setCurrentTab] = useState<Tabs | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFloatingSettingsOpen, setIsFloatingSettingsOpen] = useState(false);
  const hasAutoCollapsedNoTabs = useRef(false);
  const settingsButtonRef = useRef<HTMLDivElement | null>(null);
  const floatingPanelRef = useRef<HTMLDivElement | null>(null);
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const isViewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const isRunning = instructionsProps.isRunning;
  const isValidating =
    instructionsProps.validationSettings?.isValidating || false;

  // Assign the permanent read-only state once at mount time, before any temporary state changes.
  const isPermanentlyReadOnlyRef = useRef<boolean | null>(null);
  if (isPermanentlyReadOnlyRef.current === null) {
    isPermanentlyReadOnlyRef.current =
      isReadOnly && !isRunning && !isValidating;
  }
  const isWidgetView = instructionsProps.levelProperties.widgetView || false;
  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );

  const levelId = instructionsProps.levelProperties.id;
  const hasValidationConditions = useAppSelector(
    state => state.lab.validationState?.hasConditions
  );
  const levelName = instructionsProps.levelProperties.name;
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const appName = instructionsProps.levelProperties.appName;
  const isProjectLevel = instructionsProps.levelProperties.isProjectLevel;
  const dispatch = useAppDispatch();

  // Tooltip should disappear quickly.
  const hideTooltipDelayMs = 10;

  // Temporary read-only occurs when running/validating in a workspace that wasn't permanently read-only at mount.
  const isTemporarilyReadOnly =
    !isPermanentlyReadOnlyRef.current &&
    isReadOnly &&
    (isRunning || isValidating);

  const levelProperties = instructionsProps.levelProperties;
  const aiTutorVisible = shouldShowAiTutor(
    appName,
    levelProperties.aiTutorAvailable
  );

  // Build available tabs based on level information.
  const availableTabs = useMemo(() => {
    if (sidebarOnly) {
      return {};
    }
    const tabMap: {[key in Tabs]?: React.ReactNode} = {};

    if (levelProperties.longInstructions) {
      tabMap[Tabs.Instructions] = (
        <Instructions
          {...instructionsProps}
          hideNavigation={hideInstructionsNavigation}
        />
      );
    }

    if (instructionsProps.validationSettings && hasValidationConditions) {
      tabMap[Tabs.Validation] = (
        <ValidationPanel {...instructionsProps.validationSettings} />
      );
    }

    if (hiddenContextCallback && aiTutorVisible) {
      tabMap[Tabs.AiTutor] = (
        <AiTutorChat
          hiddenContextCallback={hiddenContextCallback}
          aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
          levelName={levelName}
          channelId={channelId}
          aiTutorChatButtonData={aiTutorChatButtonData}
          aiTutorSystemPromptName={aiTutorSystemPromptName}
          aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
        />
      );
    }

    // The version history tab is hidden in read only mode with two exceptions:
    // if the user is viewing an old version of the project, or if this is a teacher viewing
    // a student's project (in which case they can view old versions, but not restore them).
    // We never show the version history tab in widget view, as widget view is always read-only
    // and therefore can never have version history.
    // Note: We use the permanent read-only state captured at mount time to determine tab visibility.
    const versionHistoryHidden =
      (isPermanentlyReadOnlyRef.current &&
        !isViewingOldVersion &&
        !viewAsUserId) ||
      isWidgetView;
    if (versionHistoryProps && !versionHistoryHidden) {
      tabMap[Tabs.VersionHistory] = (
        <VersionHistoryPanel
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          startSources={versionHistoryProps.startSources}
          appName={levelProperties.appName}
          levelId={levelId}
          disabled={isTemporarilyReadOnly}
        />
      );
    }

    if (showRubric) {
      tabMap[Tabs.StudentRubric] = <StudentRubricView />;
    }

    if (
      isUserTeacher &&
      (levelProperties.teacherMarkdown ||
        levelProperties.predictSettings?.solution)
    ) {
      tabMap[Tabs.TeachersOnly] = (
        <ForTeachersOnly
          levelProperties={levelProperties}
          className={classNames(styles.panelContent, styles.teachersOnlyTab)}
        />
      );
    }

    return tabMap;
  }, [
    instructionsProps,
    levelProperties,
    hasValidationConditions,
    isUserTeacher,
    aiTutorVisible,
    hiddenContextCallback,
    isViewingOldVersion,
    viewAsUserId,
    isWidgetView,
    versionHistoryProps,
    showRubric,
    hideInstructionsNavigation,
    aiTutorMultimodalEnabled,
    levelName,
    channelId,
    aiTutorChatButtonData,
    aiTutorSystemPromptName,
    aiTutorResponseSchemaSettings,
    selectedVersion,
    levelId,
    isTemporarilyReadOnly,
    sidebarOnly,
  ]);

  const hasTabs = useMemo(() => {
    return Object.keys(availableTabs).length > 0;
  }, [availableTabs]);

  const floatingSettingsPanelStyles = usePanelPosition(
    isFloatingSettingsOpen,
    hasTabs,
    settingsButtonRef,
    floatingPanelRef
  );

  useEffect(() => {
    // Auto-collapse on initial mount if on a standalone project and there are no available tabs.
    // Only run this once to allow user to toggle the panel.
    if (!hasAutoCollapsedNoTabs.current && isProjectLevel && !hasTabs) {
      dispatch(setIsStandaloneCollapsed(true));
      hasAutoCollapsedNoTabs.current = true;
    }
  }, [isProjectLevel, hasTabs, dispatch]);

  useEffect(() => {
    if (currentTab === undefined && Object.keys(availableTabs).length > 0) {
      setCurrentTab(getTypedKeys(availableTabs)[0]);
    } else if (currentTab && !(currentTab in availableTabs)) {
      setCurrentTab(getTypedKeys(availableTabs)[0]);
    }
  }, [currentTab, availableTabs]);

  useEffect(() => {
    // Reset current tab to instructions when switching levels or viewAsUserId.
    setCurrentTab(Tabs.Instructions);
    // Reset the permanent read-only state when the level changes.
    isPermanentlyReadOnlyRef.current =
      isReadOnly && !isRunning && !isValidating;
  }, [levelId, viewAsUserId, isReadOnly, isRunning, isValidating]);

  // Hide the page footer and extra links when the resource panel is shown, and show when unmounting.
  const {setShowExtraLinksButton} = useExtraLinksButtonContext();
  useEffect(() => {
    setFooterVisibility(false);
    setShowExtraLinksButton(false);
    return () => {
      setFooterVisibility(true);
      setShowExtraLinksButton(true);
    };
  }, [setShowExtraLinksButton]);

  const onClickTab = useCallback(
    (tab: Tabs) => {
      if (currentTab && currentTab !== tab) {
        sendLab2AnalyticsEvent(EVENTS.RESOURCE_PANEL_TAB_CLICKED, appName, {
          resourcePanelTabClickedTo: tab,
          resourcePanelTabClickedFrom: currentTab,
        });
      }
      setCurrentTab(tab);
      if (isStandaloneCollapsed) {
        dispatch(setIsStandaloneCollapsed(false));
      }
    },
    [appName, currentTab, dispatch, isStandaloneCollapsed]
  );

  const onClickSettingsButton = useCallback(() => {
    // For standalone projects, we need to handle the resource panel collapsing and expanding in conjunction
    // with toggling the settings panel when there is at least one tab.
    if (hasTabs) {
      if (isStandaloneCollapsed) {
        dispatch(setIsStandaloneCollapsed(false));
        setIsSettingsOpen(true);
        sendLab2AnalyticsEvent(
          EVENTS.RESOURCE_PANEL_SETTINGS_PANEL_OPENED,
          appName
        );
      } else {
        // If settngs is currently not open, open settings panel and send analytics event.
        if (!isSettingsOpen) {
          sendLab2AnalyticsEvent(
            EVENTS.RESOURCE_PANEL_SETTINGS_PANEL_OPENED,
            appName
          );
        }
        setIsSettingsOpen(!isSettingsOpen);
      }
    } else {
      // For standalone projects with no tabs, we toggle the floating settings panel.
      if (!isFloatingSettingsOpen) {
        sendLab2AnalyticsEvent(
          EVENTS.RESOURCE_PANEL_SETTINGS_PANEL_OPENED,
          appName
        );
      }
      setIsFloatingSettingsOpen(!isFloatingSettingsOpen);
    }
  }, [
    hasTabs,
    isStandaloneCollapsed,
    dispatch,
    appName,
    isSettingsOpen,
    isFloatingSettingsOpen,
  ]);

  return (
    <>
      <div
        id={resourcePanelInstructionsElementId}
        className={classNames(styles.resourcePanel, className)}
      >
        {isOnboardingTourEnabled && <OnboardingTourSteps />}
        {isValidationTourEnabled && (
          <ValidationTourSteps
            hasValidationConditions={hasValidationConditions}
            validationSettings={instructionsProps.validationSettings}
            setCurrentTab={setCurrentTab}
            onValidate={instructionsProps.validationSettings?.onValidate}
          />
        )}
        <div
          className={classNames(
            styles.sidebar,
            isStandaloneCollapsed && styles.collapsed
          )}
        >
          <div className={styles.topSection}>
            <div className={styles.collapseButtonContainer}>
              {/*
              For standalone projects with at least one tab, we display the collapse/expand.
              We hide this button for standalone projects with no tabs, but the bottom buttons
              will still be available for users to access the settings panel, etc.
            */}
              {isProjectLevel && hasTabs && (
                <WithTooltip
                  tooltipProps={{
                    text: isStandaloneCollapsed
                      ? lab2I18n.expand()
                      : lab2I18n.collapse(),
                    tooltipId: 'tooltip-collapse',
                    direction: 'onRight',
                    size: 'xs',
                    'data-theme': theme,
                  }}
                  hideDelayMs={hideTooltipDelayMs}
                  hideOnFirstLeave={true}
                >
                  <Button
                    className={styles.resourcePanelButton}
                    onClick={() =>
                      dispatch(setIsStandaloneCollapsed(!isStandaloneCollapsed))
                    }
                    isIconOnly={true}
                    icon={{
                      iconName: isStandaloneCollapsed
                        ? 'arrow-right-from-line'
                        : 'arrow-left-from-line',
                    }}
                    color={'gray'}
                    type={'tertiary'}
                    aria-label={
                      isStandaloneCollapsed
                        ? lab2I18n.expand()
                        : lab2I18n.collapse()
                    }
                  />
                </WithTooltip>
              )}
            </div>
            <nav id={resourcePanelTabsElementId} className={styles.tabs}>
              {getTypedKeys(availableTabs).map(tab => (
                <WithTooltip
                  tooltipProps={{
                    text: tabInfo[tab].title,
                    tooltipId: `tooltip-${tab}`,
                    direction: 'onRight',
                    size: 'xs',
                    'data-theme': theme,
                  }}
                  hideDelayMs={hideTooltipDelayMs}
                  hideOnFirstLeave={true}
                  key={`tooltip-${tab}`}
                >
                  <div id={`resource-panel-tab-${tab}`}>
                    <Button
                      className={classNames(
                        styles.tabButton,
                        tab === currentTab && styles.selected,
                        tab === Tabs.TeachersOnly && styles.teachersOnlyTab
                      )}
                      onClick={() => onClickTab(tab)}
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
                      aria-label={tabInfo[tab].title}
                    />
                  </div>
                </WithTooltip>
              ))}
            </nav>
          </div>
          <div
            id={resourcePanelLinksElementId}
            className={classNames(styles.bottomTabs)}
          >
            <ResourcePanelExtraLinks levelId={levelId} theme={theme} />
            {documentationUrl && (
              <IconButtonWithTooltip
                id="documentation"
                label={commonI18n.documentation()}
                icon={{iconName: 'book', iconStyle: 'solid'}}
                type="tertiary"
                color="gray"
                tooltipSize="xs"
                tooltipDirection="onRight"
                href={documentationUrl}
                theme={theme}
                buttonSize="s"
              />
            )}
            {aiTutorVisible && <DisclaimerButton theme={theme} />}
            <CopyrightButton theme={theme} />
            <div ref={settingsButtonRef}>
              <IconButtonWithTooltip
                id="settings"
                label={commonI18n.settings()}
                icon={{iconName: 'gear'}}
                type="tertiary"
                color="gray"
                tooltipSize="xs"
                tooltipDirection="onRight"
                onClick={onClickSettingsButton}
                theme={theme}
                buttonSize="s"
              />
            </div>
          </div>
        </div>
        {!isStandaloneCollapsed && hasTabs && (
          <div className={styles.panels}>
            <PanelContainer
              id={currentTab || 'resource-panel'}
              headerContent={currentTab && tabInfo[currentTab].title}
              headerClassName={headerClassName}
              rightHeaderContent={
                currentTab === Tabs.AiTutor ? (
                  <AiChatHeaderButtons />
                ) : (
                  rightHeaderContent
                )
              }
            >
              <div className={styles.tabContentContainer}>
                {getTypedKeys(availableTabs).map(tab => (
                  <div
                    key={tab}
                    className={classNames(
                      styles.tabContent,
                      tab !== currentTab && styles.tabContentHidden
                    )}
                    ref={el => {
                      if (el) {
                        el.inert = tab !== currentTab;
                      }
                    }}
                  >
                    {availableTabs[tab]}
                  </div>
                ))}
              </div>
              {(hideInstructionsNavigation ||
                currentTab !== Tabs.Instructions) &&
                !isProjectLevel && (
                  <NavigationArea
                    {...instructionsProps}
                    styleAsBubble={styleNavigationAsBubble}
                    className={styles.navigationFooter}
                  />
                )}
              {isSettingsOpen && hasTabs && (
                <SettingsPanel
                  settings={settings || []}
                  closePanel={() => {
                    setIsSettingsOpen(false);
                  }}
                  appName={appName}
                />
              )}
            </PanelContainer>
          </div>
        )}
      </div>
      {isFloatingSettingsOpen && !hasTabs && (
        <div
          className={styles.floatingSettingsPanelContainer}
          id="floating-settings-panel"
          style={floatingSettingsPanelStyles}
          ref={floatingPanelRef}
        >
          <SettingsPanel
            settings={settings || []}
            closePanel={() => {
              setIsFloatingSettingsOpen(!isFloatingSettingsOpen);
            }}
            appName={appName}
          />
        </div>
      )}
    </>
  );
};

export default ResourcePanel;
