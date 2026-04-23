/** @file Top-level view for AI Chat Lab */

import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {
  addChatEvent,
  clearChatMessages,
  onSaveComplete,
  onSaveFail,
  onSaveNoop,
  clearHasSetInitialCustomizations,
  resetToDefaultAiCustomizations,
  selectAllFieldsHidden,
  sendAnalytics,
  setShowModalType,
  setViewMode,
  updateAiCustomization,
  initializeAiCustomizations,
} from '@cdo/apps/aichat/redux';
import {AssetSource, ChatAsset, ModelParameters} from '@cdo/apps/aichat/types';
import {getAllowedFileTypes} from '@cdo/apps/aichat/utils';
import AiChatHeaderButtons from '@cdo/apps/aichat/views/aiChatHeaderButtons/AiChatHeaderButtons';
import ChatWorkspace, {
  ChatWorkspaceHandle,
} from '@cdo/apps/aichat/views/ChatWorkspace';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {queryParams} from '@cdo/apps/code-studio/utils';
import FlowLab from '@cdo/apps/flowlab/views/flow/FlowLab';
import {PERMISSIONS} from '@cdo/apps/lab2/constants';
import {useAiChatDisabledState} from '@cdo/apps/lab2/hooks/useAiChatDisabledState';
import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LabProps} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import ResourcePanel, {
  BackpackProps,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {
  BackpackAPIContext,
  BackpackContextType,
} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import ProjectTemplateWorkspaceIconV2 from '@cdo/apps/templates/ProjectTemplateWorkspaceIconV2';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {LevelPropertiesContext} from '../levelPropertiesContext';
import {AichatLevelProperties, ModalTypes, ViewMode} from '../types';

import {isDisabled} from './modelCustomization/utils';
import ModelCustomizationWorkspace from './ModelCustomizationWorkspace';
import PresentationView from './presentation/PresentationView';
import TeacherOnboardingModal from './TeacherOnboardingModal';

import moduleStyles from './aichatView.module.scss';

const AichatView: React.FunctionComponent<LabProps<AichatLevelProperties>> = ({
  levelProperties,
  initialSources,
}) => {
  const dispatch = useAppDispatch();

  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const teacherViewingStudent = Boolean(viewAsUserId);

  const {
    name: levelName,
    aichatSettings: levelAichatSettings,
    starterAssets,
  } = levelProperties;
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  const currentAiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  const savedAiCustomizations = useAppSelector(
    state => state.aichat.savedAiCustomizations
  );
  const viewMode = useAppSelector(state => state.aichat.viewMode);
  const showModalType = useAppSelector(state => state.aichat.showModalType);

  const {botName, isPublished} = currentAiCustomizations.modelCardInfo;

  const allFieldsHidden = useAppSelector(selectAllFieldsHidden);

  const hasSentMessage = useAppSelector(state => state.aichat.hasSentMessage);
  const hasUpdatedCustomizations = useAppSelector(
    state => state.aichat.hasUpdatedCustomizations
  );

  const channelId = useAppSelector(state => state.lab.channel?.id);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const hasSubmittedPredictResponse = useAppSelector(
    state => state.predictLevel.hasSubmittedResponse
  );

  const logLevelActivity = useLevelActivityMetrics(levelProperties);

  const isLevelbuilder = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.LEVELBUILDER)
  );

  const hasSetInitialCustomizations = useAppSelector(
    state => state.aichat.hasSetInitialCustomizations
  );

  const chatWorkspaceInitialized = hasSetInitialCustomizations;

  const projectManager = Lab2Registry.getInstance().getProjectManager();
  // Attach save listeners whenever the project manager updates
  useEffect(() => {
    if (!projectManager) {
      return;
    }
    // No save occurred
    projectManager.addSaveNoopListener(() => {
      dispatch(onSaveNoop());
    });

    projectManager.addSaveSuccessListener(() => {
      dispatch(onSaveComplete());
    });
    projectManager.addSaveFailListener(() => {
      dispatch(onSaveFail());
    });
  }, [projectManager, dispatch]);

  useEffect(() => {
    dispatch(clearHasSetInitialCustomizations());
  }, [dispatch, currentLevelId]);

  useEffect(() => {
    const studentAiCustomizations = JSON.parse(
      (initialSources?.source as string) || '{}'
    );
    dispatch(
      initializeAiCustomizations(studentAiCustomizations, levelAichatSettings)
    );
  }, [dispatch, initialSources, levelAichatSettings]);

  useEffect(() => {
    // ChatWorkspaceLogger is intialized in ChatWorkspace so we need to wait on it.
    // Logging fronm AichatView could be cleaned up to avoid this fragile timing.
    if (chatWorkspaceInitialized) {
      dispatch(
        addChatEvent({
          timestamp: Date.now(),
          descriptionKey: 'LOAD_LEVEL',
        })
      );
    }
  }, [dispatch, chatWorkspaceInitialized]);

  useEffect(() => {
    const modalToShow = () => {
      if (!isUserTeacher) {
        return ModalTypes.WARNING;
      }

      const teacherSawAichatOnboardingModal = tryGetLocalStorage(
        'teacherSawAichatOnboarding',
        'no'
      );

      return teacherSawAichatOnboardingModal === 'yes'
        ? undefined
        : ModalTypes.TEACHER_ONBOARDING;
    };

    dispatch(setShowModalType(modalToShow()));
  }, [isUserTeacher, dispatch]);

  const onCloseModal = useCallback(() => {
    // We only want to show the teacher onboarding modal the first time a teacher user
    // interacts with the aichat tool. Thus, we store a value in local storage when
    // closing the modal.
    if (
      isUserTeacher &&
      showModalType === ModalTypes.TEACHER_ONBOARDING &&
      tryGetLocalStorage('teacherSawAichatOnboarding', 'no') !== 'yes'
    ) {
      trySetLocalStorage('teacherSawAichatOnboarding', 'yes');
    }
    dispatch(setShowModalType(undefined));
  }, [dispatch, isUserTeacher, showModalType]);

  const ChatModal = useMemo(
    () =>
      showModalType === ModalTypes.TEACHER_ONBOARDING
        ? TeacherOnboardingModal
        : showModalType === ModalTypes.WARNING
        ? ChatWarningModal
        : undefined,
    [showModalType]
  );

  // Showing presentation view when:
  // 1) levelbuilder hasn't explicitly configured the toggle to be hidden, and
  // 2) we have a published model card (either by the student, or in readonly form from the levelbuilder)
  const showPresentationToggle = () => {
    return (
      !levelAichatSettings?.hidePresentationPanel &&
      (isPublished ||
        (levelAichatSettings?.visibilities &&
          isDisabled(levelAichatSettings.visibilities.modelCardInfo)))
    );
  };

  const viewModeButtonsProps: SegmentedButtonsProps = {
    buttons: [
      {
        label: 'Edit',
        value: ViewMode.EDIT,
        iconLeft: {
          iconName: 'wrench',
          iconStyle: 'solid',
          title: 'Edit Mode',
        },
      },
      {
        label: 'User View',
        value: ViewMode.PRESENTATION,
        iconLeft: {
          iconName: 'user-group',
          iconStyle: 'solid',
          title: 'User View Mode',
        },
        id: 'uitest-user-view-button',
      },
    ],
    size: 's',
    selectedButtonValue: viewMode,
    onChange: viewMode => dispatch(setViewMode(viewMode as ViewMode)),
  };

  const chatWorkspaceHeader = (
    <div className={moduleStyles.workspaceHeaderContent}>
      {viewMode === ViewMode.EDIT ? 'AI Chat' : botName}
      {projectTemplateLevel && (
        <ProjectTemplateWorkspaceIconV2 tooltipPlace="onBottom" />
      )}
    </div>
  );

  const resetProject = useCallback(() => {
    dispatch(resetToDefaultAiCustomizations(levelAichatSettings));
    // Save the customizations to the user's project.
    dispatch(updateAiCustomization());
    dispatch(clearChatMessages());
  }, [dispatch, levelAichatSettings]);

  const dialogControl = useDialogControl();

  const onClickStartOver = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.StartOver,
        handleConfirm: resetProject,
      });
    }
  }, [dialogControl, resetProject]);

  // Only recreate modelParameters when relevant customizations are updated.
  const modelParameters: ModelParameters = useMemo(() => {
    return {
      selectedModelId: savedAiCustomizations.selectedModelId,
      temperature: savedAiCustomizations.temperature,
      retrievalContexts: savedAiCustomizations.retrievalContexts,
      systemPrompt: savedAiCustomizations.systemPrompt,
    };
  }, [
    savedAiCustomizations.selectedModelId,
    savedAiCustomizations.temperature,
    savedAiCustomizations.retrievalContexts,
    savedAiCustomizations.systemPrompt,
  ]);

  const {disabled, disabledMessage} = useAiChatDisabledState({
    appName: levelProperties.appName,
    isPredictLevel: !!levelProperties.predictSettings?.isPredictLevel,
    hasSubmittedPredictResponse,
  });

  const chatWorkspaceRef = useRef<ChatWorkspaceHandle>(null);

  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const backpackContext: BackpackContextType | null = useMemo(() => {
    if (currentUserId) {
      // The backpack api does not work for signed-out users (it redirects to sign-in),
      // so we don't create the api instance if there is no current user.
      return {
        primaryApi: new BackpackClientApi('aichat', null),
        secondaryApis: {
          sketchlab: new BackpackClientApi('sketchlab', null),
          weblab2: new BackpackClientApi('weblab2', null),
        },
      };
    }
    return null;
  }, [currentUserId]);

  const backpackProps: BackpackProps = useMemo(() => {
    return {
      validateFileName: (fileName: string) => ({
        newFileName: fileName,
        isSupportFileName: false,
      }),
      // no-op; we're always importing backpack files as new files.
      saveFileToProject: () => {},
      createNewProjectFile: (
        _fileName: string,
        _contents: string,
        url?: string
      ) => {
        const metricsReporter = Lab2Registry.getInstance().getMetricsReporter();
        if (!url) {
          metricsReporter.logWarning(
            'Missing URL for imported backpack file. Cannot add to AI chat.'
          );
          return;
        }
        const filename = url.split('/').pop();
        if (!filename) {
          metricsReporter.logWarning(
            'Could not parse backpack filename from URL. Cannot add to AI chat.'
          );
          return;
        }
        const asset: ChatAsset = {filename, source: AssetSource.PROJECT};
        chatWorkspaceRef.current?.addAssets([asset]);
      },
      // no-op; we're always importing backpack files as new files.
      findIdForFileName: () => undefined,
      supportedFileTypes: getAllowedFileTypes(
        modelParameters.selectedModelId
      ).map(f => f.split('.').pop() || ''),
    };
  }, [modelParameters.selectedModelId]);

  if (queryParams('show-flow-lab') === 'true' && isLevelbuilder) {
    return <FlowLab />;
  }

  return (
    <LevelPropertiesContext.Provider value={levelProperties}>
      <BackpackAPIContext.Provider value={backpackContext}>
        <div id="aichat-lab" className={moduleStyles.aichatLab}>
          {ChatModal && <ChatModal onClose={onCloseModal} />}
          {showPresentationToggle() && (
            <div
              id="uitest-view-mode-toggle-container"
              className={moduleStyles.viewModeButtons}
            >
              <SegmentedButtons {...viewModeButtonsProps} />
            </div>
          )}
          {teacherViewingStudent && <TeacherViewingStudentProjectAlert />}
          <div className={moduleStyles.labCoreContainer}>
            {viewMode === ViewMode.EDIT && (
              <>
                <div className={moduleStyles.instructionsArea}>
                  <ResourcePanel
                    className={moduleStyles.panelContainer}
                    headerClassName={moduleStyles.panelHeader}
                    /** AI Chat doesn't have a traditional "run" state, so this is always false. */
                    isRunning={false}
                    hasRun={hasSentMessage}
                    hasEdited={hasUpdatedCustomizations}
                    levelProperties={levelProperties}
                    rightHeaderContent={renderInstructionsHeaderRight(
                      isUserTeacher,
                      () => {
                        dispatch(
                          setShowModalType(ModalTypes.TEACHER_ONBOARDING)
                        );
                      }
                    )}
                    backpackProps={backpackProps}
                  />
                </div>
                {!allFieldsHidden && (
                  <div className={moduleStyles.customizationArea}>
                    <PanelContainer
                      id="aichat-model-customization-panel"
                      headerContent={'Model Customization'}
                      className={moduleStyles.panelContainer}
                      headerClassName={moduleStyles.panelHeader}
                      rightHeaderContent={
                        !viewAsUserId &&
                        renderModelCustomizationHeaderRight(() => {
                          onClickStartOver();
                          dispatch(sendAnalytics(EVENTS.AICHAT_START_OVER, {}));
                        })
                      }
                    >
                      <ModelCustomizationWorkspace />
                    </PanelContainer>
                  </div>
                )}
              </>
            )}
            {viewMode === ViewMode.PRESENTATION && (
              <div
                id="uitest-presentation-view-container"
                className={moduleStyles.presentationArea}
              >
                <PanelContainer
                  id="aichat-presentation-panel"
                  headerContent={'Model Card'}
                  className={moduleStyles.panelContainer}
                  headerClassName={moduleStyles.panelHeader}
                >
                  <PresentationView />
                </PanelContainer>
              </div>
            )}
            <div className={moduleStyles.chatWorkspaceArea}>
              <PanelContainer
                id="aichat-workspace-panel"
                headerContent={chatWorkspaceHeader}
                className={moduleStyles.panelContainer}
                headerClassName={moduleStyles.panelHeader}
                rightHeaderContent={<AiChatHeaderButtons />}
              >
                {chatWorkspaceInitialized && (
                  <ChatWorkspace
                    modelParameters={modelParameters}
                    clientType={AiChatClientTypes.AI_CHAT_LAB}
                    levelName={levelName}
                    channelId={channelId}
                    hasStarterAssets={
                      starterAssets && Object.keys(starterAssets).length > 0
                    }
                    multimodalEnabled={levelAichatSettings?.multimodalEnabled}
                    logLevelActivity={logLevelActivity}
                    disabled={disabled}
                    disabledMessage={disabledMessage}
                    ref={chatWorkspaceRef}
                  />
                )}
              </PanelContainer>
            </div>
          </div>
        </div>
      </BackpackAPIContext.Provider>
    </LevelPropertiesContext.Provider>
  );
};

const renderModelCustomizationHeaderRight = (onStartOver: () => void) => {
  return (
    <IconButtonWithTooltip
      id="start-over"
      label={'Start over'}
      icon={{iconName: 'refresh', iconStyle: 'solid'}}
      variant="text"
      color="tertiary"
      size="extraSmall"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      onClick={onStartOver}
    />
  );
};

const renderInstructionsHeaderRight = (
  isUserTeacher: boolean | undefined,
  onInfoClick: () => void
) => {
  return isUserTeacher ? (
    <IconButtonWithTooltip
      id="about-aichat-lab"
      label={'About AI Chat Lab'}
      icon={{iconName: 'message-question', iconStyle: 'solid'}}
      variant="text"
      color="secondary"
      size="extraSmall"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      onClick={onInfoClick}
    />
  ) : null;
};

export default AichatView;
