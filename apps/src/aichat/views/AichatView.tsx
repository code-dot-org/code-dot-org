/** @file Top-level view for AI Chat Lab */

import React, {useCallback, useEffect} from 'react';

import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import ActionDropdown from '@cdo/apps/componentLibrary/dropdown/actionDropdown/ActionDropdown';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import ProjectTemplateWorkspaceIconV2 from '@cdo/apps/templates/ProjectTemplateWorkspaceIconV2';
import {commonI18n} from '@cdo/apps/types/locale';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getUserHasAichatAccess} from '../aichatApi';
import {ModalTypes} from '../constants';
import aichatI18n from '../locale';
import {
  addChatEvent,
  clearChatMessages,
  onSaveComplete,
  onSaveFail,
  onSaveNoop,
  resetToDefaultAiCustomizations,
  selectAllFieldsHidden,
  sendAnalytics,
  setShowModalType,
  setStartingAiCustomizations,
  setUserHasAichatAccess,
  setViewMode,
  updateAiCustomization,
} from '../redux/aichatRedux';
import {getNewMessageId} from '../redux/utils';
import {AichatLevelProperties, Notification, ViewMode} from '../types';

import ChatWorkspace from './ChatWorkspace';
import {isDisabled} from './modelCustomization/utils';
import ModelCustomizationWorkspace from './ModelCustomizationWorkspace';
import PresentationView from './presentation/PresentationView';

import moduleStyles from './aichatView.module.scss';

const getResetModelNotification = (): Notification => ({
  id: getNewMessageId(),
  text: 'Model customizations and model card information have been reset to default settings.',
  notificationType: 'success',
  timestamp: Date.now(),
  includeInChatHistory: true,
});

const AichatView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);

  const beforeNextLevel = useCallback(() => {
    dispatch(sendSuccessReport('aichat'));
  }, [dispatch]);

  const levelAichatSettings = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings
  );

  const initialSources = useAppSelector(
    state => (state.lab.initialSources?.source as string) || '{}'
  );

  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);

  const {currentAiCustomizations, viewMode} = useAppSelector(
    state => state.aichat
  );

  const signInState = useAppSelector(state => state.currentUser.signInState);

  const {botName, isPublished} = currentAiCustomizations.modelCardInfo;

  const allFieldsHidden = useAppSelector(selectAllFieldsHidden);

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
    const studentAiCustomizations = JSON.parse(initialSources);
    dispatch(
      setStartingAiCustomizations({
        levelAichatSettings,
        studentAiCustomizations,
      })
    );
    dispatch(
      addChatEvent({
        timestamp: Date.now(),
        descriptionKey: 'LOAD_LEVEL',
        hideForParticipants: true,
      })
    );
  }, [dispatch, initialSources, levelAichatSettings]);

  useEffect(() => {
    if (signInState === SignInState.SignedIn) {
      getUserHasAichatAccess()
        .then(hasAccess => dispatch(setUserHasAichatAccess(hasAccess)))
        .catch(error => {
          if (
            !(error instanceof NetworkError && error.response.status === 403)
          ) {
            Lab2Registry.getInstance()
              .getMetricsReporter()
              .logError('Error in fetching user aichat access', error as Error);
          }
        });
    }
  }, [dispatch, signInState]);

  // When the level changes or if we are viewing aichat level as a different user
  // (e.g., teacher viewing student work), clear the chat message history and start a new session.
  useEffect(() => {
    dispatch(clearChatMessages());
  }, [currentLevelId, viewAsUserId, dispatch]);

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
        iconLeft: {iconName: 'wrench', iconStyle: 'solid', title: 'Edit Mode'},
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
      {viewMode === ViewMode.EDIT
        ? aichatI18n.aichatWorkspaceHeader()
        : botName}
      {projectTemplateLevel && (
        <ProjectTemplateWorkspaceIconV2
          tooltipPlace="onBottom"
          className={moduleStyles.icon}
        />
      )}
    </div>
  );

  const resetProject = useCallback(() => {
    dispatch(resetToDefaultAiCustomizations(levelAichatSettings));
    // Save the customizations to the user's project.
    dispatch(updateAiCustomization());
    dispatch(clearChatMessages());
    dispatch(addChatEvent(getResetModelNotification()));
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

  const onClear = useCallback(() => {
    dispatch(clearChatMessages());
    dispatch(
      addChatEvent({
        timestamp: Date.now(),
        descriptionKey: 'CLEAR_CHAT',
        hideForParticipants: true,
      })
    );
    dispatch(
      sendAnalytics(EVENTS.CHAT_ACTION, {
        action: 'Clear chat history',
      })
    );
  }, [dispatch]);

  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      {showPresentationToggle() && (
        <div
          id="uitest-view-mode-toggle-container"
          className={moduleStyles.viewModeButtons}
        >
          <SegmentedButtons {...viewModeButtonsProps} />
        </div>
      )}
      <div className={moduleStyles.labCoreContainer}>
        {viewMode === ViewMode.EDIT && (
          <>
            <div className={moduleStyles.instructionsArea}>
              <PanelContainer
                id="aichat-instructions-panel"
                headerContent={commonI18n.instructions()}
                className={moduleStyles.panelContainer}
                headerClassName={moduleStyles.panelHeader}
                rightHeaderContent={renderInstructionsHeaderRight(
                  isUserTeacher,
                  () => {
                    dispatch(setShowModalType(ModalTypes.TEACHER_ONBOARDING));
                  }
                )}
              >
                <Instructions
                  beforeNextLevel={beforeNextLevel}
                  className={moduleStyles.instructions}
                />
              </PanelContainer>
            </div>
            {!allFieldsHidden && (
              <div className={moduleStyles.customizationArea}>
                <PanelContainer
                  id="aichat-model-customization-panel"
                  headerContent="Model Customization"
                  className={moduleStyles.panelContainer}
                  headerClassName={moduleStyles.panelHeader}
                  rightHeaderContent={renderModelCustomizationHeaderRight(
                    () => {
                      onClickStartOver();
                      dispatch(
                        sendAnalytics(EVENTS.AICHAT_START_OVER, {
                          levelPath: window.location.pathname,
                        })
                      );
                    }
                  )}
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
          >
            <ChatWorkspace onClear={onClear} />
          </PanelContainer>
        </div>
      </div>
    </div>
  );
};

const renderModelCustomizationHeaderRight = (onStartOver: () => void) => {
  return (
    <div>
      <Button
        icon={{iconStyle: 'solid', iconName: 'refresh'}}
        isIconOnly={true}
        color={'black'}
        onClick={onStartOver}
        ariaLabel={'Start Over'}
        size={'xs'}
        type="tertiary"
        className={moduleStyles.startOverButton}
      />
    </div>
  );
};

const renderInstructionsHeaderRight = (
  isUserTeacher: boolean | undefined,
  onInfoClick: () => void
) => {
  return isUserTeacher ? (
    <ActionDropdown
      name="instructionsInfoDropdown"
      labelText="Instructions Info Dropdown"
      size="xs"
      triggerButtonProps={{
        type: 'tertiary',
        isIconOnly: true,
        color: 'black',
        icon: {iconName: 'ellipsis-vertical', iconStyle: 'solid'},
      }}
      options={[
        {
          value: 'teacherOnboardingModal',
          label: aichatI18n.aboutAichatLab(),
          icon: {iconName: 'circle-info', iconStyle: 'solid'},
          onClick: onInfoClick,
        },
      ]}
    />
  ) : null;
};

export default AichatView;
