/** @file Top-level view for AI Chat Lab */

import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import React, {useCallback, useEffect, useMemo} from 'react';

import TeacherOnboardingModal from '@cdo/apps/aichat/views/TeacherOnboardingModal';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {queryParams} from '@cdo/apps/code-studio/utils';
import FlowLab from '@cdo/apps/flowlab/views/flow/FlowLab';
import {PERMISSIONS} from '@cdo/apps/lab2/constants';
import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LabProps} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import ProjectTemplateWorkspaceIconV2 from '@cdo/apps/templates/ProjectTemplateWorkspaceIconV2';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {getUserHasAichatLabAccess} from '../aichatApi';
import ChatEventLogger from '../chatEventLogger';
import {ModalTypes} from '../constants';
import {LevelPropertiesContext} from '../levelPropertiesContext';
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
  setUserHasAichatLabAccess,
  setViewMode,
  updateAiCustomization,
  initializeAiCustomizations,
} from '../redux';
import {AichatLevelProperties, ModelParameters, ViewMode} from '../types';

import AiChatHeaderButtons from './aiChatHeaderButtons/AiChatHeaderButtons';
import ChatWorkspace from './ChatWorkspace';
import {isDisabled} from './modelCustomization/utils';
import ModelCustomizationWorkspace from './ModelCustomizationWorkspace';
import PresentationView from './presentation/PresentationView';

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

  const signInState = useAppSelector(state => state.currentUser.signInState);

  const {botName, isPublished} = currentAiCustomizations.modelCardInfo;

  const allFieldsHidden = useAppSelector(selectAllFieldsHidden);

  const hasSentMessage = useAppSelector(state => state.aichat.hasSentMessage);
  const hasUpdatedCustomizations = useAppSelector(
    state => state.aichat.hasUpdatedCustomizations
  );

  const channelId = useAppSelector(state => state.lab.channel?.id);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  const logLevelActivity = useLevelActivityMetrics(levelProperties);
  const scriptId = useAppSelector(state => state.progress.scriptId);

  const isLevelbuilder = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.LEVELBUILDER)
  );

  const hasSetInitialCustomizations = useAppSelector(
    state => state.aichat.hasSetInitialCustomizations
  );

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

  // Initialize the ChatEventLogger with the current context, whenever it updates.
  useEffect(() => {
    ChatEventLogger.initialize({
      clientType: AiChatClientTypes.AI_CHAT_LAB,
      currentLevelId: parseInt(currentLevelId || ''),
      scriptId,
      channelId,
    });
  }, [currentLevelId, scriptId, channelId]);

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
    dispatch(
      addChatEvent({
        timestamp: Date.now(),
        descriptionKey: 'LOAD_LEVEL',
      })
    );
  }, [dispatch, initialSources, levelAichatSettings]);

  useEffect(() => {
    if (signInState === SignInState.SignedIn) {
      getUserHasAichatLabAccess()
        .then(hasAccess => dispatch(setUserHasAichatLabAccess(hasAccess)))
        .catch(error => {
          if (
            !(error instanceof NetworkError && error.response.status === 403)
          ) {
            Lab2Registry.getInstance()
              .getMetricsReporter()
              .logError(
                'Error in fetching user aichat lab access',
                error as Error
              );
          }
        });
    }
  }, [dispatch, signInState]);

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

  if (queryParams('show-flow-lab') === 'true' && isLevelbuilder) {
    return <FlowLab />;
  }

  return (
    <LevelPropertiesContext.Provider value={levelProperties}>
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
                      dispatch(setShowModalType(ModalTypes.TEACHER_ONBOARDING));
                    }
                  )}
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
              {hasSetInitialCustomizations && (
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
                />
              )}
            </PanelContainer>
          </div>
        </div>
      </div>
    </LevelPropertiesContext.Provider>
  );
};

const renderModelCustomizationHeaderRight = (onStartOver: () => void) => {
  return (
    <IconButtonWithTooltip
      id="start-over"
      label={'Start over'}
      icon={{iconName: 'refresh', iconStyle: 'solid'}}
      type="tertiary"
      color="gray"
      buttonSize="xs"
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
      type="tertiary"
      color="black"
      buttonSize="xs"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      onClick={onInfoClick}
    />
  ) : null;
};

export default AichatView;
