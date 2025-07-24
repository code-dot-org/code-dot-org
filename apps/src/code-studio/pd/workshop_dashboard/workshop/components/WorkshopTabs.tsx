import Link from '@mui/material/Link';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React, {FC, forwardRef} from 'react';
import {
  Link as RouterLink,
  LinkProps,
  Outlet,
  useParams,
  useLocation,
} from 'react-router-dom';

import {WorkshopTabsProps} from '../types';

const TabLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link ref={ref} {...props} component={RouterLink} />
));

export const WorkshopTabs: FC<WorkshopTabsProps> = ({tabList}) => {
  const {workshopId} = useParams();
  const {pathname} = useLocation();

  const currentTabValue =
    tabList.find(tab =>
      pathname.endsWith(`/workshops/${workshopId}/${tab.path}`)
    )?.path || '';

  return (
    <nav aria-label="Workshop sections">
      <Tabs value={currentTabValue}>
        {tabList.map(tab => (
          <Tab
            key={tab.label}
            label={tab.label}
            value={tab.path}
            component={TabLink}
            to={`/workshops/${workshopId}${tab.path ? `/${tab.path}` : ''}`}
          />
        ))}
      </Tabs>
      <Outlet />
    </nav>
  );
};
