import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {kitIcons} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import {Steps} from 'intro.js-react';
import React, {useEffect, useMemo, useState} from 'react';

import {ChatButtonData, SystemPromptSettings} from '@cdo/apps/aichat/types';
import {shouldShowAiTutor} from '@cdo/apps/lab2/ai/shouldShowAiTutor';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {ProjectSources} from '@cdo/apps/lab2/types';
import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import StudentRubricView from '@cdo/apps/lab2/views/components/rubrics/StudentRubricView';
import {commonI18n} from '@cdo/apps/types/locale';
import {getTypedKeys} from '@cdo/apps/types/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {useRubric} from '../../rubrics/RubricWrapper';
import ForTeachersOnly from '../ForTeachersOnly';
import Instructions, {InstructionsProps} from '../InstructionsV2';
import NavigationArea from '../NavigationArea';

import CopyrightButton from './CopyrightButton';
import ResourcePanelExtraLinks from './ResourcePanelExtraLinks';
import {INITIAL_STEP, STEPS} from './resourcePanelTourHelpers';
import SettingsPanel from './SettingsPanel';
import ValidationPanel from './ValidationPanel';
import {VALIDATION_TOUR_STEPS} from './validationTourHelpers';
import {VersionHistoryPanel} from './VersionHistory';
import './resource-panel-introjs.scss';

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

const PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN =
  'pythonlabResourcePanelOnboardingTourSeen';

const VALIDATION_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN =
  'validationResourcePanelOnboardingTourSeen';

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
  const [validationTourEnabled, setValidationTourEnabled] = useState(false);
  const [validationTourStep, setValidationTourStep] = useState(0);
  const [validationTourStepsEnabled, setValidationTourStepsEnabled] = useState([
    false,
    false,
    true,
  ]); // Step 3 is always enabled (Done button)
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
  const appName = instructionsProps.levelProperties.appName;
  const isPythonLab = appName === 'pythonlab';
  const pythonLabOnboardingTourSeen = tryGetLocalStorage(
    PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
    'no'
  );
  const validationOnboardingTourSeen = tryGetLocalStorage(
    VALIDATION_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
    'no'
  );
  console.log('validationOnboardingTourSeen', validationOnboardingTourSeen);

  // Enable validation tour if conditions are met
  useEffect(() => {
    const shouldShowValidationTour =
      instructionsProps.validationSettings && hasValidationConditions;

    if (shouldShowValidationTour) {
      setValidationTourEnabled(true);
    }
  }, [
    instructionsProps.validationSettings,
    hasValidationConditions,
    validationOnboardingTourSeen,
  ]);

  // Tooltip should disappear quickly.
  const hideTooltipDelayMs = 10;

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
      hiddenContextCallback &&
      shouldShowAiTutor(appName, levelProperties.aiTutorAvailable)
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
    appName,
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

  // Add event listeners for validation tour progression
  useEffect(() => {
    if (!validationTourEnabled) return;

    const handleValidationTabClick = () => {
      if (validationTourStep === 0) {
        setCurrentTab(Tabs.Validation);
        // Enable step 1 (next button for step 1)
        setValidationTourStepsEnabled(prev => [true, false, true]);
      }
    };

    const handleValidateButtonClick = () => {
      if (validationTourStep === 1) {
        // Enable step 2 (next button for step 2)
        setValidationTourStepsEnabled(prev => [true, true, true]);
      }
    };

    const validationTabElement = document.getElementById(
      'resource-panel-tab-validation'
    );
    const validateButtonElement = document.getElementById(
      'resource-panel-validate-button'
    );

    if (validationTabElement) {
      validationTabElement.addEventListener('click', handleValidationTabClick);
    }
    if (validateButtonElement) {
      validateButtonElement.addEventListener(
        'click',
        handleValidateButtonClick
      );
    }

    return () => {
      if (validationTabElement) {
        validationTabElement.removeEventListener(
          'click',
          handleValidationTabClick
        );
      }
      if (validateButtonElement) {
        validateButtonElement.removeEventListener(
          'click',
          handleValidateButtonClick
        );
      }
    };
  }, [validationTourEnabled, validationTourStep]);

  return (
    <div
      id="resource-panel-instructions"
      className={classNames(styles.resourcePanel, className)}
    >
      <Steps
        enabled={isPythonLab && pythonLabOnboardingTourSeen !== 'yes'}
        initialStep={INITIAL_STEP}
        steps={STEPS}
        onExit={() => {
          trySetLocalStorage(
            PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
            'yes'
          );
        }}
        options={{
          scrollToElement: false,
          exitOnOverlayClick: false,
          hidePrev: true,
          nextLabel: commonI18n.next(),
          prevLabel: commonI18n.back(),
          doneLabel: commonI18n.done(),
          showBullets: false,
          showStepNumbers: true,
        }}
      />
      <Steps
        enabled={validationTourEnabled}
        initialStep={validationTourStep}
        steps={VALIDATION_TOUR_STEPS}
        onExit={() => {
          setValidationTourEnabled(false);
          trySetLocalStorage(
            VALIDATION_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
            'yes'
          );
        }}
        onComplete={() => {
          setValidationTourEnabled(false);
          trySetLocalStorage(
            VALIDATION_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
            'yes'
          );
        }}
        onChange={nextStepIndex => {
          setValidationTourStep(nextStepIndex);
        }}
        onBeforeChange={nextStepIndex => {
          // Control step progression based on user interactions
          if (nextStepIndex === 1 && !validationTourStepsEnabled[0]) {
            return false; // Prevent going to step 2 until validation tab is clicked
          }
          if (nextStepIndex === 2 && !validationTourStepsEnabled[1]) {
            return false; // Prevent going to step 3 until validate button is clicked
          }
          // Return void (undefined) to allow progression
        }}
        options={{
          scrollToElement: false,
          exitOnOverlayClick: false,
          hidePrev: validationTourStep === 0, // Hide back button only on first step
          hideNext: false,
          nextLabel: commonI18n.next(),
          prevLabel: commonI18n.back(),
          doneLabel: commonI18n.done(),
          showBullets: false,
          showStepNumbers: true,
        }}
      />

      <div className={styles.sidebar}>
        <nav id="resource-panel-tabs" className={styles.tabs}>
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
                  aria-label={tabInfo[tab].title}
                />
              </div>
            </WithTooltip>
          ))}
        </nav>
        <div
          id="resource-panel-links"
          className={classNames(styles.bottomTabs)}
        >
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
            hideDelayMs={hideTooltipDelayMs}
            hideOnFirstLeave={true}
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
              aria-label={commonI18n.settings()}
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
          <div className={styles.tabContentContainer}>
            {getTypedKeys(availableTabs).map(tab => (
              <div
                key={tab}
                className={classNames(
                  styles.tabContent,
                  tab !== currentTab && styles.tabContentHidden
                )}
              >
                {availableTabs[tab]}
              </div>
            ))}
          </div>
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
