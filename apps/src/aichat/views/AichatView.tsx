/** @file Top-level view for AI Chat Lab */

import React, {useCallback, useEffect} from 'react';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
const commonI18n = require('@cdo/locale');
const aichatI18n = require('@cdo/aichat/locale');

import {addChatMessage, setAiCustomizations} from '../redux/aichatRedux';
import ChatWorkspace from './ChatWorkspace';
import ModelCustomizationWorkspace from './ModelCustomizationWorkspace';
import CopyButton from './CopyButton';
import moduleStyles from './aichatView.module.scss';
import {
  AichatLevelProperties,
  AiCustomizations,
  Role,
  Status,
} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';

const AichatView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const beforeNextLevel = useCallback(() => {
    dispatch(sendSuccessReport('aichat'));
  }, [dispatch]);

  // on successful save, compare new vs old sources
  // need save success callback to know what old and new sources were
  // we get content to save from aiCustomizations in redux
  // we can get previous successful save from getLastSource() in project manager
  useEffect(() => {
    const lastSource = Lab2Registry.getInstance()
      .getProjectManager()
      ?.getLastSource();
    Lab2Registry.getInstance()
      .getProjectManager()
      ?.addSaveSuccessListener(() =>
        dispatch(
          addChatMessage({
            id: 0,
            role: Role.ASSISTANT,
            chatMessageText: 'Something was updated',
            status: Status.OK,
          })
        )
      );
  });

  const levelAiCustomizationsWithVisibility = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
  );

  const studentAiCustomizations = JSON.parse(
    useAppSelector(
      state => (state.lab.initialSources?.source as string) || '{}'
    )
  );

  useEffect(() => {
    const levelAiCustomizations: AiCustomizations = {
      botName: levelAiCustomizationsWithVisibility.botName.value,
      temperature: levelAiCustomizationsWithVisibility.temperature.value,
      systemPrompt: levelAiCustomizationsWithVisibility.systemPrompt.value,
      retrievalContexts:
        levelAiCustomizationsWithVisibility.retrievalContexts.value,
      modelCardInfo: levelAiCustomizationsWithVisibility.modelCardInfo.value,
    };

    const reconciledAiCustomizations = Object.keys(studentAiCustomizations)
      .length
      ? studentAiCustomizations
      : levelAiCustomizations;

    dispatch(setAiCustomizations(reconciledAiCustomizations));
  }, [dispatch, studentAiCustomizations, levelAiCustomizationsWithVisibility]);

  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
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
      <div className={moduleStyles.chatWorkspaceArea}>
        <PanelContainer
          id="aichat-workspace-panel"
          headerText={aichatI18n.aichatWorkspaceHeader()}
          rightHeaderContent={<CopyButton />}
        >
          <ChatWorkspace />
        </PanelContainer>
      </div>
    </div>
  );
};

export default AichatView;
