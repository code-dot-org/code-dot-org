import Tabs from '@code-dot-org/component-library/tabs';
import React, {FC, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import styles from '../workshop.module.scss';

export interface TabConfig {
  label: string;
  path?: string;
}
export interface WorkshopTabsProps {
  tabList: TabConfig[];
}

export const WorkshopTabs: FC<WorkshopTabsProps> = ({tabList}) => {
  const {pathname} = useLocation();
  const navigate = useNavigate();

  const currentTabValue = useMemo(
    () =>
      // exclude index path as it's the default
      tabList.find(tab => tab.path && pathname.includes(tab.path))?.path ?? '',
    [pathname, tabList]
  );

  const handleChange = (value: string) => {
    navigate(value);
  };

  return (
    <Tabs
      defaultSelectedTabValue={currentTabValue}
      tabsContainerClassName={styles.tabList}
      name="workshop section tabs"
      onChange={handleChange}
      onTabClose={() => {}}
      tabs={tabList.map(tab => ({
        // tabContent is null because Outlet will render appropriate components based on route
        tabContent: null,
        text: tab.label,
        value: tab.path ?? '',
      }))}
      hidePanels
    />
  );
};
