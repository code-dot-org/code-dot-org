import React, {useState} from 'react';

import Tabs, {Tab} from './tabs/Tabs';
import SetupCustomization from './modelCustomization/SetupCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import styles from './model-customization-workspace.module.scss';
import {isVisible} from './modelCustomization/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {
    temperature,
    systemPrompt,
    retrievalContexts,
    modelCardInfo,
    selectedModelId,
  } = useAppSelector(state => state.aichat.fieldVisibilities);

  const hidePresentationPanel = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings?.hidePresentationPanel
  );

  const showSetupCustomization =
    isVisible(temperature) ||
    isVisible(systemPrompt) ||
    isVisible(selectedModelId);

  const [showTab, setShowTab] = useState<boolean>(true);
  setTimeout(() => {
    console.log('here');
    setShowTab(false);
  }, 10000);

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={
          [
            showSetupCustomization && {
              title: 'Setup',
              content: <SetupCustomization />,
            },
            isVisible(retrievalContexts) && {
              title: 'Retrieval',
              content: <RetrievalCustomization />,
            },
            showTab &&
              !hidePresentationPanel && {
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
