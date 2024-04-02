import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AichatLevelProperties} from '../types';
import Tabs, {Tab} from './tabs/Tabs';
import PromptCustomization from './modelCustomization/PromptCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import styles from './model-customization-workspace.module.scss';
import {EMPTY_AI_CUSTOMIZATIONS} from './modelCustomization/constants';
import {isVisible} from './modelCustomization/utils';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {retrievalContexts, modelCardInfo, botName, temperature, systemPrompt} =
    useAppSelector(
      state =>
        (state.lab.levelProperties as AichatLevelProperties | undefined)
          ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
    );

  const showPromptCustomization =
    isVisible(botName.visibility) ||
    isVisible(temperature.visibility) ||
    isVisible(systemPrompt.visibility);

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={
          [
            showPromptCustomization && {
              title: 'Setup',
              content: <PromptCustomization />,
            },
            isVisible(retrievalContexts.visibility) && {
              title: 'Retrieval',
              content: <RetrievalCustomization />,
            },
            isVisible(modelCardInfo.visibility) && {
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
