// Full-width tab strip that sits between the page header and the main content,
// letting students switch between their project and the practice skill map.

import Tabs from '@code-dot-org/component-library/tabs';
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
    <Tabs
      name="adaptive-view"
      tabsContainerClassName={styles.tabsContainer}
      defaultSelectedTabValue={activeTab}
      onChange={value => {
        if (value !== activeTab) onTabChange(value as TabValue);
      }}
      hidePanels
      tabListAriaLabel="View"
      tabs={[
        {
          value: 'project',
          text: projectName || 'My project',
          iconLeft: {iconName: 'laptop-code'},
          tabContent: null,
        },
        {
          value: 'map',
          text: 'Practice skills',
          iconLeft: {iconName: 'sitemap'},
          tabContent: null,
        },
      ]}
    />
  </div>
);

export default AdaptiveTabBar;
