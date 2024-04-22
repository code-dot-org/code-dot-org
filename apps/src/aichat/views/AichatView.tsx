/** @file Top-level view for AI Chat Lab */

import React, {useCallback, useEffect} from 'react';

import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/lab2Redux';
import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import Button from '@cdo/apps/componentLibrary/button/Button';
import ProjectTemplateWorkspaceIcon from '@cdo/apps/templates/ProjectTemplateWorkspaceIcon';
const commonI18n = require('@cdo/locale');
const aichatI18n = require('@cdo/aichat/locale');

import {
  setStartingAiCustomizations,
  setViewMode,
  clearChatMessages,
} from '../redux/aichatRedux';
import {AichatLevelProperties, ViewMode} from '../types';
import {isDisabled} from './modelCustomization/utils';
import ChatWorkspace from './ChatWorkspace';
import ModelCustomizationWorkspace from './ModelCustomizationWorkspace';
import PresentationView from './presentation/PresentationView';
import CopyButton from './CopyButton';
import moduleStyles from './aichatView.module.scss';

const AichatView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

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

  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);

  const {currentAiCustomizations, viewMode} = useAppSelector(
    state => state.aichat
  );
  const {botName, isPublished} = currentAiCustomizations.modelCardInfo;

  useEffect(() => {
    const studentAiCustomizations = JSON.parse(initialSources);
    dispatch(
      setStartingAiCustomizations({
        levelAichatSettings,
        studentAiCustomizations,
      })
    );
  }, [dispatch, initialSources, levelAichatSettings]);

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
        <ProjectTemplateWorkspaceIcon tooltipPlace="bottom" />
      )}
      {viewMode === ViewMode.EDIT
        ? aichatI18n.aichatWorkspaceHeader()
        : botName}
    </div>
  );

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
              >
                <Instructions beforeNextLevel={beforeNextLevel} />
              </PanelContainer>
            </div>
            <div className={moduleStyles.customizationArea}>
              <PanelContainer
                id="aichat-model-customization-panel"
                headerContent="Model Customization"
              >
                <ModelCustomizationWorkspace />
              </PanelContainer>
            </div>
          </>
        )}
        {viewMode === ViewMode.PRESENTATION && (
          <div className={moduleStyles.presentationArea}>
            <PanelContainer
              id="aichat-presentation-panel"
              headerContent={'Model Card'}
            >
              <PresentationView />
            </PanelContainer>
          </div>
        )}
        <div className={moduleStyles.chatWorkspaceArea}>
          <PanelContainer
            id="aichat-workspace-panel"
            headerContent={chatWorkspaceHeader}
            rightHeaderContent={renderChatWorkspaceHeaderRight(() =>
              dispatch(clearChatMessages())
            )}
          >
            <ChatWorkspace />
          </PanelContainer>
        </div>
      </div>
    </div>
  );
};

const renderChatWorkspaceHeaderRight = (onClear: () => void) => {
  return (
    <div className={moduleStyles.chatHeaderRight}>
      <Button
        onClick={onClear}
        text="Clear"
        iconLeft={{iconName: 'paintbrush'}}
        size="xs"
        color="white"
        type="secondary"
        className={moduleStyles.clearButton}
      />
      <CopyButton />
    </div>
  );
};

export default AichatView;
