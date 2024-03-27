import React from 'react';

import styles from './tab-panel.module.scss';

interface TabPanelProps {
  content: React.ReactNode;
  isActive: boolean;
  id: string;
  /* The ID of the button element that controls this panel's visibility. */
  labelledBy: string;
}

// maybe need to move inline style
const TabPanel: React.FunctionComponent<TabPanelProps> = ({
  content,
  isActive,
  id,
  labelledBy,
}) => (
  <div
    role="tabpanel"
    id={id}
    aria-labelledby={labelledBy}
    hidden={!isActive}
    className={styles.panelContainer}
  >
    {content}
  </div>
);

export default TabPanel;
