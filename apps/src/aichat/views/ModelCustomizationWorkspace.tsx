import React from 'react';

import PromptCustomization from './modelCustomization/PromptCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import Tabs from './tabs/Tabs';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  return (
    <div style={{width: 400, height: '100%'}}>
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
