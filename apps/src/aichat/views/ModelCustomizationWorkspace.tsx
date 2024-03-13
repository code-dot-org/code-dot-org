import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AichatLevelProperties} from '../types';
import Tabs, {Tab} from './tabs/Tabs';
import PromptCustomization from './modelCustomization/PromptCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import styles from './model-customization-workspace.module.scss';
import {EMPTY_AI_CUSTOMIZATIONS} from './modelCustomization/constants';
import {isHidden} from './modelCustomization/utils';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {retrievalContexts, modelCardInfo, botName, temperature, systemPrompt} =
    useAppSelector(
      state =>
        (state.lab.levelProperties as AichatLevelProperties | undefined)
          ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
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
            !hidePromptCustomization && {
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
