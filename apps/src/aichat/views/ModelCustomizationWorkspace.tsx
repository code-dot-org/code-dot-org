import React from 'react';

import Tabs from './tabs/Tabs';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  return (
    <div style={{width: 400}}>
      <Tabs
        tabs={[
          {title: 'Prompt', content: 'content 1'},
          {title: 'Retrieval', content: 'content 2'},
          {title: 'Fine Tuning', content: 'content 3'},
          {title: 'Publish', content: 'content 4'},
        ]}
        name="model-customization"
      />
    </div>
  );
};

export default ModelCustomizationWorkspace;
