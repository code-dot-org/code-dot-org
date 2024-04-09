/** @file Top-level view for AI Chat Lab */

import React, {useCallback, useEffect, useState} from 'react';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
const commonI18n = require('@cdo/locale');
const aichatI18n = require('@cdo/aichat/locale');

import {setStartingAiCustomizations} from '../redux/aichatRedux';
import ChatWorkspace from './ChatWorkspace';
import ModelCustomizationWorkspace from './ModelCustomizationWorkspace';
import PresentationView from './presentation/PresentationView';
import CopyButton from './CopyButton';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import moduleStyles from './aichatView.module.scss';
import {AichatLevelProperties, ViewMode} from '@cdo/apps/aichat/types';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/lab2Redux';
import ProjectTemplateWorkspaceIcon from '@cdo/apps/templates/ProjectTemplateWorkspaceIcon';

const AichatView: React.FunctionComponent = () => {
  const [viewMode, setViewMode] = useState<string>(ViewMode.EDIT);
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

  useEffect(() => {
    const studentAiCustomizations = JSON.parse(initialSources);
    dispatch(
      setStartingAiCustomizations({
        levelAichatSettings,
        studentAiCustomizations,
      })
    );
  }, [dispatch, initialSources, levelAichatSettings]);

  const {botName} = useAppSelector(
    state => state.aichat.currentAiCustomizations.modelCardInfo
  );

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
    size: 'm',
    selectedButtonValue: viewMode,
    onChange: setViewMode,
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
      {!levelAichatSettings?.hidePresentationPanel && (
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
            rightHeaderContent={<CopyButton />}
          >
            <ChatWorkspace />
          </PanelContainer>
        </div>
      </div>
    </div>
  );
};

export default AichatView;
