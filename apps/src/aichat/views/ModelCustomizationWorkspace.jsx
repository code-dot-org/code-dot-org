import React from 'react';

import Tabs from './Tabs';
import TabPanel from './TabPanel';

// maybe refactor to have a tab have two props, title and panel
// this structure is a bit confusing, because Tabs
// remaps this into a list of tabs, then a list of panels
const ModelCustomizationWorkspace = () => {
  return (
    <div style={{width: 400}}>
      <Tabs>
        <TabPanel title="Prompt">Content for Tab Panel 1</TabPanel>
        <TabPanel title="Retrieval">Content for Tab Panel 2</TabPanel>
        <TabPanel title="Fine Tuning">Content for Tab Panel 3</TabPanel>
        <TabPanel title="Publish">Content for Tab Panel 4</TabPanel>
      </Tabs>
    </div>
  );
};

export default ModelCustomizationWorkspace;
