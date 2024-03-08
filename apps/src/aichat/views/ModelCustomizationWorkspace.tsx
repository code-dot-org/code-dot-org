import React from 'react';
import {useSelector} from 'react-redux';

import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {AichatLevelProperties} from '../types';
import Tabs, {Tab} from './tabs/Tabs';
import PromptCustomization from './modelCustomization/PromptCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import styles from './model-customization-workspace.module.scss';
import {
  DEFAULT_MODEL_CARD_INFO,
  DEFAULT_PROMPT_CUSTOMIZATIONS,
  DEFAULT_RETRIEVAL_CONTEXTS,
} from './modelCustomization/constants';
import {isHidden} from './modelCustomization/utils';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {retrievalContexts, modelCardInfo, botName, temperature, systemPrompt} =
    useSelector(
      (state: {lab: LabState}) =>
        (state.lab.levelProperties as AichatLevelProperties | undefined)
          ?.initialAiCustomizations || {
          retrievalContexts: DEFAULT_RETRIEVAL_CONTEXTS,
          modelCardInfo: DEFAULT_MODEL_CARD_INFO,
          ...DEFAULT_PROMPT_CUSTOMIZATIONS,
        }
    );

  const hidePromptCustomization =
    isHidden(botName.visibility) &&
    isHidden(temperature.visibility) &&
    isHidden(systemPrompt.visibility);

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={
          [
            hidePromptCustomization && {
              title: 'Prompt',
              content: <PromptCustomization />,
            },
            !isHidden(retrievalContexts.visibility) && {
              title: 'Retrieval',
              content: <RetrievalCustomization />,
            },
            {title: 'Fine Tuning', content: 'fine tuning content TBD'},
            !isHidden(modelCardInfo.visibility) && {
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
