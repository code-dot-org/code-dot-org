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
  DEFAULT_RETRIEVAL_CONTEXTS,
} from './modelCustomization/constants';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {retrievalContexts, modelCardInfo} = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || {
        retrievalContexts: DEFAULT_RETRIEVAL_CONTEXTS,
        modelCardInfo: DEFAULT_MODEL_CARD_INFO,
      }
  );

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={
          [
            {
              title: 'Prompt',
              content: <PromptCustomization />,
            },
            retrievalContexts.visibility !== 'hidden' && {
              title: 'Retrieval',
              content: <RetrievalCustomization />,
            },
            {title: 'Fine Tuning', content: 'fine tuning content TBD'},
            modelCardInfo.visibility !== 'hidden' && {
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
