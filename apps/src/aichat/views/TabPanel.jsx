import React from 'react';

const TabPanel = ({isActive, id, labelledby, children}) => (
  <div
    role="tabpanel"
    id={id}
    aria-labelledby={labelledby}
    hidden={!isActive}
    tabIndex="0" // Make the panel focusable
  >
    {children}
  </div>
);

export default TabPanel;
