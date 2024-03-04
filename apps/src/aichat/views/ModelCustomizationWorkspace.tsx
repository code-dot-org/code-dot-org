import React from 'react';

import PromptCustomization from './modelCustomization/PromptCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import Tabs from './tabs/Tabs';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  return (
    <div
      style={{
        width: 400,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div id="model-customization-top-container" style={{height: 400}}>
        <Tabs
          tabs={[
            {title: 'Prompt', content: <PromptCustomization />},
            {title: 'Retrieval', content: <RetrievalCustomization />},
            {title: 'Fine Tuning', content: 'content 3'},
            {title: 'Publish', content: 'content 4'},
          ]}
          name="model-customization"
        />
      </div>
      <div
        id="model-customization-bottom-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button>Update</button>
      </div>
    </div>
  );
};

export default ModelCustomizationWorkspace;
