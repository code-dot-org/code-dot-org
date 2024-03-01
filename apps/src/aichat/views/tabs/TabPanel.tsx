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
  labelledBy,
}) => (
  <div role="tabpanel" id={id} aria-labelledby={labelledBy} hidden={!isActive}>
    {content}
  </div>
);

export default TabPanel;
