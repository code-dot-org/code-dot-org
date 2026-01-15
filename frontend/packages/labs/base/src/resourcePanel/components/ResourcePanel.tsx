import classNames from 'classnames';
import type {FunctionComponent, ReactNode} from 'react';
import {useEffect, useMemo, useState, useCallback, useRef} from 'react';

import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {kitIcons} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {EVENTS} from '@code-dot-org/metrics';

//import AiChatHeaderButtons from '@cdo/apps/aichat/views/aiChatHeaderButtons/AiChatHeaderButtons';
//import {shouldShowAiTutor} from '@cdo/apps/lab2/ai/shouldShowAiTutor';
//import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
//import {StudentRubricView} from '@code-dot-org/rubrics';

//import type {ChatButtonData, ResponseSchemaSettings} from '../../../aichat/types';
import IconButtonWithTooltip from '../../components/IconButtonWithTooltip';
import PanelContainer from '../../components/PanelContainer';
import {useExtraLinksButtonContext} from '../../contexts/ExtraLinksButtonContext';
import usePanelPosition from '../../hooks/usePanelPosition';
import ForTeachersOnly from '../../instructions/components/ForTeachersOnly';
import Instructions, {
  InstructionsProps,
} from '../../instructions/components/Instructions';
import NavigationArea from '../../instructions/components/NavigationArea';
import {
  isReadOnlyWorkspace,
  isPermanentlyReadOnlyWorkspace,
  isReadOnlyPredictLevel,
} from '../../redux/labSlice';
import {setIsStandaloneCollapsed} from '../../redux/labViewSlice';
import {useAppSelector, useAppDispatch} from '../../redux/store';
import {ProjectSources} from '../../types';
import {sendLabAnalyticsEvent} from '../../utils/analyticsReporterHelper';
//import {useRubric} from '@code-dot-org/rubrics/contexts';
import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
} from '../constants';
import type {TabsType, Setting} from '../types';
import {Tabs} from '../types';
import '../../introjs.scss';

import CopyrightButton from './CopyrightButton';
//import DisclaimerButton from './DisclaimerButton';
import OnboardingTourSteps from './OnboardingTourSteps';
import ResourcePanelExtraLinks from './ResourcePanelExtraLinks';
import SettingsPanel from './SettingsPanel';
import ValidationPanel from './ValidationPanel';
import ValidationTourSteps from './ValidationTourSteps';
import {VersionHistoryPanel} from './VersionHistory';

import styles from './styles.module.scss';

/**
 * Finds the first focusable element within a container.
 * @param container - The element to search within
 * @returns The first focusable element, or null if none found
 */
export const findFirstFocusableElement = (
  container: HTMLElement,
): HTMLElement | null => {
  return container.querySelector<HTMLElement>(
    'a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
};

/**
 * Return the keys of an object as a typed array.
 */
function getTypedKeys<K extends string | number | symbol>(object: {
  [key in K]?: unknown;
}): K[] {
  return Object.keys(object) as K[];
}

export interface VersionHistoryProps {
  startSources: ProjectSources;
  alwaysShowAutoSaves?: boolean;
  onLoadVersion?: (sources: ProjectSources) => void;
}

const tabInfo: {[key in TabsType]: {title: string; icon: string}} = {
  [Tabs.Instructions]: {title: 'Instructions', icon: 'info-circle'},
  [Tabs.AiTutor]: {title: 'AI Tutor', icon: 'ai-head-solid'},
  [Tabs.StudentRubric]: {
    title: 'Rubric',
    icon: 'clipboard-list',
  },
  [Tabs.VersionHistory]: {
    title: 'Version History',
    icon: 'history',
  },
  [Tabs.Validation]: {
    title: 'Validation',
    icon: 'clipboard-check',
  },
  [Tabs.TeachersOnly]: {
    title: 'Teaching Tips',
    icon: 'chalkboard-teacher',
  },
};

export type ResourcePanelProps = InstructionsProps & {
  className?: string;
  headerClassName?: string;
  hiddenContextCallback?: () => Promise<string>;
  rightHeaderContent?: ReactNode;
  includeFooterSpacing?: boolean;
  settings?: Setting[];
  versionHistoryProps?: VersionHistoryProps;
  aiTutorMultimodalEnabled?: boolean;
  //aiTutorChatButtonData?: ChatButtonData[];
  /** If the navigation area in the footer should be styled as a "bubble", like instructions content. */
  styleNavigationAsBubble?: boolean;
  isValidationTourEnabled?: boolean;
  isOnboardingTourEnabled?: boolean;
  //aiTutorSystemPromptName?: string;
  //aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
  documentationUrl?: string;
  /** Only display the sidebar and hide all tabs. */
  sidebarOnly?: boolean;
};

/**
 * Display various instructional resources for the level as tabs.
 */
const ResourcePanel: FunctionComponent<ResourcePanelProps> = ({
  className,
  headerClassName,
  hiddenContextCallback,
  rightHeaderContent,
  settings,
  versionHistoryProps,
  //aiTutorMultimodalEnabled,
  //aiTutorChatButtonData,
  // Default hideNavigation to true since most labs pin the navigation area to bottom.
  hideNavigation: hideInstructionsNavigation = true,
  styleNavigationAsBubble = false,
  isValidationTourEnabled,
  isOnboardingTourEnabled,
  //aiTutorSystemPromptName,
  //aiTutorResponseSchemaSettings,
  documentationUrl,
  sidebarOnly = false,
  ...instructionsProps
}) => {
  const {theme} = useTheme();
  //const {showRubric} = useRubric();
  const [currentTab, setCurrentTab] = useState<TabsType | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFloatingSettingsOpen, setIsFloatingSettingsOpen] = useState(false);
  const hasAutoCollapsedNoTabs = useRef(false);
  const settingsButtonRef = useRef<HTMLDivElement | null>(null);
  const floatingPanelRef = useRef<HTMLDivElement | null>(null);
  const tabContentRefs = useRef<{[key in TabsType]?: HTMLDivElement | null}>(
    {},
  );
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const isViewingOldVersion = useAppSelector(
    state => state.labProject.viewingOldVersion,
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace); // includes running/validating.
  const isPermanentlyReadOnly = useAppSelector(isPermanentlyReadOnlyWorkspace);
  const isReadOnlyPredict = useAppSelector(isReadOnlyPredictLevel);
  const isStandaloneCollapsed = useAppSelector(
    state => state.labView.isStandaloneCollapsed,
  );

  const levelId = instructionsProps.levelProperties.id;
  const hasValidationConditions = useAppSelector(
    state => state.lab.validationState?.hasConditions,
  );
  const levelName = instructionsProps.levelProperties.name;
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const appName = instructionsProps.levelProperties.appName;
  const isProjectLevel = instructionsProps.levelProperties.isProjectLevel;
  const isWidgetView = instructionsProps.levelProperties.widgetView;
  const dispatch = useAppDispatch();

  // Tooltip should disappear quickly.
  const hideTooltipDelayMs = 10;

  // If we are not permanently read-only but are currently in a read-only state, we are temporarily read-only.
  const isTemporarilyReadOnly = !isPermanentlyReadOnly && isReadOnly;

  const levelProperties = instructionsProps.levelProperties;
  /*const aiTutorVisible = shouldShowAiTutor(
    appName,
    levelProperties.aiTutorAvailable,
  );*/

  // Build available tabs based on level information.
  const availableTabs = useMemo(() => {
    if (sidebarOnly) {
      return {};
    }
    const tabMap: {[key in TabsType]?: ReactNode} = {};

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

    /*
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
    */

    // The version history tab is hidden in permanently read-only mode with the following exception:
    // - if a teacher is viewing a student's project (in which case they can view old versions, but not restore them).
    // Version history is also hidden on predict levels and widget view.
    const versionHistoryHidden =
      (isPermanentlyReadOnly && !viewAsUserId) ||
      isWidgetView ||
      isReadOnlyPredict ||
      levelProperties.hideVersionHistory;
    if (versionHistoryProps && !versionHistoryHidden) {
      tabMap[Tabs.VersionHistory] = (
        <VersionHistoryPanel
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          startSources={versionHistoryProps.startSources}
          levelId={levelId}
          disabled={isTemporarilyReadOnly && !isViewingOldVersion}
          isOpen={currentTab === Tabs.VersionHistory}
          alwaysShowAutoSaves={versionHistoryProps.alwaysShowAutoSaves}
          onLoadVersion={versionHistoryProps.onLoadVersion}
        />
      );
    }

    /*if (showRubric) {
      tabMap[Tabs.StudentRubric] = <StudentRubricView />;
    }*/

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
    sidebarOnly,
    levelProperties,
    instructionsProps,
    hasValidationConditions,
    hiddenContextCallback,
    //aiTutorVisible,
    isPermanentlyReadOnly,
    viewAsUserId,
    isWidgetView,
    versionHistoryProps,
    //showRubric,
    isUserTeacher,
    hideInstructionsNavigation,
    //aiTutorMultimodalEnabled,
    levelName,
    channelId,
    //aiTutorChatButtonData,
    //aiTutorSystemPromptName,
    //aiTutorResponseSchemaSettings,
    selectedVersion,
    levelId,
    isTemporarilyReadOnly,
    isViewingOldVersion,
    isReadOnlyPredict,
    currentTab,
  ]);

  const hasTabs = useMemo(() => {
    return Object.keys(availableTabs).length > 0;
  }, [availableTabs]);

  const floatingSettingsPanelStyles = usePanelPosition(
    isFloatingSettingsOpen,
    hasTabs,
    settingsButtonRef,
    floatingPanelRef,
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
  }, [levelId, viewAsUserId]);

  // Move focus to panel content when AI Tutor or Version History tab is selected via keyboard.
  useEffect(() => {
    if (currentTab === Tabs.AiTutor || currentTab === Tabs.VersionHistory) {
      const panelContent = tabContentRefs.current[currentTab];
      if (panelContent) {
        // Use setTimeout to ensure the panel is rendered and visible before focusing.
        const timeoutId = setTimeout(() => {
          const focusableElement =
            currentTab === Tabs.AiTutor
              ? panelContent.querySelector<HTMLTextAreaElement>(
                  '#uitest-chat-textarea',
                )
              : findFirstFocusableElement(panelContent);
          if (focusableElement) {
            focusableElement.focus();
          } else {
            // If no focusable element exists, make the panel content focusable and focus it
            panelContent.setAttribute('tabindex', '-1');
            panelContent.focus();
          }
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [currentTab]);

  // Hide the page footer and extra links when the resource panel is shown, and show when unmounting.
  const {setShowExtraLinksButton} = useExtraLinksButtonContext();
  useEffect(() => {
    setShowExtraLinksButton(false);
    return () => {
      setShowExtraLinksButton(true);
    };
  }, [setShowExtraLinksButton]);

  const onClickTab = useCallback(
    (tab: TabsType) => {
      if (currentTab && currentTab !== tab) {
        sendLabAnalyticsEvent(EVENTS.RESOURCE_PANEL_TAB_CLICKED, {
          resourcePanelTabClickedTo: tab,
          resourcePanelTabClickedFrom: currentTab,
        });
      }
      setCurrentTab(tab);
      if (isStandaloneCollapsed) {
        dispatch(setIsStandaloneCollapsed(false));
      }
    },
    [currentTab, dispatch, isStandaloneCollapsed],
  );

  const onClickSettingsButton = useCallback(() => {
    // For standalone projects, we need to handle the resource panel collapsing and expanding in conjunction
    // with toggling the settings panel when there is at least one tab.
    if (hasTabs) {
      if (isStandaloneCollapsed) {
        dispatch(setIsStandaloneCollapsed(false));
        setIsSettingsOpen(true);
        sendLabAnalyticsEvent(EVENTS.RESOURCE_PANEL_SETTINGS_PANEL_OPENED);
      } else {
        // If settngs is currently not open, open settings panel and send analytics event.
        if (!isSettingsOpen) {
          sendLabAnalyticsEvent(EVENTS.RESOURCE_PANEL_SETTINGS_PANEL_OPENED);
        }
        setIsSettingsOpen(!isSettingsOpen);
      }
    } else {
      // For standalone projects with no tabs, we toggle the floating settings panel.
      if (!isFloatingSettingsOpen) {
        sendLabAnalyticsEvent(EVENTS.RESOURCE_PANEL_SETTINGS_PANEL_OPENED);
      }
      setIsFloatingSettingsOpen(!isFloatingSettingsOpen);
    }
  }, [
    hasTabs,
    isStandaloneCollapsed,
    dispatch,
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
            isStandaloneCollapsed && styles.collapsed,
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
                    text: isStandaloneCollapsed ? 'Expand' : 'Collapse',
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
                    aria-label={isStandaloneCollapsed ? 'Expand' : 'Collapse'}
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
                        tab === Tabs.TeachersOnly && styles.teachersOnlyTab,
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
                label="Documentation"
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
            {/*aiTutorVisible && <DisclaimerButton theme={theme} />*/}
            <CopyrightButton theme={theme} />
            <div ref={settingsButtonRef}>
              <IconButtonWithTooltip
                id="settings"
                label="Settings"
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
                /*currentTab === Tabs.AiTutor ? (
                  <AiChatHeaderButtons />
                ) : (*/
                rightHeaderContent
                //)
              }
            >
              <div className={styles.tabContentContainer}>
                {getTypedKeys(availableTabs).map(tab => (
                  <div
                    key={tab}
                    className={classNames(
                      styles.tabContent,
                      tab !== currentTab && styles.tabContentHidden,
                    )}
                    ref={el => {
                      if (el) {
                        el.inert = tab !== currentTab;
                        // Store ref for AI Tutor and Version History tabs.
                        if (
                          tab === Tabs.AiTutor ||
                          tab === Tabs.VersionHistory
                        ) {
                          tabContentRefs.current[tab] = el;
                        }
                      } else {
                        // Clear ref when element is removed.
                        if (
                          tab === Tabs.AiTutor ||
                          tab === Tabs.VersionHistory
                        ) {
                          tabContentRefs.current[tab] = null;
                        }
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
