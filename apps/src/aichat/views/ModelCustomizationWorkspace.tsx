import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import PromptCustomization from './modelCustomization/PromptCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import {isVisible} from './modelCustomization/utils';
import Tabs, {Tab} from './tabs/Tabs';

import styles from './model-customization-workspace.module.scss';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {botName, temperature, systemPrompt, retrievalContexts, modelCardInfo} =
    useAppSelector(state => state.aichat.fieldVisibilities);

  const showPromptCustomization =
    isVisible(botName) || isVisible(temperature) || isVisible(systemPrompt);

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={
          [
            showPromptCustomization && {
              title: 'Setup',
              content: <PromptCustomization />,
            },
            isVisible(retrievalContexts) && {
              title: 'Retrieval',
              content: <RetrievalCustomization />,
            },
            isVisible(modelCardInfo) && {
              title: 'Publish',
              content: <PublishNotes />,
            },
          ].filter(Boolean) as Tab[]
        }
        name="model-customization"
      />
    </div>
  );
};

export default ModelCustomizationWorkspace;
