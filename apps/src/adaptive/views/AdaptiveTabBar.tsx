// Full-width tab strip that sits between the page header and the main content,
// letting students switch between their project and the practice skill map.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tab as MuiTab, Tabs as MuiTabs} from '@mui/material';
import React from 'react';

import styles from './adaptiveTabBar.module.scss';

type TabValue = 'map' | 'project';

interface AdaptiveTabBarProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  projectName?: string;
}

const AdaptiveTabBar: React.FunctionComponent<AdaptiveTabBarProps> = ({
  activeTab,
  onTabChange,
  projectName,
}) => (
  <div className={styles.tabBar}>
    <MuiTabs value={activeTab} onChange={(_, v: TabValue) => onTabChange(v)}>
      <MuiTab
        label={projectName || 'My project'}
        value="project"
        icon={<FontAwesomeV6Icon iconName="laptop-code" />}
        iconPosition="start"
        className={styles.tab}
      />
      <MuiTab
        label="Practice skills"
        value="map"
        icon={<FontAwesomeV6Icon iconName="sitemap" />}
        iconPosition="start"
        className={styles.tab}
      />
    </MuiTabs>
  </div>
);

export default AdaptiveTabBar;
