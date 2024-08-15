/** @file Top-level view for AI Chat Lab */

import React, {useCallback, useEffect} from 'react';

import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import ProjectTemplateWorkspaceIcon from '@cdo/apps/templates/ProjectTemplateWorkspaceIcon';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import aichatI18n from '../locale';
import {
  addChatEvent,
  clearChatMessages,
  onSaveComplete,
  onSaveFail,
  onSaveNoop,
  resetToDefaultAiCustomizations,
  selectAllFieldsHidden,
  setStartingAiCustomizations,
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
    projectManager.addSaveFailListener((e: Error) => {
      dispatch(onSaveFail(e));
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
      },
    ],
    size: 's',
    selectedButtonValue: viewMode,
    onChange: viewMode => dispatch(setViewMode(viewMode as ViewMode)),
  };

  const chatWorkspaceHeader = (
    <div>
      {projectTemplateLevel && (
        <ProjectTemplateWorkspaceIcon tooltipPlace="bottom" dark /> // todo: dark should be conditional based on the theme (light/dark)
      )}
      {viewMode === ViewMode.EDIT
        ? aichatI18n.aichatWorkspaceHeader()
        : botName}
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
    analyticsReporter.sendEvent(
      EVENTS.CHAT_ACTION,
      {
        action: 'Clear chat history',
      },
      PLATFORMS.BOTH
    );
  }, [dispatch]);

  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      {showPresentationToggle() && (
        <div className={moduleStyles.viewModeButtons}>
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
                      analyticsReporter.sendEvent(
                        EVENTS.AICHAT_START_OVER,
                        {
                          levelPath: window.location.pathname,
                        },
                        PLATFORMS.BOTH
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
          <div className={moduleStyles.presentationArea}>
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
    <div className={moduleStyles.chatHeaderRight}>
      <Button
        icon={{iconStyle: 'solid', iconName: 'refresh'}}
        isIconOnly={true}
        color={'black'} // todo: This should be conditional based on the theme (light/dark)
        onClick={onStartOver}
        ariaLabel={'Start Over'}
        size={'xs'}
        type="tertiary"
        className={moduleStyles.aichatViewButton}
      />
    </div>
  );
};

export default AichatView;
