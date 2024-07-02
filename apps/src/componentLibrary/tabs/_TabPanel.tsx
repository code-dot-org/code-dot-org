import React from 'react';

interface TabPanelProps {
  content: React.ReactNode;
  isActive: boolean;
  id: string;
  /* The ID of the button element that controls this panel's visibility. */
  labelledBy: string;
  className?: string;
}

const _TabPanel: React.FunctionComponent<TabPanelProps> = ({
  content,
  isActive,
  id,
  labelledBy,
  className,
}) => (
  <div
    role="tabpanel"
    id={id}
    aria-labelledby={labelledBy}
    hidden={!isActive}
    className={className}
  >
    {content}
  </div>
);

export default _TabPanel;
