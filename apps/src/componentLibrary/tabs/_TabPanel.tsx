import React from 'react';

import moduleStyles from './tabs.module.scss';

interface TabPanelProps {
  content: React.ReactNode;
  isActive: boolean;
  id: string;
  /* The ID of the button element that controls this panel's visibility. */
  labelledBy: string;
}

const _TabPanel: React.FunctionComponent<TabPanelProps> = ({
  content,
  isActive,
  id,
  labelledBy,
}) => {
  console.log('isActive', isActive);
  console.log('id', id);
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      hidden={!isActive}
      className={
        isActive ? moduleStyles.tabPanelActive : moduleStyles.tabPanelHidden
      }
      // style={{display: isActive ? 'flex' : 'none', height: '100%'}}
    >
      {content}
    </div>
  );
};

export default _TabPanel;
