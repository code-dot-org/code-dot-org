import React from 'react';
import {useSelector} from 'react-redux';

import Tabs from './tabs/Tabs';
import PromptCustomization from './modelCustomization/PromptCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import styles from './model-customization-workspace.module.scss';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {
  AichatLevelProperties,
  LevelAiCustomizations,
} from '@cdo/apps/aichat/types';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  // const {botName} =
  //   useSelector(
  //     (state: {lab: LabState}) =>
  //       (state.lab.levelProperties as AichatLevelProperties | undefined)
  //         ?.initialAiCustomizations as LevelAiCustomizations | undefined
  //   ) || {};

  // need to know visibility to know which field to render in which state
  // don't change initialAiCustomizations so we can render appropriately
  // initialize new state (aiCustomizations) (when?) with levelbuilder config

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={[
          {
            title: 'Prompt',
            content: <PromptCustomization botName={'hello'} />,
          },
          {title: 'Retrieval', content: <RetrievalCustomization />},
          {title: 'Fine Tuning', content: 'fine tuning content TBD'},
          {title: 'Publish', content: <PublishNotes />},
        ]}
        name="model-customization"
      />
    </div>
  );
};

export default ModelCustomizationWorkspace;
