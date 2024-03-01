import React from 'react';

interface TabPanelProps {
  content: React.ReactNode;
  isActive: boolean;
  id: string;
  labelledBy: string;
}

const TabPanel: React.FunctionComponent<TabPanelProps> = ({
  content,
  isActive,
  id,
  labelledby,
}) => (
  <div
    role="tabpanel"
    id={id}
    aria-labelledby={labelledBy}
    hidden={!isActive}
    tabIndex="0" // Make the panel focusable
  >
    {content}
  </div>
);

export default TabPanel;
