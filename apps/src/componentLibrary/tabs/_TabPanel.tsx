import React from 'react';

interface TabPanelProps {
  content: React.ReactNode;
  isActive: boolean;
  id: string;
  /* The ID of the button element that controls this panel's visibility. */
  labelledBy: string;
  /** Custom className for active Tab Panel */
  classNameActive?: string;
  /** Custom className for hidden Tab Panel */
  classNameHidden?: string;
}

const _TabPanel: React.FunctionComponent<TabPanelProps> = ({
  content,
  isActive,
  id,
  labelledBy,
  classNameActive,
  classNameHidden,
}) => (
  <div
    role="tabpanel"
    id={id}
    aria-labelledby={labelledBy}
    hidden={!isActive}
    className={isActive ? classNameActive : classNameHidden}
  >
    {content}
  </div>
);

export default _TabPanel;
