import React from 'react';

const TabPanel = ({content, isActive, id, labelledby}) => (
  <div
    role="tabpanel"
    id={id}
    aria-labelledby={labelledby}
    hidden={!isActive}
    tabIndex="0" // Make the panel focusable
  >
    {content}
  </div>
);

export default TabPanel;
