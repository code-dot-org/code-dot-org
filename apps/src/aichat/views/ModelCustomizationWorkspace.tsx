import React from 'react';

import Tabs from './tabs/Tabs';
import PromptCustomization from './modelCustomization/PromptCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import styles from './model-customization-workspace.module.scss';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs
        tabs={[
          {title: 'Prompt', content: <PromptCustomization />},
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
