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
import CopyButton from './CopyButton';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import moduleStyles from './aichatView.module.scss';
import {AichatLevelProperties, ViewMode} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';

const AichatView: React.FunctionComponent = () => {
  const [viewMode, setViewMode] = useState<string>(ViewMode.EDIT);
  const dispatch = useAppDispatch();

  const beforeNextLevel = useCallback(() => {
    dispatch(sendSuccessReport('aichat'));
  }, [dispatch]);

  const levelAiCustomizationsWithVisibility = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
  );
  const {hidePresentationPanel} = levelAiCustomizationsWithVisibility;

  const initialSources = useAppSelector(
    state => (state.lab.initialSources?.source as string) || '{}'
  );

  useEffect(() => {
    const studentAiCustomizations = JSON.parse(initialSources);
    dispatch(
      setStartingAiCustomizations({
        levelAiCustomizationsWithVisibility,
        studentAiCustomizations,
      })
    );
  }, [dispatch, initialSources, levelAiCustomizationsWithVisibility]);

  const {botName} = useAppSelector(
    state => state.aichat.currentAiCustomizations
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

  const chatWorkspaceHeader =
    viewMode === ViewMode.EDIT ? aichatI18n.aichatWorkspaceHeader() : botName;

  return (
    <>
      {!hidePresentationPanel && (
        <div className={moduleStyles.viewModeButtons}>
          <SegmentedButtons {...viewModeButtonsProps} />
        </div>
      )}
      <div id="aichat-lab" className={moduleStyles.aichatLab}>
        {viewMode === ViewMode.EDIT && (
          <>
            <div className={moduleStyles.instructionsArea}>
              <PanelContainer
                id="aichat-instructions-panel"
                headerText={commonI18n.instructions()}
              >
                <Instructions beforeNextLevel={beforeNextLevel} />
              </PanelContainer>
            </div>
            <div className={moduleStyles.customizationArea}>
              <PanelContainer
                id="aichat-model-customization-panel"
                headerText="Model Customization"
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
              headerText={'Model Card'}
            />
          </div>
        )}
        <div className={moduleStyles.chatWorkspaceArea}>
          <PanelContainer
            id="aichat-workspace-panel"
            headerText={chatWorkspaceHeader}
            rightHeaderContent={<CopyButton />}
          >
            <ChatWorkspace />
          </PanelContainer>
        </div>
      </div>
    </>
  );
};

export default AichatView;
