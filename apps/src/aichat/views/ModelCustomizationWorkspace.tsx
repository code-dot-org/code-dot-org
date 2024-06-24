import React from 'react';
import {useSelector} from 'react-redux';

import {AichatLevelProperties} from '@cdo/apps/aichat/types';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import PublishNotes from './modelCustomization/PublishNotes';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import SetupCustomization from './modelCustomization/SetupCustomization';
import {isVisible, isDisabled} from './modelCustomization/utils';
import Tabs, {Tab} from './tabs/Tabs';

import styles from './model-customization-workspace.module.scss';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {
    temperature,
    systemPrompt,
    retrievalContexts,
    modelCardInfo,
    selectedModelId,
  } = useAppSelector(state => state.aichat.fieldVisibilities);

  const isReadOnly = useSelector(isReadOnlyWorkspace);

  const hidePresentationPanel = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings?.hidePresentationPanel
  );

  const showSetupCustomization =
    isVisible(temperature) ||
    isVisible(systemPrompt) ||
    isVisible(selectedModelId);
  const isSetupCustomizationReadOnly =
    isDisabled(temperature) &&
    isDisabled(systemPrompt) &&
    isDisabled(selectedModelId);

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={
          [
            showSetupCustomization && {
              title: 'Setup',
              content: <SetupCustomization />,
              isReadOnly: isSetupCustomizationReadOnly || isReadOnly,
            },
            isVisible(retrievalContexts) && {
              title: 'Retrieval',
              content: <RetrievalCustomization />,
              isReadOnly: isDisabled(retrievalContexts) || isReadOnly,
            },
            isVisible(modelCardInfo) &&
              !hidePresentationPanel && {
                title: 'Publish',
                content: <PublishNotes />,
                isReadOnly: isDisabled(modelCardInfo) || isReadOnly,
              },
          ].filter(Boolean) as Tab[]
        }
        name="model-customization"
      />
    </div>
  );
};

export default ModelCustomizationWorkspace;
